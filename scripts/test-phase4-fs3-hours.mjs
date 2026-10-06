import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import React from "react"
import { renderToString } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { createServer } from "vite"
import { APP_ROLES } from "../src/lib/authorization.js"
import {
  buildFacilitySchedulePayloads,
  createFacilityAdminForm,
  safeFacilityAdminMessage,
} from "../src/lib/facilityAdminUi.js"
import { canAccessProtectedRoute } from "../src/lib/routeAuthorization.js"
import {
  FACILITY_ADMIN_RESOURCES,
  validateFacilityAdminRecord,
} from "../src/services/facilityAdminService.js"

const projectRoot = new URL("../", import.meta.url)
const readProjectFile = (path) => readFile(new URL(path, projectRoot), "utf8")
const [appSource, shellSource, pageSource, editorSource, uiSource, serviceSource, adminSource, statusSource] = await Promise.all([
  readProjectFile("src/App.jsx"),
  readProjectFile("src/components/admin/AdminShell.jsx"),
  readProjectFile("src/pages/admin/FacilityScheduleAdminPage.jsx"),
  readProjectFile("src/components/admin/FacilityScheduleEditor.jsx"),
  readProjectFile("src/lib/facilityAdminUi.js"),
  readProjectFile("src/services/facilityAdminService.js"),
  readProjectFile("src/services/adminService.js"),
  readProjectFile("src/services/facilityStatusEvaluator.js"),
])

// A/B: dedicated registered routes and the unchanged safe initial role boundary.
for (const route of ["/admin/facility-hours", "/admin/facility-hour-exceptions"]) {
  assert.match(appSource, new RegExp(`path=["']${route}["'][^\n]+requiredRoles=\\{\\[APP_ROLES\\.SUPER_ADMIN\\]\\}`))
  assert.match(shellSource, new RegExp(`path: ["']${route}["'][^\n]+superAdminOnly: true`))
}
assert.equal(canAccessProtectedRoute({ isAuthenticated: true, roles: [APP_ROLES.SUPER_ADMIN], requiredRoles: [APP_ROLES.SUPER_ADMIN] }), true)
for (const role of [APP_ROLES.STUDENT, APP_ROLES.PARENT, APP_ROLES.FACULTY, APP_ROLES.STAFF, APP_ROLES.DEPARTMENT_ADMIN, APP_ROLES.FACILITY_MANAGER]) {
  assert.equal(canAccessProtectedRoute({ isAuthenticated: true, roles: [role], requiredRoles: [APP_ROLES.SUPER_ADMIN] }), false)
}
assert.equal(canAccessProtectedRoute({ isAuthenticated: false, roles: [], requiredRoles: [APP_ROLES.SUPER_ADMIN] }), false)

// C-N: both resource surfaces use every accepted list/mutation/lifecycle/delete method.
for (const method of [
  "listFacilityHours", "createFacilityHours", "updateFacilityHours", "publishFacilityHours", "expireFacilityHours", "deleteFacilityHours",
  "listFacilityHourExceptions", "createFacilityHourException", "updateFacilityHourException", "publishFacilityHourException", "expireFacilityHourException", "deleteFacilityHourException",
]) assert.match(`${pageSource}\n${serviceSource}`, new RegExp(method))
assert.match(pageSource, /loadFacilityAdminReferences/)
assert.match(pageSource, /references\.profiles/)
assert.match(pageSource, /profileIds\.has\(facility\.id\)/)

const common = {
  lifecycle: "DRAFT",
  public_visibility: false,
  published_at: null,
  effective_at: null,
  expires_at: null,
  verification_status: "PENDING_VERIFICATION",
  data_status: "PENDING_VERIFICATION",
  source_type: "DEVELOPMENT_TEST",
  source_id: "FS3-HOURS-TEST",
  source_label: "DEVELOPMENT / DEMO / NOT OFFICIAL",
  last_verified_at: null,
}

