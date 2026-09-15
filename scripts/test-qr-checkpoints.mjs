import assert from "node:assert/strict"
import { facilities } from "../src/data/facilities.js"
import { floors } from "../src/data/floors.js"
import { mapEdges } from "../src/data/mapEdges.js"
import { MAP_NODE_TYPES, mapNodes } from "../src/data/mapNodes.js"
import { CHECKPOINT_STATUS, createCheckpointPayload, qrCheckpoints } from "../src/data/qrCheckpoints.js"
import {
  applyLocationResolution,
  INVALID_CHECKPOINT_MESSAGE,
  parseCheckpointPayload,
  POSITIONING_METHOD,
  resolveCheckpointPayload,
  resolveManualCheckpoint,
  resolveManualPosition,
} from "../src/lib/checkpointPositioning.js"
import { validateCalculatedRoute } from "../src/lib/mapValidation.js"
import { calculateFacilityRoute } from "../src/lib/navigation.js"
import { CAMERA_PERMISSION_MESSAGE, CAMERA_UNAVAILABLE_MESSAGE, getCameraAccessMessage } from "../src/lib/cameraAccess.js"

const thirdFloor = floors.find((floor) => floor.id === "3F")
const getFacility = (facilityId) => facilities.find((facility) => facility.id === facilityId)

const expectedLinks = {
  "QR-3F-LIBRARY": ["library", "entrance-library-west"],
  "QR-3F-COMPUTER-LAB": ["computer-laboratory", "entrance-computer-laboratory-west"],
  "QR-3F-VIRTUAL-LAB": ["virtual-laboratory", "entrance-virtual-laboratory"],
}

assert.equal(qrCheckpoints.length, 3)
for (const checkpoint of qrCheckpoints) {
  assert.deepEqual([checkpoint.facilityId, checkpoint.nodeId], expectedLinks[checkpoint.id])
  assert.equal(checkpoint.floorId, "3F")
  assert.equal(checkpoint.status, CHECKPOINT_STATUS.ACTIVE)
  assert.equal(mapNodes.some((node) => node.id === checkpoint.nodeId && node.type === MAP_NODE_TYPES.ROOM_ENTRANCE), true)

  const payload = createCheckpointPayload(checkpoint.id)
  assert.equal(payload, `CAMPUSNAV:CHECKPOINT:${checkpoint.id}`)
  assert.deepEqual(parseCheckpointPayload(payload), { ok: true, checkpointId: checkpoint.id, payload })

  const qrResolution = resolveCheckpointPayload(payload)
  assert.equal(qrResolution.ok, true)
  assert.deepEqual(qrResolution.location, {
    currentNodeId: checkpoint.nodeId,
    currentFacilityId: checkpoint.facilityId,
    currentFloorId: "3F",
    positioningMethod: POSITIONING_METHOD.QR,
    checkpointId: checkpoint.id,
  })

  const manualResolution = resolveManualCheckpoint(checkpoint.id)
  assert.equal(manualResolution.ok, true)
  assert.equal(manualResolution.location.positioningMethod, POSITIONING_METHOD.MANUAL)
  assert.equal(manualResolution.location.currentNodeId, checkpoint.nodeId)
}

const malformedPayloads = [
  null,
  "",
  "QR-3F-LIBRARY",
  "CAMPUSNAV:CHECKPOINT:",
  "CAMPUSNAV:CHECKPOINT:qr-3f-library",
  "CAMPUSNAV:CHECKPOINT:QR-3F-LIBRARY:EXTRA",
]
for (const payload of malformedPayloads) {
  const result = resolveCheckpointPayload(payload)
  assert.equal(result.ok, false)
  assert.equal(result.code, "MALFORMED_PAYLOAD")
  assert.equal(result.message, INVALID_CHECKPOINT_MESSAGE)
}

const unknownResult = resolveCheckpointPayload("CAMPUSNAV:CHECKPOINT:QR-3F-UNKNOWN")
assert.equal(unknownResult.ok, false)
assert.equal(unknownResult.code, "UNKNOWN_CHECKPOINT")
assert.equal(unknownResult.message, INVALID_CHECKPOINT_MESSAGE)

const inactiveRegistry = qrCheckpoints.map((checkpoint) => checkpoint.id === "QR-3F-LIBRARY"
  ? { ...checkpoint, status: CHECKPOINT_STATUS.INACTIVE }
  : checkpoint)
