import { facilities, getFacilityById } from "../data/facilities.js"
import { isValidCampusDateKey, normalizeCampusTime } from "../lib/campusTime.js"

export const FACILITY_ADMIN_RESOURCES = Object.freeze({
  PROFILES: "facilityProfiles",
  SERVICES: "facilityServices",
  ALIASES: "serviceAliases",
  MAPPINGS: "facilityServiceMappings",
  HOURS: "facilityHours",
  EXCEPTIONS: "facilityHourExceptions",
})

export const FACILITY_ADMIN_LIFECYCLES = Object.freeze(["DRAFT", "SCHEDULED", "PUBLISHED", "EXPIRED", "CANCELLED"])
export const FACILITY_ADMIN_VERIFICATION_STATUSES = Object.freeze(["VERIFIED", "SOURCE_ALIGNED", "PENDING_VERIFICATION", "DEMO_ONLY"])
export const FACILITY_ADMIN_DATA_STATUSES = Object.freeze(["ACTIVE", "PENDING_VERIFICATION", "DEMO"])

const COMMON_FIELDS = Object.freeze([
  "lifecycle", "public_visibility", "published_at", "effective_at", "expires_at",
  "verification_status", "data_status", "source_type", "source_id", "source_label", "last_verified_at",
])

const PROFILE_FIELDS = Object.freeze(["department_id", "description", "public_contact_name", "public_contact_email", "public_contact_phone"])
const SERVICE_FIELDS = Object.freeze(["name", "description", "department_id"])
const ALIAS_FIELDS = Object.freeze(["alias"])
const MAPPING_FIELDS = Object.freeze(["recommendation_rank", "public_notes"])
const HOURS_FIELDS = Object.freeze(["day_of_week", "closed_all_day", "start_time", "end_time"])
const EXCEPTION_FIELDS = Object.freeze(["exception_date", "closed_all_day", "start_time", "end_time"])

export const FACILITY_ADMIN_CONFIG = Object.freeze({
  [FACILITY_ADMIN_RESOURCES.PROFILES]: {
    table: "facility_operational_profiles",
    identityFields: ["facility_id"],
    mutableFields: [...PROFILE_FIELDS, ...COMMON_FIELDS],
    columns: "id, facility_id, department_id, description, public_contact_name, public_contact_email, public_contact_phone, lifecycle, public_visibility, published_at, effective_at, expires_at, verification_status, data_status, source_type, source_id, source_label, last_verified_at, created_at, updated_at",
    order: "facility_id",
  },
  [FACILITY_ADMIN_RESOURCES.SERVICES]: {
    table: "services",
    identityFields: ["code"],
    mutableFields: [...SERVICE_FIELDS, ...COMMON_FIELDS],
    columns: "id, code, name, description, department_id, lifecycle, public_visibility, published_at, effective_at, expires_at, verification_status, data_status, source_type, source_id, source_label, last_verified_at, created_at, updated_at",
    order: "name",
  },
  [FACILITY_ADMIN_RESOURCES.ALIASES]: {
    table: "service_aliases",
    identityFields: ["service_id"],
    mutableFields: [...ALIAS_FIELDS, ...COMMON_FIELDS],
    columns: "id, service_id, alias, lifecycle, public_visibility, published_at, effective_at, expires_at, verification_status, data_status, source_type, source_id, source_label, last_verified_at, created_at, updated_at",
    order: "alias",
  },
  [FACILITY_ADMIN_RESOURCES.MAPPINGS]: {
    table: "facility_service_mappings",
    identityFields: ["facility_id", "service_id"],
    mutableFields: [...MAPPING_FIELDS, ...COMMON_FIELDS],
    columns: "id, facility_id, service_id, recommendation_rank, public_notes, lifecycle, public_visibility, published_at, effective_at, expires_at, verification_status, data_status, source_type, source_id, source_label, last_verified_at, created_at, updated_at",
    order: "recommendation_rank",
  },
  [FACILITY_ADMIN_RESOURCES.HOURS]: {
    table: "facility_hours",
    identityFields: ["facility_id"],
    mutableFields: [...HOURS_FIELDS, ...COMMON_FIELDS],
    columns: "id, facility_id, day_of_week, closed_all_day, start_time, end_time, lifecycle, public_visibility, published_at, effective_at, expires_at, verification_status, data_status, source_type, source_id, source_label, last_verified_at, created_at, updated_at",
    order: "day_of_week",
  },
  [FACILITY_ADMIN_RESOURCES.EXCEPTIONS]: {
    table: "facility_hour_exceptions",
    identityFields: ["facility_id"],
    mutableFields: [...EXCEPTION_FIELDS, ...COMMON_FIELDS],
    columns: "id, facility_id, exception_date, closed_all_day, start_time, end_time, lifecycle, public_visibility, published_at, effective_at, expires_at, verification_status, data_status, source_type, source_id, source_label, last_verified_at, created_at, updated_at",
    order: "exception_date",
  },
})

