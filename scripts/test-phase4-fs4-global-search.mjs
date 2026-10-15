import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import React from "react"
import { renderToString } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { createServer } from "vite"
import { createFacilityService, createFacilityDiscoveryIndex, searchFacilities } from "../src/services/facilityService.js"
import { createFacilityDiscoverySnapshot } from "../src/services/facilityDiscoverySnapshot.js"
import { getGlobalFacilityGroups } from "../src/services/globalFacilitySearch.js"
import { getConfiguredServiceRecommendations } from "../src/services/facilityRecommendations.js"
import { getFacilityNavigationHref } from "../src/services/dashboardService.js"
import { createSupabaseFacilityProvider } from "../src/providers/facility/supabaseFacilityProvider.js"
import { facilities } from "../src/data/facilities.js"
import { discoveryFixtures, discoveryTime, discoveryService, discoveryAlias, discoveryMapping } from "./fixtures/facilityDiscoveryFixtures.mjs"

let checks = 0
const check = async (label, test) => { await test(); console.log(`ok ${++checks} - ${label}`) }
const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8")
const flush = () => new Promise(setImmediate)
const now = Date.parse(discoveryTime)
const load = (records = discoveryFixtures()) => createFacilityService({
  provider: { async getFacilityDiscoveryData() { return records } }, clock: () => discoveryTime,
}).getFacilityDiscoveryData(undefined, { includeConfiguredMappings: true })
const result = await load()
const discoveryIndex = createFacilityDiscoveryIndex(result.data)
const groups = (query, index = discoveryIndex) => getGlobalFacilityGroups(query, { discoveryIndex: index, dateTime: discoveryTime })
const items = (query, index) => groups(query, index).groups.flatMap(({ items }) => items)
const ids = (query, index) => items(query, index).map(({ facility }) => facility.id)

