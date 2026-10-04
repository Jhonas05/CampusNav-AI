import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import React from "react"
import { renderToString } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { createServer } from "vite"
import { fileURLToPath, URL } from "node:url"
import {
  FACILITY_ADMIN_CREATE_DEFAULTS,
  buildFacilityAdminPayload,
  createFacilityAdminForm,
  safeFacilityAdminMessage,
} from "../src/lib/facilityAdminUi.js"
import { APP_ROLES } from "../src/lib/authorization.js"
import { canAccessProtectedRoute } from "../src/lib/routeAuthorization.js"
import {
  FACILITY_ADMIN_RESOURCES,
  createFacilityAdminService,
  normalizeFacilityAdminDatabaseError,
  validateFacilityAdminRecord,
} from "../src/services/facilityAdminService.js"

const projectRoot = new URL("..", import.meta.url)
const readProjectFile = (path) => readFile(new URL(path, projectRoot), "utf8")
const common = { ...FACILITY_ADMIN_CREATE_DEFAULTS }
const aliasInput = { service_id: 7, alias: "Records request", ...common }
const mappingInput = {
  facility_id: "library",
  service_id: 7,
  recommendation_rank: 100,
  public_notes: "Development-only mapping.",
  ...common,
}

const [appSource, shellSource, pageSource, editorSource, uiSource, adminSource, statusSource] = await Promise.all([
  readProjectFile("src/App.jsx"),
  readProjectFile("src/components/admin/AdminShell.jsx"),
  readProjectFile("src/pages/admin/FacilityOperationsAdminPage.jsx"),
  readProjectFile("src/components/admin/FacilityOperationsEditor.jsx"),
  readProjectFile("src/lib/facilityAdminUi.js"),
  readProjectFile("src/services/adminService.js"),
  readProjectFile("src/services/facilityStatusEvaluator.js"),
])

// A/G: routes and role boundary.
for (const route of ["/admin/service-aliases", "/admin/facility-service-mappings"]) {
  assert.match(appSource, new RegExp(`path=["']${route}["'][^\n]+requiredRoles=\\{\\[APP_ROLES\\.SUPER_ADMIN\\]\\}`))
  assert.match(shellSource, new RegExp(`path: ["']${route}["'][^\n]+superAdminOnly: true`))
}
assert.equal(canAccessProtectedRoute({ isAuthenticated: true, roles: [APP_ROLES.SUPER_ADMIN], requiredRoles: [APP_ROLES.SUPER_ADMIN] }), true)
assert.equal(canAccessProtectedRoute({ isAuthenticated: true, roles: [APP_ROLES.DEPARTMENT_ADMIN], requiredRoles: [APP_ROLES.SUPER_ADMIN] }), false)
assert.equal(canAccessProtectedRoute({ isAuthenticated: true, roles: [APP_ROLES.STUDENT], requiredRoles: [APP_ROLES.SUPER_ADMIN] }), false)
assert.equal(canAccessProtectedRoute({ isAuthenticated: false, roles: [], requiredRoles: [APP_ROLES.SUPER_ADMIN] }), false)

// B/C/I/J: the shared UI must use every accepted AdminService method and stale/delete guards.
for (const method of [
  "listServiceAliases", "createServiceAlias", "updateServiceAlias", "publishServiceAlias", "expireServiceAlias", "deleteServiceAlias",
  "listFacilityServiceMappings", "createFacilityServiceMapping", "updateFacilityServiceMapping", "publishFacilityServiceMapping", "expireFacilityServiceMapping", "deleteFacilityServiceMapping",
]) assert.match(pageSource, new RegExp(method), `${method} must be wired through the shared Admin page`)
assert.match(pageSource, /loadFacilityAdminReferences/)
assert.match(pageSource, /expectedUpdatedAt: selectedRecord\.updated_at/)
assert.match(pageSource, /expectedUpdatedAt: record\.updated_at/)
assert.match(pageSource, /expectedUpdatedAt: deleteRecord\.updated_at/)
assert.match(editorSource, /STALE_RECORD/)
assert.match(editorSource, /Reload stored version/)
assert.match(pageSource, /role="alertdialog"/)
assert.match(pageSource, /Delete disposable record/)
assert.match(pageSource, /No dependent record will be force-deleted/)

