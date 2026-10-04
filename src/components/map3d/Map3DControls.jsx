import { Building2, Crosshair, Eye, Focus, Layers3, Map as MapIcon, RotateCcw, Route, SquareStack } from "lucide-react"
import { MAP3D_VIEW_MODES } from "@/data/map3dConfig"
import { cn } from "@/lib/utils"

/** @param {Record<string, any>} props */
const Tool = (props) => {
  const { children, label, active = false, pressed = undefined, ...rest } = props
  return (
    <button
      type="button"
      title={label}
      aria-pressed={pressed}
      {...rest}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2 font-heading text-[12px] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none",
        active ? "bg-ink text-on-ink" : "text-ink-mid hover:bg-fill hover:text-ink",
      )}
    >
      {children}
      <span className="sr-only 2xl:not-sr-only">{label}</span>
    </button>
  )
}

const Divider = () => <span aria-hidden="true" className="mx-0.5 h-5 w-px shrink-0 self-center bg-line" />

/**
 * Compact 3D camera/view toolbar. Floor selection is shared with 2D and is
 * rendered by the Navigate page. Every control drives existing Campus3D
 * camera/view state only. When the page supplies the shared map view
 * controls (zoom, fit, reset), `showCameraTools={false}` avoids duplicates.
 * @param {Record<string, any>} props
 */
export default function Map3DControls(props) {
  const { viewMode, isolateFloor, animateRoute, reducedMotion, canFocusFacility = false, showCameraTools = true, onViewModeChange, onIsolateChange, onAnimateChange, onCameraAction, onUse2D, className } = props
  return (
    <div role="toolbar" aria-label="3D view controls" className={cn("map-overlay-surface pointer-events-auto flex items-center gap-0.5 overflow-x-auto p-1", className)}>
      <Tool label="Exploded" active={viewMode === MAP3D_VIEW_MODES.EXPLODED} pressed={viewMode === MAP3D_VIEW_MODES.EXPLODED} onClick={() => onViewModeChange(MAP3D_VIEW_MODES.EXPLODED)}>
        <Layers3 className="h-4 w-4" aria-hidden="true" />
      </Tool>
      <Tool label="Stacked" active={viewMode === MAP3D_VIEW_MODES.STACKED} pressed={viewMode === MAP3D_VIEW_MODES.STACKED} onClick={() => onViewModeChange(MAP3D_VIEW_MODES.STACKED)}>
        <SquareStack className="h-4 w-4" aria-hidden="true" />
      </Tool>
      <Divider />
      <Tool label="Isolate floor" active={isolateFloor} pressed={isolateFloor} onClick={() => onIsolateChange(!isolateFloor)}>
        <Eye className="h-4 w-4" aria-hidden="true" />
      </Tool>
      <Tool label="Animate route" active={animateRoute && !reducedMotion} pressed={animateRoute && !reducedMotion} disabled={reducedMotion} onClick={() => onAnimateChange(!animateRoute)}>
        <Route className="h-4 w-4" aria-hidden="true" />
      </Tool>
      <Divider />
      <Tool label="Focus floor" onClick={() => onCameraAction("floor")}>
        <Focus className="h-4 w-4" aria-hidden="true" />
      </Tool>
      {canFocusFacility && (
        <Tool label="Focus facility" onClick={() => onCameraAction("facility")}>
          <Crosshair className="h-4 w-4" aria-hidden="true" />
        </Tool>
      )}
      {showCameraTools && (
        <>
          <Tool label="Entire building" onClick={() => onCameraAction("building")}>
            <Building2 className="h-4 w-4" aria-hidden="true" />
          </Tool>
          <Tool label="Reset view" onClick={() => onCameraAction("reset")}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </Tool>
        </>
      )}
      <Divider />
      <Tool label="Use 2D view" onClick={onUse2D}>
        <MapIcon className="h-4 w-4" aria-hidden="true" />
      </Tool>
    </div>
  )
}
