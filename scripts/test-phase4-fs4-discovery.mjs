import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { performance } from "node:perf_hooks"
import { fileURLToPath } from "node:url"
import React from "react"
import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router-dom/server.js"
import { createServer } from "vite"
import { facilities } from "../src/data/facilities.js"
import { FACILITY_PROVIDER_METHODS } from "../src/data/facilityContracts.js"
import { createLocalFacilityProvider } from "../src/providers/facility/localFacilityProvider.js"
import { createSupabaseFacilityProvider } from "../src/providers/facility/supabaseFacilityProvider.js"
import { createFacilityService, createFacilityDiscoveryIndex, searchFacilities } from "../src/services/facilityService.js"
import { normalizeDiscoveryQuery } from "../src/services/facilityDiscovery.js"
import { discoveryFixtures, discoveryTime, discoveryProvenance, discoveryService, discoveryAlias, discoveryMapping } from "./fixtures/facilityDiscoveryFixtures.mjs"

let checks = 0
const check = async (name, run) => { await run(); checks++; console.log(`PASS ${checks}: ${name}`) }
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")
const load = (records) => createFacilityService({
  provider: { getFacilityDiscoveryData: async () => structuredClone(records) }, clock: () => discoveryTime,
}).getFacilityDiscoveryData()
const ids = (result) => result.results.map(({ facility }) => facility.id)
const snapshot = await load(discoveryFixtures())
const index = createFacilityDiscoveryIndex(snapshot.data)
const search = (query, options = {}) => searchFacilities(query, { discoveryIndex: index, dateTime: discoveryTime, ...options })

