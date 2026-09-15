import assert from "node:assert/strict"
import { NO_VERIFIED_ROUTE_MESSAGE } from "../src/data/emergencyContacts.js"
import { emergencyExits } from "../src/data/emergencyExits.js"
import { emergencyApprovedEdges } from "../src/data/emergencyRoutes.js"
import { floors } from "../src/data/floors.js"
import { mapNodes } from "../src/data/mapNodes.js"
import { VERIFICATION_STATUS } from "../src/data/mapStandards.js"
import {
  findNearestVerifiedExit,
  isEmergencyEdgeEligible,
  validateEmergencyData,
  validateEmergencyRoute,
} from "../src/lib/emergencyNavigation.js"

const nodeMap = new Map(mapNodes.map((node) => [node.id, node]))

for (const exit of emergencyExits) {
  assert.ok(nodeMap.has(exit.nodeId), `${exit.id} must reference a valid node`)
  assert.equal(nodeMap.get(exit.nodeId).floorId, exit.floorId, `${exit.id} must reference a node on ${exit.floorId}`)
}

for (const edge of emergencyApprovedEdges) {
  assert.ok(nodeMap.has(edge.from), `${edge.id} must reference a valid from node`)
  assert.ok(nodeMap.has(edge.to), `${edge.id} must reference a valid to node`)
  assert.equal(edge.emergencyApproved, true)
  assert.equal(isEmergencyEdgeEligible(edge), true)
}

const graphValidation = validateEmergencyData({ floors, nodes: mapNodes })
assert.equal(graphValidation.pass, true)
assert.deepEqual(graphValidation.errors, [])
assert.deepEqual(graphValidation.blockedAreaErrors, [])
assert.deepEqual(graphValidation.disconnectedExitIds, ["emergency-exit-gf-southwest"])

const libraryRoute = findNearestVerifiedExit({
  currentNodeId: "entrance-library-west",
  currentFloorId: "3F",
  nodes: mapNodes,
  floors,
})
assert.equal(libraryRoute.ok, true)
assert.equal(libraryRoute.exit.id, "emergency-exit-3f-east")
assert.equal(libraryRoute.route.edgeIds.every((edgeId) => emergencyApprovedEdges.some((edge) => edge.id === edgeId && isEmergencyEdgeEligible(edge))), true)
assert.equal(validateEmergencyRoute({ route: libraryRoute.route, edges: emergencyApprovedEdges, floors }).pass, true)

const guidanceRoute = findNearestVerifiedExit({
  currentNodeId: "entrance-gf-guidance-office",
  currentFloorId: "GF",
  nodes: mapNodes,
  floors,
})
assert.equal(guidanceRoute.ok, true)
assert.equal(guidanceRoute.exit.id, "emergency-exit-gf-driveway")
assert.equal(validateEmergencyRoute({ route: guidanceRoute.route, edges: emergencyApprovedEdges, floors }).pass, true)

const normalOnlyShortcut = {
  id: "normal-only-shortcut",
  floorId: "3F",
  from: "entrance-library-west",
  to: "exit-southwest",
  walkable: true,
  blocked: false,
  verificationStatus: VERIFICATION_STATUS.VERIFIED,
  emergencyApproved: false,
  weight: 0.1,
}
const routeWithNormalShortcut = findNearestVerifiedExit({
  currentNodeId: "entrance-library-west",
  currentFloorId: "3F",
  nodes: mapNodes,
  floors,
  edges: [...emergencyApprovedEdges, normalOnlyShortcut],
})
assert.equal(routeWithNormalShortcut.ok, true)
assert.equal(routeWithNormalShortcut.route.edgeIds.includes(normalOnlyShortcut.id), false)

