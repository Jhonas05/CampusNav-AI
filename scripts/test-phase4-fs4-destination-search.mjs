import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import React from "react"
import { renderToString } from "react-dom/server"
import { createServer } from "vite"
import { facilities, getFacilityById } from "../src/data/facilities.js"
import { getFloorById } from "../src/data/floors.js"
import { getFacilityEntranceNodes } from "../src/data/mapNodes.js"
import { getFacilityCategory } from "../src/lib/facilityCategories.js"
import { getNavigateHref } from "../src/lib/mapLinks.js"
import { createFacilityService, createFacilityDiscoveryIndex } from "../src/services/facilityService.js"
import { createFacilityDiscoverySnapshot } from "../src/services/facilityDiscoverySnapshot.js"
import { getDestinationFacilityGroups } from "../src/services/destinationFacilitySearch.js"
import { createSupabaseFacilityProvider } from "../src/providers/facility/supabaseFacilityProvider.js"
import { discoveryFixtures, discoveryTime, discoveryService, discoveryAlias, discoveryMapping } from "./fixtures/facilityDiscoveryFixtures.mjs"

let checks = 0
const check = async (label, run) => { await run(); console.log(`ok ${++checks} - ${label}`) }
const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8")
const flush = () => new Promise(setImmediate)
const navigable = facilities.filter(f => f.navigable !== false && getFacilityEntranceNodes(f.id, f.floorId).length)
const load = (records = discoveryFixtures()) => createFacilityService({ provider: { async getFacilityDiscoveryData() { return records } }, clock: () => discoveryTime }).getFacilityDiscoveryData(undefined, { includeConfiguredMappings: true })
const result = await load()
const index = createFacilityDiscoveryIndex(result.data)
const compose = (query, discoveryIndex = index, options = {}) => getDestinationFacilityGroups(query, { facilities, discoveryIndex, dateTime: discoveryTime, ...options })
const entries = (query, discoveryIndex, options) => compose(query, discoveryIndex, options).groups.flatMap(({ items }) => items)
const ids = (query, discoveryIndex, options) => entries(query, discoveryIndex, options).map(({ facility }) => facility.id)
const legacy = (query, destinationId = "") => {
  const needle = query.trim().toLowerCase(), selected = navigable.find(f => f.id === destinationId)
  if (!needle || (selected && selected.name.trim().toLowerCase() === needle)) return [...navigable].sort((a,b) => getFloorById(a.floorId).level - getFloorById(b.floorId).level || a.name.localeCompare(b.name))
  const rank = f => {
    const name = f.name.toLowerCase()
    if (name === needle) return 0
    if (name.startsWith(needle)) return 1
    if (name.split(/[\s'’.&-]+/).some(word => word.startsWith(needle))) return 2
    if (name.includes(needle)) return 3
    const context = [f.floorId, getFloorById(f.floorId)?.name, getFacilityCategory(f).label, f.kind].filter(Boolean).join(" ").toLowerCase()
    return context.includes(needle) ? 4 : -1
  }
  return navigable.map(facility => ({facility, rank:rank(facility)})).filter(row=>row.rank>=0).sort((a,b)=>a.rank-b.rank||a.facility.name.localeCompare(b.facility.name)).slice(0,8).map(row=>row.facility)
}
await check("Legacy exact/prefix/word-prefix/substring/category/floor order and eight-result cap unchanged", () => {
  const queries = ["", "Office", "Student", "3F", "Third Floor", "Classroom", "Service", "zzz", ...navigable.flatMap(f => [f.name, f.name.slice(0,4), f.name.slice(2,9), ...f.name.split(/\s+/).map(word=>word.slice(0,3))])]
  for (const query of queries) assert.deepEqual(compose(query, null).groups[0].items.map(row=>row.facility.id),legacy(query).map(f=>f.id),query)
})
await check("Selected-name browse mode keeps all eligible destinations and legacy order", () => {
  assert.deepEqual(compose("Library",null,{destinationId:"library"}).groups[0].items.map(row=>row.facility.id),legacy("Library","library").map(f=>f.id))
})
for (const query of ["Fixture Records Service", "Fixture Records", "Records Service", " FIXTURE   Transcript "]) await check(`Accepted service-name/exact alias: ${query}`,()=>assert.deepEqual(ids(query),["library","registrar-office"]))
for (const query of ["Fixture Transcrip","Fixure Transcript","Fixture Transcript!"]) await check(`No partial/fuzzy/punctuation inference: ${query}`,()=>assert.deepEqual(ids(query),[]))
await check("One mapping remains a canonical choice, never a service-name destination", async()=>{
  const records=discoveryFixtures();records.mappings=records.mappings.slice(0,1)
  assert.deepEqual(ids("Fixture Transcript",createFacilityDiscoveryIndex((await load(records)).data)),["library"])
})
await check("Unmapped service supplies an honest no-location explanation",()=>{
  assert.deepEqual(ids("Fixture Unmapped Service"),[])
  assert.deepEqual(compose("Fixture Unmapped Service").unmappedServices,["Fixture Unmapped Service"])
})
await check("Only non-navigable mappings also report no configured navigable destination",async()=>{
  const records=discoveryFixtures();records.mappings=[discoveryMapping("fixture-records",facilities.find(f=>f.navigable===false).id)]
  const matched=compose("Fixture Transcript",createFacilityDiscoveryIndex((await load(records)).data))
  assert.deepEqual(matched.groups.flatMap(g=>g.items),[]);assert.deepEqual(matched.unmappedServices,["Fixture Records Service"])
})
await check("Canonical overlap deduplicates while preserving exact-alias explanation",()=>{
  const matched=compose("Library"),all=matched.groups.flatMap(g=>g.items)
  assert.equal(new Set(all.map(row=>row.facility.id)).size,all.length)
  assert.equal(matched.groups[0].items[0].facility.id,"library")
  assert.equal(all[0].matches[0].alias,"Library");assert.equal(all[0].matches[0].serviceName,"Fixture Records Service")
})
await check("Selected-name browse overlap also retains service context without duplicate identities",()=>{
  const matched=entries("Library",index,{destinationId:"library"})
  assert.equal(matched.length,navigable.length)
  for(const id of ["library","registrar-office"])assert.equal(matched.find(row=>row.facility.id===id).matches[0].alias,"Library")
})
await check("Service tiers and service-code/canonical-order ties remain deterministic",async()=>{
  const records={services:[discoveryService("z-exact","Task"),discoveryService("a-prefix","Task Desk"),discoveryService("a-substring","Other Task"),discoveryService("a-alias","Other")],aliases:[discoveryAlias("a-alias","Task")],mappings:[discoveryMapping("a-alias","computer-laboratory"),discoveryMapping("a-substring","health-dental-clinic"),discoveryMapping("a-prefix","library"),discoveryMapping("z-exact","registrar-office")]}
  const expected=["registrar-office","library","health-dental-clinic","computer-laboratory"]
  assert.deepEqual(ids("Task",createFacilityDiscoveryIndex((await load(records)).data)),expected)
  records.services.reverse();records.mappings.reverse();assert.deepEqual(ids("Task",createFacilityDiscoveryIndex((await load(records)).data)),expected)
})
await check("Identical mappings and shared aliases deduplicate without losing explanations",async()=>{
  const records=discoveryFixtures();records.mappings.push(structuredClone(records.mappings[0]))
  records.services.push(discoveryService("fixture-second","Fixture Second"));records.aliases.push(discoveryAlias("fixture-second","Fixture Transcript"));records.mappings.push(discoveryMapping("fixture-second","library"))
  const all=entries("Fixture Transcript",createFacilityDiscoveryIndex((await load(records)).data))
  assert.equal(all.length,2);assert.equal(all[0].matches.length,2)
})
await check("Canonical preview overflow never conceals additional service choices",async()=>{
  const records={services:[discoveryService("fixture-rooms","Fixture Rooms")],aliases:[discoveryAlias("fixture-rooms","Room")],mappings:navigable.filter(f=>f.kind==="Room").map(f=>discoveryMapping("fixture-rooms",f.id))}
  const all=ids("Room",createFacilityDiscoveryIndex((await load(records)).data))
  for(const mapping of records.mappings)assert.ok(all.includes(mapping.facilityId))
  assert.equal(new Set(all).size,all.length)
})
await check("Configured ranks/status/distance cannot become destination relevance",async()=>{
  const records=discoveryFixtures();records.mappings[0].recommendationRank=999;records.mappings[1].recommendationRank=1
  assert.deepEqual(ids("Fixture Transcript",createFacilityDiscoveryIndex((await load(records)).data),{status:"CLOSED",distance:1}),["library","registrar-office"])
  assert.doesNotMatch(JSON.stringify(entries("Fixture Transcript")),/recommendationRank|privateNotes/)
})
await check("Supplied records cannot override canonical identity or inject an unknown destination",()=>{
  const all=ids("",null,{facilities:[{id:"library",name:"Spoof"},{id:"not-canonical"},{id:"library"}]})
  assert.deepEqual(all,["library"]);assert.equal(entries("",null,{facilities:[{id:"library",name:"Spoof"} ]})[0].facility.name,"Library")
})
await check("Zero production-like catalog preserves local lookup without service inference",async()=>{
  const empty=await load({services:[],aliases:[],mappings:[]}),emptyIndex=createFacilityDiscoveryIndex(empty.data)
  assert.deepEqual(ids("Library",emptyIndex),["library"]);assert.deepEqual(ids("Fixture Transcript",emptyIndex),[])
})
for(const query of ["Fixture Pending Service","Fixture Demo Service","Fixture Pending Alias","Fixture Demo Alias"])await check(`Pending/DEMO excluded: ${query}`,()=>assert.deepEqual(ids(query),[]))
for(const field of ["services","aliases","mappings"])await check(`Independent ${field} unpublished/expired/future exclusion`,async()=>{
  for(const provenance of [{lifecycle:"DRAFT"},{expiresAt:"2026-10-14T00:00:00Z"},{effectiveAt:"2027-01-01T00:00:00Z"},{publishedAt:"2027-01-01T00:00:00Z"}]){
    const records=discoveryFixtures();for(const row of records[field])Object.assign(row.provenance,provenance)
    assert.deepEqual(ids("Fixture Transcript",createFacilityDiscoveryIndex((await load(records)).data)),[])
  }
})
await check("Loaded alias expiry suppresses matches even before revalidation completes",async()=>{
  const records=discoveryFixtures();records.aliases[0].provenance.expiresAt="2026-10-15T02:01:00Z"
  const data=(await load(records)).data;assert.equal(data.nextRefreshAt,"2026-10-15T02:01:00.000Z")
  assert.deepEqual(ids("Fixture Transcript",createFacilityDiscoveryIndex(data),{dateTime:"2026-10-15T02:01:00.000Z"}),[])
})
await check("Malformed aggregates and invalid time fail safely without inventing destinations",async()=>{
  assert.equal((await load({services:null,aliases:[],mappings:[]})).ok,false)
  assert.deepEqual(ids("Fixture Transcript",index,{dateTime:"invalid"}),[])
})
await check("Public reads remain exactly three capped/count-checked projections",async()=>{
  const views=[]
  const provider=createSupabaseFacilityProvider({from(view){views.push(view);const q={select(_cols,opts){assert.equal(opts.count,"exact");return q},order(){return q},limit(n){assert.equal(n,1000);return q},then(resolve){return Promise.resolve({data:[],count:1,error:null}).then(resolve)}};return q}})
  await assert.rejects(provider.getFacilityDiscoveryData());assert.deepEqual(views,["public_services","public_service_aliases","public_facility_service_mappings"])
})
await check("Home/Navigate/Global consumers coalesce, memoize, and make zero query-time reads",async()=>{
  let resolve,calls=0
  const store=createFacilityDiscoverySnapshot({isOnline:true,load:()=>{calls++;return new Promise(done=>{resolve=done})}})
  const release=[store.retain(),store.retain(),store.retain()];await flush();assert.equal(calls,1)
  resolve(result);await flush();const snapshot=store.getSnapshot()
  for(let n=0;n<1000;n++)compose("Fixture Transcript",snapshot.discoveryIndex)
  assert.equal(calls,1);assert.equal(store.getSnapshot().discoveryIndex,snapshot.discoveryIndex)
  release.forEach(fn=>fn());await flush();assert.equal(store.getSnapshot().result,null)
})
await check("Offline invalidation rejects late responses; reconnect revalidates before restoration",async()=>{
  const pending=[];const store=createFacilityDiscoverySnapshot({isOnline:true,load:()=>new Promise(resolve=>pending.push(resolve))})
  const release=store.retain();await flush();store.setOnline(false);pending[0](result);await flush()
  assert.deepEqual(ids("Fixture Transcript",store.getSnapshot().discoveryIndex),[]);assert.deepEqual(ids("Library",store.getSnapshot().discoveryIndex),["library"])
  store.setOnline(true);await flush();assert.equal(pending.length,2);assert.equal(store.getSnapshot().result,null)
  pending[1](result);await flush();assert.deepEqual(ids("Fixture Transcript",store.getSnapshot().discoveryIndex),["library","registrar-office"]);release();await flush()
})
await check("Retry replaces stale requests, sanitizes failures and recovers",async()=>{
  let fail=true;const store=createFacilityDiscoverySnapshot({isOnline:true,load:async()=>{if(fail)throw Error("PRIVATE_CANARY");return result}})
  const release=store.retain();await flush();assert.equal(store.getSnapshot().result.ok,false);assert.doesNotMatch(JSON.stringify(store.getSnapshot()),/PRIVATE_CANARY/)
  fail=false;await store.retry();assert.equal(store.getSnapshot().result,result);release();await flush()
})
await check("Known-boundary refresh clears old matches; inactive release cancels timers",async()=>{
  const timers=new Map();let serial=0,calls=0
  const store=createFacilityDiscoverySnapshot({isOnline:true,clock:()=>Date.parse(discoveryTime),load:async()=>{calls++;return {...result,data:{...result.data,nextRefreshAt:"2026-10-15T02:01:00.000Z"}}},schedule(fn,delay){assert.equal(delay,60001);timers.set(++serial,fn);return serial},cancel(id){timers.delete(id)}})
  const release=store.retain();await flush();const refresh=timers.get(1);timers.delete(1);refresh();assert.equal(store.getSnapshot().result,null);await flush();assert.equal(calls,2);release();await flush();assert.equal(timers.size,0)
})
const [picker,home,map,worker,adapter]=await Promise.all(["src/components/map/DestinationSearch.jsx","src/pages/Home.jsx","src/pages/Map.jsx","src/service-worker.js","src/services/destinationFacilitySearch.js"].map(read))
await check("Picker selection is an explicit canonical callback, not an effect or service-name handoff",()=>{
  assert.match(picker,/onSelect\(facility\)/);assert.match(picker,/choose\(results\[safeIndex\]\.facility\)/)
  assert.doesNotMatch(picker,/useEffect\([\s\S]{0,120}onSelect|startNavigation\(|getFacilityDiscoveryData\(/)
  assert.match(home,/getNavigateHref\(\{ facilityId: facility.id \}\)/)
  assert.equal(getNavigateHref({facilityId:"library"}),"/map?facility=library")
})
await check("Mounted Map destination-only callback preserves origin, preference and QR confirmation",()=>{
  const choose=map.slice(map.indexOf("const chooseDestination"),map.indexOf("const requestedDestinationId"))
  for(const text of ["setDestinationId(facility.id)","setDestinationQuery(facility.name)","resetRoute()","requestMapFocus(facility.id)"])assert.ok(choose.includes(text))
  assert.doesNotMatch(choose,/setCurrentPosition|setRoutePreference|setLocationConfirmation|startNavigation\(/)
  assert.match(map,/onSelect=\{chooseDestination\}/)
  const reset=map.slice(map.indexOf("const resetRoute"),map.indexOf("const resetEmergencyRoute"))
  for(const text of ["setRoute(null)","setInstructions([])",'setNavigationStatus("idle")',"setActiveStep(0)"])assert.ok(reset.includes(text))
})
await check("Typing service terms cannot resolve through Map's exact-facility handler",()=>{
  const update=map.slice(map.indexOf("const updateDestinationQuery"),map.indexOf("const chooseDestination"))
  assert.match(update,/allNavigableFacilities.find/);assert.doesNotMatch(update,/discovery|service|onSelect|startNavigation/)
})
await check("One scoped active snapshot, no private reads/persistence/new ranking engine",()=>{
  assert.match(picker,/useFacilityDiscovery\(open\)/);assert.match(adapter,/searchFacilities\(query/)
  assert.doesNotMatch(picker+adapter,/\.from\s*\(|localStorage|sessionStorage|indexedDB|recommendationRank|calculateFacilityRoute/)
})
await check("Combobox/group/announcements, input-only keyboard and focus boundaries",()=>{
  for(const text of ['role="combobox"','role="listbox"','role="group"','role="option"','aria-activedescendant','aria-describedby','aria-live="polite"','event.key === "ArrowDown"','event.key === "Enter"','event.key === "Escape"','event.stopPropagation()','event.currentTarget.contains(event.relatedTarget)'])assert.ok(picker.includes(text))
  assert.match(picker,/onClick=\{\(\) => setOpen\(true\)\}/,"A focused picker reopens after Escape")
  assert.match(picker,/onQueryChange\(""\); inputRef.current\?\.focus\(\)/,"Clear retains input focus")
})
await check("Mobile 44px actions, viewport/chrome/safe-area and reduced motion",()=>{
  for(const text of ['min-h-11','h-11 w-11','visualViewport','mobile-bottom-nav','clara-floating-button','safe-area-inset-bottom','motion-reduce:transition-none'])assert.ok(picker.includes(text))
})
await check("Offline/zero/error/retry states and Emergency/worker isolation",()=>{
  for(const text of ['Service destinations require a connection','No configured navigable service destinations','Retry service destinations','window.location.reload()'])assert.ok(picker.includes(text))
  assert.match(map,/!emergencyMode && \(\s*<DestinationSearch/);assert.match(map,/Emergency routing is unavailable offline/)
  assert.doesNotMatch(worker,/destinationFacilitySearch|public_services/)
})
const vite=await createServer({appType:"custom",configFile:false,esbuild:{jsx:"automatic"},logLevel:"error",optimizeDeps:{noDiscovery:true},resolve:{alias:{"@":fileURLToPath(new URL("../src",import.meta.url))}},root:fileURLToPath(new URL("..",import.meta.url)),server:{middlewareMode:true}})
try{
  const {default:DestinationSearch}=await vite.ssrLoadModule("/src/components/map/DestinationSearch.jsx")
  const {ConnectivityProvider}=await vite.ssrLoadModule("/src/contexts/ConnectivityContext.jsx")
  const {FacilityDiscoveryProvider}=await vite.ssrLoadModule("/src/contexts/FacilityDiscoveryContext.jsx")
  await check("Actual initial picker renders labelled, closed, without selecting or loading a destination",()=>{
    let selected=0
    const html=renderToString(React.createElement(ConnectivityProvider,null,React.createElement(FacilityDiscoveryProvider,null,React.createElement(DestinationSearch,{facilities,query:"",onQueryChange(){},onSelect(){selected++}}))))
    for(const pattern of [/role="combobox"/,/aria-expanded="false"/,/role="listbox"/,/role="group"/,/data-destination-popup="true" hidden=""|hidden="" data-destination-popup="true"/,/Service destinations require a connection/])assert.match(html,pattern)
    assert.equal(selected,0)
  })
}finally{await vite.close()}
await check("Local processing timing remains observable without network reads",()=>{
  const start=performance.now();for(let i=0;i<1000;i++)compose(i%2?"Fixture Transcript":"Office")
  console.log(`1000 destination compositions: ${(performance.now()-start).toFixed(2)} ms (local fixture, not device certification)`)
})
console.log(`FS-4 DestinationSearch service resolution: ${checks}/${checks} PASS; browser evidence recorded separately`)
