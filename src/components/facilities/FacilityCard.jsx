import { ArrowUpRight, Clock3, MapPin } from "lucide-react"
import { Link } from "react-router-dom"
import FacilityPhoto from "@/components/campus/FacilityPhoto"
import { cardHover, focusRing, StatusBadge } from "@/components/campus/ui"
import { getFloorById } from "@/data/floors"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { cn } from "@/lib/utils"

export default function FacilityCard({ facility }) {
  const floor = getFloorById(facility.floorId)
  const category = getFacilityCategory(facility)
  const underConstruction = facility.status === "UNDER_CONSTRUCTION"

  return (
    <Link
      to={`/facilities/${facility.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border bg-white",
        underConstruction ? "border-dashed border-[#9CA3AF]" : "border-[#E5E5E7]",
        cardHover,
        focusRing
      )}
    >
      <div className="relative">
        <FacilityPhoto facility={facility} variant="card" />
        <span className={cn("absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] backdrop-blur", category.chip, "bg-white/90")}>{facility.kind}</span>
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/90 text-[#48484A] backdrop-blur transition-colors duration-200 group-hover:border-brand-700 group-hover:bg-brand-700 group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-[#1D1D1F]">{facility.name}</h3>
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[#6E6E73]">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{floor?.name || facility.floorId}</span>
          <span aria-hidden="true" className="text-[#D2D2D7]">·</span>
          <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className={cn("h-2 w-2 rounded-full", category.dot)} />{category.label}</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#86868B]">
          {facility.mapRoomId ? "Source-aligned location estimate." : "Exact location pending verification."}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[#F0F0F2] pt-4">
          {underConstruction || facility.status === "PENDING_VERIFICATION" ? (
            <StatusBadge status={facility.status} className="min-h-6 px-2.5 text-[9px]" />
          ) : (
            <StatusBadge status="FLOOR_VERIFIED" label="Floor Verified" className="min-h-6 border-green-700 bg-green-700 px-2.5 text-[9px] text-white" />
          )}
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-[#86868B]">
            <Clock3 className="h-3 w-3" aria-hidden="true" /> Hours pending
          </span>
        </div>
      </div>
    </Link>
  )
}
