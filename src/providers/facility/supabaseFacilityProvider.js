import { normalizeFacilityOperationalProfile } from "../../data/facilityContracts.js"
import { BACKEND_MODES } from "../../lib/supabaseClient.js"

const PUBLIC_FACILITY_PROFILE_VIEW = "public_facility_operational_profiles"
const PUBLIC_FACILITY_PROFILE_COLUMNS = [
  "id",
  "facility_id",
  "department_id",
  "description",
  "public_contact_name",
  "public_contact_email",
  "public_contact_phone",
  "lifecycle",
  "published_at",
  "effective_at",
  "expires_at",
  "verification_status",
  "data_status",
  "source_type",
  "source_id",
  "source_label",
  "last_verified_at",
  "updated_at",
].join(", ")

export const createSupabaseFacilityProvider = (client) => ({
  mode: BACKEND_MODES.SUPABASE,
  async getFacilityOperationalProfile(facilityId) {
    const { data, error } = await client
      .from(PUBLIC_FACILITY_PROFILE_VIEW)
      .select(PUBLIC_FACILITY_PROFILE_COLUMNS)
      .eq("facility_id", facilityId)
      .maybeSingle()

    if (error) throw error
    return normalizeFacilityOperationalProfile(data)
  },
})
