export const FACILITY_AVAILABILITY = Object.freeze({
  CONFIGURED: "CONFIGURED",
  UNAVAILABLE: "UNAVAILABLE",
  PROVIDER_UNAVAILABLE: "PROVIDER_UNAVAILABLE",
})

export const FACILITY_ERROR_CODES = Object.freeze({
  NOT_FOUND: "FACILITY_NOT_FOUND",
  PROVIDER_UNAVAILABLE: "FACILITY_PROVIDER_UNAVAILABLE",
})

export const FACILITY_PROVIDER_METHODS = Object.freeze([
  "getFacilityOperationalProfile",
])

const valueFrom = (record, camelCaseKey, snakeCaseKey) => (
  record?.[camelCaseKey] ?? record?.[snakeCaseKey] ?? null
)

export const normalizeFacilityProvenance = (record = {}) => {
  const existing = record.provenance || {}
  const verificationStatus = valueFrom(existing, "verificationStatus", "verification_status")
    ?? valueFrom(record, "verificationStatus", "verification_status")
  const dataStatus = valueFrom(existing, "dataStatus", "data_status")
    ?? valueFrom(record, "dataStatus", "data_status")

  return {
    lifecycle: valueFrom(existing, "lifecycle", "lifecycle") ?? valueFrom(record, "lifecycle", "lifecycle"),
    publishedAt: valueFrom(existing, "publishedAt", "published_at") ?? valueFrom(record, "publishedAt", "published_at"),
    effectiveAt: valueFrom(existing, "effectiveAt", "effective_at") ?? valueFrom(record, "effectiveAt", "effective_at"),
    expiresAt: valueFrom(existing, "expiresAt", "expires_at") ?? valueFrom(record, "expiresAt", "expires_at"),
    verificationStatus,
    dataStatus,
    sourceType: valueFrom(existing, "sourceType", "source_type") ?? valueFrom(record, "sourceType", "source_type"),
    sourceId: valueFrom(existing, "sourceId", "source_id") ?? valueFrom(record, "sourceId", "source_id"),
    sourceLabel: valueFrom(existing, "sourceLabel", "source_label") ?? valueFrom(record, "sourceLabel", "source_label"),
    lastVerifiedAt: valueFrom(existing, "lastVerifiedAt", "last_verified_at") ?? valueFrom(record, "lastVerifiedAt", "last_verified_at"),
    updatedAt: valueFrom(existing, "updatedAt", "updated_at") ?? valueFrom(record, "updatedAt", "updated_at"),
    demo: dataStatus === "DEMO" || verificationStatus === "DEMO_ONLY",
  }
}

export const normalizeFacilityOperationalProfile = (record) => {
  if (!record || typeof record !== "object") return null

  const publicContact = record.publicContact || {}
  return {
    id: record.id ?? null,
    facilityId: valueFrom(record, "facilityId", "facility_id"),
    departmentId: valueFrom(record, "departmentId", "department_id"),
    description: record.description ?? null,
    publicContact: {
      name: valueFrom(publicContact, "name", "name") ?? valueFrom(record, "publicContactName", "public_contact_name"),
      email: valueFrom(publicContact, "email", "email") ?? valueFrom(record, "publicContactEmail", "public_contact_email"),
      phone: valueFrom(publicContact, "phone", "phone") ?? valueFrom(record, "publicContactPhone", "public_contact_phone"),
    },
    provenance: normalizeFacilityProvenance(record),
  }
}

export const createFacilityResult = ({ ok, availability, data, error = null }) => ({
  ok,
  availability,
  data,
  error,
})
