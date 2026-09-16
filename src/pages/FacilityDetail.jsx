import { Accessibility, ArrowLeft, Bookmark, BookmarkCheck, Building2, CalendarClock, Clock3, ConciergeBell, Construction, MapPin, MessageCircle, Navigation, UserRound, Users } from "lucide-react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import FacilityPhoto from "@/components/campus/FacilityPhoto"
import { button, card, EmptyState, focusRing, StatusBadge } from "@/components/campus/ui"
import FacilityStatusBadge from "@/components/facilities/FacilityStatusBadge"
import IndoorMap2D from "@/components/map/IndoorMap2D"
import { FACILITY_DATA_NOTICE, facilities, getFacilityById } from "@/data/facilities"
import { getFloorById } from "@/data/floors"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { isLocationSaved, toggleSavedLocation } from "@/lib/savedLocations"
import { getFacilityNavigationHref } from "@/services/dashboardService"
import { cn } from "@/lib/utils"

const VERIFICATION_BADGE = {
  VERIFIED: { label: "Verified", className: "border border-green-700 bg-green-700 text-white" },
  SOURCE_ALIGNED: { label: "Source-aligned", className: "border border-amber-300 bg-amber-50 text-amber-800" },
  ESTIMATED: { label: "Estimated", className: "border border-amber-300 bg-amber-50 text-amber-800" },
  PENDING_VERIFICATION: { label: "Pending verification", className: "border border-dashed border-[#86868B] bg-white text-[#6E6E73]" },
}

function InfoRow({ icon: Icon, label, value, verification = "PENDING_VERIFICATION" }) {
  const badge = VERIFICATION_BADGE[verification] || VERIFICATION_BADGE.PENDING_VERIFICATION
  return (
    <div className="flex items-start gap-3 border-b border-[#F0F0F2] py-3 last:border-0">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5E5E7] bg-[#FAFAFA]">
        <Icon className="h-[18px] w-[18px] text-[#48484A]" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#86868B]">{label}</p>
        <p className="mt-1 text-sm font-medium text-[#1D1D1F]">{value}</p>
      </div>
      <span className={`mt-1 shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${badge.className}`}>{badge.label}</span>
    </div>
  )
}

