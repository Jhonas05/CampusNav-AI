import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { RouteSteps } from "./RouteSummaryPanel"
import { cn } from "@/lib/utils"

/**
 * True mobile navigation surface (§ mobile navigation UI): a fixed bottom
 * sheet above the tab bar with the destination, the next instruction,
 * route progress, and expandable full steps. Desktop keeps the side panel.
 */
export default function MobileRouteSheet({
  route,
  instructions,
  navigationStatus,
  activeStep,
  destination,
  viewingFloorId,
  onAdvance,
  onReset,
}) {
  const [expanded, setExpanded] = useState(false)

  if (!route || !instructions.length) return null

  const arrived = navigationStatus === "arrived"
  const stepNumber = Math.min(activeStep + 1, instructions.length)
  const progress = arrived ? 1 : stepNumber / instructions.length
  const nextInstruction = arrived ? "You have arrived." : instructions[activeStep]?.text

  return (
    <section
      aria-label="Route summary"
      className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-40 rounded-t-[1.5rem] border-t border-[#E5E5E7] bg-white shadow-[0_-18px_50px_rgba(0,0,0,0.14)] lg:hidden"
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className="flex w-full flex-col items-center rounded-t-[1.5rem] px-5 pt-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1D1D1F]"
      >
        <span aria-hidden="true" className="h-1 w-10 rounded-full bg-[#D2D2D7]" />
        <span className="mt-3 flex w-full items-start justify-between gap-3 pb-3 text-left">
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#86868B]">
              {arrived ? "Arrived" : `To ${destination?.name || "destination"}`} · {viewingFloorId}
            </span>
            <span className={cn("mt-1 block truncate text-sm font-medium", arrived ? "text-[#1D1D1F]" : "text-[#1D1D1F]")}>{nextInstruction}</span>
            <span className="mt-1 block text-[11px] tabular-nums text-[#86868B]">
              Step {stepNumber} of {instructions.length} · {route.distance.label}
            </span>
          </span>
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E5E5E7] text-[#6E6E73]">
            {expanded ? <ChevronDown className="h-4 w-4" aria-hidden="true" /> : <ChevronUp className="h-4 w-4" aria-hidden="true" />}
          </span>
        </span>
        <span aria-hidden="true" className="mb-3.5 block h-1 w-full overflow-hidden rounded-full bg-[#F0F0F2]">
          <span className="block h-full rounded-full bg-brand-600 transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${Math.round(progress * 100)}%` }} />
        </span>
      </button>

      {expanded && (
        <div className="max-h-[42vh] overflow-y-auto overscroll-contain border-t border-[#F0F0F2] px-5 pb-5 pt-4">
          <dl className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-[#F5F5F7] p-2.5">
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#86868B]">{route.floorChanges ? "Route cost" : "Distance"}</dt>
              <dd className="mt-0.5 text-xs font-semibold">{route.distance.label}</dd>
            </div>
            <div className="rounded-xl bg-[#F5F5F7] p-2.5">
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#86868B]">Floors</dt>
              <dd className="mt-0.5 text-xs font-semibold">{route.routeFloorIds.join(" → ")}</dd>
            </div>
            <div className="rounded-xl bg-[#F5F5F7] p-2.5">
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#86868B]">Changes</dt>
              <dd className="mt-0.5 text-xs font-semibold tabular-nums">{route.floorChanges}</dd>
            </div>
          </dl>
          <RouteSteps
            instructions={instructions}
            navigationStatus={navigationStatus}
            activeStep={activeStep}
            onAdvance={onAdvance}
            onReset={onReset}
          />
        </div>
      )}

      {!expanded && navigationStatus === "active" && (
        <div className="border-t border-[#F0F0F2] px-5 py-3">
          <button
            type="button"
            onClick={onAdvance}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
          >
            {activeStep >= instructions.length - 1 ? "Confirm Arrival" : "Next Step"}
          </button>
        </div>
      )}
    </section>
  )
}