export const FACILITY_ADMIN_ERROR_CODES = Object.freeze([
  "VALIDATION_ERROR", "PERMISSION_DENIED", "SESSION_EXPIRED", "DUPLICATE_SERVICE_CODE",
  "DUPLICATE_ALIAS", "DUPLICATE_MAPPING", "HOURS_OVERLAP", "CLOSED_MARKER_CONFLICT",
  "STALE_RECORD", "NOT_FOUND", "PUBLISH_VALIDATION_FAILED", "DELETE_NOT_ALLOWED",
  "DELETE_CONFLICT", "NETWORK_ERROR", "BACKEND_UNAVAILABLE", "ADMIN_ERROR",
])

const ERROR_CODES = new Set(FACILITY_ADMIN_ERROR_CODES)
const SERVICE_CODE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const ABSOLUTE_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/i

export const createFacilityAdminError = (code, message, cause = null) => {
  const error = Object.assign(new Error(message), { code })
  if (cause) Object.defineProperty(error, "cause", { value: cause, enumerable: false })
  return error
}

const knownError = (error) => error?.code && ERROR_CODES.has(error.code)

export const normalizeFacilityAdminDatabaseError = (error) => {
  if (knownError(error)) return error
  const detail = `${error?.constraint || ""} ${error?.details || ""} ${error?.message || ""}`.toLowerCase()

  if (error?.code === "23505") {
    if (detail.includes("services_code") || detail.includes("services_code_key")) {
      return createFacilityAdminError("DUPLICATE_SERVICE_CODE", "That service code is already in use.", error)
    }
    if (detail.includes("service_aliases_service_alias")) {
      return createFacilityAdminError("DUPLICATE_ALIAS", "That alias already exists for the selected service.", error)
    }
    if (detail.includes("facility_service_mappings_unique")) {
      return createFacilityAdminError("DUPLICATE_MAPPING", "That service is already mapped to the selected facility.", error)
    }
  }

  if (error?.code === "23P01" && detail.includes("facility_hour")) {
    if (detail.includes("closed_all_day") || detail.includes("closed marker")) {
      return createFacilityAdminError("CLOSED_MARKER_CONFLICT", "A closed-all-day marker conflicts with another active interval.", error)
    }
    return createFacilityAdminError("HOURS_OVERLAP", "The active facility hours overlap another interval.", error)
  }

  if (error?.code === "23503") {
    return createFacilityAdminError("DELETE_CONFLICT", "This record is still referenced and cannot be deleted.", error)
  }
  return null
}

const defaultMapError = (error) => normalizeFacilityAdminDatabaseError(error)
  || createFacilityAdminError("ADMIN_ERROR", "The facility admin operation could not be completed.", error)

const requiredText = (value, label, maxLength) => {
  const normalized = typeof value === "string" ? value.trim() : ""
  if (!normalized) throw createFacilityAdminError("VALIDATION_ERROR", `${label} is required.`)
  if (normalized.length > maxLength) throw createFacilityAdminError("VALIDATION_ERROR", `${label} is too long.`)
  return normalized
}

const nullableText = (value, label, maxLength, minLength = 1) => {
  if (value === undefined || value === null || value === "") return null
  const normalized = String(value).trim()
  if (!normalized) return null
  if (normalized.length < minLength || normalized.length > maxLength) {
    throw createFacilityAdminError("VALIDATION_ERROR", `${label} has an invalid length.`)
  }
  return normalized
}

const enumValue = (value, allowed, label, fallback) => {
  const normalized = value ?? fallback
  if (!allowed.includes(normalized)) throw createFacilityAdminError("VALIDATION_ERROR", `${label} is not supported.`)
  return normalized
}

