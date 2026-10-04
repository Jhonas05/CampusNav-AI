import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import {
  FACILITY_ADMIN_LIFECYCLES,
  FACILITY_ADMIN_RESOURCES,
  createFacilityAdminService,
  normalizeFacilityAdminDatabaseError,
  validateFacilityAdminRecord,
} from "../src/services/facilityAdminService.js"
import { ADVISORY_TYPES, createSupabaseAdminService, toAdminError } from "../src/services/adminService.js"

const projectRoot = new URL("..", import.meta.url)
const readProjectFile = (path) => readFile(new URL(path, projectRoot), "utf8")
const UPDATED_AT = "2026-10-03T04:00:00.000Z"
const common = {
  lifecycle: "DRAFT",
  public_visibility: false,
  published_at: "",
  effective_at: "",
  expires_at: "",
  verification_status: "PENDING_VERIFICATION",
  data_status: "PENDING_VERIFICATION",
  source_type: "ADMIN_CMS",
  source_id: "",
  source_label: "",
  last_verified_at: "",
}

const profileInput = {
  facility_id: "library",
  department_id: "",
  description: "  Development profile  ",
  public_contact_name: "",
  public_contact_email: "",
  public_contact_phone: "",
  ...common,
}
const serviceInput = {
  code: "student-records",
  name: "Student Records",
  description: "Development-only service definition.",
  department_id: "",
  ...common,
}
const aliasInput = { service_id: 1, alias: "  Records request  ", ...common }
const mappingInput = { facility_id: "library", service_id: 1, recommendation_rank: 125, public_notes: "Development mapping.", ...common }
const hoursInput = { facility_id: "library", day_of_week: 1, closed_all_day: false, start_time: "22:00", end_time: "02:00", ...common }
const exceptionInput = { facility_id: "library", exception_date: "2026-10-05", closed_all_day: true, start_time: "", end_time: "", ...common }

const profile = validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.PROFILES, profileInput)
assert.equal(profile.facility_id, "library")
assert.equal(profile.description, "Development profile")
assert.equal(profile.public_contact_email, null)
assert.deepEqual(Object.keys(profile).toSorted(), [
  "data_status", "department_id", "description", "effective_at", "expires_at", "facility_id", "last_verified_at",
  "lifecycle", "public_contact_email", "public_contact_name", "public_contact_phone", "public_visibility",
  "published_at", "source_id", "source_label", "source_type", "verification_status",
].toSorted(), "profile payload is allowlisted")

for (const field of ["floor", "geometry", "coordinates", "map_position", "nodes", "edges", "routing", "qr", "emergency_relationships", "created_by", "updated_by", "audit_log_id"]) {
  assert.throws(
    () => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.PROFILES, { ...profileInput, [field]: "forbidden" }),
    /Unsupported or immutable field/,
    `${field} must be rejected`,
  )
}
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.PROFILES, { ...profileInput, facility_id: "invented-room" }), /canonical CampusNav facility/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.PROFILES, { ...profile, facility_id: "registrars-office" }, { operation: "update" }), /immutable field/)

const serviceRecord = validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.SERVICES, serviceInput)
assert.equal(serviceRecord.code, "student-records")
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.SERVICES, { ...serviceInput, code: "Student Records" }), /lowercase kebab-case/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.SERVICES, { ...serviceRecord, code: "changed-code" }, { operation: "update" }), /immutable field/)

const alias = validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.ALIASES, aliasInput)
assert.equal(alias.alias, "Records request")
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.ALIASES, { ...aliasInput, alias: "  " }), /Alias is required/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.ALIASES, { ...alias, service_id: 2 }, { operation: "update" }), /immutable field/)

const mapping = validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.MAPPINGS, mappingInput)
assert.equal(mapping.recommendation_rank, 125)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.MAPPINGS, { ...mappingInput, facility_id: "not-canonical" }), /canonical CampusNav facility/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.MAPPINGS, { ...mappingInput, service_id: 0 }), /Service is invalid/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.MAPPINGS, { ...mappingInput, recommendation_rank: 1001 }), /Recommendation rank is invalid/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.MAPPINGS, { ...mapping, facility_id: "library", service_id: 2 }, { operation: "update" }), /immutable field/)

