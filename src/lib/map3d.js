import { MAP3D_CONFIG, MAP3D_VIEW_MODES } from "../data/map3dConfig.js"

const forbiddenStatuses = new Set(["UNDER_CONSTRUCTION", "BLOCKED", "RESTRICTED", "NON_NAVIGABLE"])

export const getFloorElevation = (floorId, floors, viewMode = MAP3D_VIEW_MODES.EXPLODED, config = MAP3D_CONFIG) => {
  const floor = floors.find((item) => item.id === floorId)
  if (!floor) throw new Error(`Unknown floor: ${floorId}`)
  const spacing = config.floorSpacing + (viewMode === MAP3D_VIEW_MODES.EXPLODED ? config.explodedSpacing : 0)
  return floor.level * spacing
}

export const mapToWorld = ({ x, y, floorId, floors, viewMode = MAP3D_VIEW_MODES.EXPLODED, verticalOffset = 0, config = MAP3D_CONFIG }) => {
  const floor = floors.find((item) => item.id === floorId)
  if (!floor?.map) throw new Error(`Floor ${floorId} has no digital map geometry`)
  return {
    x: (x - floor.map.width / 2) * config.mapScale,
    y: getFloorElevation(floorId, floors, viewMode, config) + verticalOffset,
    z: (y - floor.map.height / 2) * config.mapScale,
  }
}

/** @returns {[number, number, number]} */
export const worldToArray = (point) => [point.x, point.y, point.z]

export const polygonCentroid = (polygon) => {
  const total = polygon.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 })
  return { x: total.x / polygon.length, y: total.y / polygon.length }
}

export const polygonArea = (polygon) => Math.abs(polygon.reduce((sum, point, index) => {
  const next = polygon[(index + 1) % polygon.length]
  return sum + point.x * next.y - next.x * point.y
}, 0) / 2)

export const polygonToWorld = ({ polygon, floorId, floors, viewMode, verticalOffset = 0, config = MAP3D_CONFIG }) =>
  polygon.map((point) => mapToWorld({ ...point, floorId, floors, viewMode, verticalOffset, config }))

export const routeNodesToWorld = ({ route, floors, viewMode, config = MAP3D_CONFIG }) => {
  if (!route?.nodes) return []
  return route.nodes.map((node) => ({
    nodeId: node.id,
    floorId: node.floorId,
    type: node.type,
    ...mapToWorld({ ...node, floors, viewMode, verticalOffset: config.routeOffset, config }),
  }))
}

export const routeToWorldSegments = ({ route, floors, viewMode, config = MAP3D_CONFIG }) => {
  const points = routeNodesToWorld({ route, floors, viewMode, config })
  return points.slice(0, -1).map((from, index) => ({
    id: route.edges[index]?.id || `${from.nodeId}--${points[index + 1].nodeId}`,
    edgeId: route.edges[index]?.id || null,
    edgeType: route.edges[index]?.type || "WALKWAY",
    floorChange: route.edges[index]?.floorChange || 0,
    from,
    to: points[index + 1],
  }))
}

export const getRoom3DState = (room) => {
  if (room.status === "UNDER_CONSTRUCTION") return "UNDER_CONSTRUCTION"
  if (room.navigable === false || forbiddenStatuses.has(room.status)) return room.status || "NON_NAVIGABLE"
  return "NAVIGABLE"
}

export const getFacilityWorldPosition = ({ facilityId, floor, floors, viewMode, config = MAP3D_CONFIG }) => {
  const room = floor?.map?.rooms.find((item) => item.facilityId === facilityId)
  if (!room) return null
  const point = room.labelPoint || polygonCentroid(room.polygon)
  return mapToWorld({ ...point, floorId: floor.id, floors, viewMode, verticalOffset: config.wallHeight + 0.35, config })
}

export const getLargestRooms = (rooms, limit = 8) =>
  [...rooms].sort((a, b) => polygonArea(b.polygon) - polygonArea(a.polygon)).slice(0, limit)

export const isEmergencyRouteRenderable = (route) => Boolean(
  route?.emergency === true &&
  route.edges?.length > 0 &&
  route.edges.every((edge) =>
    edge.emergencyApproved === true &&
    ["VERIFIED", "SOURCE_ALIGNED"].includes(edge.verificationStatus) &&
    edge.active !== false &&
    edge.walkable !== false &&
    edge.blocked !== true &&
    edge.restricted !== true &&
    edge.nonNavigable !== true &&
    !forbiddenStatuses.has(edge.status)
  )
)
