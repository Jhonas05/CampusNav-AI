import assert from "node:assert/strict"
import { emergencyApprovedEdges } from "../src/data/emergencyRoutes.js"
import { facilities } from "../src/data/facilities.js"
import { floors, getFloorById } from "../src/data/floors.js"
import { MAP3D_CONFIG, MAP3D_VIEW_MODES } from "../src/data/map3dConfig.js"
import { mapEdges } from "../src/data/mapEdges.js"
import { getFacilityEntranceNode, mapNodes } from "../src/data/mapNodes.js"
import { createCheckpointPayload } from "../src/data/qrCheckpoints.js"
import { resolveCheckpointPayload, resolveManualPosition } from "../src/lib/checkpointPositioning.js"
import { findNearestVerifiedExit } from "../src/lib/emergencyNavigation.js"
import { calculateFacilityRoute } from "../src/lib/navigation.js"
import { getFloorElevation, getRoom3DState, isEmergencyRouteRenderable, mapToWorld, polygonToWorld, routeNodesToWorld, routeToWorldSegments } from "../src/lib/map3d.js"
import { pointInPolygon } from "../src/lib/mapValidation.js"
import { supportsWebGL } from "../src/lib/webgl.js"

const facility = (id) => facilities.find((item) => item.id === id)
const routeBetween = (startId, destinationId, startNodeId = null) => calculateFacilityRoute({
  startFacility: facility(startId),
  destinationFacility: facility(destinationId),
  floor: getFloorById(facility(startId).floorId),
  nodes: mapNodes,
  edges: mapEdges,
  startNodeId,
})

for (const mode of Object.values(MAP3D_VIEW_MODES)) {
  const elevations = floors.map((floor) => getFloorElevation(floor.id, floors, mode))
  assert.equal(elevations.every((value, index) => index === 0 || value > elevations[index - 1]), true)
}
assert.ok(getFloorElevation("5F", floors, MAP3D_VIEW_MODES.EXPLODED) > getFloorElevation("5F", floors, MAP3D_VIEW_MODES.STACKED))
assert.equal(MAP3D_CONFIG.verticalDimensionStatus, "ESTIMATED")

const thirdFloor = getFloorById("3F")
const center = mapToWorld({ x: thirdFloor.map.width / 2, y: thirdFloor.map.height / 2, floorId: "3F", floors })
assert.equal(center.x, 0)
assert.equal(center.z, 0)
assert.equal(center.y, getFloorElevation("3F", floors))

const sameFloorRoute = routeBetween("library", "virtual-laboratory")
assert.ok(sameFloorRoute)
const sameFloorSnapshot = structuredClone(sameFloorRoute)
const sameFloorPoints = routeNodesToWorld({ route: sameFloorRoute, floors, viewMode: MAP3D_VIEW_MODES.EXPLODED })
assert.deepEqual(sameFloorRoute, sameFloorSnapshot, "3D conversion must not mutate the shared A* route state")
assert.equal(sameFloorPoints.length, sameFloorRoute.nodes.length)
assert.equal(new Set(sameFloorPoints.map((point) => point.floorId)).size, 1)
assert.equal(new Set(sameFloorPoints.map((point) => point.y)).size, 1)
assert.equal(sameFloorPoints[0].nodeId, sameFloorRoute.startEntranceNodeId)
assert.equal(sameFloorPoints.at(-1).nodeId, sameFloorRoute.destinationEntranceNodeId)
assert.equal(sameFloorRoute.floorChanges, 0)

const libraryToRegistrar = routeBetween("library", "registrar-office")
const registrarSegments = routeToWorldSegments({ route: libraryToRegistrar, floors, viewMode: MAP3D_VIEW_MODES.EXPLODED })
const registrarTransitions = registrarSegments.filter((segment) => segment.edgeType === "FLOOR_TRANSITION")
assert.equal(libraryToRegistrar.floorChanges, 2)
assert.deepEqual(libraryToRegistrar.routeFloorIds, ["3F", "4F", "5F"])
assert.equal(registrarTransitions.length, 2)
assert.equal(registrarTransitions.every((segment) => segment.from.y !== segment.to.y), true)
assert.equal(registrarTransitions.every((segment) => segment.from.type === "STAIRS" && segment.to.type === "STAIRS"), true)
assert.equal(registrarTransitions.every((segment) => segment.edgeId && mapEdges.some((edge) => edge.id === segment.edgeId)), true)

const mainToRegistrar = routeBetween("main-entrance", "registrar-office")
assert.equal(mainToRegistrar.floorChanges, 4)
assert.deepEqual(mainToRegistrar.routeFloorIds, ["GF", "2F", "3F", "4F", "5F"])
assert.equal(routeToWorldSegments({ route: mainToRegistrar, floors, viewMode: MAP3D_VIEW_MODES.EXPLODED }).filter((segment) => segment.edgeType === "FLOOR_TRANSITION").length, 4)

const qrLibrary = resolveCheckpointPayload(createCheckpointPayload("QR-3F-LIBRARY"))
const qrRoute = routeBetween(qrLibrary.location.currentFacilityId, "registrar-office", qrLibrary.location.currentNodeId)
const manualLibrary = resolveManualPosition({ floorId: "3F", facilityId: "library" })
const manualRoute = routeBetween(manualLibrary.location.currentFacilityId, "registrar-office", manualLibrary.location.currentNodeId)
assert.deepEqual(qrRoute.nodeIds, manualRoute.nodeIds)
assert.deepEqual(routeNodesToWorld({ route: qrRoute, floors, viewMode: MAP3D_VIEW_MODES.EXPLODED }).map((point) => point.nodeId), qrRoute.nodeIds)

const registrarRoom = getFloorById("5F").map.rooms.find((room) => room.facilityId === "registrar-office")
assert.equal(polygonToWorld({ polygon: registrarRoom.polygon, floorId: "5F", floors, viewMode: MAP3D_VIEW_MODES.STACKED }).length, registrarRoom.polygon.length)
const constructionRooms = getFloorById("5F").map.rooms.filter((room) => room.status === "UNDER_CONSTRUCTION")
assert.ok(constructionRooms.length > 0)
assert.equal(constructionRooms.every((room) => getRoom3DState(room) === "UNDER_CONSTRUCTION"), true)
assert.equal(libraryToRegistrar.nodes.some((node) => node.floorId === "5F" && constructionRooms.some((room) => pointInPolygon(node, room.polygon, false))), false)

const emergencyResult = findNearestVerifiedExit({ currentNodeId: "entrance-library-west", currentFloorId: "3F", nodes: mapNodes, edges: emergencyApprovedEdges, floors })
assert.equal(emergencyResult.ok, true)
assert.equal(isEmergencyRouteRenderable(emergencyResult.route), true)
assert.equal(isEmergencyRouteRenderable(sameFloorRoute), false)
const fifthEmergency = findNearestVerifiedExit({ currentNodeId: getFacilityEntranceNode("registrar-office", "5F").id, currentFloorId: "5F", nodes: mapNodes, edges: emergencyApprovedEdges, floors })
assert.equal(fifthEmergency.ok, false)
assert.equal(isEmergencyRouteRenderable(fifthEmergency.route), false)

assert.equal(supportsWebGL({ createElement: () => ({ getContext: () => null }) }), false)
assert.equal(supportsWebGL({ createElement: () => ({ getContext: (kind) => kind === "webgl" ? {} : null }) }), true)

console.log("3D floor elevations, coordinate conversion, shared routes, stair transitions, QR state, construction state, emergency eligibility, and WebGL fallback: PASS")
