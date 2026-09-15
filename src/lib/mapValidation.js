import { ALIGNMENT_STATUS, VERIFICATION_STATUS } from "../data/mapStandards.js"
import { MAP_NODE_TYPES } from "../data/mapNodes.js"
import { calculateFacilityRoute } from "./navigation.js"

const pointDistance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)

const pointOnSegment = (point, start, end, tolerance = 0.001) => {
  const segmentLength = pointDistance(start, end)
  const combinedLength = pointDistance(start, point) + pointDistance(point, end)
  return Math.abs(segmentLength - combinedLength) <= tolerance
}

export const pointOnPolygonBoundary = (point, polygon) =>
  polygon.some((start, index) => pointOnSegment(point, start, polygon[(index + 1) % polygon.length]))

export const pointInPolygon = (point, polygon, includeBoundary = true) => {
  if (includeBoundary && pointOnPolygonBoundary(point, polygon)) return true

  let inside = false
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const currentPoint = polygon[index]
    const previousPoint = polygon[previous]
    const crossesRay = (currentPoint.y > point.y) !== (previousPoint.y > point.y)
    const intersectionX = ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
      (previousPoint.y - currentPoint.y) + currentPoint.x
    if (crossesRay && point.x < intersectionX) inside = !inside
  }
  return inside
}

export const segmentCrossesPolygonInterior = (start, end, polygon, sampleCount = 160) => {
  for (let step = 1; step < sampleCount; step += 1) {
    const ratio = step / sampleCount
    const point = {
      x: start.x + (end.x - start.x) * ratio,
      y: start.y + (end.y - start.y) * ratio,
    }
    if (pointInPolygon(point, polygon, false)) return true
  }
  return false
}

const edgeConnectsNodes = (edge, fromId, toId) =>
  (edge.from === fromId && edge.to === toId) ||
  (edge.bidirectional !== false && edge.from === toId && edge.to === fromId)

export function validateFloorGraph({ floor, nodes, edges }) {
  const floorNodes = nodes.filter((node) => node.floorId === floor.id)
  const floorEdges = edges.filter((edge) => edge.floorId === floor.id && edge.type !== "FLOOR_TRANSITION")
  const nodeMap = new Map(floorNodes.map((node) => [node.id, node]))
  const validNodeTypes = new Set(Object.values(MAP_NODE_TYPES))
  const navigationSurfaces = [...(floor.map?.hallways || []), ...(floor.map?.stairways || [])]
  const invalidNodeErrors = floorNodes
    .filter((node) => !validNodeTypes.has(node.type))
    .map((node) => `${node.id} has an invalid node type`)
  const invalidEdgeErrors = []
  const wallCrossingErrors = []
  const walkingSurfaceErrors = []

  for (const edge of floorEdges) {
    const from = nodeMap.get(edge.from)
    const to = nodeMap.get(edge.to)
    if (!from || !to) {
      invalidEdgeErrors.push(`${edge.id} references a missing node`)
      continue
    }
    if (from.floorId !== to.floorId) invalidEdgeErrors.push(`${edge.id} crosses floors`)
    if (edge.walkable === false || edge.blocked === true) continue

    const crossingRoom = floor.map.rooms.find((room) =>
      segmentCrossesPolygonInterior(from, to, room.polygon)
    )
    if (crossingRoom) wallCrossingErrors.push(`${edge.id} crosses ${crossingRoom.id}`)

    for (let step = 1; step < 80; step += 1) {
      const ratio = step / 80
      const point = {
        x: from.x + (to.x - from.x) * ratio,
        y: from.y + (to.y - from.y) * ratio,
      }
      if (!navigationSurfaces.some((surface) => pointInPolygon(point, surface.polygon))) {
        walkingSurfaceErrors.push(`${edge.id} leaves the mapped walkable surface`)
        break
      }
    }
  }

  const entranceErrors = floor.map.rooms.flatMap((room) => {
    if (!room.navigable) return []
    if (!room.entranceNodeIds.length) return [`${room.id} has no entrance node`]
    return room.entranceNodeIds.flatMap((nodeId) => {
      const entranceNode = nodeMap.get(nodeId)
      if (!entranceNode) return [`${room.id} entrance ${nodeId} is missing`]
      if (entranceNode.type !== MAP_NODE_TYPES.ROOM_ENTRANCE) return [`${nodeId} is not a room entrance`]
      if (!pointOnPolygonBoundary(entranceNode, room.polygon)) return [`${nodeId} is not on ${room.id}'s boundary`]
      const hasConnection = floorEdges.some((edge) =>
        edge.walkable !== false && edge.blocked !== true && (edge.from === nodeId || edge.to === nodeId)
      )
      return hasConnection ? [] : [`${nodeId} is not connected to the graph`]
    })
  })

  return {
    pass: [...invalidNodeErrors, ...invalidEdgeErrors, ...wallCrossingErrors, ...walkingSurfaceErrors, ...entranceErrors].length === 0,
    wallCrossingPass: wallCrossingErrors.length === 0,
    invalidNodeErrors,
    invalidEdgeErrors,
    wallCrossingErrors,
    walkingSurfaceErrors,
    entranceErrors,
  }
}

