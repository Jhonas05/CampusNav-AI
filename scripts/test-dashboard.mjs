import assert from "node:assert/strict"
import React from "react"
import { renderToString } from "react-dom/server"
import { createServer } from "vite"
import { fileURLToPath, URL } from "node:url"
import { NOTIFICATION_LIFECYCLES, NOTIFICATION_PRIORITIES, SAMPLE_DATA_NOTICE } from "../src/data/dashboardContracts.js"
import { CAMPUS_TIME_ZONE, formatCampusTime, getCampusDateKey } from "../src/lib/campusTime.js"
import { deduplicateDashboardRecords, deduplicateDashboardSections, filterActiveNotifications, getDashboardDataStatus, getEmergencyModeHref, getFacilityNavigationHref, getGeneralAnnouncements, getPriorityAlerts, sortNotificationsByPriority } from "../src/services/dashboardService.js"

const now = new Date("2026-09-14T04:00:00.000Z")
const activeBase = {
  message: "Test message",
  lifecycle: NOTIFICATION_LIFECYCLES.PUBLISHED,
  effectiveAt: "2026-09-14T03:00:00.000Z",
  expiresAt: "2026-09-15T03:00:00.000Z",
  sourceType: "TEST",
}

const priorityRecords = [
  { ...activeBase, id: "info", sourceId: "4", priority: NOTIFICATION_PRIORITIES.INFORMATIONAL },
  { ...activeBase, id: "urgent", sourceId: "1", priority: NOTIFICATION_PRIORITIES.URGENT },
  { ...activeBase, id: "normal", sourceId: "3", priority: NOTIFICATION_PRIORITIES.NORMAL },
  { ...activeBase, id: "important", sourceId: "2", priority: NOTIFICATION_PRIORITIES.IMPORTANT },
]
assert.deepEqual(sortNotificationsByPriority(priorityRecords).map((record) => record.priority), ["URGENT", "IMPORTANT", "NORMAL", "INFORMATIONAL"])

const lifecycleRecords = [
  { ...activeBase, id: "active", sourceId: "active", priority: "NORMAL" },
  { ...activeBase, id: "expired", sourceId: "expired", priority: "URGENT", expiresAt: "2026-09-14T03:59:59.000Z" },
  { ...activeBase, id: "cancelled", sourceId: "cancelled", priority: "URGENT", lifecycle: NOTIFICATION_LIFECYCLES.CANCELLED },
  { ...activeBase, id: "draft", sourceId: "draft", priority: "URGENT", lifecycle: NOTIFICATION_LIFECYCLES.DRAFT },
  { ...activeBase, id: "scheduled", sourceId: "scheduled", priority: "URGENT", lifecycle: NOTIFICATION_LIFECYCLES.SCHEDULED },
]
assert.deepEqual(filterActiveNotifications(lifecycleRecords, now).map((record) => record.id), ["active"])

const duplicates = [
  { id: "one", sourceType: "TEST", sourceId: "SAME" },
  { id: "two", sourceType: "TEST", sourceId: "SAME" },
  { id: "three", sourceType: "TEST", sourceId: "OTHER" },
]
assert.deepEqual(deduplicateDashboardRecords(duplicates).map((record) => record.id), ["one", "three"])
const deduplicatedSections = deduplicateDashboardSections({ alerts: [duplicates[0]], advisories: [duplicates[1]], notices: [duplicates[2]] })
assert.deepEqual(deduplicatedSections.alerts.map((record) => record.id), ["one"])
assert.deepEqual(deduplicatedSections.advisories, [])
assert.deepEqual(deduplicatedSections.notices.map((record) => record.id), ["three"])

assert.equal(CAMPUS_TIME_ZONE, "Asia/Manila")
assert.equal(getCampusDateKey(new Date("2026-09-14T16:30:00.000Z")), "2026-09-15")
assert.match(formatCampusTime(new Date("2026-09-14T16:30:00.000Z")), /12:30 AM/)

assert.equal(getFacilityNavigationHref("library"), "/map?facility=library")
assert.equal(getFacilityNavigationHref("room-43"), "/map?facility=room-43")
assert.equal(getFacilityNavigationHref("areas-under-construction"), null)
assert.equal(getEmergencyModeHref(), "/map?mode=emergency")

