import { ArrowRight, Clock3, MapPin } from "lucide-react"
import { Link } from "react-router-dom"
import { button } from "@/components/campus/ui"
import FacilityStatusBadge from "@/components/facilities/FacilityStatusBadge"
import { getFloorById } from "@/data/floors"
import { getFacilityNavigationHref } from "@/services/dashboardService"

/**
 * Facility result returned by CLARA. Both actions are the existing CampusNav
 * routes: Navigate opens the normal Map flow (one routing engine) and View
 * opens the facility page.
 * @param {Record<string, any>} props
 */
export default function ClaraResultCard(props) {
  const { facility, onNavigate } = props
  const floor = getFloorById(facility.floorId)
  const navigationHref = getFacilityNavigationHref(facility.id)
  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">{facility.kind}</p>
        <p className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em] text-ink">{facility.name}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-soft">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {floor?.name || facility.floorId}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <FacilityStatusBadge size="sm" />
          <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink-faint px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
            <Clock3 className="h-3 w-3" aria-hidden="true" /> Hours pending
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line bg-subtle p-2.5">
        {navigationHref && (
          <Link to={navigationHref} onClick={onNavigate} className={button.smallPrimary}>
            Navigate There <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
        <Link to={`/facilities/${facility.id}`} onClick={onNavigate} className={button.smallSecondary}>
          {facility.kind === "Office" ? "View Office" : "View Details"}
        </Link>
      </div>
    </div>
  )
}
