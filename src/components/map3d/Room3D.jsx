/* eslint-disable react/no-unknown-property */
import { Line } from "@react-three/drei"
import { memo, useEffect, useMemo, useState } from "react"
import { createExtrudedPolygonGeometry } from "./geometry3d"
import FacilityLabel3D from "./FacilityLabel3D"
import { MAP3D_CONFIG } from "@/data/map3dConfig"
import { getFacilityCategory, MAP_COLORS } from "@/lib/facilityCategories"
import { getRoom3DState } from "@/lib/map3d"

const polygonBounds = (points) => ({
  minX: Math.min(...points.map((point) => point.x)),
  maxX: Math.max(...points.map((point) => point.x)),
  minZ: Math.min(...points.map((point) => point.z)),
  maxZ: Math.max(...points.map((point) => point.z)),
})

const ConstructionHatch = ({ points, height, opacity }) => {
  const bounds = polygonBounds(points)
  const width = bounds.maxX - bounds.minX
  const depth = bounds.maxZ - bounds.minZ
  return Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4
    const x = bounds.minX + width * ratio
    return <Line key={index} points={[[x, height, bounds.minZ], [Math.min(bounds.maxX, x + depth), height, bounds.maxZ]]} color="#3D3D3F" lineWidth={1} transparent opacity={opacity} />
  })
}

function Room3D({ room, facility, points, opacity, selected, destination, current, showLabel, showGeometry, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const state = getRoom3DState(room)
  const restricted = state !== "NAVIGABLE"
  const geometry = useMemo(() => createExtrudedPolygonGeometry(points, MAP3D_CONFIG.wallHeight), [points])
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => { if (hovered) document.body.style.cursor = "" }, [hovered])
  const outline = [...points.map((point) => [point.x, MAP3D_CONFIG.wallHeight + 0.02, point.z]), [points[0].x, MAP3D_CONFIG.wallHeight + 0.02, points[0].z]]
  const labelPosition = [
    points.reduce((sum, point) => sum + point.x, 0) / points.length,
    MAP3D_CONFIG.wallHeight + 0.2,
    points.reduce((sum, point) => sum + point.z, 0) / points.length,
  ]
  const category = getFacilityCategory(facility)
  const fill = restricted
    ? "#B7B7BA"
    : destination
      ? "#B9DCC6"
      : current
        ? "#CFCFD2"
        : selected
          ? MAP_COLORS.destinationTint
          : hovered
            ? category.map.stroke
            : category.map.fill

  if (!showGeometry) return null
  return (
    <group>
      <mesh
        geometry={geometry}
        position={[0, MAP3D_CONFIG.floorThickness / 2, 0]}
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer" }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "" }}
        onClick={(event) => {
          event.stopPropagation()
          // A release after orbiting/panning is not a selection (same 4px rule as 2D).
          if (event.delta > 4) return
          if (facility) onSelect?.(facility.id)
        }}
        frustumCulled
      >
        <meshStandardMaterial color={fill} transparent opacity={opacity} roughness={0.92} metalness={0} depthWrite={opacity > 0.2} />
      </mesh>
      <Line points={outline} color={destination ? MAP_COLORS.destination : current ? MAP_COLORS.current : selected ? MAP_COLORS.selected : "#9A9A9D"} lineWidth={selected || destination || current ? 2.6 : 1} transparent opacity={opacity} />
      {state === "UNDER_CONSTRUCTION" && <ConstructionHatch points={points} height={MAP3D_CONFIG.wallHeight + 0.05} opacity={opacity} />}
      {showLabel && facility && <FacilityLabel3D position={labelPosition} label={state === "UNDER_CONSTRUCTION" ? `${facility.name} · UNDER CONSTRUCTION` : facility.name} strong={selected || destination || current} />}
    </group>
  )
}

export default memo(Room3D)
