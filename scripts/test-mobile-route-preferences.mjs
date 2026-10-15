import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import React from "react"
import { renderToString } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { createServer } from "vite"
import { getFacilityById } from "../src/data/facilities.js"
import { getFloorById } from "../src/data/floors.js"
import { mapNodes } from "../src/data/mapNodes.js"
import { mapEdges } from "../src/data/mapEdges.js"
import { createCheckpointPayload } from "../src/data/qrCheckpoints.js"
import { resolveCheckpointPayload, resolveManualPosition } from "../src/lib/checkpointPositioning.js"
import { calculateFacilityRoute, calculateFacilityRouteWithOptions } from "../src/lib/navigation.js"
import { ROUTE_PREFERENCE, AVOID_STAIRS_NO_ROUTE_MESSAGE } from "../src/lib/routePreferences.js"

const root = new URL("../", import.meta.url)
const vite = await createServer({
  configFile: false, appType: "custom", logLevel: "error", root: fileURLToPath(root),
  esbuild: { jsx: "automatic" }, optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": fileURLToPath(new URL("src/", root)) } },
  server: { middlewareMode: true },
})
const originalError = console.error
console.error = (...args) => { if (!String(args[0]).includes("useLayoutEffect does nothing on the server")) originalError(...args) }
let count = 0
const check = (label, test) => { test(); count++; console.log(`ok ${count} - ${label}`) }
try {
  const { default: Navigate } = await vite.ssrLoadModule("/src/pages/Map.jsx")
  const { ConnectivityProvider } = await vite.ssrLoadModule("/src/contexts/ConnectivityContext.jsx")
  const { FacilityDiscoveryProvider } = await vite.ssrLoadModule("/src/contexts/FacilityDiscoveryContext.jsx")
  const { RoutePreferenceOptions, RoutePreferenceButton, RouteFailureNotice } = await vite.ssrLoadModule("/src/components/map/RoutePreferences.jsx")
  const { default: MobileRouteSheet } = await vite.ssrLoadModule("/src/components/map/MobileRouteSheet.jsx")
  const render = (component) => renderToString(component)
  const navigate = (entry) => render(React.createElement(MemoryRouter, { initialEntries: [entry] }, React.createElement(ConnectivityProvider, null, React.createElement(FacilityDiscoveryProvider, null, React.createElement(Navigate)))))
  const input = (destination, startNodeId = "entrance-library-west") => ({
    startFacility: getFacilityById("library"), destinationFacility: getFacilityById(destination),
    floor: getFloorById("3F"), nodes: mapNodes, edges: mapEdges, startNodeId,
  })
  const plan = (destination, preference) => calculateFacilityRouteWithOptions({ ...input(destination), routeOptions: { preference } })
  const standard = plan("registrar-office", ROUTE_PREFERENCE.STANDARD)
  const avoid = plan("virtual-laboratory", ROUTE_PREFERENCE.AVOID_STAIRS)
  const failed = plan("registrar-office", ROUTE_PREFERENCE.AVOID_STAIRS)
  const fresh = navigate("/map")
  check("Default preference is Standard with no inferred position", () => {
    assert.match(fresh, /Route Preferences: Standard/)
    assert.match(fresh, /From <\/span><span class="font-semibold">Not set/)
    assert.match(fresh, /id="destination-input"[^>]*value=""/)
  })
  check("Destination-only links cannot start navigation", () => {
    const linked = navigate("/map?facility=library")
    assert.match(linked, /Set your location to create a route/)
    assert.doesNotMatch(linked, /You have arrived|You are already/)
    assert.match(linked, /disabled=""[^>]*>[^]*?Start Navigation/)
  })
  check("Standard keeps the exact legacy route and entrance selection", () => assert.deepEqual(standard.route, calculateFacilityRoute(input("registrar-office"))))
  check("Avoid Stairs same-floor result is usable", () => {
    assert.equal(avoid.ok, true)
    assert.equal(avoid.route.edges.some(edge => edge.stairs === true), false)
  })
  check("Cross-floor failure returns no geometry", () => {
    assert.equal(failed.ok, false)
    assert.equal(failed.route, null)
    assert.equal(failed.message, AVOID_STAIRS_NO_ROUTE_MESSAGE)
  })
  check("Exactly two routing choices with native radio semantics", () => {
    const html = render(React.createElement(RoutePreferenceOptions, { preference: ROUTE_PREFERENCE.AVOID_STAIRS, onChange: () => {} }))
    assert.equal((html.match(/type="radio"/g) || []).length, 2)
    assert.match(html, /role="radiogroup" aria-label="Route preference"/)
    assert.match(html, /checked="" value="AVOID_STAIRS"|value="AVOID_STAIRS"[^>]*checked=""/)
  })
  check("Step-free is informational and pending, never selectable", () => {
    const html = render(React.createElement(RoutePreferenceOptions, { preference: ROUTE_PREFERENCE.STANDARD, onChange: () => {} }))
    assert.match(html, /aria-disabled="true"/)
    assert.match(html, /Step-free \/ Wheelchair/)
    assert.match(html, /Accessibility information pending verification\./)
    assert.doesNotMatch(html, /value="STEP_FREE"/)
  })
  check("Preference trigger announces the selected choice", () => {
    const html = render(React.createElement(RoutePreferenceButton, { preference: ROUTE_PREFERENCE.AVOID_STAIRS, onClick: () => {} }))
    assert.match(html, /aria-label="Route Preferences: Avoid Stairs"/)
    assert.match(html, /aria-haspopup="dialog"/)
    assert.match(html, /min-h-11/)
  })
  check("No-route notice requires an explicit Standard action", () => {
    const html = render(React.createElement(RouteFailureNotice, { message: failed.message, failure: failed, onChooseStandard: () => {} }))
    assert.match(html, /role="alert" aria-atomic="true"/)
    assert.match(html, /will not automatically switch to a route that uses stairs/)
    assert.match(html, />Choose Standard Route<\/button>/)
  })
  check("Failed route sheet renders failure without old progress", () => {
    const html = render(React.createElement(MobileRouteSheet, { route: null, instructions: [], destination: getFacilityById("registrar-office"), navigationStatus: "idle", activeStep: 0, onStart: () => {}, hasLocation: true, canStart: true, error: failed.message, failure: failed, onChooseStandard: () => {}, preferenceLabel: "Avoid Stairs" }))
    assert.match(html, /Choose Standard Route/)
    assert.doesNotMatch(html, /Next Step|Confirm Arrival|aria-current="step"/)
  })
  check("QR and manual confirmations resolve the same canonical origin", () => {
    const qr = resolveCheckpointPayload(createCheckpointPayload("QR-3F-LIBRARY"))
    const manual = resolveManualPosition({ floorId: "3F", facilityId: "library" })
    assert.equal(qr.location.currentNodeId, manual.location.currentNodeId)
    assert.equal(qr.location.positioningMethod, "QR")
    assert.equal(manual.location.positioningMethod, "MANUAL")
  })
  check("Emergency UI exposes no normal preferences", () => assert.doesNotMatch(navigate("/map?mode=emergency"), /Route Preferences|Choose Standard Route|value="AVOID_STAIRS"/))
  check("Unsupported preference cannot calculate a fallback route", () => {
    const result = plan("virtual-laboratory", "STEP_FREE")
    assert.equal(result.ok, false)
    assert.equal(result.route, null)
  })
  const [map, preferences, mobile] = await Promise.all(["src/pages/Map.jsx", "src/components/map/RoutePreferences.jsx", "src/components/map/MobileRouteSheet.jsx"].map(p => readFile(new URL(p, root), "utf8")))
  const reset = map.slice(map.indexOf("const resetRoute ="), map.indexOf("const resetEmergencyRoute ="))
  check("Route invalidation clears geometry, instructions and progress but retains preference", () => {
    for (const statement of ["setRoute(null)", "setInstructions([])", 'setNavigationStatus("idle")', "setActiveStep(0)"]) assert.ok(reset.includes(statement))
    assert.doesNotMatch(reset, /setRoutePreference/)
  })
  check("UI uses the verified API with the selected preference", () => {
    assert.match(map, /calculateFacilityRouteWithOptions\(\{/)
    assert.match(map, /routeOptions: \{ preference \}/)
    assert.doesNotMatch(map, /findShortestPath|calculateFacilityRoute\(/)
  })
  check("Changing active preference validates and recalculates from confirmed endpoints", () => {
    assert.match(map, /resolveRouteOptions\(\{ preference \}\)/)
    assert.match(map, /recalculate && hasLocation && destination && !locationConfirmation/)
    assert.match(map, /if \(!hasLocation \|\| locationConfirmation\)/)
  })
  check("Position, destination and view handlers do not reset the preference", () => {
    assert.equal((map.match(/setRoutePreference\(/g) || []).length, 1)
    assert.match(map, /onScan=\{openScanner\}/)
    assert.match(map, /onChooseManually=\{useManualLocation\}/)
  })
  check("Both renderers receive the shared preference-aware route", () => {
    assert.match(map, /route2D=\{displayedRoute\}/)
    assert.match(map, /route3D=\{activeRoute\}/)
    assert.match(map, /getRouteSegmentForFloor\(activeRoute, floorId\)/)
  })
  check("Preference selection remains local and offline", () => {
    assert.doesNotMatch(preferences, /fetch\(|localStorage|sessionStorage|supabase|provider/i)
    assert.match(map, /useState\(ROUTE_PREFERENCE.STANDARD\)/)
  })
  check("Dialog reuses modal focus architecture and fullscreen container", () => {
    assert.match(preferences, /Dialog.Content/)
    assert.match(preferences, /onOpenAutoFocus/)
    assert.match(preferences, /onCloseAutoFocus/)
    assert.match(preferences, /Dialog.Portal container=\{container\}/)
    assert.match(map, /immersive && !preferencesOpen && !scannerOpen && !locationConfirmation/)
  })
  check("Announcements and responsive controls are present", () => {
    assert.match(map, /role="status" aria-live="polite" aria-atomic="true"/)
    assert.match(map, /RoutePreferenceButton/)
    assert.match(map, /RoutePreferenceOptions/)
    assert.match(mobile, /suppressed && "hidden"/)
    assert.match(preferences, /lg:rounded-2xl/)
  })
  const [pwaStatus, css] = await Promise.all(["src/components/pwa/PwaStatus.jsx", "src/index.css"].map(p => readFile(new URL(p, root), "utf8")))
  check("Offline notices clear the route sheet and yield to preference dialogs", () => {
    assert.match(pwaStatus, /var\(--clara-lift,0px\)/)
    assert.match(css, /html\[data-route-preferences-open\] \.pwa-status-panel \{ visibility: hidden; \}/)
    assert.match(preferences, /delete document.documentElement.dataset.routePreferencesOpen/)
  })
  check("Start, Next, End and manual arrival controls remain wired", () => {
    assert.match(map, /onStart=\{\(\) => startNavigation\(\)\}/)
    assert.match(map, /onAdvance=\{advanceNavigation\}/)
    assert.match(map, /onReset=\{resetRoute\}/)
    assert.match(mobile, /Next Step|Confirm Arrival/)
  })
  console.log(`${count}/${count} mobile route-preference contracts passed.`)
} finally {
  console.error = originalError
  await vite.close()
}
