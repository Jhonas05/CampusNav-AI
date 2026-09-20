import { ChevronLeft, ChevronRight, Circle, CircleAlert, LocateFixed, MapPin, Navigation, QrCode, Search, ShieldAlert } from "lucide-react"
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { button, focusRing, InkKicker } from "@/components/campus/ui"
import IndoorMap2D from "@/components/map/IndoorMap2D"
import LocationConfirmationDialog from "@/components/map/LocationConfirmationDialog"
import MapLegend from "@/components/map/MapLegend"
import MobileRouteSheet from "@/components/map/MobileRouteSheet"
import RouteSummaryPanel from "@/components/map/RouteSummaryPanel"
import Map3DErrorBoundary from "@/components/map3d/Map3DErrorBoundary"
import { emergencyEquipment } from "@/data/emergencyEquipment"
import { emergencyExits } from "@/data/emergencyExits"
import { emergencyApprovedEdges } from "@/data/emergencyRoutes"
import { FACILITY_DATA_NOTICE, facilities, getFacilitiesByFloor, getFacilityById } from "@/data/facilities"
import { floors, getFloorById } from "@/data/floors"
import { MAP3D_GEOMETRY_NOTICE } from "@/data/map3dConfig"
import { mapEdges } from "@/data/mapEdges"
import { getFacilityEntranceNode, getFacilityEntranceNodes, mapNodes } from "@/data/mapNodes"
import { getCheckpointsByFloor, qrCheckpoints } from "@/data/qrCheckpoints"
import { applyLocationResolution, INVALID_CHECKPOINT_MESSAGE, POSITIONING_METHOD, resolveCheckpointPayload, resolveManualCheckpoint, resolveManualPosition } from "@/lib/checkpointPositioning"
import { buildMapVerificationReport } from "@/lib/mapValidation"
import { advanceNavigationProgress, calculateFacilityRoute, generateNavigationInstructions, getRouteSegmentForFloor } from "@/lib/navigation"
import { buildEmergencyVerificationReport, findNearestVerifiedExit, generateEmergencyInstructions, getEmergencyRouteSegmentForFloor } from "@/lib/emergencyNavigation"
import { supportsWebGL } from "@/lib/webgl"
import { cn } from "@/lib/utils"

const Campus3D = lazy(() => import("@/components/map3d/Campus3D"))
const MapVerificationPanel = lazy(() => import("@/components/map/MapVerificationPanel"))
const QRScanner = lazy(() => import("@/components/map/QRScanner"))
const EmergencyModePanel = lazy(() => import("@/components/map/EmergencyModePanel"))

const normalize = (value) => value.trim().toLowerCase()

const fieldLabelClass = "mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6E73]"
const fieldClass = "h-12 w-full rounded-xl border border-[#D2D2D7] bg-white px-4 text-sm font-medium text-[#1D1D1F] outline-none transition-colors duration-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
const alertClass = "flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"

const createCalibrationOptions = (floor) => ({
  ...floor?.map?.referenceOverlay,
  showOverlay: true,
  showNodes: true,
  showEdges: true,
  showRooms: true,
  showGraphLabels: true,
  showEmergencyExits: true,
  showEmergencyEquipment: true,
  showEmergencyApprovedEdges: true,
  showEmergencyRouteIds: false,
  showEmergencyVerificationStatus: false,
  show3DNavigationNodes: false,
  show3DGraphEdges: false,
  show3DFacilityPolygons: true,
  show3DStairConnections: false,
  show3DNodeIds: false,
  show3DFloorElevations: false,
  show3DRoutePoints: false,
})

