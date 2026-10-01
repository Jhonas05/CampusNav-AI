import {
  createFacilityResult,
  FACILITY_AVAILABILITY,
  FACILITY_ERROR_CODES,
  normalizeFacilityHourException,
  normalizeFacilityOperationalProfile,
  normalizeFacilityServiceMapping,
  normalizeFacilityStatusAdvisory,
  normalizeFacilityWeeklyHour,
  normalizeService,
  normalizeServiceAlias,
  normalizeServiceCode,
} from "../data/facilityContracts.js"
import { getFacilityById as getCanonicalFacilityById } from "../data/facilities.js"
import {
  getCampusDateRangeBounds,
  isValidCampusDateKey,
  normalizeCampusDateRange,
  timeToMinutes,
} from "../lib/campusTime.js"
import {
  BACKEND_MODES,
  getBackendAvailability,
  getSupabaseClient,
} from "../lib/supabaseClient.js"
import { createLocalFacilityProvider } from "../providers/facility/localFacilityProvider.js"
import { createSupabaseFacilityProvider } from "../providers/facility/supabaseFacilityProvider.js"

const cloneCanonicalFacility = (facility) => ({
  ...facility,
  verification: facility.verification ? { ...facility.verification } : null,
})

const facilityData = (facility, operationalProfile = null) => ({
  facility: cloneCanonicalFacility(facility),
  operationalProfile,
})

const facilityHoursData = (facility, dateRange, {
  weeklyHours = [],
  exceptions = [],
  statusAdvisories = [],
} = {}) => ({
  facility: cloneCanonicalFacility(facility),
  dateRange,
  weeklyHours,
  exceptions,
  statusAdvisories,
})

const notFoundResult = () => createFacilityResult({
  ok: false,
  availability: FACILITY_AVAILABILITY.UNAVAILABLE,
  data: null,
  error: {
    code: FACILITY_ERROR_CODES.NOT_FOUND,
    message: "Facility not found.",
    retryable: false,
  },
})

const providerUnavailableResult = (data) => createFacilityResult({
  ok: false,
  availability: FACILITY_AVAILABILITY.PROVIDER_UNAVAILABLE,
  data,
  error: {
    code: FACILITY_ERROR_CODES.PROVIDER_UNAVAILABLE,
    message: "Facility information is temporarily unavailable.",
    retryable: true,
  },
})

const invalidDateRangeResult = () => createFacilityResult({
  ok: false,
  availability: FACILITY_AVAILABILITY.UNAVAILABLE,
  data: null,
  error: {
    code: FACILITY_ERROR_CODES.INVALID_DATE_RANGE,
    message: "Date range is invalid.",
    retryable: false,
  },
})

const serviceNotFoundResult = (data = null) => createFacilityResult({
  ok: false,
  availability: FACILITY_AVAILABILITY.UNAVAILABLE,
  data,
  error: {
    code: FACILITY_ERROR_CODES.SERVICE_NOT_FOUND,
    message: "Service not found.",
    retryable: false,
  },
})

const unavailableResult = (data) => createFacilityResult({
  ok: true,
  availability: FACILITY_AVAILABILITY.UNAVAILABLE,
  data,
})

const configuredResult = (data) => createFacilityResult({
  ok: true,
  availability: FACILITY_AVAILABILITY.CONFIGURED,
  data,
})

const mappingMetadata = (mapping) => ({
  recommendationRank: mapping.recommendationRank,
  publicNotes: mapping.publicNotes,
  provenance: mapping.provenance,
})

const isValidMapping = (mapping) => (
  mapping
  && normalizeServiceCode(mapping.serviceCode) === mapping.serviceCode
  && Number.isInteger(mapping.recommendationRank)
  && mapping.recommendationRank >= 1
  && mapping.recommendationRank <= 1000
)

const compareMappings = (left, right, tieBreakKey) => (
  left.recommendationRank - right.recommendationRank
  || String(left[tieBreakKey]).localeCompare(String(right[tieBreakKey]))
)

const isNullableString = (value) => value === null || typeof value === "string"
const isValidTimestamp = (value) => typeof value === "string" && Number.isFinite(Date.parse(value))
const isValidOptionalTimestamp = (value) => value === null || isValidTimestamp(value)

const isValidProvenance = (provenance) => (
  provenance
  && typeof provenance.lifecycle === "string"
  && isValidTimestamp(provenance.publishedAt)
  && isValidOptionalTimestamp(provenance.effectiveAt)
  && isValidOptionalTimestamp(provenance.expiresAt)
  && typeof provenance.verificationStatus === "string"
  && typeof provenance.dataStatus === "string"
  && typeof provenance.sourceType === "string"
  && provenance.sourceType.length > 0
  && isNullableString(provenance.sourceId)
  && isNullableString(provenance.sourceLabel)
  && isValidOptionalTimestamp(provenance.lastVerifiedAt)
  && isValidTimestamp(provenance.updatedAt)
  && typeof provenance.demo === "boolean"
)

