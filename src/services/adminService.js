import { NOTIFICATION_CATEGORIES, NOTIFICATION_LIFECYCLES, NOTIFICATION_PRIORITIES } from "../data/dashboardContracts.js"
import { facilities, getFacilityById } from "../data/facilities.js"
import { getBackendAvailability, getSupabaseClient } from "../lib/supabaseClient.js"
import { createAcademicAdminService } from "./academicAdminService.js"

export const ADMIN_RESOURCE_KEYS = Object.freeze({
  ANNOUNCEMENTS: "announcements",
  EVENTS: "events",
  FACILITY_ADVISORIES: "facilityAdvisories",
  NOTIFICATIONS: "notifications",
})

export const VERIFICATION_STATUSES = Object.freeze(["VERIFIED", "SOURCE_ALIGNED", "PENDING_VERIFICATION", "DEMO_ONLY"])
export const ADVISORY_TYPES = Object.freeze(["TEMPORARY_CLOSURE", "MAINTENANCE", "RESTRICTED_ACCESS", "SERVICE_INTERRUPTION"])
export const LIFECYCLES = Object.freeze(Object.values(NOTIFICATION_LIFECYCLES))
export const PRIORITIES = Object.freeze(Object.values(NOTIFICATION_PRIORITIES))
export const CATEGORIES = Object.freeze(Object.values(NOTIFICATION_CATEGORIES))

export const ADMIN_RESOURCE_CONFIG = Object.freeze({
  [ADMIN_RESOURCE_KEYS.ANNOUNCEMENTS]: {
    table: "announcements",
    label: "Announcements",
    singular: "Announcement",
    descriptionField: "message",
    audienceTable: "announcement_audiences",
    audienceRecordKey: "announcement_id",
  },
  [ADMIN_RESOURCE_KEYS.EVENTS]: {
    table: "events",
    label: "Events",
    singular: "Event",
    descriptionField: "description",
    audienceTable: "event_audiences",
    audienceRecordKey: "event_id",
  },
  [ADMIN_RESOURCE_KEYS.FACILITY_ADVISORIES]: {
    table: "facility_advisories",
    label: "Facility Advisories",
    singular: "Facility Advisory",
    descriptionField: "message",
    audienceTable: "facility_advisory_audiences",
    audienceRecordKey: "facility_advisory_id",
  },
  [ADMIN_RESOURCE_KEYS.NOTIFICATIONS]: {
    table: "notifications",
    label: "Notifications",
    singular: "Notification",
    descriptionField: "message",
    audienceTable: "notification_audiences",
    audienceRecordKey: "notification_id",
  },
})

const validSortFields = new Set(["updated_at", "created_at", "title", "effective_at", "expires_at", "starts_at"])
const nullableText = (value) => String(value || "").trim() || null
const requiredText = (value, label) => {
  const normalized = String(value || "").trim()
  if (!normalized) throw createAdminError("VALIDATION_ERROR", `${label} is required.`)
  return normalized
}

const dateValue = (value, label, required = false) => {
  if (!value) {
    if (required) throw createAdminError("VALIDATION_ERROR", `${label} is required.`)
    return null
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) throw createAdminError("VALIDATION_ERROR", `${label} is invalid.`)
  return parsed.toISOString()
}

const enumValue = (value, allowed, label, fallback) => {
  const normalized = value || fallback
  if (!allowed.includes(normalized)) throw createAdminError("VALIDATION_ERROR", `${label} is not supported.`)
  return normalized
}

const createAdminError = (code, message, cause = null) => Object.assign(new Error(message), { code, cause })

export const toAdminError = (error) => {
  if (error?.code && ["VALIDATION_ERROR", "SCHEDULE_CONFLICT", "PERMISSION_DENIED", "SESSION_EXPIRED", "NETWORK_ERROR", "BACKEND_UNAVAILABLE", "ADMIN_ERROR"].includes(error.code)) return error
  const message = String(error?.message || "").toLowerCase()
  if (error?.code === "23P01") {
    const constraint = String(error?.constraint || error?.details || "")
    if (constraint.includes("room_conflict")) return createAdminError("SCHEDULE_CONFLICT", "Room conflict detected.", error)
    if (constraint.includes("professor_conflict")) return createAdminError("SCHEDULE_CONFLICT", "Professor has another schedule during this time.", error)
    if (constraint.includes("section_conflict")) return createAdminError("SCHEDULE_CONFLICT", "Section already has a class during this time.", error)
    return createAdminError("SCHEDULE_CONFLICT", "The schedule overlaps an existing active class.", error)
  }
  if (error?.code === "42501" || message.includes("permission") || message.includes("row-level security")) {
    return createAdminError("PERMISSION_DENIED", "Your account does not have permission for that action.", error)
  }
  if (error?.status === 401 || error?.code === "PGRST301" || message.includes("jwt") || message.includes("session") || message.includes("refresh token")) {
    return createAdminError("SESSION_EXPIRED", "Your admin session has expired. Please sign in again.", error)
  }
  if (["23502", "23503", "23505", "23514", "22P02"].includes(error?.code)) {
    return createAdminError("VALIDATION_ERROR", "The record did not pass database validation. Review the fields and try again.", error)
  }
  if (message.includes("fetch") || message.includes("network") || message.includes("timeout")) {
    return createAdminError("NETWORK_ERROR", "The CampusNav backend is temporarily unreachable.", error)
  }
  return createAdminError("ADMIN_ERROR", "The admin operation could not be completed.", error)
}

