import assert from "node:assert/strict"
import { facilities } from "../src/data/facilities.js"
import { floors, getFloorById } from "../src/data/floors.js"
import { mapEdges } from "../src/data/mapEdges.js"
import { MAP_NODE_TYPES, mapNodes } from "../src/data/mapNodes.js"
import { createCheckpointPayload } from "../src/data/qrCheckpoints.js"
import { FLOOR_TRANSITION_WEIGHT, stairConnections, verticalTransitionEdges } from "../src/data/stairs.js"
import { resolveCheckpointPayload, resolveManualPosition } from "../src/lib/checkpointPositioning.js"
import { pointInPolygon, validateMultiFloorGraph, validateMultiFloorRoute } from "../src/lib/mapValidation.js"
import { calculateFacilityRoute, generateNavigationInstructions, getRouteSegmentForFloor } from "../src/lib/navigation.js"

const facility = (id) => facilities.find((candidate) => candidate.id === id)
const routeBetween = (startId, destinationId, startNodeId = null, edges = mapEdges) => {
  const startFacility = facility(startId)
  const destinationFacility = facility(destinationId)
  return calculateFacilityRoute({ startFacility, destinationFacility, floor: getFloorById(startFacility.floorId), nodes: mapNodes, edges, startNodeId })
}

const graphValidation = validateMultiFloorGraph({ floors, facilities, nodes: mapNodes, edges: mapEdges })
assert.equal(graphValidation.pass, true)
assert.deepEqual(graphValidation.errors, [])
assert.deepEqual(graphValidation.duplicateNodeIds, [])
assert.deepEqual(graphValidation.duplicateEdgeIds, [])
assert.deepEqual(graphValidation.constructionZoneErrors, [])
assert.deepEqual(graphValidation.disconnectedFacilities, [])
assert.equal(graphValidation.verticalConnectionCount, 4)
assert.equal(graphValidation.floorReports.every((report) => report.pass && report.wallCrossingPass), true)

assert.equal(stairConnections.length, 1)
assert.equal(stairConnections[0].id, "STAIR-EAST")
assert.deepEqual(stairConnections[0].connections.map((connection) => connection.floorId), ["GF", "2F", "3F", "4F", "5F"])
assert.equal(stairConnections[0].accessible, null)
assert.equal(verticalTransitionEdges.length, 4)
assert.equal(verticalTransitionEdges.every((edge) => edge.weight === FLOOR_TRANSITION_WEIGHT && edge.accessible === null), true)

const nodeMap = new Map(mapNodes.map((node) => [node.id, node]))
for (const edge of verticalTransitionEdges) {
  const from = nodeMap.get(edge.from)
  const to = nodeMap.get(edge.to)
  assert.equal(from.type, MAP_NODE_TYPES.STAIRS)
  assert.equal(to.type, MAP_NODE_TYPES.STAIRS)
  assert.equal(Math.abs(getFloorById(from.floorId).level - getFloorById(to.floorId).level), 1)
}

const routeCases = [
  { label: "CROSS-FLOOR A", start: "library", destination: "registrar-office", floors: ["3F", "4F", "5F"], floorChanges: 2 },
  { label: "CROSS-FLOOR B", start: "guidance-office", destination: "virtual-laboratory", floors: ["GF", "2F", "3F"], floorChanges: 2 },
  { label: "CROSS-FLOOR C", start: "main-entrance", destination: "registrar-office", floors: ["GF", "2F", "3F", "4F", "5F"], floorChanges: 4 },
]

for (const testCase of routeCases) {
  const route = routeBetween(testCase.start, testCase.destination)
  assert.ok(route, `${testCase.label} must calculate a route`)
  assert.equal(route.floorChanges, testCase.floorChanges)
  assert.deepEqual(route.routeFloorIds, testCase.floors)
  assert.match(route.distance.label, /schematic route-cost units/)
  assert.equal(route.distance.totalDistanceMeters, null)

  const validation = validateMultiFloorRoute({ route, startFacilityId: testCase.start, destinationFacilityId: testCase.destination, floors, nodes: mapNodes, edges: mapEdges })
  assert.equal(validation.pass, true)
  assert.deepEqual(validation.errors, [])

  const constructionRooms = getFloorById("5F").map.rooms.filter((room) => room.status === "UNDER_CONSTRUCTION")
  assert.equal(route.nodes.some((node) => node.floorId === "5F" && constructionRooms.some((room) => pointInPolygon(node, room.polygon, false))), false)

  testCase.floors.forEach((floorId) => {
    const segment = getRouteSegmentForFloor(route, floorId)
    assert.equal(segment.nodes.every((node) => node.floorId === floorId), true)
    assert.equal(segment.edges.every((edge) => edge.floorId === floorId && edge.type !== "FLOOR_TRANSITION"), true)
  })

  const instructions = generateNavigationInstructions({ route, startFacility: facility(testCase.start), destinationFacility: facility(testCase.destination), floor: getFloorById(facility(testCase.start).floorId) })
  assert.equal(instructions[0].type, "start")
  assert.equal(instructions.at(-1).type, "arrive")
  assert.equal(instructions.filter((instruction) => instruction.type === "floor-change").length, testCase.floorChanges)
  assert.match(instructions.map((instruction) => instruction.text).join(" "), /East Stair/)

  console.log(`${testCase.label}: ${facility(testCase.start).name} → ${facility(testCase.destination).name}`)
  console.log(`  floors ${route.routeFloorIds.join(" → ")}; ${route.distance.label}; floor changes: ${route.floorChanges}; validation: PASS`)
}

