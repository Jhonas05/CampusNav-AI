import { emergencyContacts, NO_VERIFIED_ROUTE_MESSAGE } from "../data/emergencyContacts.js"
import { emergencyEquipment, EMERGENCY_EQUIPMENT_TYPES } from "../data/emergencyEquipment.js"
import { emergencyExits } from "../data/emergencyExits.js"
import { emergencyApprovedEdges, emergencyPendingItems } from "../data/emergencyRoutes.js"
import { VERIFICATION_STATUS } from "../data/mapStandards.js"
import { findShortestPath } from "./pathfinding.js"
import { pointInPolygon, segmentCrossesPolygonInterior } from "./mapValidation.js"

const ELIGIBLE_STATUSES = new Set([
  VERIFICATION_STATUS.VERIFIED,
  VERIFICATION_STATUS.SOURCE_ALIGNED,
])

const FORBIDDEN_STATUSES = new Set([
  "UNDER_CONSTRUCTION",
  "BLOCKED",
  "RESTRICTED",
  "NON_NAVIGABLE",
])

const edgeConnectsNodes = (edge, fromId, toId) =>
  (edge.from === fromId && edge.to === toId) ||
  (edge.bidirectional !== false && edge.from === toId && edge.to === fromId)

export const isEmergencyEdgeEligible = (edge) =>
  edge.emergencyApproved === true &&
  ELIGIBLE_STATUSES.has(edge.verificationStatus) &&
  edge.active !== false &&
  edge.walkable !== false &&
  edge.blocked !== true &&
  edge.restricted !== true &&
  edge.nonNavigable !== true &&
  !FORBIDDEN_STATUSES.has(edge.status)

export const isEmergencyExitEligible = (exit) =>
  exit.active === true && ELIGIBLE_STATUSES.has(exit.verificationStatus)

export const getEligibleEmergencyEdges = (edges = emergencyApprovedEdges) =>
  edges.filter(isEmergencyEdgeEligible)

const edgeAvoidsForbiddenAreas = (edge, nodeMap, floors) => {
  if (edge.type === "FLOOR_TRANSITION") return true
  const from = nodeMap.get(edge.from)
  const to = nodeMap.get(edge.to)
  const floor = floors.find((item) => item.id === from?.floorId)
  if (!from || !to || !floor?.map) return true
  return !floor.map.rooms.some((room) => {
    if (room.navigable !== false && !FORBIDDEN_STATUSES.has(room.status)) return false
    return pointInPolygon(from, room.polygon, false) ||
      pointInPolygon(to, room.polygon, false) ||
      segmentCrossesPolygonInterior(from, to, room.polygon)
  })
}

export function findNearestVerifiedExit({
  currentNodeId,
  currentFloorId,
  nodes,
  edges = emergencyApprovedEdges,
  exits = emergencyExits,
  floors = [],
}) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const currentNode = nodeMap.get(currentNodeId)
  if (!currentNode || currentNode.floorId !== currentFloorId) {
    return { ok: false, reason: "INVALID_CURRENT_LOCATION", message: NO_VERIFIED_ROUTE_MESSAGE }
  }

  const eligibleEdges = getEligibleEmergencyEdges(edges)
    .filter((edge) => edgeAvoidsForbiddenAreas(edge, nodeMap, floors))
  const candidates = exits
    .filter(isEmergencyExitEligible)
    .filter((exit) => nodeMap.get(exit.nodeId)?.floorId === exit.floorId)
    .map((exit) => {
      const route = findShortestPath({
        nodes,
        edges: eligibleEdges,
        startNodeId: currentNodeId,
        destinationNodeId: exit.nodeId,
      })
      return route ? { exit, route } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.route.totalCost - b.route.totalCost)

  if (!candidates.length) {
    return { ok: false, reason: "NO_VERIFIED_ROUTE", message: NO_VERIFIED_ROUTE_MESSAGE }
  }

  const selected = candidates[0]
  return {
    ok: true,
    exit: selected.exit,
    candidateCount: candidates.length,
    route: {
      ...selected.route,
      emergency: true,
      startEntranceNodeId: currentNodeId,
      destinationEntranceNodeId: selected.exit.nodeId,
      distance: {
        totalDistanceMeters: null,
        mapUnits: selected.route.totalMapUnits,
        label: `${selected.route.totalCost.toFixed(1)} approved route-cost units`,
      },
    },
  }
}

export function getEmergencyRouteSegmentForFloor(route, floorId) {
  if (!route) return null
  const nodes = route.nodes.filter((node) => node.floorId === floorId)
  const edges = route.edges.filter((edge) => edge.floorId === floorId && edge.type !== "FLOOR_TRANSITION")
  return nodes.length ? { ...route, nodes, edges, nodeIds: nodes.map((node) => node.id), edgeIds: edges.map((edge) => edge.id) } : null
}