export default function Navigate() {
  const [searchParams] = useSearchParams()
  const emergencyMode = searchParams.get("mode") === "emergency"
  const requestedFacility = getFacilityById(searchParams.get("facility"))
  const initialFloorId = requestedFacility?.floorId || "3F"
  const requestedFacilityIsNavigable = requestedFacility && getFacilityEntranceNodes(requestedFacility.id, requestedFacility.floorId).length > 0
  const initialDestination = requestedFacilityIsNavigable ? requestedFacility : getFacilityById("virtual-laboratory")
  const initialCurrentFacilityId = initialFloorId === "3F" ? "library" : getFacilitiesByFloor(initialFloorId).find((facility) => facility.navigable !== false)?.id || ""
  const initialPosition = resolveManualPosition({ floorId: initialFloorId, facilityId: initialCurrentFacilityId })

  const [floorId, setFloorId] = useState(initialFloorId)
  const [currentPosition, setCurrentPosition] = useState(initialPosition.location)
  const [destinationId, setDestinationId] = useState(initialDestination?.id || "")
  const [destinationQuery, setDestinationQuery] = useState(initialDestination?.name || "")
  const [route, setRoute] = useState(null)
  const [instructions, setInstructions] = useState([])
  const [navigationStatus, setNavigationStatus] = useState("idle")
  const [activeStep, setActiveStep] = useState(0)
  const [routeError, setRouteError] = useState("")
  const [calibrationOptions, setCalibrationOptions] = useState(() => createCalibrationOptions(getFloorById("3F")))
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanError, setScanError] = useState("")
  const [locationConfirmation, setLocationConfirmation] = useState(null)
  const [emergencyResult, setEmergencyResult] = useState(null)
  const [emergencyInstructions, setEmergencyInstructions] = useState([])
  const [mapView, setMapView] = useState("2D")
  const [map3DMessage, setMap3DMessage] = useState("")
  const [selectedFacilityId, setSelectedFacilityId] = useState(null)

  const floor = getFloorById(floorId)
  const currentFloorId = currentPosition.currentFloorId
  const floorFacilities = useMemo(() => getFacilitiesByFloor(currentFloorId), [currentFloorId])
  const navigableFacilities = useMemo(
    () => floorFacilities.filter((facility) => facility.navigable !== false && getFacilityEntranceNodes(facility.id, currentFloorId).length > 0),
    [floorFacilities, currentFloorId]
  )
  const allNavigableFacilities = useMemo(
    () => facilities.filter((facility) => facility.navigable !== false && getFacilityEntranceNodes(facility.id, facility.floorId).length > 0),
    []
  )
  const floorCheckpoints = useMemo(() => getCheckpointsByFloor(currentFloorId), [currentFloorId])
  const currentLocation = getFacilityById(currentPosition.currentFacilityId)
  const destination = getFacilityById(destinationId)
  const selectedFacility = getFacilityById(selectedFacilityId)
  const currentSelectorValue = currentPosition.checkpointId
    ? `checkpoint:${currentPosition.checkpointId}`
    : `facility:${currentPosition.currentFacilityId}`
  const developerModeAvailable = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MAP_VERIFICATION === "true"
  const developerMode = developerModeAvailable && searchParams.get("verify") === "1"
  const viewedFloorFacilities = useMemo(() => getFacilitiesByFloor(floorId), [floorId])
  const floorNodes = useMemo(() => mapNodes.filter((node) => node.floorId === floorId), [floorId])
  const floorEdges = useMemo(() => mapEdges.filter((edge) => edge.floorId === floorId && edge.type !== "FLOOR_TRANSITION"), [floorId])
  const activeRoute = emergencyMode ? emergencyResult?.route || null : route
  const displayedRoute = useMemo(
    () => emergencyMode ? getEmergencyRouteSegmentForFloor(activeRoute, floorId) : getRouteSegmentForFloor(activeRoute, floorId),
    [activeRoute, emergencyMode, floorId]
  )
  const floorEmergencyExits = useMemo(() => emergencyExits.filter((exit) => exit.floorId === floorId), [floorId])
  const floorEmergencyEquipment = useMemo(() => emergencyEquipment.filter((item) => item.floorId === floorId), [floorId])
  const floorEmergencyEdges = useMemo(() => emergencyApprovedEdges.filter((edge) => edge.floorId === floorId && edge.type !== "FLOOR_TRANSITION"), [floorId])
  const verificationReport = useMemo(
    () => floor?.map ? buildMapVerificationReport({ floor, facilities, nodes: floorNodes, edges: floorEdges }) : null,
    [floor, floorNodes, floorEdges]
  )
  const multiFloorReports = useMemo(
    () => floors.map((item) => buildMapVerificationReport({ floor: item, facilities, nodes: mapNodes, edges: mapEdges })),
    []
  )
  const emergencyVerificationReport = useMemo(() => buildEmergencyVerificationReport({ floors, nodes: mapNodes }), [])

  const resetRoute = useCallback(() => {
    setRoute(null)
    setInstructions([])
    setNavigationStatus("idle")
    setActiveStep(0)
    setRouteError("")
  }, [])

  const resetEmergencyRoute = useCallback(() => {
    setEmergencyResult(null)
    setEmergencyInstructions([])
  }, [])

  const changeFloor = (nextFloorId) => {
    const nextFacilities = getFacilitiesByFloor(nextFloorId)
    const defaultStart = nextFloorId === "3F" ? getFacilityById("library") : nextFacilities.find((facility) => facility.navigable !== false)
    const positionResolution = resolveManualPosition({ floorId: nextFloorId, facilityId: defaultStart?.id || "" })
    setFloorId(nextFloorId)
    setCalibrationOptions(createCalibrationOptions(getFloorById(nextFloorId)))
    setCurrentPosition((current) => applyLocationResolution(current, positionResolution))
    setScanError("")
    setLocationConfirmation(null)
    resetRoute()
    resetEmergencyRoute()
  }

  const updateCurrentLocation = (selectionValue) => {
    const separatorIndex = selectionValue.indexOf(":")
    const selectionType = selectionValue.slice(0, separatorIndex)
    const selectionId = selectionValue.slice(separatorIndex + 1)
    const resolution = selectionType === "checkpoint"
      ? resolveManualCheckpoint(selectionId)
      : resolveManualPosition({ floorId: currentFloorId, facilityId: selectionId })

    resetRoute()
    resetEmergencyRoute()
    setScanError("")
    setLocationConfirmation(null)
    if (!resolution.ok) {
      setRouteError(resolution.message)
      return
    }
    setCurrentPosition((current) => applyLocationResolution(current, resolution))
  }

  const handleCheckpointPayload = useCallback((payload) => {
    const resolution = resolveCheckpointPayload(payload)
    setScannerOpen(false)
    resetRoute()
    resetEmergencyRoute()

    if (!resolution.ok) {
      setScanError(INVALID_CHECKPOINT_MESSAGE)
      return
    }

    setScanError("")
    setCurrentPosition((current) => applyLocationResolution(current, resolution))
    setFloorId(resolution.location.currentFloorId)
    setCalibrationOptions(createCalibrationOptions(resolution.floor))
    setLocationConfirmation({
      facilityName: resolution.facility.name,
      floorShortName: resolution.floor.shortName,
      floorName: resolution.floor.name,
      checkpointId: resolution.checkpoint.id,
    })
  }, [resetEmergencyRoute, resetRoute])

  const useManualLocation = () => {
    setScannerOpen(false)
    window.requestAnimationFrame(() => document.getElementById("current-location-selector")?.focus())
  }

  const updateDestinationQuery = (value) => {
    setDestinationQuery(value)
    const match = allNavigableFacilities.find((facility) => normalize(facility.name) === normalize(value))
    setDestinationId(match?.id || "")
    if (match && mapView === "3D") {
      setSelectedFacilityId(match.id)
      setFloorId(match.floorId)
      setCalibrationOptions(createCalibrationOptions(getFloorById(match.floorId)))
    }
    resetRoute()
  }

  const selectMapRoom = (facilityId) => {
    const facility = getFacilityById(facilityId)
    if (!facility) return
    if (!getFacilityEntranceNodes(facility.id, floorId).length) {
      setRouteError(`${facility.name} is source-confirmed, but its usable entrance is pending verification.`)
      return
    }
    setDestinationId(facility.id)
    setDestinationQuery(facility.name)
    setSelectedFacilityId(facility.id)
    resetRoute()
  }

  const select3DFacility = (facilityId) => {
    const facility = getFacilityById(facilityId)
    if (!facility) return
    setSelectedFacilityId(facility.id)
    setFloorId(facility.floorId)
    setCalibrationOptions(createCalibrationOptions(getFloorById(facility.floorId)))
  }

  const enable3DView = () => {
    if (!supportsWebGL()) {
      setMap3DMessage("3D view is unavailable on this device. CampusNav has switched to 2D.")
      setMapView("2D")
      return
    }
    setMap3DMessage("")
    if (!activeRoute && destination) {
      setSelectedFacilityId(destination.id)
      setFloorId(destination.floorId)
      setCalibrationOptions(createCalibrationOptions(getFloorById(destination.floorId)))
    }
    setMapView("3D")
  }

  const handle3DFailure = () => {
    setMap3DMessage("3D view is unavailable on this device. CampusNav has switched to 2D.")
    setMapView("2D")
  }

  const navigateToSelectedFacility = () => {
    if (!selectedFacility || !getFacilityEntranceNodes(selectedFacility.id, selectedFacility.floorId).length) return
    setDestinationId(selectedFacility.id)
    setDestinationQuery(selectedFacility.name)
    setRouteError("")
    resetRoute()
  }

  const startNavigation = () => {
    setRouteError("")
    const startFloor = getFloorById(currentPosition.currentFloorId)
    const destinationFloor = getFloorById(destination?.floorId)
    if (!startFloor?.map || !destinationFloor?.map) {
      setRouteError("One of the selected floors is still pending a source-aligned navigation map.")
      return
    }
    if (!currentLocation || !destination) {
      setRouteError("Select a current location and a destination from the verified facility list.")
      return
    }

    const nextRoute = calculateFacilityRoute({
      startFacility: currentLocation,
      destinationFacility: destination,
      floor: startFloor,
      nodes: mapNodes,
      edges: mapEdges,
      startNodeId: currentPosition.currentNodeId,
    })

    if (!nextRoute) {
      setRouteError("No valid walkable route is available for that selection.")
      return
    }

    setRoute(nextRoute)
    setInstructions(generateNavigationInstructions({ route: nextRoute, startFacility: currentLocation, destinationFacility: destination, floor: startFloor }))
    setNavigationStatus(currentLocation.id === destination.id ? "arrived" : "active")
    setActiveStep(0)
    setFloorId(currentPosition.currentFloorId)
    setCalibrationOptions(createCalibrationOptions(startFloor))
  }

  const advanceNavigation = () => {
    const next = advanceNavigationProgress({ status: navigationStatus, activeStep, totalSteps: instructions.length })
    setNavigationStatus(next.status)
    setActiveStep(next.activeStep)
    const instructionFloorId = instructions[next.activeStep]?.floorId
    if (instructionFloorId && instructionFloorId !== floorId) {
      setFloorId(instructionFloorId)
      setCalibrationOptions(createCalibrationOptions(getFloorById(instructionFloorId)))
    }
  }

  const viewRouteFloor = (nextFloorId) => {
    setFloorId(nextFloorId)
    setCalibrationOptions(createCalibrationOptions(getFloorById(nextFloorId)))
  }

  const findEmergencyExit = () => {
    const result = findNearestVerifiedExit({
      currentNodeId: currentPosition.currentNodeId,
      currentFloorId: currentPosition.currentFloorId,
      nodes: mapNodes,
      floors,
    })
    setEmergencyResult(result)
    setEmergencyInstructions(result.ok ? generateEmergencyInstructions({ route: result.route, exit: result.exit }) : [])
    setFloorId(currentPosition.currentFloorId)
    setCalibrationOptions(createCalibrationOptions(getFloorById(currentPosition.currentFloorId)))
  }

  const routeFloorIndex = activeRoute?.routeFloorIds.indexOf(floorId) ?? -1

  const canStart = Boolean(
    getFloorById(currentPosition.currentFloorId)?.map &&
    currentLocation &&
    destination &&
    currentPosition.currentNodeId &&
    getFacilityEntranceNodes(destination.id, destination.floorId).length
  )
  const destinationNodeId = emergencyMode
    ? activeRoute?.destinationEntranceNodeId || null
    : activeRoute?.destinationEntranceNodeId || getFacilityEntranceNode(destinationId, destination?.floorId)?.id || null

  const confirmLocation = () => {
    setLocationConfirmation(null)
    if (!emergencyMode) window.requestAnimationFrame(() => document.getElementById("destination-input")?.focus())
  }

  const scanAgain = () => {
    setLocationConfirmation(null)
    setScanError("")
    setScannerOpen(true)
  }

  // `/map?scan=1` opens the real QR checkpoint scanner (Dashboard quick action).
  const scanRequested = searchParams.get("scan") === "1"
  const scanRequestHandled = useRef(false)
  useEffect(() => {
    if (!scanRequested || scanRequestHandled.current) return
    scanRequestHandled.current = true
    setScanError("")
    setScannerOpen(true)
  }, [scanRequested])

  return (
    /*
     * Workspace layout: a compact toolbar, a fixed-width control column, and
     * the map filling every remaining pixel. The map is the product, so the
     * chrome around it stays as thin as the controls allow.
     */
    <div className="app-workspace bg-[#F5F5F7]">
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b bg-white px-[var(--app-page-gutter)] py-3",
          emergencyMode ? "border-b-2 border-[#1D1D1F]" : "border-[#E3E3E6]"
        )}
      >
        <div className="min-w-0">
          <InkKicker>{emergencyMode ? "Source-approved emergency reference" : "Indoor navigation"}</InkKicker>
          <p className="mt-1 max-w-3xl text-[13px] leading-snug text-[#6E6E73]">
            {emergencyMode
              ? "View source-supported emergency equipment and calculate only administrator/source-approved evacuation paths."
              : "Choose a verified floor assignment, calculate a walkable route, and follow each navigation step."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Map mode" className="flex shrink-0 rounded-full border border-[#D2D2D7] bg-[#F5F5F7] p-1 font-heading text-[11px] font-bold uppercase tracking-[0.06em]">
            <Link to={developerMode ? "/map?verify=1" : "/map"} aria-current={!emergencyMode ? "page" : undefined} className={cn("rounded-full px-4 py-2 transition-colors duration-200", !emergencyMode ? "bg-[#1D1D1F] text-white" : "text-[#6E6E73] hover:text-[#1D1D1F]", focusRing)}>Navigate</Link>
            <Link to={`/map?mode=emergency${developerMode ? "&verify=1" : ""}`} aria-current={emergencyMode ? "page" : undefined} className={cn("flex items-center gap-1.5 rounded-full px-4 py-2 transition-colors duration-200", emergencyMode ? "bg-[#1D1D1F] text-white" : "border border-[#1D1D1F] text-[#1D1D1F] hover:bg-[#F0F0F2]", focusRing)}>
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> Emergency Mode
            </Link>
          </nav>

          <div aria-label="Map dimension" className="flex shrink-0 rounded-full border border-[#D2D2D7] bg-[#F5F5F7] p-1 text-[11px] font-bold uppercase tracking-[0.06em]">
            <button type="button" aria-pressed={mapView === "2D"} onClick={() => setMapView("2D")} className={cn("rounded-full px-4 py-2 transition-colors duration-200", mapView === "2D" ? "bg-[#1D1D1F] text-white" : "text-[#6E6E73] hover:text-[#1D1D1F]", focusRing)}>2D</button>
            <button type="button" aria-pressed={mapView === "3D"} onClick={enable3DView} className={cn("rounded-full px-4 py-2 transition-colors duration-200", mapView === "3D" ? "bg-[#1D1D1F] text-white" : "text-[#6E6E73] hover:text-[#1D1D1F]", focusRing)}>3D</button>
          </div>
        </div>
      </div>

      {/*
       * On large screens the workspace row is exactly one viewport tall: the
       * control column scrolls inside itself and the map takes the rest, so
       * the map never pushes the page into a vertical scroll. Smaller screens
       * stack and scroll normally.
       */}
      <div className="flex min-h-0 flex-1 flex-col lg:h-[calc(100dvh-var(--app-header-height))] lg:flex-none lg:flex-row">
        <aside
          aria-label="Route planning and route details"
          className="border-b border-[#E3E3E6] bg-white lg:w-[var(--app-map-control-width)] lg:shrink-0 lg:overflow-y-auto lg:overscroll-contain lg:border-b-0 lg:border-r"
        >
          <div className="space-y-3 p-3 sm:p-4">
        <section aria-label="Route planning controls" className={cn("grid gap-3 rounded-2xl border bg-white p-4", emergencyMode ? "border-2 border-[#1D1D1F]" : "border-[#D2D2D7]")}>
          <label className="block">
            <span className={fieldLabelClass}><LocateFixed className="h-4 w-4" aria-hidden="true" /> Current location</span>
            <select id="current-location-selector" value={currentSelectorValue} onChange={(event) => updateCurrentLocation(event.target.value)} className={fieldClass}>
              <optgroup label="Facilities">
              {navigableFacilities.map((facility) => <option key={facility.id} value={`facility:${facility.id}`}>{facility.name} — {facility.floorId}</option>)}
              </optgroup>
              {floorCheckpoints.length > 0 && (
                <optgroup label="QR checkpoints">
                  {floorCheckpoints.map((checkpoint) => <option key={checkpoint.id} value={`checkpoint:${checkpoint.id}`}>{checkpoint.label} checkpoint — {checkpoint.floorId}</option>)}
                </optgroup>
              )}
            </select>
            <span className="mt-2 block text-[10px] font-medium uppercase tracking-wide text-[#86868B]">
              {currentPosition.positioningMethod === POSITIONING_METHOD.QR ? `QR confirmed · ${currentPosition.checkpointId}` : "Manual selection"}
            </span>
          </label>

          {!emergencyMode && <label className="block">
            <span className={fieldLabelClass}><Search className="h-4 w-4" aria-hidden="true" /> Search destination</span>
            <input
              id="destination-input"
              list="destination-options"
              value={destinationQuery}
              onChange={(event) => updateDestinationQuery(event.target.value)}
              placeholder="Type a facility name"
              className={fieldClass}
            />
            <datalist id="destination-options">
              {allNavigableFacilities.map((facility) => <option key={facility.id} value={facility.name}>{facility.floorId}</option>)}
            </datalist>
          </label>}

          <label className="block">
            <span className={fieldLabelClass}><MapPin className="h-4 w-4" aria-hidden="true" /> Current floor</span>
            <select value={currentFloorId} onChange={(event) => changeFloor(event.target.value)} className={fieldClass}>
              {floors.map((item) => <option key={item.id} value={item.id}>{item.name}{item.map ? " · navigation available" : " · map pending"}</option>)}
            </select>
          </label>

          <div className="flex flex-col gap-3 border-t border-[#F0F0F2] pt-3">
            <p className="text-xs leading-relaxed text-[#6E6E73]">{floor?.map?.geometryNotice || `${floor?.name} map geometry is pending verification.`}</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <button type="button" onClick={() => { setScanError(""); setScannerOpen(true) }} className={`${button.outline} w-full`}>
                <QrCode className="h-4 w-4" aria-hidden="true" /> Scan QR
              </button>
              {emergencyMode ? (
                <button type="button" onClick={findEmergencyExit} disabled={!currentPosition.currentNodeId} className={`${button.danger} w-full`}>
                  <ShieldAlert className="h-4 w-4" aria-hidden="true" /> Find Nearest Verified Exit
                </button>
              ) : (
                <button onClick={startNavigation} disabled={!canStart} className={`${button.primary} w-full`}>
                  <Navigation className="h-4 w-4" aria-hidden="true" /> Start Navigation
                </button>
              )}
            </div>
          </div>
          {scanError && (
            <p role="alert" className={alertClass}>
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" /> {scanError}
            </p>
          )}
          {routeError && (
            <p role="alert" className={alertClass}>
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" /> {routeError}
            </p>
          )}
        </section>

        {activeRoute?.routeFloorIds.length > 1 && (
          <section aria-label="Route floors" className="rounded-2xl border border-[#D2D2D7] bg-white p-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868B]">Route floors</p>
                <p className="mt-2 text-sm font-semibold">{activeRoute.routeFloorIds.join(" → ")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" aria-label="Previous route floor" disabled={routeFloorIndex <= 0} onClick={() => viewRouteFloor(activeRoute.routeFloorIds[routeFloorIndex - 1])} className={cn("inline-flex h-10 items-center gap-1 rounded-full border border-[#D2D2D7] px-3 text-xs font-medium transition-colors duration-200 hover:border-[#86868B] disabled:cursor-not-allowed disabled:opacity-30", focusRing)}><ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous Floor</button>
                {activeRoute.routeFloorIds.map((routeFloorId) => (
                  <button key={routeFloorId} type="button" aria-pressed={floorId === routeFloorId} onClick={() => viewRouteFloor(routeFloorId)} className={cn("h-10 min-w-10 rounded-full border px-3 text-xs font-semibold transition-colors duration-200", floorId === routeFloorId ? "border-brand-700 bg-brand-700 text-white" : "border-[#D2D2D7] bg-white text-[#1D1D1F] hover:border-brand-600", focusRing)}>{routeFloorId}</button>
                ))}
                <button type="button" aria-label="Next route floor" disabled={routeFloorIndex < 0 || routeFloorIndex >= activeRoute.routeFloorIds.length - 1} onClick={() => viewRouteFloor(activeRoute.routeFloorIds[routeFloorIndex + 1])} className={cn("inline-flex h-10 items-center gap-1 rounded-full border border-[#D2D2D7] px-3 text-xs font-medium transition-colors duration-200 hover:border-[#86868B] disabled:cursor-not-allowed disabled:opacity-30", focusRing)}>Next Floor <ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            </div>
          </section>
        )}

        {/* The 2D/3D switch lives in the toolbar; this keeps its data notice. */}
        <p className="rounded-xl border border-dashed border-[#C7C7CC] bg-white p-3 text-[10px] leading-relaxed text-[#6E6E73]">
          {mapView === "3D" ? MAP3D_GEOMETRY_NOTICE : "2D remains the default precision view and uses the same navigation state and route graph."}
        </p>
        {map3DMessage && <p role="status" className="rounded-2xl border-2 border-[#1D1D1F] bg-white px-4 py-3 text-sm font-medium text-[#1D1D1F]">{map3DMessage}</p>}

        {emergencyMode ? (
          <Suspense fallback={<section className="rounded-[1.75rem] border border-[#E5E5E7] bg-white p-4 text-sm text-[#6E6E73]">Loading emergency reference...</section>}>
            <EmergencyModePanel
              result={emergencyResult}
              instructions={emergencyInstructions}
              currentLocation={currentLocation}
              currentFloorId={currentPosition.currentFloorId}
              onFindExit={findEmergencyExit}
            />
          </Suspense>
        ) : route ? (
          <div className="hidden space-y-3 lg:block">
            <RouteSummaryPanel
              route={route}
              instructions={instructions}
              navigationStatus={navigationStatus}
              activeStep={activeStep}
              currentLocation={currentLocation}
              destination={destination}
              currentFloorId={currentPosition.currentFloorId}
              viewingFloorId={floorId}
              mapView={mapView}
              onAdvance={advanceNavigation}
              onReset={resetRoute}
              onSwitchView={() => (mapView === "2D" ? enable3DView() : setMapView("2D"))}
            />
          </div>
        ) : (
          <section className="hidden rounded-[1.5rem] border border-[#E5E5E7] bg-white p-4 lg:block">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E5E7] bg-[#FAFAFA]">
              <Circle className="h-4 w-4 text-[#86868B]" aria-hidden="true" />
            </span>
            <h2 className="mt-3 text-base font-semibold tracking-tight">Route summary</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[#6E6E73]">Select your current location and destination, then start navigation to calculate the recommended walkable route.</p>
            <dl className="mt-3 space-y-2 rounded-xl bg-[#F5F5F7] p-3 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-[#86868B]">Current</dt>
                <dd className="text-right font-medium">{currentLocation?.name || "Not selected"}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-[#E5E5E7] pt-2">
                <dt className="shrink-0 text-[#86868B]">Destination</dt>
                <dd className="text-right font-medium">{destination ? `${destination.name} — ${destination.floorId}` : "Select from search"}</dd>
              </div>
            </dl>
          </section>
        )}

        {!emergencyMode && <p className="rounded-xl border border-dashed border-[#C7C7CC] bg-white p-3 text-[11px] leading-relaxed text-[#6E6E73]">{FACILITY_DATA_NOTICE}</p>}
        <p className="rounded-xl border border-dashed border-[#C7C7CC] bg-white p-3 text-[11px] leading-relaxed text-[#6E6E73]">Accessibility information pending verification.</p>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/*
           * The map claims all remaining space. Height comes from the flex
           * column rather than a fixed value, so the 2D SVG and the R3F canvas
           * both resize whenever the sidebar collapses or the viewport changes.
           */}
          <section aria-label="Campus map" className="relative min-h-[26rem] flex-1 overflow-hidden bg-white lg:min-h-0">
            {mapView === "3D" ? (
              <Map3DErrorBoundary resetKey={mapView} onFailure={handle3DFailure} onReturnTo2D={() => setMapView("2D")}>
                <Suspense fallback={<div className="flex h-full min-h-[inherit] items-center justify-center bg-[#F5F5F7] text-sm font-medium text-[#6E6E73]">Loading 3D building...</div>}>
                  <Campus3D
                    floors={floors}
                    facilities={facilities}
                    nodes={mapNodes}
                    edges={mapEdges}
                    route={activeRoute}
                    selectedFloorId={floorId}
                    selectedFacilityId={selectedFacilityId}
                    destinationFacilityId={emergencyMode ? null : destinationId}
                    destinationNodeId={destinationNodeId}
                    currentFacilityId={currentPosition.currentFacilityId}
                    currentNodeId={currentPosition.currentNodeId}
                    activeStep={activeStep}
                    instructionCount={(emergencyMode ? emergencyInstructions : instructions).length}
                    navigationStatus={emergencyMode && activeRoute ? "active" : navigationStatus}
                    emergencyMode={emergencyMode}
                    emergencyExits={emergencyExits}
                    emergencyEquipment={emergencyEquipment}
                    emergencyApprovedEdges={emergencyApprovedEdges}
                    checkpoints={qrCheckpoints}
                    debugOptions={developerMode ? calibrationOptions : null}
                    onFloorSelect={viewRouteFloor}
                    onFacilitySelect={select3DFacility}
                    onUse2D={() => setMapView("2D")}
                    onWebGLFailure={handle3DFailure}
                  />
                </Suspense>
              </Map3DErrorBoundary>
            ) : floor?.map ? (
              <IndoorMap2D
                floor={floor}
                facilities={facilities}
                nodes={floorNodes}
                edges={floorEdges}
                route={displayedRoute}
                startFacilityId={currentPosition.currentFacilityId}
                destinationFacilityId={emergencyMode ? null : destinationId}
                navigationStatus={navigationStatus}
                onRoomSelect={selectMapRoom}
                debugOptions={developerMode ? calibrationOptions : null}
                emergencyMode={emergencyMode}
                emergencyExits={floorEmergencyExits}
                emergencyEquipment={floorEmergencyEquipment}
                emergencyApprovedEdges={floorEmergencyEdges}
                currentNodeId={currentPosition.currentNodeId}
              />
            ) : (
              <div className="flex h-full min-h-[inherit] items-center justify-center p-8 text-center">
                <div className="max-w-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E5E5E7] bg-[#FAFAFA]">
                    <MapPin className="h-5 w-5 text-[#86868B]" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight">{floor?.name} map pending</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">A verified floor plan and room coordinates are required before indoor routing can be enabled here.</p>
                </div>
              </div>
            )}
            {mapView === "3D" && selectedFacility && (
              /*
               * Anchored bottom-left, above the 3D legend: the top belt holds
               * the 3D view controls and the bottom-right belt is reserved for
               * the floating CLARA button.
               */
              <div className="absolute bottom-[5.25rem] left-3 z-20 w-[min(300px,calc(100%-24px))] rounded-2xl border border-[#D2D2D7] bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
                <button type="button" aria-label="Close facility details" onClick={() => setSelectedFacilityId(null)} className={cn("absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#D2D2D7] text-xs transition-colors hover:border-[#86868B]", focusRing)}>×</button>
                <p className="pr-8 text-[10px] font-semibold uppercase tracking-wide text-[#86868B]">{selectedFacility.kind} · {selectedFacility.floorId}</p>
                <h2 className="mt-1 pr-8 text-lg font-semibold tracking-tight">{selectedFacility.name}</h2>
                <p className="mt-2 text-xs leading-relaxed text-[#6E6E73]">Floor assignment: {selectedFacility.verification.floor}. Exact horizontal geometry: {selectedFacility.verification.exactLocation}. 3D height: ESTIMATED.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!emergencyMode && <button type="button" disabled={!getFacilityEntranceNodes(selectedFacility.id, selectedFacility.floorId).length} onClick={navigateToSelectedFacility} className={button.smallPrimary}>Navigate here</button>}
                  <Link to={`/facilities/${selectedFacility.id}`} className={button.smallSecondary}>View details</Link>
                </div>
              </div>
            )}
          </section>
          {mapView === "2D" && floor?.map && (
            <MapLegend
              floorFacilities={viewedFloorFacilities}
              emergencyMode={emergencyMode}
              className="shrink-0 rounded-none border-x-0 border-b-0 border-t border-[#E3E3E6]"
            />
          )}
        </div>
      </div>

      {developerMode && floor?.map && verificationReport && (
        <div className="border-t border-[#E3E3E6] bg-[#F5F5F7] px-[var(--app-page-gutter)] py-4">
          <Suspense fallback={<section className="rounded-2xl border border-[#1D1D1F] bg-white p-6 text-sm text-[#6E6E73]">Loading developer verification tools...</section>}>
            <MapVerificationPanel
              floor={floor}
              report={verificationReport}
              options={calibrationOptions}
              onChange={setCalibrationOptions}
              onReset={() => setCalibrationOptions(createCalibrationOptions(floor))}
              checkpoints={qrCheckpoints}
              onSimulatePayload={handleCheckpointPayload}
              floorReports={multiFloorReports}
              verticalConnectionCount={mapEdges.filter((edge) => edge.type === "FLOOR_TRANSITION").length}
              emergencyReport={emergencyVerificationReport}
            />
          </Suspense>
        </div>
      )}

      {locationConfirmation && (
        <LocationConfirmationDialog
          confirmation={locationConfirmation}
          primaryLabel={emergencyMode ? "Continue" : "Choose Destination"}
          onChooseDestination={confirmLocation}
          onScanAgain={scanAgain}
          onClose={() => setLocationConfirmation(null)}
        />
      )}

      {scannerOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 text-sm font-medium text-white">Loading camera scanner...</div>}>
          <QRScanner onDetected={handleCheckpointPayload} onClose={() => setScannerOpen(false)} onManual={useManualLocation} />
        </Suspense>
      )}

      {!emergencyMode && route && (
        <MobileRouteSheet
          route={route}
          instructions={instructions}
          navigationStatus={navigationStatus}
          activeStep={activeStep}
          destination={destination}
          viewingFloorId={floorId}
          onAdvance={advanceNavigation}
          onReset={resetRoute}
        />
      )}
    </div>
  )
}
