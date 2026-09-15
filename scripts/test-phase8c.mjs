import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { fileURLToPath, URL } from "node:url"
import { PERSONNEL_STATUSES } from "../src/data/dashboardContracts.js"
import { campusDateTimeToIso, getCampusDateKey, getCampusDayOfWeek, timeToMinutes } from "../src/lib/campusTime.js"
import {
  findNextAvailabilityWindow,
  createPersonnelService,
  PERSONNEL_STATUS_PRECEDENCE,
  resolvePersonnelStatus,
  resolveRecurringPersonnelInterval,
} from "../src/services/personnelService.js"
import {
  createScheduleService,
  resolveScheduleOccurrence,
  SCHEDULE_EXCEPTION_TYPES,
} from "../src/services/scheduleService.js"

const migrationPath = fileURLToPath(new URL("../supabase/migrations/20260915002902_phase_8c1_academic_personnel_foundation.sql", import.meta.url))
const migration = await readFile(migrationPath, "utf8")

for (const table of [
  "personnel",
  "courses",
  "academic_sections",
  "class_schedules",
  "schedule_exceptions",
  "personnel_facility_assignments",
  "personnel_consultation_hours",
  "personnel_checkins",
  "personnel_availability_overrides",
]) {
  assert.match(migration, new RegExp(`create table public\\.${table}\\s*\\(`, "i"), `${table} schema exists`)
  assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, "i"), `${table} has RLS`)
}

assert.match(migration, /create view public\.public_class_schedules[\s\S]*security_barrier/i)
assert.match(migration, /create view public\.active_personnel_checkins[\s\S]*checkin\.status = 'ACTIVE'/i)
assert.match(migration, /There is intentionally no self-service INSERT policy/i)
assert.doesNotMatch(migration, /create policy personnel_checkins_insert_own/i)
assert.match(migration, /dashboard_refresh_events[\s\S]*alter publication supabase_realtime add table public\.dashboard_refresh_events/i)
assert.match(migration, /record_phase8c_audit/i)
assert.match(migration, /link_personnel_account/i)

assert.equal(getCampusDateKey(new Date("2026-09-14T16:30:00.000Z")), "2026-09-15")
assert.equal(getCampusDayOfWeek(new Date("2026-09-15T05:00:00.000Z")), 2)
assert.equal(timeToMinutes("13:30:00"), 810)
assert.equal(campusDateTimeToIso("2026-09-15", "13:30:00"), "2026-09-15T05:30:00.000Z")

const schedule = {
  id: 10,
  department_id: 1,
  course_id: 20,
  course_code: "DEV 8C1",
  course_name: "DEMO / DEVELOPMENT / NOT OFFICIAL",
  section_id: 30,
  program: "DEV",
  year_level: 1,
  section_name: "TEST",
  personnel_id: 40,
  personnel_display_name: "Development Faculty",
  facility_id: "library",
  day_of_week: 2,
  start_time: "13:00:00",
  end_time: "14:30:00",
  effective_from: "2026-09-01",
  effective_until: "2026-09-30",
  status: "ACTIVE",
  verification_status: "DEMO_ONLY",
}

const original = resolveScheduleOccurrence(schedule, [], "2026-09-15")
assert.equal(original.facilityId, "library")
assert.equal(original.cancelled, false)

