import { ArrowRight, BellRing, BookOpen, Building2, CalendarDays, Navigation, QrCode } from "lucide-react"
import { Link } from "react-router-dom"
import CampusMapPreview from "@/components/map/CampusMapPreview"
import AnimatedCounter from "@/components/motion/AnimatedCounter"
import CampusRouteMotif from "@/components/motion/CampusRouteMotif"
import { facilities, getFacilityById } from "@/data/facilities"
import { floors } from "@/data/floors"
import { qrCheckpoints } from "@/data/qrCheckpoints"
import { getFacilityNavigationHref } from "@/services/dashboardService"

const ring = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
const mappedFacilityCount = facilities.filter((facility) => facility.kind !== "Construction").length

/**
 * Campus Overview: the real CampusNav map (the same canonical floor maps,
 * renderer, and 3D model as Navigate) with the campus counts beside it.
 * Counts come from the verified facility list and the current dashboard
 * snapshot; anything without a connected source shows "—". This is not a
 * live activity monitor.
 * @param {Record<string, any>} props
 */
export function CampusOverview(props) {
  const { summary } = props
  const counts = [
    { label: "Events", value: summary.upcomingEvents, to: "/events", icon: CalendarDays },
    { label: "Alerts", value: summary.priorityAlerts, to: "#priority-alerts", icon: BellRing },
    { label: "Schedules", value: summary.todaysClasses, to: "#todays-classes", icon: BookOpen },
    { label: "Floors", value: floors.length, to: "/map", icon: Navigation },
    { label: "Facilities", value: mappedFacilityCount, to: "/facilities", icon: Building2 },
    { label: "QR checkpoints", value: qrCheckpoints.length, to: "/map", icon: QrCode },
  ]

  return (
    <section aria-labelledby="campus-overview-title" className="ink-blueprint flex flex-col p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="ink-kicker">Campus map</p>
          <h2 id="campus-overview-title" className="mt-1 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">Campus Overview</h2>
          <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-ink-soft">The same source-aligned GF–5F map used by Navigate. Counts come from connected campus data and the verified facility list; unavailable items show “—”. This is not a live activity monitor.</p>
        </div>
        <Link to="/map" className={`group inline-flex min-h-9 items-center gap-1.5 rounded-md text-xs font-semibold text-ink hover:text-ink-mid ${ring}`}>
          Open Navigate <ArrowRight className="nav-icon h-3.5 w-3.5" data-motion="forward" aria-hidden="true" />
        </Link>
      </div>

      <CampusMapPreview className="mt-4 lg:flex lg:flex-1 lg:flex-col" preferredView="2D" label="Campus map overview" heightClass="h-[clamp(22rem,52vh,32rem)] lg:h-auto lg:min-h-[22rem] lg:flex-1" />

      <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {counts.map(({ label, value, to, icon: Icon }) => {
          const accessible = `${label}: ${value == null ? "unavailable" : value}`
          const content = (
            <>
              <Icon className="h-4 w-4 text-ink-soft" strokeWidth={1.9} aria-hidden="true" />
              <span className="mt-1 block text-[15px] font-semibold leading-tight tabular-nums text-ink"><AnimatedCounter value={value} /></span>
              <span className="block text-[10px] font-medium leading-tight text-ink-soft">{label}</span>
            </>
          )
          const className = `interactive-card flex h-full flex-col items-start rounded-xl border border-line bg-surface px-2.5 py-2 ${ring}`
          return (
            <li key={label}>
              {to.startsWith("#")
                ? <a href={to} aria-label={accessible} className={className}>{content}</a>
                : <Link to={to} aria-label={accessible} className={className}>{content}</Link>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

const SHORTCUT_IDS = ["registrar-office", "library", "guidance-office", "computer-laboratory", "health-dental-clinic"]

/**
 * Navigation shortcuts to frequently used destinations. CampusNav does not
 * store navigation history, so these are fixed shortcuts, not "recent routes".
 */
export function NavigationShortcuts() {
  const items = SHORTCUT_IDS.map((id) => getFacilityById(id)).filter(Boolean).map((facility) => ({ facility, href: getFacilityNavigationHref(facility.id) })).filter((item) => item.href)
  return (
    <section aria-labelledby="navigation-shortcuts-title" className="ink-blueprint flex flex-col p-4 sm:p-5">
      <p className="ink-kicker">Navigate</p>
      <h2 id="navigation-shortcuts-title" className="mt-1 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">Navigation Shortcuts</h2>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">Open Navigate with a destination already selected. These are fixed shortcuts; CampusNav does not record navigation history.</p>
      <ul className="mt-4 flex-1 space-y-1.5">
        {items.map(({ facility, href }) => (
          <li key={facility.id}>
            <Link to={href} className={`group flex min-h-12 items-center gap-3 rounded-xl border border-line px-3 py-2 transition-colors duration-150 hover:border-ink-faint hover:bg-fill ${ring}`}>
              <span className="flex h-7 min-w-9 items-center justify-center rounded-lg bg-fill px-1.5 text-[11px] font-semibold text-ink group-hover:bg-surface">{facility.floorId}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{facility.name}</span>
              <CampusRouteMotif className="max-sm:hidden" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
