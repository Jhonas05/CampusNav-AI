import {
  createFacilityResult,
  FACILITY_AVAILABILITY,
  FACILITY_ERROR_CODES,
  normalizeFacilityOperationalProfile,
  normalizeService,
  normalizeServiceAlias,
  normalizeServiceCode,
} from "../data/facilityContracts.js"
import { getFacilityById as getCanonicalFacilityById } from "../data/facilities.js"
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
})

const defaultFacilityService = createFacilityService()

export const getFacilityById = (facilityId) => defaultFacilityService.getFacilityById(facilityId)
export const getServices = (filters) => defaultFacilityService.getServices(filters)
export const getServiceByCode = (serviceCode) => defaultFacilityService.getServiceByCode(serviceCode)
export const getServiceAliases = (serviceCode) => defaultFacilityService.getServiceAliases(serviceCode)