for (const [exceptionType, overrides, expected] of [
  [SCHEDULE_EXCEPTION_TYPES.CANCELLED, {}, { cancelled: true }],
  [SCHEDULE_EXCEPTION_TYPES.ROOM_CHANGED, { replacement_facility_id: "virtual-laboratory" }, { facilityId: "virtual-laboratory" }],
  [SCHEDULE_EXCEPTION_TYPES.PROFESSOR_CHANGED, { replacement_personnel_id: 41, replacement_personnel_display_name: "Replacement Faculty" }, { personnelId: 41 }],
  [SCHEDULE_EXCEPTION_TYPES.TIME_CHANGED, { replacement_start_time: "15:00:00", replacement_end_time: "16:00:00" }, { startAt: "2026-09-15T07:00:00.000Z" }],
  [SCHEDULE_EXCEPTION_TYPES.RESCHEDULED, { replacement_facility_id: "computer-laboratory", replacement_start_time: "16:00:00", replacement_end_time: "17:00:00" }, { facilityId: "computer-laboratory" }],
]) {
  const occurrence = resolveScheduleOccurrence(schedule, [{ id: 1, class_schedule_id: 10, exception_date: "2026-09-15", exception_type: exceptionType, ...overrides }], "2026-09-15")
  for (const [key, value] of Object.entries(expected)) assert.equal(occurrence[key], value, `${exceptionType} applies ${key}`)
}

const person = { id: 40 }
const at = new Date("2026-09-15T05:30:00.000Z")
const classIntervals = [{ personnelId: 40, facilityId: "library", startAt: "2026-09-15T05:00:00.000Z", endAt: "2026-09-15T06:30:00.000Z" }]
const consultations = [{ personnelId: 40, facilityId: "room-43", startAt: "2026-09-15T05:00:00.000Z", endAt: "2026-09-15T06:30:00.000Z" }]
const assignments = [{ personnelId: 40, facilityId: "virtual-laboratory", startAt: "2026-09-15T05:00:00.000Z", endAt: "2026-09-15T06:30:00.000Z" }]
const checkins = [{ personnel_id: 40, facility_id: "computer-laboratory", status: "ACTIVE", checked_in_at: "2026-09-15T05:15:00.000Z" }]
const overrides = [{ personnel_id: 40, starts_at: "2026-09-15T05:20:00.000Z", ends_at: "2026-09-15T05:40:00.000Z", override_type: "UNAVAILABLE" }]

assert.deepEqual(PERSONNEL_STATUS_PRECEDENCE, ["UNAVAILABLE", "CHECKED_IN", "IN_CLASS", "CONSULTATION", "SCHEDULED", "NO_ACTIVE_SCHEDULE"])
assert.equal(resolvePersonnelStatus({ personnel: person, at, classIntervals, consultations, assignments, checkins, overrides }).status, PERSONNEL_STATUSES.UNAVAILABLE)
assert.equal(resolvePersonnelStatus({ personnel: person, at, classIntervals, consultations, assignments, checkins }).status, PERSONNEL_STATUSES.CHECKED_IN)
assert.equal(resolvePersonnelStatus({ personnel: person, at, classIntervals, consultations, assignments }).status, PERSONNEL_STATUSES.IN_CLASS)
assert.equal(resolvePersonnelStatus({ personnel: person, at, consultations, assignments }).status, PERSONNEL_STATUSES.CONSULTATION)
assert.equal(resolvePersonnelStatus({ personnel: person, at, assignments }).status, PERSONNEL_STATUSES.SCHEDULED)
assert.equal(resolvePersonnelStatus({ personnel: person, at }).status, PERSONNEL_STATUSES.NO_ACTIVE_SCHEDULE)
assert.notEqual(resolvePersonnelStatus({ personnel: person, at, assignments }).status, PERSONNEL_STATUSES.CHECKED_IN, "schedule never proves presence")

const recurringAssignment = resolveRecurringPersonnelInterval({
  id: 50,
  personnel_id: 40,
  facility_id: "virtual-laboratory",
  day_of_week: 2,
  start_time: "16:00:00",
  end_time: "17:00:00",
  effective_from: "2026-09-01",
  effective_until: "2026-09-30",
}, "2026-09-15", PERSONNEL_STATUSES.SCHEDULED)
assert.equal(recurringAssignment.facilityId, "virtual-laboratory")
assert.equal(resolveRecurringPersonnelInterval({ ...recurringAssignment, facility_id: "not-a-campusnav-facility", day_of_week: 2, start_time: "16:00", end_time: "17:00", effective_from: "2026-09-01" }, "2026-09-15", "SCHEDULED"), null)