// E/F: validation, duplicate normalization, missing references, and immutable identities.
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.ALIASES, { ...aliasInput, alias: "   " }), /Alias is required/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.ALIASES, { ...aliasInput, alias: "a".repeat(161) }), /Alias is too long/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.MAPPINGS, { ...mappingInput, recommendation_rank: 0 }), /Recommendation rank is invalid/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.MAPPINGS, { ...mappingInput, recommendation_rank: 1001 }), /Recommendation rank is invalid/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.MAPPINGS, { ...mappingInput, public_notes: "n".repeat(2001) }), /Public notes has an invalid length/)
assert.equal(normalizeFacilityAdminDatabaseError({ code: "23505", constraint: "service_aliases_service_alias_unique_idx" }).code, "DUPLICATE_ALIAS")
assert.equal(normalizeFacilityAdminDatabaseError({ code: "23505", constraint: "facility_service_mappings_unique" }).code, "DUPLICATE_MAPPING")

const aliasUpdate = buildFacilityAdminPayload(FACILITY_ADMIN_RESOURCES.ALIASES, aliasInput, { operation: "update" })
assert.equal("service_id" in aliasUpdate, false)
assert.equal(aliasUpdate.alias, "Records request")
const mappingUpdate = buildFacilityAdminPayload(FACILITY_ADMIN_RESOURCES.MAPPINGS, mappingInput, { operation: "update" })
assert.equal("facility_id" in mappingUpdate, false)
assert.equal("service_id" in mappingUpdate, false)
assert.equal(mappingUpdate.recommendation_rank, 100)

const createQueuedClient = (responses) => {
  const queue = [...responses]
  const calls = []
  const terminal = () => Promise.resolve(queue.shift() || { data: null, error: null })
  const from = (table) => {
    const call = { table, operation: "select" }
    calls.push(call)
    const query = {
      select() { return query },
      insert() { call.operation = "insert"; return query },
      eq() { return query },
      limit() { return query },
      maybeSingle: terminal,
      single: terminal,
      then(resolve, reject) { return terminal().then(resolve, reject) },
    }
    return query
  }
  return { client: { from }, calls }
}

const missingAliasService = createQueuedClient([{ data: null, error: null }])
await assert.rejects(
  () => createFacilityAdminService(missingAliasService.client).createServiceAlias(aliasInput),
  (error) => error.code === "NOT_FOUND" && /selected service/.test(error.message),
)
assert.equal(missingAliasService.calls.some((call) => call.operation === "insert"), false)

const missingMappingProfile = createQueuedClient([
  { data: { id: 7 }, error: null },
  { data: null, error: null },
])
await assert.rejects(
  () => createFacilityAdminService(missingMappingProfile.client).createFacilityServiceMapping(mappingInput),
  (error) => error.code === "NOT_FOUND" && /operational profile/.test(error.message),
)
assert.equal(missingMappingProfile.calls.some((call) => call.operation === "insert"), false)

// H/K/L: conservative defaults, provenance separation, demo state, and safe error copy.
const aliasForm = createFacilityAdminForm(FACILITY_ADMIN_RESOURCES.ALIASES)
const mappingForm = createFacilityAdminForm(FACILITY_ADMIN_RESOURCES.MAPPINGS)
assert.deepEqual([aliasForm.lifecycle, aliasForm.public_visibility, aliasForm.verification_status], ["DRAFT", false, "PENDING_VERIFICATION"])
assert.equal(mappingForm.recommendation_rank, 100)
for (const heading of ["Content", "Publication", "Verification / Provenance"]) assert.match(editorSource, new RegExp(heading.replace("/", "\\/")))
assert.match(editorSource, /Demo \/ non-official record/)
for (const code of ["DUPLICATE_ALIAS", "DUPLICATE_MAPPING", "STALE_RECORD", "PERMISSION_DENIED", "SESSION_EXPIRED", "NETWORK_ERROR"]) {
  const message = safeFacilityAdminMessage({ code, message: "relation secret_table at https://secret.invalid?token=x" })
  assert.doesNotMatch(message, /secret_table|secret\.invalid|token=/i)
}
assert.match(safeFacilityAdminMessage({ code: "DUPLICATE_ALIAS" }), /alias/i)
assert.match(safeFacilityAdminMessage({ code: "DUPLICATE_MAPPING" }), /mapped|mapping/i)