for (const query of ["Fixture Records Service", "Fixture Records", "Records Service"]) await check(`Service-name matching: ${query}`, () => assert.deepEqual(ids(query), ["library", "registrar-office"]))
await check("Exact approved alias normalizes case and whitespace only", () => assert.deepEqual(ids(" FIXTURE   transcript "), ["library", "registrar-office"]))
for (const query of ["Fixture Transcrip", "Fixture Transcript!", "Fixure Transcript"]) await check(`No partial/fuzzy/punctuation inference: ${query}`, () => assert.deepEqual(ids(query), []))
await check("Services domain is separate and all multiple locations remain deliberate choices", () => {
  const matched = groups("Fixture Transcript")
  assert.deepEqual(matched.groups.map(({ title }) => title), ["Facilities", "Rooms", "Services"])
  assert.equal(matched.groups[2].items.length, 2)
  assert.deepEqual(matched.matchedServices, [{ code: "fixture-records", name: "Fixture Records Service" }])
})
await check("Single mapping returns only its canonical facility", async () => {
  const records = discoveryFixtures(); records.mappings = records.mappings.slice(0, 1)
  assert.deepEqual(ids("Fixture Transcript", createFacilityDiscoveryIndex((await load(records)).data)), ["library"])
})
await check("Unmapped service is named without inventing a destination", () => {
  const matched = groups("Fixture Unmapped Service")
  assert.equal(matched.groups.flatMap(({ items }) => items).length, 0)
  assert.deepEqual(matched.unmappedServices, ["Fixture Unmapped Service"])
})
await check("Canonical overlap is shown once with service explanation intact", () => {
  const matched = groups("Library"), all = matched.groups.flatMap(({ items }) => items)
  assert.deepEqual(all.map(({ facility }) => facility.id), ["library", "registrar-office"])
  assert.equal(matched.overlapCount, 1)
  assert.equal(all[0].facility.name, "Library")
  assert.equal(all[0].matches[0].alias, "Library")
  assert.equal(all[0].matches[0].serviceName, "Fixture Records Service")
})
await check("Duplicate mappings collapse deterministically", async () => {
  const records = discoveryFixtures(); records.mappings.push(structuredClone(records.mappings[0]))
  assert.deepEqual(ids("Fixture Transcript", createFacilityDiscoveryIndex((await load(records)).data)), ["library", "registrar-office"])
})
await check("Shared alias across services retains independent explanations without duplicate identities", async () => {
  const records = discoveryFixtures()
  records.services.push(discoveryService("fixture-second", "Fixture Second Service"))
  records.aliases.push(discoveryAlias("fixture-second", "Fixture Transcript"))
  records.mappings.push(discoveryMapping("fixture-second", "library"))
  const matched = items("Fixture Transcript", createFacilityDiscoveryIndex((await load(records)).data))
  assert.equal(matched.length, 2); assert.equal(matched[0].matches.length, 2)
})
await check("Canonical preview caps never hide a service-mapped choice", async () => {
  const records = { services: [discoveryService("fixture-room", "Fixture Room Service")], aliases: [discoveryAlias("fixture-room", "Room")], mappings: facilities.filter(({ kind }) => kind === "Room").map(({ id }) => discoveryMapping("fixture-room", id)) }
  const matched = groups("Room", createFacilityDiscoveryIndex((await load(records)).data))
  const all = matched.groups.flatMap(({ items }) => items).map(({ facility }) => facility.id)
  for (const mapping of records.mappings) assert.ok(all.includes(mapping.facilityId))
  assert.equal(new Set(all).size, all.length)
})
await check("Global order does not consume configured recommendation ranks", async () => {
  const records = discoveryFixtures(); records.mappings[0].recommendationRank = 999; records.mappings[1].recommendationRank = 1
  assert.deepEqual(ids("Fixture Transcript", createFacilityDiscoveryIndex((await load(records)).data)), ["library", "registrar-office"])
  assert.doesNotMatch(JSON.stringify(groups("Fixture Transcript")), /recommendationRank/)
})
await check("Non-navigable locations retain Details identity but no Navigate action", async () => {
  const facility = facilities.find((row) => getFacilityNavigationHref(row.id) === null)
  assert.ok(facility)
  const records = discoveryFixtures(); records.mappings = [discoveryMapping("fixture-records", facility.id)]
  const matched = items("Fixture Transcript", createFacilityDiscoveryIndex((await load(records)).data))
  assert.equal(matched[0].facility.id, facility.id)
  assert.equal(getFacilityNavigationHref(matched[0].facility.id), null)
})
await check("Zero catalog preserves canonical search and supplies no dynamic destination", async () => {
  const empty = await load({ services: [], aliases: [], mappings: [] })
  assert.equal(empty.ok, true); assert.equal(empty.availability, "UNAVAILABLE")
  const index = createFacilityDiscoveryIndex(empty.data)
  assert.deepEqual(ids("Library", index), ["library"]); assert.deepEqual(ids("Fixture Transcript", index), [])
})
for (const query of ["Fixture Pending Service", "Fixture Demo Service", "Fixture Pending Alias", "Fixture Demo Alias"]) await check(`Pending/DEMO excluded: ${query}`, () => assert.deepEqual(ids(query), []))
for (const provenance of [{ lifecycle: "DRAFT" }, { expiresAt: "2026-10-14T00:00:00Z" }, { effectiveAt: "2027-01-01T00:00:00Z" }, { publishedAt: "2027-01-01T00:00:00Z" }]) await check(`Lifecycle excluded: ${JSON.stringify(provenance)}`, async () => {
  const records = discoveryFixtures(); Object.assign(records.mappings[0].provenance, provenance); Object.assign(records.mappings[1].provenance, provenance)
  assert.deepEqual(ids("Fixture Transcript", createFacilityDiscoveryIndex((await load(records)).data)), [])
})
await check("Malformed provider aggregate is sanitized", async () => {
  const malformed = await load({ services: null, aliases: [], mappings: [] })
  assert.equal(malformed.ok, false); assert.equal(malformed.data, null)
})
await check("Bounded public projections retain truncation/count guards", async () => {
  for (const payload of [{ data: [], count: 1 }, { data: [], count: null }, { data: Array(1000).fill({}), count: 1000 }]) {
    const calls = []
    const provider = createSupabaseFacilityProvider({ from(view) {
      calls.push(view)
      const q = { select(_cols, opts) { assert.equal(opts.count, "exact"); return q }, order() { return q }, limit(n) { assert.equal(n, 1000); return q }, then(resolve) { return Promise.resolve({ error: null, ...payload }).then(resolve) } }
      return q
    } })
    await assert.rejects(provider.getFacilityDiscoveryData())
    assert.deepEqual(calls, ["public_services", "public_service_aliases", "public_facility_service_mappings"])
  }
})

