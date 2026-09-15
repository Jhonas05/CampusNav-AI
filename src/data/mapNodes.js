import { VERIFICATION_STATUS } from "./mapStandards.js"
import { additionalMapNodes } from "./additionalFloorGraph.js"
import { emergencyExitNodes } from "./emergencyExits.js"

export const MAP_NODE_TYPES = {
  ROOM_ENTRANCE: "ROOM_ENTRANCE",
  HALLWAY: "HALLWAY",
  INTERSECTION: "INTERSECTION",
  STAIRS: "STAIRS",
  EXIT: "EXIT",
  QR_CHECKPOINT: "QR_CHECKPOINT",
}

const sourceAlignedNode = (node) => ({
  ...node,
  floorId: "3F",
  sourceFeatureStatus: VERIFICATION_STATUS.VERIFIED,
  verificationStatus: VERIFICATION_STATUS.ESTIMATED,
})

export const mapNodes = [
  sourceAlignedNode({ id: "hall-north-65", type: MAP_NODE_TYPES.INTERSECTION, x: 257, y: 65, label: "North hallway" }),
  sourceAlignedNode({ id: "hall-room-54", type: MAP_NODE_TYPES.HALLWAY, x: 257, y: 143, label: "Hallway near Room 54" }),
  sourceAlignedNode({ id: "hall-room-53", type: MAP_NODE_TYPES.HALLWAY, x: 257, y: 160, label: "Hallway near Room 53" }),
  sourceAlignedNode({ id: "hall-room-52", type: MAP_NODE_TYPES.HALLWAY, x: 257, y: 239, label: "Hallway near Room 52" }),
  sourceAlignedNode({ id: "hall-room-51", type: MAP_NODE_TYPES.HALLWAY, x: 257, y: 252, label: "Hallway near Room 51" }),
  sourceAlignedNode({ id: "hall-room-50", type: MAP_NODE_TYPES.HALLWAY, x: 257, y: 333, label: "Hallway near Room 50" }),
  sourceAlignedNode({ id: "hall-room-48", type: MAP_NODE_TYPES.HALLWAY, x: 257, y: 368, label: "Hallway near Room 48" }),
  sourceAlignedNode({ id: "hall-room-49", type: MAP_NODE_TYPES.HALLWAY, x: 257, y: 409, label: "Hallway near Room 49" }),
  sourceAlignedNode({ id: "hall-north-landing", type: MAP_NODE_TYPES.INTERSECTION, x: 257, y: 486, label: "North wing landing" }),

  sourceAlignedNode({ id: "hall-west", type: MAP_NODE_TYPES.INTERSECTION, x: 220, y: 684, label: "West hallway" }),
  sourceAlignedNode({ id: "hall-room-43", type: MAP_NODE_TYPES.HALLWAY, x: 269, y: 684, label: "Hallway near Room 43" }),
  sourceAlignedNode({ id: "hall-education", type: MAP_NODE_TYPES.HALLWAY, x: 309, y: 684, label: "Hallway near Education Department Office" }),
  sourceAlignedNode({ id: "hall-assistant-vp", type: MAP_NODE_TYPES.HALLWAY, x: 345, y: 684, label: "Hallway near Assistant Vice President Office" }),
  sourceAlignedNode({ id: "hall-computer-west", type: MAP_NODE_TYPES.HALLWAY, x: 453, y: 684, label: "Hallway near west Computer Laboratory entrance" }),
  sourceAlignedNode({ id: "hall-library-west", type: MAP_NODE_TYPES.HALLWAY, x: 584, y: 684, label: "Hallway near west Library entrance" }),
  sourceAlignedNode({ id: "hall-computer-east", type: MAP_NODE_TYPES.HALLWAY, x: 621, y: 684, label: "Hallway near east Computer Laboratory entrance" }),
  sourceAlignedNode({ id: "hall-library-east", type: MAP_NODE_TYPES.HALLWAY, x: 854, y: 684, label: "Hallway near east Library entrance" }),
  sourceAlignedNode({ id: "hall-east", type: MAP_NODE_TYPES.INTERSECTION, x: 910, y: 684, label: "East hallway" }),

  sourceAlignedNode({ id: "entrance-room-54", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 181, y: 143, facilityId: "room-54", label: "Room 54 entrance" }),
  sourceAlignedNode({ id: "entrance-room-52", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 181, y: 239, facilityId: "room-52", label: "Room 52 entrance" }),
  sourceAlignedNode({ id: "entrance-room-50", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 181, y: 333, facilityId: "room-50", label: "Room 50 entrance" }),
  sourceAlignedNode({ id: "entrance-room-48", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 181, y: 368, facilityId: "room-48", label: "Room 48 entrance" }),
  sourceAlignedNode({ id: "entrance-mens-cr", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 333, y: 78, facilityId: "mens-cr", label: "Men's CR entrance" }),
  sourceAlignedNode({ id: "entrance-room-53", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 332, y: 160, facilityId: "room-53", label: "Room 53 entrance" }),
  sourceAlignedNode({ id: "entrance-room-51", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 332, y: 252, facilityId: "room-51", label: "Room 51 entrance" }),
  sourceAlignedNode({ id: "entrance-room-49", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 332, y: 409, facilityId: "room-49", label: "Room 49 entrance" }),
  sourceAlignedNode({ id: "entrance-virtual-laboratory", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 184, y: 684, facilityId: "virtual-laboratory", label: "Virtual Laboratory entrance" }),
  sourceAlignedNode({ id: "entrance-education-department", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 309, y: 637, facilityId: "education-department-office", label: "Education Department Office entrance" }),
  sourceAlignedNode({ id: "entrance-assistant-vp", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 345, y: 637, facilityId: "assistant-vp-office", label: "Office of the Assistant Vice President entrance" }),
  sourceAlignedNode({ id: "entrance-library-west", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 584, y: 637, facilityId: "library", label: "Library west entrance", isPrimary: true }),
  sourceAlignedNode({ id: "entrance-library-east", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 854, y: 637, facilityId: "library", label: "Library east entrance" }),
  sourceAlignedNode({ id: "entrance-room-43", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 269, y: 731, facilityId: "room-43", label: "Room 43 entrance" }),
  sourceAlignedNode({ id: "entrance-computer-laboratory-west", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 453, y: 731, facilityId: "computer-laboratory", label: "Computer Laboratory west entrance", isPrimary: true }),
  sourceAlignedNode({ id: "entrance-computer-laboratory-east", type: MAP_NODE_TYPES.ROOM_ENTRANCE, x: 621, y: 731, facilityId: "computer-laboratory", label: "Computer Laboratory east entrance" }),

  sourceAlignedNode({ id: "stairs-northwest", type: MAP_NODE_TYPES.STAIRS, x: 116, y: 40, label: "Northwest stairs" }),
  sourceAlignedNode({ id: "stairs-west-middle", type: MAP_NODE_TYPES.STAIRS, x: 99, y: 486, label: "West middle stairs" }),
  sourceAlignedNode({ id: "stairs-southwest", type: MAP_NODE_TYPES.STAIRS, x: 216, y: 790, label: "Southwest stairs" }),
  sourceAlignedNode({ id: "stairs-northeast", type: MAP_NODE_TYPES.STAIRS, x: 911, y: 582, label: "Northeast stairs" }),
  sourceAlignedNode({ id: "stairs-southeast", type: MAP_NODE_TYPES.STAIRS, x: 911, y: 790, label: "Southeast stairs" }),

  sourceAlignedNode({ id: "exit-north", type: MAP_NODE_TYPES.EXIT, x: 215, y: 7, label: "North emergency exit" }),
  sourceAlignedNode({ id: "exit-west-middle", type: MAP_NODE_TYPES.EXIT, x: 184, y: 486, label: "West middle emergency exit" }),
  sourceAlignedNode({ id: "exit-southwest", type: MAP_NODE_TYPES.EXIT, x: 216, y: 731, label: "Southwest emergency exit" }),
  sourceAlignedNode({ id: "exit-east", type: MAP_NODE_TYPES.EXIT, x: 944, y: 684, label: "East emergency exit" }),
  ...additionalMapNodes,
  ...emergencyExitNodes,
]

export const getMapNodeById = (id) => mapNodes.find((node) => node.id === id) || null

export const getFacilityEntranceNodes = (facilityId, floorId = null) =>
  mapNodes.filter((node) => (!floorId || node.floorId === floorId) && node.type === MAP_NODE_TYPES.ROOM_ENTRANCE && node.facilityId === facilityId)

export const getFacilityEntranceNode = (facilityId, floorId = null) => {
  const entrances = getFacilityEntranceNodes(facilityId, floorId)
  return entrances.find((node) => node.isPrimary) || entrances[0] || null
}
