import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { facilities } from "../src/data/facilities.js"
import { floors, getFloorById } from "../src/data/floors.js"
import { mapEdges } from "../src/data/mapEdges.js"
import { MAP_NODE_TYPES, mapNodes } from "../src/data/mapNodes.js"
import { VERIFICATION_STATUS } from "../src/data/mapStandards.js"
import { createCheckpointPayload } from "../src/data/qrCheckpoints.js"
import { resolveCheckpointPayload, resolveManualPosition } from "../src/lib/checkpointPositioning.js"
import { findNearestVerifiedExit } from "../src/lib/emergencyNavigation.js"
import {
  calculateFacilityRoute,
  calculateFacilityRouteWithOptions,
} from "../src/lib/navigation.js"
import { routeNodesToWorld } from "../src/lib/map3d.js"
import { findShortestPath } from "../src/lib/pathfinding.js"
import {
  AVOID_STAIRS_NO_FALLBACK_GUIDANCE,
  AVOID_STAIRS_NO_ROUTE_MESSAGE,
  createRouteEdgeEligibility,
  INVALID_ROUTE_PREFERENCE_MESSAGE,
  isRouteEdgeEligibleForPreference,
  ROUTE_PREFERENCE,
  ROUTE_PREFERENCE_FAILURE,
} from "../src/lib/routePreferences.js"

const facility = (id) => facilities.find((item) => item.id === id)
const routeInput = (startId, destinationId, extra = {}) => ({
  startFacility: facility(startId),
  destinationFacility: facility(destinationId),
  floor: getFloorById(facility(startId).floorId),
  nodes: mapNodes,
  edges: mapEdges,
  ...extra,
})
const optionsFor = (preference) => ({ routeOptions: { preference } })
const avoidStairsEligibility = createRouteEdgeEligibility(ROUTE_PREFERENCE.AVOID_STAIRS)
const standardEligibility = createRouteEdgeEligibility(ROUTE_PREFERENCE.STANDARD)
const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url))
const sourceText = (...paths) => paths
  .map((path) => readFileSync(`${sourceRoot}${path}`, "utf8"))
  .join("\n")

let passed = 0
const check = (label, assertion) => {
  assertion()
  passed += 1
  console.log(`${passed}. ${label}: PASS`)
}

const legacyCrossFloor = calculateFacilityRoute(routeInput("library", "registrar-office"))
const explicitStandard = calculateFacilityRouteWithOptions({
  ...routeInput("library", "registrar-office"),
  ...optionsFor(ROUTE_PREFERENCE.STANDARD),
})

check("Existing STANDARD routes remain unchanged", () => {
  assert.equal(explicitStandard.ok, true)
  assert.equal(explicitStandard.preference, ROUTE_PREFERENCE.STANDARD)
  assert.deepEqual(explicitStandard.route, legacyCrossFloor)
})

const sameFloorAvoidStairs = calculateFacilityRouteWithOptions({
  ...routeInput("library", "virtual-laboratory"),
  ...optionsFor(ROUTE_PREFERENCE.AVOID_STAIRS),
})

check("Same-floor AVOID_STAIRS can succeed when eligible", () => {
  assert.equal(sameFloorAvoidStairs.ok, true)
  assert.equal(sameFloorAvoidStairs.route.floorChanges, 0)
  assert.equal(sameFloorAvoidStairs.route.edges.some((edge) => edge.stairs === true), false)

  const landingNodes = [
    { id: "start", floorId: "3F", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 0, y: 0 },
    { id: "landing", floorId: "3F", type: MAP_NODE_TYPES.STAIRS, x: 1, y: 0 },
    { id: "destination", floorId: "3F", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 2, y: 0 },
  ]
  const landingEdges = [
    { id: "approach", floorId: "3F", from: "start", to: "landing", type: "WALKWAY", weight: 1 },
    { id: "departure", floorId: "3F", from: "landing", to: "destination", type: "WALKWAY", weight: 1 },
  ]
  const landingRoute = findShortestPath({
    nodes: landingNodes,
    edges: landingEdges,
    startNodeId: "start",
    destinationNodeId: "destination",
    edgeEligibility: avoidStairsEligibility,
  })
  assert.deepEqual(landingRoute.nodeIds, ["start", "landing", "destination"])
})

