import { facilities, getFacilityById } from "../data/facilities.js"
import { createPersonnelService } from "./personnelService.js"
import { subscribeToAcademicPersonnelUpdates } from "./realtimeService.js"

export const ACADEMIC_ADMIN_RESOURCES = Object.freeze({
  PERSONNEL: "personnel",
  COURSES: "courses",
  SECTIONS: "sections",
  CLASS_SCHEDULES: "classSchedules",
  SCHEDULE_EXCEPTIONS: "scheduleExceptions",
  PERSONNEL_ASSIGNMENTS: "personnelAssignments",
  CONSULTATION_HOURS: "consultationHours",
  CHECK_INS: "checkIns",
  AVAILABILITY_OVERRIDES: "availabilityOverrides",
})

export const PERSONNEL_TYPES = Object.freeze([
  "FACULTY",
  "STAFF",
  "LAB_PERSONNEL",
  "OFFICE_PERSONNEL",
  "ADMINISTRATIVE",
])
export const SCHEDULE_STATUSES = Object.freeze(["ACTIVE", "INACTIVE", "CANCELLED"])
export const EXCEPTION_TYPES = Object.freeze(["CANCELLED", "RESCHEDULED", "ROOM_CHANGED", "PROFESSOR_CHANGED", "TIME_CHANGED"])
export const OVERRIDE_TYPES = Object.freeze(["UNAVAILABLE", "LEAVE", "SPECIAL_ASSIGNMENT"])
export const VERIFICATION_STATUSES = Object.freeze(["VERIFIED", "SOURCE_ALIGNED", "PENDING_VERIFICATION", "DEMO_ONLY"])
export const DAYS = Object.freeze([
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
])

export const ACADEMIC_ADMIN_CONFIG = Object.freeze({
  [ACADEMIC_ADMIN_RESOURCES.PERSONNEL]: { table: "personnel", label: "Personnel", singular: "Personnel Record", empty: "No personnel records." },
  [ACADEMIC_ADMIN_RESOURCES.COURSES]: { table: "courses", label: "Courses", singular: "Course", empty: "No courses configured." },
  [ACADEMIC_ADMIN_RESOURCES.SECTIONS]: { table: "academic_sections", label: "Sections", singular: "Section", empty: "No sections configured." },
  [ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES]: { table: "class_schedules", label: "Class Schedules", singular: "Class Schedule", empty: "No class schedules." },
  [ACADEMIC_ADMIN_RESOURCES.SCHEDULE_EXCEPTIONS]: { table: "schedule_exceptions", label: "Schedule Exceptions", singular: "Schedule Exception", empty: "No schedule exceptions." },
  [ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS]: { table: "personnel_facility_assignments", label: "Personnel Assignments", singular: "Personnel Assignment", empty: "No personnel assignments." },
  [ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS]: { table: "personnel_consultation_hours", label: "Consultation Hours", singular: "Consultation Hours", empty: "No consultation hours." },
  [ACADEMIC_ADMIN_RESOURCES.CHECK_INS]: { table: "personnel_checkins", label: "Check-ins", singular: "Check-In", empty: "No active check-ins." },
  [ACADEMIC_ADMIN_RESOURCES.AVAILABILITY_OVERRIDES]: { table: "personnel_availability_overrides", label: "Availability Overrides", singular: "Availability Override", empty: "No availability overrides." },
})

