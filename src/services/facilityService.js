import {
  createFacilityResult,
  FACILITY_AVAILABILITY,
  FACILITY_ERROR_CODES,
  normalizeFacilityOperationalProfile,
} from "../data/facilityContracts.js"
import { getFacilityById as getCanonicalFacilityById } from "../data/facilities.js"
import { getBackendAvailability, getSupabaseClient } from "../lib/supabaseClient.js"
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

const providerUnavailableResult = (facility) => createFacilityResult({
  ok: false,
  availability: FACILITY_AVAILABILITY.PROVIDER_UNAVAILABLE,
  data: facilityData(facility),
  error: {
    code: FACILITY_ERROR_CODES.PROVIDER_UNAVAILABLE,
    message: "Facility information is temporarily unavailable.",
    retryable: true,
  },
})

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
        return providerUnavailableResult(facility)
      }

      return createFacilityResult({
        ok: true,
        availability: FACILITY_AVAILABILITY.CONFIGURED,
        data: facilityData(facility, profile),
      })
    } catch {
      return providerUnavailableResult(facility)
    }
  },
})

const defaultFacilityService = createFacilityService()

export const getFacilityById = (facilityId) => defaultFacilityService.getFacilityById(facilityId)