await check("Inactive snapshot makes zero reads", async () => {
  let calls = 0; const store = createFacilityDiscoverySnapshot({ isOnline: true, load: async () => { calls++; return result } })
  await flush(); assert.equal(calls, 0); assert.equal(store.getSnapshot().result, null)
})
await check("Concurrent consumers coalesce one snapshot and memoized indexes", async () => {
  let calls = 0, resolve
  const store = createFacilityDiscoverySnapshot({ isOnline: true, load: () => { calls++; return new Promise(done => { resolve = done }) } })
  const a = store.retain(), b = store.retain(); await flush(); assert.equal(calls, 1)
  resolve(result); await flush()
  const snapshot = store.getSnapshot()
  for (let i = 0; i < 1000; i++) getGlobalFacilityGroups("Fixture Transcript", { discoveryIndex: snapshot.discoveryIndex, dateTime: discoveryTime })
  assert.equal(calls, 1); assert.equal(store.getSnapshot().discoveryIndex, snapshot.discoveryIndex)
  a(); assert.equal(store.getSnapshot(), snapshot); b(); await flush()
  assert.equal(store.getSnapshot().result, null)
})
await check("Offline invalidation rejects late responses; reconnect fetches before restoration", async () => {
  const pending = []; let calls = 0
  const store = createFacilityDiscoverySnapshot({ isOnline: true, load: () => { calls++; return new Promise(resolve => pending.push(resolve)) } })
  const release = store.retain(); await flush()
  store.setOnline(false); pending[0](result); await flush()
  assert.equal(store.getSnapshot().result, null)
  assert.deepEqual(ids("Library", store.getSnapshot().discoveryIndex), ["library"])
  assert.deepEqual(ids("Fixture Transcript", store.getSnapshot().discoveryIndex), [])
  store.setOnline(true); await flush(); assert.equal(calls, 2); assert.equal(store.getSnapshot().result, null)
  pending[1](result); await flush(); assert.equal(store.getSnapshot().result, result)
  release(); await flush()
})
await check("Explicit replacement retry rejects obsolete response", async () => {
  const pending = []
  const store = createFacilityDiscoverySnapshot({ isOnline: true, load: () => new Promise(resolve => pending.push(resolve)) })
  const release = store.retain(); await flush(); store.retry(); await flush()
  pending[1](result); await flush(); pending[0]({ ...result, data: { ...result.data, services: [] } }); await flush()
  assert.equal(store.getSnapshot().result, result); release(); await flush()
})
await check("Known boundary revalidation masks old snapshot and cancels idle timers", async () => {
  const timers = new Map(); let timerId = 0, calls = 0
  const expiring = { ...result, data: { ...result.data, nextRefreshAt: new Date(now + 500).toISOString() } }
  const store = createFacilityDiscoverySnapshot({ isOnline: true, clock: () => now,
    load: async () => { calls++; return expiring }, schedule(callback, delay) { assert.equal(delay, 501); timers.set(++timerId, callback); return timerId }, cancel(id) { timers.delete(id) },
  })
  const release = store.retain(); await flush(); assert.equal(calls, 1)
  const callback = timers.get(1); timers.delete(1); callback()
  assert.equal(store.getSnapshot().result, null); await flush(); assert.equal(calls, 2)
  release(); await flush(); assert.equal(timers.size, 0)
})
await check("Provider exceptions cannot leak details and explicit retry recovers", async () => {
  let fail = true
  const store = createFacilityDiscoverySnapshot({ isOnline: true, load: async () => { if (fail) throw new Error("PRIVATE_CANARY"); return result } })
  const release = store.retain(); await flush()
  assert.equal(store.getSnapshot().result.ok, false); assert.doesNotMatch(JSON.stringify(store.getSnapshot()), /PRIVATE_CANARY/)
  fail = false; await store.retry(); assert.equal(store.getSnapshot().result, result)
  release(); await flush()
})
await check("Configured recommendation behavior remains separate and unchanged", async () => {
  const records = discoveryFixtures(); records.mappings[0].recommendationRank = 20; records.mappings[1].recommendationRank = 1
  const store = createFacilityDiscoverySnapshot({ isOnline: true, load: () => load(records) })
  const release = store.retain(); await flush()
  const snapshot = store.getSnapshot()
  assert.deepEqual(getConfiguredServiceRecommendations("fixture-records", { recommendationIndex: snapshot.recommendationIndex, dateTime: discoveryTime }).data.recommendations.map(({ facility }) => facility.id), ["registrar-office", "library"])
  assert.deepEqual(searchFacilities("Fixture Transcript", { discoveryIndex: snapshot.discoveryIndex, dateTime: discoveryTime }).results.map(({ facility }) => facility.id), ["library", "registrar-office"])
  release(); await flush()
})