const COLUMNS = Object.freeze({
  personnel: "id, first_name, middle_name, last_name, display_name, department_id, personnel_type, public_visibility, active, verification_status",
  courses: "id, code, name, department_id, public_visibility, active, verification_status",
  sections: "id, program, year_level, section_name, department_id, public_visibility, active, verification_status",
  classSchedules: "id, department_id, course_id, section_id, personnel_id, facility_id, day_of_week, start_time, end_time, effective_from, effective_until, status, public_visibility, verification_status",
  scheduleExceptions: "id, department_id, class_schedule_id, exception_date, exception_type, replacement_facility_id, replacement_personnel_id, replacement_start_time, replacement_end_time, verification_status",
  personnelAssignments: "id, department_id, personnel_id, facility_id, role_label, day_of_week, start_time, end_time, effective_from, effective_until, public_visibility, active, verification_status",
  consultationHours: "id, department_id, personnel_id, facility_id, day_of_week, start_time, end_time, effective_from, effective_until, public_visibility, active, verification_status",
  checkIns: "id, department_id, personnel_id, facility_id, checked_in_at, checked_out_at, status, source",
  availabilityOverrides: "id, department_id, personnel_id, starts_at, ends_at, override_type, public_visibility, verification_status",
})

const normalizedText = (value) => String(value || "").trim()
const optionalText = (value) => normalizedText(value) || null
const requiredText = (value, label) => {
  const result = normalizedText(value)
  if (!result) throw Object.assign(new Error(`${label} is required.`), { code: "VALIDATION_ERROR" })
  return result
}
const requiredNumber = (value, label) => {
  const result = Number(value)
  if (!Number.isFinite(result) || result <= 0) throw Object.assign(new Error(`${label} is required.`), { code: "VALIDATION_ERROR" })
  return result
}
const requiredEnum = (value, values, label) => {
  if (!values.includes(value)) throw Object.assign(new Error(`${label} is not supported.`), { code: "VALIDATION_ERROR" })
  return value
}
const requiredDate = (value, label) => {
  const result = normalizedText(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result)) throw Object.assign(new Error(`${label} is required.`), { code: "VALIDATION_ERROR" })
  return result
}
const requiredDateTime = (value, label) => {
  const parsed = new Date(value)
  if (!value || Number.isNaN(parsed.getTime())) throw Object.assign(new Error(`${label} is required.`), { code: "VALIDATION_ERROR" })
  return parsed.toISOString()
}
const timeValue = (value, label) => {
  const result = normalizedText(value)
  if (!/^\d{2}:\d{2}(?::\d{2})?$/.test(result)) throw Object.assign(new Error(`${label} is required.`), { code: "VALIDATION_ERROR" })
  return result.length === 5 ? `${result}:00` : result
}
const assertTimeRange = (start, end) => {
  if (end <= start) throw Object.assign(new Error("End time must be later than start time."), { code: "VALIDATION_ERROR" })
}
const assertDateRange = (start, end) => {
  if (end && end < start) throw Object.assign(new Error("Effective until must not be earlier than effective from."), { code: "VALIDATION_ERROR" })
}
const assertFacility = (facilityId, required = true) => {
  if (!facilityId && !required) return null
  if (!getFacilityById(facilityId)) throw Object.assign(new Error("Select a valid existing CampusNav facility."), { code: "VALIDATION_ERROR" })
  return facilityId
}
const bool = (value, fallback = false) => typeof value === "boolean" ? value : fallback
const escapeSearch = (value) => normalizedText(value).toLocaleLowerCase("en-PH")
const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd
const dateRangesOverlap = (aStart, aEnd, bStart, bEnd) => aStart <= (bEnd || "9999-12-31") && bStart <= (aEnd || "9999-12-31")

export const detectScheduleConflicts = (candidate, schedules, excludeId = null) => {
  if (candidate.status !== "ACTIVE") return []
  const conflicts = []
  for (const row of schedules) {
    if (Number(row.id) === Number(excludeId) || row.status !== "ACTIVE") continue
    if (Number(row.day_of_week) !== Number(candidate.day_of_week)) continue
    if (!dateRangesOverlap(candidate.effective_from, candidate.effective_until, row.effective_from, row.effective_until)) continue
    if (!overlaps(candidate.start_time, candidate.end_time, row.start_time, row.end_time)) continue
    if (row.facility_id === candidate.facility_id) conflicts.push({ type: "ROOM", message: "Room conflict detected." })
    if (Number(row.personnel_id) === Number(candidate.personnel_id)) conflicts.push({ type: "PROFESSOR", message: "Professor has another schedule during this time." })
    if (Number(row.section_id) === Number(candidate.section_id)) conflicts.push({ type: "SECTION", message: "Section already has a class during this time." })
  }
  return conflicts.filter((conflict, index, all) => all.findIndex((item) => item.type === conflict.type) === index)
}

