import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { loadCloudTestConfig } from "./phase8a-cloud-env.mjs"
import { createSupabaseAuthProvider } from "../src/providers/auth/supabaseAuthProvider.js"
import { APP_ROLES, hasRole } from "../src/lib/authorization.js"
import { canAccessProtectedRoute } from "../src/lib/routeAuthorization.js"
import { subscribeToDashboardUpdates } from "../src/services/realtimeService.js"

const email = String(process.env.CAMPUSNAV_TEST_EMAIL || "").trim()
const password = String(process.env.CAMPUSNAV_TEST_PASSWORD || "")

if (!email || !password) {
  throw new Error("Set CAMPUSNAV_TEST_EMAIL and CAMPUSNAV_TEST_PASSWORD for a non-personal development Auth user. Credentials are never read from repository files.")
}

const config = await loadCloudTestConfig()
const values = new Map()
const storage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
}
const clientOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: true,
    storage,
  },
}

const withTimeout = (promise, label, timeoutMs = 45_000) => new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs)
  promise.then(
    (value) => { clearTimeout(timeout); resolve(value) },
    (error) => { clearTimeout(timeout); reject(error) },
  )
})

const firstClient = createClient(config.url, config.anonKey, clientOptions)
const firstProvider = createSupabaseAuthProvider(firstClient)

let invalidLoginError = null
try {
  await firstProvider.signIn({ email, password: `${password}-invalid` })
} catch (error) {
  invalidLoginError = error
}
assert.equal(invalidLoginError?.code, "INVALID_LOGIN", "Invalid credentials were not converted to the safe public error")
assert.equal(invalidLoginError?.message, "The email or password is incorrect.")

const signedInState = await firstProvider.signIn({ email, password })
assert.equal(signedInState.isAuthenticated, true)
assert.equal(signedInState.user?.email?.toLowerCase(), email.toLowerCase())
assert.ok(signedInState.profile, "The Auth user does not have a public profile row")
assert.ok(signedInState.roles.some((role) => role.code === "SUPER_ADMIN"), "The development Auth user is not bootstrapped as SUPER_ADMIN")
assert.equal(hasRole(signedInState.roles, APP_ROLES.SUPER_ADMIN), true)
assert.equal(canAccessProtectedRoute({ isAuthenticated: signedInState.isAuthenticated }), true)

const { data: firstSessionData, error: firstSessionError } = await firstClient.auth.getSession()
assert.equal(firstSessionError, null)
assert.equal(firstSessionData.session?.user?.id, signedInState.user.id)

const restoredClient = createClient(config.url, config.anonKey, clientOptions)
const restoredProvider = createSupabaseAuthProvider(restoredClient)
const restoredState = await restoredProvider.getInitialState()
assert.equal(restoredState.isAuthenticated, true, "The persisted session was not restored by a new client")
assert.equal(restoredState.user?.id, signedInState.user.id)
assert.ok(restoredState.roles.some((role) => role.code === "SUPER_ADMIN"))
assert.equal(hasRole(restoredState.roles, APP_ROLES.SUPER_ADMIN), true)

const { data: refreshedSessionData, error: refreshError } = await restoredClient.auth.refreshSession()
assert.equal(refreshError, null, `Session refresh failed: ${refreshError?.message}`)
assert.equal(refreshedSessionData.session?.user?.id, signedInState.user.id)

