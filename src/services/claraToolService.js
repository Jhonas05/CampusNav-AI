import { facilities } from "../data/facilities.js"
import { getFloorById } from "../data/floors.js"
import {
  createFacilityDiscoveryIndex,
  getFacilityDiscoveryData,
  getFacilityStatus,
  searchFacilities,
} from "./facilityService.js"
import { normalizeClaraQuery } from "./claraKnowledge.js"

const GENERIC = new Set(["area", "building", "campus", "facility", "hall", "office", "room", "service"])
const clone = (value) => value == null ? value : structuredClone(value)

const canonicalCandidates = (query) => {
  const normalized = normalizeClaraQuery(query)
  const tokens = normalized.split(" ").filter((token) => token.length >= 2 && !GENERIC.has(token))
  return [...new Set([normalized, ...tokens].filter(Boolean))]
}

const findCanonicalMatches = (query) => {
  for (const candidate of canonicalCandidates(query)) {
    const matches = searchFacilities(candidate).groups[0].results
      .filter(({ facility }) => facility.kind !== "Construction")
    if (matches.length === 1) return matches
    const exact = matches.filter(({ facility }) => normalizeClaraQuery(facility.name) === candidate)
    if (exact.length === 1) return exact
  }
  return []
}

export const createClaraToolService = (dependencies = {}) => {
  const statusReader = dependencies.getFacilityStatus || getFacilityStatus
  const discoveryReader = dependencies.getFacilityDiscoveryData || getFacilityDiscoveryData
  return Object.freeze({
    findFacility(query) {
      const match = findCanonicalMatches(query)[0]?.facility || null
      if (!match) return { ok: true, availability: "UNAVAILABLE", data: null, error: null }
      const floor = getFloorById(match.floorId)
      return {
        ok: true,
        availability: "VERIFIED",
        data: { facility: clone(match), floor: floor ? { id: floor.id, name: floor.name } : null },
        error: null,
      }
    },
    async getFacilityStatus(facilityId, dateTime) {
      return statusReader(facilityId, dateTime)
    },
    async findService(query, dateTime) {
      const result = await discoveryReader(dateTime)
      if (!result?.ok || !result.data) return { ok: false, availability: result?.availability || "UNAVAILABLE", data: null, error: result?.error || null }
      const index = createFacilityDiscoveryIndex(result.data)
      const matched = searchFacilities(query, { discoveryIndex: index, dateTime: result.data.evaluatedAt || dateTime })
      const serviceResults = matched.groups.find(({ id }) => id === "services")?.results || []
      return {
        ok: true,
        availability: serviceResults.length ? "VERIFIED" : "UNAVAILABLE",
        data: {
          facilities: serviceResults.map(({ facility, matches }) => ({ facility: clone(facility), matches: clone(matches) })),
          unmappedServices: [...matched.unmappedServices],
        },
        error: null,
      }
    },
    getFacilityById(facilityId) {
      const facility = facilities.find(({ id }) => id === facilityId) || null
      return facility ? clone(facility) : null
    },
  })
}
