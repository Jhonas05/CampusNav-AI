import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { performance } from "node:perf_hooks"
import { fileURLToPath } from "node:url"
import React from "react"
import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router-dom/server.js"
import { createServer } from "vite"
import { facilities } from "../src/data/facilities.js"
import {
  createFacilityService, createFacilityDiscoveryIndex, searchFacilities,
  createConfiguredServiceRecommendationIndex, getConfiguredServiceRecommendations,
} from "../src/services/facilityService.js"
import { createSupabaseFacilityProvider } from "../src/providers/facility/supabaseFacilityProvider.js"
import { discoveryFixtures, discoveryTime, discoveryProvenance, discoveryMapping } from "./fixtures/facilityDiscoveryFixtures.mjs"

let checks = 0
const check = async (name, run) => { await run(); checks++; console.log(`PASS ${checks}: ${name}`) }
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")
const load = (records = discoveryFixtures()) => createFacilityService({
  provider: { getFacilityDiscoveryData: async () => structuredClone(records) }, clock: () => discoveryTime,
}).getFacilityDiscoveryData(undefined, { includeConfiguredMappings: true })
const recommend = (data, code = "fixture-records", options = {}) => getConfiguredServiceRecommendations(code, {
  recommendationIndex: createConfiguredServiceRecommendationIndex(data), dateTime: discoveryTime, ...options,
})
const ids = (result) => result.data.recommendations.map(({ facility }) => facility.id)
const records = discoveryFixtures()
records.mappings[0].recommendationRank = 20
records.mappings[1].recommendationRank = 5
const snapshot = await load(records)

