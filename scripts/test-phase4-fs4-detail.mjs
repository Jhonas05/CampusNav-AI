import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { fileURLToPath, URL } from "node:url"
import React from "react"
import { renderToString } from "react-dom/server"
import { createServer } from "vite"
import {
  FACILITY_AVAILABILITY,
  FACILITY_OPERATIONAL_STATUS,
} from "../src/data/facilityContracts.js"
import { facilities } from "../src/data/facilities.js"
import { getFacilityNavigationHref } from "../src/services/dashboardService.js"
import { evaluateFacilityStatus } from "../src/services/facilityStatusEvaluator.js"
import {
  createFacilityService,
  getFacilityDetail as getDefaultFacilityDetail,
} from "../src/services/facilityService.js"

const projectRoot = fileURLToPath(new URL("..", import.meta.url))
const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")
const evaluatedAt = "2026-10-05T02:00:00.000Z" // Monday, 10:00 AM in Asia/Manila.

const provenance = ({
  verificationStatus = "VERIFIED",
  dataStatus = "ACTIVE",
  sourceId = "FS-4-DETAIL",
} = {}) => ({
  lifecycle: "PUBLISHED",
  publishedAt: "2026-10-01T00:00:00.000Z",
  effectiveAt: null,
  expiresAt: null,
  verificationStatus,
  dataStatus,
  sourceType: "DEVELOPMENT_TEST",
  sourceId,
  sourceLabel: dataStatus === "DEMO" ? "DEVELOPMENT / DEMO / NOT OFFICIAL" : "FS-4 deterministic fixture",
  lastVerifiedAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
})

const weeklyHour = ({
  dayOfWeek = 1,
  startTime = "09:00:00",
  endTime = "17:00:00",
  closedAllDay = false,
  recordProvenance = provenance(),
} = {}) => ({
  facilityId: "library",
  dayOfWeek,
  closedAllDay,
  startTime: closedAllDay ? null : startTime,
  endTime: closedAllDay ? null : endTime,
  provenance: recordProvenance,
})

const hourException = ({
  exceptionDate = "2026-10-05",
  startTime = null,
  endTime = null,
  closedAllDay = true,
  recordProvenance = provenance({ sourceId: "FS-4-DETAIL-EXCEPTION" }),
} = {}) => ({
  facilityId: "library",
  exceptionDate,
  closedAllDay,
  startTime: closedAllDay ? null : startTime,
  endTime: closedAllDay ? null : endTime,
  provenance: recordProvenance,
})

const closureAdvisory = ({
  effectiveAt = "2026-10-05T01:00:00.000Z",
  expiresAt = "2026-10-05T03:00:00.000Z",
  recordProvenance = provenance({ sourceId: "FS-4-DETAIL-CLOSURE" }),
} = {}) => ({
  facilityId: "library",
  advisoryType: "TEMPORARY_CLOSURE",
  provenance: { ...recordProvenance, effectiveAt, expiresAt },
})

const profile = (recordProvenance = provenance()) => ({
  facilityId: "library",
  departmentId: 7,
  description: "A published operational description for deterministic testing.",
  publicContact: {
    name: "Library help desk",
    email: "library@campus.invalid",
    phone: "+63 2 8000 0000",
  },
  provenance: recordProvenance,
})

const mapping = (recordProvenance = provenance()) => ({
  facilityId: "library",
  serviceCode: "library-assistance",
  serviceName: "Library Assistance",
  recommendationRank: 10,
  publicNotes: "Published service note.",
  provenance: recordProvenance,
})

const createProvider = ({
  operationalProfile = profile(),
  services = [mapping()],
  weeklyHours = [weeklyHour()],
  exceptions = [],
  statusAdvisories = [],
  failures = {},
  calls = [],
} = {}) => ({
  async getFacilityOperationalProfile(facilityId) {
    calls.push(["profile", facilityId])
    if (failures.profile) throw failures.profile
    return operationalProfile
  },
  async getServicesForFacility(facilityId) {
    calls.push(["services", facilityId])
    if (failures.services) throw failures.services
    return services
  },
  async getFacilityHours(facilityId, dateRange) {
    calls.push(["hours", facilityId, dateRange])
    if (failures.hours) throw failures.hours
    return { weeklyHours, exceptions, statusAdvisories }
  },
})

assert.equal(typeof getDefaultFacilityDetail, "function")

const compositionCalls = []
let evaluatorCalls = 0
const composition = await createFacilityService({
  provider: createProvider({ calls: compositionCalls }),
  clock: () => evaluatedAt,
  statusEvaluator: (input) => {
    evaluatorCalls += 1
    return evaluateFacilityStatus(input)
  },
}).getFacilityDetail("library")

