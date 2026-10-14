import { ArrowRight, ChevronDown, ChevronUp, LocateFixed, Navigation, QrCode, RotateCcw } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { RouteSteps } from "./RouteSummaryPanel"
import { button } from "@/components/campus/ui"
import { getFloorById } from "@/data/floors"
import { cn } from "@/lib/utils"
import { RouteFailureNotice } from "./RoutePreferences"

/**
 * The one contextual sheet for Navigate on phones and tablets, fixed above
 * the bottom navigation so the map stays visible behind it:
 * - before a route: the chosen destination and Start Navigation, or, while
 *   no current location is set, "Set your location" with Scan QR and Choose
 *   manually;
 * - during a route: ONE current instruction, the next one, and Next Step;
 *   the full step list and route figures open with "All steps";
 * - on arrival: a confirmation and Plan Another Route.
 * Desktop keeps the side panel. Values come from the shared navigation state.
 * @param {Record<string, any>} props
 */
export default function MobileRouteSheet(props) {
  const { route, instructions, navigationStatus, activeStep, destination, viewingFloorId, onAdvance, onReset, onStart = null, canStart = false, hasLocation = true, onScan = null, onChooseManually = null, error = "", failure = null, onChooseStandard = null, preferenceLabel = "Standard", suppressed = false } = props
  const [expanded, setExpanded] = useState(false)
  const sheetRef = useRef(null)
  const hasRoute = Boolean(route && instructions.length)
  const visible = hasRoute || Boolean(destination && onStart)

  // Lift the floating CLARA button (and the map's bottom controls) above this
  // sheet so they never overlap. Cleared when the sheet unmounts.
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

  useEffect(() => { if (!hasRoute) setExpanded(false) }, [hasRoute])

  if (!visible) return null

  const sheetClass = cn("fixed inset-x-0 md:left-[var(--sidebar-width)] bottom-[var(--app-bottom-nav-height)] z-dropdown max-h-[60dvh] overflow-y-auto overscroll-contain rounded-t-2xl border-t border-line-strong bg-surface pb-[var(--app-bottom-safe)] shadow-[0_-12px_36px_rgba(29,31,32,0.14)] lg:hidden", suppressed && "hidden")

  if (!hasRoute) {
    const floor = getFloorById(destination.floorId)
    return (
      <section ref={sheetRef} aria-label="Selected destination" className={sheetClass}>
        {hasLocation ? (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-semibold leading-snug text-ink">{destination.name}</p>
              <p className="truncate text-sm text-ink-soft">{floor?.name || destination.floorId} · {preferenceLabel}</p>
            </div>
            <button type="button" onClick={onStart} disabled={!canStart} className={cn(button.primary, "min-h-12 shrink-0 px-4")}>
              <Navigation className="h-4 w-4" aria-hidden="true" /> Start Navigation
            </button>
          </div>
        ) : (
          // No route is calculated until the visitor has set where they are.
          <div className="px-4 py-3">
            <p className="truncate text-[16px] font-semibold leading-snug text-ink">{destination.name} <span className="font-normal text-ink-soft">· {floor?.name || destination.floorId}</span></p>
            <p role="status" className="mt-0.5 text-sm text-ink-soft">Set your location to create a route.</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button type="button" onClick={onScan} className={cn(button.primary, "min-h-12 px-3")}>
                <QrCode className="h-4 w-4" aria-hidden="true" /> Scan QR
              </button>
              <button type="button" onClick={onChooseManually} className={cn(button.secondary, "min-h-12 px-3")}>
                <LocateFixed className="h-4 w-4" aria-hidden="true" /> Choose manually
              </button>
            </div>
          </div>
        )}
        {error && (
          <RouteFailureNotice message={error} failure={failure} onChooseStandard={onChooseStandard} className="mx-3 mb-3" />
        )}
      </section>
    )
  }

  const arrived = navigationStatus === "arrived"
  const stepNumber = Math.min(activeStep + 1, instructions.length)
  const progress = arrived ? 1 : stepNumber / instructions.length
  const currentInstruction = arrived ? `You have arrived at ${destination?.name || "your destination"}.` : instructions[activeStep]?.text
  const nextInstruction = !arrived ? instructions[activeStep + 1]?.text : null
  const lastStep = activeStep >= instructions.length - 1

  return (
    <section ref={sheetRef} aria-label="Route summary" className={sheetClass}>
      <div className="px-4 pt-3">
        <p className="truncate text-[12px] font-medium text-ink-soft">
          {arrived ? "Arrived" : `To ${destination?.name || "destination"}`}
          {` · ${preferenceLabel}`}
          {route.floorChanges > 0 && ` · ${route.floorChanges} floor change${route.floorChanges === 1 ? "" : "s"}`}
        </p>
        <p aria-live="polite" className="mt-1 text-[17px] font-semibold leading-snug text-ink">{currentInstruction}</p>
        {nextInstruction && <p className="mt-1 line-clamp-1 text-sm text-ink-soft"><span className="font-medium text-ink-mid">Next:</span> {nextInstruction}</p>}
        <span aria-hidden="true" className="mt-2.5 block h-1 w-full overflow-hidden rounded-full bg-fill-strong">
          <span className="block h-full rounded-full bg-brand-700 transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${Math.round(progress * 100)}%` }} />
        </span>
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className={cn(button.secondary, "min-h-12 shrink-0 px-3.5")}
        >
          {expanded ? <ChevronDown className="h-4 w-4" aria-hidden="true" /> : <ChevronUp className="h-4 w-4" aria-hidden="true" />}
          {expanded ? "Hide steps" : "All steps"}
          <span className="sr-only">, step {stepNumber} of {instructions.length}, viewing {viewingFloorId}</span>
        </button>
        {!expanded && navigationStatus === "active" && (
          <button type="button" onClick={onAdvance} className={cn(button.primary, "min-h-12 flex-1")}>
            {lastStep ? "Confirm Arrival" : "Next Step"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        {!expanded && arrived && (
          <button type="button" onClick={onReset} className={cn(button.primary, "min-h-12 flex-1")}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Plan Another Route
          </button>
        )}
      </div>

      {expanded && (
        <div className="max-h-[46dvh] overflow-y-auto overscroll-contain border-t border-line px-4 pb-4 pt-3">
          <p className="mb-3 text-sm text-ink-soft">
            Step {stepNumber} of {instructions.length} · {route.distance.label} · Floors {route.routeFloorIds.join(" → ")}
          </p>
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
    </section>
  )
}
