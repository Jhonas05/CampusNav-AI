import { BACKEND_MODES } from "../../lib/supabaseClient.js"

export const createLocalFacilityProvider = () => ({
  mode: BACKEND_MODES.LOCAL,
  getFacilityDiscoveryData: async () => ({ services: [], aliases: [], mappings: [] }),
  getFacilitiesDirectoryOperationalData: async () => ({
    operationalProfiles: [],
    weeklyHours: [],
    exceptions: [],
    statusAdvisories: [],
  }),
  getFacilityOperationalProfile: async () => null,
  getServices: async () => [],
  getServiceByCode: async () => null,
  getServiceAliases: async () => [],
  getServicesForFacility: async () => [],
  getFacilitiesByService: async () => [],
  getFacilityHours: async () => ({
    weeklyHours: [],
    exceptions: [],
    statusAdvisories: [],
  }),
})
