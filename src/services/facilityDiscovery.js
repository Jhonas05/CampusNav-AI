import {
  normalizeFacilityProvenance,
  normalizeFacilityServiceMapping,
  normalizeService,
  normalizeServiceAlias,
  normalizeServiceCode,
} from "../data/facilityContracts.js"
import { facilities, getFacilityById } from "../data/facilities.js"
import { getFloorById } from "../data/floors.js"

// Only whitespace and case are folded: no punctuation stripping, synonyms,
// accent transliteration, typo correction, or inferred facility aliases.
export const normalizeDiscoveryQuery = (value) => (
  typeof value === "string" ? value.trim().replace(/\s+/gu, " ").toLowerCase() : ""
)

const canonicalIndex = facilities.map((facility, order) => ({
  facility,
  order,
  name: normalizeDiscoveryQuery(facility.name),
  searchable: normalizeDiscoveryQuery([
    facility.name, facility.kind, facility.floorId, getFloorById(facility.floorId)?.name,
  ].filter(Boolean).join(" ")),
}))
const canonicalOrder = new Map(canonicalIndex.map(({ facility, order }) => [facility.id, order]))
const compareText = (left, right) => left < right ? -1 : left > right ? 1 : 0
const timestamp = (value) => typeof value === "string" ? Date.parse(value) : NaN
const validOptionalTime = (value) => value === null || Number.isFinite(timestamp(value))
const publicAt = (provenance, now) => (
  provenance.lifecycle === "PUBLISHED"
  && Number.isFinite(timestamp(provenance.publishedAt))
  && validOptionalTime(provenance.effectiveAt)
  && validOptionalTime(provenance.expiresAt)
  && timestamp(provenance.publishedAt) <= now
  && timestamp(provenance.effectiveAt || provenance.publishedAt) <= now
  && (provenance.expiresAt === null || timestamp(provenance.expiresAt) > now)
)
const approved = (provenance) => (
  ["VERIFIED", "SOURCE_ALIGNED"].includes(provenance.verificationStatus)
  && provenance.dataStatus === "ACTIVE"
  && !provenance.demo
)
const validSource = (provenance) => (
  typeof provenance.sourceType === "string" && provenance.sourceType.length > 0
  && [provenance.sourceId, provenance.sourceLabel].every((value) => value === null || typeof value === "string")
  && validOptionalTime(provenance.lastVerifiedAt)
  && Number.isFinite(timestamp(provenance.updatedAt))
)
const eligible = (record, now) => publicAt(record.provenance, now) && approved(record.provenance) && validSource(record.provenance)
export const isEligibleFacilityDiscoveryRecord = eligible
const safeProvenance = (record) => normalizeFacilityProvenance(record)
const cloneFacility = (facility) => ({ ...facility, verification: facility.verification ? { ...facility.verification } : null })

/** Validate an aggregate from accepted public projections; never return raw rows. */
export const normalizeFacilityDiscoveryData = (records, evaluatedAt) => {
  if (!records || ![records.services, records.aliases, records.mappings].every(Array.isArray)) {
    throw new Error("Invalid discovery aggregate.")
  }
  const now = timestamp(evaluatedAt)
  if (!Number.isFinite(now)) throw new Error("Invalid discovery time.")
  const services = records.services.map(normalizeService)
  const aliases = records.aliases.map(normalizeServiceAlias)
  const mappings = records.mappings.map(normalizeFacilityServiceMapping)
  if (
    services.some((row) => !row || normalizeServiceCode(row.code) !== row.code || typeof row.name !== "string" || !row.name.trim())
    || aliases.some((row) => !row || normalizeServiceCode(row.serviceCode) !== row.serviceCode || typeof row.alias !== "string" || !row.alias.trim())
    || mappings.some((row) => !row || normalizeServiceCode(row.serviceCode) !== row.serviceCode || typeof row.facilityId !== "string")
    || new Set(services.map(({ code }) => code)).size !== services.length
  ) throw new Error("Invalid discovery records.")

  const allRecords = [...services, ...aliases, ...mappings]
  const publicRecords = allRecords.filter((row) => publicAt(row.provenance, now))
  const futureBoundaries = allRecords.flatMap(({ provenance }) => (
    [provenance.publishedAt, provenance.effectiveAt, provenance.expiresAt]
      .map(timestamp).filter((value) => Number.isFinite(value) && value > now)
  ))
  const safeServices = services.filter((row) => eligible(row, now)).map((row) => ({
    code: row.code, name: row.name.trim(), provenance: safeProvenance(row),
  }))
  const serviceCodes = new Set(safeServices.map(({ code }) => code))
  return {
    evaluatedAt,
    nextRefreshAt: futureBoundaries.length ? new Date(Math.min(...futureBoundaries)).toISOString() : null,
    notices: {
      pending: publicRecords.some(({ provenance }) => !provenance.demo && !approved(provenance)),
      demoExcluded: publicRecords.some(({ provenance }) => provenance.demo),
    },
    services: safeServices,
    aliases: aliases.filter((row) => eligible(row, now) && serviceCodes.has(row.serviceCode)).map((row) => ({
      serviceCode: row.serviceCode, alias: row.alias.trim(), provenance: safeProvenance(row),
    })),
    mappings: mappings.filter((row) => eligible(row, now) && serviceCodes.has(row.serviceCode) && getFacilityById(row.facilityId)).map((row) => ({
      facilityId: row.facilityId, serviceCode: row.serviceCode, provenance: safeProvenance(row),
    })),
  }
}

