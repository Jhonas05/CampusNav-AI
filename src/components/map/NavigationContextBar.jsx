import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, CircleDashed, Flag, LocateFixed, Navigation, QrCode, ShieldAlert, TriangleAlert } from "lucide-react"
import { focusRing } from "@/components/campus/ui"
import { getFloorById } from "@/data/floors"
import { POSITIONING_METHOD } from "@/lib/checkpointPositioning"
import { cn } from "@/lib/utils"

const Endpoint = ({ icon: Icon, kicker, title, detail, tone = "ink", empty = false }) => (
  <div className="flex min-w-0 items-start gap-2.5">
    <span
      aria-hidden="true"
      className={cn(
        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        tone === "green" ? "bg-brand-700 text-on-ink" : tone === "red" ? "bg-ink text-on-ink" : "bg-ink text-on-ink",
        empty && "border border-dashed border-line-strong bg-transparent text-ink-faint",
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{kicker}</p>
      <p className={cn("truncate font-heading text-[17px] font-semibold leading-tight", empty ? "text-ink-faint" : "text-ink")}>{title}</p>
      {detail && <p className="truncate text-[11px] font-medium text-ink-soft">{detail}</p>}
    </div>
  </div>
)

/**
 * Compact navigation context: where you are, where you are going, and the
 * state of the route. Values come straight from the shared navigation state;
 * nothing (for example travel time) is estimated here.
 * @param {Record<string, any>} props
 */
export default function NavigationContextBar(props) {
  const {
    currentLocation,
    currentPosition,
    destination,
    route,
    navigationStatus,
    activeStep,
    instructionCount,
    emergencyMode = false,
    emergencyResult = null,
    viewingFloorId,
    onViewFloor,
    className,
  } = props

  const currentFloor = getFloorById(currentPosition.currentFloorId)
  const viaQr = currentPosition.positioningMethod === POSITIONING_METHOD.QR
  const methodLabel = viaQr ? `QR confirmed · ${currentPosition.checkpointId}` : "Manual selection"
  const routeFloorIds = route?.routeFloorIds || []
  const routeFloorIndex = routeFloorIds.indexOf(viewingFloorId)

  let status
  if (emergencyMode) {
    status = !emergencyResult
      ? { icon: ShieldAlert, label: "Approved routes only", tone: "red-outline" }
      : emergencyResult.ok
        ? { icon: CheckCircle2, label: "Verified exit route", tone: "red" }
        : { icon: TriangleAlert, label: "No verified route", tone: "red-outline" }
  } else if (navigationStatus === "arrived") {
    status = { icon: CheckCircle2, label: "Arrived", tone: "green" }
  } else if (navigationStatus === "active") {
    status = { icon: Navigation, label: `Step ${Math.min(activeStep + 1, instructionCount)} of ${instructionCount}`, tone: "green" }
  } else {
    status = destination
      ? { icon: CircleDashed, label: "Route not started", tone: "neutral" }
      : { icon: CircleDashed, label: "Choose a destination", tone: "neutral" }
  }
  const StatusIcon = status.icon

  return (
    <section
      aria-label="Navigation context"
      className={cn("ink-blueprint flex flex-col gap-3 px-3.5 py-3 sm:px-4 xl:flex-row xl:items-center xl:gap-5", emergencyMode && "border-ink", className)}
    >
      <div className="relative z-[1] grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
        <Endpoint
          icon={viaQr ? QrCode : LocateFixed}
          kicker="You are here"
          title={currentLocation?.name || "Not selected"}
          detail={`${currentFloor?.shortName || currentPosition.currentFloorId} · ${methodLabel}`}
          empty={!currentLocation}
        />
        <ArrowRight className="h-4 w-4 shrink-0 text-ink-ghost" aria-hidden="true" />
        {emergencyMode ? (
          <Endpoint
            icon={ShieldAlert}
            kicker="Nearest verified exit"
            title={emergencyResult?.ok ? emergencyResult.exit.label : emergencyResult ? "No verified route" : "Not calculated"}
            detail={emergencyResult?.ok ? `Ends on ${emergencyResult.route.routeFloorIds.at(-1)}` : "Approved emergency data only"}
            tone="red"
            empty={!emergencyResult?.ok}
          />
        ) : (
          <Endpoint
            icon={Flag}
            kicker="Destination"
            title={destination?.name || "Choose a destination"}
            detail={destination ? getFloorById(destination.floorId)?.name || destination.floorId : "Search or select a room on the map"}
            tone="green"
            empty={!destination}
          />
        )}
      </div>

      <div className="relative z-[1] flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-2.5 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
        <span
          className={cn(
            "inline-flex min-h-7 items-center gap-1.5 rounded-lg px-2.5 font-heading text-[12px] font-semibold",
            status.tone === "green" && "bg-brand-700 text-on-ink",
            status.tone === "red" && "bg-ink text-on-ink",
            status.tone === "red-outline" && "border border-ink text-ink",
            status.tone === "neutral" && "border border-dashed border-line-strong text-ink-soft",
          )}
        >
          <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" /> {status.label}
        </span>
        {route && (
          <dl className={cn("flex-wrap items-baseline gap-x-4 gap-y-1 text-[12px]", emergencyMode ? "flex" : "hidden sm:flex")}>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">{emergencyMode ? "Approved route cost" : route.floorChanges ? "Est. route cost" : "Est. distance"}</dt>
              <dd className="font-semibold tabular-nums text-ink">{route.distance.label}</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">Floor changes</dt>
              <dd className="font-semibold tabular-nums text-ink">{route.floorChanges}</dd>
            </div>
          </dl>
        )}
        {routeFloorIds.length > 1 && (
          <div role="group" aria-label="Route floors" className="flex items-center gap-1">
            <button type="button" aria-label="Previous route floor" disabled={routeFloorIndex <= 0} onClick={() => onViewFloor(routeFloorIds[routeFloorIndex - 1])} className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-mid hover:bg-fill disabled:cursor-not-allowed disabled:opacity-30", focusRing)}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            {routeFloorIds.map((routeFloorId, index) => (
              <span key={routeFloorId} className="flex items-center gap-1">
                {index > 0 && <ArrowRight className="h-3 w-3 text-ink-ghost" aria-hidden="true" />}
                <button
                  type="button"
                  aria-pressed={viewingFloorId === routeFloorId}
                  aria-label={`View route on ${getFloorById(routeFloorId)?.name || routeFloorId}`}
                  onClick={() => onViewFloor(routeFloorId)}
                  className={cn(
                    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-1.5 font-heading text-[13px] font-semibold transition-colors duration-150",
                    viewingFloorId === routeFloorId ? "border-brand-700 bg-brand-700 text-on-ink" : "border-line-strong bg-surface text-ink hover:border-brand-700",
                    focusRing,
                  )}
                >
                  {routeFloorId}
                </button>
              </span>
            ))}
            <button type="button" aria-label="Next route floor" disabled={routeFloorIndex < 0 || routeFloorIndex >= routeFloorIds.length - 1} onClick={() => onViewFloor(routeFloorIds[routeFloorIndex + 1])} className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-mid hover:bg-fill disabled:cursor-not-allowed disabled:opacity-30", focusRing)}>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
