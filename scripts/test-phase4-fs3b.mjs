import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import React from "react"
import { renderToString } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { createServer } from "vite"
import { fileURLToPath, URL } from "node:url"
import { facilities } from "../src/data/facilities.js"
import {
  FACILITY_ADMIN_CREATE_DEFAULTS,
  buildFacilityAdminPayload,
  isNonOfficialFacilityAdminRecord,
  safeFacilityAdminMessage,
} from "../src/lib/facilityAdminUi.js"
import { APP_ROLES } from "../src/lib/authorization.js"
import { canAccessProtectedRoute } from "../src/lib/routeAuthorization.js"
import {
  FACILITY_ADMIN_RESOURCES,
  validateFacilityAdminRecord,
} from "../src/services/facilityAdminService.js"

const projectRoot = new URL("..", import.meta.url)
const readProjectFile = (path) => readFile(new URL(path, projectRoot), "utf8")
const [appSource, shellSource, pageSource, editorSource, uiSource, adminServiceSource] = await Promise.all([
  readProjectFile("src/App.jsx"),
  readProjectFile("src/components/admin/AdminShell.jsx"),
  readProjectFile("src/pages/admin/FacilityOperationsAdminPage.jsx"),
  readProjectFile("src/components/admin/FacilityOperationsEditor.jsx"),
  readProjectFile("src/lib/facilityAdminUi.js"),
  readProjectFile("src/services/adminService.js"),
])

// 1-5: routes, authoritative role guard, denied behavior, and authorized navigation.
for (const route of ["/admin/facilities", "/admin/services"]) {
  assert.match(appSource, new RegExp(`path=["']${route}["'][^\n]+requiredRoles=\\{\\[APP_ROLES\\.SUPER_ADMIN\\]\\}`), `${route} must require SUPER_ADMIN`)
}
assert.equal(canAccessProtectedRoute({ isAuthenticated: true, roles: [APP_ROLES.STUDENT], requiredRoles: [APP_ROLES.SUPER_ADMIN] }), false)
assert.equal(canAccessProtectedRoute({ isAuthenticated: true, roles: [APP_ROLES.DEPARTMENT_ADMIN], requiredRoles: [APP_ROLES.SUPER_ADMIN] }), false)
assert.equal(canAccessProtectedRoute({ isAuthenticated: true, roles: [APP_ROLES.SUPER_ADMIN], requiredRoles: [APP_ROLES.SUPER_ADMIN] }), true)
assert.match(shellSource, /label: "Facilities"[\s\S]+path: "\/admin\/facilities"[\s\S]+superAdminOnly: true/)
assert.match(shellSource, /label: "Services"[\s\S]+path: "\/admin\/services"[\s\S]+superAdminOnly: true/)

// 6-16: canonical profile workflow, immutable identity, operational-only fields, lifecycle, and stale/delete UX.
assert.equal(facilities.length > 0, true)
assert.match(pageSource, /listCanonicalFacilities\(\)/)
assert.match(pageSource, /No operational profile/)
assert.match(pageSource, /createFacilityOperationalProfile/)
assert.match(editorSource, /disabled=\{Boolean\(record\)\}/)
for (const forbiddenField of ["geometry", "coordinates", "map position", "nodes", "edges", "routing", "QR", "emergency relationships"]) {
  assert.doesNotMatch(editorSource, new RegExp(`label=["']${forbiddenField}["']`, "i"), `profile editor must not expose ${forbiddenField}`)
}
for (const allowedField of ["Description", "Department", "Public contact name", "Public contact email", "Public contact phone"]) assert.match(editorSource, new RegExp(allowedField))
assert.match(pageSource, /updateFacilityOperationalProfile/)
assert.match(pageSource, /publishFacilityOperationalProfile/)
assert.match(pageSource, /expireFacilityOperationalProfile/)
assert.match(pageSource, /deleteFacilityOperationalProfile/)
assert.match(editorSource, /STALE_RECORD/)
assert.match(editorSource, /Reload stored version/)
assert.match(pageSource, /role="alertdialog"/)
assert.match(pageSource, /Delete disposable record/)

