import { searchFacilities } from "./facilityDiscovery.js"

/** Presentation adapter only; all matching/eligibility remains in the accepted engine. */
export const getGlobalFacilityGroups = (query, options = {}) => {
  const discovery = searchFacilities(query, options)
  const canonical = discovery.groups[0].results.filter(({ facility }) => facility.kind !== "Construction")
  const asItem = ({ facility, matches }) => ({ type: "facility", id: `facility-${facility.id}`, facility, matches })
  const facilityItems = canonical.filter(({ facility }) => facility.kind !== "Room").slice(0, 6).map(asItem)
  const roomItems = canonical.filter(({ facility }) => facility.kind === "Room").slice(0, 4).map(asItem)
  const displayed = new Set([...facilityItems, ...roomItems].map(({ facility }) => facility.id))
  // Include capped-out canonical overlaps here, too. Never lose a configured choice.
  const serviceItems = discovery.results.filter(({ facility, matches }) => matches.length && !displayed.has(facility.id)).map(asItem)
  return {
    groups: [
      { title: "Facilities", items: facilityItems },
      { title: "Rooms", items: roomItems },
      { title: "Services", items: serviceItems },
    ],
    matchedServices: discovery.matchedServices,
    unmappedServices: discovery.unmappedServices,
    overlapCount: [...facilityItems, ...roomItems].filter(({ matches }) => matches.length).length,
  }
}
