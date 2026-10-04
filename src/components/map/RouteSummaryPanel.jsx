import { ArrowDown, ArrowRight, ArrowUp, Check, Flag, LocateFixed, RotateCcw } from "lucide-react"
import { button, InkSectionLabel } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

/** Canonical wording: step progress is user-advanced, not sensor tracking (40-state-management-contract). */
export const MANUAL_PROGRESS_NOTE = "Steps advance when you select Next Step. CampusNav does not track your live position."

const stepIcon = (instruction) => {
  if (instruction.type === "start") return LocateFixed
  if (instruction.type === "arrive") return Flag
  if (instruction.type === "stairs" || instruction.type === "floor-change") return /\bdown\b/i.test(instruction.text) ? ArrowDown : ArrowUp
  return null
}

/** @param {Record<string, any>} props */
export function RouteSteps(props) {
  const { instructions, navigationStatus, activeStep, onAdvance, onReset, compact = false } = props
  return (
    <>
      <ol className={cn("relative", compact ? "space-y-2" : "space-y-2.5")}>
        {instructions.map((instruction, index) => {
          const complete = navigationStatus === "arrived" || index < activeStep
          const active = navigationStatus === "active" && index === activeStep
          const Icon = stepIcon(instruction)
          return (
            <li key={`${instruction.type}-${index}`} aria-current={active ? "step" : undefined} className={cn("flex gap-2.5 rounded-lg px-1.5 py-1", active && "bg-fill")}>
              <span className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold tabular-nums",
                complete ? "border-brand-700 bg-brand-700 text-on-ink" : active ? "border-ink bg-ink text-on-ink" : "border-line-strong bg-surface text-ink-faint",
              )}>
                {complete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
              </span>
              <p className={cn("min-w-0 flex-1 text-[13px] leading-relaxed", active ? "font-semibold text-ink" : complete ? "text-ink-soft" : "text-ink-mid")}>
                <span className="sr-only">{complete ? "Completed: " : active ? "Current step: " : ""}</span>
                {instruction.text}
              </p>
              {instruction.floorId && (
                <span className="mt-0.5 h-fit shrink-0 rounded-md border border-line-strong px-1 font-heading text-[11px] font-semibold tracking-[0.06em] text-ink-soft">{instruction.floorId}</span>
              )}
            </li>
          )
        })}
      </ol>
      {navigationStatus === "active" && (
        <button type="button" onClick={onAdvance} className={`${button.primary} mt-4 w-full`}>
          {activeStep >= instructions.length - 1 ? "Confirm Arrival" : "Next Step"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      <button type="button" onClick={onReset} className={`${button.secondary} mt-2 w-full`}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" /> {navigationStatus === "arrived" ? "Plan Another Route" : "End Navigation"}
      </button>
      <p className="mt-2.5 text-[11px] leading-relaxed text-ink-soft">{MANUAL_PROGRESS_NOTE}</p>
    </>
  )
}

/** @param {Record<string, any>} props */
export default function RouteSummaryPanel(props) {
  const { route, instructions, navigationStatus, activeStep, currentLocation, destination, onAdvance, onReset } = props
  const arrived = navigationStatus === "arrived"

  return (
    <section aria-label="Route steps" className="ink-blueprint p-4">
      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <InkSectionLabel as="p">{arrived ? "Arrival" : "Route"}</InkSectionLabel>
            <h2 className="mt-1.5 font-heading text-xl font-semibold leading-tight">
              {arrived ? `Arrived at ${destination?.name}` : destination?.name}
            </h2>
            {!arrived && <p className="mt-0.5 text-xs text-ink-soft">From {currentLocation?.name} — {currentLocation?.floorId}</p>}
          </div>
          {arrived && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-on-ink">
              <Check className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 border-y border-line py-2.5 text-[12px]">
          <div className="col-span-2">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint">{route.floorChanges ? "Route cost" : "Distance"}</dt>
            <dd className="mt-0.5 font-semibold leading-tight">{route.distance.label}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint">Floors</dt>
            <dd className="mt-0.5 font-semibold">{route.routeFloorIds.join(" → ")}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint">Changes</dt>
            <dd className="mt-0.5 font-semibold tabular-nums">{route.floorChanges}</dd>
          </div>
        </dl>
        <div className="mt-3">
          <RouteSteps instructions={instructions} navigationStatus={navigationStatus} activeStep={activeStep} onAdvance={onAdvance} onReset={onReset} />
        </div>
      </div>
    </section>
  )
}
