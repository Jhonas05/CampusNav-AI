import { facilities as canonicalFacilities } from "../data/facilities.js"
import { getFloorById } from "../data/floors.js"
import { getFacilityEntranceNodes } from "../data/mapNodes.js"
import { getFacilityCategory } from "../lib/facilityCategories.js"
import { searchFacilities } from "./facilityDiscovery.js"

const MAX_RESULTS = 8
const normalize = (value) => value.trim().toLowerCase()
const canonicalOrder = new Map(canonicalFacilities.map(({ id }, order) => [id, order]))
const navigableById = new Map(canonicalFacilities.filter((facility) => facility.navigable !== false
  && getFacilityEntranceNodes(facility.id, facility.floorId).length).map((facility) => [facility.id, facility]))

// Preserve DestinationSearch's existing consumer-local facility ranker verbatim.
const rankFacility = (facility, needle) => {
  const name = facility.name.toLowerCase()
  if (name === needle) return 0
  if (name.startsWith(needle)) return 1
  if (name.split(/[\s'’.&-]+/).some((word) => word.startsWith(needle))) return 2
  if (name.includes(needle)) return 3
  const floor = getFloorById(facility.floorId)
  const context = [facility.floorId, floor?.name, getFacilityCategory(facility).label, facility.kind].filter(Boolean).join(" ").toLowerCase()
  return context.includes(needle) ? 4 : -1
}

/** Presentation composition only: legacy facility order plus the accepted service matcher.
 * @param {string} query
 * @param {Record<string, any>} options
 */
export const getDestinationFacilityGroups = (query, { facilities, destinationId = "", discoveryIndex = null, dateTime } = {}) => {
  const candidates = [...new Set((facilities || []).map(({ id }) => id))].map((id) => navigableById.get(id)).filter(Boolean)
  const needle = normalize(query || "")
  const selected = candidates.find(({ id }) => id === destinationId)
  const browsing = !needle || Boolean(selected && normalize(selected.name) === needle)
  const direct = browsing ? [...candidates].sort((a, b) =>
    (getFloorById(a.floorId)?.level ?? 0) - (getFloorById(b.floorId)?.level ?? 0) || a.name.localeCompare(b.name))
    : candidates.map((facility) => ({ facility, rank: rankFacility(facility, needle) }))
      .filter(({ rank }) => rank >= 0).sort((a, b) => a.rank - b.rank || a.facility.name.localeCompare(b.facility.name))
      .slice(0, MAX_RESULTS).map(({ facility }) => facility)
  const discovery = searchFacilities(query, { discoveryIndex, facilityIds: candidates.map(({ id }) => id), dateTime })
  const matched = new Map(discovery.results.map(({ facility, matches }) => [facility.id, matches]))
  const displayed = new Set(direct.map(({ id }) => id))
  const serviceOrder = new Map(discovery.matchedServices.map(({ code }, order) => [code, order]))
  const firstService = ({ matches }) => Math.min(...matches.map(({ serviceCode }) => serviceOrder.get(serviceCode)))
  // Recover service order even for engine canonical overlaps outside our legacy preview.
  const serviceItems = discovery.results.filter(({ facility, matches }) => matches.length && !displayed.has(facility.id))
    .sort((a, b) => firstService(a) - firstService(b) || canonicalOrder.get(a.facility.id) - canonicalOrder.get(b.facility.id))
    .map(({ facility, matches }) => ({ facility, matches }))
  return {
    browsing,
    groups: [
      { label: browsing ? "All destinations · GF–5F" : "Facilities", items: direct.map((facility) => ({ facility, matches: matched.get(facility.id) || [] })) },
      { label: "Services", items: serviceItems },
    ],
    matchedServices: discovery.matchedServices,
    unmappedServices: discovery.matchedServices.filter(({ code }) => !discovery.results.some(({ matches }) => matches.some(({ serviceCode }) => serviceCode === code))).map(({ name }) => name),
  }
}