// 17-26: service workflow, code rules, provenance groups, and conservative/non-official states.
assert.match(pageSource, /listFacilityAdminServices/)
assert.match(pageSource, /createFacilityAdminServiceRecord/)
assert.throws(() => validateFacilityAdminRecord(FACILITY_ADMIN_RESOURCES.SERVICES, {
  ...FACILITY_ADMIN_CREATE_DEFAULTS,
  code: "Not Kebab",
  name: "Records",
}), /lowercase kebab-case/)
const serviceUpdate = buildFacilityAdminPayload(FACILITY_ADMIN_RESOURCES.SERVICES, {
  ...FACILITY_ADMIN_CREATE_DEFAULTS,
  code: "student-records",
  name: "Student Records",
}, { operation: "update" })
assert.equal("code" in serviceUpdate, false, "service code must not be sent on update")
assert.equal(buildFacilityAdminPayload(FACILITY_ADMIN_RESOURCES.SERVICES, {
  ...FACILITY_ADMIN_CREATE_DEFAULTS,
  code: "student-records",
  name: "Student Records",
  effective_at: "2026-10-03T09:30",
}).effective_at, "2026-10-03T01:30:00.000Z", "Admin timestamps are interpreted in Asia/Manila")
assert.match(editorSource, /Stable identity is immutable after creation/)
assert.match(uiSource, /DUPLICATE_SERVICE_CODE/)
assert.match(pageSource, /publishFacilityAdminServiceRecord/)
assert.match(pageSource, /expireFacilityAdminServiceRecord/)
assert.match(pageSource, /deleteFacilityAdminServiceRecord/)
for (const heading of ["Content", "Publication", "Verification \/ Provenance"]) assert.match(editorSource, new RegExp(heading))
assert.deepEqual(
  [FACILITY_ADMIN_CREATE_DEFAULTS.lifecycle, FACILITY_ADMIN_CREATE_DEFAULTS.public_visibility, FACILITY_ADMIN_CREATE_DEFAULTS.verification_status],
  ["DRAFT", false, "PENDING_VERIFICATION"],
)
assert.equal(isNonOfficialFacilityAdminRecord({ verification_status: "DEMO_ONLY", data_status: "DEMO" }), true)
assert.match(editorSource, /Demo \/ non-official record/)

// 27-33: safe errors, service-only data access, audit boundary, excluded UI, spatial isolation, and retained foundations.
assert.equal(safeFacilityAdminMessage({ code: "ADMIN_ERROR", message: "relation secret_table does not exist" }).includes("secret_table"), false)
assert.doesNotMatch(`${pageSource}\n${editorSource}`, /getSupabaseClient|\.from\s*\(|@supabase\/supabase-js/)
assert.doesNotMatch(`${pageSource}\n${editorSource}`, /audit_logs|insertAudit|createAudit/i)
assert.match(pageSource, /Change saved and recorded in Audit Activity/)
assert.doesNotMatch(`${pageSource}\n${editorSource}`, /FACILITY_ADMIN_RESOURCES\.(?:HOURS|EXCEPTIONS)/, "FS-3B profile/service components remain separate from the schedule-specific Admin UI")
assert.doesNotMatch(`${pageSource}\n${editorSource}`, /mapNodes|mapEdges|qrCheckpoints|emergencyRoutes|src\/data\/floors/)
for (const method of ["listFacilityOperationalProfiles", "createFacilityOperationalProfile", "listFacilityAdminServices", "createFacilityAdminServiceRecord"]) assert.match(adminServiceSource, new RegExp(`\\.\\.\\.facilityAdmin|${method}`))
assert.match(appSource, /ProtectedRoute/)

// Render both responsive list shells and both editor variants through the actual Vite JSX pipeline.
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
  const { default: FacilityAdminPage } = await vite.ssrLoadModule("/src/pages/admin/FacilityAdminPage.jsx")
  const { default: ServiceAdminPage } = await vite.ssrLoadModule("/src/pages/admin/ServiceAdminPage.jsx")
  const { default: FacilityOperationsEditor } = await vite.ssrLoadModule("/src/components/admin/FacilityOperationsEditor.jsx")
  const renderRoute = (path, component) => renderToString(React.createElement(MemoryRouter, { initialEntries: [path] }, component))

  const facilitiesHtml = renderRoute("/admin/facilities", React.createElement(FacilityAdminPage))
  assert.match(facilitiesHtml, /Facilities/)
  assert.match(facilitiesHtml, /Search facility, ID, or floor/)
  assert.match(facilitiesHtml, /Configured does not mean verified or official/)

  const servicesHtml = renderRoute("/admin/services", React.createElement(ServiceAdminPage))
  assert.match(servicesHtml, /Services/)
  assert.match(servicesHtml, /Search service name or code/)

  const profileEditorHtml = renderToString(React.createElement(FacilityOperationsEditor, {
    resource: FACILITY_ADMIN_RESOURCES.PROFILES,
    record: null,
    initialIdentity: facilities[0].id,
    facilities: [facilities[0]],
    departments: [],
    open: true,
    busy: false,
    onOpenChange: () => {},
    onSave: async () => {},
    onReload: async () => {},
  }))
  assert.match(profileEditorHtml, /Canonical facility/)
  assert.match(profileEditorHtml, /Save draft/)
  assert.doesNotMatch(profileEditorHtml, /lucide-send/)

  const serviceEditorHtml = renderToString(React.createElement(FacilityOperationsEditor, {
    resource: FACILITY_ADMIN_RESOURCES.SERVICES,
    record: { id: 1, code: "student-records", name: "Student Records", updated_at: "2026-10-03T00:00:00Z", ...FACILITY_ADMIN_CREATE_DEFAULTS },
    facilities: [],
    departments: [],
    open: true,
    busy: false,
    onOpenChange: () => {},
    onSave: async () => {},
    onReload: async () => {},
  }))
  assert.match(serviceEditorHtml, /Service code/)
  assert.match(serviceEditorHtml, /disabled=""/)
  assert.match(serviceEditorHtml, /Save changes/)
} finally {
  console.error = originalConsoleError
  await vite.close()
}

console.log("Phase 4-FS-3B SUPER_ADMIN routes, canonical facility/profile workflow, service catalog, lifecycle, provenance, safe-error, stale/delete, accessibility, and scope contracts: PASS")
