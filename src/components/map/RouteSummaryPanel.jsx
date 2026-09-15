import { ArrowRight, ArrowUp, Check, RotateCcw, View } from "lucide-react"
import { button } from "@/components/campus/ui"

export function RouteSteps({ instructions, navigationStatus, activeStep, onAdvance, onReset, dark = false }) {
  return (
    <>
      <ol className="space-y-4">
        {instructions.map((instruction, index) => {
          const complete = navigationStatus === "arrived" || index < activeStep
          const active = navigationStatus === "active" && index === activeStep
          return (
            <li key={`${instruction.type}-${index}`} className="flex gap-3">
              <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
                complete || active
                  ? dark ? "border-white bg-white text-brand-800" : "border-brand-700 bg-brand-700 text-white"
                  : dark ? "border-white/30 text-white/55" : "border-[#D2D2D7] text-[#86868B]"
              }`}>
                {complete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : instruction.type === "stairs" || instruction.type === "floor-change" ? <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
              </div>
              <p className={`text-sm leading-relaxed ${active ? (dark ? "font-medium text-white" : "font-medium text-[#1D1D1F]") : (dark ? "text-white/70" : "text-[#6E6E73]")}`}>{instruction.text}</p>
            </li>
          )
        })}
      </ol>
      {navigationStatus === "active" && (
        <button onClick={onAdvance} className={`${button.primary} mt-6 w-full`}>
          {activeStep >= instructions.length - 1 ? "Confirm Arrival" : "Next Step"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      <button onClick={onReset} className={`${button.secondary} mt-3 w-full`}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" /> {navigationStatus === "arrived" ? "Plan Another Route" : "End Navigation"}
      </button>
    </>
  )
}

export default function RouteSummaryPanel({
  route,
  instructions,
  navigationStatus,
  activeStep,
  currentLocation,
  destination,
  currentFloorId,
  viewingFloorId,
  mapView,
  onAdvance,
  onReset,
  onSwitchView,
}) {
  const arrived = navigationStatus === "arrived"

  return (
    <>
      <section className={`rounded-[1.75rem] border p-6 ${arrived ? "border-brand-800 bg-brand-800 text-white" : "border-[#E5E5E7] bg-white"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${arrived ? "text-white/55" : "text-[#86868B]"}`}>
              {arrived ? "Arrival state" : "Route summary"}
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-snug tracking-tight">
              {arrived ? `Arrived at ${destination?.name}` : destination?.name}
            </h2>
            {!arrived && (
              <p className="mt-1.5 text-sm text-[#6E6E73]">
                From {currentLocation?.name} — {currentLocation?.floorId}
              </p>
            )}
          </div>
          {arrived && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-800">
              <Check className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
        </div>

        <dl className={`mt-5 grid grid-cols-2 gap-x-3 gap-y-4 border-t pt-5 ${arrived ? "border-white/15" : "border-[#F0F0F2]"}`}>
          <div>
            <dt className={`text-[10px] font-medium uppercase tracking-wide ${arrived ? "text-white/55" : "text-[#86868B]"}`}>{route.floorChanges ? "Est. route cost" : "Est. distance"}</dt>
            <dd className="mt-1 text-sm font-semibold">{route.distance.label}</dd>
          </div>
          <div>
            <dt className={`text-[10px] font-medium uppercase tracking-wide ${arrived ? "text-white/55" : "text-[#86868B]"}`}>Floor changes</dt>
            <dd className="mt-1 text-sm font-semibold tabular-nums">{route.floorChanges}</dd>
          </div>
          <div>
            <dt className={`text-[10px] font-medium uppercase tracking-wide ${arrived ? "text-white/55" : "text-[#86868B]"}`}>Route floors</dt>
            <dd className="mt-1 text-sm font-semibold">{route.routeFloorIds.join(" → ")}</dd>
          </div>
          <div>
            <dt className={`text-[10px] font-medium uppercase tracking-wide ${arrived ? "text-white/55" : "text-[#86868B]"}`}>Current · viewing</dt>
            <dd className="mt-1 text-sm font-semibold">{currentFloorId} · {viewingFloorId}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onSwitchView}
          className={`mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border px-4 text-xs font-semibold transition-colors duration-200 ${
            arrived ? "border-white/30 text-white hover:border-white" : "border-[#D2D2D7] text-[#1D1D1F] hover:border-[#86868B]"
          }`}
        >
          <View className="h-3.5 w-3.5" aria-hidden="true" /> Switch to {mapView === "2D" ? "3D" : "2D"} view
        </button>
      </section>

      <section className="rounded-[1.75rem] border border-[#E5E5E7] bg-white p-6">
        <h2 className="font-semibold tracking-tight">Navigation steps</h2>
        <div className="mt-5">
          <RouteSteps
            instructions={instructions}
            navigationStatus={navigationStatus}
            activeStep={activeStep}
            onAdvance={onAdvance}
            onReset={onReset}
          />
        </div>
      </section>
    </>
  )
}