const [global, shell, page, context, snapshot, adapter, map, worker, destination] = await Promise.all([
  "src/components/layout/GlobalSearch.jsx", "src/components/layout/AppShell.jsx", "src/pages/Facilities.jsx", "src/contexts/FacilityDiscoveryContext.jsx", "src/services/facilityDiscoverySnapshot.js", "src/services/globalFacilitySearch.js", "src/pages/Map.jsx", "src/service-worker.js", "src/components/map/DestinationSearch.jsx",
].map(read))
await check("Both consumers share one scoped provider, not independent network effects", () => {
  assert.match(shell, /<FacilityDiscoveryProvider>/); assert.match(global, /useFacilityDiscovery\(open\)/); assert.match(page, /useFacilityDiscovery\(\)/)
  assert.doesNotMatch(page + global, /getFacilityDiscoveryData\(/)
  assert.match(snapshot, /includeConfiguredMappings: true/); assert.match(snapshot, /import\("\.\/facilityService.js"\)/)
})
await check("No private queries, persistence, new matcher or rank-based GlobalSearch", () => {
  assert.doesNotMatch(global + context + snapshot + adapter, /\.from\s*\(|localStorage|sessionStorage|indexedDB|recommendationRank/)
  assert.match(adapter, /searchFacilities\(query, options\)/)
  assert.match(context, /usable = enabled && connectivity\.isOnline/)
  assert.match(context, /reconnectVersion/)
})
await check("Keyboard shortcuts belong only to the input, while modal traps focus", () => {
  assert.match(shell, /anotherModal && !moreOpen && !drawerOpen/)
  assert.ok(shell.includes('[role="dialog"]:not([aria-modal="false"])'), "Radix modal dialogs need not have aria-modal=true")
  assert.ok(shell.includes(':not([data-immersive])'), "Fullscreen map viewport yields to search; its nested task dialogs do not")
  assert.match(global, /useModalDialog\(\{ active: open, onClose \}\)/)
  assert.match(global, /onKeyDown=\{onInputKeyDown\}/)
  assert.doesNotMatch(global, /aria-modal="true"[^\n]*onKeyDown/)
  assert.match(global, /event.key === "ArrowDown"/); assert.match(global, /event.key === "Enter"/)
  const modal = read("src/components/campus/useModalDialog.js")
  return modal.then(source => { for (const text of ['event.key === "Escape"', 'event.key !== "Tab"', 'previous.focus']) assert.ok(source.includes(text)) })
})
await check("Mobile controls, announcements, visual viewport, safe area and fullscreen portal", () => {
  for (const text of ['h-11 w-11', 'focusRing', 'aria-live="polite"', 'aria-atomic="true"', 'visualViewport', 'safe-area-inset-bottom', '--app-bottom-nav-height', 'motion-reduce:transition-none', 'document.fullscreenElement']) assert.ok(global.includes(text))
})
await check("Mounted Map handles canonical repeat requests without resetting position/preference", () => {
  assert.match(global, /state=\{\{ facilityDestinationRequest: item.facility.id \}\}/)
  const handoff = map.slice(map.indexOf("const requestedDestinationId"), map.indexOf("const selectMapRoom"))
  for (const text of ["location.key", "if (emergencyMode) return", "getFacilityById(requestedDestinationId)", "facility.navigable === false", "getFacilityEntranceNodes", "chooseDestination(facility)"]) assert.ok(handoff.includes(text))
  assert.doesNotMatch(handoff, /setCurrentPosition|setRoutePreference|startNavigation\(|setLocationConfirmation|setScannerOpen/)
  const choose = map.slice(map.indexOf("const chooseDestination"), map.indexOf("const requestedDestinationId"))
  assert.match(choose, /setDestinationId\(facility.id\)/); assert.match(choose, /resetRoute\(\)/)
  assert.doesNotMatch(choose, /setCurrentPosition|setRoutePreference|startNavigation\(/)
  assert.match(map, /!globalSearchOpen/)
})
await check("Emergency/PWA exclusions and separately authorized DestinationSearch boundary remain intact", () => {
  assert.doesNotMatch(worker, /facilityDiscovery|globalFacilitySearch|public_services/)
  assert.match(destination, /useFacilityDiscovery\(open\)/)
  assert.doesNotMatch(destination, /\.from\s*\(|getFacilityDiscoveryData\(|startNavigation\(/)
  assert.match(map, /calculateFacilityRouteWithOptions/)
  assert.match(map, /Emergency routing is unavailable offline/)
})

const vite = await createServer({ appType: "custom", configFile: false, esbuild: { jsx: "automatic" }, logLevel: "error", optimizeDeps: { noDiscovery: true }, resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } }, root: fileURLToPath(new URL("..", import.meta.url)), server: { middlewareMode: true } })
const originalError = console.error
console.error = (...args) => { if (!String(args[0]).includes("useLayoutEffect does nothing on the server")) originalError(...args) }
try {
  const { default: GlobalSearch } = await vite.ssrLoadModule("/src/components/layout/GlobalSearch.jsx")
  const { ConnectivityProvider } = await vite.ssrLoadModule("/src/contexts/ConnectivityContext.jsx")
  const { FacilityDiscoveryProvider } = await vite.ssrLoadModule("/src/contexts/FacilityDiscoveryContext.jsx")
  const { ClaraProvider } = await vite.ssrLoadModule("/src/components/clara/ClaraContext.jsx")
  await check("Actual dialog renders Services, Quick access, canonical actions and safe offline state", () => {
    const html = renderToString(React.createElement(MemoryRouter, null, React.createElement(ConnectivityProvider, null, React.createElement(FacilityDiscoveryProvider, null, React.createElement(ClaraProvider, null, React.createElement(GlobalSearch, { open: true, onClose() {} }))))))
    for (const pattern of [/role="dialog"/, /aria-modal="true"/, /aria-label="Services"/, />Quick access</, /View details for Library/, /href="\/facilities\/library"/, /href="\/map\?facility=library"/, /Service search requires a connection/, /aria-label="Close search"/]) assert.match(html, pattern)
    assert.doesNotMatch(html, /aria-label="Personnel"|AI-recommended|Best facility/)
  })
} finally { console.error = originalError; await vite.close() }
await check("Repeated shared matching has no provider traffic (informational timing)", () => {
  const start = performance.now()
  for (let i = 0; i < 1000; i++) groups(i % 2 ? "Library" : "Fixture Transcript")
  console.log(`1000 local GlobalSearch compositions: ${(performance.now() - start).toFixed(2)} ms`)
})
console.log(`FS-4 GlobalSearch service integration: ${checks}/${checks} PASS (interactive browser evidence is recorded separately)`)