const crossFloorAvoidStairs = calculateFacilityRouteWithOptions({
  ...routeInput("library", "registrar-office"),
  ...optionsFor(ROUTE_PREFERENCE.AVOID_STAIRS),
})

check("Cross-floor AVOID_STAIRS fails safely on the current graph", () => {
  assert.equal(legacyCrossFloor.floorChanges, 2)
  assert.equal(crossFloorAvoidStairs.ok, false)
  assert.equal(crossFloorAvoidStairs.code, ROUTE_PREFERENCE_FAILURE.NO_AVOID_STAIRS_ROUTE)
  assert.equal(crossFloorAvoidStairs.message, AVOID_STAIRS_NO_ROUTE_MESSAGE)
})

check("Stair edges are excluded", () => {
  const stairEdges = mapEdges.filter((edge) => edge.stairs === true)
  assert.ok(stairEdges.length > 0)
  assert.equal(
    stairEdges.every((edge) => !isRouteEdgeEligibleForPreference(edge, ROUTE_PREFERENCE.AVOID_STAIRS)),
    true,
  )
  assert.equal(stairEdges.every((edge) => standardEligibility(edge)), true)
})

check("Unknown cross-floor connectors cannot bypass eligibility", () => {
  const nodes = [
    { id: "gf", floorId: "GF", x: 0, y: 0 },
    { id: "2f", floorId: "2F", x: 0, y: 0 },
  ]
  const unknownConnector = {
    id: "unknown-connector",
    from: "gf",
    to: "2f",
    type: "FLOOR_TRANSITION",
    floorChange: 1,
    weight: 10,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
  }
  assert.equal(findShortestPath({
    nodes,
    edges: [unknownConnector],
    startNodeId: "gf",
    destinationNodeId: "2f",
    edgeEligibility: avoidStairsEligibility,
  }), null)
})

check("Blocked, restricted, and construction checks remain effective", () => {
  const nodes = [
    { id: "start", floorId: "GF", x: 0, y: 0 },
    { id: "detour", floorId: "GF", x: 0, y: 2 },
    { id: "destination", floorId: "GF", x: 2, y: 0 },
  ]
  const detourEdges = [
    { id: "start-detour", floorId: "GF", from: "start", to: "detour", weight: 2 },
    { id: "detour-destination", floorId: "GF", from: "detour", to: "destination", weight: 2 },
  ]
  for (const restriction of [
    { blocked: true },
    { restricted: true },
    { status: "UNDER_CONSTRUCTION" },
  ]) {
    const route = findShortestPath({
      nodes,
      edges: [
        { id: "direct", floorId: "GF", from: "start", to: "destination", weight: 1, ...restriction },
        ...detourEdges,
      ],
      startNodeId: "start",
      destinationNodeId: "destination",
      edgeEligibility: avoidStairsEligibility,
    })
    assert.deepEqual(route.edgeIds, ["start-detour", "detour-destination"])
  }
})

check("AVOID_STAIRS never silently falls back to STANDARD", () => {
  assert.equal(explicitStandard.ok, true)
  assert.equal(explicitStandard.route.edges.some((edge) => edge.stairs === true), true)
  assert.equal(crossFloorAvoidStairs.route, null)
  assert.equal(crossFloorAvoidStairs.guidance, AVOID_STAIRS_NO_FALLBACK_GUIDANCE)
})

check("Invalid route preferences fail safely", () => {
  const invalid = calculateFacilityRouteWithOptions({
    ...routeInput("library", "virtual-laboratory"),
    routeOptions: { preference: "UNSUPPORTED" },
  })
  assert.deepEqual(invalid, {
    ok: false,
    code: ROUTE_PREFERENCE_FAILURE.INVALID_PREFERENCE,
    preference: null,
    message: INVALID_ROUTE_PREFERENCE_MESSAGE,
    route: null,
  })
})

check("Route preference evaluation does not mutate the graph", () => {
  const nodeSnapshot = structuredClone(mapNodes)
  const edgeSnapshot = structuredClone(mapEdges)
  calculateFacilityRouteWithOptions({
    ...routeInput("main-entrance", "registrar-office"),
    ...optionsFor(ROUTE_PREFERENCE.AVOID_STAIRS),
  })
  assert.deepEqual(mapNodes, nodeSnapshot)
  assert.deepEqual(mapEdges, edgeSnapshot)
})