await check("Default local directory retains all 95 canonical facilities and order", () => {
  assert.deepEqual(ids(search("")), facilities.map(({ id }) => id)); assert.equal(search("").count, 95)
})
await check("Exact canonical identity precedes service aliases and is deduplicated", () => {
  const result = search("Library")
  assert.equal(result.results[0].facility.id, "library")
  assert.equal(result.results[0].facility.name, "Library")
  assert.equal(result.results[0].matches[0].alias, "Library")
  assert.equal(new Set(ids(result)).size, result.count)
})
await check("Canonical prefix precedes aliases; canonical substring remains available", () => {
  assert.equal(search("Lib").results[0].facility.id, "library")
  assert.ok(ids(search("aboratory")).includes("virtual-laboratory"))
})
await check("Canonical kind and floor substring compatibility", () => {
  assert.ok(search("Office").results.length > 0)
  assert.ok(search("Third Floor").results.every(({ facility }) => facility.floorId === "3F"))
})
await check("Case-insensitive conservative whitespace normalization", () => {
  assert.equal(normalizeDiscoveryQuery("  FIXTURE \t Transcript  "), "fixture transcript")
  assert.deepEqual(ids(search(" FIXTURE \t Transcript ")), ["library", "registrar-office"])
})
await check("Service names support exact/prefix/substring matching", () => {
  for (const query of ["Fixture Records Service", "Fixture Records", "Records Service"]) assert.deepEqual(ids(search(query)), ["library", "registrar-office"])
})
await check("Approved aliases match exact normalized terms only, without fuzzy expansion", () => {
  assert.deepEqual(ids(search("Fixture Transcript")), ["library", "registrar-office"])
  assert.equal(search("Fixture Transcrip").count, 0)
  assert.equal(search("Fixture-Transcript").count, 0)
  assert.equal(search("Fixtrue Transcript").count, 0)
})
await check("Unmapped service never infers a destination", () => {
  const result = search("Fixture Unmapped Service")
  assert.equal(result.count, 0); assert.deepEqual(result.unmappedServices, ["Fixture Unmapped Service"])
})
await check("Pending and DEMO service/alias records never influence ordinary discovery", () => {
  for (const term of ["Fixture Pending Service", "Fixture Demo Service", "Fixture Pending Alias", "Fixture Demo Alias"]) assert.equal(search(term).count, 0)
  assert.deepEqual(snapshot.data.notices, { pending: true, demoExcluded: true })
})
await check("Independent provenance survives the full service-alias-mapping chain", () => {
  const match = search("Fixture Transcript").results[0].matches[0]
  for (const key of ["serviceProvenance", "aliasProvenance", "mappingProvenance"]) assert.equal(match[key].sourceId, "FS4-DISCOVERY-FIXTURE")
})
await check("SOURCE_ALIGNED public records are eligible without upgrading their provenance", async () => {
  const records = discoveryFixtures()
  for (const section of ["services", "aliases", "mappings"]) for (const row of records[section]) row.provenance = discoveryProvenance({ verificationStatus: "SOURCE_ALIGNED" })
  const result = searchFacilities("Fixture Transcript", { discoveryIndex: createFacilityDiscoveryIndex((await load(records)).data) })
  assert.equal(result.count, 2)
  assert.equal(result.results[0].matches[0].aliasProvenance.verificationStatus, "SOURCE_ALIGNED")
})
await check("Malformed source metadata cannot qualify as an approved alias", async () => {
  const records = discoveryFixtures(); records.aliases[0].provenance.sourceLabel = { private: "PRIVATE_CANARY" }
  const result = await load(records)
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_CANARY/)
  assert.equal(searchFacilities("Fixture Transcript", { discoveryIndex: createFacilityDiscoveryIndex(result.data) }).count, 0)
})
await check("Several matching services combine explanations without duplicating facilities", async () => {
  const records = discoveryFixtures()
  records.services.push(discoveryService("fixture-second", "Fixture Second Service"))
  records.aliases.push(discoveryAlias("fixture-second", "Fixture Transcript"))
  records.mappings.push(discoveryMapping("fixture-second", "library"))
  const result = searchFacilities("Fixture Transcript", { discoveryIndex: createFacilityDiscoveryIndex((await load(records)).data) })
  assert.equal(result.count, 2); assert.equal(result.results[0].matches.length, 2)
})
await check("Canonical prefix group precedes a matching approved alias domain", async () => {
  const records = discoveryFixtures(); records.aliases.push(discoveryAlias("fixture-records", "Lib"))
  const result = searchFacilities("Lib", { discoveryIndex: createFacilityDiscoveryIndex((await load(records)).data) })
  assert.equal(result.groups[0].results[0].facility.id, "library")
  assert.equal(result.groups[1].results[0].facility.id, "registrar-office")
})
for (const [label, provenance] of [
  ["draft", { lifecycle: "DRAFT" }], ["expired", { expiresAt: discoveryTime }],
  ["future effective", { effectiveAt: "2026-10-16T00:00:00Z" }],
  ["future publication", { publishedAt: "2026-10-16T00:00:00Z" }],
  ["pending", { verificationStatus: "PENDING_VERIFICATION" }],
  ["demo", { verificationStatus: "DEMO_ONLY", dataStatus: "DEMO" }],
  ["malformed window", { expiresAt: "invalid" }],
]) for (const section of ["services", "aliases", "mappings"]) {
  await check(`${label} ${section} excluded independently`, async () => {
    const records = discoveryFixtures()
    records[section] = records[section].map((row) => ({ ...row, provenance: discoveryProvenance(provenance) }))
    const result = await load(records)
    assert.equal(searchFacilities("Fixture Transcript", { discoveryIndex: createFacilityDiscoveryIndex(result.data), dateTime: discoveryTime }).count, 0)
  })
}
await check("Missing parent service excludes aliases and mappings", async () => {
  const records = discoveryFixtures(); records.services = []
  const result = await load(records)
  assert.equal(searchFacilities("Fixture Transcript", { discoveryIndex: createFacilityDiscoveryIndex(result.data) }).count, 0)
})
await check("Unknown facility IDs never become results", async () => {
  const records = discoveryFixtures(); records.mappings = [discoveryMapping("fixture-records", "made-up-office")]
  const result = await load(records)
  assert.equal(searchFacilities("Fixture Transcript", { discoveryIndex: createFacilityDiscoveryIndex(result.data) }).count, 0)
})
await check("Explicit eligible facility filters preserve count and service matches", () => {
  const result = search("Fixture Transcript", { facilityIds: facilities.filter((row) => row.floorId === "3F" && row.kind === "Academic").map(({ id }) => id) })
  assert.deepEqual(ids(result), ["library"]); assert.equal(result.count, 1)
})
await check("Ordering is stable across provider permutation and ignores configured recommendation rank", async () => {
  const records = discoveryFixtures()
  records.mappings[0].recommendationRank = 999; records.mappings[1].recommendationRank = 1
  for (const key of ["services", "aliases", "mappings"]) records[key].reverse()
  const result = await load(records)
  assert.deepEqual(ids(searchFacilities("Fixture Transcript", { discoveryIndex: createFacilityDiscoveryIndex(result.data) })), ["library", "registrar-office"])
})
await check("Expired loaded snapshots cannot continue matching", async () => {
  const records = discoveryFixtures(); records.mappings.forEach((row) => { row.provenance.expiresAt = "2026-10-15T03:00:00Z" })
  const result = await load(records)
  assert.equal(result.data.nextRefreshAt, "2026-10-15T03:00:00.000Z")
  assert.equal(searchFacilities("Fixture Transcript", { discoveryIndex: createFacilityDiscoveryIndex(result.data), dateTime: "2026-10-15T03:00:00Z" }).count, 0)
})
await check("Provider failure has sanitized errors and local search fallback", async () => {
  const result = await createFacilityService({ provider: { getFacilityDiscoveryData: async () => { throw new Error("PostgreSQL private_token=secret") } } }).getFacilityDiscoveryData()
  assert.equal(result.ok, false); assert.equal(result.data, null); assert.equal(result.error.retryable, true)
  assert.doesNotMatch(JSON.stringify(result), /PostgreSQL|private_token|secret/)
  assert.equal(searchFacilities("Library").results[0].facility.id, "library")
})
await check("Malformed payload and duplicate service identity fail closed", async () => {
  for (const records of [{ services: [], aliases: null, mappings: [] }, { ...discoveryFixtures(), services: [discoveryService("same", "A"), discoveryService("same", "B")] }]) assert.equal((await load(records)).ok, false)
})
await check("Local provider has empty safe discovery and all provider methods", async () => {
  const provider = createLocalFacilityProvider()
  for (const method of FACILITY_PROVIDER_METHODS) assert.equal(typeof provider[method], "function")
  const result = await createFacilityService({ provider }).getFacilityDiscoveryData()
  assert.equal(result.ok, true); assert.equal(result.availability, "UNAVAILABLE")
})
await check("Invalid evaluation time short-circuits provider access", async () => {
  let calls = 0
  const result = await createFacilityService({ provider: { getFacilityDiscoveryData: async () => { calls++; return {} } } }).getFacilityDiscoveryData("2026-10-15 10:00")
  assert.equal(calls, 0); assert.equal(result.ok, false)
})
await check("Results do not mutate canonical identities or leak raw/private fields", async () => {
  const before = structuredClone(facilities)
  search("Library").results[0].facility.name = "not canonical"
  assert.deepEqual(facilities, before)
  const records = discoveryFixtures(); records.services[0].privateNotes = "PRIVATE_CANARY"
  records.mappings[0].publicNotes = "IGNORED_CANARY"
  assert.doesNotMatch(JSON.stringify((await load(records)).data), /PRIVATE_CANARY|IGNORED_CANARY|recommendationRank/)
})

