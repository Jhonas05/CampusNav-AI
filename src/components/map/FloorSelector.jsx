import { Flag, LocateFixed } from "lucide-react"
import { focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

/**
 * Viewed-floor control shared by the 2D and 3D maps. Selecting a floor only
 * changes which floor is viewed; it never moves the current location or
 * recalculates the route. Your-location, destination, and route floors carry
 * icon/shape cues in addition to color.
 * @param {Record<string, any>} props
 */
export default function FloorSelector(props) {
  const { floors, viewingFloorId, currentFloorId = null, destinationFloorId = null, routeFloorIds = [], onSelect, orientation = "vertical", className } = props
  const vertical = orientation === "vertical"
  const ordered = vertical ? [...floors].sort((a, b) => b.level - a.level) : [...floors].sort((a, b) => a.level - b.level)
  const routeFloors = new Set(routeFloorIds)

  return (
    <div role="group" aria-label="Floor selector" className={cn("map-overlay-surface pointer-events-auto flex gap-1 p-1", vertical ? "flex-col" : "flex-row overflow-x-auto", className)}>
      {ordered.map((floor) => {
        const viewing = floor.id === viewingFloorId
        const isCurrent = floor.id === currentFloorId
        const isDestination = floor.id === destinationFloorId
        const onRoute = routeFloors.has(floor.id)
        const descriptions = [isCurrent && "your location", isDestination && "destination", onRoute && "on route", !floor.map && "map pending"].filter(Boolean)
        return (
          <button
            key={floor.id}
            type="button"
            aria-pressed={viewing}
            aria-label={`View ${floor.name}${descriptions.length ? ` (${descriptions.join(", ")})` : ""}`}
            title={floor.name}
            onClick={() => onSelect(floor.id)}
            className={cn(
              "relative inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-lg px-2 font-heading text-[15px] font-semibold transition-colors duration-150 motion-reduce:transition-none",
              viewing ? "bg-brand-700 text-on-ink" : "text-ink hover:bg-fill hover:text-brand-800",
              !floor.map && !viewing && "text-ink-ghost",
              focusRing,
            )}
          >
            {onRoute && (
              <span
                aria-hidden="true"
                className={cn("absolute rounded-full", vertical ? "left-0.5 top-2 bottom-2 w-[3px]" : "bottom-0.5 left-2 right-2 h-[3px]", viewing ? "bg-surface/70" : "bg-brand-600")}
              />
            )}
            <span>{floor.shortName}</span>
            {(isCurrent || isDestination) && (
              <span aria-hidden="true" className={cn("absolute flex gap-0.5", vertical ? "-right-1 -top-1" : "right-0 top-0")}>
                {isCurrent && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-on-ink bg-ink text-on-ink">
                    <LocateFixed className="h-2.5 w-2.5" />
                  </span>
                )}
                {isDestination && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-on-ink bg-brand-700 text-on-ink">
                    <Flag className="h-2.5 w-2.5" />
                  </span>
                )}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
