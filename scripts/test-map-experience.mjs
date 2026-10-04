import assert from "node:assert/strict"
import { readdir, readFile } from "node:fs/promises"
import { fileURLToPath, URL } from "node:url"
import React from "react"
import { renderToString } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { createServer } from "vite"
import { facilities } from "../src/data/facilities.js"
import { floors } from "../src/data/floors.js"
import { getNavigateHref } from "../src/lib/mapLinks.js"
import {
  MAP2D_VIEW,
  centerOn,
  clampView,
  getDefaultView,
  getFitDistance,
  getFitScale,
  getFocusView,
  getPolygonBox,
  getScaleLimits,
  resizeView,
  zoomAt,
} from "../src/lib/mapViewport.js"

const projectRoot = new URL("..", import.meta.url)
const read = (path) => readFile(new URL(path, projectRoot), "utf8")
const close = (actual, expected, message, tolerance = 1e-6) => assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} ≠ ${expected}`)

// 1. One spatial truth: a single renderer component owns both renderers and
//    imports the canonical datasets; Home, Dashboard, and Navigate use it.
const [canvasSource, previewSource, mapPageSource, homeSource, overviewSource, dashboardSource] = await Promise.all([
  read("src/components/map/CampusMapCanvas.jsx"),
  read("src/components/map/CampusMapPreview.jsx"),
  read("src/pages/Map.jsx"),
  read("src/pages/Home.jsx"),
  read("src/components/dashboard/CampusOverview.jsx"),
  read("src/pages/Dashboard.jsx"),
])
for (const dataset of ["@/data/floors", "@/data/facilities", "@/data/mapNodes", "@/data/mapEdges", "@/data/qrCheckpoints", "@/data/emergencyExits", "@/data/emergencyEquipment", "@/data/emergencyRoutes"]) {
  assert.match(canvasSource, new RegExp(`from "${dataset}"`), `CampusMapCanvas reads ${dataset}`)
}
assert.match(canvasSource, /<IndoorMap2D/)
assert.match(canvasSource, /import\("@\/components\/map3d\/Campus3D"\)/, "3D stays lazily loaded")
assert.match(mapPageSource, /<CampusMapCanvas/, "Navigate renders the shared map")
assert.match(previewSource, /<CampusMapCanvas/, "previews render the shared map")
assert.match(homeSource, /<CampusMapPreview/, "Home embeds the real map")
assert.match(overviewSource, /<CampusMapPreview/, "Dashboard embeds the real map")
assert.match(dashboardSource, /<CampusOverview/)

const sourceFiles = async (dir) => (await Promise.all((await readdir(new URL(dir, projectRoot), { withFileTypes: true })).map((entry) => (entry.isDirectory() ? sourceFiles(`${dir}${entry.name}/`) : [`${dir}${entry.name}`])))).flat()
const jsxFiles = (await sourceFiles("src/")).filter((file) => /\.(jsx|js)$/.test(file))
const renderers = []
for (const file of jsxFiles) {
  const text = await read(file)
  if (/<IndoorMap2D\b|<Campus3D\b|import\("@\/components\/map3d\/Campus3D"\)/.test(text)) renderers.push(file)
}
// The facility page keeps a static, non-interactive thumbnail of the same
// 2D renderer and canonical floor; it never mounts 3D or its own geometry.
assert.deepEqual(renderers.sort(), ["src/components/map/CampusMapCanvas.jsx", "src/pages/FacilityDetail.jsx"], "only the shared canvas (and the static facility thumbnail) mount the renderers")
const facilityDetailSource = await read("src/pages/FacilityDetail.jsx")
assert.doesNotMatch(facilityDetailSource, /Campus3D/)
assert.match(facilityDetailSource, /interactive=\{false\}/)
assert.match(facilityDetailSource, /const floor = facility \? getFloorById\(facility\.floorId\)/, "the thumbnail reads the canonical floor")

for (const [name, text] of [["Home", homeSource], ["CampusOverview", overviewSource], ["CampusMapPreview", previewSource]]) {
  assert.doesNotMatch(text, /polygon|labelPoint|entranceNodeIds|\bx:\s*-?\d|\by:\s*-?\d/, `${name} holds no coordinates or geometry`)
}
// Geometry lives only in the canonical spatial modules (no Home/Dashboard/3D copy).
const geometryFiles = []
for (const file of (await sourceFiles("src/")).filter((path) => /\.(jsx?|json)$/.test(path))) {
  if (/polygon\s*:|labelPoint\s*:/.test(await read(file))) geometryFiles.push(file)
}
assert.deepEqual(geometryFiles.sort(), ["src/data/additionalFloorMaps.js", "src/data/floors.js"], "no separate map dataset was created")
assert.doesNotMatch(homeSource, /CampusFloorStack|Five floors, one building/, "schematic floor stack retired from Home")
assert.doesNotMatch(overviewSource, /orbit|Conceptual overview/, "conceptual orbit retired from Dashboard")
await assert.rejects(read("src/components/motion/CampusFloorStack.jsx"), "CampusFloorStack removed")

// Home hero (owner visual refinement): the destination search is Navigate's own
// component, the coverage facts are derived from the canonical data, and the
// decorative graph band is gone.
const stripSource = await read("src/components/home/SmartCampusStrip.jsx")
assert.match(homeSource, /import DestinationSearch from "@\/components\/map\/DestinationSearch"/, "Home reuses the Navigate destination search")
assert.match(homeSource, /getNavigateHref\(\{ facilityId: facility\.id \}\)/, "Home search opens Navigate with ?facility=")
assert.match(stripSource, /from "@\/data\/floors"/)
assert.match(stripSource, /from "@\/data\/facilities"/)
assert.doesNotMatch(stripSource, /(value|label): "\d+"|"\d+ (floors|facilities)/, "coverage figures are derived, not typed in")
assert.doesNotMatch(homeSource, /CampusGraphBackground/, "decorative Home graph band removed")

// 2. 2D viewport math: fit, limits, anchored zoom, focus, resize.
const viewport = { width: 800, height: 560 }
const content = { width: 1000, height: 850 }
const fit = getFitScale({ viewport, content })
close(fit, Math.min((800 - 32) / 1000, (560 - 32) / 850), "fit scale contains the floor")
const fitView = getDefaultView({ viewport, content, mode: "fit" })
close(fitView.scale, fit, "fit view scale")
close(fitView.x + (content.width * fit) / 2, viewport.width / 2, "fit view centered horizontally")
close(fitView.y + (content.height * fit) / 2, viewport.height / 2, "fit view centered vertically")
const fill = getDefaultView({ viewport, content, mode: "fill-width" })
close(fill.scale, Math.max(MAP2D_VIEW.fillWidthMinimum, viewport.width - 32) / content.width, "Navigate default keeps the readable 860px minimum")
const phoneFill = getDefaultView({ viewport: { width: 374, height: 520 }, content, mode: "fill-width" })
close(phoneFill.scale, 0.86, "phone default matches the previous 860px map width")
const limits = getScaleLimits({ viewport, content })
assert.ok(limits.min > 0 && limits.min < fit && limits.max >= MAP2D_VIEW.maxAbsolute, "sane zoom limits")
const anchor = { x: 300, y: 200 }
const zoomed = zoomAt(fitView, 1.5, anchor, { viewport, content })
const before = { x: (anchor.x - fitView.x) / fitView.scale, y: (anchor.y - fitView.y) / fitView.scale }
const after = { x: (anchor.x - zoomed.x) / zoomed.scale, y: (anchor.y - zoomed.y) / zoomed.scale }
close(after.x, before.x, "zoom keeps the pointed map x", 1e-3)
close(after.y, before.y, "zoom keeps the pointed map y", 1e-3)
assert.equal(zoomAt(fitView, 1e6, anchor, { viewport, content }).scale, limits.max, "zoom in is capped")
assert.equal(zoomAt(fitView, 1e-6, anchor, { viewport, content }).scale, limits.min, "zoom out is capped")
const lost = clampView({ scale: 2, x: 99999, y: -99999 }, { viewport, content })
assert.ok(lost.x <= viewport.width - MAP2D_VIEW.edgeMargin && lost.y + content.height * 2 >= MAP2D_VIEW.edgeMargin, "the map cannot be dragged off screen")
const box = getPolygonBox([{ x: 100, y: 100 }, { x: 300, y: 100 }, { x: 300, y: 200 }, { x: 100, y: 200 }])
assert.deepEqual(box.center, { x: 200, y: 150 })
const focused = getFocusView({ view: fitView, box, viewport, content, minimumScale: 1 })
assert.equal(focused.scale, 1)
assert.deepEqual(centerOn({ point: box.center, scale: 1, viewport }), { scale: 1, x: 200, y: 130 })
const resized = resizeView(fitView, viewport, { width: 1200, height: 800 }, content)
close(resized.x - fitView.x, 200, "resize keeps the centered map point (x)")
close(resized.y - fitView.y, 120, "resize keeps the centered map point (y)")
assert.equal(getDefaultView({ viewport: { width: 0, height: 0 }, content }).scale, 1, "unmeasured viewport is safe")

// 3. 3D framing: narrower viewports need a farther camera; wide ones nearer.
const wide = getFitDistance({ radius: 15, fovDeg: 42, aspect: 1.6 })
const portrait = getFitDistance({ radius: 15, fovDeg: 42, aspect: 0.46 })
assert.ok(portrait > wide * 1.5, "portrait fit pulls the camera back")
close(getFitDistance({ radius: 10, fovDeg: 42, aspect: 2, margin: 1 }), 10 / Math.sin((21 * Math.PI) / 180), "wide fit uses the vertical field", 1e-9)

// 4. Links use the existing Navigate parameters only.
assert.equal(getNavigateHref({ floorId: "3F" }), "/map?floor=3F")
assert.equal(getNavigateHref({ facilityId: "library", floorId: "GF" }), "/map?facility=library")
assert.equal(getNavigateHref({ floorId: "9F" }), "/map", "unknown floors fall back to Navigate")
assert.equal(getNavigateHref({ facilityId: "not-a-facility" }), "/map")
for (const floor of floors) assert.equal(getNavigateHref({ floorId: floor.id }), `/map?floor=${encodeURIComponent(floor.id)}`)

// 5. Fullscreen capability: native when the API is enabled, overlay otherwise.
const { canUseNativeFullscreen } = await import("../src/components/map/useMapFullscreen.js")
const element = { requestFullscreen: () => Promise.resolve() }
globalThis.document = /** @type {any} */ ({ fullscreenEnabled: true })
assert.equal(canUseNativeFullscreen(element), true)
globalThis.document = /** @type {any} */ ({ fullscreenEnabled: false })
assert.equal(canUseNativeFullscreen(element), false, "disabled Fullscreen API uses the overlay")
globalThis.document = /** @type {any} */ ({ webkitFullscreenEnabled: true })
assert.equal(canUseNativeFullscreen({ webkitRequestFullscreen: () => {} }), true, "prefixed API is supported")
globalThis.document = /** @type {any} */ ({})
assert.equal(canUseNativeFullscreen(element), false, "no API (e.g. iPhone Safari) uses the overlay")
delete globalThis.document
const fullscreenSource = await read("src/components/map/useMapFullscreen.js")
for (const token of ["fullscreenchange", "fullscreenerror", "exitFullscreen", "mapImmersive"]) assert.ok(fullscreenSource.includes(token), `fullscreen hook handles ${token}`)
const css = await read("src/index.css")
assert.match(css, /html\[data-map-immersive="overlay"\] \.map-immersive \{[^}]*position: fixed !important;[^}]*height: 100dvh !important;/, "overlay fallback fills the dynamic viewport")
assert.match(css, /html\[data-map-immersive\] \.clara-floating-button/, "CLARA trigger steps aside while immersive")

// 6. Rendered integration through the real Vite JSX pipeline.
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
  const render = async (modulePath, entry) => {
    const { default: Page } = await vite.ssrLoadModule(modulePath)
    return renderToString(React.createElement(MemoryRouter, { initialEntries: [entry] }, React.createElement(Page)))
  }
  const homeHtml = await render("/src/pages/Home.jsx", "/")
  assert.match(homeHtml, /Campus at a glance/)
  assert.match(homeHtml, /source-aligned indoor navigation map/, "Home renders the real floor map")
  assert.match(homeHtml, /Library/)
  assert.match(homeHtml, /aria-label="Floor selector"/)
  assert.match(homeHtml, /Open full map/)
  assert.match(homeHtml, /href="\/map\?floor=3F"/, "Open full map carries the viewed floor")
  assert.doesNotMatch(homeHtml, /Five floors, one building|schematic, not to scale/)
  const mappedFacilityCount = facilities.filter((facility) => facility.kind !== "Construction" && facility.mapRoomId).length
  assert.match(homeHtml, /aria-label="CampusNav coverage"/)
  assert.match(homeHtml, new RegExp(`aria-label="${mappedFacilityCount}, facilities on the map"`), "coverage count matches the facility data")
  assert.match(homeHtml, /id="destination-input"/, "Home offers the destination search")

  const dashboardHtml = await render("/src/pages/Dashboard.jsx", "/dashboard")
  assert.match(dashboardHtml, /Campus Overview/)
  assert.match(dashboardHtml, /source-aligned indoor navigation map/, "Dashboard renders the real floor map")
  assert.match(dashboardHtml, /Open Navigate/)
  assert.doesNotMatch(dashboardHtml, /Conceptual overview/)

  const navigateHtml = await render("/src/pages/Map.jsx", "/map")
  for (const label of ["Enter fullscreen map", "Zoom in", "Zoom out", "Fit map to screen", "Reset map view", "Map view"]) assert.match(navigateHtml, new RegExp(label), `Navigate exposes "${label}"`)
  assert.match(navigateHtml, /data-map-viewport="2d"/)
  assert.match(navigateHtml, /touch-action:none/, "Navigate map owns its gestures")
  assert.match(homeHtml, /touch-action:pan-y/, "previews leave vertical page scrolling to the page")
} finally {
  console.error = originalConsoleError
  await vite.close()
}

console.log("Map experience: shared renderer and canonical data, real Home/Dashboard maps, Home search and coverage strip, 2D viewport math, 3D framing, Navigate links, fullscreen capability, and rendered integration: PASS")
