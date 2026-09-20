/* eslint-disable react/no-unknown-property */
import { Html, Line } from "@react-three/drei"
import { memo, useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { MathUtils } from "three"
import Room3D from "./Room3D"
import { createExtrudedPolygonGeometry } from "./geometry3d"
import { MAP3D_CONFIG } from "@/data/map3dConfig"
import { getFloorElevation, getLargestRooms, mapToWorld } from "@/lib/map3d"

const PolygonSurface = ({ points, height = 0.04, color = "#D2D2D7", opacity = 1 }) => {
  const geometry = useMemo(() => createExtrudedPolygonGeometry(points, height), [height, points])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh geometry={geometry} frustumCulled>
      <meshStandardMaterial color={color} transparent opacity={opacity} roughness={1} depthWrite={opacity > 0.2} />
    </mesh>
  )
}

function Floor3D({
  floor,
  floors,
  facilities,
  viewMode,
  selectedFloorId,
  isolateFloor,
  reducedMotion,
  selectedFacilityId,
  destinationFacilityId,
  currentFacilityId,
  onFacilitySelect,
  debugOptions,
}) {
  const groupRef = useRef(null)
  const elevation = getFloorElevation(floor.id, floors, viewMode)
  const selectedFloor = floor.id === selectedFloorId
  const opacity = isolateFloor && !selectedFloor ? 0.06 : selectedFloor ? 1 : 0.28
  const facilityMap = useMemo(() => new Map(facilities.map((facility) => [facility.id, facility])), [facilities])
  const majorRoomIds = useMemo(() => new Set(getLargestRooms(floor.map.rooms.filter((room) => room.navigable !== false), 8).map((room) => room.id)), [floor.map.rooms])
  const width = floor.map.width * MAP3D_CONFIG.mapScale
  const depth = floor.map.height * MAP3D_CONFIG.mapScale
  const localPoints = (polygon, verticalOffset = 0) => polygon.map((point) => {
    const world = mapToWorld({ ...point, floorId: floor.id, floors, viewMode, verticalOffset })
    return { ...world, y: world.y - elevation }
  })

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const target = elevation + (selectedFloor && !isolateFloor ? 0.12 : 0)
    groupRef.current.position.y = reducedMotion ? target : MathUtils.damp(groupRef.current.position.y, target, 7, delta)
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]} visible={!isolateFloor || selectedFloor || opacity > 0.01}>
      <mesh position={[0, -MAP3D_CONFIG.floorThickness / 2, 0]} receiveShadow frustumCulled>
        <boxGeometry args={[width, MAP3D_CONFIG.floorThickness, depth]} />
        <meshStandardMaterial color={selectedFloor ? "#F5F5F7" : "#E8E8ED"} transparent opacity={opacity} roughness={1} depthWrite={opacity > 0.2} />
      </mesh>

      {floor.map.hallways.map((hallway) => <PolygonSurface key={hallway.id} points={localPoints(hallway.polygon, 0.01)} color="#C7C7CC" opacity={opacity} />)}
      {floor.map.stairways.map((stairway) => {
        const points = localPoints(stairway.polygon, 0.04)
        const outline = [...points.map((point) => [point.x, 0.18, point.z]), [points[0].x, 0.18, points[0].z]]
        return <group key={stairway.id}><PolygonSurface points={points} height={0.16} color="#86868B" opacity={opacity} /><Line points={outline} color="#1D1D1F" lineWidth={1.5} transparent opacity={opacity} /></group>
      })}

      {floor.map.rooms.map((room) => {
        const facility = facilityMap.get(room.facilityId)
        const highlighted = room.facilityId === selectedFacilityId
        const destination = room.facilityId === destinationFacilityId
        const current = room.facilityId === currentFacilityId
        const showLabel = selectedFloor && (majorRoomIds.has(room.id) || highlighted || destination || current)
        return (
          <Room3D
            key={room.id}
            room={room}
            facility={facility}
            points={localPoints(room.polygon)}
            opacity={opacity}
            selected={highlighted}
            destination={destination}
            current={current}
            showLabel={showLabel}
            showGeometry={!debugOptions || debugOptions.show3DFacilityPolygons}
            onSelect={onFacilitySelect}
          />
        )
      })}

      <Html position={[-width / 2 - 0.8, MAP3D_CONFIG.wallHeight, -depth / 2]} center distanceFactor={13} style={{ pointerEvents: "none" }}>
        <div className={`rounded-lg border px-3 py-2 text-center shadow-sm ${selectedFloor ? "border-[#1D1D1F] bg-[#1D1D1F] text-white" : "border-[#B8B8BD] bg-white/90 text-[#1D1D1F]"}`}>
          <p className="text-sm font-bold">{floor.shortName}</p>
          {debugOptions?.show3DFloorElevations && <p className="mt-0.5 whitespace-nowrap text-[8px] opacity-70">Y {elevation.toFixed(2)} · ESTIMATED</p>}
        </div>
      </Html>
    </group>
  )
}

export default memo(Floor3D)
