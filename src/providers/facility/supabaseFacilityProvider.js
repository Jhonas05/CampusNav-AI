import {
  normalizeFacilityOperationalProfile,
  normalizeService,
  normalizeServiceAlias,
  normalizeServiceCode,
} from "../../data/facilityContracts.js"
import { BACKEND_MODES } from "../../lib/supabaseClient.js"

const PUBLIC_FACILITY_PROFILE_VIEW = "public_facility_operational_profiles"
const PUBLIC_SERVICES_VIEW = "public_services"
const PUBLIC_SERVICE_ALIASES_VIEW = "public_service_aliases"
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

const PUBLIC_SERVICE_COLUMNS = [
  "code",
  "name",
  "description",
  "department_id",
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

const PUBLIC_SERVICE_ALIAS_COLUMNS = [
  "service_code",
  "alias",
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
  async getServices(filters = {}) {
    const code = filters?.code === undefined ? null : normalizeServiceCode(filters.code)
    if (filters?.code !== undefined && !code) return []

    let query = client
      .from(PUBLIC_SERVICES_VIEW)
      .select(PUBLIC_SERVICE_COLUMNS)
    if (code) query = query.eq("code", code)

    const { data, error } = await query.order("code", { ascending: true })
    if (error) throw error
    return (data || []).map(normalizeService)
  },
  async getServiceByCode(serviceCode) {
    const code = normalizeServiceCode(serviceCode)
    if (!code) return null

    const { data, error } = await client
      .from(PUBLIC_SERVICES_VIEW)
      .select(PUBLIC_SERVICE_COLUMNS)
      .eq("code", code)
      .maybeSingle()

    if (error) throw error
    return normalizeService(data)
  },
  async getServiceAliases(serviceCode) {
    const code = normalizeServiceCode(serviceCode)
    if (!code) return []

    const { data, error } = await client
      .from(PUBLIC_SERVICE_ALIASES_VIEW)
      .select(PUBLIC_SERVICE_ALIAS_COLUMNS)
      .eq("service_code", code)
      .order("alias", { ascending: true })

    if (error) throw error
    return (data || []).map(normalizeServiceAlias)
  },
})
