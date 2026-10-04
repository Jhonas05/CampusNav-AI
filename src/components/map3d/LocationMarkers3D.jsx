/* eslint-disable react/no-unknown-property */
import { MAP3D_CONFIG } from "@/data/map3dConfig"
import { MAP_COLORS } from "@/lib/facilityCategories"
import { mapToWorld, worldToArray } from "@/lib/map3d"

const nodePosition = ({ nodeId, nodes, floors, viewMode }) => {
  const node = nodes.find((item) => item.id === nodeId)
  return node ? worldToArray(mapToWorld({ ...node, floors, viewMode, verticalOffset: MAP3D_CONFIG.markerOffset })) : null
}

/**
 * Current-location, destination, and QR-checkpoint markers, placed through
 * the same central 2D→3D transform as every other map feature.
 */
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
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
            <ringGeometry args={[0.2, 0.27, 32]} />
            <meshBasicMaterial color={MAP_COLORS.current} transparent opacity={0.35} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.07, 24]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.08, 24]} />
            <meshBasicMaterial color={MAP_COLORS.current} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.075, 14, 14]} />
            <meshBasicMaterial color={MAP_COLORS.current} />
          </mesh>
        </group>
      )}
      {destination && (
        <group position={destination}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
            <ringGeometry args={[0.16, 0.24, 32]} />
            <meshBasicMaterial color={MAP_COLORS.destination} />
          </mesh>
          <mesh position={[0, 0.2, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.1, 0.26, 18]} />
            <meshBasicMaterial color={MAP_COLORS.destination} />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <sphereGeometry args={[0.12, 18, 18]} />
            <meshBasicMaterial color={MAP_COLORS.destination} />
          </mesh>
        </group>
      )}
    </group>
  )
}
