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
import {
  getCampusDateRangeBounds,
  isValidCampusDateKey,
  normalizeCampusDateRange,
} from "../src/lib/campusTime.js"
import { createLocalFacilityProvider } from "../src/providers/facility/localFacilityProvider.js"
import { createSupabaseFacilityProvider } from "../src/providers/facility/supabaseFacilityProvider.js"
import {
  createFacilityService,
  getFacilityHours as getDefaultFacilityHours,
} from "../src/services/facilityService.js"

const projectRoot = new URL("..", import.meta.url)
const readProjectFile = (path) => readFile(new URL(path, projectRoot), "utf8")
const snapshot = (value) => JSON.parse(JSON.stringify(value))
const originalFacilities = snapshot(facilities)
const originalNodes = snapshot(mapNodes)
const originalEdges = snapshot(mapEdges)

const provenance = ({
  sourceId,
  verificationStatus = "PENDING_VERIFICATION",
  dataStatus = "PENDING_VERIFICATION",
  effectiveAt = "2026-09-30T16:00:00.000Z",
  expiresAt = null,
  includeNarrowFields = true,
} = {}) => ({
  lifecycle: "PUBLISHED",
  published_at: "2026-09-30T16:00:00.000Z",
  effective_at: effectiveAt,
  expires_at: expiresAt,
  verification_status: verificationStatus,
  data_status: dataStatus,
  source_type: "DEVELOPMENT_TEST",
  source_id: sourceId,
  ...(includeNarrowFields ? {
    source_label: "DEVELOPMENT / DEMO / NOT OFFICIAL",
    last_verified_at: verificationStatus === "SOURCE_ALIGNED"
      ? "2026-09-30T15:00:00.000Z"
      : null,
  } : {}),
  updated_at: "2026-10-01T00:00:00.000Z",
  created_by: "private-actor",
  updated_by: "private-actor",
})

const weeklyRows = [
  {
    id: 904,
    facility_id: "library",
    day_of_week: 1,
    closed_all_day: false,
    start_time: "13:00:00",
    end_time: "17:00:00",
    ...provenance({ sourceId: "FS-2B-WEEKLY-4" }),
    floor: "5F",
    coordinates: { x: 999, y: 999 },
    nodes: ["unsafe-node"],
    edges: ["unsafe-edge"],
    routing: { replace: true },
    qrRelationships: ["unsafe-qr"],
    emergencyRoute: ["unsafe-route"],
  },
  {
    id: 901,
    facility_id: "library",
    day_of_week: 0,
    closed_all_day: true,
    start_time: null,
    end_time: null,
    ...provenance({ sourceId: "FS-2B-WEEKLY-1" }),
  },
  {
    id: 903,
    facility_id: "library",
    day_of_week: 1,
    closed_all_day: false,
    start_time: "08:00:00",
    end_time: "12:00:00",
    ...provenance({ sourceId: "FS-2B-WEEKLY-3" }),
  },
  {
    id: 902,
    facility_id: "library",
    day_of_week: 2,
    closed_all_day: false,
    start_time: "22:00:00",
    end_time: "02:00:00",
    ...provenance({
      sourceId: "FS-2B-WEEKLY-2",
      verificationStatus: "DEMO_ONLY",
      dataStatus: "DEMO",
    }),
  },
]

