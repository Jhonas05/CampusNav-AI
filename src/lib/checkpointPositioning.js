import { facilities } from "../data/facilities.js"
import { floors } from "../data/floors.js"
import { CHECKPOINT_STATUS, QR_CHECKPOINT_PREFIX, qrCheckpoints } from "../data/qrCheckpoints.js"
import { MAP_NODE_TYPES, mapNodes } from "../data/mapNodes.js"

export const POSITIONING_METHOD = {
  QR: "QR",
  MANUAL: "MANUAL",
}

export const INVALID_CHECKPOINT_MESSAGE = "CampusNav could not verify this checkpoint."

const getRegistry = (overrides = {}) => ({
  checkpoints: overrides.checkpoints || qrCheckpoints,
  facilities: overrides.facilities || facilities,
  floors: overrides.floors || floors,
  nodes: overrides.nodes || mapNodes,
})

export function parseCheckpointPayload(payload) {
  if (typeof payload !== "string") {
    return { ok: false, code: "MALFORMED_PAYLOAD", message: INVALID_CHECKPOINT_MESSAGE }
  }

  const normalizedPayload = payload.trim()
  if (!normalizedPayload.startsWith(QR_CHECKPOINT_PREFIX)) {
    return { ok: false, code: "MALFORMED_PAYLOAD", message: INVALID_CHECKPOINT_MESSAGE }
  }

  const checkpointId = normalizedPayload.slice(QR_CHECKPOINT_PREFIX.length)
  if (!/^QR-[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(checkpointId)) {
    return { ok: false, code: "MALFORMED_PAYLOAD", message: INVALID_CHECKPOINT_MESSAGE }
  }

  return { ok: true, checkpointId, payload: normalizedPayload }
}

export function validateCheckpoint(checkpoint, overrides = {}) {
  const registry = getRegistry(overrides)
  if (!checkpoint) return { ok: false, code: "UNKNOWN_CHECKPOINT", message: INVALID_CHECKPOINT_MESSAGE }
  if (checkpoint.status !== CHECKPOINT_STATUS.ACTIVE) return { ok: false, code: "INACTIVE_CHECKPOINT", message: INVALID_CHECKPOINT_MESSAGE }

  const floor = registry.floors.find((candidate) => candidate.id === checkpoint.floorId)
  if (!floor) return { ok: false, code: "MISSING_FLOOR", message: INVALID_CHECKPOINT_MESSAGE }

  const facility = registry.facilities.find((candidate) => candidate.id === checkpoint.facilityId)
  if (!facility) return { ok: false, code: "MISSING_FACILITY", message: INVALID_CHECKPOINT_MESSAGE }
  if (facility.floorId !== checkpoint.floorId) return { ok: false, code: "FACILITY_FLOOR_MISMATCH", message: INVALID_CHECKPOINT_MESSAGE }

  const node = registry.nodes.find((candidate) => candidate.id === checkpoint.nodeId)
  if (!node) return { ok: false, code: "MISSING_LINKED_NODE", message: INVALID_CHECKPOINT_MESSAGE }
  if (node.floorId !== checkpoint.floorId) return { ok: false, code: "NODE_FLOOR_MISMATCH", message: INVALID_CHECKPOINT_MESSAGE }
  if (node.facilityId !== checkpoint.facilityId) return { ok: false, code: "NODE_FACILITY_MISMATCH", message: INVALID_CHECKPOINT_MESSAGE }
  if (node.type !== MAP_NODE_TYPES.ROOM_ENTRANCE && node.type !== MAP_NODE_TYPES.QR_CHECKPOINT) {
    return { ok: false, code: "INVALID_NODE_TYPE", message: INVALID_CHECKPOINT_MESSAGE }
  }

  return { ok: true, checkpoint, facility, floor, node }
}

export function resolveCheckpointId(checkpointId, overrides = {}) {
  const registry = getRegistry(overrides)
  const checkpoint = registry.checkpoints.find((candidate) => candidate.id === checkpointId)
  const validation = validateCheckpoint(checkpoint, registry)
  if (!validation.ok) return validation

  return {
    ...validation,
    location: {
      currentNodeId: validation.node.id,
      currentFacilityId: validation.facility.id,
      currentFloorId: validation.floor.id,
      positioningMethod: POSITIONING_METHOD.QR,
      checkpointId: validation.checkpoint.id,
    },
  }
}

export function resolveCheckpointPayload(payload, overrides = {}) {
  const parsed = parseCheckpointPayload(payload)
  if (!parsed.ok) return parsed
  return resolveCheckpointId(parsed.checkpointId, overrides)
}

export function resolveManualPosition({ floorId, facilityId, nodeId = null, checkpointId = null }, overrides = {}) {
  const registry = getRegistry(overrides)
  const floor = registry.floors.find((candidate) => candidate.id === floorId)
  const facility = registry.facilities.find((candidate) => candidate.id === facilityId)
  if (!floor || !facility || facility.floorId !== floorId || facility.navigable === false) {
    return { ok: false, code: "INVALID_MANUAL_LOCATION", message: "CampusNav could not set this manual location." }
  }

  const matchingNodes = registry.nodes.filter((node) =>
    node.floorId === floorId && node.facilityId === facilityId && node.type === MAP_NODE_TYPES.ROOM_ENTRANCE
  )
  const node = nodeId
    ? matchingNodes.find((candidate) => candidate.id === nodeId)
    : matchingNodes.find((candidate) => candidate.isPrimary) || matchingNodes[0] || null

  if (floor.map && !node) {
    return { ok: false, code: "MISSING_MANUAL_NODE", message: "CampusNav could not set this manual location." }
  }

  return {
    ok: true,
    facility,
    floor,
    node,
    location: {
      currentNodeId: node?.id || null,
      currentFacilityId: facility.id,
      currentFloorId: floor.id,
      positioningMethod: POSITIONING_METHOD.MANUAL,
      checkpointId,
    },
  }
}

export function resolveManualCheckpoint(checkpointId, overrides = {}) {
  const checkpointResolution = resolveCheckpointId(checkpointId, overrides)
  if (!checkpointResolution.ok) return checkpointResolution

  const manualResolution = resolveManualPosition({
    floorId: checkpointResolution.floor.id,
    facilityId: checkpointResolution.facility.id,
    nodeId: checkpointResolution.node.id,
    checkpointId: checkpointResolution.checkpoint.id,
  }, overrides)

  return manualResolution
}

export const applyLocationResolution = (currentLocation, resolution) =>
  resolution.ok ? resolution.location : currentLocation
