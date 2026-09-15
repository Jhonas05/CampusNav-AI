import { OrbitControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { MathUtils, Vector3 } from "three"
import { MAP3D_CONFIG, MAP3D_VIEW_MODES } from "@/data/map3dConfig"
import { getFacilityWorldPosition, getFloorElevation } from "@/lib/map3d"

export default function CameraController({ request, floors, facilities, viewMode, selectedFloorId, reducedMotion }) {
  const controlsRef = useRef(null)
  const transitionActiveRef = useRef(true)
  const { camera } = useThree()
  const desired = useRef({ position: new Vector3(16, 15, 18), target: new Vector3(0, 3, 0) })
  const floor = floors.find((item) => item.id === selectedFloorId)
  const facilityMap = useMemo(() => new Map(facilities.map((item) => [item.id, item])), [facilities])

  useEffect(() => {
    const action = request?.action || "building"
    let target = new Vector3(0, viewMode === MAP3D_VIEW_MODES.EXPLODED ? 7 : 4, 0)
    let distance = Number(MAP3D_CONFIG.cameraDistance)
    if (action === "floor" && floor) {
      target = new Vector3(0, getFloorElevation(floor.id, floors, viewMode), 0)
      distance = 17
    } else if (action === "facility" && request.facilityId) {
      const facility = facilityMap.get(request.facilityId)
      const facilityFloor = floors.find((item) => item.id === facility?.floorId)
      const point = getFacilityWorldPosition({ facilityId: request.facilityId, floor: facilityFloor, floors, viewMode })
      if (point) {
        target = new Vector3(point.x, point.y - 0.6, point.z)
        distance = 9
      }
    }
    desired.current = {
      target,
      position: target.clone().add(new Vector3(distance * 0.68, distance * 0.58, distance * 0.74)),
    }
    transitionActiveRef.current = true
    if (reducedMotion) {
      camera.position.copy(desired.current.position)
      controlsRef.current?.target.copy(desired.current.target)
      controlsRef.current?.update()
    }
  }, [camera, facilityMap, floor, floors, reducedMotion, request, viewMode])

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

  return <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.08} minDistance={5} maxDistance={55} minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.05} onStart={() => { transitionActiveRef.current = false }} />
}