const dataStatusForVerification = (verificationStatus) => {
  if (verificationStatus === "DEMO_ONLY") return "DEMO"
  if (["VERIFIED", "SOURCE_ALIGNED"].includes(verificationStatus)) return "ACTIVE"
  return "PENDING_VERIFICATION"
}

export const validateAdminContent = (resource, input, lifecycleOverride = null) => {
  const config = ADMIN_RESOURCE_CONFIG[resource]
  if (!config) throw createAdminError("VALIDATION_ERROR", "Unsupported admin content type.")

  const lifecycle = enumValue(lifecycleOverride || input.lifecycle, LIFECYCLES, "Lifecycle", "DRAFT")
  const priority = enumValue(input.priority, PRIORITIES, "Priority", "NORMAL")
  const verificationStatus = enumValue(input.verification_status, VERIFICATION_STATUSES, "Verification status", "PENDING_VERIFICATION")
  const effectiveAt = dateValue(input.effective_at, "Effective date")
  const expiresAt = dateValue(input.expires_at, "Expiration date")
  if (lifecycle === "SCHEDULED" && !effectiveAt) throw createAdminError("VALIDATION_ERROR", "An effective date is required for scheduled content.")
  if (effectiveAt && expiresAt && new Date(expiresAt) <= new Date(effectiveAt)) {
    throw createAdminError("VALIDATION_ERROR", "Expiration must be later than the effective date.")
  }

  const payload = {
    title: requiredText(input.title, "Title"),
    priority,
    lifecycle,
    is_public: lifecycle === "PUBLISHED",
    published_at: lifecycle === "PUBLISHED" ? dateValue(input.published_at, "Published date") || new Date().toISOString() : dateValue(input.published_at, "Published date"),
    effective_at: lifecycle === "PUBLISHED" && !effectiveAt ? new Date().toISOString() : effectiveAt,
    expires_at: expiresAt,
    source_type: nullableText(input.source_type) || "ADMIN_CMS",
    source_id: nullableText(input.source_id),
    related_facility_id: nullableText(input.related_facility_id),
    department_id: input.department_id ? Number(input.department_id) : null,
    verification_status: verificationStatus,
    data_status: dataStatusForVerification(verificationStatus),
  }

  if (payload.related_facility_id && !getFacilityById(payload.related_facility_id)) {
    throw createAdminError("VALIDATION_ERROR", "Select a valid CampusNav facility.")
  }

  if (resource === ADMIN_RESOURCE_KEYS.EVENTS) {
    const startsAt = dateValue(input.starts_at, "Start date", true)
    const endsAt = dateValue(input.ends_at, "End date")
    if (endsAt && new Date(endsAt) <= new Date(startsAt)) throw createAdminError("VALIDATION_ERROR", "Event end time must be later than its start time.")
    return {
      ...payload,
      description: requiredText(input.description, "Description"),
      starts_at: startsAt,
      ends_at: endsAt,
      location: nullableText(input.location),
      organizer: nullableText(input.organizer),
    }
  }

  if (resource === ADMIN_RESOURCE_KEYS.FACILITY_ADVISORIES) {
    const facilityId = requiredText(input.related_facility_id, "Facility")
    if (!getFacilityById(facilityId)) throw createAdminError("VALIDATION_ERROR", "Select a valid CampusNav facility.")
    return {
      ...payload,
      message: requiredText(input.message, "Message"),
      advisory_type: enumValue(input.advisory_type, ADVISORY_TYPES, "Advisory type", "MAINTENANCE"),
      related_facility_id: facilityId,
    }
  }

  const category = enumValue(input.category, CATEGORIES, "Category", resource === ADMIN_RESOURCE_KEYS.ANNOUNCEMENTS ? "GENERAL" : "GENERAL")
  return { ...payload, message: requiredText(input.message, "Message"), category }
}

const throwIfError = (result) => {
  if (result.error) throw toAdminError(result.error)
  return result.data
}