const views = ["public_services", "public_service_aliases", "public_facility_service_mappings"]
await check("Provider performs exactly three bounded public reads, no N+1 or rank ordering", async () => {
  const calls = []
  const client = { from(view) {
    calls.push({ view, method: "from" })
    const query = {
      select(columns, options) { calls.push({ view, method: "select", columns, options }); return query },
      order(column) { calls.push({ view, method: "order", column }); return query },
      limit(limit) { calls.push({ view, method: "limit", limit }); return query },
      then(resolve, reject) { return Promise.resolve({ data: [], count: 0, error: null }).then(resolve, reject) },
    }; return query
  } }
  await createSupabaseFacilityProvider(client).getFacilityDiscoveryData()
  assert.deepEqual(calls.filter(({ method }) => method === "from").map(({ view }) => view), views)
  assert.equal(calls.filter(({ method, limit }) => method === "limit" && limit === 1000).length, 3)
  assert.equal(calls.filter(({ method, options }) => method === "select" && options.count === "exact").length, 3)
  assert.ok(calls.filter(({ method }) => method === "order").every(({ column }) => column !== "recommendation_rank"))
})
await check("Projection error or saturated response fails closed", async () => {
  for (const payload of [{ data: [], error: new Error("private") }, { data: Array(1000).fill({}), error: null }]) {
    const query = { select() { return query }, order() { return query }, limit() { return query }, then(resolve, reject) { return Promise.resolve(payload).then(resolve, reject) } }
    await assert.rejects(createSupabaseFacilityProvider({ from: () => query }).getFacilityDiscoveryData())
  }
})
await check("Smaller server row caps and missing count headers cannot silently truncate discovery", async () => {
  for (const payload of [{ data: [], count: 1, error: null }, { data: [], count: null, error: null }]) {
    const query = { select() { return query }, order() { return query }, limit() { return query }, then(resolve, reject) { return Promise.resolve(payload).then(resolve, reject) } }
    await assert.rejects(createSupabaseFacilityProvider({ from: () => query }).getFacilityDiscoveryData())
  }
})

