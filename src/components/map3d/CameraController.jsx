import { OrbitControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { MathUtils, Vector3 } from "three"
import { MAP3D_CONFIG } from "@/data/map3dConfig"
import { getFacilityWorldPosition, getFloorElevation } from "@/lib/map3d"
import { getFitDistance } from "@/lib/mapViewport"

const DEFAULT_DIRECTION = new Vector3(0.68, 0.58, 0.74).normalize()
const MIN_DISTANCE = 3
const MAX_DISTANCE = 95
const ZOOM_STEP = 1.25
const FIELD_OF_VIEW = 42

/**
 * Camera framing for the shared 3D building. The building bounds come from
 * the same floor maps and floor elevations the scene is drawn from; nothing
 * here alters geometry or routes. OrbitControls keeps drag-to-orbit,
 * right-drag/two-finger pan, and wheel/pinch zoom.
 */
const getBuildingFrame = (floors, viewMode) => {
  const mapped = floors.filter((floor) => floor.map)
  const top = Math.max(...mapped.map((floor) => getFloorElevation(floor.id, floors, viewMode)))
  const halfX = (Math.max(...mapped.map((floor) => floor.map.width)) * MAP3D_CONFIG.mapScale) / 2
  const halfZ = (Math.max(...mapped.map((floor) => floor.map.height)) * MAP3D_CONFIG.mapScale) / 2
  const halfY = top / 2 + MAP3D_CONFIG.roomHeight
  return { center: new Vector3(0, top / 2, 0), radius: Math.hypot(halfX, halfY, halfZ) }
}

export default function CameraController({ request, floors, facilities, viewMode, selectedFloorId, reducedMotion }) {
  const controlsRef = useRef(null)
  const transitionActiveRef = useRef(true)
  const { camera } = useThree()
  const size = useThree((state) => state.size)
  const desired = useRef({ position: new Vector3(16, 15, 18), target: new Vector3(0, 3, 0) })
  const floor = floors.find((item) => item.id === selectedFloorId)
  const facilityMap = useMemo(() => new Map(facilities.map((item) => [item.id, item])), [facilities])
  const aspect = size.width > 0 && size.height > 0 ? size.width / size.height : 1

  useEffect(() => {
    const action = request?.action || "building"
    const controls = controlsRef.current
    const currentTarget = controls?.target ? controls.target.clone() : new Vector3(0, 3, 0)
    const currentOffset = camera.position.clone().sub(currentTarget)
    const currentDirection = currentOffset.lengthSq() > 0 ? currentOffset.clone().normalize() : DEFAULT_DIRECTION.clone()
    const building = getBuildingFrame(floors, viewMode)
    // Landscape views are limited by the short vertical extent, so a slightly
    // tight sphere still shows the whole building; portrait views are limited by
    // its width, so they keep the full bounding sphere to avoid clipping the sides.
    const fitMargin = aspect < 1 ? 1 : 0.95
    const fitDistance = MathUtils.clamp(getFitDistance({ radius: building.radius, fovDeg: FIELD_OF_VIEW, aspect, margin: fitMargin }), MIN_DISTANCE, MAX_DISTANCE)

    let target = building.center
    let direction = currentDirection
    let distance = fitDistance
    if (action === "reset") {
      direction = DEFAULT_DIRECTION.clone()
    } else if (action === "zoom-in" || action === "zoom-out") {
      target = currentTarget
      distance = MathUtils.clamp(currentOffset.length() * (action === "zoom-in" ? 1 / ZOOM_STEP : ZOOM_STEP), MIN_DISTANCE, MAX_DISTANCE)
    } else if (action === "floor" && floor) {
      target = new Vector3(0, getFloorElevation(floor.id, floors, viewMode), 0)
      direction = DEFAULT_DIRECTION.clone()
      distance = MathUtils.clamp(fitDistance * 0.52, 12, MAX_DISTANCE)
    } else if (action === "facility" && request.facilityId) {
      const facility = facilityMap.get(request.facilityId)
      const facilityFloor = floors.find((item) => item.id === facility?.floorId)
      const point = getFacilityWorldPosition({ facilityId: request.facilityId, floor: facilityFloor, floors, viewMode })
      if (point) {
        target = new Vector3(point.x, point.y - 0.6, point.z)
        direction = DEFAULT_DIRECTION.clone()
        distance = 10.5
      }
    }
    desired.current = { target, position: target.clone().add(direction.multiplyScalar(distance)) }
    transitionActiveRef.current = true
    if (reducedMotion) {
      camera.position.copy(desired.current.position)
      controls?.target.copy(desired.current.target)
      controls?.update()
    }
  // The aspect is read when a request is made; a resize alone does not move the camera.
  }, [camera, facilityMap, floor, floors, reducedMotion, request, viewMode]) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    if (!controlsRef.current || reducedMotion || !transitionActiveRef.current) return
    const alpha = 1 - Math.exp(-MathUtils.clamp(delta * 5, 0, 1))
    camera.position.lerp(desired.current.position, alpha)
    controlsRef.current.target.lerp(desired.current.target, alpha)
    controlsRef.current.update()
    if (camera.position.distanceTo(desired.current.position) < 0.015 && controlsRef.current.target.distanceTo(desired.current.target) < 0.015) {
      transitionActiveRef.current = false
    }
  })

  return <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.12} minDistance={MIN_DISTANCE} maxDistance={MAX_DISTANCE} minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.05} onStart={() => { transitionActiveRef.current = false }} />
}
