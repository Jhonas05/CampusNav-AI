import { CircleAlert, Info, LocateFixed, Minimize, Navigation, QrCode, ShieldAlert } from "lucide-react"
import { lazy, Suspense, useCallback, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { button, focusRing, InkKicker, InkSectionLabel } from "@/components/campus/ui"
import useModalDialog from "@/components/campus/useModalDialog"
import { useClara } from "@/components/clara/ClaraContext"
import CampusMapCanvas from "@/components/map/CampusMapCanvas"
import DestinationSearch from "@/components/map/DestinationSearch"
import FacilitySheet from "@/components/map/FacilitySheet"
import FloorSelector from "@/components/map/FloorSelector"
import ImmersiveMapPanel from "@/components/map/ImmersiveMapPanel"
import LocationConfirmationDialog from "@/components/map/LocationConfirmationDialog"
import MapLegend from "@/components/map/MapLegend"
import MapViewControls from "@/components/map/MapViewControls"
import MapViewToggle from "@/components/map/MapViewToggle"
import MobileRouteSheet from "@/components/map/MobileRouteSheet"
import NavigationContextBar from "@/components/map/NavigationContextBar"
import RouteSummaryPanel from "@/components/map/RouteSummaryPanel"
import useMapFullscreen from "@/components/map/useMapFullscreen"
import { FACILITY_DATA_NOTICE, facilities, getFacilitiesByFloor, getFacilityById } from "@/data/facilities"
import { floors, getFloorById } from "@/data/floors"
import { MAP3D_GEOMETRY_NOTICE } from "@/data/map3dConfig"
import { mapEdges } from "@/data/mapEdges"
import { getFacilityEntranceNode, getFacilityEntranceNodes, mapNodes } from "@/data/mapNodes"
import { getCheckpointsByFloor, qrCheckpoints } from "@/data/qrCheckpoints"
import { applyLocationResolution, INVALID_CHECKPOINT_MESSAGE, resolveCheckpointPayload, resolveManualCheckpoint, resolveManualPosition } from "@/lib/checkpointPositioning"
import { buildMapVerificationReport } from "@/lib/mapValidation"
import { advanceNavigationProgress, calculateFacilityRoute, generateNavigationInstructions, getRouteSegmentForFloor } from "@/lib/navigation"
import { buildEmergencyVerificationReport, findNearestVerifiedExit, generateEmergencyInstructions, getEmergencyRouteSegmentForFloor } from "@/lib/emergencyNavigation"
import { supportsWebGL } from "@/lib/webgl"
import { cn } from "@/lib/utils"

const MapVerificationPanel = lazy(() => import("@/components/map/MapVerificationPanel"))
const QRScanner = lazy(() => import("@/components/map/QRScanner"))
const EmergencyModePanel = lazy(() => import("@/components/map/EmergencyModePanel"))

const normalize = (value) => value.trim().toLowerCase()

// Canonical 3D fallback wording (21-error-state-contract).
const MAP3D_FALLBACK_MESSAGE = "3D view unavailable; switched to 2D."
const MAP2D_VIEW_NOTICE = "2D remains the default precision view and uses the same navigation state and route graph."

const fieldLabelClass = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft"
const fieldClass = "h-11 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm font-medium text-ink outline-none transition-colors duration-150 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15"
const alertClass = "flex items-start gap-2.5 rounded-xl border border-ink bg-fill px-3 py-2.5 text-sm font-medium text-ink"

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
  // `?floor=` opens Navigate on a known floor (Home floor stack). Unknown ids
  // fall back to the existing default.
  const requestedFloor = getFloorById(searchParams.get("floor"))
  const initialFloorId = requestedFacility?.floorId || requestedFloor?.id || "3F"
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
  const [calibrationOptions, setCalibrationOptions] = useState(() => createCalibrationOptions(getFloorById(initialFloorId)))
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanError, setScanError] = useState("")
  const [locationConfirmation, setLocationConfirmation] = useState(null)
  const [emergencyResult, setEmergencyResult] = useState(null)
  const [emergencyInstructions, setEmergencyInstructions] = useState([])
  const [mapView, setMapView] = useState("2D")
  const [map3DMessage, setMap3DMessage] = useState("")
  const [selectedFacilityId, setSelectedFacilityId] = useState(null)
  // Viewport-only presentation requests (2D transform / 3D camera); never part
  // of navigation state.
  const [view2DRequest, setView2DRequest] = useState(null)
  const [camera3DCommand, setCamera3DCommand] = useState(null)
  // Mobile-only disclosure for the location selectors (always open on desktop).
  const [locationEditorOpen, setLocationEditorOpen] = useState(false)
  // Immersive fullscreen is a view mode of the same mounted map.
  const fullscreen = useMapFullscreen()
  const immersive = fullscreen.active
  const clara = useClara()
  const immersiveFocusRef = useModalDialog({ active: immersive, onClose: fullscreen.exit })

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

  const requestMapFocus = (facilityId) => setView2DRequest((current) => ({ action: "facility", facilityId, key: (current?.key || 0) + 1 }))

  // Shared view controls drive whichever renderer is mounted.
  const requestMapView = (action, facilityId = null) => {
    if (mapView === "3D") {
      setCamera3DCommand((current) => ({ action: action === "fit" ? "building" : action, facilityId, key: (current?.key || 0) + 1 }))
    } else {
      setView2DRequest((current) => ({ action, facilityId, key: (current?.key || 0) + 1 }))
    }
  }

  const toggleFullscreen = () => {
    // CLARA is hidden while the map is immersive; its conversation is kept.
    if (!immersive && clara.open) clara.minimize()
    fullscreen.toggle()
  }

  const askClaraAboutFacility = (facilityId) => {
    if (immersive) fullscreen.exit()
    clara.openClara({ facilityId })
  }

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

  // Manual positioning from the facility panel: the same canonical
  // resolveManualPosition path as the location selector, on the facility's floor.
  const setLocationFromFacility = (facility) => {
    const resolution = resolveManualPosition({ floorId: facility.floorId, facilityId: facility.id })
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
    setLocationEditorOpen(true)
    window.requestAnimationFrame(() => document.getElementById("current-location-selector")?.focus())
  }

  const viewRouteFloor = (nextFloorId) => {
    setFloorId(nextFloorId)
    setCalibrationOptions(createCalibrationOptions(getFloorById(nextFloorId)))
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

  // Choosing a search result sets the same destination an exact name match
  // would, then shows that facility on its floor in either view.
  const chooseDestination = (facility) => {
    setDestinationQuery(facility.name)
    setDestinationId(facility.id)
    setSelectedFacilityId(facility.id)
    viewRouteFloor(facility.floorId)
    resetRoute()
    requestMapFocus(facility.id)
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
      setMap3DMessage(MAP3D_FALLBACK_MESSAGE)
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
    setMap3DMessage(MAP3D_FALLBACK_MESSAGE)
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
    // Route information takes priority over the generic facility panel, and
    // the 2D viewport scrolls to where the route begins.
    setSelectedFacilityId(null)
    requestMapFocus(currentLocation.id)
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
    requestMapFocus(currentPosition.currentFacilityId)
  }

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

  const focusTarget = selectedFacility || (!emergencyMode ? destination : null)
  const focusTargetOnViewedFloor = focusTarget?.floorId === floorId ? focusTarget : null
  const mobileRouteSheetVisible = !emergencyMode && route && instructions.length > 0

  return (
    <div className={cn("app-page bg-canvas", mobileRouteSheetVisible && "max-lg:pb-48")}>
      <div className="app-container">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <InkKicker className={cn("hidden sm:block", emergencyMode && "text-ink")}>{emergencyMode ? "Source-approved emergency reference" : "Indoor navigation · GF–5F"}</InkKicker>
            <h1 className="mt-1 font-display text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[2.125rem]">{emergencyMode ? "Emergency Mode" : "Navigate"}</h1>
            <p className="mt-1 hidden max-w-2xl text-[13px] text-ink-soft sm:block">{emergencyMode ? "View source-supported emergency equipment and calculate only administrator/source-approved evacuation paths." : "Choose a verified floor assignment, calculate a walkable route, and follow each navigation step."}</p>
          </div>
          <nav aria-label="Map mode" className="flex shrink-0 rounded-xl border border-line-strong bg-surface p-1 font-heading text-xs font-semibold">
            <Link to={developerMode ? "/map?verify=1" : "/map"} aria-current={!emergencyMode ? "page" : undefined} className={cn("inline-flex min-h-9 items-center rounded-lg px-3.5 transition-colors duration-200", !emergencyMode ? "bg-brand-700 text-on-ink" : "text-ink-soft hover:text-ink", focusRing)}>
              <Navigation className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Navigate
            </Link>
            <Link to={`/map?mode=emergency${developerMode ? "&verify=1" : ""}`} aria-current={emergencyMode ? "page" : undefined} className={cn("inline-flex min-h-9 items-center rounded-lg px-3.5 transition-colors duration-200", emergencyMode ? "bg-ink text-on-ink" : "text-ink-soft hover:text-ink", focusRing)}>
              <ShieldAlert className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Emergency<span className="hidden sm:inline">&nbsp;Mode</span>
            </Link>
          </nav>
        </header>

        <NavigationContextBar
          className="mt-3"
          currentLocation={currentLocation}
          currentPosition={currentPosition}
          destination={destination}
          route={activeRoute}
          navigationStatus={navigationStatus}
          activeStep={activeStep}
          instructionCount={instructions.length}
          emergencyMode={emergencyMode}
          emergencyResult={emergencyResult}
          viewingFloorId={floorId}
          onViewFloor={viewRouteFloor}
        />

        <div className="mt-3 grid gap-3 lg:grid-cols-[var(--app-map-control-width)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
          <section aria-label="Route planning controls" className={cn("ink-blueprint p-3.5 lg:col-start-1 lg:row-start-1", emergencyMode && "border-2 border-ink", mobileRouteSheetVisible && "max-lg:hidden")}>
            <div className="relative z-[1] grid gap-3">
              <div>
                <div className="flex items-center justify-between gap-2 max-lg:min-h-9">
                  <InkSectionLabel className="lg:mb-2.5"><LocateFixed className="h-3.5 w-3.5" aria-hidden="true" /> Current location</InkSectionLabel>
                  <button
                    type="button"
                    aria-expanded={locationEditorOpen}
                    aria-controls="current-location-fields"
                    onClick={() => setLocationEditorOpen((open) => !open)}
                    className={cn("inline-flex min-h-9 items-center rounded-lg px-2 font-heading text-[12px] font-semibold text-brand-700 hover:bg-fill lg:hidden", focusRing)}
                  >
                    {locationEditorOpen ? "Done" : "Change"}
                  </button>
                </div>
                <div id="current-location-fields" className={cn("grid grid-cols-[5.75rem_minmax(0,1fr)] gap-2 max-lg:mt-2", !locationEditorOpen && "max-lg:hidden")}>
                  <label className="block">
                    <span className={fieldLabelClass}>Floor</span>
                    <select value={currentFloorId} onChange={(event) => changeFloor(event.target.value)} className={fieldClass} aria-label="Floor of your current location">
                      {floors.map((item) => <option key={item.id} value={item.id}>{item.shortName}{item.map ? "" : " · map pending"}</option>)}
                    </select>
                  </label>
                  <label className="block min-w-0">
                    <span className={fieldLabelClass}>Location</span>
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
                  </label>
                </div>
              </div>

              {!emergencyMode && (
                <DestinationSearch
                  facilities={allNavigableFacilities}
                  query={destinationQuery}
                  destinationId={destinationId}
                  onQueryChange={updateDestinationQuery}
                  onSelect={chooseDestination}
                />
              )}

              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                {emergencyMode ? (
                  <button type="button" onClick={findEmergencyExit} disabled={!currentPosition.currentNodeId} className={cn(button.danger, "col-span-2 w-full px-3 lg:col-span-1")}>
                    <ShieldAlert className="h-4 w-4" aria-hidden="true" /> Find Nearest Verified Exit
                  </button>
                ) : (
                  <button type="button" onClick={startNavigation} disabled={!canStart} className={cn(button.primary, "w-full px-3")}>
                    <Navigation className="h-4 w-4" aria-hidden="true" /> Start Navigation
                  </button>
                )}
                <button type="button" onClick={() => { setScanError(""); setScannerOpen(true) }} className={cn(button.outline, "w-full px-3", emergencyMode && "col-span-2 lg:col-span-1")}>
                  <QrCode className="h-4 w-4" aria-hidden="true" /> Scan QR
                </button>
              </div>

              {scanError && (
                <p role="alert" className={alertClass}>
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {scanError}
                </p>
              )}
              {routeError && (
                <p role="alert" className={alertClass}>
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {routeError}
                </p>
              )}
            </div>
          </section>

          <div className="map-immersive-host min-w-0 lg:sticky lg:top-[calc(var(--app-header-height)+0.75rem)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
            <section
              ref={(node) => { fullscreen.targetRef.current = node; immersiveFocusRef.current = node }}
              aria-label={immersive ? "Campus map, fullscreen" : "Campus map"}
              role={immersive ? "dialog" : undefined}
              aria-modal={immersive ? true : undefined}
              data-immersive={immersive ? (fullscreen.native ? "native" : "overlay") : undefined}
              className={cn("ink-blueprint map-workspace relative overflow-hidden bg-canvas", emergencyMode && "border-2 border-ink", immersive && "map-immersive")}
            >
              <div className="absolute inset-0">
                <CampusMapCanvas
                  mapView={mapView}
                  viewedFloorId={floorId}
                  route2D={displayedRoute}
                  route3D={activeRoute}
                  emergencyMode={emergencyMode}
                  startFacilityId={currentPosition.currentFacilityId}
                  currentNodeId={currentPosition.currentNodeId}
                  destinationFacilityId={destinationId}
                  destinationNodeId={destinationNodeId}
                  selectedFacilityId={selectedFacilityId}
                  navigationStatus={mapView === "3D" && emergencyMode && activeRoute ? "active" : navigationStatus}
                  activeStep={activeStep}
                  instructionCount={(emergencyMode ? emergencyInstructions : instructions).length}
                  debugOptions={developerMode ? calibrationOptions : null}
                  onRoomSelect={selectMapRoom}
                  onFacilitySelect={select3DFacility}
                  onUse2D={() => setMapView("2D")}
                  on3DFailure={handle3DFailure}
                  view2DRequest={view2DRequest}
                  view2DDefault="fill-width"
                  camera3DCommand={camera3DCommand}
                  show3DCameraTools={false}
                  loadingLabel="Preparing 3D campus view…"
                />
              </div>

              <div className="pointer-events-none absolute inset-0 z-20">
                <MapViewToggle mapView={mapView} onSelect2D={() => setMapView("2D")} onSelect3D={enable3DView} className="absolute left-2 top-2 sm:left-3 sm:top-3" />

                <FloorSelector
                  floors={floors}
                  viewingFloorId={floorId}
                  currentFloorId={currentFloorId}
                  destinationFloorId={emergencyMode ? null : destination?.floorId}
                  routeFloorIds={activeRoute?.routeFloorIds || []}
                  onSelect={viewRouteFloor}
                  orientation="vertical"
                  className="absolute left-3 top-1/2 hidden -translate-y-1/2 sm:flex"
                />
                <FloorSelector
                  floors={floors}
                  viewingFloorId={floorId}
                  currentFloorId={currentFloorId}
                  destinationFloorId={emergencyMode ? null : destination?.floorId}
                  routeFloorIds={activeRoute?.routeFloorIds || []}
                  onSelect={viewRouteFloor}
                  orientation="horizontal"
                  className="absolute inset-x-2 top-[3.5rem] sm:hidden"
                />

                {(mapView === "3D" || floor?.map) && (
                  <MapViewControls
                    mapView={mapView}
                    onZoomIn={() => requestMapView("zoom-in")}
                    onZoomOut={() => requestMapView("zoom-out")}
                    onFit={() => requestMapView("fit")}
                    onReset={() => requestMapView("reset")}
                    focusLabel={(mapView === "3D" ? focusTarget : focusTargetOnViewedFloor)?.name || null}
                    onFocus={(mapView === "3D" ? focusTarget : focusTargetOnViewedFloor) ? () => requestMapView("facility", (mapView === "3D" ? focusTarget : focusTargetOnViewedFloor).id) : null}
                    fullscreen={{ active: immersive, onToggle: toggleFullscreen }}
                    className={cn("absolute right-2 top-[6.25rem] sm:right-3 sm:top-3", !immersive && "max-sm:hidden")}
                  />
                )}
                {/* Phones outside fullscreen: a compact top row, clear of the floating CLARA
                    button. It stays mounted (hidden) while immersive so focus can return to it. */}
                {(mapView === "3D" || floor?.map) && (
                  <MapViewControls
                    mapView={mapView}
                    orientation="horizontal"
                    onZoomIn={() => requestMapView("zoom-in")}
                    onZoomOut={() => requestMapView("zoom-out")}
                    onReset={() => requestMapView("reset")}
                    fullscreen={{ active: immersive, onToggle: toggleFullscreen }}
                    className={cn("absolute right-2 top-2 sm:hidden", immersive && "hidden")}
                  />
                )}

                {floor?.map && (
                  <MapLegend
                    floorFacilities={viewedFloorFacilities}
                    emergencyMode={emergencyMode}
                    mapView={mapView}
                    className={cn(
                      "absolute left-2 sm:left-3",
                      // In desktop fullscreen the open legend must sit above the left route/emergency panel.
                      immersive && "lg:z-30",
                      immersive && mobileRouteSheetVisible
                        ? "bottom-[calc(var(--clara-lift,0px)+0.5rem)] lg:bottom-3"
                        : immersive && emergencyMode
                          ? "max-lg:bottom-[4.5rem] bottom-2 lg:bottom-3"
                          : "bottom-2 sm:bottom-3",
                    )}
                  />
                )}

                {immersive && (
                  <button
                    type="button"
                    onClick={fullscreen.exit}
                    className={cn("map-overlay-surface pointer-events-auto absolute right-2 top-2 inline-flex min-h-10 items-center gap-1.5 px-3 font-heading text-[13px] font-semibold text-ink hover:bg-fill sm:bottom-3 sm:right-3 sm:top-auto", focusRing)}
                  >
                    <Minimize className="h-4 w-4" aria-hidden="true" /> Exit fullscreen
                  </button>
                )}

                {immersive && !emergencyMode && route && (
                  <div className="pointer-events-auto absolute left-[4.75rem] top-[4rem] hidden max-h-[calc(100%-8rem)] w-[21rem] overflow-y-auto overscroll-contain rounded-[18px] shadow-soft lg:block">
                    <RouteSummaryPanel
                      route={route}
                      instructions={instructions}
                      navigationStatus={navigationStatus}
                      activeStep={activeStep}
                      currentLocation={currentLocation}
                      destination={destination}
                      onAdvance={advanceNavigation}
                      onReset={resetRoute}
                    />
                  </div>
                )}

                {immersive && emergencyMode && (
                  <ImmersiveMapPanel
                    title="Emergency guidance"
                    className="absolute inset-x-2 bottom-2 max-h-[55%] lg:inset-x-auto lg:bottom-auto lg:left-[4.75rem] lg:top-[4rem] lg:max-h-[calc(100%-8rem)] lg:w-[21rem]"
                  >
                    <Suspense fallback={<p className="p-4 text-sm text-ink-soft">Loading emergency reference...</p>}>
                      <EmergencyModePanel
                        result={emergencyResult}
                        instructions={emergencyInstructions}
                        currentLocation={currentLocation}
                        currentFloorId={currentPosition.currentFloorId}
                        onFindExit={findEmergencyExit}
                      />
                    </Suspense>
                  </ImmersiveMapPanel>
                )}

                {immersive && mobileRouteSheetVisible && (
                  // The overlay layer ignores pointers so the map stays draggable;
                  // the route sheet opts back in.
                  <div className="pointer-events-auto">
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
                  </div>
                )}

                {selectedFacility && (
                  <FacilitySheet
                    key={selectedFacility.id}
                    facility={selectedFacility}
                    isCurrentLocation={selectedFacility.id === currentPosition.currentFacilityId}
                    isDestination={selectedFacility.id === destinationId}
                    emergencyMode={emergencyMode}
                    hasUsableEntrance={getFacilityEntranceNodes(selectedFacility.id, selectedFacility.floorId).length > 0}
                    canStartNavigation={canStart}
                    routeActive={Boolean(route)}
                    onNavigateHere={navigateToSelectedFacility}
                    onStartNavigation={startNavigation}
                    onSetLocation={() => setLocationFromFacility(selectedFacility)}
                    onClose={() => setSelectedFacilityId(null)}
                    onAskClara={askClaraAboutFacility}
                    className={cn(
                      "absolute inset-x-2 bottom-2 max-h-[55%] sm:inset-x-auto sm:right-[5.5rem] sm:w-[22rem]",
                      immersive ? "sm:bottom-[4rem] sm:max-h-[calc(100%-8rem)]" : "sm:bottom-3 sm:max-h-[calc(100%-5.5rem)]",
                    )}
                  />
                )}
              </div>
            </section>

            {map3DMessage && <p role="status" className="mt-2 flex items-center gap-2 rounded-xl border border-ink bg-surface px-3 py-2 text-sm font-medium text-ink"><Info className="h-4 w-4 shrink-0" aria-hidden="true" /> {map3DMessage}</p>}

            <div className="mt-2 flex flex-col gap-1 px-1 text-[11px] leading-relaxed text-ink-soft sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <p>
                <span className="font-semibold uppercase tracking-[0.1em] text-ink-mid">Viewing {floor?.name || floorId}</span>
                {" · "}
                {floor?.map?.geometryNotice || `${floor?.name} map geometry is pending verification.`}
              </p>
              <p className="sm:max-w-[45%] sm:text-right"><span className="sr-only">Map view: </span>{mapView === "3D" ? MAP3D_GEOMETRY_NOTICE : MAP2D_VIEW_NOTICE}</p>
            </div>
          </div>

          <div className="min-w-0 space-y-3 lg:col-start-1 lg:row-start-2">
            {emergencyMode ? (
              <Suspense fallback={<section className="ink-blueprint p-4 text-sm text-ink-soft">Loading emergency reference...</section>}>
                <EmergencyModePanel
                  result={emergencyResult}
                  instructions={emergencyInstructions}
                  currentLocation={currentLocation}
                  currentFloorId={currentPosition.currentFloorId}
                  onFindExit={findEmergencyExit}
                />
              </Suspense>
            ) : route ? (
              <div className="hidden lg:block">
                <RouteSummaryPanel
                  route={route}
                  instructions={instructions}
                  navigationStatus={navigationStatus}
                  activeStep={activeStep}
                  currentLocation={currentLocation}
                  destination={destination}
                  onAdvance={advanceNavigation}
                  onReset={resetRoute}
                />
              </div>
            ) : (
              <section aria-label="Route summary" className="hidden border border-dashed border-line-strong bg-surface/60 p-3.5 lg:block">
                <InkSectionLabel>Route</InkSectionLabel>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">Search for a destination or select a room on the map, then start navigation to calculate the recommended walkable route.</p>
              </section>
            )}

            <section aria-label="Data status" className="space-y-1.5 border-t border-line-strong pt-2.5 text-[11px] leading-relaxed text-ink-soft">
              {!emergencyMode && <p>{FACILITY_DATA_NOTICE}</p>}
              <p>Accessibility information pending verification.</p>
            </section>
          </div>
        </div>

        {developerMode && floor?.map && verificationReport && (
          <Suspense fallback={<section className="mt-5 ink-blueprint p-6 text-sm text-ink-soft">Loading developer verification tools...</section>}>
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
        )}
      </div>

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

      {mobileRouteSheetVisible && !immersive && (
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
