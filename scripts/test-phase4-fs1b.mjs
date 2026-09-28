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
  getServiceAliases as getDefaultServiceAliases,
  getServiceByCode as getDefaultServiceByCode,
  getServices as getDefaultServices,
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

const serviceRows = [
  {
    id: 502,
    code: "student-guidance",
    name: "Student Guidance",
    description: "DEVELOPMENT / PENDING VERIFICATION service",
    department_id: 8,
    lifecycle: "PUBLISHED",
    published_at: "2026-09-20T03:00:00.000Z",
    effective_at: "2026-09-20T03:00:00.000Z",
    expires_at: null,
    verification_status: "PENDING_VERIFICATION",
    data_status: "PENDING_VERIFICATION",
    source_type: "DEVELOPMENT_TEST",
    source_id: "FS-1B2-GUIDANCE",
    source_label: "Pending development fixture",
    last_verified_at: null,
    updated_at: "2026-09-20T03:15:00.000Z",
    recommendation_rank: 1,
  },
  {
    id: 501,
    code: "records-request",
    name: "Records Request",
    description: "DEVELOPMENT / DEMO / NOT OFFICIAL service",
    department_id: 9,
    lifecycle: "PUBLISHED",
    published_at: "2026-09-20T02:00:00.000Z",
    effective_at: "2026-09-20T02:00:00.000Z",
    expires_at: null,
    verification_status: "DEMO_ONLY",
    data_status: "DEMO",
    source_type: "DEVELOPMENT_TEST",
    source_id: "FS-1B2-RECORDS",
    source_label: "Demo development fixture",
    last_verified_at: null,
    updated_at: "2026-09-20T02:15:00.000Z",
    private_actor_id: "not-public",
  },
  {
    id: 503,
    code: "service-without-aliases",
    name: "Service Without Aliases",
    description: null,
    department_id: null,
    lifecycle: "PUBLISHED",
    published_at: "2026-09-20T04:00:00.000Z",
    effective_at: "2026-09-20T04:00:00.000Z",
    expires_at: null,
    verification_status: "PENDING_VERIFICATION",
    data_status: "PENDING_VERIFICATION",
    source_type: "DEVELOPMENT_TEST",
    source_id: "FS-1B2-NO-ALIASES",
    source_label: "No-alias development fixture",
    last_verified_at: null,
    updated_at: "2026-09-20T04:15:00.000Z",
  },
]
const aliasRows = [
  {
    id: 702,
    service_id: 501,
    service_code: "records-request",
    alias: "Transcript Request",
    lifecycle: "PUBLISHED",
    published_at: "2026-09-20T02:00:00.000Z",
    effective_at: "2026-09-20T02:00:00.000Z",
    expires_at: null,
    verification_status: "DEMO_ONLY",
    data_status: "DEMO",
    source_type: "DEVELOPMENT_TEST",
    source_id: "FS-1B2-ALIAS-2",
    source_label: "Demo development fixture",
    last_verified_at: null,
    updated_at: "2026-09-20T02:20:00.000Z",
  },
  {
    id: 701,
    service_id: 501,
    service_code: "records-request",
    alias: "Academic Records",
    lifecycle: "PUBLISHED",
    published_at: "2026-09-20T02:00:00.000Z",
    effective_at: "2026-09-20T02:00:00.000Z",
    expires_at: null,
    verification_status: "DEMO_ONLY",
    data_status: "DEMO",
    source_type: "DEVELOPMENT_TEST",
    source_id: "FS-1B2-ALIAS-1",
    source_label: "Demo development fixture",
    last_verified_at: null,
    updated_at: "2026-09-20T02:20:00.000Z",
  },
]
const serviceProviderCalls = []
const serviceClient = {
  from(view) {
    serviceProviderCalls.push({ method: "from", view })
    const filters = []
    const query = {
      select(columns) { serviceProviderCalls.push({ method: "select", view, columns }); return query },
      eq(column, value) { filters.push([column, value]); serviceProviderCalls.push({ method: "eq", view, column, value }); return query },
      async maybeSingle() {
        serviceProviderCalls.push({ method: "maybeSingle", view })
        const rows = view === "public_services" ? serviceRows : []
        const matches = rows.filter((row) => filters.every(([column, value]) => row[column] === value))
        return { data: matches[0] || null, error: null }
      },
      async order(column, options) {
        serviceProviderCalls.push({ method: "order", view, column, options })
        const rows = view === "public_services"
          ? serviceRows
          : view === "public_service_aliases" ? aliasRows : []
        const matches = rows
          .filter((row) => filters.every(([filterColumn, value]) => row[filterColumn] === value))
          .toSorted((left, right) => String(left[column]).localeCompare(String(right[column])))
        return { data: matches, error: null }
      },
    }
    return query
  },
}
const catalogProvider = createSupabaseFacilityProvider(serviceClient)
const catalogService = createFacilityService({ provider: catalogProvider })

