import { MAP3D_CONFIG } from "@/data/map3dConfig"
import { MAP_COLORS } from "@/lib/facilityCategories"
import { mapToWorld, worldToArray } from "@/lib/map3d"

const nodePosition = ({ nodeId, nodes, floors, viewMode }) => {
  const node = nodes.find((item) => item.id === nodeId)
  return node ? worldToArray(mapToWorld({ ...node, floors, viewMode, verticalOffset: MAP3D_CONFIG.markerOffset })) : null
}

export default function LocationMarkers3D({ currentNodeId, destinationNodeId, checkpoints, nodes, floors, viewMode }) {
  const current = nodePosition({ nodeId: currentNodeId, nodes, floors, viewMode })
  const destination = nodePosition({ nodeId: destinationNodeId, nodes, floors, viewMode })
  return (
    <group>
      {checkpoints.map((checkpoint) => {
        const position = nodePosition({ nodeId: checkpoint.nodeId, nodes, floors, viewMode })
        if (!position) return null
        return (
          <mesh key={checkpoint.id} position={position} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.13, 0.04, 0.13]} />
            <meshBasicMaterial color="#6E6E73" wireframe />
          </mesh>
        )
      })}
      {current && (
        <group position={current}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.16, 0.08, 20]} />
            <meshBasicMaterial color={MAP_COLORS.current} />
          </mesh>
          <mesh position={[0, 0.17, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color={MAP_COLORS.current} />
          </mesh>
        </group>
      )}
      {destination && (
        <group position={destination} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.18, 0.045, 8, 24]} />
            <meshBasicMaterial color={MAP_COLORS.destination} />
          </mesh>
        </group>
      )}
    </group>
  )
}