const hoursForm = {
  ...createFacilityAdminForm(FACILITY_ADMIN_RESOURCES.HOURS),
  ...common,
  facility_id: "library",
  day_of_week: 1,
  intervals: [
    { key: "a", start_time: "08:00", end_time: "12:00" },
    { key: "b", start_time: "13:00", end_time: "17:00" },
  ],
}
const splitHours = buildFacilitySchedulePayloads(FACILITY_ADMIN_RESOURCES.HOURS, hoursForm)
assert.equal(splitHours.length, 2)
assert.deepEqual(splitHours.map((row) => [row.day_of_week, row.start_time, row.end_time]), [[1, "08:00", "12:00"], [1, "13:00", "17:00"]])
splitHours.forEach((row) => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.HOURS, row))

const overnight = validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.HOURS, { ...splitHours[0], start_time: "22:00", end_time: "02:00" })
assert.equal(overnight.start_time, "22:00:00")
assert.equal(overnight.end_time, "02:00:00")

const closedHours = buildFacilitySchedulePayloads(FACILITY_ADMIN_RESOURCES.HOURS, { ...hoursForm, closed_all_day: true })
assert.equal(closedHours.length, 1)
assert.deepEqual([closedHours[0].closed_all_day, closedHours[0].start_time, closedHours[0].end_time], [true, null, null])
validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.HOURS, closedHours[0])

const exceptionForm = {
  ...createFacilityAdminForm(FACILITY_ADMIN_RESOURCES.EXCEPTIONS),
  ...common,
  facility_id: "library",
  exception_date: "2026-10-05",
  intervals: [
    { key: "a", start_time: "09:00", end_time: "12:00" },
    { key: "b", start_time: "13:00", end_time: "15:00" },
  ],
}
const splitExceptions = buildFacilitySchedulePayloads(FACILITY_ADMIN_RESOURCES.EXCEPTIONS, exceptionForm)
assert.equal(splitExceptions.length, 2)
assert.equal(splitExceptions[0].exception_date, "2026-10-05")
splitExceptions.forEach((row) => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.EXCEPTIONS, row))
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.HOURS, { ...splitHours[0], day_of_week: 7 }), /Weekday must be between 0 and 6/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.EXCEPTIONS, { ...splitExceptions[0], exception_date: "2026-02-30" }), /valid YYYY-MM-DD/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.HOURS, { ...splitHours[0], end_time: "" }), /require both start and end/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.HOURS, { ...splitHours[0], lifecycle: "INVALID" }), /Lifecycle is not supported/)

// Stale-write, deletion, conflict, and safe-copy requirements.
assert.match(pageSource, /expectedUpdatedAt: selectedRecord\.updated_at/)
assert.match(pageSource, /expectedUpdatedAt: record\.updated_at/)
assert.match(pageSource, /expectedUpdatedAt: deleteRecord\.updated_at/)
assert.match(editorSource, /formError\.code === "STALE_RECORD"/)
assert.match(editorSource, /Reload stored version/)
assert.match(pageSource, /role="alertdialog"/)
assert.match(pageSource, /Prefer Expire/)
for (const code of ["HOURS_OVERLAP", "CLOSED_MARKER_CONFLICT"]) {
  const message = safeFacilityAdminMessage({ code, message: "constraint secret_table https://private.invalid?token=x" })
  assert.match(message, code === "HOURS_OVERLAP" ? /overlap/i : /closed-all-day/i)
  assert.doesNotMatch(message, /secret_table|private\.invalid|token=/i)
}
assert.match(uiSource, /HOURS_OVERLAP/)
assert.match(uiSource, /CLOSED_MARKER_CONFLICT/)