export function validateCalculatedRoute({ route, startFacilityId, destinationFacilityId, nodes, edges, floor }) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const edgeMap = new Map(edges.map((edge) => [edge.id, edge]))
  const errors = []

  if (!route) return { pass: false, errors: ["Route was not found"] }
  const startNode = nodeMap.get(route.nodeIds[0])
  const arrivalNode = nodeMap.get(route.nodeIds.at(-1))
  if (startNode?.facilityId !== startFacilityId) errors.push("Route starts at the wrong facility entrance")
  if (arrivalNode?.facilityId !== destinationFacilityId) errors.push("Route ends at the wrong facility entrance")
  if (route.floorChanges !== 0) errors.push("Same-floor route reports a floor change")

  route.nodeIds.slice(0, -1).forEach((nodeId, index) => {
    const nextNodeId = route.nodeIds[index + 1]
    const edgeId = route.edgeIds[index]
    const edge = edgeMap.get(edgeId)
    if (!edge || !edgeConnectsNodes(edge, nodeId, nextNodeId)) errors.push(`Route segment ${nodeId} to ${nextNodeId} is not connected`)
    if (edge?.blocked || edge?.walkable === false) errors.push(`Route uses blocked edge ${edgeId}`)
  })

  const stairsUsed = route.nodes.filter((node) => node.type === MAP_NODE_TYPES.STAIRS)
  if (stairsUsed.length > 0) errors.push("Same-floor route uses stairs unnecessarily")

  for (const edgeId of route.edgeIds) {
    const edge = edgeMap.get(edgeId)
    const from = nodeMap.get(edge?.from)
    const to = nodeMap.get(edge?.to)
    if (!from || !to) continue
    const crossingRoom = floor.map.rooms.find((room) => segmentCrossesPolygonInterior(from, to, room.polygon))
    if (crossingRoom) errors.push(`${edgeId} crosses ${crossingRoom.id}`)
  }

  return { pass: errors.length === 0, errors }
}

