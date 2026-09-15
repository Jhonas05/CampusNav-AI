import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import { createClient } from "@supabase/supabase-js"
import { loadCloudTestConfig } from "./phase8a-cloud-env.mjs"
import { createSupabaseAdminService, ADMIN_RESOURCE_KEYS } from "../src/services/adminService.js"
import { createSupabaseDashboardProvider } from "../src/providers/dashboard/supabaseDashboardProvider.js"
import { subscribeToTable } from "../src/services/realtimeService.js"

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
if (!email || !password) throw new Error("Phase 8B live tests require CAMPUSNAV_TEST_EMAIL and CAMPUSNAV_TEST_PASSWORD in the ignored .env.phase8a.session file or process environment.")

const withTimeout = (promise, label, timeoutMs = 35_000) => new Promise((resolvePromise, reject) => {
  const timeout = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs)
  promise.then(
    (value) => { clearTimeout(timeout); resolvePromise(value) },
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

const config = await loadCloudTestConfig()
const clientOptions = { auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false } }
const adminClient = createClient(config.url, config.anonKey, clientOptions)
const publicClient = createClient(config.url, config.anonKey, clientOptions)
const { data: loginData, error: loginError } = await adminClient.auth.signInWithPassword({ email, password })
assert.equal(loginError, null, `Development SUPER_ADMIN login failed: ${loginError?.message}`)
assert.ok(loginData.user?.id, "Development login did not return a user")

const { data: roleRows, error: roleError } = await adminClient.from("user_roles").select("role:roles(code)").eq("user_id", loginData.user.id)
assert.equal(roleError, null, `Role lookup failed: ${roleError?.message}`)
assert.ok(roleRows.some((row) => row.role?.code === "SUPER_ADMIN"), "Development account is not a SUPER_ADMIN")

const anonymousWrites = await Promise.all([
  publicClient.from("announcements").insert({ title: "BLOCKED DEVELOPMENT DEMO — NOT OFFICIAL", message: "Blocked anonymous fixture", lifecycle: "DRAFT" }),
  publicClient.from("events").insert({ title: "BLOCKED DEVELOPMENT DEMO — NOT OFFICIAL", description: "Blocked anonymous fixture", starts_at: new Date().toISOString(), lifecycle: "DRAFT" }),
  publicClient.from("facility_advisories").insert({ title: "BLOCKED DEVELOPMENT DEMO — NOT OFFICIAL", message: "Blocked anonymous fixture", advisory_type: "MAINTENANCE", related_facility_id: "library", lifecycle: "DRAFT" }),
  publicClient.from("notifications").insert({ title: "BLOCKED DEVELOPMENT DEMO — NOT OFFICIAL", message: "Blocked anonymous fixture", category: "GENERAL", lifecycle: "DRAFT" }),
])
for (const result of anonymousWrites) assert.equal(result.error?.code, "42501", "An anonymous CMS write unexpectedly succeeded")

const suffix = randomUUID()
const announcementSourceId = `PHASE8B-LIVE-ANNOUNCEMENT-${suffix}`
const eventSourceId = `PHASE8B-LIVE-EVENT-${suffix}`
const draftSourceId = `PHASE8B-LIVE-DRAFT-${suffix}`
const advisorySourceId = `PHASE8B-LIVE-ADVISORY-${suffix}`
const notificationSourceId = `PHASE8B-LIVE-NOTIFICATION-${suffix}`
const announcementTitle = `DEVELOPMENT DEMO ANNOUNCEMENT — NOT OFFICIAL — ${suffix}`
const eventTitle = `DEVELOPMENT DEMO EVENT — NOT OFFICIAL — ${suffix}`
const draftTitle = `DEVELOPMENT DEMO DRAFT — NOT OFFICIAL — ${suffix}`
const advisoryTitle = `DEVELOPMENT DEMO ADVISORY — NOT OFFICIAL — ${suffix}`
const notificationTitle = `DEVELOPMENT DEMO NOTICE — NOT OFFICIAL — ${suffix}`
const now = Date.now()
const effectiveAt = new Date(now - 60_000).toISOString()
const expiresAt = new Date(now + 24 * 60 * 60_000).toISOString()
const startsAt = new Date(now + 48 * 60 * 60_000).toISOString()
const endsAt = new Date(now + 49 * 60 * 60_000).toISOString()
const eventExpiresAt = new Date(now + 72 * 60 * 60_000).toISOString()

const admin = createSupabaseAdminService(adminClient)
const dashboard = createSupabaseDashboardProvider(publicClient, { now: new Date() })
const realtimeEvents = []
let readyChannels = 0
const stops = ["announcements", "events"].map((table) => subscribeToTable(publicClient, {
  table,
  onChange: (event) => realtimeEvents.push(event),
  onStatus: (status) => { if (status === "SUBSCRIBED") readyChannels += 1 },
}))

let announcementId = null
let eventId = null
let draftId = null
let advisoryId = null
let notificationId = null

try {
  await waitFor(() => readyChannels === 2, "public Dashboard Realtime subscriptions")
  const audiences = await admin.listAudiences()
  const everyoneAudience = audiences.find((audience) => audience.audience_type === "EVERYONE")

  const draft = await admin.createAnnouncement({
    title: draftTitle,
    message: "DEVELOPMENT / DEMO / NOT OFFICIAL — private draft visibility test.",
    category: "GENERAL",
    priority: "INFORMATIONAL",
    verification_status: "DEMO_ONLY",
    source_type: "DEVELOPMENT_TEST",
    source_id: draftSourceId,
    effective_at: effectiveAt,
    expires_at: expiresAt,
  }, { lifecycle: "DRAFT", audienceIds: everyoneAudience ? [everyoneAudience.id] : [] })
  draftId = draft.id
  const { data: hiddenDraft, error: hiddenDraftError } = await publicClient.from("announcements").select("id").eq("id", draftId)
  assert.equal(hiddenDraftError, null)
  assert.equal(hiddenDraft.length, 0, "A draft was visible to the public client")

  const createdAnnouncement = await admin.createAnnouncement({
    title: announcementTitle,
    message: "DEVELOPMENT / DEMO / NOT OFFICIAL — initial live Realtime fixture.",
    category: "GENERAL",
    priority: "INFORMATIONAL",
    verification_status: "DEMO_ONLY",
    source_type: "DEVELOPMENT_TEST",
    source_id: announcementSourceId,
    effective_at: effectiveAt,
    expires_at: expiresAt,
  }, { lifecycle: "PUBLISHED", audienceIds: everyoneAudience ? [everyoneAudience.id] : [] })
  announcementId = createdAnnouncement.id
  await waitFor(() => realtimeEvents.some(({ table, payload }) => table === "announcements" && payload.eventType === "INSERT" && payload.new?.id === announcementId), "public announcement INSERT Realtime event")
  assert.ok((await dashboard.getGeneralAnnouncements()).some((item) => item.title === announcementTitle), "Published announcement did not reach the public Dashboard provider")

  const updatedMessage = "DEVELOPMENT / DEMO / NOT OFFICIAL — edited live Realtime fixture."
  await admin.updateAnnouncement(announcementId, { ...createdAnnouncement, message: updatedMessage }, { lifecycle: "PUBLISHED", audienceIds: createdAnnouncement.audienceIds })
  await waitFor(() => realtimeEvents.some(({ table, payload }) => table === "announcements" && payload.eventType === "UPDATE" && payload.new?.id === announcementId), "public announcement UPDATE Realtime event")
  assert.ok((await dashboard.getGeneralAnnouncements()).some((item) => item.title === announcementTitle && item.message === updatedMessage), "Announcement edit did not reach the Dashboard provider")

  const createdEvent = await admin.createEvent({
    title: eventTitle,
    description: "DEVELOPMENT / DEMO / NOT OFFICIAL — live event fixture.",
    starts_at: startsAt,
    ends_at: endsAt,
    location: "Library — pending official verification",
    organizer: "Development Test",
    related_facility_id: "library",
    priority: "INFORMATIONAL",
    verification_status: "DEMO_ONLY",
    source_type: "DEVELOPMENT_TEST",
    source_id: eventSourceId,
    effective_at: effectiveAt,
    expires_at: eventExpiresAt,
  }, { lifecycle: "PUBLISHED", audienceIds: everyoneAudience ? [everyoneAudience.id] : [] })
  eventId = createdEvent.id
  await waitFor(() => realtimeEvents.some(({ table, payload }) => table === "events" && payload.eventType === "INSERT" && payload.new?.id === eventId), "public event INSERT Realtime event")
  const eventSnapshot = await dashboard.getUpcomingEvents()
  assert.ok([...eventSnapshot.today, ...eventSnapshot.upcoming].some((item) => item.title === eventTitle && item.relatedFacilityId === "library"), "Facility-linked event did not reach the Dashboard provider")

  await admin.updateEvent(eventId, { ...createdEvent, description: "DEVELOPMENT / DEMO / NOT OFFICIAL — edited live event fixture." }, { lifecycle: "PUBLISHED", audienceIds: createdEvent.audienceIds })
  await waitFor(() => realtimeEvents.some(({ table, payload }) => table === "events" && payload.eventType === "UPDATE" && payload.new?.id === eventId), "public event UPDATE Realtime event")

  const createdAdvisory = await admin.createFacilityAdvisory({
    title: advisoryTitle,
    message: "DEVELOPMENT / DEMO / NOT OFFICIAL — facility advisory CRUD fixture.",
    advisory_type: "MAINTENANCE",
    related_facility_id: "library",
    priority: "INFORMATIONAL",
    verification_status: "DEMO_ONLY",
    source_type: "DEVELOPMENT_TEST",
    source_id: advisorySourceId,
    effective_at: effectiveAt,
    expires_at: expiresAt,
  }, { lifecycle: "DRAFT" })
  advisoryId = createdAdvisory.id
  const updatedAdvisory = await admin.updateFacilityAdvisory(advisoryId, { ...createdAdvisory, message: "DEVELOPMENT / DEMO / NOT OFFICIAL — updated advisory CRUD fixture." }, { lifecycle: "DRAFT" })
  assert.match(updatedAdvisory.message, /updated advisory/)
  assert.ok((await admin.listFacilityAdvisories({ search: advisoryTitle })).some((item) => item.id === advisoryId))
  await admin.deleteFacilityAdvisory(advisoryId)
  advisoryId = null

  const createdNotification = await admin.createNotification({
    title: notificationTitle,
    message: "DEVELOPMENT / DEMO / NOT OFFICIAL — notification CRUD fixture.",
    category: "NAVIGATION",
    priority: "INFORMATIONAL",
    verification_status: "DEMO_ONLY",
    source_type: "DEVELOPMENT_TEST",
    source_id: notificationSourceId,
    effective_at: effectiveAt,
    expires_at: expiresAt,
  }, { lifecycle: "DRAFT" })
  notificationId = createdNotification.id
  const updatedNotification = await admin.updateNotification(notificationId, { ...createdNotification, message: "DEVELOPMENT / DEMO / NOT OFFICIAL — updated notification CRUD fixture." }, { lifecycle: "DRAFT" })
  assert.match(updatedNotification.message, /updated notification/)
  assert.ok((await admin.listNotifications({ search: notificationTitle })).some((item) => item.id === notificationId))
  await admin.deleteNotification(notificationId)
  notificationId = null

  assert.ok((await admin.listAnnouncements({ search: announcementTitle, lifecycle: "PUBLISHED" })).some((item) => item.id === announcementId))
  assert.ok((await admin.listEvents({ search: eventTitle, lifecycle: "PUBLISHED" })).some((item) => item.id === eventId))

  const auditRows = await admin.listAuditActivity()
  assert.ok(auditRows.some((row) => row.entity_type === "announcement" && row.entity_id === announcementId && row.actor_user_id === loginData.user.id), "Trusted announcement audit row was not recorded")
  assert.ok(auditRows.some((row) => row.entity_type === "event" && row.entity_id === eventId && row.actor_user_id === loginData.user.id), "Trusted event audit row was not recorded")

  await admin.deleteAnnouncement(announcementId)
  announcementId = null
  await waitFor(() => realtimeEvents.some(({ table, payload }) => table === "announcements" && payload.eventType === "DELETE" && payload.old?.id === createdAnnouncement.id), "public announcement DELETE Realtime event")
  assert.equal((await dashboard.getGeneralAnnouncements()).some((item) => item.title === announcementTitle), false, "Deleted announcement remained in the Dashboard provider")

  await admin.deleteEvent(eventId)
  eventId = null
  await waitFor(() => realtimeEvents.some(({ table, payload }) => table === "events" && payload.eventType === "DELETE" && payload.old?.id === createdEvent.id), "public event DELETE Realtime event")
  const afterDeleteEvents = await dashboard.getUpcomingEvents()
  assert.equal([...afterDeleteEvents.today, ...afterDeleteEvents.upcoming].some((item) => item.title === eventTitle), false, "Deleted event remained in the Dashboard provider")
} finally {
  stops.forEach((stop) => stop())
  const cleanupFilters = [announcementSourceId, eventSourceId, draftSourceId, advisorySourceId, notificationSourceId]
  await Promise.all([
    adminClient.from("announcement_audiences").delete().in("announcement_id", [announcementId, draftId].filter(Boolean)),
    adminClient.from("event_audiences").delete().in("event_id", [eventId].filter(Boolean)),
    adminClient.from("facility_advisory_audiences").delete().in("facility_advisory_id", [advisoryId].filter(Boolean)),
    adminClient.from("notification_audiences").delete().in("notification_id", [notificationId].filter(Boolean)),
  ])
  await Promise.all([
    adminClient.from("announcements").delete().in("source_id", cleanupFilters),
    adminClient.from("events").delete().in("source_id", cleanupFilters),
    adminClient.from("facility_advisories").delete().in("source_id", cleanupFilters),
    adminClient.from("notifications").delete().in("source_id", cleanupFilters),
  ])
}

await new Promise((resolvePromise) => setTimeout(resolvePromise, 400))
assert.equal(publicClient.getChannels().length, 0, "Public Dashboard Realtime channels were not cleaned up")
for (const [table, sourceId] of [["announcements", announcementSourceId], ["announcements", draftSourceId], ["events", eventSourceId], ["facility_advisories", advisorySourceId], ["notifications", notificationSourceId]]) {
  const { data, error } = await adminClient.from(table).select("id").eq("source_id", sourceId)
  assert.equal(error, null, `Final ${table} cleanup check failed: ${error?.message}`)
  assert.equal(data.length, 0, `A ${table} live test fixture remains`)
}

const { error: signOutError } = await adminClient.auth.signOut()
assert.equal(signOutError, null, `Live test sign-out failed: ${signOutError?.message}`)

console.log("LIVE CLOUD TEST: SUPER_ADMIN CRUD for all four CMS resources, draft privacy, zero-config audience handling, stable facility-linked event, public Dashboard reads, announcement/event Realtime INSERT/UPDATE/DELETE, trusted audit logging, anonymous write rejection, channel cleanup, fixture cleanup, and sign-out: PASS")
process.exit(0)
