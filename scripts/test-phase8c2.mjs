import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import {
  ACADEMIC_ADMIN_RESOURCES,
  PERSONNEL_TYPES,
  detectScheduleConflicts,
  validateAcademicRecord,
} from "../src/services/academicAdminService.js"
import { PERSONNEL_STATUSES } from "../src/data/dashboardContracts.js"
import { resolveRecurringPersonnelInterval } from "../src/services/personnelService.js"

const schedule = validateAcademicRecord(ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES, {
  department_id: 1,
  course_id: 2,
  section_id: 3,
  personnel_id: 4,
  facility_id: "virtual-laboratory",
  day_of_week: 1,
  start_time: "09:00",
  end_time: "10:30",
  effective_from: "2026-09-01",
  effective_until: "2026-12-31",
  status: "ACTIVE",
  public_visibility: true,
  verification_status: "VERIFIED",
})
assert.equal(schedule.facility_id, "virtual-laboratory")
assert.equal(schedule.start_time, "09:00:00")

const existing = [{
  id: 10,
  department_id: 1,
  course_id: 20,
  section_id: 3,
  personnel_id: 4,
  facility_id: "virtual-laboratory",
  day_of_week: 1,
  start_time: "10:00:00",
  end_time: "11:00:00",
  effective_from: "2026-09-01",
  effective_until: null,
  status: "ACTIVE",
}]
const conflicts = detectScheduleConflicts(schedule, existing)
assert.deepEqual(conflicts.map((item) => item.type), ["ROOM", "PROFESSOR", "SECTION"])
assert.match(conflicts.map((item) => item.message).join(" "), /Room conflict detected/)
assert.match(conflicts.map((item) => item.message).join(" "), /Professor has another schedule/)
assert.match(conflicts.map((item) => item.message).join(" "), /Section already has a class/)
assert.equal(detectScheduleConflicts({ ...schedule, start_time: "11:00:00", end_time: "12:00:00" }, existing).length, 0, "touching time windows do not overlap")
assert.equal(detectScheduleConflicts({ ...schedule, status: "CANCELLED" }, existing).length, 0, "cancelled schedules do not conflict")

assert.deepEqual(PERSONNEL_TYPES, ["FACULTY", "STAFF", "LAB_PERSONNEL", "OFFICE_PERSONNEL", "ADMINISTRATIVE"])
assert.throws(() => validateAcademicRecord(ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES, { ...schedule, facility_id: "invented-room" }), /valid existing CampusNav facility/)
assert.throws(() => validateAcademicRecord(ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES, { ...schedule, end_time: "08:00" }), /End time must be later/)

const consultation = validateAcademicRecord(ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS, {
  department_id: 1,
  personnel_id: 4,
  facility_id: "",
  day_of_week: 1,
  start_time: "13:00",
  end_time: "14:00",
  effective_from: "2026-09-01",
  effective_until: "",
  active: true,
  public_visibility: false,
  verification_status: "PENDING_VERIFICATION",
})
assert.equal(consultation.facility_id, null)
assert.ok(resolveRecurringPersonnelInterval({ id: 1, ...consultation }, "2026-09-14", PERSONNEL_STATUSES.CONSULTATION), "facility-optional consultation remains part of the status engine")

const [app, shell, page, editor, migration] = await Promise.all([
  readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/components/admin/AdminShell.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/admin/AcademicAdminPage.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/components/admin/AcademicAdminEditor.jsx", import.meta.url), "utf8"),
  readFile(new URL("../supabase/migrations/20260915052147_phase_8c2_personnel_academic_admin_ui.sql", import.meta.url), "utf8"),
])

for (const path of ["personnel", "courses", "sections", "class-schedules", "schedule-exceptions", "personnel-assignments", "consultation-hours", "check-ins", "personnel-availability"]) {
  assert.match(app, new RegExp(`/admin/${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`))
}
for (const label of ["Personnel", "Courses", "Sections", "Class Schedules", "Schedule Exceptions", "Personnel Assignments", "Consultation Hours", "Check-ins", "Availability Overrides"]) assert.match(shell, new RegExp(label))

assert.match(page, /subscribeToAcademicChanges/)
assert.match(page, /This action will mark this personnel record as currently checked in/)
assert.match(page, /A schedule is never treated as a check-in/)
assert.match(page, /Availability cannot be determined/)
assert.match(page, /\/map\?facility=/)
assert.match(editor, /Only stable IDs from the existing CampusNav facility registry/)
assert.doesNotMatch(`${page}\n${editor}`, /currently inside|physically there|present in room/i)

assert.match(migration, /personnel_type add value if not exists 'LAB_PERSONNEL'/)
assert.match(migration, /alter column facility_id drop not null/)
assert.match(migration, /class_schedules_room_conflict_exclusion/)
assert.match(migration, /class_schedules_professor_conflict_exclusion/)
assert.match(migration, /class_schedules_section_conflict_exclusion/)
assert.match(migration, /where \(status = 'ACTIVE'\)/)
assert.doesNotMatch(migration, /create policy|disable row level security/i, "Phase 8C.2 does not weaken or replace RLS")

console.log("Phase 8C.2 routes, forms, facility reuse, privacy wording, conflict validation, and database constraints: PASS")
