import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import { createClient } from "@supabase/supabase-js"
import { getCampusClockParts, getCampusDateKey, getCampusDayOfWeek } from "../src/lib/campusTime.js"
import { createSupabaseDashboardProvider } from "../src/providers/dashboard/supabaseDashboardProvider.js"
import { createPersonnelService } from "../src/services/personnelService.js"
import { subscribeToAcademicPersonnelUpdates } from "../src/services/realtimeService.js"
import { loadCloudTestConfig } from "./phase8a-cloud-env.mjs"

const parseEnvFile = (contents) => Object.fromEntries(contents
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#") && line.includes("="))
  .map((line) => {
    const separator = line.indexOf("=")
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
  }))

const projectRoot = fileURLToPath(new URL("..", import.meta.url))
let sessionEnv = {}
try {
  sessionEnv = parseEnvFile(await readFile(resolve(projectRoot, ".env.phase8a.session"), "utf8"))
} catch (error) {
  if (error?.code !== "ENOENT") throw error
}

const email = String(process.env.CAMPUSNAV_TEST_EMAIL || sessionEnv.CAMPUSNAV_TEST_EMAIL || "").trim()
const password = String(process.env.CAMPUSNAV_TEST_PASSWORD || sessionEnv.CAMPUSNAV_TEST_PASSWORD || "")
if (!email || !password) throw new Error("Phase 8C.1 live tests require CAMPUSNAV_TEST_EMAIL and CAMPUSNAV_TEST_PASSWORD in the ignored .env.phase8a.session file or process environment.")

const withTimeout = (promise, label, timeoutMs = 35_000) => new Promise((resolvePromise, reject) => {
  const timeout = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs)
  promise.then(
    (result) => { clearTimeout(timeout); resolvePromise(result) },
    (error) => { clearTimeout(timeout); reject(error) },
  )
})

const waitFor = (predicate, label) => withTimeout(new Promise((resolvePromise) => {
  const check = () => {
    if (predicate()) resolvePromise()
    else setTimeout(check, 100)
  }
  check()
}), label)

const requireSuccess = (result, label) => {
  assert.equal(result.error, null, `${label}: ${result.error?.message}`)
  return result.data
}

const createRecord = async (client, table, payload, columns = "id") => {
  const data = requireSuccess(await client.from(table).insert(payload).select(columns).single(), `create ${table}`)
  return data
}

const config = await loadCloudTestConfig()
const clientOptions = { auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false } }
const adminClient = createClient(config.url, config.anonKey, clientOptions)
const publicClient = createClient(config.url, config.anonKey, clientOptions)
const { data: loginData, error: loginError } = await adminClient.auth.signInWithPassword({ email, password })
assert.equal(loginError, null, `Development SUPER_ADMIN login failed: ${loginError?.message}`)
assert.ok(loginData.user?.id, "Development login did not return a user")

const roles = requireSuccess(await adminClient.from("user_roles").select("role:roles(code)").eq("user_id", loginData.user.id), "SUPER_ADMIN role lookup")
assert.ok(roles.some((row) => row.role?.code === "SUPER_ADMIN"), "Development account is not a SUPER_ADMIN")

const suffix = randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()
const sourcePrefix = `PHASE8C-LIVE-${suffix}`
const departmentCode = `P8C_${suffix}`
const courseCode = `D8C${suffix.slice(0, 8)}`
const today = getCampusDateKey(new Date())
const dayOfWeek = getCampusDayOfWeek(new Date())
const currentClock = getCampusClockParts(new Date())
const currentMinutes = currentClock.hour * 60 + currentClock.minute
const classStart = currentMinutes < 12 * 60 ? "20:00:00" : "04:00:00"
const classEnd = currentMinutes < 12 * 60 ? "20:45:00" : "04:45:00"

const ids = {
  department: null,
  course: null,
  section: null,
  statusPerson: null,
  availabilityPerson: null,
  schedules: [],
  assignments: [],
  checkin: null,
  override: null,
}