const validateCommon = (input) => ({
  public_visibility: bool(input.public_visibility),
  verification_status: requiredEnum(input.verification_status || "PENDING_VERIFICATION", VERIFICATION_STATUSES, "Verification status"),
})

export const validateAcademicRecord = (resource, input) => {
  const common = validateCommon(input)
  if (resource === ACADEMIC_ADMIN_RESOURCES.PERSONNEL) {
    const firstName = requiredText(input.first_name, "First name")
    const lastName = requiredText(input.last_name, "Last name")
    return {
      first_name: firstName,
      middle_name: optionalText(input.middle_name),
      last_name: lastName,
      display_name: optionalText(input.display_name) || [firstName, optionalText(input.middle_name), lastName].filter(Boolean).join(" "),
      department_id: requiredNumber(input.department_id, "Department"),
      personnel_type: requiredEnum(input.personnel_type, PERSONNEL_TYPES, "Personnel type"),
      active: bool(input.active, true),
      ...common,
    }
  }
  if (resource === ACADEMIC_ADMIN_RESOURCES.COURSES) return {
    code: requiredText(input.code, "Course code").toUpperCase(),
    name: requiredText(input.name, "Course name"),
    department_id: requiredNumber(input.department_id, "Department"),
    active: bool(input.active, true),
    ...common,
  }
  if (resource === ACADEMIC_ADMIN_RESOURCES.SECTIONS) return {
    program: requiredText(input.program, "Program"),
    year_level: requiredNumber(input.year_level, "Year level"),
    section_name: requiredText(input.section_name, "Section name"),
    department_id: requiredNumber(input.department_id, "Department"),
    active: bool(input.active, true),
    ...common,
  }
  if (resource === ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES) {
    const start = timeValue(input.start_time, "Start time")
    const end = timeValue(input.end_time, "End time")
    const from = requiredDate(input.effective_from, "Effective from")
    const until = optionalText(input.effective_until)
    assertTimeRange(start, end); assertDateRange(from, until)
    return {
      department_id: requiredNumber(input.department_id, "Department"),
      course_id: requiredNumber(input.course_id, "Course"),
      section_id: requiredNumber(input.section_id, "Section"),
      personnel_id: requiredNumber(input.personnel_id, "Professor"),
      facility_id: assertFacility(requiredText(input.facility_id, "Facility")),
      day_of_week: Number(requiredEnum(Number(input.day_of_week), DAYS.map((day) => day.value), "Day")),
      start_time: start, end_time: end, effective_from: from, effective_until: until,
      status: requiredEnum(input.status || "ACTIVE", SCHEDULE_STATUSES, "Status"),
      ...common,
    }
  }
  if (resource === ACADEMIC_ADMIN_RESOURCES.SCHEDULE_EXCEPTIONS) {
    const exceptionType = requiredEnum(input.exception_type, EXCEPTION_TYPES, "Exception type")
    const payload = {
      department_id: requiredNumber(input.department_id, "Department"),
      class_schedule_id: requiredNumber(input.class_schedule_id, "Class schedule"),
      exception_date: requiredDate(input.exception_date, "Exception date"),
      exception_type: exceptionType,
      replacement_facility_id: assertFacility(optionalText(input.replacement_facility_id), false),
      replacement_personnel_id: input.replacement_personnel_id ? requiredNumber(input.replacement_personnel_id, "Replacement professor") : null,
      replacement_start_time: input.replacement_start_time ? timeValue(input.replacement_start_time, "Replacement start time") : null,
      replacement_end_time: input.replacement_end_time ? timeValue(input.replacement_end_time, "Replacement end time") : null,
      verification_status: common.verification_status,
    }
    if ((payload.replacement_start_time === null) !== (payload.replacement_end_time === null)) throw Object.assign(new Error("Provide both replacement start and end times."), { code: "VALIDATION_ERROR" })
    if (payload.replacement_start_time) assertTimeRange(payload.replacement_start_time, payload.replacement_end_time)
    if (exceptionType === "ROOM_CHANGED" && !payload.replacement_facility_id) throw Object.assign(new Error("Replacement facility is required for a room change."), { code: "VALIDATION_ERROR" })
    if (exceptionType === "PROFESSOR_CHANGED" && !payload.replacement_personnel_id) throw Object.assign(new Error("Replacement professor is required."), { code: "VALIDATION_ERROR" })
    if (exceptionType === "TIME_CHANGED" && !payload.replacement_start_time) throw Object.assign(new Error("Replacement time is required."), { code: "VALIDATION_ERROR" })
    if (exceptionType === "RESCHEDULED" && !payload.replacement_facility_id && !payload.replacement_personnel_id && !payload.replacement_start_time) throw Object.assign(new Error("Provide at least one rescheduled value."), { code: "VALIDATION_ERROR" })
    return payload
  }
  if ([ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS, ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS].includes(resource)) {
    const start = timeValue(input.start_time, "Start time")
    const end = timeValue(input.end_time, "End time")
    const from = requiredDate(input.effective_from, "Effective from")
    const until = optionalText(input.effective_until)
    assertTimeRange(start, end); assertDateRange(from, until)
    const payload = {
      department_id: requiredNumber(input.department_id, "Department"),
      personnel_id: requiredNumber(input.personnel_id, "Personnel"),
      facility_id: assertFacility(optionalText(input.facility_id), resource === ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS),
      day_of_week: Number(requiredEnum(Number(input.day_of_week), DAYS.map((day) => day.value), "Day")),
      start_time: start, end_time: end, effective_from: from, effective_until: until,
      active: bool(input.active, true),
      ...common,
    }
    return resource === ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS
      ? { ...payload, role_label: optionalText(input.role_label) }
      : payload
  }
  if (resource === ACADEMIC_ADMIN_RESOURCES.CHECK_INS) return {
    department_id: requiredNumber(input.department_id, "Department"),
    personnel_id: requiredNumber(input.personnel_id, "Personnel"),
    facility_id: assertFacility(requiredText(input.facility_id, "Facility")),
    checked_in_at: input.checked_in_at ? requiredDateTime(input.checked_in_at, "Checked in at") : new Date().toISOString(),
    checked_out_at: null,
    status: "ACTIVE",
    source: "ADMIN",
  }
  if (resource === ACADEMIC_ADMIN_RESOURCES.AVAILABILITY_OVERRIDES) {
    const start = requiredDateTime(input.starts_at, "Start")
    const end = requiredDateTime(input.ends_at, "End")
    if (end <= start) throw Object.assign(new Error("End must be later than start."), { code: "VALIDATION_ERROR" })
    return {
      department_id: requiredNumber(input.department_id, "Department"),
      personnel_id: requiredNumber(input.personnel_id, "Personnel"),
      starts_at: start, ends_at: end,
      override_type: requiredEnum(input.override_type, OVERRIDE_TYPES, "Override status"),
      reason: optionalText(input.reason),
      ...common,
    }
  }
  throw Object.assign(new Error("Unsupported academic Admin resource."), { code: "VALIDATION_ERROR" })
}