const localCatalogService = createFacilityService({ provider: localProvider })
assert.deepEqual(await localProvider.getServices(), [])
assert.equal(await localProvider.getServiceByCode("records-request"), null)
assert.deepEqual(await localProvider.getServiceAliases("records-request"), [])
for (const result of [
  await localCatalogService.getServices(),
  await getDefaultServices(),
]) {
  assert.equal(result.ok, true)
  assert.equal(result.availability, FACILITY_AVAILABILITY.UNAVAILABLE)
  assert.deepEqual(result.data, [])
  assert.equal(result.error, null)
}
for (const result of [
  await localCatalogService.getServiceByCode("records-request"),
  await getDefaultServiceByCode("records-request"),
]) {
  assert.equal(result.ok, true)
  assert.equal(result.availability, FACILITY_AVAILABILITY.UNAVAILABLE)
  assert.equal(result.data, null)
  assert.equal(result.error, null)
}
for (const result of [
  await localCatalogService.getServiceAliases("records-request"),
  await getDefaultServiceAliases("records-request"),
]) {
  assert.equal(result.ok, true)
  assert.equal(result.availability, FACILITY_AVAILABILITY.UNAVAILABLE)
  assert.deepEqual(result.data, [])
  assert.equal(result.error, null)
}

const catalogResult = await catalogService.getServices()
assert.equal(catalogResult.ok, true)
assert.equal(catalogResult.availability, FACILITY_AVAILABILITY.CONFIGURED)
assert.deepEqual(catalogResult.data.map(({ code }) => code), [
  "records-request",
  "service-without-aliases",
  "student-guidance",
])
assert.equal(catalogResult.data[0].name, "Records Request")
assert.equal(catalogResult.data[0].departmentId, 9)
assert.equal(catalogResult.data[0].provenance.lifecycle, "PUBLISHED")
assert.equal(catalogResult.data[0].provenance.demo, true)
assert.equal(Object.hasOwn(catalogResult.data[0], "id"), false)
assert.equal(Object.hasOwn(catalogResult.data[0], "private_actor_id"), false)
assert.equal(Object.hasOwn(catalogResult.data[0], "recommendationRank"), false)
assert.equal(catalogResult.data[2].provenance.verificationStatus, "PENDING_VERIFICATION")
assert.equal(catalogResult.data[2].provenance.dataStatus, "PENDING_VERIFICATION")
assert.equal(catalogResult.data[2].provenance.demo, false)

const filteredCatalogResult = await catalogService.getServices({ code: "student-guidance" })
assert.equal(filteredCatalogResult.availability, FACILITY_AVAILABILITY.CONFIGURED)
assert.deepEqual(filteredCatalogResult.data.map(({ code }) => code), ["student-guidance"])