assert.equal(getDashboardDataStatus({ demo: false }).label, "Local Prototype Mode")
assert.equal(getDashboardDataStatus({ demo: false }).notice.includes("Sample data"), false)
assert.equal(getPriorityAlerts({ demo: false, now }).some((record) => record.demo), false)
assert.equal(getGeneralAnnouncements({ demo: false, now }).some((record) => record.demo), false)
const demoAlerts = getPriorityAlerts({ demo: true, now })
assert.ok(demoAlerts.length > 0)
assert.equal(demoAlerts.every((record) => record.demo === true), true)
assert.equal(getDashboardDataStatus({ demo: true }).notice, SAMPLE_DATA_NOTICE)
assert.equal(demoAlerts.find((record) => record.category === "EMERGENCY").emergencyHref, "/map?mode=emergency")

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
  const { default: Dashboard } = await vite.ssrLoadModule("/src/pages/Dashboard.jsx")
  const { default: Sidebar } = await vite.ssrLoadModule("/src/components/layout/Sidebar.jsx")
  const renderDashboard = (entry) => renderToString(React.createElement(MemoryRouter, { initialEntries: [entry] }, React.createElement(Dashboard)))

  const normalHtml = renderDashboard("/dashboard")
  assert.match(normalHtml, /Welcome to CampusNav/)
  assert.match(normalHtml, /Good (morning|afternoon|evening)/)
  assert.match(normalHtml, /Local Prototype Mode/)
  assert.match(normalHtml, /No priority alerts are available/)
  assert.match(normalHtml, /Schedule information unavailable/)
  assert.match(normalHtml, /Operating hours pending verification/)
  assert.match(normalHtml, /Personnel availability information is not available/)
  assert.match(normalHtml, /No current facility advisories/)
  assert.match(normalHtml, /No upcoming events/)
  assert.match(normalHtml, /No general announcements are available/)
  assert.match(normalHtml, /Mapped construction area/)
  assert.doesNotMatch(normalHtml, /Sample Class/)
  assert.doesNotMatch(normalHtml, /Sample Faculty/)
  assert.doesNotMatch(normalHtml, /Sample Event/)
  assert.doesNotMatch(normalHtml, />Demo data</)

  // Sidebar is the primary navigation; an unauthenticated render must expose
  // the public destinations and no ADMINISTRATION section.
  const sidebarHtml = renderToString(React.createElement(MemoryRouter, { initialEntries: ["/dashboard"] }, React.createElement(Sidebar)))
  assert.match(sidebarHtml, /href="\/dashboard"/)
  assert.match(sidebarHtml, />Dashboard</)
  assert.match(sidebarHtml, /href="\/map"/)
  assert.match(sidebarHtml, /href="\/emergency"/)
  assert.doesNotMatch(sidebarHtml, /Administration/)
  assert.doesNotMatch(sidebarHtml, /href="\/admin/)

  const demoHtml = renderDashboard("/dashboard?demo=1")
  assert.match(demoHtml, /Demo data/)
  assert.match(demoHtml, /Sample data — not official school information/)
  assert.match(demoHtml, /Sample Class/)
  assert.match(demoHtml, /Sample Faculty/)
  assert.match(demoHtml, /Sample Event/)
  assert.match(demoHtml, /Navigate to Venue/)
  assert.match(demoHtml, /Open Emergency Mode/)
  assert.match(demoHtml, /\/map\?facility=library/)
  assert.match(demoHtml, /\/map\?mode=emergency/)

  const verifyHtml = renderDashboard("/dashboard?demo=1&verify=1")
  assert.match(verifyHtml, /Developer verification mode/)
  assert.match(verifyHtml, /Source ID/)
  assert.match(verifyHtml, /DEMO_PROVIDER/)
  assert.match(verifyHtml, /DEMO_ONLY/)

  console.log("Dashboard priority, lifecycle, duplicate, campus-time, demo isolation, empty-state, and navigation-action tests: PASS")
} finally {
  console.error = originalConsoleError
  await vite.close()
}
