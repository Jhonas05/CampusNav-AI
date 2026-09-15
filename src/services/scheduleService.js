import { CLASS_STATUSES, DASHBOARD_DATA_STATUS } from "../data/dashboardContracts.js"
import { getFacilityById } from "../data/facilities.js"
import {
  addCampusDays,
  campusDateTimeToIso,
  getCampusDateKey,
  getCampusDateKeysInRange,
  getCampusDayOfWeek,
  isCampusDateInRange,
} from "../lib/campusTime.js"

export const SCHEDULE_EXCEPTION_TYPES = Object.freeze({
  CANCELLED: "CANCELLED",
  RESCHEDULED: "RESCHEDULED",
  ROOM_CHANGED: "ROOM_CHANGED",
  PROFESSOR_CHANGED: "PROFESSOR_CHANGED",
  TIME_CHANGED: "TIME_CHANGED",
})

const rowValue = (row, snakeName, camelName) => row?.[snakeName] ?? row?.[camelName]
const rowId = (row) => Number(rowValue(row, "id", "id"))
const scheduleIdForException = (exception) => Number(rowValue(exception, "class_schedule_id", "classScheduleId"))
const getDateWeekday = (dateKey) => getCampusDayOfWeek(new Date(`${dateKey}T12:00:00+08:00`))
const isActiveSchedule = (schedule) => (rowValue(schedule, "status", "status") || "ACTIVE") === "ACTIVE"

export const isKnownFacilityId = (facilityId) => Boolean(facilityId && getFacilityById(facilityId))

export const scheduleOccursOnDate = (schedule, dateKey) => (
  isActiveSchedule(schedule)
  && Number(rowValue(schedule, "day_of_week", "dayOfWeek")) === getDateWeekday(dateKey)
  && isCampusDateInRange(
    dateKey,
    rowValue(schedule, "effective_from", "effectiveFrom"),
    rowValue(schedule, "effective_until", "effectiveUntil"),
  )
)

const exceptionForOccurrence = (schedule, exceptions, dateKey) => exceptions.find((exception) => (
  scheduleIdForException(exception) === rowId(schedule)
  && rowValue(exception, "exception_date", "exceptionDate") === dateKey
)) || null

export const resolveScheduleOccurrence = (schedule, exceptions = [], dateKey) => {
  if (!scheduleOccursOnDate(schedule, dateKey)) return null

  const exception = exceptionForOccurrence(schedule, exceptions, dateKey)
  const exceptionType = rowValue(exception, "exception_type", "exceptionType") || null
  const cancelled = exceptionType === SCHEDULE_EXCEPTION_TYPES.CANCELLED
  const facilityId = rowValue(exception, "replacement_facility_id", "replacementFacilityId")
    || rowValue(schedule, "facility_id", "facilityId")
  const personnelId = Number(
    rowValue(exception, "replacement_personnel_id", "replacementPersonnelId")
    || rowValue(schedule, "personnel_id", "personnelId"),
  )
  const personnelDisplayName = rowValue(exception, "replacement_personnel_display_name", "replacementPersonnelDisplayName")
    || rowValue(schedule, "personnel_display_name", "personnelDisplayName")
  const startTime = rowValue(exception, "replacement_start_time", "replacementStartTime")
    || rowValue(schedule, "start_time", "startTime")
  const endTime = rowValue(exception, "replacement_end_time", "replacementEndTime")
    || rowValue(schedule, "end_time", "endTime")
  const startAt = campusDateTimeToIso(dateKey, startTime)
  const endAt = campusDateTimeToIso(dateKey, endTime)

  return {
    id: rowId(schedule),
    occurrenceId: `${rowId(schedule)}:${dateKey}`,
    date: dateKey,
    departmentId: Number(rowValue(schedule, "department_id", "departmentId")),
    courseId: Number(rowValue(schedule, "course_id", "courseId")),
    courseCode: rowValue(schedule, "course_code", "courseCode"),
    courseName: rowValue(schedule, "course_name", "courseName"),
    sectionId: Number(rowValue(schedule, "section_id", "sectionId")),
    program: rowValue(schedule, "program", "program"),
    yearLevel: Number(rowValue(schedule, "year_level", "yearLevel")),
    sectionName: rowValue(schedule, "section_name", "sectionName"),
    personnelId,
    personnelDisplayName,
    facilityId,
    startAt,
    endAt,
    cancelled,
    exceptionType,
    verificationStatus: rowValue(exception, "verification_status", "verificationStatus")
      || rowValue(schedule, "verification_status", "verificationStatus"),
  }
}

export const getScheduleOccurrences = (schedules, exceptions, dateKeys) => dateKeys
  .flatMap((dateKey) => schedules.map((schedule) => resolveScheduleOccurrence(schedule, exceptions, dateKey)))
  .filter(Boolean)
  .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime() || a.id - b.id)