const sourceId = `PHASE8A-AUTH-${randomUUID()}`
let fixtureId = null
let subscribedChannels = 0
let resolveRealtimeReady
let resolveRealtimeEvents
const realtimeReady = new Promise((resolve) => { resolveRealtimeReady = resolve })
const realtimeEvents = new Promise((resolve) => { resolveRealtimeEvents = resolve })
const expectedRealtimeEvents = new Set([
  `announcements:INSERT:${sourceId}`,
  `announcements:UPDATE:${sourceId}`,
])
const receivedRealtimeEvents = new Set()
const stopRealtime = subscribeToDashboardUpdates(restoredClient, ({ table, payload }) => {
  const identity = `${table}:${payload.eventType}:${payload.new?.source_id || payload.old?.source_id}`
  if (expectedRealtimeEvents.has(identity)) receivedRealtimeEvents.add(identity)
  if ([...expectedRealtimeEvents].every((event) => receivedRealtimeEvents.has(event))) resolveRealtimeEvents()
}, (status) => {
  if (status !== "SUBSCRIBED") return
  subscribedChannels += 1
  if (subscribedChannels === 4) resolveRealtimeReady()
})

try {
  await withTimeout(realtimeReady, "Authenticated Dashboard Realtime subscription")

  const { data: inserted, error: insertError } = await restoredClient
    .from("announcements")
    .insert({
      title: "Development Auth RLS Test",
      message: "DEMO / DEVELOPMENT / NOT OFFICIAL",
      lifecycle: "DRAFT",
      is_public: false,
      source_type: "DEVELOPMENT_TEST",
      source_id: sourceId,
      verification_status: "DEMO_ONLY",
      data_status: "DEMO",
    })
    .select("id, title")
    .single()
  assert.equal(insertError, null, `SUPER_ADMIN RLS insert failed: ${insertError?.message}`)
  fixtureId = inserted.id

  const { data: updated, error: updateError } = await restoredClient
    .from("announcements")
    .update({ message: "DEMO / DEVELOPMENT / NOT OFFICIAL / UPDATED" })
    .eq("id", fixtureId)
    .select("id, message")
    .single()
  assert.equal(updateError, null, `SUPER_ADMIN RLS update failed: ${updateError?.message}`)
  assert.match(updated.message, /UPDATED$/)
  await withTimeout(realtimeEvents, "Authenticated announcement INSERT/UPDATE delivery")
} finally {
  if (fixtureId !== null) {
    const { error: cleanupError } = await restoredClient.from("announcements").delete().eq("id", fixtureId)
    assert.equal(cleanupError, null, `Auth RLS fixture cleanup failed: ${cleanupError?.message}`)
  }
}

const signedOutState = await restoredProvider.signOut()
stopRealtime()
await new Promise((resolve) => setTimeout(resolve, 500))
assert.equal(signedOutState.user, null)
assert.equal(signedOutState.profile, null)
assert.deepEqual(signedOutState.roles, [])
assert.equal(signedOutState.isAuthenticated, false)
assert.equal(hasRole(signedOutState.roles, APP_ROLES.SUPER_ADMIN), false)
assert.equal(canAccessProtectedRoute({ isAuthenticated: signedOutState.isAuthenticated }), false)
assert.equal(restoredClient.getChannels().length, 0, "Realtime subscriptions remained after logout cleanup")

const signedOutClient = createClient(config.url, config.anonKey, clientOptions)
const { data: signedOutSessionData, error: signedOutSessionError } = await signedOutClient.auth.getSession()
assert.equal(signedOutSessionError, null)
assert.equal(signedOutSessionData.session, null, "The persisted session remained after sign-out")

const reloginProvider = createSupabaseAuthProvider(signedOutClient)
const reloginState = await reloginProvider.signIn({ email, password })
assert.equal(reloginState.isAuthenticated, true)
assert.ok(reloginState.profile)
assert.equal(hasRole(reloginState.roles, APP_ROLES.SUPER_ADMIN), true)
assert.equal((await reloginProvider.getInitialState()).user?.id, signedInState.user.id)
await reloginProvider.signOut()

console.log("LIVE CLOUD TEST: invalid-login sanitization, sign-in, profile and SUPER_ADMIN role loading, hasRole, persisted session restoration, refresh, authenticated RLS insert/update/delete, authenticated Realtime, logout state/subscription/protected-access cleanup, and re-login: PASS")
process.exit(0)