// M/N/P/Q: service-only mutations, audit/spatial/public boundaries, responsive structure, and preserved foundations.
assert.doesNotMatch(`${pageSource}\n${editorSource}`, /getSupabaseClient|@supabase\/supabase-js|\.from\s*\(/)
assert.doesNotMatch(`${pageSource}\n${editorSource}`, /audit_logs|insertAudit|createAudit/i)
assert.doesNotMatch(`${pageSource}\n${editorSource}`, /mapNodes|mapEdges|qrCheckpoints|emergencyRoutes|src\/data\/floors/)
for (const forbiddenLabel of ["Geometry", "Map position", "Route", "QR checkpoint", "Emergency path"]) {
  assert.doesNotMatch(editorSource, new RegExp(`label=["']${forbiddenLabel}["']`, "i"))
}
assert.doesNotMatch(appSource, /path=["']\/(?:facilities|dashboard)[^"']*(?:alias|mapping)/i)
assert.doesNotMatch(`${pageSource}\n${editorSource}`, /getFacilitiesByService|getServicesForFacility|searchFacilities/)
assert.match(pageSource, /xl:block/)
assert.match(pageSource, /xl:hidden/)
assert.match(editorSource, /role="dialog"/)
assert.match(editorSource, /aria-modal="true"/)
assert.match(editorSource, /useModalDialog/)
assert.match(adminSource, /\.\.\.facilityAdmin/)
assert.match(statusSource, /evaluateFacilityStatus/)

// Admin shell: every Admin navigation path is a registered route, validation errors stay visible in
// the editor footer, a failed save leaves no copy on the list, and record actions are named per record.
const shellPaths = [...shellSource.matchAll(/path: "(\/admin[^"]*)"/g)].map((match) => match[1])
assert.equal(shellPaths.length >= 20, true)
for (const path of shellPaths) assert.match(appSource, new RegExp(`path=["']${path}["']`), `${path} must be a registered route`)
assert.equal(editorSource.indexOf("<footer") < editorSource.indexOf('role="alert"'), true, "the editor error is rendered inside the sticky footer")
assert.doesNotMatch(pageSource, /catch \(saveError\) \{\s*handleError\(saveError\)/, "editor save errors are not duplicated on the list")
assert.match(pageSource, /actionLabelFor/)
assert.doesNotMatch(pageSource, /facility_id\} mapping/, "mapping actions are named by facility and service")

// Render both new resource pages and editors through the actual Vite JSX pipeline.
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
console.error = (...args) => {
  if (!String(args[0]).includes("useLayoutEffect does nothing on the server")) originalConsoleError(...args)
}

try {
  const { default: ServiceAliasAdminPage } = await vite.ssrLoadModule("/src/pages/admin/ServiceAliasAdminPage.jsx")
  const { default: FacilityServiceMappingAdminPage } = await vite.ssrLoadModule("/src/pages/admin/FacilityServiceMappingAdminPage.jsx")
  const { default: FacilityOperationsEditor } = await vite.ssrLoadModule("/src/components/admin/FacilityOperationsEditor.jsx")
  const renderRoute = (path, component) => renderToString(React.createElement(MemoryRouter, { initialEntries: [path] }, component))

  assert.match(renderRoute("/admin/service-aliases", React.createElement(ServiceAliasAdminPage)), /Service Aliases/)
  assert.match(renderRoute("/admin/facility-service-mappings", React.createElement(FacilityServiceMappingAdminPage)), /Facility-Service Mappings/)

  const services = [{ id: 7, code: "student-records", name: "Student Records" }]
  const facilities = [{ id: "library", name: "Library", floor: "3F", category: "Facility" }]
  const aliasEditor = renderToString(React.createElement(FacilityOperationsEditor, {
    resource: FACILITY_ADMIN_RESOURCES.ALIASES,
    record: null,
    facilities: [],
    services,
    profiles: [],
    departments: [],
    open: true,
    busy: false,
    onOpenChange: () => {},
    onSave: async () => {},
    onReload: async () => {},
  }))
  assert.match(aliasEditor, /Service Alias/)
  assert.match(aliasEditor, /Student Records/)
  assert.match(aliasEditor, /student-records/)
  assert.match(aliasEditor, /Alias/)

  const mappingEditor = renderToString(React.createElement(FacilityOperationsEditor, {
    resource: FACILITY_ADMIN_RESOURCES.MAPPINGS,
    record: null,
    facilities,
    services,
    profiles: [{ facility_id: "library" }],
    departments: [],
    open: true,
    busy: false,
    onOpenChange: () => {},
    onSave: async () => {},
    onReload: async () => {},
  }))
  assert.match(mappingEditor, /Facility-Service Mapping/)
  assert.match(mappingEditor, /Library/)
  assert.match(mappingEditor, /Student Records/)
  assert.match(mappingEditor, /Recommendation rank/)
  assert.match(mappingEditor, /Public notes/)

  // Admin routes use ONE navigation: the Admin navigation replaces the global sidebar, rail, and
  // drawer for signed-in administrators inside /admin/*; it is never rendered beside them.
  const { isAdminPath, resolveSidebarCollapsed, usesAdminShell } = await vite.ssrLoadModule("/src/components/layout/sidebar/navigation.js")
  const authFor = (...codes) => ({ hasAnyRole: (roles) => roles.some((role) => codes.includes(role)) })
  for (const pathname of ["/admin", "/admin/service-aliases", "/admin/facility-service-mappings", "/admin/qr-checkpoints", "/admin/personnel"]) {
    assert.equal(usesAdminShell(pathname, authFor(APP_ROLES.SUPER_ADMIN)), true, `${pathname} uses the Admin navigation for SUPER_ADMIN`)
    assert.equal(usesAdminShell(pathname, authFor(APP_ROLES.DEPARTMENT_ADMIN)), true, `${pathname} uses the Admin navigation for DEPARTMENT_ADMIN`)
    assert.equal(usesAdminShell(pathname, authFor(APP_ROLES.STUDENT)), false, "a non-admin account keeps the public shell (and sees Access denied)")
    assert.equal(usesAdminShell(pathname, authFor()), false, "a signed-out visitor keeps the public shell (and is sent to sign in)")
  }
  for (const pathname of ["/", "/dashboard", "/map", "/facilities", "/administrator"]) {
    assert.equal(usesAdminShell(pathname, authFor(APP_ROLES.SUPER_ADMIN)), false, `${pathname} keeps the global navigation`)
  }
  assert.equal(isAdminPath("/administrator"), false)
  assert.equal(resolveSidebarCollapsed({ wide: true, prefs: {} }), false, "wide public pages default to the expanded sidebar")
  assert.equal(resolveSidebarCollapsed({ wide: false, prefs: {} }), true, "compact public pages default to the rail")
  assert.equal(resolveSidebarCollapsed({ wide: true, prefs: { wide: true } }), true, "a remembered public choice is kept")
  assert.equal(resolveSidebarCollapsed({ wide: false, prefs: { compact: false } }), false)

  const appShellSource = await readProjectFile("src/components/layout/AppShell.jsx")
  assert.match(appShellSource, /\{shell === "app" && <Sidebar /, "the global sidebar renders only in the public shell")
  assert.match(appShellSource, /\{shell === "app" && <MobileSidebarDrawer /, "the global drawer renders only in the public shell")
  assert.match(appShellSource, /\{shell === "app" && \(\s*<MobileTopBar/, "the global context bar renders only in the public shell")
  assert.match(appShellSource, /\{shell === "admin" && <AdminSidebar /, "the Admin sidebar takes the navigation slot inside Admin")
  assert.match(appShellSource, /\{shell === "admin" && <AdminTopBar /)
  assert.equal((appShellSource.match(/<Sidebar /g) || []).length, 1)
  assert.doesNotMatch(appShellSource, /locked/, "no leftover rail lock from the superseded rail-inside-Admin rule")

  // The Admin navigation: one navigation landmark, one current section (also for routes that share
  // a prefix), one logo, one identity, the way back to the app, and the shell controls once each.
  const { default: AdminShell } = await vite.ssrLoadModule("/src/components/admin/AdminShell.jsx")
  const { AdminNavigation, AdminSidebar, AdminTopBar } = await vite.ssrLoadModule("/src/components/admin/AdminNavigation.jsx")
  const currentSections = (html) => [...html.matchAll(/<a\b[^>]*aria-current="page"[^>]*>([\s\S]*?)<\/a>/g)].map((match) => match[1].replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<!--.*?-->/g, "").trim())
  for (const [path, label] of [
    ["/admin", "Overview"],
    ["/admin/personnel", "Personnel"],
    ["/admin/personnel-assignments", "Personnel Assignments"],
    ["/admin/personnel-availability", "Availability Overrides"],
    ["/admin/services", "Services"],
    ["/admin/service-aliases", "Service Aliases"],
    ["/admin/facility-service-mappings", "Service Mappings"],
  ]) {
    assert.deepEqual(currentSections(renderRoute(path, React.createElement(AdminNavigation))), [label], `${path} marks only ${label} as current`)
  }
  const count = (html, pattern) => (html.match(pattern) || []).length
  const sidebarHtml = renderRoute("/admin/service-aliases", React.createElement(AdminSidebar))
  assert.equal(count(sidebarHtml, /<aside\b/g), 1, "one Admin sidebar")
  assert.match(sidebarHtml, /<aside[^>]*aria-label="CampusNav Admin"/)
  assert.equal(count(sidebarHtml, /<nav\b/g), 1, "exactly one Admin navigation landmark")
  assert.match(sidebarHtml, /<nav[^>]*aria-label="Admin navigation"/)
  assert.equal(count(sidebarHtml, /<img\b/g), 1, "one logo in the Admin navigation")
  assert.equal(count(sidebarHtml, /Back to CampusNav/g), 1)
  assert.match(sidebarHtml, /<a[^>]*href="\/dashboard"[^>]*>(?:<svg[\s\S]*?<\/svg>)?\s*(?:<!-- -->)?\s*Back to CampusNav/, "Back to CampusNav returns to the Dashboard")
  assert.equal(count(sidebarHtml, /role="radiogroup"[^>]*aria-label="Appearance"|aria-label="Appearance"[^>]*role="radiogroup"/g), 1, "one appearance control")
  assert.equal(count(sidebarHtml, /data-shell-panel-toggle="notifications"/g), 1, "one notifications control")
  assert.equal(count(sidebarHtml, /data-shell-panel-toggle="profile"/g), 1, "one account control (identity and sign-out menu)")
  assert.doesNotMatch(sidebarHtml, /overflow-x-auto/, "the Admin navigation never scrolls sideways")
  for (const section of ["Overview", "Announcements", "Events", "Facility Advisories", "Notifications", "Facilities", "Services", "Service Aliases", "Service Mappings", "Personnel", "Courses", "Sections", "Class Schedules", "Schedule Exceptions", "Personnel Assignments", "Consultation Hours", "Check-ins", "Availability Overrides", "Audit Activity"]) {
    assert.match(sidebarHtml, new RegExp(`>(?:<!-- -->)?\\s*${section}<`), `${section} stays in the Admin navigation`)
  }

  // In the Admin menu drawer the way back lives in the context bar, so it is not repeated inside.
  const drawerNavigationHtml = renderRoute("/admin/service-aliases", React.createElement(AdminNavigation, { showBack: false, onClose: () => {} }))
  assert.doesNotMatch(drawerNavigationHtml, /Back to CampusNav/)
  assert.match(drawerNavigationHtml, /aria-label="Close Admin menu"/)
  const topBarHtml = renderRoute("/admin/service-aliases", React.createElement(AdminTopBar, { menuOpen: false, onOpenMenu: () => {} }))
  assert.equal(count(topBarHtml, /<button\b/g), 1, "one Admin menu button below 1024px")
  assert.match(topBarHtml, /aria-label="Open Admin menu"[^>]*aria-haspopup="dialog"[^>]*aria-expanded="false"/)
  assert.match(topBarHtml, /href="\/dashboard"/)
  assert.match(topBarHtml, /Back to CampusNav/)

  // The Admin page frame is the work area only.
  const frameHtml = renderRoute("/admin/service-aliases", React.createElement(AdminShell, null, "content"))
  assert.doesNotMatch(frameHtml, /<nav|<aside|<img/, "Admin pages render no navigation of their own")

  // QR Checkpoints: developer-only availability and enforced authentication are stated separately.
  const qrSource = await readProjectFile("src/pages/admin/QRCheckpoints.jsx")
  assert.doesNotMatch(qrSource, /authentication pending/i, "the route is authenticated; the label must not say otherwise")
  assert.match(qrSource, /Developer-only tool · SUPER_ADMIN sign-in required/)
  assert.match(appSource, /path="\/admin\/qr-checkpoints" element=\{<ProtectedRoute requiredRoles=\{\[APP_ROLES\.SUPER_ADMIN\]\}>/)
} finally {
  console.error = originalConsoleError
  await vite.close()
}

console.log("Phase 4-FS-3C aliases/mappings routes, CRUD wiring, references, validation, RBAC, lifecycle, stale/delete, provenance, safe-error, accessibility, Admin shell navigation, and scope contracts: PASS")
