import { DASHBOARD_DATA_STATUS, PERSONNEL_STATUSES } from "../data/dashboardContracts.js"
import { getFacilityById } from "../data/facilities.js"
import {
  addCampusDays,
  campusDateTimeToIso,
  getCampusDateKey,
  getCampusDateKeysInRange,
  getCampusDayOfWeek,
  isCampusDateInRange,
} from "../lib/campusTime.js"
import { getScheduleOccurrences, isKnownFacilityId } from "./scheduleService.js"

export const PERSONNEL_STATUS_PRECEDENCE = Object.freeze([
  PERSONNEL_STATUSES.UNAVAILABLE,
  PERSONNEL_STATUSES.CHECKED_IN,
  PERSONNEL_STATUSES.IN_CLASS,
  PERSONNEL_STATUSES.CONSULTATION,
  PERSONNEL_STATUSES.SCHEDULED,
  PERSONNEL_STATUSES.NO_ACTIVE_SCHEDULE,
])

const value = (row, snakeName, camelName) => row?.[snakeName] ?? row?.[camelName]
const personId = (row) => Number(value(row, "personnel_id", "personnelId"))
const timestamp = (input) => new Date(input).getTime()
const containsTime = (startAt, endAt, at) => timestamp(startAt) <= timestamp(at) && timestamp(at) < timestamp(endAt)
const getDateWeekday = (dateKey) => getCampusDayOfWeek(new Date(`${dateKey}T12:00:00+08:00`))

export const resolveRecurringPersonnelInterval = (row, dateKey, type) => {
  if (value(row, "active", "active") === false) return null
  if (Number(value(row, "day_of_week", "dayOfWeek")) !== getDateWeekday(dateKey)) return null
  if (!isCampusDateInRange(dateKey, value(row, "effective_from", "effectiveFrom"), value(row, "effective_until", "effectiveUntil"))) return null
  const facilityId = value(row, "facility_id", "facilityId")
  if (!isKnownFacilityId(facilityId)) return null
  return {
    id: Number(value(row, "id", "id")),
    type,
    personnelId: personId(row),
    facilityId,
    startAt: campusDateTimeToIso(dateKey, value(row, "start_time", "startTime")),
    endAt: campusDateTimeToIso(dateKey, value(row, "end_time", "endTime")),
    verificationStatus: value(row, "verification_status", "verificationStatus"),
  }
}

const intervalForOccurrence = (occurrence) => occurrence.cancelled ? null : ({
  id: occurrence.id,
  type: PERSONNEL_STATUSES.IN_CLASS,
  personnelId: occurrence.personnelId,
  facilityId: occurrence.facilityId,
  startAt: occurrence.startAt,
  endAt: occurrence.endAt,
  verificationStatus: occurrence.verificationStatus,
})

const activeOverride = (overrides, personnelId, at) => overrides.find((override) => (
  personId(override) === personnelId
  && containsTime(value(override, "starts_at", "startsAt"), value(override, "ends_at", "endsAt"), at)
))

const activeCheckin = (checkins, personnelId, at) => checkins.find((checkin) => (
  personId(checkin) === personnelId
  && value(checkin, "status", "status") === "ACTIVE"
  && timestamp(value(checkin, "checked_in_at", "checkedInAt")) <= timestamp(at)
  && (!value(checkin, "checked_out_at", "checkedOutAt") || timestamp(at) < timestamp(value(checkin, "checked_out_at", "checkedOutAt")))
))

const activeInterval = (intervals, personnelId, at) => intervals.find((interval) => (
  interval.personnelId === personnelId && containsTime(interval.startAt, interval.endAt, at)
))