const overnight = validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.HOURS, hoursInput)
assert.equal(overnight.day_of_week, 1)
assert.equal(overnight.start_time, "22:00:00")
assert.equal(overnight.end_time, "02:00:00", "overnight intervals remain legal")
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.HOURS, { ...hoursInput, day_of_week: 7 }), /Weekday must be between 0 and 6/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.HOURS, { ...hoursInput, closed_all_day: true }), /cannot include start or end/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.HOURS, { ...hoursInput, end_time: "" }), /require both start and end/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.HOURS, { ...overnight, facility_id: "library" }, { operation: "update" }), /immutable field/)

const exception = validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.EXCEPTIONS, exceptionInput)
assert.equal(exception.exception_date, "2026-10-05")
assert.equal(exception.closed_all_day, true)
assert.equal(exception.start_time, null)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.EXCEPTIONS, { ...exceptionInput, exception_date: "2026-02-30" }), /valid YYYY-MM-DD/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.EXCEPTIONS, { ...exceptionInput, closed_all_day: false }), /require both start and end/)

for (const lifecycle of FACILITY_ADMIN_LIFECYCLES) {
  const lifecycleInput = {
    ...serviceInput,
    lifecycle,
    effective_at: lifecycle === "SCHEDULED" ? "2026-10-04T08:00:00+08:00" : "",
    public_visibility: lifecycle === "PUBLISHED",
    published_at: lifecycle === "PUBLISHED" ? "2026-10-03T08:00:00+08:00" : "",
  }
  assert.equal(validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.SERVICES, lifecycleInput).lifecycle, lifecycle)
}
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.SERVICES, { ...serviceInput, lifecycle: "SCHEDULED" }), /effective time is required/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.SERVICES, { ...serviceInput, lifecycle: "PUBLISHED" }), (error) => error.code === "PUBLISH_VALIDATION_FAILED")
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.SERVICES, { ...serviceInput, public_visibility: true }), /Only published records/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.SERVICES, { ...serviceInput, effective_at: "2026-10-04T08:00:00+08:00", expires_at: "2026-10-04T07:00:00+08:00" }), /Expiration must be later/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.SERVICES, { ...serviceInput, data_status: "ACTIVE" }), /trusted verification/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.SERVICES, { ...serviceInput, verification_status: "DEMO_ONLY" }), /used together/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.SERVICES, { ...serviceInput, data_status: "DEMO" }), /used together/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.SERVICES, { ...serviceInput, verification_status: "VERIFIED", data_status: "ACTIVE" }), /last-verified time/)
const verified = validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.SERVICES, {
  ...serviceInput,
  verification_status: "VERIFIED",
  data_status: "ACTIVE",
  last_verified_at: "2026-10-03T08:00:00+08:00",
  source_id: "  SCC-OPS-1  ",
})
assert.equal(verified.source_id, "SCC-OPS-1")
assert.equal(verified.last_verified_at, "2026-10-03T00:00:00.000Z")

assert.equal(normalizeFacilityAdminDatabaseError({ code: "23505", constraint: "services_code_key" }).code, "DUPLICATE_SERVICE_CODE")
assert.equal(normalizeFacilityAdminDatabaseError({ code: "23505", constraint: "service_aliases_service_alias_unique_idx" }).code, "DUPLICATE_ALIAS")
assert.equal(normalizeFacilityAdminDatabaseError({ code: "23505", constraint: "facility_service_mappings_unique" }).code, "DUPLICATE_MAPPING")
assert.equal(normalizeFacilityAdminDatabaseError({ code: "23P01", constraint: "facility_hours_active_schedule_exclusion" }).code, "HOURS_OVERLAP")
assert.equal(normalizeFacilityAdminDatabaseError({ code: "23P01", constraint: "facility_hour_exceptions_active_schedule_exclusion", details: "closed_all_day marker" }).code, "CLOSED_MARKER_CONFLICT")
assert.equal(toAdminError({ code: "42501", message: "row-level security" }).code, "PERMISSION_DENIED")
assert.equal(toAdminError({ status: 401, message: "JWT expired" }).code, "SESSION_EXPIRED")
const networkError = toAdminError({ message: "Failed to fetch https://secret.example.test?token=do-not-leak" })
assert.equal(networkError.code, "NETWORK_ERROR")
assert.doesNotMatch(networkError.message, /secret|token|example\.test/i)
assert.doesNotMatch(JSON.stringify(networkError), /secret|token|example\.test/i, "raw causes are non-enumerable")

