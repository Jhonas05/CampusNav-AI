import { Box, Map as MapIcon } from "lucide-react"
import { focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

/**
 * 2D / 3D segmented switch. Switching changes the renderer only; navigation
 * state lives in the Navigate page and is shared by both views.
 * @param {Record<string, any>} props
 */
export default function MapViewToggle(props) {
  const { mapView, onSelect2D, onSelect3D, className } = props
  const option = (active) => cn(
    "inline-flex h-10 items-center gap-1.5 rounded-lg px-3 font-heading text-[13px] font-semibold transition-colors duration-150 motion-reduce:transition-none",
    active ? "bg-ink text-on-ink" : "text-ink-mid hover:bg-fill hover:text-ink",
    focusRing,
  )

  return (
    <div role="group" aria-label="Map view" className={cn("map-overlay-surface pointer-events-auto inline-flex gap-0.5 p-1", className)}>
      <button type="button" aria-pressed={mapView === "2D"} onClick={onSelect2D} className={option(mapView === "2D")}>
        <MapIcon className="h-4 w-4" aria-hidden="true" /><span>2D</span><span className="hidden sm:inline">Map</span>
      </button>
      <button type="button" aria-pressed={mapView === "3D"} onClick={onSelect3D} className={option(mapView === "3D")}>
        <Box className="h-4 w-4" aria-hidden="true" /><span>3D</span><span className="hidden sm:inline">Building</span>
      </button>
    </div>
  )
}
