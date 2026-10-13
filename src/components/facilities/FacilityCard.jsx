import { ArrowUpRight, Navigation } from "lucide-react"
import { Link } from "react-router-dom"
import FacilityPhoto from "@/components/campus/FacilityPhoto"
import { button, cardHover, StatusBadge } from "@/components/campus/ui"
import { FACILITY_OPERATIONAL_STATUS } from "@/data/facilityContracts"
import { getFloorById } from "@/data/floors"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { cn } from "@/lib/utils"
import { getFacilityNavigationHref } from "@/services/dashboardService"

/**
 * Directory card: name, floor, one status, and at most two actions (Navigate,
 * then Details). Phones get a compact row (category tile + details) so the
 * directory stays scannable; from 640px the card also shows the category and
 * a two-line description under a short photo band. Everything else is on the
 * facility page.
 */
export default function FacilityCard({ facility, operational = null, operationalLoading = false }) {
  const floor = getFloorById(facility.floorId)
  const category = getFacilityCategory(facility)
  const underConstruction = facility.status === "UNDER_CONSTRUCTION"
  const operationalProfile = operational?.operationalProfile || null
  const operationalStatus = operational?.status || null
  const status = operationalStatus?.status || FACILITY_OPERATIONAL_STATUS.UNKNOWN
  const profilePending = operationalProfile?.provenance?.verificationStatus === "PENDING_VERIFICATION"
    || operationalProfile?.provenance?.dataStatus === "PENDING_VERIFICATION"
  const demo = Boolean(operationalProfile?.provenance?.demo || operationalStatus?.demo)
  const pending = status === FACILITY_OPERATIONAL_STATUS.PENDING_VERIFICATION || profilePending
  const navigationHref = getFacilityNavigationHref(facility.id)

  return (
    <article
      className={cn(
        "group flex overflow-hidden rounded-2xl border bg-surface sm:flex-col sm:rounded-3xl",
        underConstruction ? "border-dashed border-ink-faint" : "border-line",
        cardHover
      )}
    >
      <div className="relative w-16 shrink-0 sm:w-auto">
        <FacilityPhoto facility={facility} variant="card" className="aspect-auto h-full min-h-0 w-16 sm:h-20 sm:w-full" />
        <span className={cn("absolute left-3 top-3 hidden rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] backdrop-blur sm:inline-flex", category.chip, "bg-surface/90")}>{facility.kind}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <h3 className="text-[16px] font-semibold leading-snug tracking-tight text-ink">{facility.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-soft">
          <span className="whitespace-nowrap">{floor?.name || facility.floorId}</span>
          <span className="hidden items-center gap-1.5 whitespace-nowrap sm:inline-flex"><span aria-hidden="true" className={cn("h-2 w-2 rounded-full", category.dot)} />{category.label}</span>
          <StatusBadge
            status={status}
            label={operationalLoading ? "Loading status" : status === FACILITY_OPERATIONAL_STATUS.UNKNOWN ? "Unknown" : null}
            className="min-h-6 px-2.5 text-[10px]"
          />
          {demo && <StatusBadge status="UNKNOWN" label="Demo · not official" className="min-h-6 border-ink bg-ink px-2.5 text-[10px] text-on-ink" />}
          {pending && status !== FACILITY_OPERATIONAL_STATUS.PENDING_VERIFICATION && (
            <StatusBadge status="PENDING_VERIFICATION" label="Pending verification" className="min-h-6 px-2.5 text-[10px]" />
          )}
        </div>
        {operationalProfile?.description && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-soft max-sm:hidden">{operationalProfile.description}</p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-3">
          {navigationHref && (
            <Link to={navigationHref} aria-label={`Navigate to ${facility.name}`} className={cn(button.smallPrimary, "min-h-11 flex-1 px-3")}>
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" /> Navigate
            </Link>
          )}
          <Link to={`/facilities/${facility.id}`} aria-label={`View details for ${facility.name}`} className={cn(button.smallSecondary, "min-h-11 px-3", navigationHref ? "sm:flex-1" : "flex-1")}>
            Details <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
