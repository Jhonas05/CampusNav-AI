import { Crosshair, Maximize, Minimize, Minus, Plus, RotateCcw, Shrink } from "lucide-react"
import { focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

const toolClass = cn(
  "inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors duration-150 hover:bg-fill disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none",
  focusRing,
)

/** @param {Record<string, any>} props */
const Tool = (props) => {
  const { label, icon: Icon, onClick, pressed = undefined } = props
  return (
    <button type="button" aria-label={label} title={label} aria-pressed={pressed} onClick={onClick} className={toolClass}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}

/**
 * Shared map view controls for the 2D and 3D renderers: zoom, fit, reset,
 * optional facility focus, and optional fullscreen. They change only the
 * view (2D transform or 3D camera); no geometry, route, or navigation state.
 * @param {Record<string, any>} props
 */
export default function MapViewControls(props) {
  const {
    mapView = "2D",
    onZoomIn,
    onZoomOut,
    onFit = null,
    onReset,
    focusLabel = null,
    onFocus = null,
    fullscreen = null,
    orientation = "vertical",
    className,
  } = props
  const vertical = orientation === "vertical"
  const fitLabel = mapView === "3D" ? "Fit building to view" : "Fit map to screen"

  return (
    <div role="group" aria-label="Map view controls" className={cn("map-overlay-surface pointer-events-auto flex gap-0.5 p-1", vertical ? "flex-col" : "flex-row", className)}>
      <Tool label="Zoom in" icon={Plus} onClick={onZoomIn} />
      <Tool label="Zoom out" icon={Minus} onClick={onZoomOut} />
      {onFit && <Tool label={fitLabel} icon={Shrink} onClick={onFit} />}
      <Tool label="Reset map view" icon={RotateCcw} onClick={onReset} />
      {onFocus && focusLabel && <Tool label={`Center map on ${focusLabel}`} icon={Crosshair} onClick={onFocus} />}
      {fullscreen && (
        <>
          <span aria-hidden="true" className={cn("shrink-0 bg-line", vertical ? "mx-1.5 my-0.5 h-px" : "mx-0.5 my-1.5 w-px")} />
          <Tool label={fullscreen.active ? "Exit fullscreen map" : "Enter fullscreen map"} icon={fullscreen.active ? Minimize : Maximize} onClick={fullscreen.onToggle} />
        </>
      )}
    </div>
  )
}
