import { BACKEND_MODES } from "../../lib/supabaseClient.js"

export const createLocalFacilityProvider = () => ({
  mode: BACKEND_MODES.LOCAL,
  getFacilityOperationalProfile: async () => null,
  getServices: async () => [],
  getServiceByCode: async () => null,
  getServiceAliases: async () => [],
  getServicesForFacility: async () => [],
  getFacilitiesByService: async () => [],
})