const freeWindow = findNextAvailabilityWindow([
  { type: "IN_CLASS", startAt: "2026-09-15T05:00:00.000Z", endAt: "2026-09-15T06:30:00.000Z" },
  { type: "SCHEDULED", startAt: "2026-09-15T08:00:00.000Z", endAt: "2026-09-15T09:00:00.000Z" },
], "2026-09-15T05:30:00.000Z", "2026-09-15T10:00:00.000Z")
assert.deepEqual(freeWindow, { startAt: "2026-09-15T06:30:00.000Z", endAt: "2026-09-15T08:00:00.000Z" })

const overlapWindow = findNextAvailabilityWindow([
  { type: "IN_CLASS", startAt: "2026-09-15T05:00:00.000Z", endAt: "2026-09-15T06:30:00.000Z" },
  { type: "SCHEDULED", startAt: "2026-09-15T06:00:00.000Z", endAt: "2026-09-15T09:00:00.000Z" },
], "2026-09-15T05:30:00.000Z", "2026-09-15T10:00:00.000Z")
assert.equal(overlapWindow.startAt, "2026-09-15T09:00:00.000Z")
assert.notDeepEqual(overlapWindow, freeWindow, "overlapping work removes the false 2:30–4:00 PM window")

const tableData = {
  public_class_schedules: [schedule],
  public_schedule_exceptions: [],
  public_personnel: [{ id: 40, display_name: "Development Faculty", personnel_type: "FACULTY", verification_status: "DEMO_ONLY" }],
  public_personnel_facility_assignments: [{
    id: 51,
    personnel_id: 40,
    facility_id: "virtual-laboratory",
    day_of_week: 2,
    start_time: "16:00:00",
    end_time: "17:00:00",
    effective_from: "2026-09-01",
    effective_until: "2026-09-30",
    verification_status: "DEMO_ONLY",
  }],
  public_personnel_consultation_hours: [],
  active_personnel_checkins: [],
  public_personnel_availability_overrides: [],
}
const mockClient = { from: (table) => ({ select: async () => ({ data: tableData[table] || [], error: null }) }) }
const service = createScheduleService(mockClient, { now: () => at })
assert.equal((await service.getTodaysClasses()).length, 1)
assert.equal((await service.getRoomSchedule("library", "2026-09-15")).length, 1)
assert.equal((await service.getCurrentClass({ personnelId: 40 }, at)).personnelId, 40)
assert.equal((await service.getProfessorClasses(40, { from: "2026-09-15", to: "2026-09-15" })).length, 1)
assert.equal((await service.getSectionSchedule(30, { from: "2026-09-15", to: "2026-09-15" })).length, 1)

const personnelService = createPersonnelService(mockClient, { now: () => at })
assert.equal((await personnelService.searchPersonnel("development")).length, 1)
assert.equal((await personnelService.getPersonnelById(40)).display_name, "Development Faculty")
assert.equal((await personnelService.getPersonnelCurrentStatus(40)).status, PERSONNEL_STATUSES.IN_CLASS)
assert.equal((await personnelService.getPersonnelSchedule(40, { from: "2026-09-15", to: "2026-09-15" })).length, 2)
assert.deepEqual(await personnelService.getPersonnelNextAvailability(40, { at, days: 1 }), {
  startAt: "2026-09-15T06:30:00.000Z",
  endAt: "2026-09-15T08:00:00.000Z",
})
assert.equal((await personnelService.getFacilityPersonnel("library", at))[0].status, PERSONNEL_STATUSES.IN_CLASS)
assert.equal((await personnelService.getPersonnelAvailability(at))[0].status, PERSONNEL_STATUSES.IN_CLASS)

console.log("Phase 8C.1 schema, Manila time, exceptions, privacy precedence, overlap, facility-ID, and schedule-service regressions: PASS")
