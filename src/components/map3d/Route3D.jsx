import { Line } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import { MAP_COLORS } from "@/lib/facilityCategories"
import { isEmergencyRouteRenderable, routeNodesToWorld, routeToWorldSegments, worldToArray } from "@/lib/map3d"

const segmentProgress = (index, count, activeStep, instructionCount, navigationStatus) => {
  if (navigationStatus === "arrived") return "complete"
  if (!instructionCount || navigationStatus !== "active") return "upcoming"
  const currentSegment = Math.min(count - 1, Math.floor((activeStep / Math.max(1, instructionCount - 1)) * count))
  if (index < currentSegment) return "complete"
  if (index === currentSegment) return "current"
  return "upcoming"
}

function RouteMarker({ points, enabled, reducedMotion, color }) {
  const markerRef = useRef(null)
  const distances = useMemo(() => {
    let total = 0
    const values = points.map((point, index) => {
      if (index) total += Math.hypot(point.x - points[index - 1].x, point.y - points[index - 1].y, point.z - points[index - 1].z)
      return total
    })
    return { values, total }
  }, [points])

  useFrame(({ clock }) => {
    if (!markerRef.current || !enabled || reducedMotion || points.length < 2 || distances.total <= 0) return
    const target = (clock.getElapsedTime() * 1.4) % distances.total
    let index = distances.values.findIndex((value) => value >= target)
    if (index <= 0) index = 1
    const from = points[index - 1]
    const to = points[index]
    const segmentStart = distances.values[index - 1]
    const ratio = (target - segmentStart) / Math.max(0.001, distances.values[index] - segmentStart)
    markerRef.current.position.set(
      from.x + (to.x - from.x) * ratio,
      from.y + (to.y - from.y) * ratio + 0.08,
      from.z + (to.z - from.z) * ratio
    )
  })

  if (!enabled || reducedMotion || points.length < 2) return null
  return (
    <mesh ref={markerRef} position={worldToArray(points[0])}>
      <sphereGeometry args={[0.11, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

export default function Route3D({
  route,
  floors,
  viewMode,
  emergencyMode,
  selectedFloorId,
  isolateFloor,
  activeStep,
  instructionCount,
  navigationStatus,
  animateRoute,
  reducedMotion,
  showRoutePoints,
}) {
  const eligibleRoute = !emergencyMode || isEmergencyRouteRenderable(route)
  const segments = useMemo(() => eligibleRoute ? routeToWorldSegments({ route, floors, viewMode }) : [], [eligibleRoute, floors, route, viewMode])
  const points = useMemo(() => eligibleRoute ? routeNodesToWorld({ route, floors, viewMode }) : [], [eligibleRoute, floors, route, viewMode])
  const visibleSegments = isolateFloor
    ? segments.filter((segment) => segment.from.floorId === selectedFloorId || segment.to.floorId === selectedFloorId)
    : segments

  if (!route || !eligibleRoute) return null
  return (
    <group>
      {visibleSegments.map((segment, index) => {
        const state = segmentProgress(index, segments.length, activeStep, instructionCount, navigationStatus)
        const vertical = segment.edgeType === "FLOOR_TRANSITION" || segment.from.floorId !== segment.to.floorId
        const palette = emergencyMode
          ? { current: MAP_COLORS.emergencyRoute, complete: "#7F1D1D", upcoming: "#FCA5A5" }
          : { current: MAP_COLORS.route, complete: MAP_COLORS.routeComplete, upcoming: MAP_COLORS.routeUpcoming }
        return (
          <Line
            key={segment.id}
            points={[worldToArray(segment.from), worldToArray(segment.to)]}
            color={palette[state]}
            lineWidth={state === "current" ? 5 : vertical ? 4 : 3}
            dashed={state === "upcoming" || emergencyMode}
            dashSize={0.22}
            gapSize={0.13}
            transparent
            opacity={state === "upcoming" ? 0.78 : 1}
          />
        )
      })}
      {showRoutePoints && points.map((point) => (
        <mesh key={point.nodeId} position={worldToArray(point)}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color={emergencyMode ? MAP_COLORS.emergencyRoute : MAP_COLORS.route} />
        </mesh>
      ))}
      <RouteMarker points={points} enabled={animateRoute && navigationStatus === "active"} reducedMotion={reducedMotion} color={emergencyMode ? MAP_COLORS.emergencyRoute : MAP_COLORS.route} />
    </group>
  )
}
