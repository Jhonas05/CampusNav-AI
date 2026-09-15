import assert from "node:assert/strict"
import { createClient } from "@supabase/supabase-js"
import { loadCloudTestConfig } from "./phase8a-cloud-env.mjs"
import { createSupabaseDashboardProvider } from "../src/providers/dashboard/supabaseDashboardProvider.js"

const config = await loadCloudTestConfig()
const client = createClient(config.url, config.anonKey, {
  auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
})

const { error: readError } = await client.from("announcements").select("id").limit(1)
assert.equal(readError, null, `Published announcement read failed: ${readError?.message}`)

const provider = createSupabaseDashboardProvider(client)
const providerMethods = [
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
providerMethods.forEach((method) => assert.equal(typeof provider[method], "function"))
await Promise.all([
  provider.getPriorityAlerts(),
  provider.getFacilityAdvisories(),
  provider.getUpcomingEvents(),
  provider.getGeneralAnnouncements(),
  provider.getNavigationNotices(),
])
assert.deepEqual(await provider.getTodaysClasses(), [])
assert.deepEqual(await provider.getPersonnelAvailability(), [])
assert.deepEqual(await provider.getOfficeAvailability(), [])

const rejectedOperations = [
  client.from("announcements").insert({ title: "Blocked anonymous write", message: "DEVELOPMENT TEST", lifecycle: "DRAFT" }),
  client.from("announcements").update({ title: "Blocked anonymous update" }).eq("id", -1),
  client.from("announcements").delete().eq("id", -1),
  client.from("events").insert({ title: "Blocked anonymous event", description: "DEVELOPMENT TEST", starts_at: new Date().toISOString(), lifecycle: "DRAFT" }),
  client.from("facility_advisories").update({ title: "Blocked anonymous advisory update" }).eq("id", -1),
  client.from("notifications").update({ title: "Blocked anonymous notification update" }).eq("id", -1),
]

const results = await Promise.all(rejectedOperations)
for (const result of results) {
  assert.ok(result.error, "An anonymous administrative write unexpectedly succeeded")
  assert.equal(result.error.code, "42501")
}

console.log("LIVE CLOUD TEST: configuration, Data API reads, Dashboard SupabaseProvider queries, Phase 8C empty states, and anonymous write rejection: PASS")