const exceptionRows = [
  {
    id: 1004,
    facility_id: "library",
    exception_date: "2026-10-08",
    closed_all_day: true,
    start_time: null,
    end_time: null,
    ...provenance({ sourceId: "FS-2B-EXCEPTION-OUTSIDE" }),
  },
  {
    id: 1003,
    facility_id: "library",
    exception_date: "2026-10-07",
    closed_all_day: false,
    start_time: "10:00:00",
    end_time: "14:00:00",
    ...provenance({ sourceId: "FS-2B-EXCEPTION-END" }),
  },
  {
    id: 1002,
    facility_id: "library",
    exception_date: "2026-10-05",
    closed_all_day: false,
    start_time: "13:00:00",
    end_time: "16:00:00",
    ...provenance({ sourceId: "FS-2B-EXCEPTION-START-B" }),
  },
  {
    id: 1001,
    facility_id: "library",
    exception_date: "2026-10-05",
    closed_all_day: false,
    start_time: "09:00:00",
    end_time: "12:00:00",
    ...provenance({
      sourceId: "FS-2B-EXCEPTION-START-A",
      verificationStatus: "SOURCE_ALIGNED",
      dataStatus: "ACTIVE",
    }),
  },
  {
    id: 1000,
    facility_id: "library",
    exception_date: "2026-10-04",
    closed_all_day: true,
    start_time: null,
    end_time: null,
    ...provenance({ sourceId: "FS-2B-EXCEPTION-BEFORE" }),
  },
]

const advisoryRows = [
  {
    id: 1104,
    facility_id: "library",
    advisory_type: "TEMPORARY_CLOSURE",
    ...provenance({
      sourceId: "FS-2B-CLOSURE-AFTER",
      effectiveAt: "2026-10-07T16:00:00.000Z",
      expiresAt: null,
      includeNarrowFields: false,
    }),
    message: "private content",
  },
  {
    id: 1103,
    facility_id: "library",
    advisory_type: "SERVICE_INTERRUPTION",
    ...provenance({
      sourceId: "FS-2B-SERVICE-INTERRUPTION",
      effectiveAt: "2026-10-05T00:00:00.000Z",
      expiresAt: "2026-10-06T00:00:00.000Z",
      includeNarrowFields: false,
    }),
  },
  {
    id: 1102,
    facility_id: "library",
    advisory_type: "TEMPORARY_CLOSURE",
    ...provenance({
      sourceId: "FS-2B-CLOSURE-LATE",
      effectiveAt: "2026-10-07T15:59:59.000Z",
      expiresAt: null,
      includeNarrowFields: false,
    }),
  },
  {
    id: 1101,
    facility_id: "library",
    advisory_type: "TEMPORARY_CLOSURE",
    ...provenance({
      sourceId: "FS-2B-CLOSURE-EARLY",
      effectiveAt: "2026-10-04T16:00:00.000Z",
      expiresAt: "2026-10-05T08:00:00.000Z",
      includeNarrowFields: false,
    }),
  },
  {
    id: 1100,
    facility_id: "library",
    advisory_type: "TEMPORARY_CLOSURE",
    ...provenance({
      sourceId: "FS-2B-CLOSURE-BEFORE",
      effectiveAt: "2026-10-01T00:00:00.000Z",
      expiresAt: "2026-10-04T16:00:00.000Z",
      includeNarrowFields: false,
    }),
  },
]

const providerCalls = []
const rowsByView = {
  public_facility_hours: weeklyRows,
  public_facility_hour_exceptions: exceptionRows,
  public_facility_status_advisories: advisoryRows,
}

const supabaseClient = {
  from(view) {
    providerCalls.push({ method: "from", view })
    const filters = []
    const orders = []
    const query = {
      select(columns) { providerCalls.push({ method: "select", view, columns }); return query },
      eq(column, value) { filters.push(["eq", column, value]); providerCalls.push({ method: "eq", view, column, value }); return query },
      gte(column, value) { filters.push(["gte", column, value]); providerCalls.push({ method: "gte", view, column, value }); return query },
      lte(column, value) { filters.push(["lte", column, value]); providerCalls.push({ method: "lte", view, column, value }); return query },
      order(column, options) { orders.push([column, options]); providerCalls.push({ method: "order", view, column, options }); return query },
      then(resolve, reject) {
        const data = (rowsByView[view] || [])
          .filter((row) => filters.every(([operator, column, value]) => (
            operator === "eq" ? row[column] === value
              : operator === "gte" ? row[column] >= value
                : row[column] <= value
          )))
          .toSorted((left, right) => {
            for (const [column, options] of orders) {
              const leftValue = left[column]
              const rightValue = right[column]
              if (leftValue === rightValue) continue
              const nullsFirst = options?.nullsFirst !== false
              if (leftValue === null) return nullsFirst ? -1 : 1
              if (rightValue === null) return nullsFirst ? 1 : -1
              const comparison = typeof leftValue === "number"
                ? leftValue - rightValue
                : String(leftValue).localeCompare(String(rightValue))
              if (comparison) return options?.ascending === false ? -comparison : comparison
            }
            return 0
          })
        return Promise.resolve({ data, error: null }).then(resolve, reject)
      },
    }
    return query
  },
}

