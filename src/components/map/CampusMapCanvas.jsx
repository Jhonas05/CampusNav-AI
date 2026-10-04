import { MapPin } from "lucide-react"
import { lazy, Suspense, useMemo } from "react"
import IndoorMap2D from "@/components/map/IndoorMap2D"
import Map3DErrorBoundary from "@/components/map3d/Map3DErrorBoundary"
import { emergencyEquipment } from "@/data/emergencyEquipment"
import { emergencyExits } from "@/data/emergencyExits"
import { emergencyApprovedEdges } from "@/data/emergencyRoutes"
import { facilities } from "@/data/facilities"
import { floors, getFloorById } from "@/data/floors"
import { mapEdges } from "@/data/mapEdges"
import { mapNodes } from "@/data/mapNodes"
import { qrCheckpoints } from "@/data/qrCheckpoints"

const Campus3D = lazy(() => import("@/components/map3d/Campus3D"))

/** Loading surface shown while the lazy 3D renderer downloads. */
export function MapLoading({ label = "Loading campus map…" }) {
  return (
    <div role="status" className="ink-grid-paper flex h-full min-h-[inherit] items-center justify-center bg-canvas p-6 text-center">
      <span className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink-soft shadow-soft">{label}</span>
    </div>
  )
}

/**
 * The single CampusNav map renderer used by Navigate, Home, and Dashboard.
 * It always draws the canonical floor maps, facilities, graph nodes/edges,
 * QR checkpoints, and emergency records imported here — callers supply only
 * view and navigation state (viewed floor, route, markers, selection), never
 * geometry. 2D is `IndoorMap2D`; 3D is the lazily loaded `Campus3D`, which
 * transforms the same coordinates through `mapToWorld`. Only the active view
 * is mounted.
 * @param {Record<string, any>} props
 */
export default function CampusMapCanvas(props) {
  const {
    mapView = "2D",
    viewedFloorId,
    route2D = null,
    route3D = null,
    emergencyMode = false,
    startFacilityId = null,
    currentNodeId = null,
    destinationFacilityId = null,
    destinationNodeId = null,
    selectedFacilityId = null,
    navigationStatus = "idle",
    activeStep = 0,
    instructionCount = 0,
    debugOptions = null,
    onRoomSelect,
    onFacilitySelect,
    onUse2D,
    on3DFailure,
    view2DRequest = null,
    view2DDefault = "fit",
    cooperativeGestures = false,
    camera3DCommand = null,
    active3D = true,
    show3DToolbar = true,
    show3DCameraTools = true,
    loadingLabel = "Preparing 3D campus view…",
  } = props

  const floor = getFloorById(viewedFloorId)
  const floorNodes = useMemo(() => mapNodes.filter((node) => node.floorId === viewedFloorId), [viewedFloorId])
  const floorEdges = useMemo(() => mapEdges.filter((edge) => edge.floorId === viewedFloorId && edge.type !== "FLOOR_TRANSITION"), [viewedFloorId])
  const floorExits = useMemo(() => emergencyExits.filter((exit) => exit.floorId === viewedFloorId), [viewedFloorId])
  const floorEquipment = useMemo(() => emergencyEquipment.filter((item) => item.floorId === viewedFloorId), [viewedFloorId])
  const floorEmergencyEdges = useMemo(() => emergencyApprovedEdges.filter((edge) => edge.floorId === viewedFloorId && edge.type !== "FLOOR_TRANSITION"), [viewedFloorId])

  if (mapView === "3D") {
    return (
      <Map3DErrorBoundary resetKey={mapView} onFailure={on3DFailure} onReturnTo2D={onUse2D}>
        <Suspense fallback={<MapLoading label={loadingLabel} />}>
          <Campus3D
            floors={floors}
            facilities={facilities}
            nodes={mapNodes}
            edges={mapEdges}
            route={route3D}
            selectedFloorId={viewedFloorId}
            selectedFacilityId={selectedFacilityId}
            destinationFacilityId={emergencyMode ? null : destinationFacilityId}
            destinationNodeId={destinationNodeId}
            currentFacilityId={startFacilityId}
            currentNodeId={currentNodeId}
            activeStep={activeStep}
            instructionCount={instructionCount}
            navigationStatus={navigationStatus}
            emergencyMode={emergencyMode}
            emergencyExits={emergencyExits}
            emergencyEquipment={emergencyEquipment}
            emergencyApprovedEdges={emergencyApprovedEdges}
            checkpoints={qrCheckpoints}
            debugOptions={debugOptions}
            onFacilitySelect={onFacilitySelect}
            onUse2D={onUse2D}
            onWebGLFailure={on3DFailure}
            cameraCommand={camera3DCommand}
            active={active3D}
            showToolbar={show3DToolbar}
            showCameraTools={show3DCameraTools}
          />
        </Suspense>
      </Map3DErrorBoundary>
    )
  }

  if (!floor?.map) {
    return (
      <div className="ink-grid-paper flex h-full items-center justify-center p-8 text-center">
        <div className="max-w-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-line-strong bg-surface">
            <MapPin className="h-5 w-5 text-ink-faint" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-heading text-xl font-semibold">{floor?.name} map pending</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">A verified floor plan and room coordinates are required before indoor routing can be enabled here.</p>
        </div>
      </div>
    )
  }

  return (
    <IndoorMap2D
      floor={floor}
      facilities={facilities}
      nodes={floorNodes}
      edges={floorEdges}
      route={route2D}
      startFacilityId={startFacilityId}
      destinationFacilityId={emergencyMode ? null : destinationFacilityId}
      navigationStatus={navigationStatus}
      onRoomSelect={onRoomSelect}
      debugOptions={debugOptions}
      emergencyMode={emergencyMode}
      emergencyExits={floorExits}
      emergencyEquipment={floorEquipment}
      emergencyApprovedEdges={floorEmergencyEdges}
      currentNodeId={currentNodeId}
      selectedFacilityId={selectedFacilityId}
      viewRequest={view2DRequest}
      defaultView={view2DDefault}
      cooperativeGestures={cooperativeGestures}
    />
  )
}
