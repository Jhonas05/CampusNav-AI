import { VERIFICATION_STATUS } from "./mapStandards.js"
import { additionalMapEdges } from "./additionalFloorGraph.js"
import { verticalTransitionEdges } from "./stairs.js"

const connect = (from, to) => ({
  id: `${from}--${to}`,
  floorId: "3F",
  from,
  to,
  bidirectional: true,
  walkable: true,
  blocked: false,
  sourceFeatureStatus: VERIFICATION_STATUS.VERIFIED,
  verificationStatus: VERIFICATION_STATUS.ESTIMATED,
})

const northHallwaySequence = [
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

const lowerHallwaySequence = [
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

const roomConnections = [
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

const sourceExitConnections = [
  ["stairs-northwest", "hall-north-65"],
  ["exit-north", "hall-north-65"],
  ["stairs-west-middle", "exit-west-middle"],
  ["exit-west-middle", "hall-north-landing"],
  ["hall-west", "exit-southwest"],
  ["exit-southwest", "stairs-southwest"],
  ["stairs-northeast", "hall-east"],
  ["stairs-southeast", "hall-east"],
  ["hall-east", "exit-east"],
]

const connectSequence = (sequence) => sequence.slice(0, -1).map((nodeId, index) => connect(nodeId, sequence[index + 1]))

export const mapEdges = [
  ...connectSequence(northHallwaySequence),
  ...connectSequence(lowerHallwaySequence),
  ...roomConnections.map(([entranceId, hallwayId]) => connect(entranceId, hallwayId)),
  ...sourceExitConnections.map(([from, to]) => connect(from, to)),
  ...additionalMapEdges,
  ...verticalTransitionEdges,
]
