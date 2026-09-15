import { listMapCategories } from "@/lib/facilityCategories"
import { cn } from "@/lib/utils"

/**
 * Compact legend for the 2D map: wayfinding marks plus the facility
 * categories present on the currently viewed floor. Presentation only.
 */
/** @param {Record<string, any>} props */
export default function MapLegend(props) {
  const { floorFacilities, emergencyMode = false, className } = props
  const categories = listMapCategories(floorFacilities)

  return (
    <div aria-label="Map legend" className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-[#E5E5E7] bg-white px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-[#48484A]", className)}>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600 shadow-[0_0_0_1.5px_#2563EB]" /> You are here
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border-2 border-red-600 bg-white" /> Destination
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className={cn("h-[3px] w-5 rounded-full", emergencyMode ? "bg-red-600 [background-image:repeating-linear-gradient(90deg,transparent,transparent_3px,white_3px,white_5px)]" : "bg-[#1E7A45]")} />
        {emergencyMode ? "Approved evacuation path" : "Route"}
      </span>
      {emergencyMode && (
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-flex h-3.5 items-center rounded-[3px] bg-green-700 px-1 text-[6px] font-black text-white">EXIT</span> Verified exit
        </span>
      )}
      <span aria-hidden="true" className="hidden h-4 w-px bg-[#E5E5E7] sm:block" />
      {categories.map((category) => (
        <span key={category.key} className="inline-flex items-center gap-1.5 font-medium normal-case tracking-normal text-[#6E6E73]">
          <span aria-hidden="true" className={cn("h-2.5 w-2.5 rounded-[4px]", category.dot)} /> {category.label}
        </span>
      ))}
    </div>
  )
}