check("Facility entrance selection remains deterministic", () => {
  const legacy = calculateFacilityRoute(routeInput("library", "virtual-laboratory"))
  assert.equal(sameFloorAvoidStairs.route.startEntranceNodeId, legacy.startEntranceNodeId)
  assert.equal(sameFloorAvoidStairs.route.destinationEntranceNodeId, legacy.destinationEntranceNodeId)
  assert.equal(explicitStandard.route.startEntranceNodeId, legacyCrossFloor.startEntranceNodeId)
  assert.equal(explicitStandard.route.destinationEntranceNodeId, legacyCrossFloor.destinationEntranceNodeId)
})

check("2D and 3D consume the same canonical result", () => {
  const worldNodeIds = routeNodesToWorld({
    route: sameFloorAvoidStairs.route,
    floors,
  }).map((point) => point.nodeId)
  assert.deepEqual(worldNodeIds, sameFloorAvoidStairs.route.nodeIds)
})

check("Emergency routing remains isolated", () => {
  const emergencyBefore = findNearestVerifiedExit({
    currentNodeId: "entrance-library-west",
    currentFloorId: "3F",
    nodes: mapNodes,
    floors,
  })
  calculateFacilityRouteWithOptions({
    ...routeInput("library", "registrar-office"),
    ...optionsFor(ROUTE_PREFERENCE.AVOID_STAIRS),
  })
  const emergencyAfter = findNearestVerifiedExit({
    currentNodeId: "entrance-library-west",
    currentFloorId: "3F",
    nodes: mapNodes,
    floors,
  })
  assert.deepEqual(emergencyAfter, emergencyBefore)
  assert.doesNotMatch(sourceText("lib/emergencyNavigation.js"), /routePreferences/)
})

check("QR and manual positioning semantics remain unchanged", () => {
  const qr = resolveCheckpointPayload(createCheckpointPayload("QR-3F-LIBRARY"))
  const manual = resolveManualPosition({ floorId: "3F", facilityId: "library" })
  assert.equal(qr.ok, true)
  assert.equal(manual.ok, true)
  const qrResult = calculateFacilityRouteWithOptions({
    ...routeInput("library", "registrar-office", { startNodeId: qr.location.currentNodeId }),
    ...optionsFor(ROUTE_PREFERENCE.STANDARD),
  })
  const manualResult = calculateFacilityRouteWithOptions({
    ...routeInput("library", "registrar-office", { startNodeId: manual.location.currentNodeId }),
    ...optionsFor(ROUTE_PREFERENCE.STANDARD),
  })
  assert.equal(qrResult.ok, true)
  assert.equal(manualResult.ok, true)
  assert.deepEqual(qrResult.route.nodeIds, manualResult.route.nodeIds)
})

const routeOptionSources = sourceText(
  "lib/routePreferences.js",
  "lib/pathfinding.js",
  "lib/navigation.js",
)

check("The route-options engine remains offline compatible", () => {
  assert.doesNotMatch(routeOptionSources, /\bfetch\s*\(|\bXMLHttpRequest\b|https?:\/\//)
  assert.doesNotMatch(routeOptionSources, /\blocalStorage\b|\bsessionStorage\b/)
  assert.equal(sameFloorAvoidStairs.ok, true)
})

check("No STEP_FREE accessibility option or claim is introduced", () => {
  assert.deepEqual(Object.keys(ROUTE_PREFERENCE), ["STANDARD", "AVOID_STAIRS"])
  assert.equal(Object.hasOwn(ROUTE_PREFERENCE, "STEP_FREE"), false)
  assert.doesNotMatch(routeOptionSources, /STEP_FREE|wheelchair/i)
})

check("No crowd inference is introduced", () => {
  assert.doesNotMatch(routeOptionSources, /crowd/i)
})

check("No database or provider dependency is introduced", () => {
  assert.doesNotMatch(routeOptionSources, /supabase|provider|database|postgres/i)
})

assert.equal(passed, 17)
console.log(`${passed}/17 mobility route-option checks passed.`)
