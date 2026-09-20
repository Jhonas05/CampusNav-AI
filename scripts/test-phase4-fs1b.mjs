import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import {
  FACILITY_AVAILABILITY,
  FACILITY_ERROR_CODES,
  FACILITY_PROVIDER_METHODS,
} from "../src/data/facilityContracts.js"
import { facilities } from "../src/data/facilities.js"
import { mapEdges } from "../src/data/mapEdges.js"
import { mapNodes } from "../src/data/mapNodes.js"
import { createLocalFacilityProvider } from "../src/providers/facility/localFacilityProvider.js"
import { createSupabaseFacilityProvider } from "../src/providers/facility/supabaseFacilityProvider.js"
import {
  createFacilityService,
  getFacilityById as getDefaultFacilityById,
} from "../src/services/facilityService.js"

const projectRoot = new URL("..", import.meta.url)
const readProjectFile = (path) => readFile(new URL(path, projectRoot), "utf8")
const snapshot = (value) => JSON.parse(JSON.stringify(value))
const originalFacilities = snapshot(facilities)
const originalNodes = snapshot(mapNodes)
const originalEdges = snapshot(mapEdges)

const localProvider = createLocalFacilityProvider()
const providerCalls = []
const supabaseClient = {
  from(view) {
    providerCalls.push({ method: "from", view })
    const query = {
      select(columns) { providerCalls.push({ method: "select", columns }); return query },
      eq(column, value) { providerCalls.push({ method: "eq", column, value }); return query },
      async maybeSingle() {
        providerCalls.push({ method: "maybeSingle" })
        return {
          data: {
            id: 41,
            facility_id: "library",
            department_id: 7,
            description: "DEVELOPMENT / DEMO / NOT OFFICIAL profile",
            public_contact_name: "Development Contact",
            public_contact_email: "development@example.test",
            public_contact_phone: "+63 000 000 0000",
            lifecycle: "PUBLISHED",
            published_at: "2026-09-20T02:00:00.000Z",
            effective_at: "2026-09-20T02:00:00.000Z",
            expires_at: null,
            verification_status: "DEMO_ONLY",
            data_status: "DEMO",
            source_type: "DEVELOPMENT_TEST",
            source_id: "FS-1B1-PROFILE",
            source_label: "Development fixture",
            last_verified_at: null,
            updated_at: "2026-09-20T02:30:00.000Z",
            floor: "5F",
            coordinates: { x: 999, y: 999 },
            nodes: ["malicious-node"],
            edges: ["malicious-edge"],
            entranceNode: "malicious-entrance",
            mapPosition: { x: 999, y: 999 },
            routingData: { replace: true },
            emergencyRoute: ["malicious-route"],
          },
          error: null,
        }
      },
    }
    return query
  },
}
const supabaseProvider = createSupabaseFacilityProvider(supabaseClient)

for (const method of FACILITY_PROVIDER_METHODS) {
  assert.equal(typeof localProvider[method], "function", `Local provider exposes ${method}`)
  assert.equal(typeof supabaseProvider[method], "function", `Supabase provider exposes ${method}`)
}

const localResult = await createFacilityService({ provider: localProvider }).getFacilityById("library")
assert.equal(localResult.ok, true)
assert.equal(localResult.availability, FACILITY_AVAILABILITY.UNAVAILABLE)
assert.equal(localResult.data.facility.id, "library")
assert.equal(localResult.data.facility.name, "Library")
assert.equal(localResult.data.facility.floorId, "3F")
assert.equal(localResult.data.operationalProfile, null)
assert.equal(localResult.error, null)

const defaultLocalResult = await getDefaultFacilityById("library")
assert.equal(defaultLocalResult.ok, true)
assert.equal(defaultLocalResult.availability, FACILITY_AVAILABILITY.UNAVAILABLE)
assert.equal(defaultLocalResult.data.facility.id, "library")
assert.equal(defaultLocalResult.data.operationalProfile, null)
assert.equal(defaultLocalResult.error, null)

const configuredResult = await createFacilityService({ provider: supabaseProvider }).getFacilityById("library")
assert.equal(configuredResult.ok, true)
assert.equal(configuredResult.availability, FACILITY_AVAILABILITY.CONFIGURED)
assert.equal(configuredResult.data.facility.id, "library")
assert.equal(configuredResult.data.facility.floorId, "3F")
assert.equal(configuredResult.data.facility.mapRoomId, "room-library")
assert.deepEqual(configuredResult.data.operationalProfile.publicContact, {
  name: "Development Contact",
  email: "development@example.test",
  phone: "+63 000 000 0000",
})
assert.equal(configuredResult.data.operationalProfile.description, "DEVELOPMENT / DEMO / NOT OFFICIAL profile")
assert.equal(configuredResult.data.operationalProfile.provenance.lifecycle, "PUBLISHED")
assert.equal(configuredResult.data.operationalProfile.provenance.dataStatus, "DEMO")
assert.equal(configuredResult.data.operationalProfile.provenance.verificationStatus, "DEMO_ONLY")
assert.equal(configuredResult.data.operationalProfile.provenance.demo, true)
for (const forbiddenField of ["floor", "coordinates", "nodes", "edges", "entranceNode", "mapPosition", "routingData", "emergencyRoute"]) {
  assert.equal(Object.hasOwn(configuredResult.data.operationalProfile, forbiddenField), false, `${forbiddenField} is not exposed by the operational profile`)
}

