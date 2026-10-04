import { useCallback, useMemo } from "react"
import { MAP_NODE_TYPES } from "@/data/mapNodes"
import { getFloorById } from "@/data/floors"
import EmergencyMapOverlay from "@/components/map/EmergencyMapOverlay"
import usePanZoom2D from "@/components/map/usePanZoom2D"
import { getFacilityCategory, MAP_COLORS } from "@/lib/facilityCategories"
import { getPolygonBox } from "@/lib/mapViewport"
import { cn } from "@/lib/utils"

const LABEL_FONT = "Archivo, Arial, sans-serif"
const HEADING_FONT = "'Barlow Condensed', 'Arial Narrow', Archivo, Arial, sans-serif"

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

/**
 * Direction chevrons are placed on the midpoints of the canonical route
 * segments, in node-sequence order. They never add or smooth geometry.
 */
const routeChevrons = (routeNodes) => routeNodes.slice(1).flatMap((node, index) => {
  const from = routeNodes[index]
  if (from.floorId !== node.floorId || edgeLength(from, node) < 42) return []
  return [{
    id: `${from.id}--${node.id}`,
    x: (from.x + node.x) / 2,
    y: (from.y + node.y) / 2,
    angle: (Math.atan2(node.y - from.y, node.x - from.x) * 180) / Math.PI,
  }]
})

/**
 * Labels the stair nodes where the displayed floor segment leaves for, or
 * arrives from, another floor. Derived only from the route's own floor order.
 */