const inactiveResult = resolveCheckpointPayload(createCheckpointPayload("QR-3F-LIBRARY"), { checkpoints: inactiveRegistry })
assert.equal(inactiveResult.code, "INACTIVE_CHECKPOINT")
assert.equal(inactiveResult.message, INVALID_CHECKPOINT_MESSAGE)

const missingNodeResult = resolveCheckpointPayload(createCheckpointPayload("QR-3F-LIBRARY"), {
  nodes: mapNodes.filter((node) => node.id !== "entrance-library-west"),
})
assert.equal(missingNodeResult.code, "MISSING_LINKED_NODE")

const incorrectFloorNodes = mapNodes.map((node) => node.id === "entrance-library-west" ? { ...node, floorId: "2F" } : node)
const incorrectFloorResult = resolveCheckpointPayload(createCheckpointPayload("QR-3F-LIBRARY"), { nodes: incorrectFloorNodes })
assert.equal(incorrectFloorResult.code, "NODE_FLOOR_MISMATCH")

const incorrectFacilityCheckpoints = qrCheckpoints.map((checkpoint) => checkpoint.id === "QR-3F-LIBRARY"
  ? { ...checkpoint, facilityId: "computer-laboratory" }
  : checkpoint)
const incorrectFacilityResult = resolveCheckpointPayload(createCheckpointPayload("QR-3F-LIBRARY"), { checkpoints: incorrectFacilityCheckpoints })
assert.equal(incorrectFacilityResult.code, "NODE_FACILITY_MISMATCH")

const manualLibrary = resolveManualPosition({ floorId: "3F", facilityId: "library" })
assert.equal(manualLibrary.ok, true)
assert.equal(manualLibrary.location.currentNodeId, "entrance-library-west")
assert.equal(manualLibrary.location.positioningMethod, POSITIONING_METHOD.MANUAL)
assert.equal(manualLibrary.location.checkpointId, null)

const stableLocation = manualLibrary.location
assert.equal(applyLocationResolution(stableLocation, unknownResult), stableLocation, "Invalid scans must not change the current location")

assert.equal(getCameraAccessMessage({ name: "NotAllowedError" }), CAMERA_PERMISSION_MESSAGE)
assert.equal(getCameraAccessMessage({ name: "PermissionDeniedError" }), CAMERA_PERMISSION_MESSAGE)
assert.equal(CAMERA_PERMISSION_MESSAGE, "Camera permission is required to scan a CampusNav checkpoint.")
assert.equal(getCameraAccessMessage({ name: "NotFoundError" }), CAMERA_UNAVAILABLE_MESSAGE)

const routeCases = [
  ["QR-3F-LIBRARY", "virtual-laboratory"],
  ["QR-3F-COMPUTER-LAB", "virtual-laboratory"],
  ["QR-3F-VIRTUAL-LAB", "library"],
]

for (const [checkpointId, destinationFacilityId] of routeCases) {
  const resolved = resolveCheckpointPayload(createCheckpointPayload(checkpointId))
  const startFacility = getFacility(resolved.location.currentFacilityId)
  const destinationFacility = getFacility(destinationFacilityId)
  const route = calculateFacilityRoute({
    startFacility,
    destinationFacility,
    floor: thirdFloor,
    nodes: mapNodes,
    edges: mapEdges,
    startNodeId: resolved.location.currentNodeId,
  })

  assert.ok(route, `${checkpointId} must connect to ${destinationFacilityId}`)
  assert.equal(route.nodeIds[0], resolved.location.currentNodeId)
  assert.equal(route.floorChanges, 0)
  assert.equal(route.nodes.some((node) => node.type === MAP_NODE_TYPES.STAIRS), false)
  assert.equal(route.distance.totalDistanceMeters, null)

  const validation = validateCalculatedRoute({
    route,
    startFacilityId: startFacility.id,
    destinationFacilityId: destinationFacility.id,
    nodes: mapNodes.filter((node) => node.floorId === "3F"),
    edges: mapEdges.filter((edge) => edge.floorId === "3F"),
    floor: thirdFloor,
  })
  assert.equal(validation.pass, true)
  assert.deepEqual(validation.errors, [])
  console.log(`${checkpointId} → ${destinationFacility.name}: ${route.distance.label}; validation: PASS`)
}

console.log("QR payload, checkpoint validation, manual fallback, location preservation, and QR-to-A* tests: PASS")
