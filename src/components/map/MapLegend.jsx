import { listMapCategories, MAP_COLORS } from "@/lib/facilityCategories"
import { cn } from "@/lib/utils"

/**
 * Compact legend for the 2D map: wayfinding marks plus the facility
 * categories present on the currently viewed floor. Presentation only.
 *
 * CampusNav is monochrome, so each entry reproduces the mark's actual form —
 * disc fill and ring weight for the markers, stroke pattern for the paths, and
 * the category's own icon for facility types — instead of a color swatch.
 */
/** @param {Record<string, any>} props */
export default function MapLegend(props) {
  const { floorFacilities, emergencyMode = false, className } = props
  const categories = listMapCategories(floorFacilities)

  return (
    <div
      aria-label="Map legend"
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-[#D2D2D7] bg-white px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-[#48484A]",
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 rounded-full border-2 border-white"
          style={{ backgroundColor: MAP_COLORS.current, boxShadow: `0 0 0 1.5px ${MAP_COLORS.current}` }}
        />
        You are here
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 rounded-full border-2 bg-white"
          style={{ borderColor: MAP_COLORS.destination }}
        />
        Destination
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="h-[3px] w-5 rounded-full"
          style={{
            backgroundColor: emergencyMode ? MAP_COLORS.emergencyRoute : MAP_COLORS.route,
            backgroundImage: emergencyMode
              ? "repeating-linear-gradient(90deg,transparent,transparent 3px,white 3px,white 5px)"
              : undefined,
          }}
        />
        {emergencyMode ? "Approved evacuation path" : "Route"}
      </span>
      {emergencyMode && (
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-flex h-3.5 items-center rounded-[3px] px-1 text-[6px] font-black text-white"
            style={{ backgroundColor: MAP_COLORS.exit }}
          >
            EXIT
          </span>
          Verified exit
        </span>
      )}
      <span aria-hidden="true" className="hidden h-4 w-px bg-[#D2D2D7] sm:block" />
      {categories.map((category) => {
        const Icon = category.icon
        return (
          <span key={category.key} className="inline-flex items-center gap-1.5 font-medium normal-case tracking-normal text-[#6E6E73]">
            <span
              aria-hidden="true"
              className={cn("flex h-4 w-4 items-center justify-center rounded-[4px] border", category.chip)}
            >
              <Icon className="h-2.5 w-2.5" />
            </span>
            {category.label}
          </span>
        )
      })}
    </div>
  )
}