assert.equal(composition.ok, true)
assert.equal(composition.availability, FACILITY_AVAILABILITY.CONFIGURED)
assert.equal(composition.data.facility.id, "library")
assert.equal(composition.data.facility.name, "Library")
assert.equal(composition.data.facility.floorId, "3F")
assert.equal(composition.data.facility.mapRoomId, "room-library")
assert.equal(composition.data.operationalProfile.data.description, profile().description)
assert.equal(composition.data.operationalProfile.data.publicContact.name, "Library help desk")
assert.deepEqual(composition.data.services.data.map(({ service }) => service.code), ["library-assistance"])
assert.equal(composition.data.services.data[0].service.name, "Library Assistance")
assert.equal(composition.data.hours.data.weeklyHours.length, 1)
assert.deepEqual(composition.data.hours.data.dateRange, { startDate: "2026-10-04", endDate: "2026-10-05" })
assert.equal(composition.data.status.data.status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
assert.equal(composition.data.status.data.timezone, "Asia/Manila")
assert.equal(compositionCalls.filter(([method]) => method === "hours").length, 1, "Detail composition performs one hours-provider read")
assert.equal(evaluatorCalls, 1, "Detail composition calls the accepted FS-2 evaluator exactly once")

const missingProfile = await createFacilityService({
  provider: createProvider({ operationalProfile: null }),
  clock: () => evaluatedAt,
}).getFacilityDetail("library")
assert.equal(missingProfile.ok, true)
assert.equal(missingProfile.data.facility.id, "library")
assert.equal(missingProfile.data.operationalProfile.ok, true)
assert.equal(missingProfile.data.operationalProfile.availability, FACILITY_AVAILABILITY.UNAVAILABLE)
assert.equal(missingProfile.data.operationalProfile.data, null)
assert.equal(missingProfile.data.status.data.status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)

const noServices = await createFacilityService({
  provider: createProvider({ services: [] }),
  clock: () => evaluatedAt,
}).getFacilityDetail("library")
assert.equal(noServices.data.services.ok, true)
assert.equal(noServices.data.services.availability, FACILITY_AVAILABILITY.UNAVAILABLE)
assert.deepEqual(noServices.data.services.data, [])

const exceptionResult = await createFacilityService({
  provider: createProvider({ exceptions: [hourException()] }),
  clock: () => evaluatedAt,
}).getFacilityDetail("library")
assert.equal(exceptionResult.data.hours.data.exceptions.length, 1)
assert.equal(exceptionResult.data.hours.data.exceptions[0].closedAllDay, true)
assert.equal(exceptionResult.data.status.data.status, FACILITY_OPERATIONAL_STATUS.CLOSED)

const statusCases = [
  [FACILITY_OPERATIONAL_STATUS.OPEN_NOW, evaluatedAt, { weeklyHours: [weeklyHour()] }],
  [FACILITY_OPERATIONAL_STATUS.CLOSING_SOON, "2026-10-05T08:45:00.000Z", { weeklyHours: [weeklyHour()] }],
  [FACILITY_OPERATIONAL_STATUS.SCHEDULED_TO_OPEN, "2026-10-05T00:00:00.000Z", { weeklyHours: [weeklyHour()] }],
  [FACILITY_OPERATIONAL_STATUS.CLOSED, "2026-10-05T10:00:00.000Z", { weeklyHours: [weeklyHour()] }],
  [FACILITY_OPERATIONAL_STATUS.TEMPORARILY_UNAVAILABLE, evaluatedAt, { weeklyHours: [weeklyHour()], statusAdvisories: [closureAdvisory()] }],
  [FACILITY_OPERATIONAL_STATUS.PENDING_VERIFICATION, evaluatedAt, {
    weeklyHours: [weeklyHour({ recordProvenance: provenance({ verificationStatus: "PENDING_VERIFICATION", dataStatus: "PENDING_VERIFICATION" }) })],
  }],
  [FACILITY_OPERATIONAL_STATUS.UNKNOWN, evaluatedAt, { weeklyHours: [] }],
]

for (const [expected, timestamp, sources] of statusCases) {
  const result = await createFacilityService({
    provider: createProvider(sources),
    clock: () => timestamp,
  }).getFacilityDetail("library")
  assert.equal(result.data.status.data.status, expected)
}

const demoProvenance = provenance({ verificationStatus: "DEMO_ONLY", dataStatus: "DEMO", sourceId: "FS-4-DETAIL-DEMO" })
const demoResult = await createFacilityService({
  provider: createProvider({
    operationalProfile: profile(demoProvenance),
    services: [mapping(demoProvenance)],
    weeklyHours: [weeklyHour({ recordProvenance: demoProvenance })],
  }),
  clock: () => evaluatedAt,
}).getFacilityDetail("library")
assert.equal(demoResult.data.operationalProfile.data.provenance.demo, true)
assert.equal(demoResult.data.services.data[0].mapping.provenance.demo, true)
assert.equal(demoResult.data.hours.data.weeklyHours[0].provenance.demo, true)
assert.equal(demoResult.data.status.data.demo, true)

const pendingProvenance = provenance({ verificationStatus: "PENDING_VERIFICATION", dataStatus: "PENDING_VERIFICATION", sourceId: "FS-4-DETAIL-PENDING" })
const pendingResult = await createFacilityService({
  provider: createProvider({
    operationalProfile: profile(pendingProvenance),
    services: [mapping(pendingProvenance)],
    weeklyHours: [weeklyHour({ recordProvenance: pendingProvenance })],
  }),
  clock: () => evaluatedAt,
}).getFacilityDetail("library")
assert.equal(pendingResult.data.operationalProfile.data.provenance.verificationStatus, "PENDING_VERIFICATION")
assert.equal(pendingResult.data.services.data[0].mapping.provenance.dataStatus, "PENDING_VERIFICATION")
assert.equal(pendingResult.data.status.data.status, FACILITY_OPERATIONAL_STATUS.PENDING_VERIFICATION)

const secretError = new Error("PostgREST SQL secret=do-not-expose https://example.test?apikey=secret")
const partialResult = await createFacilityService({
  provider: createProvider({ failures: { profile: secretError } }),
  clock: () => evaluatedAt,
}).getFacilityDetail("library")
assert.equal(partialResult.ok, true)
assert.equal(partialResult.data.facility.id, "library")
assert.equal(partialResult.data.operationalProfile.ok, false)
assert.equal(partialResult.data.operationalProfile.data, null)
assert.equal(partialResult.data.services.ok, true)
assert.equal(partialResult.data.hours.ok, true)
assert.equal(partialResult.data.status.data.status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
assert.doesNotMatch(JSON.stringify(partialResult), /PostgREST|SQL|secret|apikey|example\.test/i)

const failedServicesResult = await createFacilityService({
  provider: createProvider({ failures: { services: secretError } }),
  clock: () => evaluatedAt,
}).getFacilityDetail("library")
assert.equal(failedServicesResult.ok, true)
assert.equal(failedServicesResult.data.services.ok, false)
assert.deepEqual(failedServicesResult.data.services.data, [])
assert.equal(failedServicesResult.data.operationalProfile.ok, true)
assert.equal(failedServicesResult.data.hours.ok, true)
assert.equal(failedServicesResult.data.status.data.status, FACILITY_OPERATIONAL_STATUS.OPEN_NOW)
assert.doesNotMatch(JSON.stringify(failedServicesResult), /PostgREST|SQL|secret|apikey|example\.test/i)

const failedHoursResult = await createFacilityService({
  provider: createProvider({ failures: { hours: secretError } }),
  clock: () => evaluatedAt,
}).getFacilityDetail("library")
assert.equal(failedHoursResult.ok, true)
assert.equal(failedHoursResult.data.hours.ok, false)
assert.equal(failedHoursResult.data.status.ok, false)
assert.equal(failedHoursResult.data.status.data.status, FACILITY_OPERATIONAL_STATUS.UNKNOWN)
assert.equal(failedHoursResult.data.services.ok, true)
assert.doesNotMatch(JSON.stringify(failedHoursResult), /PostgREST|SQL|secret|apikey|example\.test/i)

const invalidFacilityCalls = []
const invalidFacilityResult = await createFacilityService({
  provider: createProvider({ calls: invalidFacilityCalls }),
}).getFacilityDetail("not-a-canonical-facility")
assert.equal(invalidFacilityResult.ok, false)
assert.equal(invalidFacilityResult.error.code, "FACILITY_NOT_FOUND")
assert.equal(invalidFacilityCalls.length, 0)

assert.equal(getFacilityNavigationHref("library"), "/map?facility=library")
assert.equal(getFacilityNavigationHref("maintenance-barracks"), null)
assert.equal(getFacilityNavigationHref("not-a-canonical-facility"), null)

const originalFacilities = structuredClone(facilities)
composition.data.facility.name = "Provider-owned name"
composition.data.facility.verification.floor = "DEMO_ONLY"
assert.deepEqual(facilities, originalFacilities, "Facility detail cannot mutate canonical facility identity")

const [serviceSource, evaluatorSource, providerSource, localProviderSource, pageSource, detailsSource, badgeSource] = await Promise.all([
  readProjectFile("src/services/facilityService.js"),
  readProjectFile("src/services/facilityStatusEvaluator.js"),
  readProjectFile("src/providers/facility/supabaseFacilityProvider.js"),
  readProjectFile("src/providers/facility/localFacilityProvider.js"),
  readProjectFile("src/pages/FacilityDetail.jsx"),
  readProjectFile("src/components/facilities/FacilityOperationalDetails.jsx"),
  readProjectFile("src/components/facilities/FacilityStatusBadge.jsx"),
])

for (const source of [providerSource, localProviderSource]) {
  assert.doesNotMatch(source, /\.(insert|update|upsert|delete)\s*\(/)
  assert.doesNotMatch(source, /service[_-]?role|sb_secret_/i)
}
for (const view of [
  "public_facility_operational_profiles",
  "public_facility_service_mappings",
  "public_facility_hours",
  "public_facility_hour_exceptions",
  "public_facility_status_advisories",
]) assert.match(providerSource, new RegExp(view))
for (const table of ["facility_operational_profiles", "facility_service_mappings", "facility_hours", "facility_hour_exceptions"]) {
  assert.doesNotMatch(providerSource, new RegExp(`\\.from\\([\"']${table}[\"']\\)`))
}
assert.match(serviceSource, /getFacilityDetail/)
assert.match(serviceSource, /evaluateFacilityStatusResult/)
assert.match(evaluatorSource, /export const evaluateFacilityStatus/)
assert.doesNotMatch(pageSource + detailsSource, /evaluateFacilityStatus|getFacilityStatus\s*\(/)
assert.doesNotMatch(pageSource + detailsSource, /searchFacilities|serviceAlias|fuzzy|recommendationRank/i)
assert.doesNotMatch(pageSource + detailsSource, /facilityAdminService|\.from\s*\(/)
assert.match(pageSource, /getFacilityNavigationHref\(facility\.id\)/)
assert.match(pageSource, /aria-labelledby="public-facility-details-heading"/)
assert.match(detailsSource, /aria-live="polite"/)
assert.match(detailsSource, /role="alert"/)
assert.match(detailsSource, /sm:grid-cols-2/)
assert.match(detailsSource, /status not conveyed|StatusBadge|Operational status/)
assert.match(badgeSource, /Floor Verified/)
assert.doesNotMatch(badgeSource, /OPEN_NOW|CLOSED|TEMPORARILY_UNAVAILABLE/)
assert.doesNotMatch(pageSource + detailsSource, /#[0-9A-Fa-f]{3,8}/, "Facility detail UI uses semantic theme tokens")

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
  const { default: FacilityOperationalDetails } = await vite.ssrLoadModule("/src/components/facilities/FacilityOperationalDetails.jsx")
  const html = renderToString(React.createElement(FacilityOperationalDetails, { detail: composition.data }))
  assert.match(html, /Operational status/)
  assert.match(html, /Open Now/)
  assert.match(html, /A published operational description/)
  assert.match(html, /Library Assistance/)
  assert.match(html, /Monday/)
  assert.match(html, /9:00 AM/)
  assert.match(html, /Public contact/)
  assert.match(html, /library@campus\.invalid/)

  const demoHtml = renderToString(React.createElement(FacilityOperationalDetails, { detail: demoResult.data }))
  assert.match(demoHtml, /Demo/)
  assert.match(demoHtml, /not official/)

  const pendingHtml = renderToString(React.createElement(FacilityOperationalDetails, { detail: pendingResult.data }))
  assert.match(pendingHtml, /Pending verification/)

  const failedHtml = renderToString(React.createElement(FacilityOperationalDetails, { detail: failedHoursResult.data }))
  assert.match(failedHtml, />Unknown</)
  assert.doesNotMatch(failedHtml, />Pending Verification</)
  assert.match(failedHtml, /Operating hours unavailable/)
  assert.match(failedHtml, /No open or closed state has been inferred/)

  const loadingHtml = renderToString(React.createElement(FacilityOperationalDetails, { loading: true }))
  assert.match(loadingHtml, /Loading public facility information/)
  assert.match(loadingHtml, /aria-live="polite"/)
} finally {
  await vite.close()
}

console.log("Phase 4 FS-4 public facility-detail composition, partial failures, provenance, status ownership, and UI contract: PASS")