const positiveInteger = (value, label, { nullable = false, max = Number.MAX_SAFE_INTEGER } = {}) => {
  if ((value === undefined || value === null || value === "") && nullable) return null
  const normalized = Number(value)
  if (!Number.isSafeInteger(normalized) || normalized < 1 || normalized > max) {
    throw createFacilityAdminError("VALIDATION_ERROR", `${label} is invalid.`)
  }
  return normalized
}

const timestampValue = (value, label, required = false) => {
  if (value === undefined || value === null || value === "") {
    if (required) throw createFacilityAdminError("VALIDATION_ERROR", `${label} is required.`)
    return null
  }
  if (typeof value !== "string" || !ABSOLUTE_TIMESTAMP_PATTERN.test(value)) {
    throw createFacilityAdminError("VALIDATION_ERROR", `${label} must include an explicit timezone.`)
  }
  const parsed = new Date(value)
  if (!Number.isFinite(parsed.getTime())) throw createFacilityAdminError("VALIDATION_ERROR", `${label} is invalid.`)
  return parsed.toISOString()
}

const booleanValue = (value, label, fallback) => {
  const normalized = value ?? fallback
  if (typeof normalized !== "boolean") throw createFacilityAdminError("VALIDATION_ERROR", `${label} must be true or false.`)
  return normalized
}

const assertAllowedKeys = (resource, input, operation) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw createFacilityAdminError("VALIDATION_ERROR", "A facility admin record is required.")
  }
  const config = FACILITY_ADMIN_CONFIG[resource]
  if (!config) throw createFacilityAdminError("VALIDATION_ERROR", "Unsupported facility admin resource.")
  const allowed = new Set(operation === "create" ? [...config.identityFields, ...config.mutableFields] : config.mutableFields)
  const rejected = Object.keys(input).filter((key) => !allowed.has(key))
  if (rejected.length) {
    throw createFacilityAdminError("VALIDATION_ERROR", `Unsupported or immutable field: ${rejected[0]}.`)
  }
}

const canonicalFacilityId = (value) => {
  const facilityId = requiredText(value, "Facility", 160)
  if (!getFacilityById(facilityId)) throw createFacilityAdminError("VALIDATION_ERROR", "Select a valid canonical CampusNav facility.")
  return facilityId
}

const commonPayload = (input) => {
  const lifecycle = enumValue(input.lifecycle, FACILITY_ADMIN_LIFECYCLES, "Lifecycle", "DRAFT")
  const publicVisibility = booleanValue(input.public_visibility, "Public visibility", false)
  const publishedAt = timestampValue(input.published_at, "Published time")
  const effectiveAt = timestampValue(input.effective_at, "Effective time")
  const expiresAt = timestampValue(input.expires_at, "Expiration time")
  const verificationStatus = enumValue(input.verification_status, FACILITY_ADMIN_VERIFICATION_STATUSES, "Verification status", "PENDING_VERIFICATION")
  const dataStatus = enumValue(input.data_status, FACILITY_ADMIN_DATA_STATUSES, "Data status", "PENDING_VERIFICATION")
  const lastVerifiedAt = timestampValue(input.last_verified_at, "Last verified time")

  if (effectiveAt && expiresAt && new Date(expiresAt) <= new Date(effectiveAt)) {
    throw createFacilityAdminError("VALIDATION_ERROR", "Expiration must be later than the effective time.")
  }
  if (lifecycle === "SCHEDULED" && !effectiveAt) {
    throw createFacilityAdminError("VALIDATION_ERROR", "An effective time is required for a scheduled record.")
  }
  if (lifecycle === "PUBLISHED" && (!publicVisibility || !publishedAt)) {
    throw createFacilityAdminError("PUBLISH_VALIDATION_FAILED", "Publishing requires public visibility and a publication time.")
  }
  if (lifecycle !== "PUBLISHED" && publicVisibility) {
    throw createFacilityAdminError("VALIDATION_ERROR", "Only published records may be publicly visible.")
  }
  if (["VERIFIED", "SOURCE_ALIGNED"].includes(verificationStatus) && !lastVerifiedAt) {
    throw createFacilityAdminError("VALIDATION_ERROR", "Trusted verification requires a last-verified time.")
  }
  if (dataStatus === "ACTIVE" && !["VERIFIED", "SOURCE_ALIGNED"].includes(verificationStatus)) {
    throw createFacilityAdminError("VALIDATION_ERROR", "Active data requires a trusted verification status.")
  }
  if ((verificationStatus === "DEMO_ONLY") !== (dataStatus === "DEMO")) {
    throw createFacilityAdminError("VALIDATION_ERROR", "DEMO_ONLY verification and DEMO data status must be used together.")
  }

  return {
    lifecycle,
    public_visibility: publicVisibility,
    published_at: publishedAt,
    effective_at: effectiveAt,
    expires_at: expiresAt,
    verification_status: verificationStatus,
    data_status: dataStatus,
    source_type: requiredText(input.source_type ?? "ADMIN_CMS", "Source type", 80),
    source_id: nullableText(input.source_id, "Source ID", 160),
    source_label: nullableText(input.source_label, "Source label", 240),
    last_verified_at: lastVerifiedAt,
  }
}

