import { VERIFICATION_STATUS } from "./mapStandards.js"

export const FLOOR_TRANSITION_WEIGHT = 250

export const stairConnections = [
  {
    id: "STAIR-EAST",
    label: "East Stair",
    connections: [
      { floorId: "GF", nodeId: "stairs-gf-east" },
      { floorId: "2F", nodeId: "stairs-2f-east" },
      { floorId: "3F", nodeId: "stairs-northeast" },
      { floorId: "4F", nodeId: "stairs-4f-east" },
      { floorId: "5F", nodeId: "stairs-5f-east" },
    ],
    verificationStatus: VERIFICATION_STATUS.SOURCE_ALIGNED,
    accessible: null,
  },
]

export const verticalTransitionEdges = stairConnections.flatMap((stair) =>
  stair.connections.slice(0, -1).map((connection, index) => {
    const next = stair.connections[index + 1]
    return {
      id: `${connection.nodeId}--${next.nodeId}`,
      from: connection.nodeId,
      to: next.nodeId,
      type: "FLOOR_TRANSITION",
      floorChange: 1,
      stairs: true,
      accessible: stair.accessible,
      stairId: stair.id,
      stairLabel: stair.label,
      bidirectional: true,
      walkable: true,
      blocked: false,
      weight: FLOOR_TRANSITION_WEIGHT,
      verificationStatus: stair.verificationStatus,
    }
  })
)