export function generateEmergencyInstructions({ route, exit }) {
  if (!route || !exit) return []
  const instructions = [{ type: "start", floorId: route.nodes[0]?.floorId, text: "Begin from your confirmed current location." }]

  route.edges.forEach((edge, index) => {
    if (edge.type !== "FLOOR_TRANSITION") return
    const nextFloorId = route.nodes[index + 1]?.floorId
    instructions.push({ type: "stairs", floorId: route.nodes[index]?.floorId, text: "Proceed to the approved stairway." })
    instructions.push({ type: "floor-change", floorId: nextFloorId, text: `Continue to ${nextFloorId}.` })
  })

  route.routeFloorIds.forEach((floorId) => {
    instructions.push({ type: "continue", floorId, text: `Follow the approved evacuation path shown on ${floorId}.` })
  })
  instructions.push({ type: "exit", floorId: exit.floorId, text: `Proceed through ${exit.label} and follow posted signage and authorized personnel.` })
  return instructions
}

export function validateEmergencyData({ floors, nodes, edges = emergencyApprovedEdges, exits = emergencyExits }) {
  const floorMap = new Map(floors.map((floor) => [floor.id, floor]))
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const errors = []
  const blockedAreaErrors = []

  exits.forEach((exit) => {
    const node = nodeMap.get(exit.nodeId)
    if (!node) errors.push(`${exit.id} references a missing node`)
    else if (node.floorId !== exit.floorId) errors.push(`${exit.id} belongs to the wrong floor`)
  })

  edges.forEach((edge) => {
    const from = nodeMap.get(edge.from)
    const to = nodeMap.get(edge.to)
    if (!from || !to) {
      errors.push(`${edge.id} references a missing node`)
      return
    }
    if (edge.type !== "FLOOR_TRANSITION" && (from.floorId !== to.floorId || edge.floorId !== from.floorId)) {
      errors.push(`${edge.id} has invalid floor metadata`)
    }
    if (edge.emergencyApproved !== true) errors.push(`${edge.id} is not emergency approved`)
    if (!ELIGIBLE_STATUSES.has(edge.verificationStatus)) errors.push(`${edge.id} is not verified or source-aligned`)
    if (!isEmergencyEdgeEligible(edge)) errors.push(`${edge.id} is blocked or ineligible`)

    if (edge.type === "FLOOR_TRANSITION") return
    const floor = floorMap.get(from.floorId)
    const blockedRoom = floor?.map?.rooms.find((room) =>
      (room.navigable === false || FORBIDDEN_STATUSES.has(room.status)) &&
      (pointInPolygon(from, room.polygon, false) || pointInPolygon(to, room.polygon, false) || segmentCrossesPolygonInterior(from, to, room.polygon))
    )
    if (blockedRoom) blockedAreaErrors.push(`${edge.id} traverses ${blockedRoom.id}`)
  })
  errors.push(...blockedAreaErrors)

  const incidentNodeIds = new Set(edges.filter(isEmergencyEdgeEligible).flatMap((edge) => [edge.from, edge.to]))
  const disconnectedExitIds = exits
    .filter(isEmergencyExitEligible)
    .filter((exit) => !incidentNodeIds.has(exit.nodeId))
    .map((exit) => exit.id)

  return { pass: errors.length === 0, errors, blockedAreaErrors, disconnectedExitIds }
}

export function validateEmergencyRoute({ route, edges = emergencyApprovedEdges, floors = [] }) {
  if (!route) return { pass: false, errors: ["Route was not found"] }
  const edgeMap = new Map(edges.map((edge) => [edge.id, edge]))
  const errors = []
  route.edgeIds.forEach((edgeId, index) => {
    const edge = edgeMap.get(edgeId)
    if (!edge || !edgeConnectsNodes(edge, route.nodeIds[index], route.nodeIds[index + 1])) errors.push(`Route segment ${edgeId} is invalid`)
    else if (!isEmergencyEdgeEligible(edge)) errors.push(`Route uses ineligible edge ${edgeId}`)
  })
  const graphValidation = validateEmergencyData({ floors, nodes: route.nodes, edges: route.edges, exits: [] })
  errors.push(...graphValidation.blockedAreaErrors)
  return { pass: errors.length === 0, errors }
}

export function buildEmergencyVerificationReport({ floors, nodes }) {
  const validation = validateEmergencyData({ floors, nodes })
  const perFloor = floors.map((floor) => ({
    floorId: floor.id,
    exitCount: emergencyExits.filter((exit) => exit.floorId === floor.id).length,
    extinguisherCount: emergencyEquipment.filter((item) => item.floorId === floor.id && item.type === EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER).length,
    alarmCount: emergencyEquipment.filter((item) => item.floorId === floor.id && item.type === EMERGENCY_EQUIPMENT_TYPES.FIRE_ALARM).length,
    approvedEdgeCount: emergencyApprovedEdges.filter((edge) => edge.floorId === floor.id && isEmergencyEdgeEligible(edge)).length,
    pendingCount: emergencyPendingItems.filter((item) => item.floorId === floor.id).length,
  }))

  return {
    pass: validation.pass,
    validation,
    perFloor,
    approvedEdgeCount: getEligibleEmergencyEdges().length,
    pendingCount: emergencyPendingItems.length + emergencyContacts.filter((contact) => contact.verificationStatus === VERIFICATION_STATUS.PENDING_VERIFICATION).length,
    disconnectedExitIds: validation.disconnectedExitIds,
  }
}