const isValidIntervalShape = (record) => (
  typeof record.closedAllDay === "boolean"
  && (
    (record.closedAllDay && record.startTime === null && record.endTime === null)
    || (
      !record.closedAllDay
      && Number.isFinite(timeToMinutes(record.startTime))
      && Number.isFinite(timeToMinutes(record.endTime))
    )
  )
)

const isValidWeeklyHour = (record, facilityId) => (
  record
  && record.facilityId === facilityId
  && Number.isInteger(record.dayOfWeek)
  && record.dayOfWeek >= 0
  && record.dayOfWeek <= 6
  && isValidIntervalShape(record)
  && isValidProvenance(record.provenance)
)

const isValidHourException = (record, facilityId) => (
  record
  && record.facilityId === facilityId
  && isValidCampusDateKey(record.exceptionDate)
  && isValidIntervalShape(record)
  && isValidProvenance(record.provenance)
)

const advisoryStartAt = (advisory) => (
  advisory.provenance.effectiveAt || advisory.provenance.publishedAt
)

const isValidStatusAdvisory = (record, facilityId) => (
  record
  && record.facilityId === facilityId
  && record.advisoryType === "TEMPORARY_CLOSURE"
  && isValidProvenance(record.provenance)
  && isValidTimestamp(advisoryStartAt(record))
)

const compareNullableText = (left, right, nullsLast = false) => {
  if (left === right) return 0
  if (left === null) return nullsLast ? 1 : -1
  if (right === null) return nullsLast ? -1 : 1
  return String(left).localeCompare(String(right))
}

const compareSource = (left, right) => (
  compareNullableText(left.provenance.sourceType, right.provenance.sourceType)
  || compareNullableText(left.provenance.sourceId, right.provenance.sourceId, true)
)

const compareIntervals = (left, right) => (
  Number(right.closedAllDay) - Number(left.closedAllDay)
  || compareNullableText(left.startTime, right.startTime)
  || compareNullableText(left.endTime, right.endTime)
  || compareSource(left, right)
)

const compareWeeklyHours = (left, right) => (
  left.dayOfWeek - right.dayOfWeek || compareIntervals(left, right)
)

const compareExceptions = (left, right) => (
  left.exceptionDate.localeCompare(right.exceptionDate) || compareIntervals(left, right)
)

const compareStatusAdvisories = (left, right) => (
  Date.parse(advisoryStartAt(left)) - Date.parse(advisoryStartAt(right))
  || (
    left.provenance.expiresAt === right.provenance.expiresAt
      ? 0
      : left.provenance.expiresAt === null
        ? 1
        : right.provenance.expiresAt === null
          ? -1
          : Date.parse(left.provenance.expiresAt) - Date.parse(right.provenance.expiresAt)
  )
  || compareSource(left, right)
)

const advisoryOverlapsDateRange = (advisory, dateRange) => {
  if (!dateRange) return true
  const { startAt, endAt } = getCampusDateRangeBounds(dateRange)
  const advisoryStart = Date.parse(advisoryStartAt(advisory))
  const advisoryEnd = advisory.provenance.expiresAt
    ? Date.parse(advisory.provenance.expiresAt)
    : Number.POSITIVE_INFINITY
  return advisoryStart < Date.parse(endAt) && advisoryEnd > Date.parse(startAt)
}

const normalizeServiceFilters = (filters) => {
  if (filters === undefined || filters === null) return {}
  if (typeof filters !== "object" || Array.isArray(filters)) return null
  if (Object.keys(filters).some((key) => key !== "code")) return null
  if (!Object.hasOwn(filters, "code")) return {}

  const code = normalizeServiceCode(filters.code)
  return code ? { code } : null
}

const defaultProviderLoader = async () => {
  if (!getBackendAvailability().configured) return createLocalFacilityProvider()
  const client = await getSupabaseClient()
  if (!client) throw new Error("Configured facility provider could not initialize.")
  return createSupabaseFacilityProvider(client)
}