const createQueuedClient = (responses) => {
  const queue = [...responses]
  const calls = []
  const terminal = () => Promise.resolve(queue.shift() || { data: null, error: null })
  const from = (table) => {
    const call = { table, operation: "select", payload: null, filters: [] }
    calls.push(call)
    const query = {
      select(columns) { call.columns = columns; return query },
      insert(payload) { call.operation = "insert"; call.payload = payload; return query },
      update(payload) { call.operation = "update"; call.payload = payload; return query },
      delete() { call.operation = "delete"; return query },
      eq(column, value) { call.filters.push([column, value]); return query },
      order() { return query },
      limit() { return query },
      single: terminal,
      maybeSingle: terminal,
      then(resolve, reject) { return terminal().then(resolve, reject) },
    }
    return query
  }
  return { client: { from }, calls }
}

const createdRow = { id: 5, ...profile, created_at: UPDATED_AT, updated_at: UPDATED_AT }
const createMock = createQueuedClient([{ data: createdRow, error: null }])
const createService = createFacilityAdminService(createMock.client)
assert.deepEqual(createService.listCanonicalFacilities()[0], {
  id: "theater",
  name: "Theater",
  floor: "GF",
  category: "Facility",
}, "canonical Admin references map local floorId/kind into the accepted floor/category contract")
assert.deepEqual(await createService.createFacilityOperationalProfile(profileInput), createdRow)
assert.equal(createMock.calls[0].table, "facility_operational_profiles")
assert.equal(createMock.calls[0].operation, "insert")
assert.equal(Object.hasOwn(createMock.calls[0].payload, "created_by"), false)

const missingServiceMock = createQueuedClient([{ data: null, error: null }])
await assert.rejects(
  () => createFacilityAdminService(missingServiceMock.client).createFacilityServiceMapping(mappingInput),
  (error) => error.code === "NOT_FOUND" && /selected service/.test(error.message),
)
assert.equal(missingServiceMock.calls.some((call) => call.operation === "insert"), false, "missing service references are rejected before insert")

const publishRow = { id: 7, ...serviceRecord, updated_at: UPDATED_AT }
const publishedRow = {
  ...publishRow,
  lifecycle: "PUBLISHED",
  public_visibility: true,
  published_at: "2026-10-03T04:30:00.000Z",
  updated_at: "2026-10-03T04:30:00.000Z",
}
const publishMock = createQueuedClient([
  { data: publishRow, error: null },
  { data: publishRow, error: null },
  { data: publishedRow, error: null },
])
const publishService = createFacilityAdminService(publishMock.client, { clock: () => new Date("2026-10-03T04:30:00.000Z") })
assert.deepEqual(await publishService.publishFacilityAdminServiceRecord(7, { expectedUpdatedAt: UPDATED_AT }), publishedRow)
const publishCall = publishMock.calls.find((call) => call.operation === "update")
assert.equal(publishCall.payload.lifecycle, "PUBLISHED")
assert.equal(publishCall.payload.public_visibility, true)
assert.equal(publishCall.payload.published_at, "2026-10-03T04:30:00.000Z")

const staleMock = createQueuedClient([{ data: { id: 5, ...profile, updated_at: "2026-10-03T05:00:00.000Z" }, error: null }])
await assert.rejects(
  () => createFacilityAdminService(staleMock.client).updateFacilityOperationalProfile(5, { description: "New value" }, { expectedUpdatedAt: UPDATED_AT }),
  (error) => error.code === "STALE_RECORD",
)
assert.equal(staleMock.calls.some((call) => call.operation === "update"), false, "stale updates do not write")

const deleteBlockedMock = createQueuedClient([{ data: { id: 8, ...serviceRecord, lifecycle: "PUBLISHED", updated_at: UPDATED_AT }, error: null }])
await assert.rejects(
  () => createFacilityAdminService(deleteBlockedMock.client).deleteFacilityAdminServiceRecord(8, { expectedUpdatedAt: UPDATED_AT }),
  (error) => error.code === "DELETE_NOT_ALLOWED",
)
assert.equal(deleteBlockedMock.calls.some((call) => call.operation === "delete"), false, "published records are not hard-deleted")

