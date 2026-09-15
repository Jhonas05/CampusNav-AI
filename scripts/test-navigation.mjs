import assert from "node:assert/strict"
import { facilities } from "../src/data/facilities.js"
import { floors } from "../src/data/floors.js"
import { mapEdges } from "../src/data/mapEdges.js"
import { DISTANCE_STATUS } from "../src/data/mapStandards.js"
import { MAP_NODE_TYPES, getFacilityEntranceNodes, mapNodes } from "../src/data/mapNodes.js"
import { buildMapVerificationReport, validateCalculatedRoute, validateFloorGraph } from "../src/lib/mapValidation.js"
import { advanceNavigationProgress, calculateFacilityRoute, generateNavigationInstructions } from "../src/lib/navigation.js"

const thirdFloor = floors.find((floor) => floor.id === "3F")
const floorFacilities = facilities.filter((facility) => facility.floorId === "3F")
const floorNodes = mapNodes.filter((node) => node.floorId === "3F")
const floorEdges = mapEdges.filter((edge) => edge.floorId === "3F")
const nodeMap = new Map(floorNodes.map((node) => [node.id, node]))
const edgeMap = new Map(floorEdges.map((edge) => [edge.id, edge]))

const graphValidation = validateFloorGraph({ floor: thirdFloor, nodes: floorNodes, edges: floorEdges })
assert.deepEqual(graphValidation.invalidNodeErrors, [])
assert.deepEqual(graphValidation.invalidEdgeErrors, [])
assert.deepEqual(graphValidation.entranceErrors, [])
assert.deepEqual(graphValidation.walkingSurfaceErrors, [])
assert.deepEqual(graphValidation.wallCrossingErrors, [])
assert.equal(graphValidation.pass, true)

for (const edge of floorEdges) {
  assert.equal(edge.walkable, true, `${edge.id} must be walkable`)
  assert.equal(edge.blocked, false, `${edge.id} must be open in the source-aligned graph`)
  assert.ok(nodeMap.has(edge.from) && nodeMap.has(edge.to), `${edge.id} must reference existing nodes`)
}

const testCases = [
  {
    label: "TEST A",
    startId: "library",
    destinationId: "virtual-laboratory",
    expectedStartEntrance: "entrance-library-west",
    expectedDestinationEntrance: "entrance-virtual-laboratory",
  },
  {
    label: "TEST B",
    startId: "library",
    destinationId: "computer-laboratory",
    expectedStartEntrance: "entrance-library-west",
    expectedDestinationEntrance: "entrance-computer-laboratory-east",
  },
  {
    label: "TEST C",
    startId: "room-43",
    destinationId: "virtual-laboratory",
    expectedStartEntrance: "entrance-room-43",
    expectedDestinationEntrance: "entrance-virtual-laboratory",
  },
]

for (const testCase of testCases) {
  const startFacility = floorFacilities.find((facility) => facility.id === testCase.startId)
  const destinationFacility = floorFacilities.find((facility) => facility.id === testCase.destinationId)
  assert.ok(startFacility && destinationFacility, `${testCase.label} facilities must exist`)
  assert.ok(getFacilityEntranceNodes(startFacility.id, "3F").length > 0)
  assert.ok(getFacilityEntranceNodes(destinationFacility.id, "3F").length > 0)

  const route = calculateFacilityRoute({ startFacility, destinationFacility, floor: thirdFloor, nodes: floorNodes, edges: floorEdges })
  assert.ok(route, `${testCase.label} must produce a route`)
  assert.equal(route.startEntranceNodeId, testCase.expectedStartEntrance)
  assert.equal(route.destinationEntranceNodeId, testCase.expectedDestinationEntrance)
  assert.equal(route.nodeIds[0], testCase.expectedStartEntrance)
  assert.equal(route.nodeIds.at(-1), testCase.expectedDestinationEntrance)
  assert.equal(route.edgeIds.length, route.nodeIds.length - 1)
  assert.equal(route.floorChanges, 0)
  assert.equal(route.distance.status, DISTANCE_STATUS.SCHEMATIC)
  assert.equal(route.distance.totalDistanceMeters, null)
  assert.match(route.distance.label, /map units \/ schematic distance/)
  assert.equal(route.nodes.some((node) => node.type === MAP_NODE_TYPES.STAIRS), false)

  route.edgeIds.forEach((edgeId) => assert.ok(edgeMap.has(edgeId), `${edgeId} must exist`))
  const validation = validateCalculatedRoute({ route, startFacilityId: startFacility.id, destinationFacilityId: destinationFacility.id, nodes: floorNodes, edges: floorEdges, floor: thirdFloor })
  assert.deepEqual(validation.errors, [])
  assert.equal(validation.pass, true)

  const instructions = generateNavigationInstructions({ route, startFacility, destinationFacility, floor: thirdFloor })
  assert.equal(instructions[0].type, "start")
  assert.equal(instructions.at(-1).type, "arrive")
  assert.match(instructions.at(-1).text, new RegExp(destinationFacility.name))
  assert.match(instructions.map((instruction) => instruction.text).join(" "), /schematic distance/)

  let progress = { status: "active", activeStep: 0 }
  for (let index = 0; index < instructions.length; index += 1) {
    progress = advanceNavigationProgress({ ...progress, totalSteps: instructions.length })
  }
  assert.equal(progress.status, "arrived")
  assert.equal(progress.activeStep, instructions.length - 1)

  console.log(`${testCase.label}: ${startFacility.name} → ${destinationFacility.name}`)
  console.log(`  ${route.nodeIds.join(" → ")}`)
  console.log(`  ${route.distance.label}; floor changes: ${route.floorChanges}; validation: PASS`)
}

const blockedEdgeId = "hall-library-west--hall-computer-east"
const blockedEdges = floorEdges.map((edge) => edge.id === blockedEdgeId ? { ...edge, blocked: true } : edge)
const blockedRoute = calculateFacilityRoute({
  startFacility: floorFacilities.find((facility) => facility.id === "library"),
  destinationFacility: floorFacilities.find((facility) => facility.id === "computer-laboratory"),
  floor: thirdFloor,
  nodes: floorNodes,
  edges: blockedEdges,
})
assert.ok(blockedRoute, "A valid alternative route should remain when one hallway edge is blocked")
assert.equal(blockedRoute.edgeIds.includes(blockedEdgeId), false, "A* must ignore blocked edges")

const report = buildMapVerificationReport({ floor: thirdFloor, facilities, nodes: floorNodes, edges: floorEdges })
assert.equal(report.routeValidationPass, true)
assert.equal(report.wallCrossingPass, true)
assert.equal(report.routeResults.length, 3)
assert.equal(report.routeResults.every((result) => result.validation.pass), true)
assert.equal(report.nodeCount, 43)
assert.equal(report.edgeCount, 41)
assert.equal(report.calibratedFacilities, 15)
assert.equal(report.pendingItems, 3)

console.log(`Graph: ${floorNodes.length} nodes, ${floorEdges.length} edges; wall crossing: PASS; blocked-edge handling: PASS`)
