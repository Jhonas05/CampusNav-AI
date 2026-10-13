import { ArrowRight, Building2, CalendarDays, CircleCheck, QrCode, ShieldAlert, TriangleAlert } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { card, focusRing } from "@/components/campus/ui"
import SmartCampusStrip from "@/components/home/SmartCampusStrip"
import CampusMapPreview from "@/components/map/CampusMapPreview"
import DestinationSearch from "@/components/map/DestinationSearch"
import { facilities, getFacilityById } from "@/data/facilities"
import { getFacilityEntranceNodes } from "@/data/mapNodes"
import { formatCampusShortTime } from "@/lib/campusTime"
import { getNavigateHref } from "@/lib/mapLinks"
import { cn } from "@/lib/utils"
import { getDashboardSnapshot } from "@/services/dashboardService"

const NAVIGABLE_FACILITIES = facilities.filter((facility) => facility.navigable !== false && getFacilityEntranceNodes(facility.id, facility.floorId).length > 0)

// Fixed shortcuts to commonly needed offices. CampusNav keeps no navigation
// history, so these are not "recent" or "popular by usage".
const SHORTCUTS = [
  { facilityId: "registrar-office", label: "Registrar" },
  { facilityId: "library", label: "Library" },
  { facilityId: "health-dental-clinic", label: "Clinic" },
  { facilityId: "guidance-office", label: "Guidance" },
  { facilityId: "osas", label: "OSAS" },
]

const QUICK_ACCESS = [
  { label: "Scan QR", to: "/map?scan=1", icon: QrCode },
  { label: "Facilities", to: "/facilities", icon: Building2 },
  { label: "Events", to: "/events", icon: CalendarDays },
  { label: "Emergency", to: "/emergency", icon: ShieldAlert, emphasis: true },
]

const TODAY_LIMIT = 4
const plural = (count, noun, many = `${noun}s`) => `${count} ${count === 1 ? noun : many}`
const sectionTitle = "text-[17px] font-semibold tracking-[-0.01em] text-ink"
const viewAll = cn("inline-flex min-h-11 items-center gap-1 rounded-md text-[13px] font-medium text-ink-soft hover:text-ink", focusRing)

/**
 * One compact module instead of separate alert, advisory, event, and notice
 * cards. A published priority alert replaces the summary. It reports only
 * what is published; it never states an official "normal operations" or
 * suspension status.
 */
