import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { fileURLToPath, URL } from "node:url"
import React from "react"
import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router-dom/server.js"
import { createServer } from "vite"
import {
  FACILITY_AVAILABILITY,
  FACILITY_OPERATIONAL_STATUS,
  FACILITY_PROVIDER_METHODS,
} from "../src/data/facilityContracts.js"
import { facilities } from "../src/data/facilities.js"
import { createLocalFacilityProvider } from "../src/providers/facility/localFacilityProvider.js"
import { createSupabaseFacilityProvider } from "../src/providers/facility/supabaseFacilityProvider.js"
import {
  createFacilityService,
  getFacilitiesDirectory as getDefaultFacilitiesDirectory,
} from "../src/services/facilityService.js"

const projectRoot = fileURLToPath(new URL("..", import.meta.url))
const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")
const evaluatedAt = "2026-10-05T02:00:00.000Z" // Monday, 10:00 AM in Asia/Manila.

const provenance = ({
  verificationStatus = "VERIFIED",
  dataStatus = "ACTIVE",
  sourceId = "FS-4-DIRECTORY",
  effectiveAt = null,
  expiresAt = null,
} = {}) => ({
  lifecycle: "PUBLISHED",
  publishedAt: "2026-10-01T00:00:00.000Z",
  effectiveAt,
  expiresAt,
  verificationStatus,
  dataStatus,
  sourceType: "DEVELOPMENT_TEST",
  sourceId,
  sourceLabel: dataStatus === "DEMO" ? "DEVELOPMENT / DEMO / NOT OFFICIAL" : "FS-4 directory deterministic fixture",
  lastVerifiedAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
})

const profile = (facilityId, overrides = {}) => ({
  facilityId,
  departmentId: null,
  description: `${facilityId} published operational description.`,
  publicContact: { name: null, email: null, phone: null },
  provenance: provenance(),
  ...overrides,
})

const weeklyHour = (facilityId, startTime, endTime, recordProvenance = provenance()) => ({
  facilityId,
  dayOfWeek: 1,
  closedAllDay: false,
  startTime,
  endTime,
  provenance: recordProvenance,
})

const closure = (facilityId) => ({
  facilityId,
  advisoryType: "TEMPORARY_CLOSURE",
  provenance: provenance({
    sourceId: `${facilityId}-closure`,
    effectiveAt: "2026-10-05T01:00:00.000Z",
    expiresAt: "2026-10-05T03:00:00.000Z",
  }),
})

const pendingProvenance = provenance({
  verificationStatus: "PENDING_VERIFICATION",
  dataStatus: "PENDING_VERIFICATION",
  sourceId: "FS-4-DIRECTORY-PENDING",
})
const demoProvenance = provenance({
  verificationStatus: "DEMO_ONLY",
  dataStatus: "DEMO",
  sourceId: "FS-4-DIRECTORY-DEMO",
})

const operationalProfiles = [
  profile("library"),
  profile("bookstore", { provenance: demoProvenance }),
  profile("faculty-lounge", { provenance: pendingProvenance }),
]
const weeklyHours = [
  weeklyHour("library", "09:00:00", "17:00:00"),
  weeklyHour("theater", "09:00:00", "10:15:00"),
  weeklyHour("bookstore", "11:00:00", "17:00:00", demoProvenance),
  weeklyHour("room-1", "08:00:00", "09:00:00"),
  weeklyHour("room-3", "09:00:00", "17:00:00"),
  weeklyHour("faculty-lounge", "09:00:00", "17:00:00", pendingProvenance),
]
const statusAdvisories = [closure("room-3")]

const providerCalls = []
const provider = {
  async getFacilitiesDirectoryOperationalData(dateRange) {
    providerCalls.push(dateRange)
    return { operationalProfiles, weeklyHours, exceptions: [], statusAdvisories }
  },
}

assert.equal(typeof getDefaultFacilitiesDirectory, "function")
assert.ok(FACILITY_PROVIDER_METHODS.includes("getFacilitiesDirectoryOperationalData"))

const originalFacilities = structuredClone(facilities)
const result = await createFacilityService({ provider, clock: () => evaluatedAt }).getFacilitiesDirectory()
assert.equal(result.ok, true)
assert.equal(result.availability, FACILITY_AVAILABILITY.CONFIGURED)
assert.equal(providerCalls.length, 1, "Directory composition calls its provider aggregate once")
assert.deepEqual(providerCalls[0], { startDate: "2026-10-04", endDate: "2026-10-05" })
assert.equal(result.data.facilities.length, facilities.length)
assert.equal(facilities.length, 95)
assert.deepEqual(result.data.facilities.map(({ facility }) => facility.id), facilities.map(({ id }) => id))