const realtimeEvents = []
let realtimeReady = false
const stopRealtime = subscribeToAcademicPersonnelUpdates(
  adminClient,
  (event) => realtimeEvents.push(event),
  (status) => { if (status === "SUBSCRIBED") realtimeReady = true },
)

try {
  await waitFor(() => realtimeReady, "academic/personnel Realtime subscription")

  for (const [table, payload] of [
    ["class_schedules", { department_id: 1, course_id: 1, section_id: 1, personnel_id: 1, facility_id: "library", day_of_week: dayOfWeek, start_time: "13:00", end_time: "14:30", effective_from: today, status: "ACTIVE", created_by: loginData.user.id }],
    ["personnel_checkins", { department_id: 1, personnel_id: 1, facility_id: "library", source: "ADMIN", created_by: loginData.user.id }],
    ["personnel_availability_overrides", { department_id: 1, personnel_id: 1, starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 3_600_000).toISOString(), override_type: "UNAVAILABLE", created_by: loginData.user.id }],
  ]) {
    const result = await publicClient.from(table).insert(payload)
    assert.equal(result.error?.code, "42501", `Anonymous ${table} write unexpectedly succeeded`)
  }

  const department = await createRecord(adminClient, "departments", { code: departmentCode, name: `DEMO / DEVELOPMENT / NOT OFFICIAL — ${suffix}` }, "id, code")
  ids.department = department.id

  const statusPerson = await createRecord(adminClient, "personnel", {
    employee_reference: `${sourcePrefix}-STATUS-PERSON`,
    first_name: "Development",
    last_name: "Status Fixture",
    display_name: `DEMO / DEVELOPMENT / NOT OFFICIAL — Status ${suffix}`,
    department_id: ids.department,
    personnel_type: "FACULTY",
    public_visibility: true,
    active: true,
    verification_status: "DEMO_ONLY",
  }, "id, display_name, department_id, personnel_type, public_visibility, active, verification_status")
  ids.statusPerson = statusPerson.id

  const availabilityPerson = await createRecord(adminClient, "personnel", {
    employee_reference: `${sourcePrefix}-AVAILABILITY-PERSON`,
    first_name: "Development",
    last_name: "Availability Fixture",
    display_name: `DEMO / DEVELOPMENT / NOT OFFICIAL — Availability ${suffix}`,
    department_id: ids.department,
    personnel_type: "FACULTY",
    public_visibility: true,
    active: true,
    verification_status: "DEMO_ONLY",
  }, "id, display_name, department_id, personnel_type, public_visibility, active, verification_status")
  ids.availabilityPerson = availabilityPerson.id

  const course = await createRecord(adminClient, "courses", {
    code: courseCode,
    name: `DEMO / DEVELOPMENT / NOT OFFICIAL — ${suffix}`,
    department_id: ids.department,
    public_visibility: true,
    active: true,
    verification_status: "DEMO_ONLY",
  }, "id, code, name, department_id, public_visibility, active, verification_status")
  ids.course = course.id

  const section = await createRecord(adminClient, "academic_sections", {
    program: `DEV${suffix.slice(0, 4)}`,
    year_level: 1,
    section_name: "TEST",
    department_id: ids.department,
    public_visibility: true,
    active: true,
    verification_status: "DEMO_ONLY",
  }, "id, program, year_level, section_name, department_id, public_visibility, active, verification_status")
  ids.section = section.id

  const beforeClassSignal = realtimeEvents.length
  const statusSchedule = await createRecord(adminClient, "class_schedules", {
    department_id: ids.department,
    course_id: ids.course,
    section_id: ids.section,
    personnel_id: ids.statusPerson,
    facility_id: "library",
    day_of_week: dayOfWeek,
    start_time: classStart,
    end_time: classEnd,
    effective_from: today,
    effective_until: today,
    status: "ACTIVE",
    public_visibility: true,
    verification_status: "DEMO_ONLY",
    source_type: "DEVELOPMENT_TEST",
    source_id: `${sourcePrefix}-DASHBOARD-CLASS`,
    created_by: loginData.user.id,
  }, "id, department_id, course_id, section_id, personnel_id, facility_id, day_of_week, start_time, end_time, effective_from, effective_until, status, public_visibility, verification_status")
  ids.schedules.push(statusSchedule.id)
  await waitFor(() => realtimeEvents.slice(beforeClassSignal).some((event) => event.payload.new?.domain === "ACADEMIC"), "class schedule Realtime Dashboard refresh")

  const dashboard = createSupabaseDashboardProvider(publicClient, { now: new Date() })
  const dashboardClasses = await dashboard.getTodaysClasses()
  assert.ok(dashboardClasses.some((record) => record.courseCode === courseCode && record.relatedFacilityId === "library"), "Live class schedule did not reach the Dashboard provider")

  const beforeClassCancelSignal = realtimeEvents.length
  requireSuccess(await adminClient.from("class_schedules").update({ status: "CANCELLED" }).eq("id", statusSchedule.id).select("id, status").single(), "cancel live class schedule")
  await waitFor(() => realtimeEvents.slice(beforeClassCancelSignal).some((event) => event.payload.new?.domain === "ACADEMIC"), "class schedule cancellation Realtime Dashboard refresh")
  assert.equal((await dashboard.getTodaysClasses()).some((record) => record.courseCode === courseCode), false, "Cancelled class schedule remained in Today's Classes")

  const statusAssignment = await createRecord(adminClient, "personnel_facility_assignments", {
    department_id: ids.department,
    personnel_id: ids.statusPerson,
    facility_id: "virtual-laboratory",
    role_label: "DEMO / DEVELOPMENT / NOT OFFICIAL",
    day_of_week: dayOfWeek,
    start_time: "00:00:01",
    end_time: "23:59:59",
    effective_from: today,
    effective_until: today,
    public_visibility: true,
    active: true,
    verification_status: "DEMO_ONLY",
    source_type: "DEVELOPMENT_TEST",
    source_id: `${sourcePrefix}-STATUS-ASSIGNMENT`,
    created_by: loginData.user.id,
  }, "id, department_id, personnel_id, facility_id, day_of_week, start_time, end_time, effective_from, effective_until, public_visibility, active, verification_status")
  ids.assignments.push(statusAssignment.id)

  const personnelService = createPersonnelService(publicClient)
  const scheduledStatus = await personnelService.getPersonnelCurrentStatus(ids.statusPerson)
  assert.equal(scheduledStatus.status, "SCHEDULED", "Facility assignment did not produce schedule-derived SCHEDULED status")

  const beforeCheckinSignal = realtimeEvents.length
  const checkin = await createRecord(adminClient, "personnel_checkins", {
    department_id: ids.department,
    personnel_id: ids.statusPerson,
    facility_id: "computer-laboratory",
    checked_in_at: new Date(Date.now() - 60_000).toISOString(),
    status: "ACTIVE",
    source: "ADMIN",
    source_reference: "DEMO / DEVELOPMENT / NOT OFFICIAL",
    created_by: loginData.user.id,
  }, "id, department_id, personnel_id, facility_id, checked_in_at, status, source")
  ids.checkin = checkin.id
  await waitFor(() => realtimeEvents.slice(beforeCheckinSignal).some((event) => event.payload.new?.domain === "PERSONNEL"), "check-in Realtime Dashboard refresh")
  assert.equal((await personnelService.getPersonnelCurrentStatus(ids.statusPerson)).status, "CHECKED_IN", "Active trusted check-in did not produce CHECKED_IN")

  requireSuccess(await adminClient.from("personnel_checkins").update({ status: "CLOSED", checked_out_at: new Date().toISOString() }).eq("id", ids.checkin).select("id, status, checked_out_at").single(), "close trusted check-in")
  assert.equal((await personnelService.getPersonnelCurrentStatus(ids.statusPerson)).status, "SCHEDULED", "Closing the check-in did not restore the schedule-derived status")

  const activeOverride = await createRecord(adminClient, "personnel_availability_overrides", {
    department_id: ids.department,
    personnel_id: ids.statusPerson,
    starts_at: new Date(Date.now() - 60_000).toISOString(),
    ends_at: new Date(Date.now() + 3_600_000).toISOString(),
    override_type: "UNAVAILABLE",
    reason: "DEMO / DEVELOPMENT / NOT OFFICIAL",
    public_visibility: true,
    verification_status: "DEMO_ONLY",
    source_type: "DEVELOPMENT_TEST",
    source_id: `${sourcePrefix}-UNAVAILABLE`,
    created_by: loginData.user.id,
  }, "id, department_id, personnel_id, starts_at, ends_at, override_type, public_visibility, verification_status")
  ids.override = activeOverride.id
  assert.equal((await personnelService.getPersonnelCurrentStatus(ids.statusPerson)).status, "UNAVAILABLE", "UNAVAILABLE override did not take highest precedence")
  requireSuccess(await adminClient.from("personnel_availability_overrides").delete().eq("id", ids.override).select("id"), "remove live availability override")
  ids.override = null

  const availabilitySchedule = await createRecord(adminClient, "class_schedules", {
    department_id: ids.department,
    course_id: ids.course,
    section_id: ids.section,
    personnel_id: ids.availabilityPerson,
    facility_id: "library",
    day_of_week: dayOfWeek,
    start_time: "13:00:00",
    end_time: "14:30:00",
    effective_from: today,
    effective_until: today,
    status: "ACTIVE",
    public_visibility: true,
    verification_status: "DEMO_ONLY",
    source_type: "DEVELOPMENT_TEST",
    source_id: `${sourcePrefix}-AVAILABILITY-CLASS`,
    created_by: loginData.user.id,
  }, "id, department_id, course_id, section_id, personnel_id, facility_id, day_of_week, start_time, end_time, effective_from, effective_until, status, public_visibility, verification_status")
  ids.schedules.push(availabilitySchedule.id)

  const laterAssignment = await createRecord(adminClient, "personnel_facility_assignments", {
    department_id: ids.department,
    personnel_id: ids.availabilityPerson,
    facility_id: "virtual-laboratory",
    day_of_week: dayOfWeek,
    start_time: "16:00:00",
    end_time: "17:00:00",
    effective_from: today,
    effective_until: today,
    public_visibility: true,
    active: true,
    verification_status: "DEMO_ONLY",
    source_type: "DEVELOPMENT_TEST",
    source_id: `${sourcePrefix}-LATER-ASSIGNMENT`,
    created_by: loginData.user.id,
  }, "id, department_id, personnel_id, facility_id, day_of_week, start_time, end_time, effective_from, effective_until, public_visibility, active, verification_status")
  ids.assignments.push(laterAssignment.id)

  const controlledAt = new Date(`${today}T13:30:00+08:00`)
  const firstWindow = await personnelService.getPersonnelNextAvailability(ids.availabilityPerson, { at: controlledAt, days: 1 })
  assert.equal(firstWindow.startAt, new Date(`${today}T14:30:00+08:00`).toISOString())
  assert.equal(firstWindow.endAt, new Date(`${today}T16:00:00+08:00`).toISOString())

  const overlapAssignment = await createRecord(adminClient, "personnel_facility_assignments", {
    department_id: ids.department,
    personnel_id: ids.availabilityPerson,
    facility_id: "computer-laboratory",
    day_of_week: dayOfWeek,
    start_time: "14:00:00",
    end_time: "17:00:00",
    effective_from: today,
    effective_until: today,
    public_visibility: true,
    active: true,
    verification_status: "DEMO_ONLY",
    source_type: "DEVELOPMENT_TEST",
    source_id: `${sourcePrefix}-OVERLAP-ASSIGNMENT`,
    created_by: loginData.user.id,
  }, "id, department_id, personnel_id, facility_id, day_of_week, start_time, end_time, effective_from, effective_until, public_visibility, active, verification_status")
  ids.assignments.push(overlapAssignment.id)
  const overlapWindow = await personnelService.getPersonnelNextAvailability(ids.availabilityPerson, { at: controlledAt, days: 1 })
  assert.equal(overlapWindow.startAt, new Date(`${today}T17:00:00+08:00`).toISOString(), "Overlapping assignment left a false availability window")

  const publicPersonnel = requireSuccess(await publicClient.from("public_personnel").select("id, display_name").in("id", [ids.statusPerson, ids.availabilityPerson]), "public personnel read")
  assert.equal(publicPersonnel.length, 2, "Approved public personnel projections were not readable")
  const sensitiveRead = await publicClient.from("personnel").select("employee_reference").eq("id", ids.statusPerson)
  assert.equal(sensitiveRead.error?.code, "42501", "Anonymous user unexpectedly read employee_reference")

  const auditRows = requireSuccess(await adminClient.from("audit_logs").select("action, entity_type, entity_id").in("entity_id", [statusSchedule.id, ids.checkin]), "Phase 8C.1 audit read")
  assert.ok(auditRows.some((row) => row.entity_type === "class_schedule" && row.entity_id === statusSchedule.id), "Class schedule audit entry was not recorded")
  assert.ok(auditRows.some((row) => row.entity_type === "personnel_checkin" && row.entity_id === ids.checkin && row.action === "personnel_checkin_closed"), "Check-in close audit entry was not recorded")
} finally {
  stopRealtime()
  if (ids.override) await adminClient.from("personnel_availability_overrides").delete().eq("id", ids.override)
  if (ids.checkin) await adminClient.from("personnel_checkins").delete().eq("id", ids.checkin)
  if (ids.assignments.length) await adminClient.from("personnel_facility_assignments").delete().in("id", ids.assignments)
  if (ids.schedules.length) await adminClient.from("class_schedules").delete().in("id", ids.schedules)
  if (ids.section) await adminClient.from("academic_sections").delete().eq("id", ids.section)
  if (ids.course) await adminClient.from("courses").delete().eq("id", ids.course)
  if (ids.statusPerson || ids.availabilityPerson) await adminClient.from("personnel").delete().in("id", [ids.statusPerson, ids.availabilityPerson].filter(Boolean))
  if (ids.department) await adminClient.from("departments").delete().eq("id", ids.department)
}