export default function FacilityDetail() {
  const { id } = useParams()
  const facility = getFacilityById(id)
  const floor = facility ? getFloorById(facility.floorId) : null
  const navigationHref = facility ? getFacilityNavigationHref(facility.id) : null
  const [saved, setSaved] = useState(() => (facility ? isLocationSaved(facility.id) : false))

  if (!facility) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#F5F5F7] px-6 py-24">
        <EmptyState
          icon={Building2}
          title="Facility not found"
          message="This facility is not part of the verified campus directory."
          action={<Link to="/facilities" className={button.smallSecondary}><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to directory</Link>}
          className="mx-auto max-w-xl"
        />
      </div>
    )
  }

  const underConstruction = facility.status === "UNDER_CONSTRUCTION"
  const category = getFacilityCategory(facility)
  const advisories = []
  if (underConstruction) advisories.push({ id: "construction", title: "Under construction", message: "This area is marked under construction in the source plan and is not navigable." })
  else if (facility.navigable === false) advisories.push({ id: "not-navigable", title: "Entrance pending verification", message: "This facility is source-confirmed, but its usable entrance is pending verification, so indoor routing is not available yet." })

  const onToggleSave = () => setSaved(toggleSavedLocation(facility.id))

  return (
    <div className="app-page bg-[#F5F5F7]">
      <div className="app-container">
        <Link to="/facilities" className={`inline-flex items-center gap-2 rounded-md text-sm font-medium text-[#6E6E73] transition-colors hover:text-[#1D1D1F] ${focusRing}`}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All facilities
        </Link>

        <article className="ink-blueprint mt-4 overflow-hidden">
          <div className="border-b border-[#E5E5E7] lg:grid lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
          <FacilityPhoto facility={facility} variant="banner" showHint className="border-b border-[#E5E5E7] lg:h-full lg:max-h-none lg:min-h-0 lg:aspect-auto lg:border-b-0 lg:border-r" />
          <div className="p-6 sm:p-7">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {underConstruction || facility.status === "PENDING_VERIFICATION" ? <StatusBadge status={facility.status} /> : <FacilityStatusBadge />}
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]", category.chip)}>
                    <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", category.dot)} /> {facility.kind}
                  </span>
                </div>
                <h1 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.94] tracking-[0.01em] sm:text-5xl">{facility.name}</h1>
                <p className="mt-3 flex items-center gap-2 text-base text-[#6E6E73] sm:text-lg">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" /> {floor?.name || facility.floorId}
                  <span aria-hidden="true" className="text-[#D2D2D7]">·</span> {category.label}
                </p>
              </div>
              <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl", category.tile)}>
                <Building2 className="h-7 w-7" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {navigationHref && (
                <Link to={navigationHref} className={button.primary}>
                  <Navigation className="h-4 w-4" aria-hidden="true" /> Navigate
                </Link>
              )}
              <Link to={`/clara?about=${encodeURIComponent(facility.name)}`} className={button.secondary}>
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask CLARA
              </Link>
              <button type="button" onClick={onToggleSave} aria-pressed={saved} className={cn(saved ? button.outline : button.secondary)}>
                {saved ? <BookmarkCheck className="h-4 w-4" aria-hidden="true" /> : <Bookmark className="h-4 w-4" aria-hidden="true" />}
                {saved ? "Saved" : "Save Location"}
              </button>
            </div>
          </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <section aria-label="Facility information" className="p-5 sm:p-7">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">Location &amp; availability</h2>
              <div className="mt-2">
                <InfoRow icon={MapPin} label="Floor assignment" value={floor?.name || facility.floorId} verification={facility.verification.floor} />
                <InfoRow icon={Navigation} label="Exact room position" value={facility.mapRoomId ? "Source-aligned map estimate" : "Not mapped"} verification={facility.verification.exactLocation} />
                <InfoRow icon={Building2} label="Room number" value={facility.roomNumber || "Not provided"} verification={facility.verification.roomNumber} />
                <InfoRow icon={Clock3} label="Operating hours" value={facility.operatingHours || "Not provided"} verification={facility.verification.operatingHours} />
                <InfoRow icon={ConciergeBell} label="Services" value="Not provided" />
                <InfoRow icon={Users} label="Department" value="Not provided" />
                <InfoRow icon={UserRound} label="Personnel" value="Not provided" verification={facility.verification.personnelSchedule} />
                <InfoRow icon={CalendarClock} label="Schedule" value={facility.personnelSchedule || "Not provided"} verification={facility.verification.personnelSchedule} />
                <InfoRow icon={Accessibility} label="Accessibility" value={facility.accessibility || "Not provided"} />
              </div>
            </section>

            <aside className="border-t border-[#E5E5E7] p-5 sm:p-7 lg:border-l lg:border-t-0">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">Map preview</h2>
              {floor?.map ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#E5E5E7]">
                  <div aria-hidden="true" className="pointer-events-none [&_svg]:min-w-0 [&_svg]:rounded-none [&_svg]:border-0">
                    <IndoorMap2D
                      floor={floor}
                      facilities={facilities}
                      nodes={[]}
                      edges={[]}
                      route={null}
                      startFacilityId={facility.id}
                      destinationFacilityId={null}
                      navigationStatus="idle"
                      emergencyMode
                    />
                  </div>
                  {navigationHref && (
                    <div className="border-t border-[#E5E5E7] bg-[#FAFAFA] p-3 text-center">
                      <Link to={navigationHref} className={`inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-[#1D1D1F] ${focusRing}`}>
                        Open in Navigate <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState icon={MapPin} title="Floor map pending" message="A verified floor plan is required before a preview can be shown here." className="mt-4 min-h-44" />
              )}

              <h2 className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">Advisories</h2>
              {advisories.length ? (
                <div className="mt-4 space-y-3">
                  {advisories.map((advisory) => (
                    <div key={advisory.id} className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-amber-900"><Construction className="h-4 w-4" aria-hidden="true" /> {advisory.title}</p>
                      <p className="mt-1.5 text-xs leading-relaxed text-amber-900/80">{advisory.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl border border-dashed border-[#C7C7CC] bg-[#FAFAFA] p-4 text-xs leading-relaxed text-[#6E6E73]">No advisories recorded for this facility.</p>
              )}
            </aside>
          </div>

          <div className={`${card} m-5 rounded-2xl border-dashed border-[#C7C7CC] bg-[#FAFAFA] p-4 sm:mx-7 sm:mb-6`}>
            <p className="text-xs leading-relaxed text-[#6E6E73]">{FACILITY_DATA_NOTICE}</p>
          </div>
        </article>
      </div>
    </div>
  )
}
