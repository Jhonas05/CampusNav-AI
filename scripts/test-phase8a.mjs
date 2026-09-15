import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import {
  APP_ROLES,
  canManageEmergencyData,
  canManageFacilities,
  canManageSchedules,
  canPublishAnnouncements,
  hasAnyRole,
  hasRole,
} from "../src/lib/authorization.js"
import { canAccessProtectedRoute } from "../src/lib/routeAuthorization.js"
import { BACKEND_MODES, createSupabaseClientLoader, resolveSupabaseConfig } from "../src/lib/supabaseClient.js"
import { createLocalAuthProvider } from "../src/providers/auth/localAuthProvider.js"
import { createSupabaseAuthProvider, toPublicAuthError } from "../src/providers/auth/supabaseAuthProvider.js"
import { createLocalDashboardProvider } from "../src/providers/dashboard/localDashboardProvider.js"
import { createSupabaseDashboardProvider } from "../src/providers/dashboard/supabaseDashboardProvider.js"
import { loadDashboardSnapshot } from "../src/services/dashboardService.js"
import { subscribeToTable } from "../src/services/realtimeService.js"

const projectRoot = new URL("..", import.meta.url)
const readProjectFile = (path) => readFile(new URL(path, projectRoot), "utf8")

const missingConfig = resolveSupabaseConfig({})
assert.equal(missingConfig.configured, false)
assert.equal(missingConfig.mode, BACKEND_MODES.LOCAL)
assert.equal(resolveSupabaseConfig({ VITE_SUPABASE_URL: "https://example.supabase.co", VITE_SUPABASE_ANON_KEY: "sb_secret_do-not-use" }).reason, "UNSAFE_FRONTEND_KEY")
const serviceRolePayload = Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")
assert.equal(resolveSupabaseConfig({ VITE_SUPABASE_URL: "https://example.supabase.co", VITE_SUPABASE_ANON_KEY: `header.${serviceRolePayload}.signature` }).reason, "UNSAFE_FRONTEND_KEY")
assert.equal(resolveSupabaseConfig({ VITE_SUPABASE_URL: "file:///tmp", VITE_SUPABASE_ANON_KEY: "public-key" }).reason, "INVALID_URL")

let importCount = 0
const loadConfiguredClient = createSupabaseClientLoader({
  env: { VITE_SUPABASE_URL: "https://example.supabase.co", VITE_SUPABASE_ANON_KEY: "public-anon-key" },
  importer: async () => {
    importCount += 1
    return { createClient: (url, key, options) => ({ url, key, options }) }
  },
})
const configuredClient = await loadConfiguredClient()
assert.equal(configuredClient.url, "https://example.supabase.co")
assert.equal(configuredClient.options.auth.persistSession, true)
assert.equal(await loadConfiguredClient(), configuredClient)
assert.equal(importCount, 1)
assert.equal(await createSupabaseClientLoader({ env: {}, importer: async () => assert.fail("Unconfigured mode must not import Supabase") })(), null)

const managerRoles = [{ code: APP_ROLES.FACILITY_MANAGER }]
assert.equal(hasRole(managerRoles, APP_ROLES.FACILITY_MANAGER), true)
assert.equal(hasAnyRole(managerRoles, [APP_ROLES.STAFF, APP_ROLES.FACILITY_MANAGER]), true)
assert.equal(canManageFacilities(managerRoles), true)
assert.equal(canManageSchedules(managerRoles), false)
assert.equal(canPublishAnnouncements([APP_ROLES.DEPARTMENT_ADMIN]), true)
assert.equal(canManageEmergencyData([APP_ROLES.DEPARTMENT_ADMIN]), false)
assert.equal(canManageEmergencyData([APP_ROLES.SUPER_ADMIN]), true)
assert.equal(canAccessProtectedRoute({ isAuthenticated: false }), false)
assert.equal(canAccessProtectedRoute({ isAuthenticated: true }), true)
assert.equal(canAccessProtectedRoute({ isAuthenticated: true, roles: managerRoles, requiredRoles: [APP_ROLES.SUPER_ADMIN] }), false)
assert.equal(canAccessProtectedRoute({ isAuthenticated: true, roles: managerRoles, requiredRoles: [APP_ROLES.FACILITY_MANAGER] }), true)

const localAuth = createLocalAuthProvider()
assert.deepEqual(await localAuth.getInitialState(), { user: null, profile: null, roles: [], isAuthenticated: false })
await assert.rejects(localAuth.signIn(), (error) => error.code === "SUPABASE_NOT_CONFIGURED")
assert.deepEqual(await localAuth.signOut(), { user: null, profile: null, roles: [], isAuthenticated: false })