await new Promise((resolvePromise) => setTimeout(resolvePromise, 500))
assert.equal(adminClient.getChannels().length, 0, "Authenticated academic/personnel Realtime channel was not cleaned up")

for (const [table, idsToCheck] of [
  ["class_schedules", ids.schedules],
  ["personnel_facility_assignments", ids.assignments],
  ["personnel_checkins", [ids.checkin].filter(Boolean)],
]) {
  if (!idsToCheck.length) continue
  const remaining = requireSuccess(await adminClient.from(table).select("id").in("id", idsToCheck), `${table} cleanup verification`)
  assert.equal(remaining.length, 0, `${table} development fixtures remain after cleanup`)
}

const { error: signOutError } = await adminClient.auth.signOut()
assert.equal(signOutError, null, `Phase 8C.1 test sign-out failed: ${signOutError?.message}`)

console.log("LIVE CLOUD TEST: Phase 8C.1 SUPER_ADMIN schedule/personnel writes, public projection privacy, anonymous write rejection, class Dashboard insert/cancel data, SCHEDULED→CHECKED_IN→SCHEDULED state transitions, UNAVAILABLE precedence, authenticated Realtime refresh, next-availability overlap safety, trusted audit entries, channel cleanup, fixture cleanup, and sign-out: PASS")
process.exit(0)