const intervalPayload = (input) => {
  const closedAllDay = booleanValue(input.closed_all_day, "Closed all day", false)
  const startValue = nullableText(input.start_time, "Start time", 32)
  const endValue = nullableText(input.end_time, "End time", 32)

  if (closedAllDay && (startValue || endValue)) {
    throw createFacilityAdminError("VALIDATION_ERROR", "Closed-all-day rows cannot include start or end times.")
  }
  if (!closedAllDay && (!startValue || !endValue)) {
    throw createFacilityAdminError("VALIDATION_ERROR", "Open intervals require both start and end times.")
  }

  return {
    closed_all_day: closedAllDay,
    start_time: closedAllDay ? null : normalizeTimeValue(startValue, "Start time"),
    end_time: closedAllDay ? null : normalizeTimeValue(endValue, "End time"),
  }
}

const normalizeTimeValue = (value, label) => {
  try {
    return normalizeCampusTime(value)
  } catch {
    throw createFacilityAdminError("VALIDATION_ERROR", `${label} is invalid.`)
  }
}

export const validateFacilityAdminRecord = (resource, input, { operation = "create" } = {}) => {
  if (!FACILITY_ADMIN_CONFIG[resource]) throw createFacilityAdminError("VALIDATION_ERROR", "Unsupported facility admin resource.")
  if (!['create', 'update'].includes(operation)) throw createFacilityAdminError("VALIDATION_ERROR", "Unsupported facility admin operation.")
  assertAllowedKeys(resource, input, operation)
  const common = commonPayload(input)

  if (resource === FACILITY_ADMIN_RESOURCES.PROFILES) {
    const payload = {
      ...(operation === "create" ? { facility_id: canonicalFacilityId(input.facility_id) } : {}),
      department_id: positiveInteger(input.department_id, "Department", { nullable: true }),
      description: nullableText(input.description, "Description", 4000),
      public_contact_name: nullableText(input.public_contact_name, "Public contact name", 160),
      public_contact_email: nullableText(input.public_contact_email, "Public contact email", 320, 3),
      public_contact_phone: nullableText(input.public_contact_phone, "Public contact phone", 80, 3),
      ...common,
    }
    if (payload.public_contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.public_contact_email)) {
      throw createFacilityAdminError("VALIDATION_ERROR", "Public contact email is invalid.")
    }
    return payload
  }

  if (resource === FACILITY_ADMIN_RESOURCES.SERVICES) {
    const payload = {
      ...(operation === "create" ? { code: requiredText(input.code, "Service code", 160) } : {}),
      name: requiredText(input.name, "Service name", 160),
      description: nullableText(input.description, "Description", 4000),
      department_id: positiveInteger(input.department_id, "Department", { nullable: true }),
      ...common,
    }
    if (operation === "create" && !SERVICE_CODE_PATTERN.test(payload.code)) {
      throw createFacilityAdminError("VALIDATION_ERROR", "Service code must use lowercase kebab-case.")
    }
    return payload
  }

  if (resource === FACILITY_ADMIN_RESOURCES.ALIASES) return {
    ...(operation === "create" ? { service_id: positiveInteger(input.service_id, "Service") } : {}),
    alias: requiredText(input.alias, "Alias", 160),
    ...common,
  }

  if (resource === FACILITY_ADMIN_RESOURCES.MAPPINGS) return {
    ...(operation === "create" ? {
      facility_id: canonicalFacilityId(input.facility_id),
      service_id: positiveInteger(input.service_id, "Service"),
    } : {}),
    recommendation_rank: positiveInteger(input.recommendation_rank ?? 100, "Recommendation rank", { max: 1000 }),
    public_notes: nullableText(input.public_notes, "Public notes", 2000),
    ...common,
  }

  if (resource === FACILITY_ADMIN_RESOURCES.HOURS) return {
    ...(operation === "create" ? { facility_id: canonicalFacilityId(input.facility_id) } : {}),
    day_of_week: integerInRange(input.day_of_week, "Weekday", 0, 6),
    ...intervalPayload(input),
    ...common,
  }

  return {
    ...(operation === "create" ? { facility_id: canonicalFacilityId(input.facility_id) } : {}),
    exception_date: campusDate(input.exception_date),
    ...intervalPayload(input),
    ...common,
  }
}