const [page, card, provider, discoverySource, worker] = await Promise.all([
  read("src/pages/Facilities.jsx"), read("src/components/facilities/FacilityCard.jsx"),
  read("src/providers/facility/supabaseFacilityProvider.js"), read("src/services/facilityDiscovery.js"), read("src/service-worker.js"),
])
const snapshotSource = await read("src/services/facilityDiscoverySnapshot.js")
const discoveryContext = await read("src/contexts/FacilityDiscoveryContext.jsx")
await check("React uses shared APIs, memoized index and no per-query provider calls", () => {
  assert.match(page, /useFacilityDiscovery\(\)/)
  assert.match(snapshotSource, /createFacilityDiscoveryIndex\(result.data\)/)
  assert.match(page, /searchFacilities\(query/)
  assert.match(snapshotSource, /getFacilityDiscoveryData\(undefined, \{ includeConfiguredMappings: true \}\)/)
  assert.doesNotMatch(page, /\}, \[[^\]]*query[^\]]*\]\)\s*\n\s*(?:const directoryById|useEffect)/)
  assert.doesNotMatch(page + card, /\.from\s*\(|supabase/i)
  assert.doesNotMatch(provider, /\.(insert|upsert|update|delete)\s*\(/)
})
await check("Offline and reconnect mask old operational snapshots and revalidate", () => {
  assert.match(page, /connectivity\.isOnline && !discoveryState\.loading/)
  assert.match(page, /connectivity\.reconnectVersion/)
  assert.match(discoveryContext, /usable = enabled && connectivity\.isOnline/)
  assert.match(snapshotSource, /invalidate\(\)/)
  assert.match(page, /Service search requires a connection/)
  assert.match(snapshotSource, /nextRefreshAt/)
  assert.match(page, /window\.location\.reload\(\)/, "Uncached client-module recovery stays explicit and does not alter PWA policy")
  assert.doesNotMatch(discoverySource, /localStorage|sessionStorage|fetch\(|recommendationRank/)
  assert.doesNotMatch(snapshotSource + discoveryContext, /localStorage|sessionStorage|fetch\(/)
  assert.doesNotMatch(worker, /facilityDiscovery|public_service_aliases/)
})
await check("Accessible mobile controls, domain headings, count and safe empty states", () => {
  for (const expression of [/aria-label="Search facilities"/, /aria-describedby="facility-search-help"/, /aria-label="Filter by floor"/, /aria-label="Filter by category"/, /role="status"/, /No verified result/, /No destination is inferred/, /min-h-11/]) assert.match(page, expression)
  assert.match(page, /MobileBottomSheet/); assert.match(page, /group\.label/)
})

const vite = await createServer({ appType: "custom", configFile: false, esbuild: { jsx: "automatic" }, logLevel: "error", optimizeDeps: { noDiscovery: true }, resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } }, root: fileURLToPath(new URL("..", import.meta.url)), server: { middlewareMode: true } })
try {
  const { default: FacilityCard } = await vite.ssrLoadModule("/src/components/facilities/FacilityCard.jsx")
  await check("Rendered card keeps canonical name and links with an approved alias explanation", () => {
    const result = search("Fixture Transcript").results[0]
    const html = renderToString(React.createElement(StaticRouter, { location: "/facilities" }, React.createElement(FacilityCard, { facility: result.facility, discoveryMatches: result.matches })))
    for (const expression of [/>Library</, /Matches service: /, /Fixture Records Service/, /approved alias: /, /Fixture Transcript/, /href="\/facilities\/library"/, /href="\/map\?facility=library"/]) assert.match(html, expression)
    assert.doesNotMatch(html, /Recommended|Wheelchair|Open Now/)
  })
} finally { await vite.close() }

await check("Search processing remains local and inexpensive across repeated queries", () => {
  const start = performance.now()
  for (let iteration = 0; iteration < 1000; iteration++) search(iteration % 2 ? "Library" : "Fixture Transcript")
  console.log(`1000 local searches: ${(performance.now() - start).toFixed(1)} ms (informational, not device certification)`)
})
console.log(`FS-4 public service and approved alias discovery: ${checks}/${checks} PASS`)
