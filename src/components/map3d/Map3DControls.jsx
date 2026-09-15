import { Building2, Eye, Focus, Layers3, RotateCcw, Route, SquareStack, X } from "lucide-react"
import { MAP3D_VIEW_MODES } from "@/data/map3dConfig"

const Pill = ({ children, active = false, ...props }) => (
  <button
    type="button"
    {...props}
    className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 ${
      active ? "bg-brand-700 text-white" : "bg-transparent text-[#48484A] hover:bg-brand-50 hover:text-brand-800"
    }`}
  >
    {children}
  </button>
)

const Divider = () => <span aria-hidden="true" className="mx-0.5 hidden h-5 w-px self-center bg-[#E5E5E7] sm:block" />

export default function Map3DControls({ floors, selectedFloorId, viewMode, isolateFloor, animateRoute, reducedMotion, onFloorSelect, onViewModeChange, onIsolateChange, onAnimateChange, onCameraAction, onUse2D }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-3 sm:p-4">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1 self-start rounded-2xl border border-[#E5E5E7] bg-white/95 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur">
          <Pill active={viewMode === MAP3D_VIEW_MODES.EXPLODED} onClick={() => onViewModeChange(MAP3D_VIEW_MODES.EXPLODED)}>
            <Layers3 className="h-3.5 w-3.5" aria-hidden="true" /> Exploded
          </Pill>
          <Pill active={viewMode === MAP3D_VIEW_MODES.STACKED} onClick={() => onViewModeChange(MAP3D_VIEW_MODES.STACKED)}>
            <SquareStack className="h-3.5 w-3.5" aria-hidden="true" /> Stacked
          </Pill>
          <Divider />
          <Pill active={isolateFloor} aria-pressed={isolateFloor} onClick={() => onIsolateChange(!isolateFloor)}>
            <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Isolate floor
          </Pill>
          <Pill active={animateRoute && !reducedMotion} aria-pressed={animateRoute && !reducedMotion} disabled={reducedMotion} onClick={() => onAnimateChange(!animateRoute)}>
            <Route className="h-3.5 w-3.5" aria-hidden="true" /> Animate route
          </Pill>
          <Divider />
          <Pill onClick={() => onCameraAction("floor")}>
            <Focus className="h-3.5 w-3.5" aria-hidden="true" /> Focus floor
          </Pill>
          <Pill onClick={() => onCameraAction("building")}>
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> Entire building
          </Pill>
          <Pill onClick={() => onCameraAction("reset")}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset view
          </Pill>
          <Divider />
          <Pill onClick={onUse2D}>
            <X className="h-3.5 w-3.5" aria-hidden="true" /> Use 2D view
          </Pill>
        </div>

        <div aria-label="Floor selector" className="pointer-events-auto flex gap-1 self-start rounded-2xl border border-[#E5E5E7] bg-white/95 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur sm:hidden">
          {floors.map((floor) => (
            <Pill key={floor.id} active={floor.id === selectedFloorId} onClick={() => onFloorSelect(floor.id)}>{floor.id}</Pill>
          ))}
        </div>
      </div>

      <div aria-label="Floor selector" className="pointer-events-auto absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-1 rounded-2xl border border-[#E5E5E7] bg-white/95 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur sm:flex">
        {floors.map((floor) => (
          <Pill key={floor.id} active={floor.id === selectedFloorId} onClick={() => onFloorSelect(floor.id)}>{floor.id}</Pill>
        ))}
      </div>
    </>
  )
}
