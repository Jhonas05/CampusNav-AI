import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import {
  ADMIN_RESOURCE_CONFIG,
  ADMIN_RESOURCE_KEYS,
  createSupabaseAdminService,
  toAdminError,
  validateAdminContent,
} from "../src/services/adminService.js"
import { facilities } from "../src/data/facilities.js"
import { APP_ROLES } from "../src/lib/authorization.js"
import { canAccessProtectedRoute } from "../src/lib/routeAuthorization.js"

const projectRoot = new URL("..", import.meta.url)
const readProjectFile = (path) => readFile(new URL(path, projectRoot), "utf8")
const common = {
  title: "DEVELOPMENT DEMO — NOT OFFICIAL",
  message: "Plain-text development fixture.",
  priority: "NORMAL",
  verification_status: "DEMO_ONLY",
  effective_at: "2026-09-15T08:00:00+08:00",
  expires_at: "2026-09-16T08:00:00+08:00",
}

const announcement = validateAdminContent(ADMIN_RESOURCE_KEYS.ANNOUNCEMENTS, { ...common, category: "GENERAL" }, "DRAFT")
assert.equal(announcement.lifecycle, "DRAFT")
assert.equal(announcement.is_public, false)
assert.equal(announcement.data_status, "DEMO")

const published = validateAdminContent(ADMIN_RESOURCE_KEYS.ANNOUNCEMENTS, { ...common, category: "GENERAL" }, "PUBLISHED")
assert.equal(published.lifecycle, "PUBLISHED")
assert.equal(published.is_public, true)
assert.ok(published.published_at)

const event = validateAdminContent(ADMIN_RESOURCE_KEYS.EVENTS, {
  ...common,
  description: "Plain-text development fixture.",
  starts_at: "2026-09-20T08:00:00+08:00",
  ends_at: "2026-09-20T09:00:00+08:00",
  related_facility_id: "library",
}, "SCHEDULED")
assert.equal(event.related_facility_id, "library")
assert.equal(event.lifecycle, "SCHEDULED")

const advisory = validateAdminContent(ADMIN_RESOURCE_KEYS.FACILITY_ADVISORIES, {
  ...common,
  related_facility_id: "virtual-laboratory",
  advisory_type: "MAINTENANCE",
}, "PUBLISHED")
assert.equal(advisory.related_facility_id, "virtual-laboratory")
assert.ok(facilities.some((facility) => facility.id === advisory.related_facility_id))

assert.throws(() => validateAdminContent(ADMIN_RESOURCE_KEYS.ANNOUNCEMENTS, { ...common, title: "", category: "GENERAL" }), /Title is required/)
assert.throws(() => validateAdminContent(ADMIN_RESOURCE_KEYS.ANNOUNCEMENTS, { ...common, category: "NOT_A_CATEGORY" }), /Category is not supported/)
assert.throws(() => validateAdminContent(ADMIN_RESOURCE_KEYS.ANNOUNCEMENTS, { ...common, category: "GENERAL", effective_at: common.expires_at, expires_at: common.effective_at }), /Expiration must be later/)
assert.throws(() => validateAdminContent(ADMIN_RESOURCE_KEYS.FACILITY_ADVISORIES, { ...common, related_facility_id: "invented-room", advisory_type: "MAINTENANCE" }), /valid CampusNav facility/)
assert.throws(() => validateAdminContent(ADMIN_RESOURCE_KEYS.EVENTS, { ...common, description: "Event", starts_at: "2026-09-20T09:00:00Z", ends_at: "2026-09-20T08:00:00Z" }), /end time must be later/)

assert.equal(toAdminError({ code: "42501", message: "row-level security" }).code, "PERMISSION_DENIED")
assert.equal(toAdminError({ status: 401, message: "JWT expired" }).code, "SESSION_EXPIRED")
assert.equal(toAdminError({ message: "Failed to fetch" }).code, "NETWORK_ERROR")

const service = createSupabaseAdminService({})
for (const method of [
  "getAdminOverview", "listAuditActivity", "listAudiences",
  "listAnnouncements", "createAnnouncement", "updateAnnouncement", "deleteAnnouncement",
  "listEvents", "createEvent", "updateEvent", "deleteEvent",
  "listFacilityAdvisories", "createFacilityAdvisory", "updateFacilityAdvisory", "deleteFacilityAdvisory",
  "listNotifications", "createNotification", "updateNotification", "deleteNotification",
]) assert.equal(typeof service[method], "function", `${method} must exist`)

assert.equal(canAccessProtectedRoute({ isAuthenticated: false, requiredRoles: [APP_ROLES.SUPER_ADMIN] }), false)
assert.equal(canAccessProtectedRoute({ isAuthenticated: true, roles: [APP_ROLES.STUDENT], requiredRoles: [APP_ROLES.SUPER_ADMIN] }), false)
assert.equal(canAccessProtectedRoute({ isAuthenticated: true, roles: [APP_ROLES.SUPER_ADMIN], requiredRoles: [APP_ROLES.SUPER_ADMIN] }), true)

const appSource = await readProjectFile("src/App.jsx")
for (const route of ["/admin", "/admin/announcements", "/admin/events", "/admin/facility-advisories", "/admin/notifications", "/admin/audit"]) assert.ok(appSource.includes(`path=\"${route}\"`), `${route} must be routed`)
assert.equal((appSource.match(/requiredRoles=\{\[APP_ROLES\.SUPER_ADMIN\]\}/g) || []).length >= 6, true)

const editorSource = await readProjectFile("src/components/admin/AdminContentEditor.jsx")
const contentPageSource = await readProjectFile("src/pages/admin/AdminContentPage.jsx")
assert.doesNotMatch(editorSource + contentPageSource, /dangerouslySetInnerHTML/)
assert.match(editorSource, /sessionStorage/)
assert.match(contentPageSource, /Delete permanently/)
assert.match(contentPageSource, /CANCELLED/)
for (const config of Object.values(ADMIN_RESOURCE_CONFIG)) assert.match(contentPageSource, /getAdminService/)

const migration = await readProjectFile("supabase/migrations/20260914231416_phase_8b1_admin_audit_foundation.sql")
assert.match(migration, /create table public\.audit_logs/i)
assert.match(migration, /alter table public\.audit_logs enable row level security/i)
assert.match(migration, /grant select on table public\.audit_logs to authenticated/i)
assert.match(migration, /revoke all on table public\.audit_logs from anon, authenticated/i)
assert.match(migration, /security definer/i)
assert.match(migration, /set search_path = ''/i)
assert.match(migration, /revoke execute on function private\.record_admin_content_audit\(\) from public, anon, authenticated/i)
for (const table of ["announcements", "events", "facility_advisories", "notifications"]) assert.match(migration, new RegExp(`create trigger ${table}_record_admin_audit`, "i"))
assert.doesNotMatch(migration, /password|access_token|refresh_token|service_role/i)

console.log("Phase 8B.1 Admin CMS validation, route security, stable facility compatibility, service contract, XSS posture, and audit migration structure: PASS")