const localProvider = createLocalFacilityProvider()
const supabaseProvider = createSupabaseFacilityProvider(supabaseClient)
for (const method of FACILITY_PROVIDER_METHODS) {
  assert.equal(typeof localProvider[method], "function", `Local provider exposes ${method}`)
  assert.equal(typeof supabaseProvider[method], "function", `Supabase provider exposes ${method}`)
}
assert.equal(typeof getDefaultFacilityHours, "function")

const localSource = await localProvider.getFacilityHours("library")
assert.deepEqual(localSource, { weeklyHours: [], exceptions: [], statusAdvisories: [] })
const localResult = await createFacilityService({ provider: localProvider }).getFacilityHours("library")
assert.equal(localResult.ok, true)
assert.equal(localResult.availability, FACILITY_AVAILABILITY.UNAVAILABLE)
assert.equal(localResult.data.facility.id, "library")
assert.equal(localResult.data.facility.floorId, "3F")
assert.equal(localResult.data.dateRange, null)
assert.deepEqual(localResult.data.weeklyHours, [])
assert.deepEqual(localResult.data.exceptions, [])
assert.deepEqual(localResult.data.statusAdvisories, [])
assert.equal(localResult.error, null)

assert.equal(isValidCampusDateKey("2026-02-28"), true)
assert.equal(isValidCampusDateKey("2026-02-29"), false)
assert.equal(isValidCampusDateKey("2024-02-29"), true)
assert.equal(isValidCampusDateKey("0000-01-01"), false)
assert.deepEqual(normalizeCampusDateRange(null), null)
assert.deepEqual(normalizeCampusDateRange(undefined), null)
assert.deepEqual(normalizeCampusDateRange({ startDate: "2026-10-05", endDate: "2026-10-07" }), {
  startDate: "2026-10-05",
  endDate: "2026-10-07",
})
assert.deepEqual(getCampusDateRangeBounds({ startDate: "2026-10-05", endDate: "2026-10-07" }), {
  startAt: "2026-10-04T16:00:00.000Z",
  endAt: "2026-10-07T16:00:00.000Z",
})

const service = createFacilityService({ provider: supabaseProvider })
const result = await service.getFacilityHours("library", {
  startDate: "2026-10-05",
  endDate: "2026-10-07",
})
assert.equal(result.ok, true)
assert.equal(result.availability, FACILITY_AVAILABILITY.CONFIGURED)
assert.equal(result.error, null)
assert.equal(result.data.facility.id, "library")
assert.equal(result.data.facility.floorId, "3F")
assert.deepEqual(result.data.dateRange, { startDate: "2026-10-05", endDate: "2026-10-07" })
assert.deepEqual(result.data.weeklyHours.map((row) => [row.dayOfWeek, row.startTime, row.endTime]), [
  [0, null, null],
  [1, "08:00:00", "12:00:00"],
  [1, "13:00:00", "17:00:00"],
  [2, "22:00:00", "02:00:00"],
])
assert.equal(result.data.weeklyHours[0].closedAllDay, true)
assert.equal(result.data.weeklyHours[3].startTime, "22:00:00")
assert.equal(result.data.weeklyHours[3].endTime, "02:00:00")
assert.deepEqual(result.data.exceptions.map((row) => [row.exceptionDate, row.startTime]), [
  ["2026-10-05", "09:00:00"],
  ["2026-10-05", "13:00:00"],
  ["2026-10-07", "10:00:00"],
])
assert.deepEqual(result.data.statusAdvisories.map((row) => row.provenance.sourceId), [
  "FS-2B-CLOSURE-EARLY",
  "FS-2B-CLOSURE-LATE",
])
assert.ok(result.data.statusAdvisories.every((row) => row.advisoryType === "TEMPORARY_CLOSURE"))
assert.equal(result.data.statusAdvisories.some((row) => row.provenance.sourceId === "FS-2B-SERVICE-INTERRUPTION"), false)

