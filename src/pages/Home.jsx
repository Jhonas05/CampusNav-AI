import { ArrowRight, BookOpen, CalendarDays, Compass, Database, FlaskConical, HeartPulse, Landmark, LayoutGrid, MessageCircle, Monitor, Navigation, ShieldAlert, Sparkles, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import SchoolLogo from "@/components/campus/SchoolLogo"
import { button, card, cardHover, EmptyState, focusRing, PriorityBadge, SectionHeader } from "@/components/campus/ui"
import QuickAccessCard from "@/components/home/QuickAccessCard"
import { announcements } from "@/data/announcements"
import { getFacilityById } from "@/data/facilities"
import { getFloorById } from "@/data/floors"
import { formatCampusDateTime, formatCampusShortTime } from "@/lib/campusTime"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { getDashboardSnapshot } from "@/services/dashboardService"

const QUICK_ACCESS = [
  { facilityId: "registrar-office", label: "Registrar", icon: Landmark },
  { facilityId: "library", label: "Library", icon: BookOpen },
  { facilityId: "guidance-office", label: "Guidance Office", icon: Compass },
  { facilityId: "computer-laboratory", label: "Computer Laboratory", icon: Monitor },
  { facilityId: "virtual-laboratory", label: "Virtual Laboratory", icon: FlaskConical },
  { facilityId: "health-dental-clinic", label: "Clinic", icon: HeartPulse },
  { facilityId: "osas", label: "OSAS", icon: Users },
]

const CLARA_SUGGESTIONS = ["Where is the Registrar?", "Is the Library open?", "What events are happening today?"]

const HERO_FLOORS = [
  { id: "5F", construction: true },
  { id: "4F" },
  { id: "3F", emphasized: true },
  { id: "2F" },
  { id: "GF" },
]

function CampusPreview() {
  return (
    <Link
      to="/map"
      aria-label="Open the campus map"
      className={`group relative block overflow-hidden rounded-[2rem] border border-[#E5E5E7] bg-gradient-to-b from-white to-[#F5F5F7] p-6 transition-all duration-300 hover:border-[#D2D2D7] hover:shadow-[0_28px_70px_rgba(0,0,0,0.1)] motion-reduce:transition-none sm:p-8 ${focusRing}`}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-[#D2D2D7] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#48484A]">3D Campus · GF–5F</span>
        <span className="hidden items-center gap-1.5 text-xs font-medium text-[#6E6E73] transition-colors duration-200 group-hover:text-[#1D1D1F] sm:flex">
          Open map <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>

      <svg viewBox="0 0 320 330" aria-hidden="true" className="mx-auto mt-4 block w-full max-w-[400px]">
        <defs>
          <pattern id="home-construction" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="#F5F5F7" />
            <path d="M0 0V8" stroke="#B8B8BD" strokeWidth="2" />
          </pattern>
        </defs>

        {/* stair continuity line through the floor stack */}
        <line x1="196" y1="34" x2="196" y2="286" stroke="#8BA7E5" strokeWidth="1.5" strokeDasharray="3 5" />

        {HERO_FLOORS.map((floor, index) => {
          const y = 28 + index * 58
          const plate = `M40 ${y + 30} L160 ${y} L280 ${y + 30} L160 ${y + 60} Z`
          return (
            <g key={floor.id}>
              <path d={plate} fill={floor.construction ? "url(#home-construction)" : floor.emphasized ? "#EEF2FB" : "#FFFFFF"} stroke={floor.emphasized ? "#213A92" : "#D2D2D7"} strokeWidth={floor.emphasized ? 2 : 1.25} />
              {floor.emphasized && (
                <>
                  <rect x="86" y="150" width="30" height="14" rx="2" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1" transform="skewX(-14)" />
                  <rect x="150" y="145" width="30" height="14" rx="2" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1" transform="skewX(-14)" />
                  <path d="M92 172 L128 163 L166 172 L196 165" fill="none" stroke="#1E7A45" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="92" cy="172" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="196" cy="165" r="5.5" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2.5" />
                </>
              )}
              <text x="292" y={y + 34} fontSize="12" fontWeight="700" fill={floor.emphasized ? "#213A92" : "#86868B"}>{floor.id}</text>
            </g>
          )
        })}
      </svg>

      <p className="mt-4 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-[#86868B]">Schematic preview · vertical dimensions estimated</p>
    </Link>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [claraQuery, setClaraQuery] = useState("")
  const snapshot = useMemo(() => getDashboardSnapshot({ now: new Date() }), [])
  const upcomingEvents = useMemo(() => [...snapshot.events.today, ...snapshot.events.upcoming].slice(0, 3), [snapshot])
  const navigationNotice = snapshot.navigationNotices[0] || null

  const quickAccessItems = QUICK_ACCESS
    .map((item) => ({ ...item, facility: getFacilityById(item.facilityId) }))
    .filter((item) => item.facility)

  const askClara = (event) => {
    event.preventDefault()
    navigate(`/clara${claraQuery.trim() ? `?q=${encodeURIComponent(claraQuery.trim())}` : ""}`)
  }

  return (
    <div>
      <section className="overflow-hidden border-b border-[#E5E5E7] bg-[radial-gradient(circle_at_top_right,_#DBE4F8,_#FFFFFF_55%),radial-gradient(circle_at_bottom_left,_#FBF6E8,_#FFFFFF_45%)] px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="flex items-center gap-3">
              <SchoolLogo size="lg" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-800">St. Clare College of Caloocan</p>
            </div>
            <h1 className="mt-5 text-6xl font-semibold leading-[0.96] tracking-[-0.045em] text-[#1D1D1F] sm:text-7xl lg:text-8xl">CampusNav</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#6E6E73] sm:text-xl">
              Smart Campus Navigation and Digital Campus Assistance for St. Clare College of Caloocan.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/map" className={button.primary}>
                <Navigation className="h-4 w-4" aria-hidden="true" /> Navigate Campus
              </Link>
              <Link to="/clara" className={button.secondary}>
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Ask CLARA
              </Link>
              <Link to="/dashboard" className={button.ghost}>
                <LayoutGrid className="h-4 w-4" aria-hidden="true" /> View Dashboard
              </Link>
            </div>
          </div>
          <CampusPreview />
        </div>
      </section>

      <section aria-labelledby="quick-access-title" className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Quick Access"
            title="Where do you need to go?"
            description="Frequently visited offices, laboratories, and services across the campus."
            action={<Link to="/facilities" className={`hidden items-center gap-1.5 rounded-md text-sm font-medium text-[#1D1D1F] sm:inline-flex ${focusRing}`}>View all facilities <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
          />
          <h2 id="quick-access-title" className="sr-only">Quick access</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
            <QuickAccessCard to="/emergency" name="Emergency" detail="Verified safety information" icon={ShieldAlert} emphasis />
          </div>
          <Link to="/facilities" className={`mt-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-[#1D1D1F] sm:hidden ${focusRing}`}>
            View all facilities <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section aria-label="Campus status" className="border-y border-[#E5E5E7] bg-[#F5F5F7] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Campus Status" title="Right now on campus" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className={`${card} p-6`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Navigation className="h-5 w-5" aria-hidden="true" /></span>
              <p className="mt-5 text-3xl font-semibold tracking-tight">GF–5F</p>
              <p className="mt-1 text-sm font-medium text-[#1D1D1F]">Indoor navigation coverage</p>
              <p className="mt-2 text-xs leading-relaxed text-[#6E6E73]">Source-aligned floor maps with schematic route costs — not measured meters.</p>
            </article>
            <article className={`${card} p-6`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-700"><Database className="h-5 w-5" aria-hidden="true" /></span>
              <p className="mt-5 text-lg font-semibold tracking-tight">{snapshot.status.label}</p>
              <p className="mt-1 text-sm font-medium text-[#1D1D1F]">Campus data status</p>
              <p className="mt-2 text-xs leading-relaxed text-[#6E6E73]">{snapshot.status.notice}</p>
            </article>
            <article className={`${card} p-6`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><ShieldAlert className="h-5 w-5" aria-hidden="true" /></span>
              {navigationNotice ? (
                <>
                  <p className="mt-5 text-lg font-semibold tracking-tight">{navigationNotice.title}</p>
                  <p className="mt-1 text-sm font-medium text-[#1D1D1F]">Navigation notice</p>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#6E6E73]">{navigationNotice.message}</p>
                </>
              ) : (
                <>
                  <p className="mt-5 text-lg font-semibold tracking-tight">No restrictions recorded</p>
                  <p className="mt-1 text-sm font-medium text-[#1D1D1F]">Navigation notices</p>
                  <p className="mt-2 text-xs leading-relaxed text-[#6E6E73]">Mapped route restrictions will appear here.</p>
                </>
              )}
            </article>
          </div>
        </div>
      </section>

      <section aria-labelledby="home-events-title" className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Upcoming Events"
            title="On the campus calendar"
            action={<Link to="/events" className={`inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-[#1D1D1F] ${focusRing}`}>All events <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
          />
          <h2 id="home-events-title" className="sr-only">Upcoming events</h2>
          <div className="mt-8">
            {upcomingEvents.length ? (
              <div className="grid gap-4 md:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <article key={event.id} className={`${card} ${cardHover} p-6`}>
                    <CalendarDays className="h-5 w-5 text-[#6E6E73]" aria-hidden="true" />
                    <h3 className="mt-4 font-semibold tracking-tight">{event.title}</h3>
                    <p className="mt-2 text-sm text-[#6E6E73]">{formatCampusDateTime(event.startAt)}–{formatCampusShortTime(event.endAt)}</p>
                    {event.location && <p className="mt-1 text-sm text-[#6E6E73]">{event.location}</p>}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No events are published yet."
                message="Official campus events will appear here once an authorized events source is connected."
                action={<Link to="/events" className={button.smallSecondary}>Open Events</Link>}
              />
            )}
          </div>
        </div>
      </section>

      <section aria-label="Announcements and CLARA" className="border-t border-[#E5E5E7] bg-[#F5F5F7] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <SectionHeader eyebrow="Important Announcements" title="Campus updates" />
            <div className="mt-7 space-y-3">
              {announcements.map((announcement) => (
                <article key={announcement.id} className={`${card} p-6`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold tracking-tight text-[#1D1D1F]">{announcement.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">{announcement.body}</p>
                      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#86868B]">Source: {announcement.source}</p>
                    </div>
                    <PriorityBadge priority={announcement.priority === "high" ? "IMPORTANT" : "NORMAL"} className="shrink-0" />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="flex flex-col justify-between rounded-[2rem] bg-brand-900 bg-gradient-to-br from-brand-800 to-brand-900 p-8 text-white">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-500/20 text-gold-200">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight">Ask CLARA</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Campus Learning Alerts &amp; Response Assistant — locations, services, schedules, and official campus information.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {CLARA_SUGGESTIONS.map((suggestion) => (
                  <Link
                    key={suggestion}
                    to={`/clara?q=${encodeURIComponent(suggestion)}`}
                    className={`rounded-full border border-white/25 px-3.5 py-1.5 text-xs text-white/85 transition-colors duration-200 hover:border-gold-300 hover:text-white ${focusRing} focus-visible:ring-white focus-visible:ring-offset-brand-900`}
                  >
                    {suggestion}
                  </Link>
                ))}
              </div>
            </div>
            <form onSubmit={askClara} className="mt-8 flex items-center gap-2 rounded-full bg-white p-1.5 pl-4">
              <MessageCircle className="h-4 w-4 shrink-0 text-[#86868B]" aria-hidden="true" />
              <input
                value={claraQuery}
                onChange={(event) => setClaraQuery(event.target.value)}
                placeholder="Ask CLARA..."
                aria-label="Ask CLARA"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#1D1D1F] outline-none placeholder:text-[#86868B]"
              />
              <button type="submit" aria-label="Send to CLARA" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white transition-colors hover:bg-brand-800 ${focusRing}`}>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </aside>
        </div>
      </section>
    </div>
  )
}
