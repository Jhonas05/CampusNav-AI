import { ArrowRight, ExternalLink, Info, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { button, focusRing } from "@/components/campus/ui"
import CampusMapCanvas, { MapLoading } from "@/components/map/CampusMapCanvas"
import FloorSelector from "@/components/map/FloorSelector"
import MapViewControls from "@/components/map/MapViewControls"
import MapViewToggle from "@/components/map/MapViewToggle"
import { useInView } from "@/components/motion/hooks"
import { getFacilityById } from "@/data/facilities"
import { floors, getFloorById } from "@/data/floors"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { getNavigateHref } from "@/lib/mapLinks"
import { cn } from "@/lib/utils"
import { supportsWebGL } from "@/lib/webgl"

export const PREVIEW_3D_UNAVAILABLE = "3D view is unavailable on this device. Showing the 2D map."

/**
 * Whether a preview may start in 3D: WebGL, a laptop/desktop-width fine
 * pointer, and no low-memory or data-saver signal. Phones and tablets start
 * with the 2D map and can still switch to 3D.
 */
export const canPrefer3DPreview = () => {
  if (typeof window === "undefined") return false
  try {
    if (!supportsWebGL()) return false
    if (!window.matchMedia("(min-width: 1024px)").matches || window.matchMedia("(pointer: coarse)").matches) return false
    const nav = /** @type {any} */ (navigator)
    if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return false
    if (nav.connection?.saveData) return false
    return true
  } catch {
    return false
  }
}

const usePageVisible = () => {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== "hidden")
    update()
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])
  return visible
}

/**
 * Compact presentation of the real CampusNav map for Home and Dashboard. It
 * renders `CampusMapCanvas` — the same canonical floor maps, facility
 * geometry, 2D renderer, and 3D model as Navigate — without the route
 * workflow. Gestures are cooperative so the page keeps scrolling: plain
 * wheel scrolls the page and Ctrl/⌘ + wheel or a pinch zooms. The 3D view is
 * mounted only near the viewport and pauses rendering while off screen.
 * @param {Record<string, any>} props
 */