export const resolvePersonnelStatus = ({
  personnel,
  at = new Date(),
  classIntervals = [],
  assignments = [],
  consultations = [],
  checkins = [],
  overrides = [],
}) => {
  const id = Number(value(personnel, "id", "id"))
  const override = activeOverride(overrides, id, at)
  if (override) {
    return {
      status: PERSONNEL_STATUSES.UNAVAILABLE,
      scheduledStartAt: value(override, "starts_at", "startsAt"),
      scheduledEndAt: value(override, "ends_at", "endsAt"),
      facilityId: null,
      source: "AVAILABILITY_OVERRIDE",
    }
  }

  const checkin = activeCheckin(checkins, id, at)
  if (checkin) {
    return {
      status: PERSONNEL_STATUSES.CHECKED_IN,
      scheduledStartAt: value(checkin, "checked_in_at", "checkedInAt"),
      scheduledEndAt: null,
      facilityId: value(checkin, "facility_id", "facilityId"),
      source: "AUTHORIZED_CHECKIN",
    }
  }

  const currentClass = activeInterval(classIntervals, id, at)
  if (currentClass) return { status: PERSONNEL_STATUSES.IN_CLASS, scheduledStartAt: currentClass.startAt, scheduledEndAt: currentClass.endAt, facilityId: currentClass.facilityId, source: "CLASS_SCHEDULE" }

  const consultation = activeInterval(consultations, id, at)
  if (consultation) return { status: PERSONNEL_STATUSES.CONSULTATION, scheduledStartAt: consultation.startAt, scheduledEndAt: consultation.endAt, facilityId: consultation.facilityId, source: "CONSULTATION_SCHEDULE" }

  const assignment = activeInterval(assignments, id, at)
  if (assignment) return { status: PERSONNEL_STATUSES.SCHEDULED, scheduledStartAt: assignment.startAt, scheduledEndAt: assignment.endAt, facilityId: assignment.facilityId, source: "FACILITY_ASSIGNMENT" }

  return { status: PERSONNEL_STATUSES.NO_ACTIVE_SCHEDULE, scheduledStartAt: null, scheduledEndAt: null, facilityId: null, source: "NONE" }
}

export const mergeBusyIntervals = (intervals) => {
  const sorted = intervals
    .filter((interval) => interval?.startAt && interval?.endAt && timestamp(interval.endAt) > timestamp(interval.startAt))
    .sort((a, b) => timestamp(a.startAt) - timestamp(b.startAt) || timestamp(a.endAt) - timestamp(b.endAt))

  return sorted.reduce((merged, interval) => {
    const previous = merged.at(-1)
    if (!previous || timestamp(interval.startAt) > timestamp(previous.endAt)) {
      merged.push({ ...interval, sources: [interval.type] })
      return merged
    }
    if (timestamp(interval.endAt) > timestamp(previous.endAt)) previous.endAt = interval.endAt
    if (!previous.sources.includes(interval.type)) previous.sources.push(interval.type)
    return merged
  }, [])
}

export const findNextAvailabilityWindow = (intervals, from, horizonEnd) => {
  let cursor = timestamp(from)
  const horizon = timestamp(horizonEnd)
  if (!Number.isFinite(cursor) || !Number.isFinite(horizon) || cursor >= horizon) return null

  for (const interval of mergeBusyIntervals(intervals)) {
    const start = timestamp(interval.startAt)
    const end = timestamp(interval.endAt)
    if (end <= cursor) continue
    if (start > cursor) return { startAt: new Date(cursor).toISOString(), endAt: new Date(Math.min(start, horizon)).toISOString() }
    cursor = Math.max(cursor, end)
    if (cursor >= horizon) return null
  }

  return { startAt: new Date(cursor).toISOString(), endAt: new Date(horizon).toISOString() }
}

const selectRows = async (client, table) => {
  const { data, error } = await client.from(table).select("*")
  if (error) throw error
  return data || []
}