const audienceIdsForRows = async (client, config, rows) => {
  if (!rows.length) return new Map()
  const ids = rows.map((row) => row.id)
  const result = await client.from(config.audienceTable).select(`${config.audienceRecordKey}, audience_id`).in(config.audienceRecordKey, ids)
  const links = throwIfError(result) || []
  return links.reduce((map, link) => {
    const recordId = link[config.audienceRecordKey]
    map.set(recordId, [...(map.get(recordId) || []), link.audience_id])
    return map
  }, new Map())
}

const syncAudienceIds = async (client, config, recordId, audienceIds = []) => {
  const normalized = [...new Set(audienceIds.map(Number).filter(Number.isFinite))]
  const currentResult = await client.from(config.audienceTable).select("audience_id").eq(config.audienceRecordKey, recordId)
  const current = new Set((throwIfError(currentResult) || []).map((link) => link.audience_id))
  const additions = normalized.filter((id) => !current.has(id))
  const removals = [...current].filter((id) => !normalized.includes(id))

  if (additions.length) {
    throwIfError(await client.from(config.audienceTable).insert(additions.map((audienceId) => ({
      [config.audienceRecordKey]: recordId,
      audience_id: audienceId,
    }))))
  }
  if (removals.length) {
    throwIfError(await client.from(config.audienceTable).delete().eq(config.audienceRecordKey, recordId).in("audience_id", removals))
  }
}

const countByLifecycle = async (client, table, lifecycle) => {
  const result = await client.from(table).select("id", { count: "exact", head: true }).eq("lifecycle", lifecycle)
  if (result.error) throw toAdminError(result.error)
  return result.count || 0
}