export default function CampusMapPreview(props) {
  const { preferredView = "3D", initialFloorId = "3F", heightClass = "h-[26rem]", label = "Campus map preview", className } = props
  const [mapView, setMapView] = useState(() => (preferredView === "3D" && canPrefer3DPreview() ? "3D" : "2D"))
  const [floorId, setFloorId] = useState(getFloorById(initialFloorId) ? initialFloorId : floors[0].id)
  const [selectedFacilityId, setSelectedFacilityId] = useState(null)
  const [view2DRequest, setView2DRequest] = useState(null)
  const [camera3DCommand, setCamera3DCommand] = useState(null)
  const [notice, setNotice] = useState("")
  const [viewRef, inView] = useInView({ once: false, margin: "200px 0px", threshold: 0 })
  const [seen, setSeen] = useState(false)
  const pageVisible = usePageVisible()
  const wrapperRef = useRef(null)
  const selectedFacility = getFacilityById(selectedFacilityId)

  useEffect(() => { if (inView) setSeen(true) }, [inView])

  // Cooperative 3D: a plain wheel scrolls the page instead of reaching the
  // orbit controls; Ctrl/⌘ + wheel (and trackpad pinch) still zooms.
  useEffect(() => {
    const element = wrapperRef.current
    if (!element || mapView !== "3D") return undefined
    const onWheel = (event) => { if (!(event.ctrlKey || event.metaKey)) event.stopPropagation() }
    element.addEventListener("wheel", onWheel, { capture: true })
    return () => element.removeEventListener("wheel", onWheel, { capture: true })
  }, [mapView])

  const request = (action) => {
    if (mapView === "3D") setCamera3DCommand((current) => ({ action: action === "fit" ? "building" : action, key: (current?.key || 0) + 1 }))
    else setView2DRequest((current) => ({ action, key: (current?.key || 0) + 1 }))
  }

  const use3D = () => {
    if (!supportsWebGL()) {
      setNotice(PREVIEW_3D_UNAVAILABLE)
      return
    }
    setNotice("")
    setMapView("3D")
  }

  const on3DFailure = () => {
    setNotice(PREVIEW_3D_UNAVAILABLE)
    setMapView("2D")
  }

  const selectFacility = (facilityId) => {
    const facility = getFacilityById(facilityId)
    if (!facility) return
    setSelectedFacilityId(facility.id)
    setFloorId(facility.floorId)
  }

  const viewFloor = (nextFloorId) => {
    setFloorId(nextFloorId)
    setSelectedFacilityId(null)
  }

  const showCanvas = mapView === "2D" || seen
  const category = selectedFacility ? getFacilityCategory(selectedFacility) : null

  return (
    <div className={className}>
      <section
        ref={(node) => { viewRef.current = node; wrapperRef.current = node }}
        aria-label={label}
        data-map-preview={mapView}
        className={cn("relative overflow-hidden rounded-[18px] border border-line bg-canvas", heightClass)}
      >
        <div className="absolute inset-0">
          {showCanvas ? (
            <CampusMapCanvas
              mapView={mapView}
              viewedFloorId={floorId}
              selectedFacilityId={selectedFacilityId}
              onRoomSelect={selectFacility}
              onFacilitySelect={selectFacility}
              onUse2D={() => setMapView("2D")}
              on3DFailure={on3DFailure}
              view2DRequest={view2DRequest}
              view2DDefault="fit"
              cooperativeGestures
              camera3DCommand={camera3DCommand}
              active3D={inView && pageVisible}
              show3DToolbar={false}
              loadingLabel="Preparing 3D campus view…"
            />
          ) : (
            <MapLoading />
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 z-20">
          {/* Left-aligned so the page's floating CLARA button (bottom-right) never covers them. */}
          <div className="absolute left-2 top-2 flex flex-wrap items-start gap-2 sm:left-3 sm:top-3">
            <MapViewToggle mapView={mapView} onSelect2D={() => setMapView("2D")} onSelect3D={use3D} />
            <MapViewControls
              mapView={mapView}
              orientation="horizontal"
              onZoomIn={() => request("zoom-in")}
              onZoomOut={() => request("zoom-out")}
              onReset={() => request("reset")}
            />
          </div>
          <FloorSelector
            floors={floors}
            viewingFloorId={floorId}
            onSelect={viewFloor}
            orientation="horizontal"
            className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] sm:bottom-3 sm:left-3"
          />

          {selectedFacility && (
            <div className="map-overlay-surface pointer-events-auto absolute inset-x-2 bottom-[4.25rem] p-3 sm:inset-x-auto sm:bottom-[4.5rem] sm:left-3 sm:w-[18rem]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{category?.label} · {getFloorById(selectedFacility.floorId)?.shortName || selectedFacility.floorId}</p>
                  <p className="mt-0.5 truncate font-heading text-base font-semibold text-ink">{selectedFacility.name}</p>
                </div>
                <button type="button" aria-label="Close facility preview" onClick={() => setSelectedFacilityId(null)} className={cn("-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-fill", focusRing)}>
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Link to={getNavigateHref({ facilityId: selectedFacility.id })} className={button.smallPrimary}>Open in Navigate <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
                <Link to={`/facilities/${selectedFacility.id}`} className={button.smallSecondary}><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Details</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {notice && <p role="status" className="mt-2 flex items-center gap-2 rounded-xl border border-ink bg-surface px-3 py-2 text-xs font-medium text-ink"><Info className="h-4 w-4 shrink-0" aria-hidden="true" /> {notice}</p>}

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] leading-snug text-ink-faint">Same source-aligned GF–5F map{mapView === "3D" ? " and 3D model" : ""} used by Navigate · estimated dimensions</p>
        <Link
          to={getNavigateHref({ floorId, facilityId: selectedFacilityId })}
          className={cn("group inline-flex min-h-9 items-center gap-1.5 rounded-md text-xs font-semibold text-ink hover:text-ink-mid", focusRing)}
        >
          Open full map <ArrowRight className="nav-icon h-3.5 w-3.5" data-motion="forward" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