/** Build once per successful network snapshot, never per keystroke/render. */
export const createFacilityDiscoveryIndex = (data) => {
  if (!data) return null
  const byService = new Map(data.services.map((service) => [service.code, {
    service,
    name: normalizeDiscoveryQuery(service.name),
    aliases: [],
    mappings: [],
  }]))
  for (const alias of data.aliases) byService.get(alias.serviceCode)?.aliases.push({ ...alias, term: normalizeDiscoveryQuery(alias.alias) })
  for (const mapping of data.mappings) byService.get(mapping.serviceCode)?.mappings.push(mapping)
  return [...byService.values()].sort((left, right) => compareText(left.service.code, right.service.code))
}

const nameMatch = (name, query) => name === query ? 0 : name.startsWith(query) ? 1 : name.includes(query) ? 2 : -1

/** Pure local search. Groups are match domains, not recommendations/relevance scores. */
export const searchFacilities = (query, {
  discoveryIndex = null,
  facilityIds = null,
  dateTime = new Date().toISOString(),
} = {}) => {
  const needle = normalizeDiscoveryQuery(query)
  const allowedIds = facilityIds === null ? null : new Set(facilityIds)
  const allowed = (id) => !allowedIds || allowedIds.has(id)
  const now = timestamp(dateTime)
  const canonicalMatches = canonicalIndex.filter(({ facility, searchable }) => (
    allowed(facility.id) && (!needle || searchable.includes(needle))
  )).map(({ facility, order, name }) => ({
    facility: cloneFacility(facility), order, kind: needle ? nameMatch(name, needle) : 0, matches: [],
  })).sort((left, right) => (
    (left.kind < 0 ? 3 : left.kind) - (right.kind < 0 ? 3 : right.kind) || left.order - right.order
  ))
  const byFacility = new Map(canonicalMatches.map((entry) => [entry.facility.id, entry]))
  const serviceMatches = []
  const unmappedServices = []
  if (needle && Number.isFinite(now)) for (const entry of discoveryIndex || []) {
    if (!eligible(entry.service, now)) continue
    const kind = nameMatch(entry.name, needle)
    const alias = entry.aliases.find((row) => row.term === needle && eligible(row, now))
    if (kind < 0 && !alias) continue
    const mappings = entry.mappings.filter((row) => eligible(row, now))
    if (!mappings.length) unmappedServices.push(entry.service.name)
    serviceMatches.push({ ...entry, kind: kind >= 0 ? kind : 3, alias: kind < 0 ? alias : null, mappings })
  }
  serviceMatches.sort((left, right) => left.kind - right.kind || compareText(left.service.code, right.service.code))
  const serviceResults = []
  for (const entry of serviceMatches) for (const mapping of entry.mappings.toSorted((left, right) => (
    canonicalOrder.get(left.facilityId) - canonicalOrder.get(right.facilityId)
  ))) {
    if (!allowed(mapping.facilityId)) continue
    let result = byFacility.get(mapping.facilityId)
    if (!result) {
      result = { facility: cloneFacility(getFacilityById(mapping.facilityId)), order: canonicalOrder.get(mapping.facilityId), kind: entry.kind, matches: [] }
      byFacility.set(mapping.facilityId, result)
      serviceResults.push(result)
    }
    if (result.matches.some(({ serviceCode }) => serviceCode === entry.service.code)) continue
    result.matches.push({
      serviceCode: entry.service.code,
      serviceName: entry.service.name,
      alias: entry.alias?.alias || null,
      serviceProvenance: { ...entry.service.provenance },
      aliasProvenance: entry.alias ? { ...entry.alias.provenance } : null,
      mappingProvenance: { ...mapping.provenance },
    })
  }
  const groups = [
    { id: "facilities", label: "Facility matches", results: canonicalMatches },
    { id: "services", label: "Service matches", results: serviceResults },
  ]
  return {
    groups,
    results: groups.flatMap(({ results }) => results),
    count: byFacility.size,
    unmappedServices,
    matchedServices: serviceMatches.map(({ service }) => ({ code: service.code, name: service.name })),
  }
}
