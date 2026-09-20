import { useMemo } from "react"
import { MAP_NODE_TYPES } from "@/data/mapNodes"
import EmergencyMapOverlay from "@/components/map/EmergencyMapOverlay"
import { getFacilityCategory, MAP_COLORS } from "@/lib/facilityCategories"

const polygonPoints = (polygon) => polygon.map((point) => `${point.x},${point.y}`).join(" ")

const polygonBounds = (polygon) => {
  const xValues = polygon.map((point) => point.x)
  const yValues = polygon.map((point) => point.y)
  const minX = Math.min(...xValues)
  const maxX = Math.max(...xValues)
  const minY = Math.min(...yValues)
  const maxY = Math.max(...yValues)
  return { width: maxX - minX, height: maxY - minY }
}

const splitLabel = (label, maxLength = 19) => {
  const words = label.split(" ")
  const lines = []
  let current = ""

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxLength && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  })
  if (current) lines.push(current)
  return lines.slice(0, 3)
}

const edgeLength = (from, to) => Math.hypot(to.x - from.x, to.y - from.y)

export default function IndoorMap2D({
  floor,
  facilities,
  nodes,
  edges,
  route,
  startFacilityId,
  destinationFacilityId,
  navigationStatus,
  onRoomSelect = undefined,
  debugOptions = null,
  emergencyMode = false,
  emergencyExits = [],
  emergencyEquipment = [],
  emergencyApprovedEdges = [],
  currentNodeId = null,
}) {
  const facilityMap = useMemo(() => new Map(facilities.map((facility) => [facility.id, facility])), [facilities])
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const entranceNodes = nodes.filter((node) => node.type === MAP_NODE_TYPES.ROOM_ENTRANCE)
  const routePoints = route?.nodes.map((node) => `${node.x},${node.y}`).join(" ") || ""
  const isDebugMode = Boolean(debugOptions)

  if (!floor?.map) return null

  const overlay = floor.map.referenceOverlay
  const overlaySettings = debugOptions || overlay
  const centerX = floor.map.width / 2
  const centerY = floor.map.height / 2
  const overlayTransform = [
    `translate(${overlaySettings.offsetX || 0} ${overlaySettings.offsetY || 0})`,
    `translate(${centerX} ${centerY})`,
    `rotate(${overlaySettings.rotation || 0})`,
    `scale(${overlaySettings.scale || 1})`,
    `translate(${-centerX} ${-centerY})`,
  ].join(" ")
  const showRooms = !isDebugMode || debugOptions.showRooms

  return (
    <div className="h-full w-full overflow-auto bg-[#F5F5F7] p-4 sm:p-6">
      <svg
        viewBox={`0 0 ${floor.map.width} ${floor.map.height}`}
        role="img"
        aria-label={`${floor.name} source-aligned indoor navigation map with estimated geometry`}
        className="block min-w-[860px] rounded-2xl border border-[#E5E5E7] bg-white"
      >
        <defs>
          <pattern id="stair-lines" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M0 2h10M0 7h10" stroke="#8E8E93" strokeWidth="1" />
          </pattern>
          <pattern id="construction-lines" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="12" height="12" fill="#F5F5F7" />
            <path d="M0 0V12" stroke="#9CA3AF" strokeWidth="3" />
          </pattern>
          <filter id="reference-grayscale">
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        <rect x="0" y="0" width={floor.map.width} height={floor.map.height} fill="#FAFAFB" />

        {isDebugMode && debugOptions.showOverlay && overlay?.imageUrl && (
          <g transform={overlayTransform} pointerEvents="none">
            <image
              href={overlay.imageUrl}
              x="0"
              y="0"
              width={floor.map.width}
              height={floor.map.height}
              opacity={debugOptions.opacity}
              preserveAspectRatio="none"
              filter="url(#reference-grayscale)"
            />
          </g>
        )}

        {floor.map.hallways.map((hallway) => (
          <g key={hallway.id}>
            <polygon points={polygonPoints(hallway.polygon)} fill="#EFEFF3" fillOpacity={isDebugMode && debugOptions.showOverlay ? 0.46 : 1} stroke="#D6D6DB" />
            {!isDebugMode && !emergencyMode && (
              <text x={hallway.labelPoint.x} y={hallway.labelPoint.y} textAnchor="middle" fontSize="11" fill="#86868B" letterSpacing="1.2">
                {hallway.label.toUpperCase()}
              </text>
            )}
          </g>
        ))}

        {floor.map.stairways.map((stairway) => (
          <g key={stairway.id}>
            <polygon points={polygonPoints(stairway.polygon)} fill="url(#stair-lines)" fillOpacity={isDebugMode && debugOptions.showOverlay ? 0.5 : 1} stroke="#8E8E93" />
            <text x={stairway.labelPoint.x} y={stairway.labelPoint.y + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="#3D3D3F">
              STAIRS
            </text>
          </g>
        ))}

        {showRooms && floor.map.rooms.map((room) => {
          const facility = facilityMap.get(room.facilityId)
          if (!facility) return null
          const isStart = facility.id === startFacilityId
          const isDestination = !emergencyMode && facility.id === destinationFacilityId
          const selected = isStart || isDestination
          const isArrived = isDestination && navigationStatus === "arrived"
          const category = getFacilityCategory(facility)
          const { width } = polygonBounds(room.polygon)
          const lines = splitLabel(facility.name, width < 120 ? 12 : 22)
          const navigable = room.navigable !== false && room.entranceNodeIds.length > 0

          return (
            <g
              key={room.id}
              onClick={navigable && !emergencyMode ? () => onRoomSelect?.(facility.id) : undefined}
              onKeyDown={navigable && !emergencyMode ? (event) => {
                if (event.key === "Enter" || event.key === " ") onRoomSelect?.(facility.id)
              } : undefined}
              className={navigable && !emergencyMode ? "cursor-pointer" : undefined}
              tabIndex={navigable && !emergencyMode ? 0 : undefined}
              role={navigable && !emergencyMode ? "button" : "group"}
              aria-label={navigable && !emergencyMode ? `Select ${facility.name}` : room.status === "UNDER_CONSTRUCTION" ? `${facility.name}; under construction; not navigable` : facility.name}
            >
              <polygon
                points={polygonPoints(room.polygon)}
                fill={isArrived ? MAP_COLORS.arrivedFill : room.status === "UNDER_CONSTRUCTION" ? "url(#construction-lines)" : category.map.fill}
                fillOpacity={isDebugMode && debugOptions.showOverlay && !isArrived ? 0.54 : 1}
                stroke={isDestination ? MAP_COLORS.destination : isStart ? MAP_COLORS.current : category.map.stroke}
                strokeWidth={selected ? "3" : "1.4"}
              />
              {(!emergencyMode || selected || room.status === "UNDER_CONSTRUCTION") && <text
                x={room.labelPoint.x}
                y={room.labelPoint.y - ((lines.length - 1) * 7)}
                textAnchor="middle"
                fontSize={width < 120 ? "10" : "12"}
                fontWeight="600"
                fill={isArrived ? "#FFFFFF" : "#1D1D1F"}
              >
                {lines.map((line, index) => (
                  <tspan key={`${line}-${index}`} x={room.labelPoint.x} dy={index === 0 ? 0 : 14}>{line}</tspan>
                ))}
              </text>}
              {room.entranceSegments.map((segment, index) => (
                <line
                  key={`${room.id}-door-${index}`}
                  x1={segment.from.x}
                  y1={segment.from.y}
                  x2={segment.to.x}
                  y2={segment.to.y}
                  stroke="#FAFAFB"
                  strokeWidth="7"
                />
              ))}
            </g>
          )
        })}

        {isDebugMode && debugOptions.showEdges && edges.map((edge) => {
          const from = nodeMap.get(edge.from)
          const to = nodeMap.get(edge.to)
          if (!from || !to) return null
          const midpoint = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
          return (
            <g key={edge.id}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#1D1D1F" strokeWidth="2" strokeDasharray="5 4" opacity="0.72" />
              {debugOptions.showGraphLabels && (
                <text x={midpoint.x} y={midpoint.y - 5} textAnchor="middle" fontSize="7" fontWeight="700" fill="#1D1D1F" paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3">
                  {edge.id} · {edgeLength(from, to).toFixed(1)}u
                </text>
              )}
            </g>
          )
        })}

        {routePoints && (
          <>
            <polyline points={routePoints} fill="none" stroke={MAP_COLORS.routeCasing} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
            <polyline
              points={routePoints}
              fill="none"
              stroke={emergencyMode ? MAP_COLORS.emergencyRoute : MAP_COLORS.route}
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={emergencyMode ? "14 8" : undefined}
            />
          </>
        )}

        {emergencyMode && (
          <EmergencyMapOverlay
            nodes={nodes}
            exits={emergencyExits}
            equipment={emergencyEquipment}
            approvedEdges={emergencyApprovedEdges}
            currentNodeId={currentNodeId}
            debugOptions={debugOptions}
          />
        )}

        {route?.nodes.filter((node) => node.type === MAP_NODE_TYPES.STAIRS).map((node) => (
          <g key={`transition-${node.id}`}>
            <circle cx={node.x} cy={node.y} r="11" fill="#FFFFFF" stroke={emergencyMode ? MAP_COLORS.emergencyRoute : MAP_COLORS.route} strokeWidth="3" />
            <path d={`M${node.x} ${node.y + 5}V${node.y - 5}M${node.x - 4} ${node.y - 1}L${node.x} ${node.y - 5}L${node.x + 4} ${node.y - 1}`} fill="none" stroke={emergencyMode ? MAP_COLORS.emergencyRoute : MAP_COLORS.route} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <text x={node.x} y={node.y - 18} textAnchor="middle" fontSize="8" fontWeight="800" fill={emergencyMode ? MAP_COLORS.emergencyRoute : MAP_COLORS.route} paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3">FLOOR TRANSITION</text>
          </g>
        ))}

        {entranceNodes.filter((node) => !emergencyMode || node.id === currentNodeId).map((node) => {
          const isStart = node.id === route?.startEntranceNodeId || (!route && node.facilityId === startFacilityId && node.isPrimary)
          const isDestination = node.id === route?.destinationEntranceNodeId || (!route && node.facilityId === destinationFacilityId && node.isPrimary)
          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={isStart || isDestination ? 7 : 3.5}
                fill={isDestination ? "#FFFFFF" : isStart ? MAP_COLORS.current : "#6E6E73"}
                stroke={isDestination ? MAP_COLORS.destination : isStart ? "#FFFFFF" : "#55555A"}
                strokeWidth={isDestination ? 3 : isStart ? 2.5 : 1}
              />
              {(isStart || isDestination) && (
                <text
                  x={node.x}
                  y={node.y - 13}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="800"
                  fill={isStart ? MAP_COLORS.current : navigationStatus === "arrived" ? MAP_COLORS.arrivedFill : MAP_COLORS.destination}
                  paintOrder="stroke"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                >
                  {isStart ? "START" : navigationStatus === "arrived" ? "ARRIVED" : "DESTINATION"}
                </text>
              )}
            </g>
          )
        })}

        {isDebugMode && debugOptions.showNodes && nodes.map((node) => (
          <g key={`debug-${node.id}`}>
            <circle cx={node.x} cy={node.y} r="5" fill="#FFFFFF" stroke="#1D1D1F" strokeWidth="2" />
            {debugOptions.showGraphLabels && (
              <text x={node.x + 7} y={node.y - 7} fontSize="7" fontWeight="700" fill="#1D1D1F" paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3">
                {node.id} [{node.type}]
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
