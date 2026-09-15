import { Canvas } from "@react-three/fiber"
import { useEffect, useMemo, useState } from "react"
import Building3D from "./Building3D"
import CameraController from "./CameraController"
import DebugOverlay3D from "./DebugOverlay3D"
import EmergencyOverlay3D from "./EmergencyOverlay3D"
import LocationMarkers3D from "./LocationMarkers3D"
import Map3DControls from "./Map3DControls"
import Route3D from "./Route3D"
import { MAP3D_CONFIG, MAP3D_VIEW_MODES } from "@/data/map3dConfig"

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
  onFloorSelect,
  onFacilitySelect,
  onUse2D,
  onWebGLFailure,
}) {
  const reducedMotion = useReducedMotion()
  const [viewMode, setViewMode] = useState(MAP3D_VIEW_MODES.EXPLODED)
  const [isolateFloor, setIsolateFloor] = useState(false)
  const [animateRoute, setAnimateRoute] = useState(!reducedMotion)
  const [cameraRequest, setCameraRequest] = useState({ action: "building", key: 0 })
  const requestCamera = (action, facilityId = null) => setCameraRequest((request) => ({ action, facilityId, key: request.key + 1 }))

  useEffect(() => { if (reducedMotion) setAnimateRoute(false) }, [reducedMotion])
  useEffect(() => {
    if (selectedFacilityId) requestCamera("facility", selectedFacilityId)
  }, [selectedFacilityId])

  const canvasCamera = useMemo(() => ({ position: /** @type {[number, number, number]} */ ([16, 15, 18]), fov: 42, near: 0.1, far: 180 }), [])

  return (
    <div data-testid="campus-3d" className="relative min-h-[610px] overflow-hidden bg-[#F5F5F7]">
      <Map3DControls
        floors={floors}
        selectedFloorId={selectedFloorId}
        viewMode={viewMode}
        isolateFloor={isolateFloor}
        animateRoute={animateRoute}
        reducedMotion={reducedMotion}
        onFloorSelect={(nextFloorId) => { onFloorSelect(nextFloorId); requestCamera("floor") }}
        onViewModeChange={setViewMode}
        onIsolateChange={setIsolateFloor}
        onAnimateChange={setAnimateRoute}
        onCameraAction={requestCamera}
        onUse2D={onUse2D}
      />
      <Canvas
        dpr={[1, 1.5]}
        camera={canvasCamera}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#F5F5F7")
          gl.domElement.addEventListener("webglcontextlost", (event) => { event.preventDefault(); onWebGLFailure?.() }, { once: true })
        }}
      >
        <ambientLight intensity={1.65} />
        <directionalLight position={[12, 22, 10]} intensity={2.1} />
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
      <div aria-label="3D map legend" className="pointer-events-none absolute bottom-3 left-3 right-14 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-[#E5E5E7] bg-white/95 px-3.5 py-2.5 text-[8px] font-semibold uppercase tracking-wide text-[#48484A] shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur sm:right-auto sm:max-w-[calc(100%-88px)]">
        <span className="inline-flex items-center"><b aria-hidden="true" className="mr-1.5 inline-block h-2 w-2 rounded-full bg-blue-600" />You are here</span>
        <span className="inline-flex items-center"><b aria-hidden="true" className="mr-1.5 inline-block h-2 w-2 rounded-full border-2 border-red-600 bg-white" />Destination</span>
        <span className="inline-flex items-center"><b aria-hidden="true" className="mr-1.5 inline-block h-0.5 w-4 bg-[#1E7A45] align-middle" />Route</span>
        <span>▰ Stairs</span><span className="text-green-700">▣ Exit</span><span>◇ QR checkpoint</span><span>▨ Blocked / construction</span>
        <span className="basis-full text-[#86868B]">Vertical dimensions: {MAP3D_CONFIG.verticalDimensionStatus}</span>
      </div>
    </div>
  )
}
