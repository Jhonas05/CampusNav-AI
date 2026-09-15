import { VERIFICATION_STATUS } from "./mapStandards.js"

export const CHECKPOINT_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
}

export const QR_CHECKPOINT_PREFIX = "CAMPUSNAV:CHECKPOINT:"

export const qrCheckpoints = [
  {
    id: "QR-3F-LIBRARY",
    floorId: "3F",
    facilityId: "library",
    nodeId: "entrance-library-west",
    label: "Library",
    status: CHECKPOINT_STATUS.ACTIVE,
    verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION,
  },
  {
    id: "QR-3F-COMPUTER-LAB",
    floorId: "3F",
    facilityId: "computer-laboratory",
    nodeId: "entrance-computer-laboratory-west",
    label: "Computer Laboratory",
    status: CHECKPOINT_STATUS.ACTIVE,
    verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION,
  },
  {
    id: "QR-3F-VIRTUAL-LAB",
    floorId: "3F",
    facilityId: "virtual-laboratory",
    nodeId: "entrance-virtual-laboratory",
    label: "Virtual Laboratory",
    status: CHECKPOINT_STATUS.ACTIVE,
    verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION,
  },
]

export const getCheckpointById = (id) => qrCheckpoints.find((checkpoint) => checkpoint.id === id) || null

export const getCheckpointsByFloor = (floorId) => qrCheckpoints.filter((checkpoint) => checkpoint.floorId === floorId)

export const createCheckpointPayload = (checkpointId) => `${QR_CHECKPOINT_PREFIX}${checkpointId}`
