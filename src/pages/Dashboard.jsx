import { Activity, BellRing, BookOpen, Building2, CalendarDays, Compass, Database, FlaskConical, HeartPulse, Landmark, Monitor, Navigation, QrCode, Search, ShieldCheck, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { AdvisoriesSection, AnnouncementsSection, ClassesSection, EventsSection, NavigationNoticesSection, OfficesSection, PersonnelSection, PriorityAlertsSection } from "@/components/dashboard/DashboardSections"
import GlobalSearch from "@/components/layout/GlobalSearch"
import QuickAccessCard from "@/components/home/QuickAccessCard"
import { focusRing } from "@/components/campus/ui"
import { getFacilityById } from "@/data/facilities"
import { getFloorById } from "@/data/floors"
import { getDashboardSnapshot, loadDashboardSnapshot, subscribeToDashboard } from "@/services/dashboardService"
import { formatCampusDate, formatCampusTime, getCampusClockParts } from "@/lib/campusTime"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

/**
 * Summary tiles. Availability is signalled by icon plus a filled/dashed badge
 * rather than color, so the monochrome palette loses no meaning.
 */
const summaryItems = [
  { key: "priorityAlerts", label: "Priority Alerts", icon: BellRing, href: "#priority-alerts" },
  { key: "todaysClasses", label: "Today's Classes", icon: BookOpen, href: "#todays-classes" },
  { key: "availableOffices", label: "Available Offices", icon: Building2, href: "#office-availability" },
  { key: "upcomingEvents", label: "Upcoming Events", icon: CalendarDays, href: "#events-calendar" },
]

/**
 * Quick actions. Every entry opens an existing CampusNav surface — Scan QR
 * hands off to the Navigate page's real checkpoint scanner via `?scan=1`.
 */
const quickActions = [
  { label: "Navigate Campus", detail: "Indoor routing, GF–5F", to: "/map", icon: Navigation, primary: true },
  { label: "Find Facility", detail: "Campus directory", to: "/facilities", icon: Building2 },
  { label: "Find Personnel", detail: "Schedule-based availability", to: "/dashboard#personnel-availability", icon: Users },
  { label: "Scan QR", detail: "Confirm your location", to: "/map?scan=1", icon: QrCode },
]

/** Frequently visited destinations, resolved from the verified facility list. */
const QUICK_ACCESS = [
  { facilityId: "registrar-office", label: "Registrar", icon: Landmark },
  { facilityId: "library", label: "Library", icon: BookOpen },
  { facilityId: "guidance-office", label: "Guidance Office", icon: Compass },
  { facilityId: "computer-laboratory", label: "Computer Laboratory", icon: Monitor },
  { facilityId: "virtual-laboratory", label: "Virtual Laboratory", icon: FlaskConical },
  { facilityId: "health-dental-clinic", label: "Clinic", icon: HeartPulse },
]

const sectionNav = [
  { id: "priority-alerts", label: "Alerts" },
  { id: "todays-classes", label: "Classes" },
  { id: "office-availability", label: "Offices" },
  { id: "personnel-availability", label: "Personnel" },
  { id: "facility-advisories", label: "Advisories" },
  { id: "events-calendar", label: "Events" },
  { id: "general-announcements", label: "Announcements" },
  { id: "navigation-notices", label: "Navigation" },
]

const greetingFor = (now) => {
  const { hour } = getCampusClockParts(now)
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export default function Dashboard() {
  const auth = useAuth()
  const [searchParams] = useSearchParams()
  const demo = searchParams.get("demo") === "1"
  const verify = searchParams.get("verify") === "1"
  const [now, setNow] = useState(() => new Date())
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const localData = useMemo(() => {
    return getDashboardSnapshot({ demo, now })
  }, [demo, now])
  const [data, setData] = useState(/** @type {any} */ (localData))

  useEffect(() => {
    let active = true
    setData(localData)
    loadDashboardSnapshot({ demo, now }).then((snapshot) => {
      if (active) setData(snapshot)
    })
    return () => { active = false }
  }, [demo, localData, now])

  useEffect(() => {
    if (demo) return undefined
    let active = true
    let unsubscribe = () => {}
    const refresh = async () => {
      const snapshot = await loadDashboardSnapshot({ demo: false, now: new Date() })
      if (active) setData(snapshot)
    }
    const updateRealtimeStatus = (status) => {
      if (!active) return
      setData((current) => ({
        ...current,
        status: {
          ...current.status,
          realtime: status === "SUBSCRIBED",
          notice: status === "SUBSCRIBED"
            ? "Published campus updates are connected with live refresh."
            : current.status.notice,
        },
      }))
    }
    subscribeToDashboard(refresh, updateRealtimeStatus).then((cleanup) => {
      if (active) unsubscribe = cleanup
      else cleanup()
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [auth.user?.id, demo])

  const quickAccessItems = useMemo(
    () => QUICK_ACCESS
      .map((item) => ({ ...item, facility: getFacilityById(item.facilityId) }))
      .filter((item) => item.facility),
    []
  )

  const displayName = auth.isAuthenticated
    ? auth.profile?.display_name?.split(/\s+/)[0] || null
    : null

  return (
    <div className="app-page bg-[#F5F5F7]">
      <div className="app-container">
        {/* Welcome + campus context */}
        <header className="rounded-2xl border border-[#D2D2D7] bg-white p-5 shadow-[var(--ink-shadow-sm)] sm:p-6">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
            <div className="min-w-0">
              <p className="ink-kicker">St. Clare College of Caloocan</p>
              <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.94] tracking-[0.01em] text-[#1D1D1F] sm:text-5xl">
                {greetingFor(now)}{displayName ? `, ${displayName}` : ""}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6E6E73]">
                Welcome to CampusNav — campus information, schedules, availability, and official updates in one place.
              </p>

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "mt-5 flex w-full max-w-xl items-center gap-3 rounded-full border border-[#D2D2D7] bg-[#F5F5F7] px-4 py-3 text-left transition-colors duration-200 hover:border-[#8E8E93] hover:bg-white motion-reduce:transition-none",
                  focusRing
                )}
              >
                <Search className="h-[18px] w-[18px] shrink-0 text-[#6E6E73]" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm text-[#6E6E73]">
                  Search facilities, rooms, offices, services, and events
                </span>
                <kbd className="hidden shrink-0 rounded border border-[#D2D2D7] bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#6E6E73] sm:block">
                  ⌘K
                </kbd>
              </button>
            </div>

            <div className="grid shrink-0 gap-2.5 sm:grid-cols-2 xl:w-[26rem]">
              <div className="rounded-2xl border border-[#E3E3E6] bg-[#FAFAFA] p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8E8E93]">Campus date</p>
                <p className="mt-2 text-sm font-semibold text-[#1D1D1F]">{formatCampusDate(now)}</p>
                <p className="mt-1 font-mono text-xs text-[#6E6E73]">{formatCampusTime(now)} · Asia/Manila</p>
              </div>
              <div role="status" className="rounded-2xl border-2 border-[#1D1D1F] bg-white p-3.5">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-[#1D1D1F]" aria-hidden="true" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6E6E73]">Data status</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-[#1D1D1F]">{data.status.label}{data.status.realtime ? " · Realtime" : ""}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#6E6E73]">{data.status.notice}</p>
              </div>
            </div>
          </div>

          <nav aria-label="Dashboard sections" className="mt-5 flex gap-1.5 overflow-x-auto border-t border-[#E3E3E6] pb-1 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sectionNav.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={cn(
                  "shrink-0 rounded-full border border-[#D2D2D7] bg-white px-3.5 py-2 text-[11px] font-medium text-[#6E6E73] transition-colors duration-200 hover:border-[#1D1D1F] hover:text-[#1D1D1F]",
                  focusRing
                )}
              >
                {section.label}
              </a>
            ))}
          </nav>
        </header>

        {/* Quick actions */}
        <section aria-labelledby="dashboard-quick-actions" className="mt-4">
          <h2 id="dashboard-quick-actions" className="sr-only">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map(({ label, detail, to, icon: Icon, primary }) => (
              <Link
                key={label}
                to={to}
                className={cn(
                  "group flex min-h-[84px] items-center gap-3.5 rounded-2xl border p-4 transition-colors duration-200 motion-reduce:transition-none",
                  primary
                    ? "border-[#1D1D1F] bg-[#1D1D1F] text-white hover:bg-black"
                    : "border-[#D2D2D7] bg-white text-[#1D1D1F] hover:border-[#8E8E93]",
                  focusRing
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none",
                    primary ? "border-white/25 bg-white/10 text-white" : "border-[#E3E3E6] bg-[#FAFAFA] text-[#1D1D1F]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold tracking-tight">{label}</span>
                  <span className={cn("mt-0.5 block text-xs", primary ? "text-white/65" : "text-[#6E6E73]")}>{detail}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {demo && (
          <div role="status" className="mt-4 flex items-start gap-3 rounded-2xl border-2 border-[#1D1D1F] bg-[#1D1D1F] p-4 text-white">
            <Activity className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em]">Demo data</p>
              <p className="mt-1 text-sm text-white/75">Sample data — not official school information.</p>
            </div>
          </div>
        )}
        {verify && (
          <div role="status" className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-[#8E8E93] bg-white p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em]">Developer verification mode</p>
              <p className="mt-1 text-sm text-[#6E6E73]">Source IDs, verification states, data status, and lifecycle times are visible.</p>
            </div>
          </div>
        )}

        {/* Summary */}
        <section aria-labelledby="dashboard-summary-title" className="mt-4">
          <h2 id="dashboard-summary-title" className="sr-only">Dashboard summary</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {summaryItems.map(({ key, label, icon: Icon, href }) => {
              const value = data.summary[key]
              const unavailable = value == null
              return (
                <a
                  key={key}
                  href={href}
                  className={cn(
                    "rounded-2xl border bg-white p-4 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#8E8E93] motion-reduce:transform-none motion-reduce:transition-none sm:p-5",
                    unavailable ? "border-dashed border-[#C7C7CC]" : "border-[#D2D2D7]",
                    focusRing
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E3E3E6] bg-[#F5F5F7] text-[#1D1D1F]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                        unavailable
                          ? "border border-dashed border-[#C7C7CC] text-[#8E8E93]"
                          : "bg-[#1D1D1F] text-white"
                      )}
                    >
                      {unavailable ? "Unavailable" : "Available"}
                    </span>
                  </div>
                  <p
                    className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-[#1D1D1F]"
                    aria-label={`${label}: ${unavailable ? "Unavailable" : value}`}
                  >
                    {value ?? "—"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#6E6E73]">{label}</p>
                </a>
              )
            })}
          </div>
        </section>

        {/* Quick facility access */}
        <section aria-labelledby="dashboard-quick-access" className="mt-4 rounded-2xl border border-[#D2D2D7] bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-2.5">
            <div>
              <p className="ink-kicker">Quick access</p>
              <h2 id="dashboard-quick-access" className="mt-1 font-display text-2xl font-bold uppercase tracking-[0.03em] text-[#1D1D1F]">
                Frequently visited
              </h2>
            </div>
            <Link to="/facilities" className={cn("rounded-md text-sm font-medium text-[#1D1D1F] underline-offset-4 hover:underline", focusRing)}>
              View all facilities
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {quickAccessItems.map(({ facilityId, label, icon, facility }) => (
              <QuickAccessCard
                key={facilityId}
                to={`/facilities/${facilityId}`}
                name={label}
                detail={getFloorById(facility.floorId)?.name || facility.floorId}
                icon={icon}
                tileClass={getFacilityCategory(facility).tile}
              />
            ))}
          </div>
        </section>

        {/* Centralized campus information */}
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            <PriorityAlertsSection records={data.alerts} verify={verify} />
            <ClassesSection records={data.classes} verify={verify} />
            <OfficesSection records={data.offices} verify={verify} />
            <PersonnelSection records={data.personnel} verify={verify} />
          </div>
          <div className="space-y-4">
            <AdvisoriesSection records={data.advisories} verify={verify} />
            <EventsSection events={data.events} verify={verify} />
            <AnnouncementsSection records={data.announcements} verify={verify} />
            <NavigationNoticesSection records={data.navigationNotices} verify={verify} />
          </div>
        </div>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