const viewsRead = providerCalls.filter(({ method }) => method === "from").map(({ view }) => view)
assert.deepEqual(viewsRead, [
  "public_facility_hours",
  "public_facility_hour_exceptions",
  "public_facility_status_advisories",
])
assert.ok(providerCalls.some((call) => call.method === "gte" && call.column === "exception_date" && call.value === "2026-10-05"))
assert.ok(providerCalls.some((call) => call.method === "lte" && call.column === "exception_date" && call.value === "2026-10-07"))
assert.equal(providerCalls.filter((call) => call.method === "eq" && call.column === "facility_id").length, 3)
assert.equal(providerCalls.some((call) => call.view === "facility_hours"), false)
assert.equal(providerCalls.some((call) => call.view === "facility_hour_exceptions"), false)
assert.equal(providerCalls.some((call) => call.view === "facility_advisories"), false)

assert.equal(result.data.weeklyHours[0].provenance.verificationStatus, "PENDING_VERIFICATION")
assert.equal(result.data.weeklyHours[0].provenance.dataStatus, "PENDING_VERIFICATION")
assert.equal(result.data.weeklyHours[0].provenance.demo, false)
assert.equal(result.data.weeklyHours[3].provenance.verificationStatus, "DEMO_ONLY")
assert.equal(result.data.weeklyHours[3].provenance.dataStatus, "DEMO")
assert.equal(result.data.weeklyHours[3].provenance.demo, true)
assert.equal(result.data.statusAdvisories[0].provenance.sourceLabel, null)
assert.equal(result.data.statusAdvisories[0].provenance.lastVerifiedAt, null)

for (const collection of [result.data.weeklyHours, result.data.exceptions, result.data.statusAdvisories]) {
  for (const row of collection) {
    for (const forbiddenField of [
      "id", "createdBy", "updatedBy", "created_by", "updated_by", "floor", "coordinates",
      "map", "nodes", "edges", "routing", "qrRelationships", "emergencyRoute", "message",
    ]) {
      assert.equal(Object.hasOwn(row, forbiddenField), false, `${forbiddenField} is not exposed`)
    }
  }
}

const noRangeCallStart = providerCalls.length
const noRangeResult = await service.getFacilityHours("library")
assert.equal(noRangeResult.availability, FACILITY_AVAILABILITY.CONFIGURED)
assert.equal(noRangeResult.data.exceptions.length, exceptionRows.length)
assert.equal(noRangeResult.data.statusAdvisories.length, 4)
assert.equal(
  providerCalls.slice(noRangeCallStart).some((call) => call.method === "gte" || call.method === "lte"),
  false,
)

const oneDayResult = await service.getFacilityHours("library", {
  startDate: "2026-10-05",
  endDate: "2026-10-05",
})
assert.deepEqual(oneDayResult.data.exceptions.map((row) => row.exceptionDate), ["2026-10-05", "2026-10-05"])

