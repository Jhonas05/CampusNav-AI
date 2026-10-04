import { useTheme } from "@/contexts/ThemeContext"
import { Canvas, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState } from "react"
import Building3D from "./Building3D"
import CameraController from "./CameraController"
import DebugOverlay3D from "./DebugOverlay3D"
import EmergencyOverlay3D from "./EmergencyOverlay3D"
import LocationMarkers3D from "./LocationMarkers3D"
import Map3DControls from "./Map3DControls"
import Route3D from "./Route3D"
import { MAP3D_VIEW_MODES } from "@/data/map3dConfig"

const SCENE_BACKGROUND = { light: "#F3F3F2", dark: "#101011" }

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener?.("change", update)
    return () => query.removeEventListener?.("change", update)
  }, [])
  return reduced
}

/** Applies the theme backdrop to the existing renderer without recreating it. */
function SceneBackdrop({ color }) {
  const gl = useThree((state) => state.gl)
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    gl.setClearColor(color)
    invalidate()
  }, [color, gl, invalidate])
  return null
}

export default function Campus3D({
  floors,
  facilities,
  nodes,
  edges,
  route,
  selectedFloorId,
  selectedFacilityId,
  destinationFacilityId,
  destinationNodeId,
  currentFacilityId,
  currentNodeId,
  activeStep,
  instructionCount,
  navigationStatus,
  emergencyMode,
  emergencyExits,
  emergencyEquipment,
  emergencyApprovedEdges,
  checkpoints,
  debugOptions,
  onFacilitySelect,
  onUse2D,
  onWebGLFailure,
  cameraCommand = null,
  active = true,
  showToolbar = true,
  showCameraTools = true,
}) {
  const { resolvedTheme } = useTheme()
  const reducedMotion = useReducedMotion()
  const [viewMode, setViewMode] = useState(MAP3D_VIEW_MODES.EXPLODED)
  const [isolateFloor, setIsolateFloor] = useState(false)
  const [animateRoute, setAnimateRoute] = useState(!reducedMotion)
  const [cameraRequest, setCameraRequest] = useState({ action: "building", key: 0 })
  const requestCamera = (action, facilityId = null) => setCameraRequest((request) => ({ action, facilityId, key: request.key + 1 }))
  const mountedFloorRef = useRef(false)

  // Reset returns to the default exploded whole-building view.
  const runCameraAction = (action, facilityId = null) => {
    if (action === "reset") {
      setViewMode(MAP3D_VIEW_MODES.EXPLODED)
      setIsolateFloor(false)
    }
    requestCamera(action, facilityId)
  }

  useEffect(() => { if (reducedMotion) setAnimateRoute(false) }, [reducedMotion])

  // Commands from the page's shared map controls (zoom, fit, reset, focus).
  useEffect(() => {
    if (cameraCommand) runCameraAction(cameraCommand.action, cameraCommand.facilityId ?? selectedFacilityId ?? null)
  }, [cameraCommand?.key]) // eslint-disable-line react-hooks/exhaustive-deps

  // The viewed floor is shared navigation state owned by the Navigate page;
  // when it changes (floor selector, route floor, step advance) the camera
  // focuses that floor. The initial mount keeps the whole-building view.
  useEffect(() => {
    if (!mountedFloorRef.current) {
      mountedFloorRef.current = true
      return
    }
    requestCamera("floor")
  }, [selectedFloorId])

  useEffect(() => {
    if (selectedFacilityId) requestCamera("facility", selectedFacilityId)
  }, [selectedFacilityId])

  // Only the scene backdrop follows the theme; floor, room, and route colors
  // keep their map semantics in both themes.
  const sceneBackground = SCENE_BACKGROUND[resolvedTheme] || SCENE_BACKGROUND.light
  const canvasCamera = useMemo(() => ({ position: /** @type {[number, number, number]} */ ([16, 15, 18]), fov: 42, near: 0.1, far: 180 }), [])
  const routePreviewRunning = Boolean(route) && animateRoute && !reducedMotion && (navigationStatus === "active")

  return (
    <div data-testid="campus-3d" data-map-viewport="3d" className="relative h-full min-h-[inherit] overflow-hidden" style={{ backgroundColor: sceneBackground }}>
      {showToolbar && (
        <Map3DControls
          viewMode={viewMode}
          isolateFloor={isolateFloor}
          animateRoute={animateRoute}
          reducedMotion={reducedMotion}
          canFocusFacility={Boolean(selectedFacilityId)}
          showCameraTools={showCameraTools}
          onViewModeChange={setViewMode}
          onIsolateChange={setIsolateFloor}
          onAnimateChange={setAnimateRoute}
          onCameraAction={(action) => runCameraAction(action, action === "facility" ? selectedFacilityId : null)}
          onUse2D={onUse2D}
          className={showCameraTools
            ? "absolute inset-x-2 top-[7rem] z-10 sm:inset-x-auto sm:right-3 sm:top-3 sm:max-w-[calc(100%-15.5rem)]"
            : "absolute left-2 right-[3.75rem] top-[6.5rem] z-10 sm:left-auto sm:right-[4.25rem] sm:top-3 sm:max-w-[calc(100%-19.75rem)]"}
        />
      )}
      {routePreviewRunning && (
        <p className={showCameraTools
          ? "pointer-events-none absolute right-2 top-[10rem] z-10 rounded-md border border-line-strong bg-surface/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-soft sm:right-3 sm:top-[3.75rem]"
          : "pointer-events-none absolute left-2 top-[9.5rem] z-10 rounded-md border border-line-strong bg-surface/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-soft sm:left-auto sm:right-[4.25rem] sm:top-[3.75rem]"}
        >
          Route preview animation · not your live position
        </p>
      )}
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={canvasCamera}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor(sceneBackground)
          gl.domElement.addEventListener("webglcontextlost", (event) => { event.preventDefault(); onWebGLFailure?.() }, { once: true })
        }}
      >
        <SceneBackdrop color={sceneBackground} />
        <hemisphereLight args={["#FFFFFF", "#D9D9D6", 1.25]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[12, 22, 10]} intensity={1.8} />
        <directionalLight position={[-14, 10, -12]} intensity={0.35} />
        <Building3D
          floors={floors}
          facilities={facilities}
          viewMode={viewMode}
          selectedFloorId={selectedFloorId}
          isolateFloor={isolateFloor}
          reducedMotion={reducedMotion}
          selectedFacilityId={selectedFacilityId}
          destinationFacilityId={destinationFacilityId}
          currentFacilityId={currentFacilityId}
          onFacilitySelect={onFacilitySelect}
          debugOptions={debugOptions}
        />
        <Route3D route={route} floors={floors} viewMode={viewMode} emergencyMode={emergencyMode} selectedFloorId={selectedFloorId} isolateFloor={isolateFloor} activeStep={activeStep} instructionCount={instructionCount} navigationStatus={navigationStatus} animateRoute={animateRoute} reducedMotion={reducedMotion} showRoutePoints={debugOptions?.show3DRoutePoints} />
        <LocationMarkers3D currentNodeId={currentNodeId} destinationNodeId={destinationNodeId} checkpoints={checkpoints} nodes={nodes} floors={floors} viewMode={viewMode} />
        <EmergencyOverlay3D emergencyMode={emergencyMode} exits={emergencyExits} equipment={emergencyEquipment} approvedEdges={emergencyApprovedEdges} nodes={nodes} floors={floors} viewMode={viewMode} isolateFloor={isolateFloor} selectedFloorId={selectedFloorId} debugOptions={debugOptions} />
        <DebugOverlay3D nodes={nodes} edges={edges} floors={floors} viewMode={viewMode} selectedFloorId={selectedFloorId} isolateFloor={isolateFloor} options={debugOptions} />
        <CameraController request={cameraRequest} floors={floors} facilities={facilities} viewMode={viewMode} selectedFloorId={selectedFloorId} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}
