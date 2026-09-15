import { getFacilityEntranceNodes } from "../data/mapNodes.js"
import { getFloorById } from "../data/floors.js"
import { measureMapDistance } from "./distance.js"
import { findShortestPath } from "./pathfinding.js"

const segmentDistance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)

export function calculateFacilityRoute({ startFacility, destinationFacility, floor, nodes, edges, startNodeId = null, destinationNodeId = null }) {
  if (!startFacility || !destinationFacility || !floor?.map) return null

  const sameFloor = startFacility.floorId === destinationFacility.floorId
  const floorNodes = sameFloor ? nodes.filter((node) => node.floorId === startFacility.floorId) : nodes
  const floorEdges = sameFloor
    ? edges.filter((edge) => edge.floorId === startFacility.floorId && edge.type !== "FLOOR_TRANSITION")
    : edges
  const requestedStartNode = startNodeId
    ? floorNodes.find((node) => node.id === startNodeId && node.facilityId === startFacility.id)
    : null
  const requestedDestinationNode = destinationNodeId
    ? floorNodes.find((node) => node.id === destinationNodeId && node.facilityId === destinationFacility.id)
    : null
  const startNodes = startNodeId ? (requestedStartNode ? [requestedStartNode] : []) : getFacilityEntranceNodes(startFacility.id, startFacility.floorId)
  const destinationNodes = destinationNodeId ? (requestedDestinationNode ? [requestedDestinationNode] : []) : getFacilityEntranceNodes(destinationFacility.id, destinationFacility.floorId)
  if (!startNodes.length || !destinationNodes.length) return null

  const candidates = []
  for (const startNode of startNodes) {
    for (const destinationNode of destinationNodes) {
      const candidate = findShortestPath({
        nodes: floorNodes,
        edges: floorEdges,
        startNodeId: startNode.id,
        destinationNodeId: destinationNode.id,
      })
      if (!candidate) continue
      candidates.push({
        ...candidate,
        startEntranceNodeId: startNode.id,
        destinationEntranceNodeId: destinationNode.id,
        distance: measureMapDistance(candidate.totalCost, floor.map.distanceCalibration),
      })
    }
  }

  const route = candidates.reduce(
    (shortest, candidate) => !shortest || candidate.totalCost < shortest.totalCost ? candidate : shortest,
    null
  )
  if (route?.floorChanges) {
    route.distance = {
      ...route.distance,
      displayUnit: "route-cost units",
      label: `${route.distance.displayValue} schematic route-cost units`,
    }
  }
  return route
}

export function generateNavigationInstructions({ route, startFacility, destinationFacility, floor }) {
  if (!route || !startFacility || !destinationFacility || !floor) return []
  if (startFacility.id === destinationFacility.id) {
    return [{ type: "arrive", text: `You are already at ${destinationFacility.name} — ${floor.shortName}.` }]
  }

  if (route.floorChanges > 0) {
    const directions = [
      { type: "start", floorId: startFacility.floorId, text: `Start at ${startFacility.name} — ${getFloorById(startFacility.floorId)?.shortName}.` },
      { type: "straight", floorId: startFacility.floorId, text: `Leave ${startFacility.name} through its marked room entrance.` },
    ]

    route.edges.forEach((edge, index) => {
      if (edge.type !== "FLOOR_TRANSITION") return
      const fromNode = route.nodes[index]
      const toNode = route.nodes[index + 1]
      const fromFloor = getFloorById(fromNode.floorId)
      const toFloor = getFloorById(toNode.floorId)
      const direction = (toFloor?.level ?? 0) > (fromFloor?.level ?? 0) ? "up" : "down"
      directions.push(
        { type: "stairs", floorId: fromNode.floorId, text: `Proceed to ${edge.stairLabel || "the source-aligned stairway"}.` },
        { type: "floor-change", floorId: toNode.floorId, text: `Go ${direction} to ${toFloor?.name} using ${edge.stairLabel || "the stairway"}.` }
      )
    })

    directions.push(
      { type: "straight", floorId: destinationFacility.floorId, text: `Follow the ${getFloorById(destinationFacility.floorId)?.name} hallway to ${destinationFacility.name}.` },
      { type: "arrive", floorId: destinationFacility.floorId, text: `Arrive at ${destinationFacility.name} — ${getFloorById(destinationFacility.floorId)?.shortName}.` }
    )
    return directions
  }

  const hallwayNodes = route.nodes.slice(1, -1)
  const hallwayMapUnits = hallwayNodes.slice(1).reduce(
    (total, node, index) => total + segmentDistance(hallwayNodes[index], node),
    0
  )
  const hallwayDistance = measureMapDistance(hallwayMapUnits, floor.map.distanceCalibration)

  return [
    { type: "start", text: `Start at ${startFacility.name} — ${floor.shortName}.` },
    { type: "straight", text: `Leave ${startFacility.name} through its marked room entrance.` },
    { type: "turn", text: `Join the mapped ${floor.name} hallway.` },
    { type: "straight", text: `Follow the highlighted hallway route for ${hallwayDistance.label}.` },
    { type: "turn", text: `Use the marked entrance for ${destinationFacility.name}.` },
    { type: "arrive", text: `Arrive at ${destinationFacility.name} — ${floor.shortName}.` },
  ]
}

export function getRouteSegmentForFloor(route, floorId) {
  if (!route) return null
  const floorNodes = route.nodes.filter((node) => node.floorId === floorId)
  const nodeIds = new Set(floorNodes.map((node) => node.id))
  const floorEdges = route.edges.filter((edge) => edge.floorId === floorId && edge.type !== "FLOOR_TRANSITION")
  return {
    ...route,
    nodes: floorNodes,
    nodeIds: route.nodeIds.filter((nodeId) => nodeIds.has(nodeId)),
    edges: floorEdges,
    edgeIds: floorEdges.map((edge) => edge.id),
  }
}

export function advanceNavigationProgress({ status, activeStep, totalSteps }) {
  if (status !== "active") return { status, activeStep }
  if (totalSteps <= 0 || activeStep >= totalSteps - 1) {
    return { status: "arrived", activeStep: Math.max(0, totalSteps - 1) }
  }
  return { status: "active", activeStep: activeStep + 1 }
}