const deleteAllowedMock = createQueuedClient([
  { data: { id: 9, ...alias, updated_at: UPDATED_AT }, error: null },
  { data: { id: 9 }, error: null },
])
assert.deepEqual(
  await createFacilityAdminService(deleteAllowedMock.client).deleteServiceAlias(9, { expectedUpdatedAt: UPDATED_AT }),
  { id: 9 },
)
assert.equal(deleteAllowedMock.calls.at(-1).operation, "delete")

const composed = createSupabaseAdminService({})
for (const method of [
  "loadFacilityAdminReferences",
  "listFacilityOperationalProfiles", "createFacilityOperationalProfile", "updateFacilityOperationalProfile", "publishFacilityOperationalProfile", "expireFacilityOperationalProfile", "deleteFacilityOperationalProfile",
  "listFacilityAdminServices", "createFacilityAdminServiceRecord", "updateFacilityAdminServiceRecord", "publishFacilityAdminServiceRecord", "expireFacilityAdminServiceRecord", "deleteFacilityAdminServiceRecord",
  "listServiceAliases", "createServiceAlias", "updateServiceAlias", "publishServiceAlias", "expireServiceAlias", "deleteServiceAlias",
  "listFacilityServiceMappings", "createFacilityServiceMapping", "updateFacilityServiceMapping", "publishFacilityServiceMapping", "expireFacilityServiceMapping", "deleteFacilityServiceMapping",
  "listFacilityHours", "createFacilityHours", "updateFacilityHours", "publishFacilityHours", "expireFacilityHours", "deleteFacilityHours",
  "listFacilityHourExceptions", "createFacilityHourException", "updateFacilityHourException", "publishFacilityHourException", "expireFacilityHourException", "deleteFacilityHourException",
]) assert.equal(typeof composed[method], "function", `${method} must be composed into AdminService`)
for (const existingAdvisoryMethod of ["listFacilityAdvisories", "createFacilityAdvisory", "updateFacilityAdvisory", "deleteFacilityAdvisory"]) {
  assert.equal(typeof composed[existingAdvisoryMethod], "function", `${existingAdvisoryMethod} remains reused`)
}
assert.ok(ADVISORY_TYPES.includes("TEMPORARY_CLOSURE"))
assert.ok(ADVISORY_TYPES.includes("SERVICE_INTERRUPTION"))
assert.notEqual("TEMPORARY_CLOSURE", "SERVICE_INTERRUPTION")

assert.throws(() => createFacilityAdminService(null), (error) => error.code === "BACKEND_UNAVAILABLE")

const [facilityAdminSource, adminSource, facilityServiceSource, appSource, packageSource] = await Promise.all([
  readProjectFile("src/services/facilityAdminService.js"),
  readProjectFile("src/services/adminService.js"),
  readProjectFile("src/services/facilityService.js"),
  readProjectFile("src/App.jsx"),
  readProjectFile("package.json"),
])
assert.doesNotMatch(facilityAdminSource, /getSupabaseClient|service[_-]?role|secret[_-]?key|VITE_|\.rpc\(/i, "facility mutations use only an injected browser-safe client")
assert.doesNotMatch(facilityAdminSource, /\.from\(["']audit_logs["']\).*\.(?:insert|update|delete)/is, "facility Admin cannot forge audit rows")
assert.doesNotMatch(facilityAdminSource, /facility_advisories/, "FS-3A does not duplicate advisory mutations")
assert.doesNotMatch(appSource, /\/admin\/(?:facility-hours|facility-hour-exceptions)/, "later hours and exception Admin routes remain absent")
assert.match(packageSource, /test:phase4-fs3a/)
for (const method of ["getFacilityHours", "getFacilityStatus", "getFacilitiesByService", "getServices"]) assert.match(facilityServiceSource, new RegExp(method))
assert.match(adminSource, /createFacilityAdminService/)

console.log("Phase 4-FS-3A Admin mutation service, validation, stale-write, delete-safety, error, advisory-reuse, and boundary checks: PASS")