const displayRole = (type) => String(type || "Personnel")
  .toLowerCase()
  .replaceAll("_", " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase())

export const createPersonnelService = (client, { now = () => new Date() } = {}) => {
  const currentTime = () => {
    const result = typeof now === "function" ? now() : now
    return result instanceof Date ? result : new Date(result)
  }

  const loadPersonnel = () => selectRows(client, "public_personnel")
  const loadStatusData = async () => {
    const [personnel, schedules, exceptions, assignmentRows, consultationRows, checkins, overrides] = await Promise.all([
      loadPersonnel(),
      selectRows(client, "public_class_schedules"),
      selectRows(client, "public_schedule_exceptions"),
      selectRows(client, "public_personnel_facility_assignments"),
      selectRows(client, "public_personnel_consultation_hours"),
      selectRows(client, "active_personnel_checkins"),
      selectRows(client, "public_personnel_availability_overrides"),
    ])
    return { personnel, schedules, exceptions, assignmentRows, consultationRows, checkins, overrides }
  }

  const intervalsForDates = (data, dateKeys) => {
    const classIntervals = getScheduleOccurrences(data.schedules, data.exceptions, dateKeys).map(intervalForOccurrence).filter(Boolean)
    const assignments = dateKeys.flatMap((dateKey) => data.assignmentRows.map((row) => resolveRecurringPersonnelInterval(row, dateKey, PERSONNEL_STATUSES.SCHEDULED))).filter(Boolean)
    const consultations = dateKeys.flatMap((dateKey) => data.consultationRows.map((row) => resolveRecurringPersonnelInterval(row, dateKey, PERSONNEL_STATUSES.CONSULTATION))).filter(Boolean)
    return { classIntervals, assignments, consultations }
  }

  const searchPersonnel = async (query = "") => {
    const normalized = query.trim().toLocaleLowerCase("en-PH")
    return (await loadPersonnel()).filter((person) => !normalized || String(person.display_name).toLocaleLowerCase("en-PH").includes(normalized))
  }

  const getPersonnelById = async (id) => (await loadPersonnel()).find((person) => Number(person.id) === Number(id)) || null

  const getPersonnelCurrentStatus = async (id, at = currentTime(), loadedData = null) => {
    const data = loadedData || await loadStatusData()
    const personnel = data.personnel.find((person) => Number(person.id) === Number(id))
    if (!personnel) return null
    const dateKey = getCampusDateKey(at)
    const intervals = intervalsForDates(data, [dateKey])
    return {
      personnel,
      ...resolvePersonnelStatus({ personnel, at, ...intervals, checkins: data.checkins, overrides: data.overrides }),
    }
  }

  const getPersonnelSchedule = async (id, { from = getCampusDateKey(currentTime()), to = from } = {}, loadedData = null) => {
    const data = loadedData || await loadStatusData()
    const dates = getCampusDateKeysInRange(from, to, 370)
    const intervals = intervalsForDates(data, dates)
    const directOverrides = data.overrides.filter((row) => personId(row) === Number(id)).map((row) => ({
      id: Number(row.id),
      type: PERSONNEL_STATUSES.UNAVAILABLE,
      personnelId: Number(id),
      facilityId: null,
      startAt: value(row, "starts_at", "startsAt"),
      endAt: value(row, "ends_at", "endsAt"),
      verificationStatus: value(row, "verification_status", "verificationStatus"),
    }))
    return [...intervals.classIntervals, ...intervals.consultations, ...intervals.assignments, ...directOverrides]
      .filter((interval) => interval.personnelId === Number(id))
      .sort((a, b) => timestamp(a.startAt) - timestamp(b.startAt))
  }

  const getPersonnelNextAvailability = async (id, { at = currentTime(), days = 7 } = {}) => {
    const data = await loadStatusData()
    if (!data.personnel.some((person) => Number(person.id) === Number(id))) return null
    const fromDate = getCampusDateKey(at)
    const horizonDate = addCampusDays(fromDate, Math.max(1, Math.min(days, 31)))
    const horizonEnd = campusDateTimeToIso(horizonDate, "23:59:59")
    const schedule = await getPersonnelSchedule(id, { from: fromDate, to: horizonDate }, data)
    return findNextAvailabilityWindow(schedule, at, horizonEnd)
  }

  const getFacilityPersonnel = async (facilityId, at = currentTime()) => {
    if (!isKnownFacilityId(facilityId)) throw new Error(`Unknown CampusNav facility ID: ${facilityId}`)
    const data = await loadStatusData()
    const dateKey = getCampusDateKey(at)
    const intervals = intervalsForDates(data, [dateKey])
    const relatedIds = new Set([
      ...intervals.classIntervals,
      ...intervals.consultations,
      ...intervals.assignments,
    ].filter((interval) => interval.facilityId === facilityId).map((interval) => interval.personnelId))
    data.checkins.filter((row) => value(row, "facility_id", "facilityId") === facilityId).forEach((row) => relatedIds.add(personId(row)))

    return (await Promise.all([...relatedIds].map((id) => getPersonnelCurrentStatus(id, at, data))))
      .filter(Boolean)
  }

  const getPersonnelAvailability = async (at = currentTime()) => {
    const data = await loadStatusData()
    const statuses = await Promise.all(data.personnel.map((person) => getPersonnelCurrentStatus(person.id, at, data)))
    return statuses.filter(Boolean).map((result) => {
      const facility = getFacilityById(result.facilityId)
      const demo = result.personnel.verification_status === "DEMO_ONLY"
      return {
        id: `personnel-${result.personnel.id}`,
        sourceId: String(result.personnel.id),
        sourceType: "SUPABASE",
        name: result.personnel.display_name,
        role: displayRole(result.personnel.personnel_type),
        status: result.status,
        facilityName: facility?.name || null,
        relatedFacilityId: facility?.id || null,
        scheduledStartAt: result.scheduledStartAt,
        scheduledEndAt: result.scheduledEndAt,
        verificationStatus: result.personnel.verification_status,
        dataStatus: demo ? DASHBOARD_DATA_STATUS.DEMO : DASHBOARD_DATA_STATUS.SOURCE_ALIGNED,
        demo,
      }
    })
  }

  return {
    searchPersonnel,
    getPersonnelById,
    getPersonnelCurrentStatus,
    getPersonnelSchedule,
    getPersonnelNextAvailability,
    getFacilityPersonnel,
    getPersonnelAvailability,
  }
}