const filterRows = (resource, rows, filters = {}) => {
  const query = escapeSearch(filters.search)
  return rows.filter((row) => {
    const searchable = JSON.stringify(row).toLocaleLowerCase("en-PH")
    if (query && !searchable.includes(query)) return false
    if (filters.departmentId && filters.departmentId !== "ALL" && Number(row.department_id) !== Number(filters.departmentId)) return false
    if (filters.active && filters.active !== "ALL" && Boolean(row.active) !== (filters.active === "ACTIVE")) return false
    if (filters.personnelType && filters.personnelType !== "ALL" && row.personnel_type !== filters.personnelType) return false
    if (filters.day !== undefined && filters.day !== "ALL" && Number(row.day_of_week) !== Number(filters.day)) return false
    if (filters.personnelId && filters.personnelId !== "ALL" && Number(row.personnel_id) !== Number(filters.personnelId)) return false
    if (filters.sectionId && filters.sectionId !== "ALL" && Number(row.section_id) !== Number(filters.sectionId)) return false
    if (filters.facilityId && filters.facilityId !== "ALL" && row.facility_id !== filters.facilityId) return false
    if (filters.status && filters.status !== "ALL" && row.status !== filters.status) return false
    return true
  })
}

export const createAcademicAdminService = (client, { mapError = (error) => error } = {}) => {
  const throwResult = (result) => {
    if (result.error) throw mapError(result.error)
    return result.data || []
  }
  const selectRows = async (resource) => {
    const config = ACADEMIC_ADMIN_CONFIG[resource]
    const result = await client.from(config.table).select(COLUMNS[resource]).order("id", { ascending: false }).limit(500)
    return throwResult(result)
  }
  const listDepartments = async () => throwResult(await client.from("departments").select("id, code, name, active").order("name", { ascending: true }).limit(200))
  const loadReferences = async () => {
    const [departments, personnel, courses, sections, classSchedules] = await Promise.all([
      listDepartments(), selectRows(ACADEMIC_ADMIN_RESOURCES.PERSONNEL), selectRows(ACADEMIC_ADMIN_RESOURCES.COURSES),
      selectRows(ACADEMIC_ADMIN_RESOURCES.SECTIONS), selectRows(ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES),
    ])
    return { departments, personnel, courses, sections, classSchedules, facilities }
  }
  const enrichRows = async (resource, rows) => {
    const refs = await loadReferences()
    const byId = (items) => new Map(items.map((item) => [Number(item.id), item]))
    const departments = byId(refs.departments), personnel = byId(refs.personnel), courses = byId(refs.courses), sections = byId(refs.sections), schedules = byId(refs.classSchedules)
    let statuses = new Map()
    if (resource === ACADEMIC_ADMIN_RESOURCES.PERSONNEL) {
      const engine = createPersonnelService(client)
      try {
        const availability = await engine.getPersonnelAvailability()
        statuses = new Map(availability.map((item) => [Number(item.sourceId), item]))
      } catch { statuses = new Map() }
    }
    return rows.map((row) => ({
      ...row,
      department: departments.get(Number(row.department_id)) || null,
      personnel: personnel.get(Number(row.personnel_id)) || null,
      course: courses.get(Number(row.course_id)) || null,
      section: sections.get(Number(row.section_id)) || null,
      classSchedule: schedules.get(Number(row.class_schedule_id)) || null,
      replacementPersonnel: personnel.get(Number(row.replacement_personnel_id)) || null,
      facility: getFacilityById(row.facility_id || row.replacement_facility_id) || null,
      derivedStatus: statuses.get(Number(row.id)) || null,
    }))
  }
  const listAcademicRecords = async (resource, filters = {}) => filterRows(resource, await enrichRows(resource, await selectRows(resource)), filters)
  const save = async (resource, id, input) => {
    const config = ACADEMIC_ADMIN_CONFIG[resource]
    const payload = validateAcademicRecord(resource, input)
    if (resource === ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES) {
      const conflicts = detectScheduleConflicts(payload, await selectRows(resource), id)
      if (conflicts.length) throw Object.assign(new Error(conflicts.map((item) => item.message).join(" ")), { code: "SCHEDULE_CONFLICT", conflicts })
    }
    const query = id ? client.from(config.table).update(payload).eq("id", id) : client.from(config.table).insert(payload)
    try {
      return throwResult(await query.select(COLUMNS[resource]).single())
    } catch (error) { throw mapError(error) }
  }
  const setActive = async (resource, id, active) => {
    if (![ACADEMIC_ADMIN_RESOURCES.PERSONNEL, ACADEMIC_ADMIN_RESOURCES.COURSES, ACADEMIC_ADMIN_RESOURCES.SECTIONS, ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS, ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS].includes(resource)) {
      throw Object.assign(new Error("This record does not support activation changes."), { code: "VALIDATION_ERROR" })
    }
    return throwResult(await client.from(ACADEMIC_ADMIN_CONFIG[resource].table).update({ active }).eq("id", id).select(COLUMNS[resource]).single())
  }
  const cancelSchedule = async (id) => throwResult(await client.from("class_schedules").update({ status: "CANCELLED" }).eq("id", id).select(COLUMNS.classSchedules).single())
  const checkOut = async (id) => throwResult(await client.from("personnel_checkins").update({ status: "CLOSED", checked_out_at: new Date().toISOString() }).eq("id", id).eq("status", "ACTIVE").select(COLUMNS.checkIns).single())
  const endOverride = async (record) => {
    const now = new Date()
    const startsAt = new Date(record.starts_at)
    const endsAt = now > startsAt ? now : new Date(startsAt.getTime() + 1000)
    return throwResult(await client.from("personnel_availability_overrides").update({ ends_at: endsAt.toISOString() }).eq("id", record.id).select(COLUMNS.availabilityOverrides).single())
  }
  const getPersonnelDetails = async (id) => {
    const [refs, schedules, assignments, consultations, checkIns, overrides] = await Promise.all([
      loadReferences(), listAcademicRecords(ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES, { personnelId: id }),
      listAcademicRecords(ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS, { personnelId: id }),
      listAcademicRecords(ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS, { personnelId: id }),
      listAcademicRecords(ACADEMIC_ADMIN_RESOURCES.CHECK_INS, { personnelId: id }),
      listAcademicRecords(ACADEMIC_ADMIN_RESOURCES.AVAILABILITY_OVERRIDES, { personnelId: id }),
    ])
    const person = refs.personnel.find((item) => Number(item.id) === Number(id)) || null
    if (!person) return null
    const engine = createPersonnelService(client)
    let currentStatus = null, nextAvailability = null, schedule = []
    try {
      [currentStatus, nextAvailability, schedule] = await Promise.all([
        engine.getPersonnelCurrentStatus(id), engine.getPersonnelNextAvailability(id), engine.getPersonnelSchedule(id),
      ])
    } catch { /* RLS-safe details below remain available when public projections are intentionally hidden. */ }
    return {
      personnel: person, currentStatus, nextAvailability, mergedSchedule: schedule,
      classSchedules: schedules, assignments, consultations,
      activeCheckIn: checkIns.find((row) => row.status === "ACTIVE" && !row.checked_out_at) || null,
      activeOverride: overrides.find((row) => new Date(row.starts_at) <= new Date() && new Date(row.ends_at) > new Date()) || null,
    }
  }
  return {
    facilities,
    listDepartments,
    loadAcademicReferences: loadReferences,
    listAcademicRecords,
    createAcademicRecord: (resource, input) => save(resource, null, input),
    updateAcademicRecord: (resource, id, input) => save(resource, id, input),
    setAcademicRecordActive: setActive,
    cancelClassSchedule: cancelSchedule,
    checkOutPersonnel: checkOut,
    endAvailabilityOverride: endOverride,
    getPersonnelDetails,
    subscribeToAcademicChanges: (onChange, onStatus) => subscribeToAcademicPersonnelUpdates(client, onChange, onStatus),
  }
}