const authUser = { id: "00000000-0000-0000-0000-000000000011", email: "developer@example.test" }
let authCallback = null
let authUnsubscribed = 0
let authSignOuts = 0
const authClient = {
  auth: {
    getSession: async () => ({ data: { session: { user: authUser } }, error: null }),
    signInWithPassword: async () => ({ data: { user: authUser }, error: null }),
    signOut: async () => { authSignOuts += 1; return { error: null } },
    onAuthStateChange: (callback) => {
      authCallback = callback
      return { data: { subscription: { unsubscribe: () => { authUnsubscribed += 1 } } } }
    },
  },
  from(table) {
    const result = table === "profiles"
      ? { data: { id: authUser.id, display_name: "Development User", status: "ACTIVE" }, error: null }
      : { data: [{ department_id: 7, role: { code: "DEPARTMENT_ADMIN" } }], error: null }
    const query = {
      select: () => query,
      eq: () => query,
      maybeSingle: async () => result,
      then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
    }
    return query
  },
}
const supabaseAuth = createSupabaseAuthProvider(authClient)
const initialAuth = await supabaseAuth.getInitialState()
assert.equal(initialAuth.isAuthenticated, true)
assert.equal(initialAuth.profile.display_name, "Development User")
assert.deepEqual(initialAuth.roles, [{ code: "DEPARTMENT_ADMIN", departmentId: 7 }])
assert.equal((await supabaseAuth.signIn({ email: authUser.email, password: "not-a-real-password" })).isAuthenticated, true)
assert.deepEqual(await supabaseAuth.signOut(), { user: null, profile: null, roles: [], isAuthenticated: false })
assert.equal(authSignOuts, 1)
let observedAuthState = null
const unsubscribeAuth = supabaseAuth.subscribe((state) => { observedAuthState = state })
authCallback("SIGNED_OUT", null)
await Promise.resolve()
assert.equal(observedAuthState.isAuthenticated, false)
unsubscribeAuth()
authCallback("SIGNED_IN", { user: authUser })
await Promise.resolve()
assert.equal(authUnsubscribed, 1)
assert.equal(observedAuthState.isAuthenticated, false)
assert.equal(toPublicAuthError({ message: "Invalid login credentials" }).code, "INVALID_LOGIN")
assert.equal(toPublicAuthError({ message: "Failed to fetch" }).code, "NETWORK_ERROR")
assert.equal(toPublicAuthError({ code: "42501", message: "row-level security" }).code, "PERMISSION_DENIED")

const dashboardMethods = [
  "getDashboardSummary",
  "getPriorityAlerts",
  "getTodaysClasses",
  "getOfficeAvailability",
  "getPersonnelAvailability",
  "getFacilityAdvisories",
  "getUpcomingEvents",
  "getGeneralAnnouncements",
  "getNavigationNotices",
]
const localDashboard = createLocalDashboardProvider()
assert.equal(localDashboard.mode, "LOCAL_PROTOTYPE")
dashboardMethods.forEach((method) => assert.equal(typeof localDashboard[method], "function"))
assert.deepEqual(localDashboard.getTodaysClasses(), [])
assert.deepEqual(localDashboard.getPersonnelAvailability(), [])

const publishedAt = "2026-09-14T02:00:00.000Z"
const effectiveAt = "2026-09-14T02:00:00.000Z"
const expiresAt = "2026-09-15T02:00:00.000Z"
const commonRow = { priority: "IMPORTANT", lifecycle: "PUBLISHED", is_public: true, published_at: publishedAt, effective_at: effectiveAt, expires_at: expiresAt, source_type: "DEVELOPMENT_TEST", verification_status: "DEMO_ONLY", data_status: "DEMO" }
const tableRows = {
  notifications: [
    { ...commonRow, id: 1, title: "Development notice", message: "Not official", category: "GENERAL" },
    { ...commonRow, id: 2, title: "Development navigation notice", message: "Not official", category: "NAVIGATION" },
  ],
  facility_advisories: [{ ...commonRow, id: 3, title: "Development advisory", message: "Not official", advisory_type: "MAINTENANCE", related_facility_id: "library" }],
  announcements: [{ ...commonRow, id: 4, title: "Development announcement", message: "Not official", category: "GENERAL" }],
  events: [{ ...commonRow, id: 5, title: "Development event", description: "Not official", starts_at: "2026-09-15T02:00:00.000Z", ends_at: "2026-09-15T03:00:00.000Z" }],
  public_personnel: [],
  public_class_schedules: [],
  public_schedule_exceptions: [],
  public_personnel_facility_assignments: [],
  public_personnel_consultation_hours: [],
  active_personnel_checkins: [],
  public_personnel_availability_overrides: [],
}
const dashboardClient = {
  from(table) {
    let rows = [...tableRows[table]]
    const query = {
      select: () => query,
      eq: (column, value) => { rows = rows.filter((row) => row[column] === value); return query },
      order: () => query,
      then: (resolve, reject) => Promise.resolve({ data: rows, error: null }).then(resolve, reject),
    }
    return query
  },
}
const supabaseDashboard = createSupabaseDashboardProvider(dashboardClient, { now: new Date("2026-09-14T04:00:00.000Z") })
dashboardMethods.forEach((method) => assert.equal(typeof supabaseDashboard[method], "function"))
assert.equal((await supabaseDashboard.getPriorityAlerts()).length, 1)
assert.equal((await supabaseDashboard.getNavigationNotices()).length, 1)
assert.deepEqual(await supabaseDashboard.getTodaysClasses(), [])
assert.deepEqual(await supabaseDashboard.getPersonnelAvailability(), [])
assert.equal((await supabaseDashboard.getUpcomingEvents()).upcoming.length, 1)

