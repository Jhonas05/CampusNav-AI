import {
  createFacilityResult, FACILITY_AVAILABILITY, FACILITY_ERROR_CODES,
  normalizeFacilityServiceMapping, normalizeServiceCode,
} from "../data/facilityContracts.js"
import { getFacilityById } from "../data/facilities.js"
import { isEligibleFacilityDiscoveryRecord } from "./facilityDiscovery.js"
import { normalizeFacilityStatusTimestamp } from "./facilityStatusEvaluator.js"

const compareId = (left, right) => left < right ? -1 : left > right ? 1 : 0
const compareMappings = (left, right) => left.recommendationRank - right.recommendationRank
  || compareId(left.facilityId, right.facilityId)

/** Opt-in metadata from the SAME bounded public aggregate, not another fetch. */
export const withConfiguredServiceMappings = (data, records) => {
  const serviceCodes = new Set(data.services.map(({ code }) => code))
  const now = Date.parse(data.evaluatedAt)
  const configuredMappings = records.mappings.map(normalizeFacilityServiceMapping).filter((row) => (
    row && serviceCodes.has(row.serviceCode) && getFacilityById(row.facilityId)
    && isEligibleFacilityDiscoveryRecord(row, now)
  )).map(({ facilityId, serviceCode, recommendationRank, provenance }) => {
    if (!Number.isInteger(recommendationRank) || recommendationRank < 1 || recommendationRank > 1000) {
      throw new Error("Invalid configured mapping order.")
    }
    return { facilityId, serviceCode, recommendationRank, provenance: { ...provenance } }
  })
  return { ...data, configuredMappings }
}

/** Memoize once per snapshot. Conflicting duplicates fail closed, never pick a rank. */
export const createConfiguredServiceRecommendationIndex = (data) => {
  if (!data || !Array.isArray(data.configuredMappings)) return null
  const index = new Map(data.services.map((service) => [service.code, { service, mappings: [] }]))
  for (const mapping of data.configuredMappings) {
    const entry = index.get(mapping.serviceCode)
    if (!entry) continue
    const duplicate = entry.mappings.find(({ facilityId }) => facilityId === mapping.facilityId)
    if (duplicate) {
      if (JSON.stringify(duplicate) !== JSON.stringify(mapping)) return null
      continue
    }
    entry.mappings.push(mapping)
  }
  for (const entry of index.values()) entry.mappings.sort(compareMappings)
  return index
}

const failure = (code, message, retryable = false) => createFacilityResult({
  ok: false,
  availability: retryable ? FACILITY_AVAILABILITY.PROVIDER_UNAVAILABLE : FACILITY_AVAILABILITY.UNAVAILABLE,
  data: null, error: { code, message, retryable },
})

/** Pure network-only snapshot composition; matching stays in searchFacilities. */
export const getConfiguredServiceRecommendations = (serviceCode, {
  recommendationIndex = null, facilityIds = null,
  dateTime = new Date().toISOString(), isOnline = true,
} = {}) => {
  const code = normalizeServiceCode(serviceCode)
  if (!code) return failure(FACILITY_ERROR_CODES.SERVICE_NOT_FOUND, "Service not found.")
  const evaluatedAt = normalizeFacilityStatusTimestamp(dateTime)
  if (!evaluatedAt) return failure(FACILITY_ERROR_CODES.INVALID_DATE_TIME, "Date and time is invalid.")
  if (!isOnline || !recommendationIndex) return failure(
    FACILITY_ERROR_CODES.PROVIDER_UNAVAILABLE, "Configured service locations are temporarily unavailable.", true,
  )
  const entry = recommendationIndex.get(code)
  const now = Date.parse(evaluatedAt)
  if (!entry || !isEligibleFacilityDiscoveryRecord(entry.service, now)) {
    return failure(FACILITY_ERROR_CODES.SERVICE_NOT_FOUND, "Service not found.")
  }
  const allowedIds = facilityIds === null ? null : new Set(facilityIds)
  const recommendations = entry.mappings.filter((mapping) => (
    isEligibleFacilityDiscoveryRecord(mapping, now) && (!allowedIds || allowedIds.has(mapping.facilityId))
  )).map((mapping) => {
    const facility = getFacilityById(mapping.facilityId)
    return {
      facility: { ...facility, verification: facility.verification ? { ...facility.verification } : null },
      mapping: { recommendationRank: mapping.recommendationRank, provenance: { ...mapping.provenance } },
    }
  })
  return createFacilityResult({
    ok: true,
    availability: recommendations.length ? FACILITY_AVAILABILITY.CONFIGURED : FACILITY_AVAILABILITY.UNAVAILABLE,
    data: { evaluatedAt, service: { ...entry.service, provenance: { ...entry.service.provenance } }, recommendations },
  })
}