await check("Published configured locations sort by administrative rank", () => assert.deepEqual(ids(recommend(snapshot.data)), ["registrar-office", "library"]))
await check("Equal ranks use stable canonical facility ID ties, not dataset order", async () => {
  const source = discoveryFixtures()
  source.mappings.push(discoveryMapping("fixture-records", "computer-laboratory"))
  const result = await load(source)
  assert.deepEqual(ids(recommend(result.data)), ["computer-laboratory", "library", "registrar-office"])
  source.mappings.reverse()
  assert.deepEqual(ids(recommend((await load(source)).data)), ids(recommend(result.data)))
})
await check("One explicit mapping produces exactly one canonical location", async () => {
  const source = discoveryFixtures(); source.mappings = [source.mappings[0]]
  assert.deepEqual(ids(recommend((await load(source)).data)), ["library"])
})
await check("Identical duplicate mappings deduplicate without changing order", async () => {
  const source = structuredClone(records); source.mappings.push(structuredClone(source.mappings[1]))
  assert.deepEqual(ids(recommend((await load(source)).data)), ["registrar-office", "library"])
})
await check("Conflicting duplicates fail closed instead of guessing an order", async () => {
  const source = structuredClone(records); source.mappings.push({ ...source.mappings[0], recommendationRank: 1 })
  assert.equal(recommend((await load(source)).data).availability, "PROVIDER_UNAVAILABLE")
})
for (const [label, overrides] of [
  ["draft", { lifecycle: "DRAFT" }], ["expired", { expiresAt: discoveryTime }],
  ["future effective", { effectiveAt: "2026-10-16T00:00:00Z" }],
  ["future publication", { publishedAt: "2026-10-16T00:00:00Z" }],
  ["pending", { verificationStatus: "PENDING_VERIFICATION" }],
  ["DEMO", { dataStatus: "DEMO" }], ["DEMO_ONLY", { verificationStatus: "DEMO_ONLY" }],
  ["bad source", { sourceLabel: { private: "PRIVATE_CANARY" } }],
]) for (const section of ["services", "mappings"]) await check(`${label} ${section} excluded`, async () => {
  const source = discoveryFixtures()
  source[section] = source[section].map((row) => ({ ...row, provenance: discoveryProvenance(overrides) }))
  const result = recommend((await load(source)).data)
  assert.ok(!result.ok || result.data.recommendations.length === 0)
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_CANARY/)
})
await check("Missing parent service prevents recommendations", async () => {
  const source = discoveryFixtures(); source.services = []
  assert.equal(recommend((await load(source)).data).error.code, "SERVICE_NOT_FOUND")
})
await check("No mapping never infers a facility from a service name or category", async () => {
  const source = discoveryFixtures(); source.services[0].name = "Library"; source.mappings = []
  assert.deepEqual(ids(recommend((await load(source)).data)), [])
  assert.deepEqual(ids(recommend(snapshot.data, "fixture-unmapped")), [])
})
await check("Noncanonical IDs and provider identity overrides are never accepted", async () => {
  const before = structuredClone(facilities), source = discoveryFixtures()
  source.mappings[0].facility = { name: "PRIVATE_CANARY", floorId: "GF" }
  source.mappings.push(discoveryMapping("fixture-records", "unknown-facility"))
  const result = recommend((await load(source)).data)
  assert.deepEqual(result.data.recommendations[0].facility, facilities.find(({ id }) => id === "library"))
  result.data.recommendations[0].facility.name = "changed"
  assert.deepEqual(facilities, before)
})
await check("Independent safe service/mapping provenance survives without private notes", async () => {
  const source = discoveryFixtures(); source.mappings[0].privateNotes = "PRIVATE_CANARY"; source.mappings[0].publicNotes = "IGNORED_CANARY"
  source.services[0].provenance.verificationStatus = "SOURCE_ALIGNED"
  const result = recommend((await load(source)).data)
  assert.equal(result.data.service.provenance.verificationStatus, "SOURCE_ALIGNED")
  assert.equal(result.data.recommendations[0].mapping.provenance.verificationStatus, "VERIFIED")
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_CANARY|IGNORED_CANARY/)
})
for (const rank of [null, 0, 1001, 1.5, "5"]) await check(`Invalid rank ${JSON.stringify(rank)} fails safely`, async () => {
  const source = discoveryFixtures(); source.mappings[0].recommendationRank = rank
  const result = await load(source); assert.equal(result.ok, false); assert.equal(result.data, null)
})
await check("Loaded service and mapping expiry are checked again at composition time", async () => {
  for (const section of ["services", "mappings"]) {
    const source = discoveryFixtures(); source[section][0].provenance.expiresAt = "2026-10-15T03:00:00Z"
    const data = (await load(source)).data
    assert.equal(data.nextRefreshAt, "2026-10-15T03:00:00.000Z")
    const result = recommend(data, "fixture-records", { dateTime: "2026-10-15T03:00:00Z" })
    assert.ok(!result.ok || !ids(result).includes("library"))
  }
})
await check("Filters restrict configured locations without reranking remaining IDs", () => assert.deepEqual(ids(recommend(snapshot.data, "fixture-records", { facilityIds: ["library"] })), ["library"]))
await check("Status and distance inputs cannot filter or rerank configured locations", () => {
  for (const status of ["CLOSED", "TEMPORARILY_UNAVAILABLE", "UNKNOWN"]) {
    assert.deepEqual(ids(recommend(snapshot.data, "fixture-records", { status, distance: { library: 0, "registrar-office": 9999 } })), ["registrar-office", "library"])
  }
})
await check("Existing canonical/service/alias search relevance ignores configured ranks", () => {
  const discoveryIndex = createFacilityDiscoveryIndex(snapshot.data)
  for (const query of ["Fixture Transcript", "Fixture Records", "Records Service"]) {
    const result = searchFacilities(query, { discoveryIndex, dateTime: discoveryTime })
    assert.deepEqual(result.results.map(({ facility }) => facility.id), ["library", "registrar-office"])
    assert.deepEqual(result.matchedServices, [{ code: "fixture-records", name: "Fixture Records Service" }])
    assert.doesNotMatch(JSON.stringify(result), /recommendationRank/)
  }
  assert.equal(searchFacilities("Fixture Transcrip", { discoveryIndex }).count, 0)
  assert.equal(searchFacilities("Library", { discoveryIndex }).results[0].facility.id, "library")
})
await check("Offline suppresses loaded recommendations and null snapshot fails safely", () => {
  assert.equal(recommend(snapshot.data, "fixture-records", { isOnline: false }).data, null)
  assert.equal(recommend(null).availability, "PROVIDER_UNAVAILABLE")
})
await check("Invalid code and ambiguous local time return safe errors", () => {
  assert.equal(recommend(snapshot.data, "NOT VALID").error.code, "SERVICE_NOT_FOUND")
  assert.equal(recommend(snapshot.data, "fixture-records", { dateTime: "2026-10-15 10:00" }).error.code, "FACILITY_INVALID_DATE_TIME")
})
await check("Provider errors remain sanitized and retryable", async () => {
  const result = await createFacilityService({ provider: { getFacilityDiscoveryData: async () => { throw new Error("PRIVATE_CANARY") } } }).getFacilityDiscoveryData(undefined, { includeConfiguredMappings: true })
  assert.equal(result.error.retryable, true); assert.equal(result.data, null); assert.doesNotMatch(JSON.stringify(result), /PRIVATE_CANARY/)
})
await check("Opt-in contract retains legacy rank-free discovery payload and same aggregate read", async () => {
  let calls = 0
  const service = createFacilityService({ provider: { getFacilityDiscoveryData: async () => { calls++; return records } } })
  const legacy = await service.getFacilityDiscoveryData(discoveryTime)
  assert.doesNotMatch(JSON.stringify(legacy.data), /recommendationRank|configuredMappings/)
  const enriched = await service.getFacilityDiscoveryData(discoveryTime, { includeConfiguredMappings: true })
  assert.equal(calls, 2); assert.equal(enriched.data.configuredMappings.length, 2)
  assert.deepEqual(enriched.data.mappings, legacy.data.mappings)
})
await check("Configured snapshot reuses exactly three bounded complete public projection queries", async () => {
  const calls = [], limits = []
  const client = { from(view) {
    calls.push(view)
    const query = { select(_columns, options) { assert.equal(options.count, "exact"); return query }, order() { return query }, limit(value) { limits.push(value); return query }, then(resolve) { return Promise.resolve({ data: [], count: 0, error: null }).then(resolve) } }
    return query
  } }
  const result = await createFacilityService({ provider: createSupabaseFacilityProvider(client) }).getFacilityDiscoveryData(discoveryTime, { includeConfiguredMappings: true })
  assert.equal(result.ok, true)
  assert.deepEqual(calls, ["public_services", "public_service_aliases", "public_facility_service_mappings"])
  assert.deepEqual(limits, [1000, 1000, 1000])
})