const unsupportedFilterCallCount = serviceProviderCalls.length
const unsupportedFilterResult = await catalogService.getServices({ query: "records" })
assert.equal(unsupportedFilterResult.ok, false)
assert.equal(unsupportedFilterResult.availability, FACILITY_AVAILABILITY.UNAVAILABLE)
assert.deepEqual(unsupportedFilterResult.data, [])
assert.equal(unsupportedFilterResult.error.code, FACILITY_ERROR_CODES.SERVICE_NOT_FOUND)
assert.equal(serviceProviderCalls.length, unsupportedFilterCallCount)

const serviceByCodeResult = await catalogService.getServiceByCode("records-request")
assert.equal(serviceByCodeResult.ok, true)
assert.equal(serviceByCodeResult.availability, FACILITY_AVAILABILITY.CONFIGURED)
assert.equal(serviceByCodeResult.data.code, "records-request")
assert.equal(serviceByCodeResult.data.name, "Records Request")
assert.equal(serviceByCodeResult.data.provenance.verificationStatus, "DEMO_ONLY")
assert.equal(serviceByCodeResult.data.provenance.dataStatus, "DEMO")
assert.equal(serviceByCodeResult.data.provenance.demo, true)
assert.equal(Object.hasOwn(serviceByCodeResult.data, "id"), false)

const invalidServiceQueryCount = serviceProviderCalls.length
const invalidServiceResult = await catalogService.getServiceByCode("Records Request")
assert.equal(invalidServiceResult.ok, false)
assert.equal(invalidServiceResult.availability, FACILITY_AVAILABILITY.UNAVAILABLE)
assert.equal(invalidServiceResult.error.code, FACILITY_ERROR_CODES.SERVICE_NOT_FOUND)
assert.equal(invalidServiceResult.error.message, "Service not found.")
assert.equal(invalidServiceResult.error.retryable, false)
assert.equal(serviceProviderCalls.length, invalidServiceQueryCount)

const unknownServiceResult = await catalogService.getServiceByCode("unknown-service")
assert.equal(unknownServiceResult.ok, false)
assert.equal(unknownServiceResult.availability, FACILITY_AVAILABILITY.UNAVAILABLE)
assert.equal(unknownServiceResult.data, null)
assert.equal(unknownServiceResult.error.code, FACILITY_ERROR_CODES.SERVICE_NOT_FOUND)

const aliasesResult = await catalogService.getServiceAliases("records-request")
assert.equal(aliasesResult.ok, true)
assert.equal(aliasesResult.availability, FACILITY_AVAILABILITY.CONFIGURED)
assert.deepEqual(aliasesResult.data.map(({ alias }) => alias), ["Academic Records", "Transcript Request"])
assert.ok(aliasesResult.data.every(({ serviceCode }) => serviceCode === "records-request"))
assert.ok(aliasesResult.data.every((alias) => alias.provenance.demo))
assert.equal(Object.hasOwn(aliasesResult.data[0], "id"), false)
assert.equal(Object.hasOwn(aliasesResult.data[0], "serviceId"), false)
assert.notEqual(aliasesResult.data[0].provenance, serviceByCodeResult.data.provenance)

const emptyAliasesResult = await catalogService.getServiceAliases("service-without-aliases")
assert.equal(emptyAliasesResult.ok, true)
assert.equal(emptyAliasesResult.availability, FACILITY_AVAILABILITY.CONFIGURED)
assert.deepEqual(emptyAliasesResult.data, [])
assert.equal(emptyAliasesResult.error, null)

const aliasCallCount = serviceProviderCalls.filter(({ view }) => view === "public_service_aliases").length
const unknownAliasResult = await catalogService.getServiceAliases("unknown-service")
assert.equal(unknownAliasResult.ok, false)
assert.equal(unknownAliasResult.error.code, FACILITY_ERROR_CODES.SERVICE_NOT_FOUND)
assert.deepEqual(unknownAliasResult.data, [])
assert.equal(
  serviceProviderCalls.filter(({ view }) => view === "public_service_aliases").length,
  aliasCallCount,
  "Unknown service codes do not query aliases",
)

