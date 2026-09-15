import { Html, Line } from "@react-three/drei"
import { mapToWorld, worldToArray } from "@/lib/map3d"

const debugPoint = ({ node, floors, viewMode, offset = 0.48 }) => worldToArray(mapToWorld({ ...node, floors, viewMode, verticalOffset: offset }))

export default function DebugOverlay3D({ nodes, edges, floors, viewMode, selectedFloorId, isolateFloor, options }) {
  if (!options) return null
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const visibleNodes = nodes.filter((node) => !isolateFloor || node.floorId === selectedFloorId)
  const visibleEdges = edges.filter((edge) => {
    if (edge.type === "FLOOR_TRANSITION") return options.show3DStairConnections && (!isolateFloor || edge.floorId === selectedFloorId || nodeMap.get(edge.to)?.floorId === selectedFloorId)
    return options.show3DGraphEdges && (!isolateFloor || edge.floorId === selectedFloorId)
  })

  return (
    <group>
      {visibleEdges.map((edge) => {
        const from = nodeMap.get(edge.from)
        const to = nodeMap.get(edge.to)
        if (!from || !to) return null
        return <Line key={edge.id} points={[debugPoint({ node: from, floors, viewMode }), debugPoint({ node: to, floors, viewMode })]} color={edge.type === "FLOOR_TRANSITION" ? "#1D1D1F" : "#86868B"} lineWidth={edge.type === "FLOOR_TRANSITION" ? 2 : 1} transparent opacity={0.55} />
      })}
      {options.show3DNavigationNodes && visibleNodes.map((node) => (
        <group key={node.id} position={debugPoint({ node, floors, viewMode, offset: 0.54 })}>
          <mesh><sphereGeometry args={[0.055, 7, 7]} /><meshBasicMaterial color="#000000" /></mesh>
          {options.show3DNodeIds && <Html position={[0, 0.12, 0]} center distanceFactor={17} style={{ pointerEvents: "none" }}><span className="whitespace-nowrap bg-white/85 px-1 font-mono text-[7px] text-black">{node.id}</span></Html>}
        </group>
      ))}
    </group>
  )
}