export const createSupabaseAdminService = (client) => {
  if (!client) throw createAdminError("BACKEND_UNAVAILABLE", "Supabase is not configured for Admin CMS.")

  const listResource = async (resource, filters = {}) => {
    const config = ADMIN_RESOURCE_CONFIG[resource]
    if (!config) throw createAdminError("VALIDATION_ERROR", "Unsupported admin content type.")
    const sortField = validSortFields.has(filters.sortField) ? filters.sortField : "updated_at"
    let query = client.from(config.table).select("*")
    if (filters.lifecycle && filters.lifecycle !== "ALL") query = query.eq("lifecycle", filters.lifecycle)
    if (filters.priority && filters.priority !== "ALL") query = query.eq("priority", filters.priority)
    if (filters.search?.trim()) {
      const escapedSearch = filters.search.trim().replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_")
      query = query.ilike("title", `%${escapedSearch}%`)
    }
    const rows = throwIfError(await query.order(sortField, { ascending: filters.ascending === true }).limit(200)) || []
    const audienceMap = await audienceIdsForRows(client, config, rows)
    return rows.map((row) => ({ ...row, audienceIds: audienceMap.get(row.id) || [] }))
  }

  const createResource = async (resource, input, { lifecycle = null, audienceIds = [] } = {}) => {
    const config = ADMIN_RESOURCE_CONFIG[resource]
    const payload = validateAdminContent(resource, input, lifecycle)
    const result = await client.from(config.table).insert(payload).select("*").single()
    const row = throwIfError(result)
    try {
      await syncAudienceIds(client, config, row.id, audienceIds)
    } catch (error) {
      await client.from(config.table).delete().eq("id", row.id)
      throw error
    }
    return { ...row, audienceIds: [...audienceIds] }
  }

  const updateResource = async (resource, id, input, { lifecycle = null, audienceIds = input.audienceIds || [] } = {}) => {
    const config = ADMIN_RESOURCE_CONFIG[resource]
    const payload = validateAdminContent(resource, input, lifecycle)
    const result = await client.from(config.table).update(payload).eq("id", id).select("*").single()
    const row = throwIfError(result)
    await syncAudienceIds(client, config, row.id, audienceIds)
    return { ...row, audienceIds: [...audienceIds] }
  }

  const deleteResource = async (resource, id) => {
    const config = ADMIN_RESOURCE_CONFIG[resource]
    if (!config) throw createAdminError("VALIDATION_ERROR", "Unsupported admin content type.")
    const result = await client.from(config.table).delete().eq("id", id).select("id").single()
    throwIfError(result)
    return { id }
  }

  const listAudiences = async () => {
    const result = await client.from("audiences").select("id, audience_type, label, reference_id, department_id").order("audience_type", { ascending: true }).limit(200)
    return throwIfError(result) || []
  }

  const getAdminOverview = async () => {
    const now = new Date()
    const [publishedAnnouncements, draftAnnouncements, upcomingEventsResult, advisoriesResult, notificationsResult] = await Promise.all([
      countByLifecycle(client, "announcements", "PUBLISHED"),
      countByLifecycle(client, "announcements", "DRAFT"),
      client.from("events").select("id", { count: "exact", head: true }).in("lifecycle", ["PUBLISHED", "SCHEDULED"]).gte("starts_at", now.toISOString()),
      client.from("facility_advisories").select("id, effective_at, published_at, created_at, expires_at").eq("lifecycle", "PUBLISHED").eq("is_public", true),
      client.from("notifications").select("id, effective_at, published_at, created_at, expires_at").eq("lifecycle", "PUBLISHED").eq("is_public", true),
    ])
    if (upcomingEventsResult.error) throw toAdminError(upcomingEventsResult.error)
    const advisories = throwIfError(advisoriesResult) || []
    const notifications = throwIfError(notificationsResult) || []
    const activeNow = (row) => new Date(row.effective_at || row.published_at || row.created_at) <= now && (!row.expires_at || new Date(row.expires_at) > now)
    return {
      publishedAnnouncements,
      draftAnnouncements,
      upcomingEvents: upcomingEventsResult.count || 0,
      activeFacilityAdvisories: advisories.filter(activeNow).length,
      activeNotifications: notifications.filter(activeNow).length,
    }
  }

  const listAuditActivity = async () => {
    const result = await client.from("audit_logs").select("id, actor_user_id, action, entity_type, entity_id, metadata, created_at").order("created_at", { ascending: false }).order("id", { ascending: false }).limit(100)
    const rows = throwIfError(result) || []
    const actorIds = [...new Set(rows.map((row) => row.actor_user_id).filter(Boolean))]
    if (!actorIds.length) return rows.map((row) => ({ ...row, actorName: "System" }))
    const profileResult = await client.from("profiles").select("id, display_name").in("id", actorIds)
    const profiles = throwIfError(profileResult) || []
    const names = new Map(profiles.map((profile) => [profile.id, profile.display_name || "CampusNav administrator"]))
    return rows.map((row) => ({ ...row, actorName: names.get(row.actor_user_id) || "CampusNav administrator" }))
  }

  const academicAdmin = createAcademicAdminService(client, { mapError: toAdminError })

  return {
    facilities,
    getAdminOverview,
    listAudiences,
    listAuditActivity,
    listResource,
    createResource,
    updateResource,
    deleteResource,
    listAnnouncements: (filters) => listResource(ADMIN_RESOURCE_KEYS.ANNOUNCEMENTS, filters),
    createAnnouncement: (input, options) => createResource(ADMIN_RESOURCE_KEYS.ANNOUNCEMENTS, input, options),
    updateAnnouncement: (id, input, options) => updateResource(ADMIN_RESOURCE_KEYS.ANNOUNCEMENTS, id, input, options),
    deleteAnnouncement: (id) => deleteResource(ADMIN_RESOURCE_KEYS.ANNOUNCEMENTS, id),
    listEvents: (filters) => listResource(ADMIN_RESOURCE_KEYS.EVENTS, filters),
    createEvent: (input, options) => createResource(ADMIN_RESOURCE_KEYS.EVENTS, input, options),
    updateEvent: (id, input, options) => updateResource(ADMIN_RESOURCE_KEYS.EVENTS, id, input, options),
    deleteEvent: (id) => deleteResource(ADMIN_RESOURCE_KEYS.EVENTS, id),
    listFacilityAdvisories: (filters) => listResource(ADMIN_RESOURCE_KEYS.FACILITY_ADVISORIES, filters),
    createFacilityAdvisory: (input, options) => createResource(ADMIN_RESOURCE_KEYS.FACILITY_ADVISORIES, input, options),
    updateFacilityAdvisory: (id, input, options) => updateResource(ADMIN_RESOURCE_KEYS.FACILITY_ADVISORIES, id, input, options),
    deleteFacilityAdvisory: (id) => deleteResource(ADMIN_RESOURCE_KEYS.FACILITY_ADVISORIES, id),
    listNotifications: (filters) => listResource(ADMIN_RESOURCE_KEYS.NOTIFICATIONS, filters),
    createNotification: (input, options) => createResource(ADMIN_RESOURCE_KEYS.NOTIFICATIONS, input, options),
    updateNotification: (id, input, options) => updateResource(ADMIN_RESOURCE_KEYS.NOTIFICATIONS, id, input, options),
    deleteNotification: (id) => deleteResource(ADMIN_RESOURCE_KEYS.NOTIFICATIONS, id),
    ...academicAdmin,
  }
}

export const getAdminService = async () => {
  if (!getBackendAvailability().configured) throw createAdminError("BACKEND_UNAVAILABLE", "Supabase is required for Admin CMS.")
  try {
    return createSupabaseAdminService(await getSupabaseClient())
  } catch (error) {
    throw toAdminError(error)
  }
}
