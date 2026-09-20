import assert from "node:assert/strict"
import React from "react"
import { renderToString } from "react-dom/server"
import { createServer } from "vite"
import { fileURLToPath, URL } from "node:url"

const projectRoot = fileURLToPath(new URL("..", import.meta.url))
const originalConsoleError = console.error
console.error = (...args) => {
  if (!String(args[0]).includes("useLayoutEffect does nothing on the server")) originalConsoleError(...args)
}

const vite = await createServer({
  appType: "custom",
  configFile: false,
  esbuild: { jsx: "automatic" },
  logLevel: "error",
  optimizeDeps: { noDiscovery: true },
  // react-router resolves to CJS under the SSR module runner; prefer its
  // ESM builds so named exports (useSearchParams, Link, ...) are available.
  ssr: {
    noExternal: ["react-router-dom", "react-router"],
    resolve: { conditions: ["module", "import", "default"], externalConditions: ["module", "import", "default"] },
  },
  resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
  root: projectRoot,
  server: { middlewareMode: true },
})

try {
  // MemoryRouter must come from the same module instance the pages use,
  // otherwise the router context does not match across the two graphs.
  const { MemoryRouter } = await vite.ssrLoadModule("react-router-dom")
  const { default: Navigate } = await vite.ssrLoadModule("/src/pages/Map.jsx")
  const { default: Login } = await vite.ssrLoadModule("/src/pages/Login.jsx")
  const { default: QRCheckpoints } = await vite.ssrLoadModule("/src/pages/admin/QRCheckpoints.jsx")
  const { default: AdminOverview } = await vite.ssrLoadModule("/src/pages/admin/AdminOverview.jsx")
  const { default: AdminContentPage } = await vite.ssrLoadModule("/src/pages/admin/AdminContentPage.jsx")
  const { default: AdminAudit } = await vite.ssrLoadModule("/src/pages/admin/AdminAudit.jsx")
  const { default: AcademicAdminPage } = await vite.ssrLoadModule("/src/pages/admin/AcademicAdminPage.jsx")
  const { default: AccessDenied } = await vite.ssrLoadModule("/src/components/auth/AccessDenied.jsx")
  const { default: MapVerificationPanel } = await vite.ssrLoadModule("/src/components/map/MapVerificationPanel.jsx")
  const { default: EmergencyModePanel } = await vite.ssrLoadModule("/src/components/map/EmergencyModePanel.jsx")
  const { default: Map3DControls } = await vite.ssrLoadModule("/src/components/map3d/Map3DControls.jsx")
  const { facilities } = await vite.ssrLoadModule("/src/data/facilities.js")
  const { floors, getFloorById } = await vite.ssrLoadModule("/src/data/floors.js")
  const { mapNodes } = await vite.ssrLoadModule("/src/data/mapNodes.js")
  const { mapEdges } = await vite.ssrLoadModule("/src/data/mapEdges.js")
  const { qrCheckpoints } = await vite.ssrLoadModule("/src/data/qrCheckpoints.js")
  const { buildMapVerificationReport } = await vite.ssrLoadModule("/src/lib/mapValidation.js")
  const { buildEmergencyVerificationReport } = await vite.ssrLoadModule("/src/lib/emergencyNavigation.js")
  const renderNavigate = (initialEntry) => renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: [initialEntry] },
      React.createElement(Navigate)
    )
  )
  const html = renderNavigate("/map")

  const loginHtml = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/login"] },
      React.createElement(Login)
    )
  )
  assert.match(loginHtml, /CampusNav account/)
  assert.match(loginHtml, /Sign in/)
  assert.match(loginHtml, /Backend: Local Prototype Mode/)
  assert.match(loginHtml, /Public campus navigation remains available without an account/)

  assert.match(html, />Navigate</)
  assert.match(html, /Library/)
  assert.match(html, /Virtual Laboratory/)
  assert.match(html, /Start Navigation/)
  assert.match(html, /Scan QR/)
  assert.match(html, /Manual selection/)
  assert.match(html, /HALLWAY/)
  assert.match(html, /source-aligned estimate/)
  assert.match(html, /GF–5F/)
  assert.match(html, /Registrar&#x27;s Office/)
  assert.match(html, /Accessibility information pending verification/)
  // The 2D/3D switch now lives in the Navigate toolbar, not a separate card.
  assert.match(html, /aria-label="Map dimension"/)
  assert.match(html, />2D</)
  assert.match(html, />3D</)
  assert.match(html, /2D remains the default precision view/)
  assert.doesNotMatch(html, /Map Verification/)

  const developerHtml = renderNavigate("/map?verify=1")
  assert.match(developerHtml, /Loading developer verification tools/)

  const thirdFloor = getFloorById("3F")
  const thirdFloorNodes = mapNodes.filter((node) => node.floorId === "3F")
  const thirdFloorEdges = mapEdges.filter((edge) => edge.floorId === "3F" && edge.type !== "FLOOR_TRANSITION")
  const verificationPanelHtml = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(MapVerificationPanel, {
        floor: thirdFloor,
        report: buildMapVerificationReport({ floor: thirdFloor, facilities, nodes: thirdFloorNodes, edges: thirdFloorEdges }),
        options: { ...thirdFloor.map.referenceOverlay, showOverlay: true, showNodes: true, showEdges: true, showRooms: true, showGraphLabels: true, showEmergencyExits: true, showEmergencyEquipment: true, showEmergencyApprovedEdges: true, showEmergencyRouteIds: false, showEmergencyVerificationStatus: false, show3DNavigationNodes: false, show3DGraphEdges: false, show3DFacilityPolygons: true, show3DStairConnections: false, show3DNodeIds: false, show3DFloorElevations: false, show3DRoutePoints: false },
        onChange: () => {},
        onReset: () => {},
        checkpoints: qrCheckpoints,
        onSimulatePayload: () => {},
        floorReports: floors.map((floor) => buildMapVerificationReport({ floor, facilities, nodes: mapNodes, edges: mapEdges })),
        verticalConnectionCount: mapEdges.filter((edge) => edge.type === "FLOOR_TRANSITION").length,
        emergencyReport: buildEmergencyVerificationReport({ floors, nodes: mapNodes }),
      })
    )
  )
  assert.match(verificationPanelHtml, /Map Verification/)
  assert.match(verificationPanelHtml, /Emergency graph verification/)
  assert.match(verificationPanelHtml, /Show Emergency Exits/)
  assert.match(verificationPanelHtml, /Show Emergency Equipment/)
  assert.match(verificationPanelHtml, /Show Emergency-Approved Edges/)
  assert.match(verificationPanelHtml, /Show Emergency Route IDs/)
  assert.match(verificationPanelHtml, /Show Verification Status/)
  assert.match(verificationPanelHtml, /3D navigation nodes/)
  assert.match(verificationPanelHtml, /3D stair connections/)
  assert.match(verificationPanelHtml, /3D route points/)
  assert.match(verificationPanelHtml, /Reference overlay/)
  assert.match(verificationPanelHtml, /Wall-crossing test/)
  assert.match(verificationPanelHtml, /GF–5F verification summary/)
  assert.match(verificationPanelHtml, /Vertical transition information/)
  assert.match(verificationPanelHtml, /East Stair/)
  assert.match(verificationPanelHtml, /QR checkpoint simulator/)
  assert.match(verificationPanelHtml, /Custom or invalid payload/)
  assert.match(verificationPanelHtml, /Simulate payload/)

  const emergencyHtml = renderNavigate("/map?mode=emergency")
  assert.match(emergencyHtml, /Emergency Mode/)
  assert.match(emergencyHtml, /Current location/)
  assert.match(emergencyHtml, /Find Nearest Verified Exit/)
  assert.match(emergencyHtml, /emergency-map-overlay/)
  assert.match(emergencyHtml, /Loading emergency reference/)
  assert.doesNotMatch(emergencyHtml, /Start Navigation/)
  assert.doesNotMatch(emergencyHtml, /Search destination/)

  const emergencyPanelHtml = renderToString(
    React.createElement(EmergencyModePanel, {
      result: null,
      instructions: [],
      currentLocation: { name: "Library" },
      currentFloorId: "3F",
      onFindExit: () => {},
    })
  )
  assert.match(emergencyPanelHtml, /CampusNav Emergency Mode supplements/)
  assert.match(emergencyPanelHtml, /Evacuation guidance/)
  assert.match(emergencyPanelHtml, /Last verified:.*Pending verification/)

  const noRoutePanelHtml = renderToString(
    React.createElement(EmergencyModePanel, {
      result: { ok: false, message: "No verified digital evacuation route is available from this location. Follow the posted evacuation signage and instructions from authorized emergency personnel." },
      instructions: [],
      currentLocation: { name: "Registrar's Office" },
      currentFloorId: "5F",
      onFindExit: () => {},
    })
  )
  assert.match(noRoutePanelHtml, /No verified digital evacuation route is available from this location/)

  const controlsHtml = renderToString(React.createElement(Map3DControls, {
    floors,
    selectedFloorId: "3F",
    viewMode: "EXPLODED",
    isolateFloor: false,
    animateRoute: true,
    reducedMotion: false,
    onFloorSelect: () => {},
    onViewModeChange: () => {},
    onIsolateChange: () => {},
    onAnimateChange: () => {},
    onCameraAction: () => {},
    onUse2D: () => {},
  }))
  assert.match(controlsHtml, /Exploded/)
  assert.match(controlsHtml, /Stacked/)
  assert.match(controlsHtml, /Isolate floor/)
  assert.match(controlsHtml, /Reset view/)
  assert.match(controlsHtml, /Focus floor/)
  assert.match(controlsHtml, /Entire building/)
  assert.match(controlsHtml, /Use 2D view/)

  const checkpointHtml = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/admin/qr-checkpoints"] },
      React.createElement(QRCheckpoints)
    )
  )
  assert.match(checkpointHtml, /Developer-only/)
  assert.match(checkpointHtml, /QR Checkpoints/)
  assert.match(checkpointHtml, /QR-3F-LIBRARY/)
  assert.match(checkpointHtml, /QR-3F-COMPUTER-LAB/)
  assert.match(checkpointHtml, /QR-3F-VIRTUAL-LAB/)
  assert.match(checkpointHtml, /Generate QR/)
  assert.match(checkpointHtml, /Copy Payload/)
  assert.match(checkpointHtml, /Print Label/)
  assert.match(checkpointHtml, /Save QR/)

  const renderAdminPage = (path, component) => renderToString(
    React.createElement(MemoryRouter, { initialEntries: [path] }, component)
  )
  const overviewHtml = renderAdminPage("/admin", React.createElement(AdminOverview))
  assert.match(overviewHtml, /CampusNav Administration/)
  assert.match(overviewHtml, /Published Announcements/)
  assert.match(overviewHtml, /Active Facility Advisories/)

  // Admin navigation moved into the application sidebar. It is permission
  // aware, so the tree must stay empty for guests and unauthorized roles and
  // must never advertise a module the route would refuse.
  const { getAuthorizedAdminGroups } = await vite.ssrLoadModule("/src/components/layout/navigationConfig.js")
  const fakeAuth = (roles) => ({
    isAuthenticated: roles.length > 0,
    roles,
    hasAnyRole: (required = []) => required.some((role) => roles.includes(role)),
  })
  const labelsFor = (auth) => getAuthorizedAdminGroups(auth).flatMap((group) => group.items.map((item) => item.label))

  assert.deepEqual(labelsFor(fakeAuth([])), [])
  assert.deepEqual(labelsFor(fakeAuth(["STUDENT"])), [])
  assert.deepEqual(labelsFor(fakeAuth(["FACULTY"])), [])

  const departmentAdminLabels = labelsFor(fakeAuth(["DEPARTMENT_ADMIN"]))
  assert.ok(departmentAdminLabels.includes("Personnel"))
  assert.ok(departmentAdminLabels.includes("Class Schedules"))
  assert.equal(departmentAdminLabels.includes("Admin Dashboard"), false)
  assert.equal(departmentAdminLabels.includes("Announcements"), false)
  assert.equal(departmentAdminLabels.includes("Audit Logs"), false)

  const superAdminLabels = labelsFor(fakeAuth(["SUPER_ADMIN"]))
  assert.ok(superAdminLabels.includes("Admin Dashboard"))
  assert.ok(superAdminLabels.includes("Announcements"))
  assert.ok(superAdminLabels.includes("Audit Logs"))
  assert.ok(superAdminLabels.includes("Personnel"))

  const announcementAdminHtml = renderAdminPage("/admin/announcements", React.createElement(AdminContentPage, { resource: "announcements" }))
  assert.match(announcementAdminHtml, /Announcements/)
  assert.match(announcementAdminHtml, /Search title/)
  assert.match(announcementAdminHtml, /All statuses/)
  assert.match(announcementAdminHtml, /New.*Announcement/)

  const advisoryAdminHtml = renderAdminPage("/admin/facility-advisories", React.createElement(AdminContentPage, { resource: "facilityAdvisories" }))
  assert.match(advisoryAdminHtml, /Facility Advisories/)
  assert.match(advisoryAdminHtml, /New.*Facility Advisory/)

  const auditHtml = renderAdminPage("/admin/audit", React.createElement(AdminAudit))
  assert.match(auditHtml, /Read-only administrative content events/)
  assert.match(auditHtml, /Audit Activity/)

  const personnelAdminHtml = renderAdminPage("/admin/personnel", React.createElement(AcademicAdminPage, { resource: "personnel" }))
  assert.match(personnelAdminHtml, /Personnel/)
  assert.match(personnelAdminHtml, /Academic &amp; Personnel/)
  assert.match(personnelAdminHtml, /All personnel types/)
  assert.match(personnelAdminHtml, /Manage approved public and system personnel records/)

  const scheduleAdminHtml = renderAdminPage("/admin/class-schedules", React.createElement(AcademicAdminPage, { resource: "classSchedules" }))
  assert.match(scheduleAdminHtml, /Class Schedules/)
  assert.match(scheduleAdminHtml, /All professors/)
  assert.match(scheduleAdminHtml, /All facilities/)
  assert.match(scheduleAdminHtml, /conflict protection/)

  const checkInAdminHtml = renderAdminPage("/admin/check-ins", React.createElement(AcademicAdminPage, { resource: "checkIns" }))
  assert.match(checkInAdminHtml, /Check-ins/)
  assert.match(checkInAdminHtml, /Schedules alone never prove presence/)

  const accessDeniedHtml = renderAdminPage("/admin", React.createElement(AccessDenied))
  assert.match(accessDeniedHtml, /Access denied/)
  assert.match(accessDeniedHtml, /SUPER_ADMIN/)

  const fifthFloorHtml = renderNavigate("/map?facility=registrar-office")
  assert.match(fifthFloorHtml, /Fifth Floor/)
  assert.match(fifthFloorHtml, /Registrar&#x27;s Office/)
  assert.match(fifthFloorHtml, /under construction; not navigable/)

  console.log("Login, Navigate, Emergency Mode, QR positioning, developer verification, and QR checkpoint admin routes rendered successfully.")
} finally {
  console.error = originalConsoleError
  await vite.close()
}
