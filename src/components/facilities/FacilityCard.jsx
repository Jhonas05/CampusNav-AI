import { ArrowUpRight, Clock3, MapPin } from "lucide-react"
import { Link } from "react-router-dom"
import FacilityPhoto from "@/components/campus/FacilityPhoto"
import { cardHover, focusRing, StatusBadge } from "@/components/campus/ui"
import { getFloorById } from "@/data/floors"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { cn } from "@/lib/utils"

/**
 * Directory card. Phones get a compact row (category tile + details) so the
 * full directory stays scannable; wider screens get the vertical card with a
 * short photo band. Content and states are identical in both layouts.
 */
export default function FacilityCard({ facility }) {
  const floor = getFloorById(facility.floorId)
  const category = getFacilityCategory(facility)
  const underConstruction = facility.status === "UNDER_CONSTRUCTION"

  return (
    <Link
      to={`/facilities/${facility.id}`}
      className={cn(
        "group flex overflow-hidden rounded-2xl border bg-surface sm:flex-col sm:rounded-3xl",
        underConstruction ? "border-dashed border-ink-faint" : "border-line",
        cardHover,
        focusRing
      )}
    >
      <div className="relative w-20 shrink-0 sm:w-auto">
        <FacilityPhoto facility={facility} variant="card" className="aspect-auto h-full min-h-0 w-20 sm:h-20 sm:w-full" />
        <span className={cn("absolute left-3 top-3 hidden rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] backdrop-blur sm:inline-flex", category.chip, "bg-surface/90")}>{facility.kind}</span>
        <span className="absolute right-3 top-3 hidden h-8 w-8 items-center justify-center rounded-full border border-on-ink/60 bg-surface/90 text-ink-mid backdrop-blur transition-colors duration-200 group-hover:border-brand-700 group-hover:bg-brand-700 group-hover:text-on-ink sm:flex">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-4">
        <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-ink sm:text-base">{facility.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] text-ink-soft">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{floor?.name || facility.floorId}</span>
          <span aria-hidden="true" className="text-ink-ghost">·</span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><span aria-hidden="true" className={cn("h-2 w-2 rounded-full", category.dot)} />{category.label}</span>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint sm:text-xs">
          {facility.mapRoomId ? "Source-aligned location estimate." : "Exact location pending verification."}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-2.5 sm:pt-3">
          {underConstruction || facility.status === "PENDING_VERIFICATION" ? (
            <StatusBadge status={facility.status} className="min-h-6 px-2.5 text-[9px]" />
          ) : (
            <StatusBadge status="FLOOR_VERIFIED" label="Floor Verified" className="min-h-6 border-ink bg-ink px-2.5 text-[9px] text-on-ink" />
          )}
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-ink-faint">
            <Clock3 className="h-3 w-3" aria-hidden="true" /> Hours pending
          </span>
        </div>
      </div>
    </Link>
  )
}