assert.ok(serviceProviderCalls.some(({ method, view }) => method === "from" && view === "public_services"))
assert.ok(serviceProviderCalls.some(({ method, view }) => method === "from" && view === "public_service_aliases"))
assert.ok(serviceProviderCalls.some(({ method, view, column, value }) => (
  method === "eq" && view === "public_services" && column === "code" && value === "records-request"
)))
assert.ok(serviceProviderCalls.some(({ method, view, column, value }) => (
  method === "eq" && view === "public_service_aliases" && column === "service_code" && value === "records-request"
)))
assert.ok(serviceProviderCalls.some(({ method, view, column }) => (
  method === "order" && view === "public_services" && column === "code"
)))
assert.ok(serviceProviderCalls.some(({ method, view, column }) => (
  method === "order" && view === "public_service_aliases" && column === "alias"
)))

const secretProviderError = new Error("PostgREST SQL secret=do-not-expose https://example.test?apikey=secret")
const failingCatalogService = createFacilityService({
  provider: {
    async getFacilityOperationalProfile() { throw secretProviderError },
    async getServices() { throw secretProviderError },
    async getServiceByCode(code) {
      if (code === "aliases-fail") return { code, name: "Aliases Fail" }
      throw secretProviderError
    },
    async getServiceAliases() { throw secretProviderError },
  },
})
for (const result of [
  await failingCatalogService.getServices(),
  await failingCatalogService.getServiceByCode("records-request"),
  await failingCatalogService.getServiceAliases("aliases-fail"),
]) {
  assert.equal(result.ok, false)
  assert.equal(result.availability, FACILITY_AVAILABILITY.PROVIDER_UNAVAILABLE)
  assert.equal(result.error.code, FACILITY_ERROR_CODES.PROVIDER_UNAVAILABLE)
  assert.equal(result.error.retryable, true)
  assert.doesNotMatch(JSON.stringify(result), /PostgREST|SQL|secret|apikey|example\.test/i)
}

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

const [localProviderSource, supabaseProviderSource, facilityServiceSource] = await Promise.all([
  readProjectFile("src/providers/facility/localFacilityProvider.js"),
  readProjectFile("src/providers/facility/supabaseFacilityProvider.js"),
  readProjectFile("src/services/facilityService.js"),
])
for (const source of [localProviderSource, supabaseProviderSource]) {
  assert.doesNotMatch(source, /\.(insert|update|upsert|delete)\s*\(/, "Facility providers expose no write operation")
  assert.doesNotMatch(source, /service[_-]?role|sb_secret_/i, "Facility providers contain no privileged credential path")
}
assert.match(supabaseProviderSource, /public_facility_operational_profiles/)
assert.match(supabaseProviderSource, /public_services/)
assert.match(supabaseProviderSource, /public_service_aliases/)
assert.doesNotMatch(supabaseProviderSource, /\.from\(["']facility_operational_profiles["']\)/)
assert.doesNotMatch(supabaseProviderSource, /\.from\(["']services["']\)/)
assert.doesNotMatch(supabaseProviderSource, /\.from\(["']service_aliases["']\)/)
assert.doesNotMatch(supabaseProviderSource, /\.(ilike|textSearch|or)\s*\(/)
assert.doesNotMatch(facilityServiceSource, /searchFacilities|getFacilitiesByService|getServicesForFacility/)

configuredResult.data.facility.floorId = "5F"
configuredResult.data.facility.verification.floor = "DEMO_ONLY"
assert.deepEqual(facilities, originalFacilities, "Canonical facility data remains unchanged")
assert.deepEqual(mapNodes, originalNodes, "Navigation nodes remain unchanged")
assert.deepEqual(mapEdges, originalEdges, "Navigation edges remain unchanged")

console.log(`Phase 4-FS-1B1/2 provider-neutral facility/profile/service/alias read contracts and ${facilities.length} canonical facility identities: PASS`)