const entry = (facilityId) => result.data.facilities.find(({ facility }) => facility.id === facilityId)
assert.equal(entry("library").facility.name, "Library")
assert.equal(entry("library").facility.floorId, "3F")
assert.equal(entry("library").operationalProfile.description, "library published operational description.")
assert.equal(entry("library").status.status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
assert.equal(entry("theater").status.status, FACILITY_OPERATIONAL_STATUS.CLOSING_SOON)
assert.equal(entry("bookstore").status.status, FACILITY_OPERATIONAL_STATUS.SCHEDULED_TO_OPEN)
assert.equal(entry("room-1").status.status, FACILITY_OPERATIONAL_STATUS.CLOSED)
assert.equal(entry("room-3").status.status, FACILITY_OPERATIONAL_STATUS.TEMPORARILY_UNAVAILABLE)
assert.equal(entry("faculty-lounge").status.status, FACILITY_OPERATIONAL_STATUS.PENDING_VERIFICATION)
assert.equal(entry("cr-men-gf").status.status, FACILITY_OPERATIONAL_STATUS.UNKNOWN)
assert.notEqual(entry("faculty-lounge").status.status, entry("cr-men-gf").status.status)
assert.equal(entry("bookstore").operationalProfile.provenance.demo, true)
assert.equal(entry("bookstore").status.demo, true)
assert.equal(entry("cr-men-gf").operationalProfile, null)

result.data.facilities[0].facility.name = "Provider-owned name"
assert.deepEqual(facilities, originalFacilities, "Directory composition cannot mutate canonical facility identity")

const localProvider = createLocalFacilityProvider()
const localResult = await createFacilityService({ provider: localProvider, clock: () => evaluatedAt }).getFacilitiesDirectory()
assert.equal(localResult.ok, true)
assert.equal(localResult.availability, FACILITY_AVAILABILITY.UNAVAILABLE)
assert.equal(localResult.data.facilities.length, facilities.length)
assert.ok(localResult.data.facilities.every((item) => item.status.status === FACILITY_OPERATIONAL_STATUS.UNKNOWN))
assert.ok(localResult.data.facilities.every((item) => item.operationalProfile === null))

const secretError = new Error("PostgREST SQL secret=do-not-expose https://example.test?apikey=secret")
const failedResult = await createFacilityService({
  provider: { async getFacilitiesDirectoryOperationalData() { throw secretError } },
  clock: () => evaluatedAt,
}).getFacilitiesDirectory()
assert.equal(failedResult.ok, false)
assert.equal(failedResult.availability, FACILITY_AVAILABILITY.PROVIDER_UNAVAILABLE)
assert.equal(failedResult.data.facilities.length, facilities.length)
assert.ok(failedResult.data.facilities.every((item) => item.status.status === FACILITY_OPERATIONAL_STATUS.UNKNOWN))
assert.doesNotMatch(JSON.stringify(failedResult), /PostgREST|do-not-expose|apikey|example\.test/i)

const invalidTimestampCalls = []
const invalidTimestamp = await createFacilityService({
  provider: { async getFacilitiesDirectoryOperationalData() { invalidTimestampCalls.push(true); return {} } },
}).getFacilitiesDirectory("2026-10-05 10:00")
assert.equal(invalidTimestamp.ok, false)
assert.equal(invalidTimestamp.error.code, "FACILITY_INVALID_DATE_TIME")
assert.equal(invalidTimestampCalls.length, 0)

const rowsByView = {
  public_facility_operational_profiles: [],
  public_facility_hours: [],
  public_facility_hour_exceptions: [],
  public_facility_status_advisories: [],
}
const supabaseCalls = []
const supabaseClient = {
  from(view) {
    supabaseCalls.push({ method: "from", view })
    const filters = []
    const query = {
      select(columns) { supabaseCalls.push({ method: "select", view, columns }); return query },
      gte(column, value) { filters.push(["gte", column, value]); supabaseCalls.push({ method: "gte", view, column, value }); return query },
      lte(column, value) { filters.push(["lte", column, value]); supabaseCalls.push({ method: "lte", view, column, value }); return query },
      order(column, options) { supabaseCalls.push({ method: "order", view, column, options }); return query },
      then(resolve, reject) {
        const data = (rowsByView[view] || []).filter((row) => filters.every(([operator, column, value]) => (
          operator === "gte" ? row[column] >= value : row[column] <= value
        )))
        return Promise.resolve({ data, error: null }).then(resolve, reject)
      },
    }
    return query
  },
}
const supabaseProvider = createSupabaseFacilityProvider(supabaseClient)
const providerResult = await supabaseProvider.getFacilitiesDirectoryOperationalData({
  startDate: "2026-10-04",
  endDate: "2026-10-05",
})
assert.deepEqual(providerResult, { operationalProfiles: [], weeklyHours: [], exceptions: [], statusAdvisories: [] })
assert.equal(supabaseCalls.filter(({ method }) => method === "from").length, 4)
assert.deepEqual(
  supabaseCalls.filter(({ method }) => method === "from").map(({ view }) => view).toSorted(),
  Object.keys(rowsByView).toSorted(),
)
assert.equal(supabaseCalls.filter(({ method }) => method === "eq").length, 0, "Directory provider never issues per-facility filters")

const [serviceSource, providerSource, pageSource, cardSource, packageSource] = await Promise.all([
  readProjectFile("src/services/facilityService.js"),
  readProjectFile("src/providers/facility/supabaseFacilityProvider.js"),
  readProjectFile("src/pages/Facilities.jsx"),
  readProjectFile("src/components/facilities/FacilityCard.jsx"),
  readProjectFile("package.json"),
])
assert.match(serviceSource, /getFacilitiesDirectory/)
assert.match(serviceSource, /statusEvaluator\s*\(/)
assert.match(providerSource, /getFacilitiesDirectoryOperationalData/)
for (const view of Object.keys(rowsByView)) assert.match(providerSource, new RegExp(view))
assert.doesNotMatch(providerSource, /\.(insert|update|upsert|delete)\s*\(/)
assert.doesNotMatch(pageSource + cardSource, /\.from\s*\(|supabase/i)
assert.match(pageSource, /getFacilitiesDirectory\(\)/)
assert.match(pageSource, /facilities\.filter/)
// FS-4 discovery now owns canonical matching; the same fields remain searchable.
const discoverySource = await readProjectFile("src/services/facilityDiscovery.js")
assert.match(pageSource, /searchFacilities\(query/)
assert.match(discoverySource, /facility\.name, facility\.kind, facility\.floorId, getFloorById\(facility\.floorId\)\?\.name/)
assert.doesNotMatch(pageSource, /serviceAlias|fuzzy|recommendationRank|getFacilitiesByService/i)
assert.doesNotMatch(pageSource, /Search by office, service/)
assert.match(pageSource, /role="status"/)
assert.match(pageSource, /aria-label="Filter by category"/)
assert.match(pageSource, /aria-label="Filter by floor"/)
assert.match(pageSource, /sm:grid-cols-\[repeat\(auto-fill,minmax\(230px,1fr\)\)\]/)
assert.match(cardSource, /View details for/)
assert.match(cardSource, /Navigate to/)
assert.match(cardSource, /status === FACILITY_OPERATIONAL_STATUS\.UNKNOWN \? "Unknown"/)
assert.match(cardSource, /Demo · not official/)
assert.match(cardSource, /Pending verification/)
assert.match(cardSource, /line-clamp-2/)
assert.doesNotMatch(cardSource, /Floor Verified|Hours pending/)
assert.doesNotMatch(pageSource + cardSource, /#[0-9A-Fa-f]{3,8}/)
assert.match(packageSource, /"test:phase4-fs4-directory"/)

const vite = await createServer({
  appType: "custom",
  configFile: false,
  esbuild: { jsx: "automatic" },
  logLevel: "error",
  optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
  root: projectRoot,
  server: { middlewareMode: true },
})

try {
  const { default: FacilityCard } = await vite.ssrLoadModule("/src/components/facilities/FacilityCard.jsx")
  const renderCard = (props) => renderToString(React.createElement(
    StaticRouter,
    { location: "/facilities" },
    React.createElement(FacilityCard, props),
  ))
  const openHtml = renderCard({ facility: entry("library").facility, operational: entry("library") })
  assert.match(openHtml, /Library/)
  assert.match(openHtml, /Third Floor/)
  assert.match(openHtml, /Open Now/)
  assert.match(openHtml, /published operational description/)
  assert.match(openHtml, /href="\/facilities\/library"/)
  assert.match(openHtml, /href="\/map\?facility=library"/)
  assert.match(openHtml, /View details for Library/)
  assert.match(openHtml, /Navigate to Library/)

  const unknownHtml = renderCard({
    facility: entry("cr-men-gf").facility,
    operational: entry("cr-men-gf"),
  })
  assert.match(unknownHtml, />Unknown</)
  assert.doesNotMatch(unknownHtml, />Pending Verification</)

  const demoHtml = renderCard({
    facility: entry("bookstore").facility,
    operational: entry("bookstore"),
  })
  assert.match(demoHtml, /Demo · not official/)

  const pendingHtml = renderCard({
    facility: entry("faculty-lounge").facility,
    operational: entry("faculty-lounge"),
  })
  assert.match(pendingHtml, /Pending Verification/)

  for (const facilityId of ["room-1", "room-3"]) {
    const stateHtml = renderCard({ facility: entry(facilityId).facility, operational: entry(facilityId) })
    assert.match(stateHtml, new RegExp(`href="/map\\?facility=${facilityId}"`))
    assert.match(stateHtml, new RegExp(`Navigate to ${entry(facilityId).facility.name}`))
  }
  assert.match(renderCard({ facility: entry("room-1").facility, operational: entry("room-1") }), />Closed</)
  assert.match(renderCard({ facility: entry("room-3").facility, operational: entry("room-3") }), />Temporarily Unavailable</)
} finally {
  await vite.close()
}

console.log("Phase 4 FS-4 facilities-directory bounded composition, canonical fallback, operational statuses, and card UI contract: PASS")