const scheduleStatusAt = (occurrence, at) => {
  if (occurrence.cancelled) return CLASS_STATUSES.CANCELLED
  const timestamp = new Date(at).getTime()
  if (timestamp < new Date(occurrence.startAt).getTime()) return CLASS_STATUSES.UPCOMING
  if (timestamp < new Date(occurrence.endAt).getTime()) return CLASS_STATUSES.SCHEDULED_NOW
  return CLASS_STATUSES.ENDED
}

export const mapOccurrenceToDashboardClass = (occurrence, at = new Date()) => {
  const facility = getFacilityById(occurrence.facilityId)
  const demo = occurrence.verificationStatus === "DEMO_ONLY"
  return {
    id: `class-${occurrence.occurrenceId}`,
    sourceId: occurrence.occurrenceId,
    sourceType: "SUPABASE",
    subject: occurrence.courseName,
    courseCode: occurrence.courseCode,
    section: `${occurrence.program} ${occurrence.yearLevel}-${occurrence.sectionName}`,
    professor: occurrence.personnelDisplayName,
    room: facility?.name || "Facility pending verification",
    startAt: occurrence.startAt,
    endAt: occurrence.endAt,
    scheduleStatus: scheduleStatusAt(occurrence, at),
    relatedFacilityId: facility?.id || null,
    verificationStatus: occurrence.verificationStatus,
    dataStatus: demo ? DASHBOARD_DATA_STATUS.DEMO : DASHBOARD_DATA_STATUS.SOURCE_ALIGNED,
    demo,
    exceptionType: occurrence.exceptionType,
  }
}

const assertKnownFacility = (facilityId) => {
  if (!isKnownFacilityId(facilityId)) throw new Error(`Unknown CampusNav facility ID: ${facilityId}`)
}

const selectRows = async (client, table) => {
  const { data, error } = await client.from(table).select("*")
  if (error) throw error
  return data || []
}

export const createScheduleService = (client, { now = () => new Date() } = {}) => {
  const currentTime = () => {
    const value = typeof now === "function" ? now() : now
    return value instanceof Date ? value : new Date(value)
  }

  const loadScheduleData = async () => {
    const [schedules, exceptions] = await Promise.all([
      selectRows(client, "public_class_schedules"),
      selectRows(client, "public_schedule_exceptions"),
    ])
    return { schedules, exceptions }
  }

  const occurrencesForRange = async (fromDate, toDate) => {
    const { schedules, exceptions } = await loadScheduleData()
    return getScheduleOccurrences(schedules, exceptions, getCampusDateKeysInRange(fromDate, toDate, 370))
      .filter((occurrence) => isKnownFacilityId(occurrence.facilityId))
  }

  const getTodaysClasses = async (at = currentTime()) => {
    const dateKey = getCampusDateKey(at)
    return (await occurrencesForRange(dateKey, dateKey)).map((occurrence) => mapOccurrenceToDashboardClass(occurrence, at))
  }

  const getRoomSchedule = async (facilityId, date = currentTime()) => {
    assertKnownFacility(facilityId)
    const dateKey = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getCampusDateKey(date)
    return (await occurrencesForRange(dateKey, dateKey)).filter((occurrence) => occurrence.facilityId === facilityId)
  }

  const getCurrentClass = async (filters = {}, at = currentTime()) => {
    const dateKey = getCampusDateKey(at)
    const timestamp = new Date(at).getTime()
    return (await occurrencesForRange(dateKey, dateKey)).find((occurrence) => (
      !occurrence.cancelled
      && (!filters.personnelId || occurrence.personnelId === Number(filters.personnelId))
      && (!filters.facilityId || occurrence.facilityId === filters.facilityId)
      && (!filters.sectionId || occurrence.sectionId === Number(filters.sectionId))
      && new Date(occurrence.startAt).getTime() <= timestamp
      && timestamp < new Date(occurrence.endAt).getTime()
    )) || null
  }

  const getUpcomingClasses = async ({ after = currentTime(), days = 14, limit = 20 } = {}) => {
    const fromDate = getCampusDateKey(after)
    const toDate = addCampusDays(fromDate, Math.max(0, Math.min(days, 90)))
    const timestamp = new Date(after).getTime()
    return (await occurrencesForRange(fromDate, toDate))
      .filter((occurrence) => !occurrence.cancelled && new Date(occurrence.startAt).getTime() > timestamp)
      .slice(0, Math.max(0, limit))
  }

  const getProfessorClasses = async (personnelId, { from = getCampusDateKey(currentTime()), to = from } = {}) => (
    await occurrencesForRange(from, to)
  ).filter((occurrence) => occurrence.personnelId === Number(personnelId))

  const getSectionSchedule = async (sectionId, { from = getCampusDateKey(currentTime()), to = from } = {}) => (
    await occurrencesForRange(from, to)
  ).filter((occurrence) => occurrence.sectionId === Number(sectionId))

  return {
    getTodaysClasses,
    getRoomSchedule,
    getCurrentClass,
    getUpcomingClasses,
    getProfessorClasses,
    getSectionSchedule,
  }
}
