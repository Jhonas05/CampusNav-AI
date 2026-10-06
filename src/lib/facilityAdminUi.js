import {
  FACILITY_ADMIN_DATA_STATUSES,
  FACILITY_ADMIN_LIFECYCLES,
  FACILITY_ADMIN_RESOURCES,
  FACILITY_ADMIN_VERIFICATION_STATUSES,
} from "../services/facilityAdminService.js"

export const FACILITY_ADMIN_UI_LIFECYCLES = FACILITY_ADMIN_LIFECYCLES
export const FACILITY_ADMIN_UI_VERIFICATION_STATUSES = FACILITY_ADMIN_VERIFICATION_STATUSES
export const FACILITY_ADMIN_UI_DATA_STATUSES = FACILITY_ADMIN_DATA_STATUSES

export const FACILITY_ADMIN_CREATE_DEFAULTS = Object.freeze({
  lifecycle: "DRAFT",
  public_visibility: false,
  published_at: null,
  effective_at: null,
  expires_at: null,
  verification_status: "PENDING_VERIFICATION",
  data_status: "PENDING_VERIFICATION",
  source_type: "ADMIN_CMS",
  source_id: null,
  source_label: null,
  last_verified_at: null,
})

const SAFE_ERROR_COPY = Object.freeze({
  VALIDATION_ERROR: "Review the highlighted record details and try again.",
  DUPLICATE_SERVICE_CODE: "That service code is already in use. Choose another stable code.",
  DUPLICATE_ALIAS: "That alias already exists for the selected service.",
  DUPLICATE_MAPPING: "That service is already mapped to the selected facility.",
  HOURS_OVERLAP: "This interval overlaps another active interval for the same facility and schedule key.",
  CLOSED_MARKER_CONFLICT: "A closed-all-day marker conflicts with another active interval for the same facility and schedule key.",
  STALE_RECORD: "This record changed elsewhere. Your values were not overwritten; reload the stored version before saving again.",
  DELETE_CONFLICT: "This record is still referenced. Expire it or remove dependent records in a later authorized workflow.",
  DELETE_NOT_ALLOWED: "This record must be expired or cancelled instead of deleted.",
  PUBLISH_VALIDATION_FAILED: "This record is not ready to publish. Review publication and verification details.",
  PERMISSION_DENIED: "Your account does not have permission for that action.",
  SESSION_EXPIRED: "Your admin session has expired. Sign in again to continue.",
  NETWORK_ERROR: "The CampusNav backend is temporarily unreachable. Try again when the connection is restored.",
  BACKEND_UNAVAILABLE: "Facility administration is unavailable because the backend is not configured.",
  NOT_FOUND: "This record no longer exists. Refresh the list to continue.",
  ADMIN_ERROR: "The facility admin operation could not be completed.",
})

const DETAILED_DOMAIN_ERRORS = new Set(["VALIDATION_ERROR", "PUBLISH_VALIDATION_FAILED"])

export const safeFacilityAdminMessage = (error) => {
  if (DETAILED_DOMAIN_ERRORS.has(error?.code) && typeof error?.message === "string" && error.message.trim()) {
    return error.message.trim()
  }
  return SAFE_ERROR_COPY[error?.code] || SAFE_ERROR_COPY.ADMIN_ERROR
}

export const toDateTimeLocalValue = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ""
  return new Date(date.getTime() + (8 * 60 * 60 * 1000)).toISOString().slice(0, 16)
}

const toAbsoluteTimestamp = (value) => {
  if (!value) return null
  const normalized = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(value)
    ? `${value.length === 16 ? `${value}:00` : value}+08:00`
    : value
  const date = new Date(normalized)
  return Number.isFinite(date.getTime()) ? date.toISOString() : value
}

const nullableText = (value) => String(value ?? "").trim() || null
const nullableDepartment = (value) => value ? Number(value) : null