const transitionMarkers = (route, floorId) => {
  if (!route?.nodes?.length || !route.routeFloorIds || route.routeFloorIds.length < 2) return []
  const floorIndex = route.routeFloorIds.indexOf(floorId)
  if (floorIndex < 0) return []
  const level = getFloorById(floorId)?.level ?? 0
  const markers = []
  const first = route.nodes[0]
  const last = route.nodes.at(-1)
  if (floorIndex > 0 && first.type === MAP_NODE_TYPES.STAIRS) {
    const otherFloorId = route.routeFloorIds[floorIndex - 1]
    markers.push({ node: first, up: level > (getFloorById(otherFloorId)?.level ?? 0), label: `FROM ${otherFloorId}` })
  }
  if (floorIndex < route.routeFloorIds.length - 1 && last.type === MAP_NODE_TYPES.STAIRS && last.id !== first.id) {
    const otherFloorId = route.routeFloorIds[floorIndex + 1]
    const up = (getFloorById(otherFloorId)?.level ?? 0) > level
    markers.push({ node: last, up, label: `${up ? "UP" : "DOWN"} TO ${otherFloorId}` })
  }
  return markers
}

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
  selectedFacilityId = null,
  viewRequest = null,
  defaultView = "fit",
  cooperativeGestures = false,
  interactive = true,
}) {
  const facilityMap = useMemo(() => new Map(facilities.map((facility) => [facility.id, facility])), [facilities])
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const entranceNodes = nodes.filter((node) => node.type === MAP_NODE_TYPES.ROOM_ENTRANCE)
  const routePoints = route?.nodes.map((node) => `${node.x},${node.y}`).join(" ") || ""
  const chevrons = useMemo(() => (route?.nodes?.length > 1 ? routeChevrons(route.nodes) : []), [route])
  const transitions = useMemo(() => transitionMarkers(route, floor?.id), [route, floor?.id])
  const isDebugMode = Boolean(debugOptions)
  const routeColor = emergencyMode ? MAP_COLORS.emergencyRoute : MAP_COLORS.route

  // Presentation-only viewport (pan, zoom, fit, facility focus). Focus targets
  // come from the same room polygons drawn below; no coordinates are added.
  const mapWidth = floor?.map?.width
  const mapHeight = floor?.map?.height
  const content = useMemo(() => (mapWidth && mapHeight ? { width: mapWidth, height: mapHeight } : null), [mapWidth, mapHeight])
  const rooms = floor?.map?.rooms
  const getFacilityBox = useCallback((facilityId) => getPolygonBox(rooms?.find((room) => room.facilityId === facilityId)?.polygon), [rooms])
  const viewport = usePanZoom2D({
    content,
    contentKey: `${floor?.id}:${mapWidth}x${mapHeight}`,
    defaultMode: defaultView,
    cooperative: cooperativeGestures,
    request: viewRequest,
    getFacilityBox,
    enabled: interactive,
  })

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
  const startMarkerNodeId = route ? route.startEntranceNodeId : currentNodeId

  return (
    <div
      ref={viewport.viewportRef}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "group" : undefined}
      aria-roledescription={interactive ? "map" : undefined}
      aria-label={interactive ? `${floor.name} map. Drag to pan; scroll or pinch to zoom${cooperativeGestures ? " (hold Ctrl or ⌘ while scrolling)" : ""}. With the map focused, arrow keys pan and plus or minus zoom.` : undefined}
      data-map-viewport="2d"
      className={cn(
        "ink-grid-paper relative h-full w-full select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink",
        interactive && (viewport.dragging ? "cursor-grabbing" : "cursor-grab"),
      )}
      style={interactive ? { touchAction: viewport.touchAction } : undefined}
      {...(interactive ? viewport.handlers : {})}
    >
      <svg
        role="img"
        aria-label={`${floor.name} source-aligned indoor navigation map with estimated geometry`}
        className="map-semantic absolute inset-0 block h-full w-full"
        fontFamily={LABEL_FONT}
      >
        <g ref={viewport.layerRef} transform={viewport.transform} data-map-layer="2d">
        <defs>
          <pattern id="stair-lines" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#F4F4F3" />
            <path d="M0 2h8M0 6h8" stroke={MAP_COLORS.stairs} strokeWidth="0.9" />
          </pattern>
          <pattern id="construction-lines" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="12" height="12" fill="#F2F2F1" />
            <path d="M0 0V12" stroke="#A3A3A6" strokeWidth="3" />
          </pattern>
          <filter id="reference-grayscale">
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        <rect x="0" y="0" width={floor.map.width} height={floor.map.height} fill={MAP_COLORS.paper} stroke={MAP_COLORS.hallwayLine} />

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
            <polygon points={polygonPoints(hallway.polygon)} fill={MAP_COLORS.hallway} fillOpacity={isDebugMode && debugOptions.showOverlay ? 0.46 : 1} stroke={MAP_COLORS.hallwayLine} strokeWidth="1" />
            {!isDebugMode && !emergencyMode && (
              <text x={hallway.labelPoint.x} y={hallway.labelPoint.y} textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily={HEADING_FONT} fill={MAP_COLORS.labelMuted} letterSpacing="2">
                {hallway.label.toUpperCase()}
              </text>
            )}
          </g>
        ))}

        {floor.map.stairways.map((stairway) => (
          <g key={stairway.id}>
            <polygon points={polygonPoints(stairway.polygon)} fill="url(#stair-lines)" fillOpacity={isDebugMode && debugOptions.showOverlay ? 0.5 : 1} stroke={MAP_COLORS.stairs} strokeWidth="1.2" />
            <text x={stairway.labelPoint.x} y={stairway.labelPoint.y + 4} textAnchor="middle" fontSize="9" fontWeight="700" fontFamily={HEADING_FONT} letterSpacing="1" fill="#2B2B2D" paintOrder="stroke" stroke="#F4F4F3" strokeWidth="3">
              STAIRS
            </text>
          </g>
        ))}

        {showRooms && floor.map.rooms.map((room) => {
          const facility = facilityMap.get(room.facilityId)
          if (!facility) return null
          const isStart = facility.id === startFacilityId
          const isDestination = !emergencyMode && facility.id === destinationFacilityId
          const isSelected = facility.id === selectedFacilityId && !isDestination && !isStart
          const emphasized = isStart || isDestination
          const isArrived = isDestination && navigationStatus === "arrived"
          const underConstruction = room.status === "UNDER_CONSTRUCTION"
          const category = getFacilityCategory(facility)
          const { width } = polygonBounds(room.polygon)
          const lines = splitLabel(facility.name, width < 120 ? 12 : 22)
          const navigable = room.navigable !== false && room.entranceNodeIds.length > 0
          const interactive = navigable && !emergencyMode
          const fill = isArrived
            ? MAP_COLORS.arrivedFill
            : underConstruction
              ? "url(#construction-lines)"
              : isDestination
                ? MAP_COLORS.destinationTint
                : isStart
                  ? "#E4E4E5"
                  : category.map.fill
          const baseOpacity = isDestination || isStart || isArrived || underConstruction ? 1 : 0.62

          return (
            <g
              key={room.id}
              data-facility-id={facility.id}
              onClick={interactive ? () => onRoomSelect?.(facility.id) : undefined}
              onKeyDown={interactive ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  onRoomSelect?.(facility.id)
                }
              } : undefined}
              className={interactive ? "map-room cursor-pointer" : "map-room"}
              tabIndex={interactive ? 0 : undefined}
              role={interactive ? "button" : "group"}
              aria-label={interactive ? `Select ${facility.name}` : underConstruction ? `${facility.name}; under construction; not navigable` : facility.name}
            >
              <polygon
                className="map-room-shape"
                points={polygonPoints(room.polygon)}
                fill={fill}
                fillOpacity={isDebugMode && debugOptions.showOverlay && !isArrived ? 0.54 : baseOpacity}
                stroke={isDestination ? MAP_COLORS.destination : isStart ? MAP_COLORS.current : isSelected ? MAP_COLORS.selected : MAP_COLORS.wall}
                strokeWidth={emphasized ? 2.6 : isSelected ? 2.2 : 1.1}
                strokeDasharray={isSelected ? "6 4" : undefined}
              />
              {(!emergencyMode || emphasized || underConstruction) && <text
                x={room.labelPoint.x}
                y={room.labelPoint.y - ((lines.length - 1) * 7)}
                textAnchor="middle"
                fontSize={width < 120 ? "10" : "12"}
                fontWeight={emphasized || isSelected ? "700" : "600"}
                fill={isArrived ? "#FFFFFF" : MAP_COLORS.label}
                paintOrder="stroke"
                stroke={isArrived ? MAP_COLORS.arrivedFill : MAP_COLORS.paper}
                strokeWidth="2.5"
                strokeLinejoin="round"
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
                  stroke={MAP_COLORS.paper}
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
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#1D1F20" strokeWidth="2" strokeDasharray="5 4" opacity="0.72" />
              {debugOptions.showGraphLabels && (
                <text x={midpoint.x} y={midpoint.y - 5} textAnchor="middle" fontSize="7" fontWeight="700" fill="#1D1F20" paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3">
                  {edge.id} · {edgeLength(from, to).toFixed(1)}u
                </text>
              )}
            </g>
          )
        })}

        {routePoints && (
          <g data-testid="route-2d" pointerEvents="none">
            <polyline points={routePoints} fill="none" stroke={MAP_COLORS.routeCasing} strokeOpacity="0.95" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
            {!emergencyMode && <polyline points={routePoints} fill="none" stroke={MAP_COLORS.routeOutline} strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />}
            <polyline
              points={routePoints}
              fill="none"
              stroke={routeColor}
              strokeWidth={emergencyMode ? "7" : "6.5"}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={emergencyMode ? "14 8" : undefined}
            />
            {chevrons.map((chevron) => (
              <path
                key={chevron.id}
                d="M-3.2 -3.4L1.8 0L-3.2 3.4"
                transform={`translate(${chevron.x} ${chevron.y}) rotate(${chevron.angle})`}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
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

        {transitions.map(({ node, up, label }) => (
          <g key={`transition-${node.id}`} pointerEvents="none">
            <rect x={node.x - 11} y={node.y - 11} width="22" height="22" rx="3" fill="#FFFFFF" stroke={routeColor} strokeWidth="2.5" />
            <path
              d={up
                ? `M${node.x} ${node.y + 5}V${node.y - 5}M${node.x - 4} ${node.y - 1}L${node.x} ${node.y - 5}L${node.x + 4} ${node.y - 1}`
                : `M${node.x} ${node.y - 5}V${node.y + 5}M${node.x - 4} ${node.y + 1}L${node.x} ${node.y + 5}L${node.x + 4} ${node.y + 1}`}
              fill="none"
              stroke={routeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x={node.x} y={node.y - 18} textAnchor="middle" fontSize="9" fontWeight="700" fontFamily={HEADING_FONT} letterSpacing="0.8" fill={emergencyMode ? "#7A1A14" : MAP_COLORS.routeOutline} paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3.5">
              STAIRS · {label}
            </text>
          </g>
        ))}

        {entranceNodes.filter((node) => !emergencyMode || node.id === currentNodeId).map((node) => {
          const isStart = startMarkerNodeId
            ? node.id === startMarkerNodeId
            : !route && node.facilityId === startFacilityId && node.isPrimary
          const isDestination = !emergencyMode && (node.id === route?.destinationEntranceNodeId || (!route && node.facilityId === destinationFacilityId && node.isPrimary))
          if (emergencyMode) return null

          if (isDestination) {
            const arrived = navigationStatus === "arrived"
            return (
              <g key={node.id} pointerEvents="none" data-marker="destination">
                <circle cx={node.x} cy={node.y} r="3" fill={MAP_COLORS.routeOutline} />
                <path
                  d={`M${node.x} ${node.y - 2}L${node.x - 7.5} ${node.y - 14}A9.5 9.5 0 1 1 ${node.x + 7.5} ${node.y - 14}Z`}
                  fill={MAP_COLORS.destination}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx={node.x} cy={node.y - 19.5} r="3.4" fill="#FFFFFF" />
                <text x={node.x} y={node.y - 35} textAnchor="middle" fontSize="9.5" fontWeight="700" fontFamily={HEADING_FONT} letterSpacing="1" fill={MAP_COLORS.routeOutline} paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3.5">
                  {arrived ? "ARRIVED" : "DESTINATION"}
                </text>
              </g>
            )
          }

          if (isStart) {
            return (
              <g key={node.id} pointerEvents="none" data-marker="current-location">
                <circle cx={node.x} cy={node.y} r="15" fill={MAP_COLORS.current} fillOpacity="0.1" stroke={MAP_COLORS.current} strokeOpacity="0.35" strokeWidth="1" />
                <circle cx={node.x} cy={node.y} r="7.5" fill={MAP_COLORS.current} stroke="#FFFFFF" strokeWidth="2.5" />
                <text x={node.x} y={node.y - 20} textAnchor="middle" fontSize="9.5" fontWeight="700" fontFamily={HEADING_FONT} letterSpacing="1" fill={MAP_COLORS.current} paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3.5">
                  YOU ARE HERE
                </text>
              </g>
            )
          }

          return <circle key={node.id} cx={node.x} cy={node.y} r="2.6" fill="#7A7A7D" stroke="#FFFFFF" strokeWidth="0.8" pointerEvents="none" />
        })}

        {isDebugMode && debugOptions.showNodes && nodes.map((node) => (
          <g key={`debug-${node.id}`}>
            <circle cx={node.x} cy={node.y} r="5" fill="#FFFFFF" stroke="#1D1F20" strokeWidth="2" />
            {debugOptions.showGraphLabels && (
              <text x={node.x + 7} y={node.y - 7} fontSize="7" fontWeight="700" fill="#1D1F20" paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3">
                {node.id} [{node.type}]
              </text>
            )}
          </g>
        ))}
        </g>
      </svg>
      {viewport.hint && (
        <p role="status" className="pointer-events-none absolute inset-x-0 bottom-1/2 mx-auto w-fit max-w-[90%] translate-y-1/2 rounded-xl bg-ink/85 px-3 py-2 text-center text-xs font-medium text-on-ink">
          Hold Ctrl (or ⌘) and scroll to zoom the map
        </p>
      )}
    </div>
  )
}