export function buildMapVerificationReport({ floor, facilities, nodes, edges }) {
  const floorFacilities = facilities.filter((facility) => facility.floorId === floor.id)
  const floorNodes = nodes.filter((node) => node.floorId === floor.id)
  const floorEdges = edges.filter((edge) => edge.floorId === floor.id && edge.type !== "FLOOR_TRANSITION")
  const graph = validateFloorGraph({ floor, nodes: floorNodes, edges: floorEdges })
  const routeResults = (floor.map?.validationRoutes || []).map((testCase) => {
    const startFacility = floorFacilities.find((facility) => facility.id === testCase.startFacilityId)
    const destinationFacility = floorFacilities.find((facility) => facility.id === testCase.destinationFacilityId)
    const route = calculateFacilityRoute({ startFacility, destinationFacility, floor, nodes: floorNodes, edges: floorEdges })
    return {
      ...testCase,
      route,
      validation: validateCalculatedRoute({ route, startFacilityId: testCase.startFacilityId, destinationFacilityId: testCase.destinationFacilityId, nodes: floorNodes, edges: floorEdges, floor }),
    }
  })

  return {
    floorName: floor.name,
    facilityCount: floorFacilities.length,
    nodeCount: floorNodes.length,
    edgeCount: floorEdges.length,
    verifiedFacilityAssignments: floorFacilities.filter((facility) => facility.verification.floor === VERIFICATION_STATUS.VERIFIED).length,
    calibratedFacilities: floor.map.rooms.filter((room) => room.alignmentStatus === ALIGNMENT_STATUS.CALIBRATED).length,
    estimatedGeometries: floor.map.rooms.filter((room) => room.verificationStatus === VERIFICATION_STATUS.ESTIMATED).length,
    sourceAlignedObjects: floor.map.rooms.filter((room) => room.alignmentStatus === ALIGNMENT_STATUS.SOURCE_ALIGNED).length,
    stairCount: floorNodes.filter((node) => node.type === MAP_NODE_TYPES.STAIRS).length,
    disconnectedFacilities: floorFacilities.filter((facility) => {
      if (facility.navigable === false) return false
      const entrances = floorNodes.filter((node) => node.type === MAP_NODE_TYPES.ROOM_ENTRANCE && node.facilityId === facility.id)
      return !entrances.length || !entrances.some((entrance) => floorEdges.some((edge) => edge.from === entrance.id || edge.to === entrance.id))
    }).map((facility) => facility.id),
    pendingItems: floor.map.pendingItems?.length || 0,
    routeValidationPass: graph.pass && routeResults.every((result) => result.validation.pass),
    wallCrossingPass: graph.wallCrossingPass,
    graph,
    routeResults,
  }
}

const duplicateIds = (items) => {
  const seen = new Set()
  const duplicates = new Set()
  items.forEach((item) => seen.has(item.id) ? duplicates.add(item.id) : seen.add(item.id))
  return [...duplicates]
}

export function validateMultiFloorGraph({ floors, facilities, nodes, edges }) {
  const floorMap = new Map(floors.map((floor) => [floor.id, floor]))
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const facilityMap = new Map(facilities.map((facility) => [facility.id, facility]))
  const errors = []
  const duplicateNodeIds = duplicateIds(nodes)
  const duplicateEdgeIds = duplicateIds(edges)
  duplicateNodeIds.forEach((id) => errors.push(`Duplicate node ID: ${id}`))
  duplicateEdgeIds.forEach((id) => errors.push(`Duplicate edge ID: ${id}`))

  nodes.forEach((node) => {
    if (!floorMap.has(node.floorId)) errors.push(`${node.id} references invalid floor ${node.floorId}`)
    if (node.type === MAP_NODE_TYPES.ROOM_ENTRANCE) {
      const facility = facilityMap.get(node.facilityId)
      if (!facility) errors.push(`${node.id} references invalid facility ${node.facilityId}`)
      else if (facility.floorId !== node.floorId) errors.push(`${node.id} belongs to the wrong floor for ${facility.id}`)
    }
  })

  edges.forEach((edge) => {
    const from = nodeMap.get(edge.from)
    const to = nodeMap.get(edge.to)
    if (!from || !to) {
      errors.push(`${edge.id} is dangling`)
      return
    }
    if (edge.type === "FLOOR_TRANSITION") {
      if (from.type !== MAP_NODE_TYPES.STAIRS || to.type !== MAP_NODE_TYPES.STAIRS) errors.push(`${edge.id} must connect stair nodes`)
      const fromLevel = floorMap.get(from.floorId)?.level
      const toLevel = floorMap.get(to.floorId)?.level
      if (!Number.isFinite(fromLevel) || !Number.isFinite(toLevel) || Math.abs(toLevel - fromLevel) !== 1) errors.push(`${edge.id} makes an impossible floor jump`)
      if (edge.floorChange !== 1) errors.push(`${edge.id} must declare one floor change`)
    } else {
      if (from.floorId !== to.floorId) errors.push(`${edge.id} crosses floors without transition metadata`)
      if (edge.floorId !== from.floorId) errors.push(`${edge.id} has incorrect floor metadata`)
    }
  })

  const constructionZoneErrors = []
  floors.forEach((floor) => {
    const blockedRooms = (floor.map?.rooms || []).filter((room) => room.navigable === false || room.status === "UNDER_CONSTRUCTION" || room.status === "RESTRICTED")
    const floorNodes = nodes.filter((node) => node.floorId === floor.id)
    const floorEdges = edges.filter((edge) => edge.floorId === floor.id && edge.type !== "FLOOR_TRANSITION" && edge.walkable !== false && edge.blocked !== true)
    blockedRooms.forEach((room) => {
      floorNodes.filter((node) => pointInPolygon(node, room.polygon, false)).forEach((node) => constructionZoneErrors.push(`${node.id} is inside ${room.id}`))
      floorEdges.forEach((edge) => {
        const from = nodeMap.get(edge.from)
        const to = nodeMap.get(edge.to)
        if (from && to && segmentCrossesPolygonInterior(from, to, room.polygon)) constructionZoneErrors.push(`${edge.id} crosses ${room.id}`)
      })
    })
  })
  errors.push(...constructionZoneErrors)

  const disconnectedFacilities = facilities.filter((facility) => {
    if (facility.navigable === false) return false
    const entrances = nodes.filter((node) => node.type === MAP_NODE_TYPES.ROOM_ENTRANCE && node.facilityId === facility.id && node.floorId === facility.floorId)
    return !entrances.length || !entrances.some((entrance) => edges.some((edge) => edge.walkable !== false && edge.blocked !== true && (edge.from === entrance.id || edge.to === entrance.id)))
  }).map((facility) => facility.id)
  disconnectedFacilities.forEach((id) => errors.push(`${id} is disconnected`))

  const floorReports = floors.map((floor) => ({ floorId: floor.id, ...validateFloorGraph({ floor, nodes, edges }) }))
  floorReports.filter((report) => !report.pass).forEach((report) => errors.push(`${report.floorId} floor graph failed validation`))

  return {
    pass: errors.length === 0,
    errors,
    duplicateNodeIds,
    duplicateEdgeIds,
    constructionZoneErrors,
    disconnectedFacilities,
    verticalConnectionCount: edges.filter((edge) => edge.type === "FLOOR_TRANSITION").length,
    floorReports,
  }
}