export const createFacilityAdminForm = (resource, record = null, identity = null) => {
  const base = record
    ? {
        ...record,
        effective_at: toDateTimeLocalValue(record.effective_at),
        expires_at: toDateTimeLocalValue(record.expires_at),
        last_verified_at: toDateTimeLocalValue(record.last_verified_at),
      }
    : { ...FACILITY_ADMIN_CREATE_DEFAULTS }

  if (resource === FACILITY_ADMIN_RESOURCES.PROFILES) {
    return {
      ...base,
      facility_id: record?.facility_id || identity || "",
      department_id: record?.department_id || "",
      description: record?.description || "",
      public_contact_name: record?.public_contact_name || "",
      public_contact_email: record?.public_contact_email || "",
      public_contact_phone: record?.public_contact_phone || "",
    }
  }

  if (resource === FACILITY_ADMIN_RESOURCES.ALIASES) {
    return {
      ...base,
      service_id: record?.service_id || identity?.service_id || "",
      alias: record?.alias || "",
    }
  }

  if (resource === FACILITY_ADMIN_RESOURCES.MAPPINGS) {
    return {
      ...base,
      facility_id: record?.facility_id || identity?.facility_id || "",
      service_id: record?.service_id || identity?.service_id || "",
      recommendation_rank: record?.recommendation_rank ?? 100,
      public_notes: record?.public_notes || "",
    }
  }

  if ([FACILITY_ADMIN_RESOURCES.HOURS, FACILITY_ADMIN_RESOURCES.EXCEPTIONS].includes(resource)) {
    return {
      ...base,
      facility_id: record?.facility_id || identity?.facility_id || identity || "",
      day_of_week: record?.day_of_week ?? 1,
      exception_date: record?.exception_date || "",
      closed_all_day: Boolean(record?.closed_all_day),
      intervals: record?.closed_all_day
        ? []
        : [{ key: "interval-1", start_time: String(record?.start_time || "08:00").slice(0, 5), end_time: String(record?.end_time || "17:00").slice(0, 5) }],
    }
  }

  return {
    ...base,
    code: record?.code || "",
    name: record?.name || "",
    description: record?.description || "",
    department_id: record?.department_id || "",
  }
}

const commonFacilityAdminPayload = (form) => ({
  lifecycle: form.lifecycle || "DRAFT",
  public_visibility: Boolean(form.public_visibility),
  published_at: toAbsoluteTimestamp(form.published_at),
  effective_at: toAbsoluteTimestamp(form.effective_at),
  expires_at: toAbsoluteTimestamp(form.expires_at),
  verification_status: form.verification_status || "PENDING_VERIFICATION",
  data_status: form.data_status || "PENDING_VERIFICATION",
  source_type: nullableText(form.source_type) || "ADMIN_CMS",
  source_id: nullableText(form.source_id),
  source_label: nullableText(form.source_label),
  last_verified_at: toAbsoluteTimestamp(form.last_verified_at),
})

export const buildFacilitySchedulePayloads = (resource, form, { operation = "create" } = {}) => {
  if (![FACILITY_ADMIN_RESOURCES.HOURS, FACILITY_ADMIN_RESOURCES.EXCEPTIONS].includes(resource)) return []
  const identity = operation === "create" ? { facility_id: form.facility_id } : {}
  const scheduleKey = resource === FACILITY_ADMIN_RESOURCES.HOURS
    ? { day_of_week: Number(form.day_of_week) }
    : { exception_date: String(form.exception_date || "") }
  const common = commonFacilityAdminPayload(form)

  if (form.closed_all_day) {
    return [{ ...identity, ...scheduleKey, closed_all_day: true, start_time: null, end_time: null, ...common }]
  }

  const intervals = Array.isArray(form.intervals) ? form.intervals : []
  return intervals.map((interval) => ({
    ...identity,
    ...scheduleKey,
    closed_all_day: false,
    start_time: String(interval.start_time || ""),
    end_time: String(interval.end_time || ""),
    ...common,
  }))
}

export const buildFacilityAdminPayload = (resource, form, { operation = "create" } = {}) => {
  const common = commonFacilityAdminPayload(form)

  if (resource === FACILITY_ADMIN_RESOURCES.PROFILES) {
    return {
      ...(operation === "create" ? { facility_id: form.facility_id } : {}),
      department_id: nullableDepartment(form.department_id),
      description: nullableText(form.description),
      public_contact_name: nullableText(form.public_contact_name),
      public_contact_email: nullableText(form.public_contact_email),
      public_contact_phone: nullableText(form.public_contact_phone),
      ...common,
    }
  }

  if (resource === FACILITY_ADMIN_RESOURCES.ALIASES) {
    return {
      ...(operation === "create" ? { service_id: Number(form.service_id) } : {}),
      alias: String(form.alias || "").trim(),
      ...common,
    }
  }

  if (resource === FACILITY_ADMIN_RESOURCES.MAPPINGS) {
    return {
      ...(operation === "create" ? {
        facility_id: form.facility_id,
        service_id: Number(form.service_id),
      } : {}),
      recommendation_rank: Number(form.recommendation_rank ?? 100),
      public_notes: nullableText(form.public_notes),
      ...common,
    }
  }

  return {
    ...(operation === "create" ? { code: String(form.code || "").trim() } : {}),
    name: String(form.name || "").trim(),
    description: nullableText(form.description),
    department_id: nullableDepartment(form.department_id),
    ...common,
  }
}

export const isNonOfficialFacilityAdminRecord = (record) => (
  record?.data_status === "DEMO"
  || record?.verification_status === "DEMO_ONLY"
  || record?.source_type === "DEVELOPMENT_TEST"
)