const fixtureNodes = [
  { id: "start", floorId: "GF", type: "HALLWAY", x: 0, y: 0 },
  { id: "detour", floorId: "GF", type: "HALLWAY", x: 0, y: 50 },
  { id: "near-exit", floorId: "GF", type: "EXIT", x: 1, y: 0 },
  { id: "far-exit", floorId: "GF", type: "EXIT", x: 10, y: 0 },
]
const approvedFixtureEdge = (id, from, to, weight, extra = {}) => ({
  id,
  floorId: "GF",
  from,
  to,
  weight,
  bidirectional: true,
  walkable: true,
  blocked: false,
  emergencyApproved: true,
  verificationStatus: VERIFICATION_STATUS.VERIFIED,
  ...extra,
})
const fixtureEdges = [
  approvedFixtureEdge("start-detour", "start", "detour", 50),
  approvedFixtureEdge("detour-near", "detour", "near-exit", 50),
  approvedFixtureEdge("start-far", "start", "far-exit", 10),
]
const fixtureExits = [
  { id: "near", floorId: "GF", nodeId: "near-exit", active: true, verificationStatus: VERIFICATION_STATUS.VERIFIED },
  { id: "far", floorId: "GF", nodeId: "far-exit", active: true, verificationStatus: VERIFICATION_STATUS.VERIFIED },
]

const routeCostSelection = findNearestVerifiedExit({ currentNodeId: "start", currentFloorId: "GF", nodes: fixtureNodes, edges: fixtureEdges, exits: fixtureExits })
assert.equal(routeCostSelection.ok, true)
assert.equal(routeCostSelection.exit.id, "far", "nearest exit must use approved route cost, not Euclidean distance")

const blockedResult = findNearestVerifiedExit({
  currentNodeId: "start",
  currentFloorId: "GF",
  nodes: fixtureNodes,
  edges: [approvedFixtureEdge("blocked", "start", "far-exit", 1, { blocked: true })],
  exits: [fixtureExits[1]],
})
assert.equal(blockedResult.ok, false)
assert.equal(blockedResult.message, NO_VERIFIED_ROUTE_MESSAGE)

const unverifiedResult = findNearestVerifiedExit({
  currentNodeId: "start",
  currentFloorId: "GF",
  nodes: fixtureNodes,
  edges: [approvedFixtureEdge("unverified", "start", "far-exit", 1, { verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION })],
  exits: [fixtureExits[1]],
})
assert.equal(unverifiedResult.ok, false)

const inactiveExitResult = findNearestVerifiedExit({
  currentNodeId: "start",
  currentFloorId: "GF",
  nodes: fixtureNodes,
  edges: [approvedFixtureEdge("active-edge", "start", "far-exit", 1)],
  exits: [{ ...fixtureExits[1], active: false }],
})
assert.equal(inactiveExitResult.ok, false)

const constructionFloor = {
  id: "GF",
  map: {
    rooms: [{ id: "construction-zone", navigable: false, status: "UNDER_CONSTRUCTION", polygon: [{ x: 4, y: -2 }, { x: 6, y: -2 }, { x: 6, y: 2 }, { x: 4, y: 2 }] }],
  },
}
const constructionResult = findNearestVerifiedExit({
  currentNodeId: "start",
  currentFloorId: "GF",
  nodes: fixtureNodes,
  floors: [constructionFloor],
  edges: [approvedFixtureEdge("through-construction", "start", "far-exit", 1)],
  exits: [fixtureExits[1]],
})
assert.equal(constructionResult.ok, false)
const constructionValidation = validateEmergencyData({ floors: [constructionFloor], nodes: fixtureNodes, edges: [approvedFixtureEdge("through-construction", "start", "far-exit", 1)], exits: fixtureExits })
assert.equal(constructionValidation.pass, false)
assert.ok(constructionValidation.blockedAreaErrors.length > 0)

const noRoute = findNearestVerifiedExit({
  currentNodeId: "entrance-5f-registrar-office",
  currentFloorId: "5F",
  nodes: mapNodes,
  floors,
})
assert.equal(noRoute.ok, false)
assert.equal(noRoute.reason, "NO_VERIFIED_ROUTE")
assert.equal(noRoute.message, NO_VERIFIED_ROUTE_MESSAGE)

console.log(`Emergency graph: ${emergencyExits.length} exits, ${emergencyApprovedEdges.length} approved edges, validation PASS`)
console.log(`Library 3F -> ${libraryRoute.exit.label}: ${libraryRoute.route.distance.label}; approved-only route PASS`)
console.log(`Guidance GF -> ${guidanceRoute.exit.label}: ${guidanceRoute.route.distance.label}; approved-only route PASS`)
console.log("Blocked, construction, inactive-exit, unverified-edge, normal-only edge, route-cost selection, and no-route fallback tests: PASS")