const qrLibrary = resolveCheckpointPayload(createCheckpointPayload("QR-3F-LIBRARY"))
const qrToRegistrar = routeBetween(qrLibrary.location.currentFacilityId, "registrar-office", qrLibrary.location.currentNodeId)
assert.ok(qrToRegistrar)
assert.equal(qrToRegistrar.nodeIds[0], "entrance-library-west")
assert.equal(qrToRegistrar.floorChanges, 2)

for (const floor of floors) {
  const manualFacility = facilities.find((candidate) => candidate.floorId === floor.id && candidate.navigable !== false)
  const resolution = resolveManualPosition({ floorId: floor.id, facilityId: manualFacility.id })
  assert.equal(resolution.ok, true)
  assert.equal(resolution.location.currentFloorId, floor.id)
  assert.ok(resolution.location.currentNodeId)
}
assert.equal(resolveManualPosition({ floorId: "5F", facilityId: "areas-under-construction" }).ok, false)

const blockedVerticalEdges = mapEdges.map((edge) => edge.id === "stairs-4f-east--stairs-5f-east" ? { ...edge, blocked: true } : edge)
assert.equal(routeBetween("library", "registrar-office", null, blockedVerticalEdges), null)
const restrictedVerticalEdges = mapEdges.map((edge) => edge.id === "stairs-4f-east--stairs-5f-east" ? { ...edge, status: "RESTRICTED" } : edge)
assert.equal(routeBetween("library", "registrar-office", null, restrictedVerticalEdges), null)

const impossibleJump = { ...verticalTransitionEdges[0], id: "invalid-2f--5f-jump", from: "stairs-2f-east", to: "stairs-5f-east" }
const invalidJumpReport = validateMultiFloorGraph({ floors, facilities, nodes: mapNodes, edges: [...mapEdges, impossibleJump] })
assert.equal(invalidJumpReport.pass, false)
assert.match(invalidJumpReport.errors.join(" "), /impossible floor jump/)

const duplicateNodeReport = validateMultiFloorGraph({ floors, facilities, nodes: [...mapNodes, { ...mapNodes[0] }], edges: mapEdges })
assert.deepEqual(duplicateNodeReport.duplicateNodeIds, [mapNodes[0].id])
const duplicateEdgeReport = validateMultiFloorGraph({ floors, facilities, nodes: mapNodes, edges: [...mapEdges, { ...mapEdges[0] }] })
assert.deepEqual(duplicateEdgeReport.duplicateEdgeIds, [mapEdges[0].id])
const danglingEdgeReport = validateMultiFloorGraph({ floors, facilities, nodes: mapNodes, edges: [...mapEdges, { id: "dangling-test", floorId: "GF", from: "missing", to: "stairs-gf-east" }] })
assert.match(danglingEdgeReport.errors.join(" "), /dangling/)

const invalidFloorNodeReport = validateMultiFloorGraph({ floors, facilities, nodes: [...mapNodes, { id: "invalid-floor-node", floorId: "9F", type: MAP_NODE_TYPES.HALLWAY, x: 0, y: 0 }], edges: mapEdges })
assert.match(invalidFloorNodeReport.errors.join(" "), /invalid floor 9F/)

const wrongFloorEntranceNodes = mapNodes.map((node) => node.id === "entrance-library-west" ? { ...node, floorId: "4F" } : node)
const wrongFloorEntranceReport = validateMultiFloorGraph({ floors, facilities, nodes: wrongFloorEntranceNodes, edges: mapEdges })
assert.match(wrongFloorEntranceReport.errors.join(" "), /belongs to the wrong floor/)

const invalidStairTransition = { ...verticalTransitionEdges[0], id: "invalid-nonstair-transition", from: "hall-gf-guidance-office", to: "stairs-2f-east" }
const invalidStairReport = validateMultiFloorGraph({ floors, facilities, nodes: mapNodes, edges: [...mapEdges, invalidStairTransition] })
assert.match(invalidStairReport.errors.join(" "), /must connect stair nodes/)

const constructionNodes = [
  ...mapNodes,
  { id: "construction-test-a", floorId: "5F", type: MAP_NODE_TYPES.HALLWAY, x: 40, y: 40 },
  { id: "construction-test-b", floorId: "5F", type: MAP_NODE_TYPES.HALLWAY, x: 140, y: 40 },
]
const constructionEdge = { id: "construction-test-edge", floorId: "5F", from: "construction-test-a", to: "construction-test-b", type: "WALKWAY", walkable: true, blocked: false }
const constructionReport = validateMultiFloorGraph({ floors, facilities, nodes: constructionNodes, edges: [...mapEdges, constructionEdge] })
assert.ok(constructionReport.constructionZoneErrors.length > 0)

const disconnectedNodes = mapNodes.filter((node) => node.facilityId !== "guidance-office")
const disconnectedNodeIds = new Set(disconnectedNodes.map((node) => node.id))
const disconnectedEdges = mapEdges.filter((edge) => disconnectedNodeIds.has(edge.from) && disconnectedNodeIds.has(edge.to))
const disconnectedReport = validateMultiFloorGraph({ floors, facilities, nodes: disconnectedNodes, edges: disconnectedEdges })
assert.ok(disconnectedReport.disconnectedFacilities.includes("guidance-office"))

console.log("Multi-floor graph integrity, stair transitions, manual positioning, QR compatibility, blocked transitions, and construction-zone exclusion: PASS")