let validationProviderCalls = 0
const validationService = createFacilityService({
  provider: {
    async getFacilityHours() {
      validationProviderCalls += 1
      return { weeklyHours: [], exceptions: [], statusAdvisories: [] }
    },
  },
})
const invalidRanges = [
  "2026-10-05",
  new Date("2026-10-05T00:00:00Z"),
  { startDate: "2026-02-29", endDate: "2026-03-01" },
  { startDate: "2026-10-08", endDate: "2026-10-07" },
  { startDate: "2026-10-05" },
  { endDate: "2026-10-07" },
  { from: "2026-10-05", to: "2026-10-07" },
  { startDate: "2026-10-05", endDate: "2026-10-07", extra: true },
  { startDate: "2026-10-05T00:00:00+08:00", endDate: "2026-10-07" },
]
for (const invalidRange of invalidRanges) {
  const invalidResult = await validationService.getFacilityHours("library", invalidRange)
  assert.equal(invalidResult.ok, false)
  assert.equal(invalidResult.availability, FACILITY_AVAILABILITY.UNAVAILABLE)
  assert.equal(invalidResult.data, null)
  assert.equal(invalidResult.error.code, FACILITY_ERROR_CODES.INVALID_DATE_RANGE)
  assert.equal(invalidResult.error.message, "Date range is invalid.")
  assert.equal(invalidResult.error.retryable, false)
}
assert.equal(validationProviderCalls, 0)

const invalidFacilityResult = await validationService.getFacilityHours("not-a-canonical-facility", {
  startDate: "2026-10-05",
  endDate: "2026-10-07",
})
assert.equal(invalidFacilityResult.error.code, FACILITY_ERROR_CODES.NOT_FOUND)
assert.equal(validationProviderCalls, 0)

const secretProviderError = new Error("PostgREST SQL https://example.test?apikey=secret")
const failureResult = await createFacilityService({
  provider: { async getFacilityHours() { throw secretProviderError } },
}).getFacilityHours("library")
assert.equal(failureResult.ok, false)
assert.equal(failureResult.availability, FACILITY_AVAILABILITY.PROVIDER_UNAVAILABLE)
assert.equal(failureResult.error.code, FACILITY_ERROR_CODES.PROVIDER_UNAVAILABLE)
assert.equal(failureResult.error.retryable, true)
assert.equal(failureResult.data.facility.id, "library")
assert.deepEqual(failureResult.data.weeklyHours, [])
assert.doesNotMatch(JSON.stringify(failureResult), /PostgREST|SQL|secret|apikey|example\.test/i)

const malformedResult = await createFacilityService({
  provider: {
    async getFacilityHours() {
      return {
        weeklyHours: [{
          facilityId: "library",
          dayOfWeek: 7,
          closedAllDay: false,
          startTime: "09:00:00",
          endTime: "17:00:00",
          ...provenance({ sourceId: "MALFORMED" }),
        }],
        exceptions: [],
        statusAdvisories: [],
      }
    },
  },
}).getFacilityHours("library")
assert.equal(malformedResult.ok, false)
assert.equal(malformedResult.availability, FACILITY_AVAILABILITY.PROVIDER_UNAVAILABLE)

const [localProviderSource, supabaseProviderSource, facilityServiceSource] = await Promise.all([
  readProjectFile("src/providers/facility/localFacilityProvider.js"),
  readProjectFile("src/providers/facility/supabaseFacilityProvider.js"),
  readProjectFile("src/services/facilityService.js"),
])
for (const source of [localProviderSource, supabaseProviderSource]) {
  assert.doesNotMatch(source, /\.(insert|update|upsert|delete|rpc)\s*\(/)
  assert.doesNotMatch(source, /service[_-]?role|sb_secret_/i)
}
for (const baseTable of ["facility_hours", "facility_hour_exceptions", "facility_advisories"]) {
  assert.doesNotMatch(supabaseProviderSource, new RegExp(`["']${baseTable}["']`))
}
assert.match(supabaseProviderSource, /public_facility_hours/)
assert.match(supabaseProviderSource, /public_facility_hour_exceptions/)
assert.match(supabaseProviderSource, /public_facility_status_advisories/)
assert.doesNotMatch(facilityServiceSource, /OPEN_NOW|CLOSING_SOON|SCHEDULED_TO_OPEN|TEMPORARILY_UNAVAILABLE/)

assert.deepEqual(facilities, originalFacilities)
assert.deepEqual(mapNodes, originalNodes)
assert.deepEqual(mapEdges, originalEdges)

console.log(`Phase 4-FS-2B1 provider-neutral facility-hours aggregate read and ${facilities.length} canonical facility identities: PASS`)