const originalWarn = console.warn
console.warn = () => {}
try {
  const fallback = await loadDashboardSnapshot(
    { now: new Date("2026-09-14T04:00:00.000Z") },
    { availability: { configured: true }, clientLoader: async () => { throw new Error("offline") } },
  )
  assert.equal(fallback.status.label, "Supabase Offline / Fallback")
  assert.ok(fallback.navigationNotices.length > 0)
} finally {
  console.warn = originalWarn
}

let realtimeHandler = null
let realtimeStatus = null
let removedChannels = 0
const realtimeClient = {
  channel: () => {
    const channel = {
      on: (_type, _filter, handler) => { realtimeHandler = handler; return channel },
      subscribe: (handler) => { realtimeStatus = handler; return channel },
    }
    return channel
  },
  removeChannel: () => { removedChannels += 1 },
}
let realtimeEvents = 0
let subscribed = false
const stopRealtime = subscribeToTable(realtimeClient, { table: "announcements", onChange: () => { realtimeEvents += 1 }, onStatus: (status) => { subscribed = status === "SUBSCRIBED" } })
realtimeStatus("SUBSCRIBED")
assert.equal(subscribed, true)
const realtimePayload = { eventType: "UPDATE", commit_timestamp: "2026-09-14T04:00:00Z", new: { id: 4, updated_at: "2026-09-14T04:00:00Z" } }
realtimeHandler(realtimePayload)
realtimeHandler(realtimePayload)
assert.equal(realtimeEvents, 1)
stopRealtime()
stopRealtime()
realtimeHandler({ ...realtimePayload, commit_timestamp: "2026-09-14T04:01:00Z", new: { id: 4, updated_at: "2026-09-14T04:01:00Z" } })
assert.equal(realtimeEvents, 1)
assert.equal(removedChannels, 1)

const migration = await readProjectFile("supabase/migrations/20260914151900_phase_8a_backend_foundation.sql")
for (const table of ["profiles", "roles", "user_roles", "departments", "announcements", "events", "facility_advisories", "notifications", "audiences"]) {
  assert.match(migration, new RegExp(`create table public\\.${table}\\s*\\(`, "i"))
}
for (const table of ["profiles", "user_roles", "announcements", "events", "facility_advisories", "notifications"]) {
  assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, "i"))
}
for (const role of Object.values(APP_ROLES)) assert.match(migration, new RegExp(`'${role}'`))
assert.match(migration, /lifecycle = 'PUBLISHED'/)
assert.match(migration, /expires_at is null or expires_at > now\(\)/)
assert.match(migration, /notifications_insert_managers/)
assert.match(migration, /created_by = \(select auth\.uid\(\)\)/)
assert.match(migration, /alter publication supabase_realtime add table/)
assert.doesNotMatch(migration, /revoke all on all tables in schema public/)
assert.doesNotMatch(migration, /service[_-]?role/i)

const envExample = await readProjectFile(".env.example")
assert.match(envExample, /^VITE_SUPABASE_URL=/m)
assert.match(envExample, /^VITE_SUPABASE_ANON_KEY=/m)
assert.doesNotMatch(envExample, /^VITE_SUPABASE_SERVICE_ROLE_KEY=/m)
const packageJson = JSON.parse(await readProjectFile("package.json"))
assert.equal(packageJson.dependencies["@supabase/supabase-js"], "2.109.0")

console.log("Phase 8A client, auth, RBAC, provider fallback, Realtime lifecycle, and security-structure tests: PASS")
