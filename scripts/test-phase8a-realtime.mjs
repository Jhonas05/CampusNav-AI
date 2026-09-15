import assert from "node:assert/strict"
import { createClient } from "@supabase/supabase-js"
import { loadCloudTestConfig } from "./phase8a-cloud-env.mjs"
import { subscribeToDashboardUpdates } from "../src/services/realtimeService.js"

const config = await loadCloudTestConfig()
const client = createClient(config.url, config.anonKey, {
  auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
})
const expected = new Set([
  "announcements:INSERT:PHASE8A-LIVE-RT-ANN",
  "announcements:UPDATE:PHASE8A-LIVE-RT-ANN",
  "events:INSERT:PHASE8A-LIVE-RT-EVENT",
])
const received = new Set()
let subscribedChannels = 0
let settled = false

const timeout = setTimeout(async () => {
  if (settled) return
  settled = true
  stop()
  await new Promise((resolve) => setTimeout(resolve, 250))
  console.error(`LIVE CLOUD TEST: Realtime timed out; received ${[...received].join(", ") || "no expected events"}`)
  process.exit(1)
}, 120_000)

const finishIfComplete = async () => {
  if (settled || [...expected].some((event) => !received.has(event))) return
  settled = true
  clearTimeout(timeout)
  stop()
  await new Promise((resolve) => setTimeout(resolve, 500))
  assert.equal(client.getChannels().length, 0, "Realtime channels were not removed during cleanup")
  console.log("LIVE CLOUD TEST: announcement INSERT/UPDATE, event INSERT, Dashboard subscription delivery, and channel cleanup: PASS")
  process.exit(0)
}

const stop = subscribeToDashboardUpdates(client, ({ table, payload }) => {
  const sourceId = payload.new?.source_id || payload.old?.source_id
  const identity = `${table}:${payload.eventType}:${sourceId}`
  if (expected.has(identity)) received.add(identity)
  finishIfComplete().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}, (status) => {
  if (status !== "SUBSCRIBED") return
  subscribedChannels += 1
  if (subscribedChannels === 4) console.log("CAMPUSNAV_REALTIME_READY")
})