const [page, component, algorithm, worker] = await Promise.all([read("src/pages/Facilities.jsx"), read("src/components/facilities/ConfiguredServiceLocations.jsx"), read("src/services/facilityRecommendations.js"), read("src/service-worker.js")])
const snapshotSource = await read("src/services/facilityDiscoverySnapshot.js")
await check("React memoizes composition, masks offline/loading and performs no private query", () => {
  assert.match(page, /useFacilityDiscovery\(\)/)
  assert.match(snapshotSource, /createConfiguredServiceRecommendationIndex\(result.data\)/)
  assert.match(page, /connectivity\.isOnline && !discoveryState\.loading/)
  assert.match(page, /connectivity\.reconnectVersion/)
  assert.doesNotMatch(page + component, /\.from\s*\(|supabase|recommendationRank/)
  assert.doesNotMatch(algorithm, /fetch\(|localStorage|sessionStorage|distance|operationalStatus/)
  assert.doesNotMatch(worker, /facilityRecommendations|public_facility_service_mappings/)
})
const vite = await createServer({ appType: "custom", configFile: false, esbuild: { jsx: "automatic" }, logLevel: "error", optimizeDeps: { noDiscovery: true }, resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } }, root: fileURLToPath(new URL("..", import.meta.url)), server: { middlewareMode: true } })
try {
  const { default: Locations } = await vite.ssrLoadModule("/src/components/facilities/ConfiguredServiceLocations.jsx")
  const render = (services, directoryById = new Map(), hasConfiguredMappings = true) => renderToString(React.createElement(StaticRouter, { location: "/facilities" }, React.createElement(Locations, { services, directoryById, hasConfiguredMappings, operationalLoading: false })))
  await check("Rendered configured order retains CLOSED/UNKNOWN status, canonical links and headings", () => {
    const html = render([{ code: "fixture-records", name: "Fixture Records Service", result: recommend(snapshot.data) }], new Map([["registrar-office", { status: { status: "CLOSED" } }]]))
    assert.ok(html.indexOf(">Registrar") < html.indexOf(">Library"))
    for (const pattern of [/Administrator-defined order/, /<ol/, /role="status"/, /<h2/, /<h3/, /<h4/, /Closed/, /Unknown/, /href="\/facilities\/library"/, /href="\/map\?facility=library"/, /min-h-11/]) assert.match(html, pattern)
    assert.doesNotMatch(html, /AI-recommended|Best facility|Fastest|Least crowded/)
  })
  await check("DEMO/pending operational labels survive without influencing mapping eligibility", () => {
    const html = render([{ code: "fixture-records", name: "Fixture Records Service", result: recommend(snapshot.data) }], new Map([["library", { status: { status: "UNKNOWN", demo: true }, operationalProfile: { provenance: { verificationStatus: "PENDING_VERIFICATION" } } }]]))
    assert.match(html, /Demo · not official/); assert.match(html, /Pending verification/)
  })
  await check("Zero-data and unmapped UI do not fabricate recommendations", () => {
    assert.match(render([], new Map(), false), /No configured service locations are available yet/)
    const html = render([{ code: "fixture-unmapped", name: "Fixture Unmapped Service", result: recommend(snapshot.data, "fixture-unmapped") }])
    assert.match(html, /No destination is inferred/); assert.doesNotMatch(html, /<article/)
  })
} finally { await vite.close() }
await check("Index sorting and repeated local composition remain measured without requests", () => {
  const start = performance.now()
  for (let iteration = 0; iteration < 1000; iteration++) createConfiguredServiceRecommendationIndex(snapshot.data)
  const indexedAt = performance.now(), recommendationIndex = createConfiguredServiceRecommendationIndex(snapshot.data)
  for (let iteration = 0; iteration < 1000; iteration++) getConfiguredServiceRecommendations("fixture-records", { recommendationIndex, dateTime: discoveryTime })
  console.log(`1000 indexes/sorts: ${(indexedAt - start).toFixed(1)} ms; 1000 compositions: ${(performance.now() - indexedAt).toFixed(1)} ms (local fixture, not device certification)`)
})
await check("Bounded large snapshot sorts 950 mappings locally without losing canonical IDs", async () => {
  const source = { services: [], aliases: [], mappings: [] }
  for (let serviceNumber = 0; serviceNumber < 10; serviceNumber++) {
    const code = `fixture-scale-${serviceNumber}`
    source.services.push({ code, name: `Fixture Scale ${serviceNumber}`, provenance: discoveryProvenance() })
    for (const [position, facility] of facilities.entries()) source.mappings.push({ ...discoveryMapping(code, facility.id), recommendationRank: 95 - position })
  }
  const data = (await load(source)).data, start = performance.now()
  const recommendationIndex = createConfiguredServiceRecommendationIndex(data), sortedAt = performance.now()
  const result = getConfiguredServiceRecommendations("fixture-scale-0", { recommendationIndex, dateTime: discoveryTime })
  assert.equal(source.mappings.length, 950)
  assert.deepEqual(ids(result), facilities.toReversed().map(({ id }) => id))
  console.log(`950 mappings index/sort: ${(sortedAt - start).toFixed(2)} ms; 95 locations composition: ${(performance.now() - sortedAt).toFixed(2)} ms (synthetic local bound)`)
})
console.log(`FS-4 configured service recommendations: ${checks}/${checks} PASS`)
