import { VERIFICATION_STATUS } from "./mapStandards.js"

const sourceReference = (page) => ({ title: "Emergency Evacuation", page })

const approve = (floorId, from, to, page, options = {}) => ({
  id: `emergency-${from}--${to}`,
  floorId,
  from,
  to,
  type: options.type || "WALKWAY",
  bidirectional: options.bidirectional !== false,
  walkable: true,
  blocked: false,
  emergencyApproved: true,
  verificationStatus: VERIFICATION_STATUS.SOURCE_ALIGNED,
  source: sourceReference(page),
  ...options,
})

const sequence = (floorId, nodeIds, page) =>
  nodeIds.slice(0, -1).map((nodeId, index) => approve(floorId, nodeId, nodeIds[index + 1], page))

const gfRoomConnectors = [
  ["entrance-gf-stock-room", "hall-gf-stock-room"],
  ["entrance-gf-basic-education-clinic", "hall-gf-basic-education-clinic"],
  ["entrance-gf-guidance-office", "hall-gf-guidance-office"],
  ["entrance-gf-room-5", "hall-gf-room-5"],
  ["entrance-gf-room-3", "hall-gf-room-3"],
  ["entrance-gf-room-1", "hall-gf-room-1"],
  ["entrance-gf-theater", "hall-gf-theater"],
  ["entrance-gf-cleaning-stock-room", "hall-gf-cleaning-stock-room"],
  ["entrance-gf-cr-men-lower", "hall-gf-cr-men-lower"],
  ["entrance-gf-cr-women-lower", "hall-gf-cr-women-lower"],
  ["entrance-gf-bookstore", "hall-gf-bookstore"],
  ["entrance-gf-faculty-lounge", "hall-gf-faculty-lounge"],
  ["entrance-gf-health-dental-clinic", "hall-gf-health-dental-clinic"],
  ["entrance-gf-osas", "hall-gf-osas"],
  ["entrance-gf-designated-parking-area", "hall-gf-designated-parking-area"],
  ["entrance-gf-driveway-entrance", "hall-gf-driveway-entrance"],
  ["entrance-gf-waiting-area", "hall-gf-waiting-area"],
  ["entrance-gf-main-entrance", "hall-gf-main-entrance"],
]

const gfLowerSequence = [
  "hall-gf-theater",
  "hall-gf-cleaning-stock-room",
  "intersection-gf-west-lower",
  "hall-gf-cr-men-lower",
  "hall-gf-guidance-office",
  "hall-gf-cr-women-lower",
  "hall-gf-bookstore",
  "hall-gf-room-5",
  "intersection-gf-central-lower",
  "hall-gf-faculty-lounge",
  "hall-gf-room-3",
  "hall-gf-health-dental-clinic",
  "hall-gf-designated-parking-area",
  "hall-gf-osas",
  "hall-gf-room-1",
  "stairs-gf-east-access",
  "intersection-gf-lower-entrance",
  "hall-gf-main-entrance",
  "hall-gf-waiting-area",
]

const thirdFloorLowerSequence = [
  "hall-west",
  "hall-room-43",
  "hall-education",
  "hall-assistant-vp",
  "hall-computer-west",
  "hall-library-west",
  "hall-computer-east",
  "hall-library-east",
  "hall-east",
]

const thirdFloorNorthSequence = [
  "hall-north-65",
  "hall-room-54",
  "hall-room-53",
  "hall-room-52",
  "hall-room-51",
  "hall-room-50",
  "hall-room-48",
  "hall-room-49",
  "hall-north-landing",
]

const thirdFloorRoomConnectors = [
  ["entrance-room-54", "hall-room-54"],
  ["entrance-room-52", "hall-room-52"],
  ["entrance-room-50", "hall-room-50"],
  ["entrance-room-48", "hall-room-48"],
  ["entrance-mens-cr", "hall-north-65"],
  ["entrance-room-53", "hall-room-53"],
  ["entrance-room-51", "hall-room-51"],
  ["entrance-room-49", "hall-room-49"],
  ["entrance-virtual-laboratory", "hall-west"],
  ["entrance-education-department", "hall-education"],
  ["entrance-assistant-vp", "hall-assistant-vp"],
  ["entrance-library-west", "hall-library-west"],
  ["entrance-library-east", "hall-library-east"],
  ["entrance-room-43", "hall-room-43"],
  ["entrance-computer-laboratory-west", "hall-computer-west"],
  ["entrance-computer-laboratory-east", "hall-computer-east"],
]

export const emergencyApprovedEdges = [
  ...gfRoomConnectors.map(([from, to]) => approve("GF", from, to, 1)),
  ...sequence("GF", gfLowerSequence, 1),
  approve("GF", "hall-gf-basic-education-clinic", "stairs-gf-west-middle-access", 1),
  approve("GF", "stairs-gf-west-middle-access", "intersection-gf-west-lower", 1),
  approve("GF", "hall-gf-stock-room", "exit-gf-northwest", 1),
  approve("GF", "hall-gf-driveway-entrance", "intersection-gf-lower-entrance", 1),
  approve("GF", "hall-gf-driveway-entrance", "exit-gf-driveway", 1),
  approve("GF", "entrance-gf-driveway-entrance", "exit-gf-driveway", 1, { weight: 0.5 }),
  approve("GF", "hall-gf-main-entrance", "exit-gf-main", 1),
  approve("GF", "entrance-gf-main-entrance", "exit-gf-main", 1, { weight: 0.5 }),

  ...sequence("3F", thirdFloorLowerSequence, 3),
  ...sequence("3F", thirdFloorNorthSequence, 3),
  ...thirdFloorRoomConnectors.map(([from, to]) => approve("3F", from, to, 3)),
  approve("3F", "exit-north", "hall-north-65", 3),
  approve("3F", "exit-west-middle", "hall-north-landing", 3),
  approve("3F", "hall-west", "exit-southwest", 3),
  approve("3F", "hall-east", "exit-east", 3),
]

export const emergencyPendingItems = [
  { id: "pending-gf-assembly", floorId: "GF", label: "Assembly-area location", verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION },
  { id: "pending-gf-southwest-route", floorId: "GF", label: "Digitally connected path to the southwest exit", verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION },
  { id: "pending-2f-emergency-layer", floorId: "2F", label: "Emergency exits, equipment, and approved paths", verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION },
  { id: "pending-3f-assembly", floorId: "3F", label: "Assembly-area location", verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION },
  { id: "pending-4f-emergency-layer", floorId: "4F", label: "Emergency exits, equipment, and approved paths", verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION },
  { id: "pending-5f-emergency-layer", floorId: "5F", label: "Emergency exits, equipment, and approved paths", verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION },
  { id: "pending-vertical-emergency-transitions", floorId: null, label: "Emergency approval for cross-floor stair transitions", verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION },
]

export const emergencyFloorAvailability = ["GF", "2F", "3F", "4F", "5F"].map((floorId) => ({
  floorId,
  verificationStatus: ["GF", "3F"].includes(floorId)
    ? VERIFICATION_STATUS.SOURCE_ALIGNED
    : VERIFICATION_STATUS.PENDING_VERIFICATION,
  approvedRouteAvailable: emergencyApprovedEdges.some((edge) => edge.floorId === floorId),
}))