const integerInRange = (value, label, min, max) => {
  const normalized = Number(value)
  if (!Number.isInteger(normalized) || normalized < min || normalized > max) {
    throw createFacilityAdminError("VALIDATION_ERROR", `${label} must be between ${min} and ${max}.`)
  }
  return normalized
}

const campusDate = (value) => {
  if (!isValidCampusDateKey(value)) {
    throw createFacilityAdminError("VALIDATION_ERROR", "Exception date must be a valid YYYY-MM-DD Manila campus date.")
  }
  return value
}

const mutableSnapshot = (resource, row) => Object.fromEntries(
  FACILITY_ADMIN_CONFIG[resource].mutableFields.map((field) => [field, row[field]]),
)

const normalizeId = (id) => positiveInteger(id, "Record ID")
const normalizeExpectedUpdatedAt = (value) => timestampValue(value, "Expected updated time", true)

export const createFacilityAdminService = (client, { mapError = defaultMapError, clock = () => new Date() } = {}) => {
  if (!client) throw createFacilityAdminError("BACKEND_UNAVAILABLE", "Supabase is not configured for facility administration.")

  const throwResult = (result) => {
    if (result?.error) throw mapError(result.error)
    return result?.data ?? null
  }

  const selectRecord = async (resource, id) => {
    const config = FACILITY_ADMIN_CONFIG[resource]
    const result = await client.from(config.table).select(config.columns).eq("id", normalizeId(id)).maybeSingle()
    return throwResult(result)
  }

  const requireRecord = async (resource, id) => {
    const row = await selectRecord(resource, id)
    if (!row) throw createFacilityAdminError("NOT_FOUND", "The facility admin record no longer exists.")
    return row
  }

  const listRecords = async (resource, filters = {}) => {
    const config = FACILITY_ADMIN_CONFIG[resource]
    if (!config) throw createFacilityAdminError("VALIDATION_ERROR", "Unsupported facility admin resource.")
    let query = client.from(config.table).select(config.columns)
    if (filters.lifecycle && filters.lifecycle !== "ALL") {
      enumValue(filters.lifecycle, FACILITY_ADMIN_LIFECYCLES, "Lifecycle")
      query = query.eq("lifecycle", filters.lifecycle)
    }
    if (filters.facilityId) query = query.eq("facility_id", canonicalFacilityId(filters.facilityId))
    if (filters.serviceId) query = query.eq("service_id", positiveInteger(filters.serviceId, "Service"))
    const result = await query.order(config.order, { ascending: true }).limit(500)
    return throwResult(result) || []
  }

  const requireReference = async (table, column, value, message) => {
    const result = await client.from(table).select("id").eq(column, value).limit(1).maybeSingle()
    if (!throwResult(result)) throw createFacilityAdminError("NOT_FOUND", message)
  }

  const validateReferences = async (resource, payload) => {
    if ([FACILITY_ADMIN_RESOURCES.ALIASES, FACILITY_ADMIN_RESOURCES.MAPPINGS].includes(resource)) {
      await requireReference("services", "id", payload.service_id, "The selected service no longer exists.")
    }
    if ([FACILITY_ADMIN_RESOURCES.MAPPINGS, FACILITY_ADMIN_RESOURCES.HOURS, FACILITY_ADMIN_RESOURCES.EXCEPTIONS].includes(resource)) {
      await requireReference("facility_operational_profiles", "facility_id", payload.facility_id, "Create the facility operational profile before adding dependent records.")
    }
  }

  const createRecord = async (resource, input) => {
    const config = FACILITY_ADMIN_CONFIG[resource]
    const payload = validateFacilityAdminRecord(resource, input, { operation: "create" })
    await validateReferences(resource, payload)
    const result = await client.from(config.table).insert(payload).select(config.columns).single()
    return throwResult(result)
  }

  const ensureFresh = (row, expectedUpdatedAt) => {
    const expected = normalizeExpectedUpdatedAt(expectedUpdatedAt)
    const actual = timestampValue(row.updated_at, "Stored updated time", true)
    if (actual !== expected) throw createFacilityAdminError("STALE_RECORD", "This record changed after it was opened. Refresh before trying again.")
    return expected
  }

  const updateRecord = async (resource, id, input, { expectedUpdatedAt } = { expectedUpdatedAt: undefined }) => {
    assertAllowedKeys(resource, input, "update")
    const config = FACILITY_ADMIN_CONFIG[resource]
    const row = await requireRecord(resource, id)
    const expected = ensureFresh(row, expectedUpdatedAt)
    const payload = validateFacilityAdminRecord(resource, { ...mutableSnapshot(resource, row), ...input }, { operation: "update" })
    const result = await client.from(config.table).update(payload).eq("id", normalizeId(id)).eq("updated_at", expected).select(config.columns).maybeSingle()
    const updated = throwResult(result)
    if (updated) return updated
    const current = await selectRecord(resource, id)
    if (!current) throw createFacilityAdminError("NOT_FOUND", "The facility admin record no longer exists.")
    throw createFacilityAdminError("STALE_RECORD", "This record changed before the update completed. Refresh before trying again.")
  }

  const setLifecycle = async (resource, id, lifecycle, { expectedUpdatedAt, at } = { expectedUpdatedAt: undefined, at: undefined }) => {
    const target = enumValue(lifecycle, FACILITY_ADMIN_LIFECYCLES, "Lifecycle")
    const row = await requireRecord(resource, id)
    ensureFresh(row, expectedUpdatedAt)
    const timestamp = timestampValue(at || clock().toISOString(), "Lifecycle action time", true)
    const changes = { lifecycle: target, public_visibility: false }

    if (target === "PUBLISHED") {
      changes.public_visibility = true
      changes.published_at = row.published_at || timestamp
    }
    if (target === "EXPIRED") {
      if (row.effective_at && new Date(timestamp) <= new Date(row.effective_at)) {
        throw createFacilityAdminError("VALIDATION_ERROR", "A record cannot expire before its effective time.")
      }
      changes.expires_at = timestamp
    }
    return updateRecord(resource, id, changes, { expectedUpdatedAt })
  }

  const hasReference = async (table, column, value) => {
    const result = await client.from(table).select("id").eq(column, value).limit(1).maybeSingle()
    return Boolean(throwResult(result))
  }

  const assertDeleteSafe = async (resource, row) => {
    const disposable = row.lifecycle === "DRAFT"
      || row.data_status === "DEMO"
      || row.verification_status === "DEMO_ONLY"
      || row.source_type === "DEVELOPMENT_TEST"
    if (!disposable) {
      throw createFacilityAdminError("DELETE_NOT_ALLOWED", "Expire or cancel this operational record instead of deleting it.")
    }

    if (resource === FACILITY_ADMIN_RESOURCES.PROFILES) {
      const referenced = await Promise.all([
        hasReference("facility_service_mappings", "facility_id", row.facility_id),
        hasReference("facility_hours", "facility_id", row.facility_id),
        hasReference("facility_hour_exceptions", "facility_id", row.facility_id),
      ])
      if (referenced.some(Boolean)) throw createFacilityAdminError("DELETE_CONFLICT", "Remove or expire dependent mappings and schedules first.")
    }
    if (resource === FACILITY_ADMIN_RESOURCES.SERVICES) {
      const referenced = await Promise.all([
        hasReference("service_aliases", "service_id", row.id),
        hasReference("facility_service_mappings", "service_id", row.id),
      ])
      if (referenced.some(Boolean)) throw createFacilityAdminError("DELETE_CONFLICT", "Remove or expire dependent aliases and mappings first.")
    }
  }

  const deleteRecord = async (resource, id, { expectedUpdatedAt } = { expectedUpdatedAt: undefined }) => {
    const config = FACILITY_ADMIN_CONFIG[resource]
    if (!config) throw createFacilityAdminError("VALIDATION_ERROR", "Unsupported facility admin resource.")
    const row = await requireRecord(resource, id)
    const expected = ensureFresh(row, expectedUpdatedAt)
    await assertDeleteSafe(resource, row)
    const result = await client.from(config.table).delete().eq("id", normalizeId(id)).eq("updated_at", expected).select("id").maybeSingle()
    const deleted = throwResult(result)
    if (deleted) return { id: deleted.id }
    const current = await selectRecord(resource, id)
    if (!current) throw createFacilityAdminError("NOT_FOUND", "The facility admin record no longer exists.")
    throw createFacilityAdminError("STALE_RECORD", "This record changed before deletion completed. Refresh before trying again.")
  }

  const listDepartments = async () => {
    const result = await client.from("departments").select("id, code, name, active").order("name", { ascending: true }).limit(200)
    return throwResult(result) || []
  }

  const canonicalFacilities = () => facilities.map(({ id, name, floorId, kind }) => ({ id, name, floor: floorId, category: kind }))
  const loadReferences = async () => {
    const [departments, services, profiles] = await Promise.all([
      listDepartments(),
      listRecords(FACILITY_ADMIN_RESOURCES.SERVICES),
      listRecords(FACILITY_ADMIN_RESOURCES.PROFILES),
    ])
    return { facilities: canonicalFacilities(), departments, services, profiles }
  }

  const actions = (resource) => ({
    list: (filters) => listRecords(resource, filters),
    create: (input) => createRecord(resource, input),
    update: (id, input, options) => updateRecord(resource, id, input, options),
    publish: (id, options) => setLifecycle(resource, id, "PUBLISHED", options),
    expire: (id, options) => setLifecycle(resource, id, "EXPIRED", options),
    delete: (id, options) => deleteRecord(resource, id, options),
  })

  const profiles = actions(FACILITY_ADMIN_RESOURCES.PROFILES)
  const services = actions(FACILITY_ADMIN_RESOURCES.SERVICES)
  const aliases = actions(FACILITY_ADMIN_RESOURCES.ALIASES)
  const mappings = actions(FACILITY_ADMIN_RESOURCES.MAPPINGS)
  const hours = actions(FACILITY_ADMIN_RESOURCES.HOURS)
  const exceptions = actions(FACILITY_ADMIN_RESOURCES.EXCEPTIONS)

  return {
    listCanonicalFacilities: canonicalFacilities,
    listFacilityAdminDepartments: listDepartments,
    loadFacilityAdminReferences: loadReferences,
    listFacilityAdminRecords: listRecords,
    createFacilityAdminRecord: createRecord,
    updateFacilityAdminRecord: updateRecord,
    setFacilityAdminLifecycle: setLifecycle,
    deleteFacilityAdminRecord: deleteRecord,
    listFacilityOperationalProfiles: profiles.list,
    createFacilityOperationalProfile: profiles.create,
    updateFacilityOperationalProfile: profiles.update,
    publishFacilityOperationalProfile: profiles.publish,
    expireFacilityOperationalProfile: profiles.expire,
    deleteFacilityOperationalProfile: profiles.delete,
    listFacilityAdminServices: services.list,
    createFacilityAdminServiceRecord: services.create,
    updateFacilityAdminServiceRecord: services.update,
    publishFacilityAdminServiceRecord: services.publish,
    expireFacilityAdminServiceRecord: services.expire,
    deleteFacilityAdminServiceRecord: services.delete,
    listServiceAliases: aliases.list,
    createServiceAlias: aliases.create,
    updateServiceAlias: aliases.update,
    publishServiceAlias: aliases.publish,
    expireServiceAlias: aliases.expire,
    deleteServiceAlias: aliases.delete,
    listFacilityServiceMappings: mappings.list,
    createFacilityServiceMapping: mappings.create,
    updateFacilityServiceMapping: mappings.update,
    publishFacilityServiceMapping: mappings.publish,
    expireFacilityServiceMapping: mappings.expire,
    deleteFacilityServiceMapping: mappings.delete,
    listFacilityHours: hours.list,
    createFacilityHours: hours.create,
    updateFacilityHours: hours.update,
    publishFacilityHours: hours.publish,
    expireFacilityHours: hours.expire,
    deleteFacilityHours: hours.delete,
    listFacilityHourExceptions: exceptions.list,
    createFacilityHourException: exceptions.create,
    updateFacilityHourException: exceptions.update,
    publishFacilityHourException: exceptions.publish,
    expireFacilityHourException: exceptions.expire,
    deleteFacilityHourException: exceptions.delete,
  }
}