export const createFacilityService = ({
  provider = null,
  providerLoader = provider ? null : defaultProviderLoader,
} = {}) => ({
  async getFacilityById(facilityId) {
    const normalizedId = typeof facilityId === "string" ? facilityId.trim() : ""
    const facility = normalizedId ? getCanonicalFacilityById(normalizedId) : null
    if (!facility) return notFoundResult()

    try {
      const activeProvider = provider || await providerLoader()
      const profile = normalizeFacilityOperationalProfile(
        await activeProvider.getFacilityOperationalProfile(facility.id),
      )

      if (!profile) {
        return createFacilityResult({
          ok: true,
          availability: FACILITY_AVAILABILITY.UNAVAILABLE,
          data: facilityData(facility),
        })
      }

      if (profile.facilityId !== facility.id || !getCanonicalFacilityById(profile.facilityId)) {
        return providerUnavailableResult(facilityData(facility))
      }

      return createFacilityResult({
        ok: true,
        availability: FACILITY_AVAILABILITY.CONFIGURED,
        data: facilityData(facility, profile),
      })
    } catch {
      return providerUnavailableResult(facilityData(facility))
    }
  },
  async getServices(filters) {
    const normalizedFilters = normalizeServiceFilters(filters)
    if (!normalizedFilters) return serviceNotFoundResult([])

    try {
      const activeProvider = provider || await providerLoader()
      const records = await activeProvider.getServices(normalizedFilters)
      if (!Array.isArray(records)) return providerUnavailableResult([])

      const services = records.map(normalizeService)
      const valid = services.every((service) => (
        service
        && normalizeServiceCode(service.code) === service.code
        && typeof service.name === "string"
        && service.name.trim().length > 0
        && (!normalizedFilters.code || service.code === normalizedFilters.code)
      ))
      if (!valid) return providerUnavailableResult([])

      return services.length ? configuredResult(services) : unavailableResult([])
    } catch {
      return providerUnavailableResult([])
    }
  },
  async getServiceByCode(serviceCode) {
    const code = normalizeServiceCode(serviceCode)
    if (!code) return serviceNotFoundResult()

    try {
      const activeProvider = provider || await providerLoader()
      const service = normalizeService(await activeProvider.getServiceByCode(code))
      if (!service) {
        return activeProvider.mode === BACKEND_MODES.LOCAL
          ? unavailableResult(null)
          : serviceNotFoundResult()
      }
      if (
        normalizeServiceCode(service.code) !== code
        || typeof service.name !== "string"
        || !service.name.trim()
      ) return providerUnavailableResult(null)

      return configuredResult(service)
    } catch {
      return providerUnavailableResult(null)
    }
  },
  async getServiceAliases(serviceCode) {
    const code = normalizeServiceCode(serviceCode)
    if (!code) return serviceNotFoundResult([])

    try {
      const activeProvider = provider || await providerLoader()
      const service = normalizeService(await activeProvider.getServiceByCode(code))
      if (!service) {
        return activeProvider.mode === BACKEND_MODES.LOCAL
          ? unavailableResult([])
          : serviceNotFoundResult([])
      }
      if (
        normalizeServiceCode(service.code) !== code
        || typeof service.name !== "string"
        || !service.name.trim()
      ) return providerUnavailableResult([])

      const records = await activeProvider.getServiceAliases(code)
      if (!Array.isArray(records)) return providerUnavailableResult([])

      const aliases = records.map(normalizeServiceAlias)
      const valid = aliases.every((alias) => (
        alias
        && alias.serviceCode === code
        && typeof alias.alias === "string"
        && alias.alias.trim().length > 0
      ))
      if (!valid) return providerUnavailableResult([])

      return configuredResult(aliases)
    } catch {
      return providerUnavailableResult([])
    }
  },
  async getServicesForFacility(facilityId) {
    const normalizedId = typeof facilityId === "string" ? facilityId.trim() : ""
    const facility = normalizedId ? getCanonicalFacilityById(normalizedId) : null
    if (!facility) return notFoundResult()

    try {
      const activeProvider = provider || await providerLoader()
      const records = await activeProvider.getServicesForFacility(facility.id)
      if (!Array.isArray(records)) return providerUnavailableResult([])

      const mappings = records.map(normalizeFacilityServiceMapping)
      const valid = mappings.every((mapping) => (
        isValidMapping(mapping)
        && mapping.facilityId === facility.id
        && typeof mapping.serviceName === "string"
        && mapping.serviceName.trim().length > 0
      ))
      if (!valid) return providerUnavailableResult([])

      const results = mappings
        .toSorted((left, right) => compareMappings(left, right, "serviceCode"))
        .map((mapping) => ({
          service: {
            code: mapping.serviceCode,
            name: mapping.serviceName,
          },
          mapping: mappingMetadata(mapping),
        }))

      return results.length ? configuredResult(results) : unavailableResult([])
    } catch {
      return providerUnavailableResult([])
    }
  },
  async getFacilitiesByService(serviceCode) {
    const code = normalizeServiceCode(serviceCode)
    if (!code) return serviceNotFoundResult([])

    try {
      const activeProvider = provider || await providerLoader()
      const service = normalizeService(await activeProvider.getServiceByCode(code))
      if (!service) {
        return activeProvider.mode === BACKEND_MODES.LOCAL
          ? unavailableResult([])
          : serviceNotFoundResult([])
      }
      if (
        normalizeServiceCode(service.code) !== code
        || typeof service.name !== "string"
        || !service.name.trim()
      ) return providerUnavailableResult([])

      const records = await activeProvider.getFacilitiesByService(code)
      if (!Array.isArray(records)) return providerUnavailableResult([])

      const mappings = records.map(normalizeFacilityServiceMapping)
      if (!mappings.every((mapping) => isValidMapping(mapping) && mapping.serviceCode === code)) {
        return providerUnavailableResult([])
      }

      const results = mappings
        .filter((mapping) => getCanonicalFacilityById(mapping.facilityId))
        .toSorted((left, right) => compareMappings(left, right, "facilityId"))
        .map((mapping) => ({
          facility: cloneCanonicalFacility(getCanonicalFacilityById(mapping.facilityId)),
          mapping: mappingMetadata(mapping),
        }))

      return results.length ? configuredResult(results) : unavailableResult([])
    } catch {
      return providerUnavailableResult([])
    }
  },
  async getFacilityHours(facilityId, dateRange) {
    const normalizedId = typeof facilityId === "string" ? facilityId.trim() : ""
    const facility = normalizedId ? getCanonicalFacilityById(normalizedId) : null
    if (!facility) return notFoundResult()

    const normalizedDateRange = normalizeCampusDateRange(dateRange)
    if (normalizedDateRange === undefined) return invalidDateRangeResult()

    const emptyData = facilityHoursData(facility, normalizedDateRange)

    try {
      const activeProvider = provider || await providerLoader()
      const records = await activeProvider.getFacilityHours(facility.id, normalizedDateRange)
      if (
        !records
        || !Array.isArray(records.weeklyHours)
        || !Array.isArray(records.exceptions)
        || !Array.isArray(records.statusAdvisories)
      ) return providerUnavailableResult(emptyData)

      const weeklyHours = records.weeklyHours.map(normalizeFacilityWeeklyHour)
      const exceptions = records.exceptions.map(normalizeFacilityHourException)
      const statusAdvisories = []
      let advisoryPayloadValid = true
      for (const record of records.statusAdvisories) {
        const advisory = normalizeFacilityStatusAdvisory(record)
        if (advisory?.advisoryType === "SERVICE_INTERRUPTION") continue
        if (!isValidStatusAdvisory(advisory, facility.id)) {
          advisoryPayloadValid = false
          break
        }
        statusAdvisories.push(advisory)
      }

      if (
        !weeklyHours.every((record) => isValidWeeklyHour(record, facility.id))
        || !exceptions.every((record) => isValidHourException(record, facility.id))
        || !advisoryPayloadValid
      ) return providerUnavailableResult(emptyData)

      const data = facilityHoursData(facility, normalizedDateRange, {
        weeklyHours: weeklyHours.toSorted(compareWeeklyHours),
        exceptions: exceptions
          .filter((record) => (
            !normalizedDateRange
            || (
              record.exceptionDate >= normalizedDateRange.startDate
              && record.exceptionDate <= normalizedDateRange.endDate
            )
          ))
          .toSorted(compareExceptions),
        statusAdvisories: statusAdvisories
          .filter((record) => advisoryOverlapsDateRange(record, normalizedDateRange))
          .toSorted(compareStatusAdvisories),
      })
      const hasSourceRows = data.weeklyHours.length
        || data.exceptions.length
        || data.statusAdvisories.length

      return hasSourceRows ? configuredResult(data) : unavailableResult(data)
    } catch {
      return providerUnavailableResult(emptyData)
    }
  },
})

const defaultFacilityService = createFacilityService()

export const getFacilityById = (facilityId) => defaultFacilityService.getFacilityById(facilityId)
export const getServices = (filters) => defaultFacilityService.getServices(filters)
export const getServiceByCode = (serviceCode) => defaultFacilityService.getServiceByCode(serviceCode)
export const getServiceAliases = (serviceCode) => defaultFacilityService.getServiceAliases(serviceCode)
export const getServicesForFacility = (facilityId) => defaultFacilityService.getServicesForFacility(facilityId)
export const getFacilitiesByService = (serviceCode) => defaultFacilityService.getFacilitiesByService(serviceCode)
export const getFacilityHours = (facilityId, dateRange) => defaultFacilityService.getFacilityHours(facilityId, dateRange)