assert.equal(providerCalls[0].view, "public_facility_operational_profiles")
assert.equal(providerCalls.some((call) => call.view === "facility_operational_profiles"), false)
assert.deepEqual(providerCalls.filter((call) => call.method === "eq").map(({ column, value }) => [column, value]), [["facility_id", "library"]])

let invalidProviderCalls = 0
const invalidResult = await createFacilityService({
  provider: {
    async getFacilityOperationalProfile() { invalidProviderCalls += 1; return null },
  },
}).getFacilityById("not-a-canonical-facility")
assert.equal(invalidResult.ok, false)
assert.equal(invalidResult.availability, FACILITY_AVAILABILITY.UNAVAILABLE)
assert.equal(invalidResult.error.code, FACILITY_ERROR_CODES.NOT_FOUND)
assert.equal(invalidResult.error.message, "Facility not found.")
assert.equal(invalidResult.error.retryable, false)
assert.equal(invalidProviderCalls, 0)

const pendingResult = await createFacilityService({
  provider: {
    async getFacilityOperationalProfile() {
      return {
        facilityId: "library",
        description: null,
        provenance: {
          lifecycle: "PUBLISHED",
          verificationStatus: "PENDING_VERIFICATION",
          dataStatus: "PENDING_VERIFICATION",
        },
      }
    },
  },
}).getFacilityById("library")
assert.equal(pendingResult.availability, FACILITY_AVAILABILITY.CONFIGURED)
assert.equal(pendingResult.data.operationalProfile.provenance.verificationStatus, "PENDING_VERIFICATION")
assert.equal(pendingResult.data.operationalProfile.provenance.dataStatus, "PENDING_VERIFICATION")
assert.equal(pendingResult.data.operationalProfile.provenance.demo, false)

for (const provenance of [
  { dataStatus: "DEMO", verificationStatus: "PENDING_VERIFICATION" },
  { dataStatus: "PENDING_VERIFICATION", verificationStatus: "DEMO_ONLY" },
]) {
  const demoResult = await createFacilityService({
    provider: {
      async getFacilityOperationalProfile() {
        return { facilityId: "library", provenance }
      },
    },
  }).getFacilityById("library")
  assert.equal(demoResult.availability, FACILITY_AVAILABILITY.CONFIGURED)
  assert.equal(demoResult.data.operationalProfile.provenance.demo, true)
}

const failedResult = await createFacilityService({
  provider: {
    async getFacilityOperationalProfile() {
      throw new Error("PostgREST SQL secret=do-not-expose https://example.test?apikey=secret")
    },
  },
}).getFacilityById("library")
assert.equal(failedResult.ok, false)
assert.equal(failedResult.availability, FACILITY_AVAILABILITY.PROVIDER_UNAVAILABLE)
assert.equal(failedResult.error.code, FACILITY_ERROR_CODES.PROVIDER_UNAVAILABLE)
assert.equal(failedResult.error.message, "Facility information is temporarily unavailable.")
assert.equal(failedResult.error.retryable, true)
assert.equal(failedResult.data.facility.id, "library")
assert.equal(failedResult.data.facility.floorId, "3F")
assert.equal(failedResult.data.operationalProfile, null)
assert.doesNotMatch(JSON.stringify(failedResult), /PostgREST|SQL|secret|apikey|example\.test/i)

const mismatchedResult = await createFacilityService({
  provider: {
    async getFacilityOperationalProfile() {
      return { facility_id: "provider-invented-facility", description: "Unsafe" }
    },
  },
}).getFacilityById("library")
assert.equal(mismatchedResult.ok, false)
assert.equal(mismatchedResult.availability, FACILITY_AVAILABILITY.PROVIDER_UNAVAILABLE)
assert.equal(mismatchedResult.data.facility.id, "library")
assert.equal(mismatchedResult.data.operationalProfile, null)

const [localProviderSource, supabaseProviderSource] = await Promise.all([
  readProjectFile("src/providers/facility/localFacilityProvider.js"),
  readProjectFile("src/providers/facility/supabaseFacilityProvider.js"),
])
for (const source of [localProviderSource, supabaseProviderSource]) {
  assert.doesNotMatch(source, /\.(insert|update|upsert|delete)\s*\(/, "Facility providers expose no write operation")
  assert.doesNotMatch(source, /service[_-]?role|sb_secret_/i, "Facility providers contain no privileged credential path")
}
assert.match(supabaseProviderSource, /public_facility_operational_profiles/)
assert.doesNotMatch(supabaseProviderSource, /\.from\(["']facility_operational_profiles["']\)/)

configuredResult.data.facility.floorId = "5F"
configuredResult.data.facility.verification.floor = "DEMO_ONLY"
assert.deepEqual(facilities, originalFacilities, "Canonical facility data remains unchanged")
assert.deepEqual(mapNodes, originalNodes, "Navigation nodes remain unchanged")
assert.deepEqual(mapEdges, originalEdges, "Navigation edges remain unchanged")

console.log(`Phase 4-FS-1B1 provider-neutral facility-profile read path and ${facilities.length} canonical facility identities: PASS`)
