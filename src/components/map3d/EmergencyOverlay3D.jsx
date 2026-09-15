import { Html, Line } from "@react-three/drei"
import { EMERGENCY_EQUIPMENT_TYPES } from "@/data/emergencyEquipment"
import { MAP3D_CONFIG } from "@/data/map3dConfig"
import { mapToWorld, worldToArray } from "@/lib/map3d"

const visibleOnFloor = (floorId, isolateFloor, selectedFloorId) => !isolateFloor || floorId === selectedFloorId

export default function EmergencyOverlay3D({
  emergencyMode,
  exits,
  equipment,
  approvedEdges,
  nodes,
  floors,
  viewMode,
  isolateFloor,
  selectedFloorId,
  debugOptions,
}) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const showExits = emergencyMode || debugOptions?.showEmergencyExits
  const showEquipment = emergencyMode || debugOptions?.showEmergencyEquipment
  const showEdges = emergencyMode || debugOptions?.showEmergencyApprovedEdges
  /** @param {number} offset */
  const markerPosition = (item, offset = Number(MAP3D_CONFIG.markerOffset)) => worldToArray(mapToWorld({ ...item, floors, viewMode, verticalOffset: offset }))

  return (
    <group>
      {showEdges && approvedEdges.filter((edge) => visibleOnFloor(edge.floorId, isolateFloor, selectedFloorId)).map((edge) => {
        const from = nodeMap.get(edge.from)
        const to = nodeMap.get(edge.to)
        if (!from || !to) return null
        return <Line key={edge.id} points={[markerPosition(from, 0.36), markerPosition(to, 0.36)]} color="#48484A" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} transparent opacity={0.5} />
      })}
      {showExits && exits.filter((item) => visibleOnFloor(item.floorId, isolateFloor, selectedFloorId)).map((item) => (
        <group key={item.id} position={markerPosition(item)}>
          <mesh>
            <boxGeometry args={[0.24, 0.28, 0.08]} />
            <meshBasicMaterial color="#1D1D1F" />
          </mesh>
          <Html position={[0, 0.31, 0]} center distanceFactor={14} style={{ pointerEvents: "none" }}>
            <span className="whitespace-nowrap rounded-md border border-[#1D1D1F] bg-white/95 px-2 py-1 text-[8px] font-bold text-[#1D1D1F]">EXIT</span>
          </Html>
        </group>
      ))}
      {showEquipment && equipment.filter((item) => visibleOnFloor(item.floorId, isolateFloor, selectedFloorId)).map((item) => {
        const extinguisher = item.type === EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER
        return (
          <group key={item.id} position={markerPosition(item, 0.52)}>
            <mesh>
              {extinguisher ? <cylinderGeometry args={[0.075, 0.09, 0.24, 10]} /> : <octahedronGeometry args={[0.12, 0]} />}
              <meshBasicMaterial color={extinguisher ? "#48484A" : "#86868B"} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