export function validateMultiFloorRoute({ route, startFacilityId, destinationFacilityId, floors, nodes, edges }) {
  if (!route) return { pass: false, errors: ["Route was not found"] }
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const edgeMap = new Map(edges.map((edge) => [edge.id, edge]))
  const errors = []
  const startNode = nodeMap.get(route.nodeIds[0])
  const destinationNode = nodeMap.get(route.nodeIds.at(-1))
  if (startNode?.facilityId !== startFacilityId) errors.push("Route starts at the wrong facility entrance")
  if (destinationNode?.facilityId !== destinationFacilityId) errors.push("Route ends at the wrong facility entrance")

  route.edgeIds.forEach((edgeId, index) => {
    const edge = edgeMap.get(edgeId)
    const fromId = route.nodeIds[index]
    const toId = route.nodeIds[index + 1]
    if (!edge || !edgeConnectsNodes(edge, fromId, toId)) errors.push(`Route segment ${fromId} to ${toId} is not connected`)
    if (edge?.blocked || edge?.walkable === false) errors.push(`Route uses blocked edge ${edgeId}`)
  })
  const calculatedFloorChanges = route.edges.reduce((total, edge) => total + (edge.floorChange || 0), 0)
  if (calculatedFloorChanges !== route.floorChanges) errors.push("Route floor-change count is incorrect")

  for (const edge of route.edges.filter((candidate) => candidate.type !== "FLOOR_TRANSITION")) {
    const from = nodeMap.get(edge.from)
    const to = nodeMap.get(edge.to)
    const floor = floors.find((candidate) => candidate.id === from?.floorId)
    if (!from || !to || !floor?.map) continue
    const blockedRoom = floor.map.rooms.find((room) =>
      (room.navigable === false || room.status === "UNDER_CONSTRUCTION" || room.status === "RESTRICTED") &&
      segmentCrossesPolygonInterior(from, to, room.polygon)
    )
    if (blockedRoom) errors.push(`${edge.id} traverses ${blockedRoom.id}`)
  }

  return { pass: errors.length === 0, errors }
}
