import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { button } from "@/components/campus/ui"
import { getFloorById } from "@/data/floors"
import { getFacilityNavigationHref } from "@/services/dashboardService"

/**
 * Facility result returned by CLARA: the name, the floor, and at most two
 * actions. Both are the existing CampusNav routes: Navigate opens the normal
 * Map flow (one routing engine) and Details opens the facility page, which
 * carries hours, status, and verification.
 * @param {Record<string, any>} props
 */
export default function ClaraResultCard(props) {
  const { facility, onNavigate } = props
  const floor = getFloorById(facility.floorId)
  const navigationHref = getFacilityNavigationHref(facility.id)
  return (
    <div className="mt-2 rounded-2xl border border-line bg-surface p-3.5">
      <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{facility.name}</p>
      <p className="mt-0.5 text-[13px] text-ink-soft">{floor?.name || facility.floorId}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {navigationHref && (
          <Link to={navigationHref} onClick={onNavigate} aria-label={`Navigate to ${facility.name}`} className={`${button.smallPrimary} min-h-11`}>
            Navigate <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
        <Link to={`/facilities/${facility.id}`} onClick={onNavigate} aria-label={`View details for ${facility.name}`} className={`${button.smallSecondary} min-h-11`}>
          Details
        </Link>
      </div>
    </div>
  )
}
