import { additionalFloorMaps } from "./additionalFloorMaps.js"
import { VERIFICATION_STATUS } from "./mapStandards.js"

const node = (floorId, value) => ({
  ...value,
  floorId,
  sourceFeatureStatus: VERIFICATION_STATUS.VERIFIED,
  verificationStatus: VERIFICATION_STATUS.ESTIMATED,
})

const edge = (floorId, from, to) => ({
  id: `${from}--${to}`,
  floorId,
  from,
  to,
  type: "WALKWAY",
  bidirectional: true,
  walkable: true,
  blocked: false,
  sourceFeatureStatus: VERIFICATION_STATUS.VERIFIED,
  verificationStatus: VERIFICATION_STATUS.ESTIMATED,
})

const buildFloorGraph = (floorId, floorMap) => {
  const nodes = []
  const edges = []
  const corridorMembers = new Map(Object.keys(floorMap.navigation.corridorAxes).map((id) => [id, []]))

  for (const room of floorMap.rooms) {
    if (!room.navigable || !room.entrancePoint || !room.hallwayPoint) continue
    const entrance = node(floorId, {
      id: room.entranceNodeId,
      type: "ROOM_ENTRANCE",
      x: room.entrancePoint.x,
      y: room.entrancePoint.y,
      facilityId: room.facilityId,
      label: `${room.name} entrance`,
      isPrimary: true,
    })
    const hall = node(floorId, {
      id: room.hallwayNodeId,
      type: "HALLWAY",
      x: room.hallwayPoint.x,
      y: room.hallwayPoint.y,
      label: `Hallway near ${room.name}`,
    })
    nodes.push(entrance, hall)
    edges.push(edge(floorId, entrance.id, hall.id))
    corridorMembers.get(room.corridorId)?.push(hall)
  }

  for (const item of floorMap.navigation.intersections) {
    const intersectionNode = node(floorId, { ...item, label: `${floorId} hallway intersection` })
    nodes.push(intersectionNode)
    item.corridorIds.forEach((corridorId) => corridorMembers.get(corridorId)?.push(intersectionNode))
  }

  for (const stair of floorMap.stairways) {
    const stairNode = node(floorId, {
      id: stair.nodeId,
      type: "STAIRS",
      x: stair.corridorId
        ? floorMap.navigation.corridorAxes[stair.corridorId] === "x" ? stair.labelPoint.x : Math.max(...stair.polygon.map((point) => point.x))
        : stair.labelPoint.x,
      y: stair.corridorId
        ? floorMap.navigation.corridorAxes[stair.corridorId] === "y" ? stair.labelPoint.y : Math.max(...stair.polygon.map((point) => point.y))
        : stair.labelPoint.y,
      label: `${floorId} ${stair.label}`,
    })
    nodes.push(stairNode)
    if (stair.corridorId) {
      const accessNode = node(floorId, {
        id: `${stair.nodeId}-access`,
        type: "INTERSECTION",
        x: stairNode.x,
        y: stairNode.y,
        label: `${floorId} stair access`,
      })
      nodes.push(accessNode)
      edges.push(edge(floorId, stairNode.id, accessNode.id))
      corridorMembers.get(stair.corridorId)?.push(accessNode)
    }
  }

  for (const [corridorId, members] of corridorMembers) {
    const axis = floorMap.navigation.corridorAxes[corridorId]
    const ordered = [...new Map(members.map((member) => [member.id, member])).values()]
      .sort((a, b) => axis === "x" ? a.x - b.x || a.y - b.y : a.y - b.y || a.x - b.x)
    ordered.slice(0, -1).forEach((member, index) => edges.push(edge(floorId, member.id, ordered[index + 1].id)))
  }

  return { nodes, edges }
}

const floorGraphs = Object.entries(additionalFloorMaps).map(([floorId, floorMap]) => buildFloorGraph(floorId, floorMap))

export const additionalMapNodes = floorGraphs.flatMap((graph) => graph.nodes)
export const additionalMapEdges = floorGraphs.flatMap((graph) => graph.edges)
