import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { RouteSteps } from "./RouteSummaryPanel"
import { button } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

/**
 * True mobile navigation surface (§ mobile navigation UI): a fixed bottom
 * sheet at the bottom of the screen with the destination, the next instruction,
 * route progress, and expandable full steps. Desktop keeps the side panel.
 * @param {Record<string, any>} props
 */
export default function MobileRouteSheet(props) {
  const { route, instructions, navigationStatus, activeStep, destination, viewingFloorId, onAdvance, onReset } = props
  const [expanded, setExpanded] = useState(false)
  const sheetRef = useRef(null)
  const visible = Boolean(route && instructions.length)

  // Lift the floating CLARA button above this sheet (phones/tablets only) so
  // the two never overlap. Cleared when the sheet unmounts.
  useEffect(() => {
    const sheet = sheetRef.current
    if (!visible || !sheet || typeof ResizeObserver === "undefined") return undefined
    const root = document.documentElement
    const update = () => {
      const shown = window.getComputedStyle(sheet).display !== "none"
      root.style.setProperty("--clara-lift", shown ? `${Math.round(sheet.getBoundingClientRect().height)}px` : "0px")
    }
    const observer = new ResizeObserver(update)
    observer.observe(sheet)
    window.addEventListener("resize", update)
    update()
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", update)
      root.style.removeProperty("--clara-lift")
    }
  }, [visible])

  if (!route || !instructions.length) return null

  const arrived = navigationStatus === "arrived"
  const stepNumber = Math.min(activeStep + 1, instructions.length)
  const progress = arrived ? 1 : stepNumber / instructions.length
  const nextInstruction = arrived ? "You have arrived." : instructions[activeStep]?.text

  return (
    <section
      ref={sheetRef}
      aria-label="Route summary"
      className="fixed inset-x-0 bottom-0 z-dropdown pb-[env(safe-area-inset-bottom)] rounded-t-2xl border-t border-line-strong bg-surface shadow-[0_-12px_36px_rgba(29,31,32,0.14)] lg:hidden"
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className="flex w-full flex-col items-center rounded-t-2xl px-4 pt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-700"
      >
        <span aria-hidden="true" className="h-1 w-9 rounded-full bg-line-strong" />
        <span className="mt-2.5 flex w-full items-start justify-between gap-3 pb-2.5 text-left">
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              {arrived ? "Arrived" : `To ${destination?.name || "destination"}`} · Viewing {viewingFloorId}
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold text-ink">{nextInstruction}</span>
            <span className="mt-0.5 block text-[11px] tabular-nums text-ink-soft">
              Step {stepNumber} of {instructions.length} · {route.distance.label}
            </span>
          </span>
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line-strong text-ink-soft">
            {expanded ? <ChevronDown className="h-4 w-4" aria-hidden="true" /> : <ChevronUp className="h-4 w-4" aria-hidden="true" />}
            <span className="sr-only">{expanded ? "Collapse route steps" : "Expand route steps"}</span>
          </span>
        </span>
        <span aria-hidden="true" className="mb-3 block h-1 w-full overflow-hidden rounded-full bg-fill-strong">
          <span className="block h-full rounded-full bg-brand-700 transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${Math.round(progress * 100)}%` }} />
        </span>
      </button>

      {expanded && (
        <div className="max-h-[46vh] overflow-y-auto overscroll-contain border-t border-line px-4 pb-4 pt-3">
          <dl className="mb-3 grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded-lg border border-line p-2">
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-ink-faint">{route.floorChanges ? "Route cost" : "Distance"}</dt>
              <dd className="mt-0.5 text-xs font-semibold">{route.distance.label}</dd>
            </div>
            <div className="rounded-lg border border-line p-2">
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-ink-faint">Floors</dt>
              <dd className="mt-0.5 text-xs font-semibold">{route.routeFloorIds.join(" → ")}</dd>
            </div>
            <div className="rounded-lg border border-line p-2">
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-ink-faint">Changes</dt>
              <dd className="mt-0.5 text-xs font-semibold tabular-nums">{route.floorChanges}</dd>
            </div>
          </dl>
          <RouteSteps
            instructions={instructions}
            navigationStatus={navigationStatus}
            activeStep={activeStep}
            onAdvance={onAdvance}
            onReset={onReset}
            compact
          />
        </div>
      )}

      {!expanded && navigationStatus === "active" && (
        <div className="border-t border-line px-4 py-2.5">
          <button type="button" onClick={onAdvance} className={cn(button.primary, "w-full")}>
            {activeStep >= instructions.length - 1 ? "Confirm Arrival" : "Next Step"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  )
}
