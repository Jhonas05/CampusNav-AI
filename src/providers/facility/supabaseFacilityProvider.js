import {
  normalizeFacilityOperationalProfile,
  normalizeFacilityHourException,
  normalizeFacilityServiceMapping,
  normalizeFacilityStatusAdvisory,
  normalizeFacilityWeeklyHour,
  normalizeService,
  normalizeServiceAlias,
  normalizeServiceCode,
} from "../../data/facilityContracts.js"
import { BACKEND_MODES } from "../../lib/supabaseClient.js"

const PUBLIC_FACILITY_PROFILE_VIEW = "public_facility_operational_profiles"
const PUBLIC_SERVICES_VIEW = "public_services"
const PUBLIC_SERVICE_ALIASES_VIEW = "public_service_aliases"
const PUBLIC_FACILITY_SERVICE_MAPPINGS_VIEW = "public_facility_service_mappings"
const PUBLIC_FACILITY_HOURS_VIEW = "public_facility_hours"
const PUBLIC_FACILITY_HOUR_EXCEPTIONS_VIEW = "public_facility_hour_exceptions"
const PUBLIC_FACILITY_STATUS_ADVISORIES_VIEW = "public_facility_status_advisories"
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

const PUBLIC_FACILITY_SERVICE_MAPPING_COLUMNS = [
  "facility_id",
  "service_code",
  "service_name",
  "recommendation_rank",
  "public_notes",
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

const PUBLIC_FACILITY_HOUR_COLUMNS = [
  "facility_id",
  "day_of_week",
  "closed_all_day",
  "start_time",
  "end_time",
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

const PUBLIC_FACILITY_HOUR_EXCEPTION_COLUMNS = [
  "facility_id",
  "exception_date",
  "closed_all_day",
  "start_time",
  "end_time",
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

const PUBLIC_FACILITY_STATUS_ADVISORY_COLUMNS = [
  "facility_id",
  "advisory_type",
  "lifecycle",
  "published_at",
  "effective_at",
  "expires_at",
  "verification_status",
  "data_status",
  "source_type",
  "source_id",
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
  async getServicesForFacility(facilityId) {
    const { data, error } = await client
      .from(PUBLIC_FACILITY_SERVICE_MAPPINGS_VIEW)
      .select(PUBLIC_FACILITY_SERVICE_MAPPING_COLUMNS)
      .eq("facility_id", facilityId)
      .order("recommendation_rank", { ascending: true })
      .order("service_code", { ascending: true })

    if (error) throw error
    return (data || []).map(normalizeFacilityServiceMapping)
  },
  async getFacilitiesByService(serviceCode) {
    const code = normalizeServiceCode(serviceCode)
    if (!code) return []

    const { data, error } = await client
      .from(PUBLIC_FACILITY_SERVICE_MAPPINGS_VIEW)
      .select(PUBLIC_FACILITY_SERVICE_MAPPING_COLUMNS)
      .eq("service_code", code)
      .order("recommendation_rank", { ascending: true })
      .order("facility_id", { ascending: true })

    if (error) throw error
    return (data || []).map(normalizeFacilityServiceMapping)
  },
  async getFacilityHours(facilityId, dateRange = null) {
    const weeklyHoursQuery = client
      .from(PUBLIC_FACILITY_HOURS_VIEW)
      .select(PUBLIC_FACILITY_HOUR_COLUMNS)
      .eq("facility_id", facilityId)
      .order("day_of_week", { ascending: true })
      .order("closed_all_day", { ascending: false })
      .order("start_time", { ascending: true, nullsFirst: true })
      .order("end_time", { ascending: true, nullsFirst: true })
      .order("source_type", { ascending: true })
      .order("source_id", { ascending: true, nullsFirst: false })

    let exceptionsQuery = client
      .from(PUBLIC_FACILITY_HOUR_EXCEPTIONS_VIEW)
      .select(PUBLIC_FACILITY_HOUR_EXCEPTION_COLUMNS)
      .eq("facility_id", facilityId)
    if (dateRange) {
      exceptionsQuery = exceptionsQuery
        .gte("exception_date", dateRange.startDate)
        .lte("exception_date", dateRange.endDate)
    }
    exceptionsQuery = exceptionsQuery
      .order("exception_date", { ascending: true })
      .order("closed_all_day", { ascending: false })
      .order("start_time", { ascending: true, nullsFirst: true })
      .order("end_time", { ascending: true, nullsFirst: true })
      .order("source_type", { ascending: true })
      .order("source_id", { ascending: true, nullsFirst: false })

    const statusAdvisoriesQuery = client
      .from(PUBLIC_FACILITY_STATUS_ADVISORIES_VIEW)
      .select(PUBLIC_FACILITY_STATUS_ADVISORY_COLUMNS)
      .eq("facility_id", facilityId)
      .order("effective_at", { ascending: true, nullsFirst: true })
      .order("published_at", { ascending: true })
      .order("expires_at", { ascending: true, nullsFirst: false })
      .order("source_type", { ascending: true })
      .order("source_id", { ascending: true, nullsFirst: false })

    const [weeklyHoursResult, exceptionsResult, statusAdvisoriesResult] = await Promise.all([
      weeklyHoursQuery,
      exceptionsQuery,
      statusAdvisoriesQuery,
    ])
    const error = weeklyHoursResult.error || exceptionsResult.error || statusAdvisoriesResult.error
    if (error) throw error

    return {
      weeklyHours: (weeklyHoursResult.data || []).map(normalizeFacilityWeeklyHour),
      exceptions: (exceptionsResult.data || []).map(normalizeFacilityHourException),
      statusAdvisories: (statusAdvisoriesResult.data || []).map(normalizeFacilityStatusAdvisory),
    }
  },
})