function CampusStatus({ snapshot, className }) {
  const alert = snapshot.alerts[0] || null
  const eventCount = snapshot.events.today.length
  const facts = [
    snapshot.advisories.length > 0 && plural(snapshot.advisories.length, "facility advisory", "facility advisories"),
    snapshot.navigationNotices.length > 0 && plural(snapshot.navigationNotices.length, "route notice"),
    eventCount > 0 && `${plural(eventCount, "event")} today`,
  ].filter(Boolean)

  return (
    <section aria-labelledby="home-status-title" className={cn(card, "px-4 pb-4 pt-2", alert && "border-[1.5px] border-ink", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="home-status-title" className={sectionTitle}>Campus status</h2>
        <Link to="/dashboard" aria-label="Campus status details" className={viewAll}>Details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
      </div>
      {alert ? (
        <Link to={alert.emergencyHref || alert.navigationHref || alert.facilityHref || "/dashboard"} className={cn("flex items-start gap-3 rounded-xl", focusRing)}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-on-ink"><TriangleAlert className="h-[18px] w-[18px]" aria-hidden="true" /></span>
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold leading-snug text-ink">{alert.title}</span>
            {alert.message && <span className="mt-0.5 line-clamp-2 block text-sm text-ink-soft">{alert.message}</span>}
          </span>
        </Link>
      ) : (
        <p className="flex items-center gap-2 text-[15px] font-medium text-ink">
          <CircleCheck className="h-[18px] w-[18px] shrink-0 text-ink-soft" aria-hidden="true" /> No active alerts
        </p>
      )}
      {facts.length > 0 && <p className="mt-1.5 text-sm text-ink-soft">{facts.join(" · ")}</p>}
    </section>
  )
}

/** The few things worth knowing today; everything else is on its own page. */
function Today({ snapshot, className }) {
  const items = [
    ...snapshot.events.today.map((event) => ({ id: event.id, kind: "Event", title: event.title, detail: [formatCampusShortTime(event.startAt), event.location].filter(Boolean).join(" · "), to: "/events" })),
    ...snapshot.advisories.map((record) => ({ id: record.id, kind: "Facility", title: record.title, detail: record.message, to: record.facilityHref || "/dashboard" })),
    ...snapshot.navigationNotices.map((record) => ({ id: record.id, kind: "Route", title: record.title, detail: record.message, to: record.navigationHref || "/map" })),
  ].slice(0, TODAY_LIMIT)

  return (
    <section aria-labelledby="home-today-title" className={className}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="home-today-title" className={sectionTitle}>Today</h2>
        <Link to="/dashboard" aria-label="View all of today's campus updates" className={viewAll}>View all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
      </div>
      {items.length === 0 ? (
        <p role="status" className="text-sm text-ink-soft">No events or notices today.</p>
      ) : (
        <ul className={cn(card, "divide-y divide-line")}>
          {items.map((item) => (
            <li key={item.id}>
              <Link to={item.to} className={cn("flex min-h-14 items-center gap-3 rounded-[18px] px-4 py-2.5 hover:bg-subtle", focusRing)}>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium text-ink-faint">{item.kind}</span>
                  <span className="block truncate text-[15px] font-semibold text-ink">{item.title}</span>
                  {item.detail && <span className="block truncate text-sm text-ink-soft">{item.detail}</span>}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-ghost" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/**
 * Home answers "what can I do right now?": one destination search, the real
 * campus map, one status module, four quick actions, and today's few items.
 * Everything else is one tap away (bottom navigation, More, or CLARA).
 *
 * One column on phones and tablets, in that order. From 1024px the map takes
 * the wide right column beside the same blocks; the trailing flexible row
 * absorbs the map's extra height so the left blocks stay together.
 */
export default function Home() {
  const navigate = useNavigate()
  const [destinationQuery, setDestinationQuery] = useState("")
  const snapshot = useMemo(() => getDashboardSnapshot({ now: new Date() }), [])
  const shortcuts = SHORTCUTS.filter((item) => getFacilityById(item.facilityId))

  return (
    <div className="app-page bg-canvas">
      <div className="app-container grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:grid-rows-[auto_auto_auto_auto_1fr] lg:gap-x-8 xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
        <header className="min-w-0 lg:col-start-1 lg:row-start-1">
          <h1 className="font-display text-[2.125rem] font-semibold leading-tight tracking-[-0.025em] text-ink max-md:sr-only">CampusNav</h1>
          <p className="mb-5 mt-1 text-[15px] text-ink-soft max-md:sr-only">Find your way around campus.</p>
          <DestinationSearch
            facilities={NAVIGABLE_FACILITIES}
            query={destinationQuery}
            onQueryChange={setDestinationQuery}
            onSelect={(facility) => navigate(getNavigateHref({ facilityId: facility.id }))}
            label="Where do you want to go?"
            placeholder="Search rooms, offices, labs…"
            prominent
          />
          <ul aria-label="Go to" className="mt-3 flex gap-2 pb-1 max-lg:-mx-[var(--app-page-gutter)] max-lg:overflow-x-auto max-lg:px-[var(--app-page-gutter)] max-lg:[-ms-overflow-style:none] max-lg:[scrollbar-width:none] lg:flex-wrap max-lg:[&::-webkit-scrollbar]:hidden">
            {shortcuts.map(({ facilityId, label }) => (
              <li key={facilityId} className="shrink-0">
                <Link to={getNavigateHref({ facilityId })} aria-label={`Navigate to ${label}`} className={cn("inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-4 text-sm font-medium text-ink hover:border-ink-faint hover:bg-subtle", focusRing)}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </header>

        <div className="min-w-0 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-5 lg:row-start-1 lg:self-start">
          <section aria-label="Campus at a glance">
            <CampusMapPreview
              compact
              preferredView="3D"
              label="St. Clare College campus map"
              heightClass="h-[clamp(13rem,34dvh,20rem)] md:h-[24rem] lg:h-[clamp(24rem,calc(100dvh-8rem),48rem)]"
            />
          </section>
        </div>

        <CampusStatus snapshot={snapshot} className="lg:col-start-1 lg:row-start-2" />

        <section aria-labelledby="home-quick-title" className="lg:col-start-1 lg:row-start-3">
          <h2 id="home-quick-title" className={sectionTitle}>Quick access</h2>
          <ul className="mt-2 grid grid-cols-2 gap-2.5">
            {QUICK_ACCESS.map(({ label, to, icon: Icon, emphasis }) => (
              <li key={label}>
                <Link to={to} className={cn(card, "interactive-card flex min-h-14 items-center gap-3 px-3.5 text-[15px] font-semibold text-ink", emphasis && "border-[1.5px] border-ink", focusRing)}>
                  <span className={cn("card-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", emphasis ? "bg-ink text-on-ink" : "bg-fill text-ink")}>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <Today snapshot={snapshot} className="lg:col-start-1 lg:row-start-4" />

        {/* Desktop only: factual coverage, below everything a visitor acts on. */}
        <div className="hidden lg:col-start-1 lg:row-start-5 lg:block lg:self-start">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-faint">What CampusNav covers</p>
          <SmartCampusStrip className="2xl:grid-cols-2" />
        </div>
      </div>
    </div>
  )
}