// Schedule-aware controls, strict date identity, lifecycle, provenance, and accessibility structure.
for (const label of ["Add interval", "Remove interval", "Closed all day", "Exception date", "Weekday", "Verification status", "Data status", "Source type", "Source ID", "Source label", "Last verified time"]) assert.match(editorSource, new RegExp(label))
assert.match(editorSource, /type="date"/)
assert.match(editorSource, /Strict YYYY-MM-DD Manila campus date/)
assert.doesNotMatch(editorSource, /new Date\(form\.exception_date|toISOString\(\).*exception_date/)
assert.match(editorSource, /role="dialog"/)
assert.match(editorSource, /aria-modal="true"/)
assert.match(editorSource, /useModalDialog/)
assert.match(editorSource, /Operating intervals/)
assert.match(editorSource, /aria-label=\{`Remove interval/)
assert.match(pageSource, /xl:block/)
assert.match(pageSource, /xl:hidden/)

// Provider, status, spatial, advisory, and audit boundaries remain centralized.
assert.doesNotMatch(`${pageSource}\n${editorSource}`, /getSupabaseClient|@supabase\/supabase-js|\.from\s*\(/)
assert.doesNotMatch(`${pageSource}\n${editorSource}`, /evaluateFacilityStatus|getFacilityStatus|OPEN_NOW|CLOSING_SOON|SCHEDULED_TO_OPEN/)
assert.doesNotMatch(`${pageSource}\n${editorSource}`, /facility_advisories|createFacilityAdvisory|updateFacilityAdvisory/)
assert.doesNotMatch(`${pageSource}\n${editorSource}`, /mapNodes|mapEdges|qrCheckpoints|emergencyRoutes|audit_logs|insertAudit/i)
assert.match(adminSource, /\.\.\.facilityAdmin/)
assert.match(statusSource, /evaluateFacilityStatus/)

// Render both routes and both schedule-specific editors through Vite's real JSX pipeline.
const vite = await createServer({
  appType: "custom",
  configFile: false,
  esbuild: { jsx: "automatic" },
  logLevel: "error",
  optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
  root: fileURLToPath(projectRoot),
  server: { middlewareMode: true },
})
const originalConsoleError = console.error
console.error = (...args) => { if (!String(args[0]).includes("useLayoutEffect does nothing on the server")) originalConsoleError(...args) }

try {
  const { default: FacilityHoursAdminPage } = await vite.ssrLoadModule("/src/pages/admin/FacilityHoursAdminPage.jsx")
  const { default: FacilityHourExceptionsAdminPage } = await vite.ssrLoadModule("/src/pages/admin/FacilityHourExceptionsAdminPage.jsx")
  const { default: FacilityScheduleEditor } = await vite.ssrLoadModule("/src/components/admin/FacilityScheduleEditor.jsx")
  const { AdminNavigation } = await vite.ssrLoadModule("/src/components/admin/AdminNavigation.jsx")
  const renderRoute = (path, component) => renderToString(React.createElement(MemoryRouter, { initialEntries: [path] }, component))
  assert.match(renderRoute("/admin/facility-hours", React.createElement(FacilityHoursAdminPage)), /Operating Hours/)
  assert.match(renderRoute("/admin/facility-hour-exceptions", React.createElement(FacilityHourExceptionsAdminPage)), /Hour Exceptions/)

  const facilities = [{ id: "library", name: "Library", floor: "3F", category: "Facility" }]
  const baseProps = { record: null, facilities, open: true, busy: false, onOpenChange: () => {}, onSave: async () => {}, onReload: async () => {} }
  const hoursEditor = renderToString(React.createElement(FacilityScheduleEditor, { ...baseProps, resource: FACILITY_ADMIN_RESOURCES.HOURS }))
  assert.match(hoursEditor, /Weekly Operating Hours/)
  assert.match(hoursEditor, /Monday/)
  assert.match(hoursEditor, /Add interval/)
  const exceptionEditor = renderToString(React.createElement(FacilityScheduleEditor, { ...baseProps, resource: FACILITY_ADMIN_RESOURCES.EXCEPTIONS }))
  assert.match(exceptionEditor, /Dated Hour Exception/)
  assert.match(exceptionEditor, /Strict YYYY-MM-DD Manila campus date/)

  const currentSections = (html) => [...html.matchAll(/<a\b[^>]*aria-current="page"[^>]*>([\s\S]*?)<\/a>/g)].map((match) => match[1].replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<!--.*?-->/g, "").trim())
  assert.deepEqual(currentSections(renderRoute("/admin/facility-hours", React.createElement(AdminNavigation))), ["Operating Hours"])
  assert.deepEqual(currentSections(renderRoute("/admin/facility-hour-exceptions", React.createElement(AdminNavigation))), ["Hour Exceptions"])
} finally {
  console.error = originalConsoleError
  await vite.close()
}

console.log("Phase 4 FS-3 hours/exceptions Admin routes, CRUD wiring, schedule semantics, lifecycle, provenance, stale/delete, safe errors, RBAC, accessibility, responsive, and boundary contracts: PASS")
