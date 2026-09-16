import { Activity, BellRing, BookOpen, Building2, CalendarDays, Database, ShieldCheck } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { AdvisoriesSection, AnnouncementsSection, ClassesSection, EventsSection, NavigationNoticesSection, OfficesSection, PersonnelSection, PriorityAlertsSection } from "@/components/dashboard/DashboardSections"
import { BlueprintPanel, focusRing, InkKicker } from "@/components/campus/ui"
import { getDashboardSnapshot, loadDashboardSnapshot, subscribeToDashboard } from "@/services/dashboardService"
import { formatCampusDate, formatCampusTime } from "@/lib/campusTime"
import { useAuth } from "@/contexts/AuthContext"

const summaryItems = [
  { key: "priorityAlerts", label: "Priority Alerts", icon: BellRing, tile: "bg-red-50 text-red-700" },
  { key: "todaysClasses", label: "Today's Classes", icon: BookOpen, tile: "bg-blue-50 text-blue-700" },
  { key: "availableOffices", label: "Available Offices", icon: Building2, tile: "bg-green-50 text-green-700" },
  { key: "upcomingEvents", label: "Upcoming Events", icon: CalendarDays, tile: "bg-gold-50 text-gold-700" },
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

export default function Dashboard() {
  const auth = useAuth()
  const [searchParams] = useSearchParams()
  const demo = searchParams.get("demo") === "1"
  const verify = searchParams.get("verify") === "1"
  const [now, setNow] = useState(() => new Date())

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

  return (
    <div className="app-page bg-[#F5F5F7]">
      <div className="app-container">
        <BlueprintPanel as="header" className="p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <InkKicker>Central information view</InkKicker>
              <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.94] tracking-[0.01em] text-[#1D1F20] sm:text-5xl">CampusNav Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6E6E73]">Campus information, schedules, availability, and official updates in one place.</p>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:w-[450px]">
              <div className="rounded-2xl bg-[#F5F5F7] p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#86868B]">Campus date</p>
                <p className="mt-2 text-sm font-semibold">{formatCampusDate(now)}</p>
                <p className="mt-1 font-mono text-xs text-[#6E6E73]">{formatCampusTime(now)} · Asia/Manila</p>
              </div>
              <div role="status" className="rounded-2xl border-[1.5px] border-brand-700 bg-brand-50/50 p-3.5">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" aria-hidden="true" />
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">Data status</p>
                </div>
                <p className="mt-2 text-sm font-semibold">{data.status.label}{data.status.realtime ? " · Realtime" : ""}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#6E6E73]">{data.status.notice}</p>
              </div>
            </div>
          </div>
          <nav aria-label="Dashboard sections" className="mt-4 flex gap-1.5 overflow-x-auto border-t border-[#E5E5E7] pb-1 pt-3.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sectionNav.map((section) => (
              <a key={section.id} href={`#${section.id}`} className={`shrink-0 rounded-full border border-[#E5E5E7] bg-white px-3 py-1.5 text-[11px] font-medium text-[#6E6E73] transition-colors duration-200 hover:border-[#86868B] hover:text-[#1D1D1F] ${focusRing}`}>
                {section.label}
              </a>
            ))}
          </nav>
        </BlueprintPanel>

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
          <div role="status" className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-[#86868B] bg-white p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em]">Developer verification mode</p>
              <p className="mt-1 text-sm text-[#6E6E73]">Source IDs, verification states, data status, and lifecycle times are visible.</p>
            </div>
          </div>
        )}

        <section aria-labelledby="dashboard-summary-title" className="mt-5">
          <h2 id="dashboard-summary-title" className="sr-only">Dashboard summary</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {summaryItems.map(({ key, label, icon: Icon, tile }) => {
              const value = data.summary[key]
              return (
                <article key={key} className="rounded-3xl border border-[#E5E5E7] bg-white p-4 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tile}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${value == null ? "border border-dashed border-[#C7C7CC] text-[#86868B]" : "bg-green-50 text-green-700"}`}>
                      {value == null ? "Unavailable" : "Available"}
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight" aria-label={`${label}: ${value == null ? "Unavailable" : value}`}>{value ?? "—"}</p>
                  <p className="mt-1 text-xs font-medium text-[#6E6E73]">{label}</p>
                </article>
              )
            })}
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
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
    </div>
  )
}
