import { ArrowRight, BookOpen, CalendarDays, Compass, Database, FlaskConical, HeartPulse, Landmark, LayoutGrid, MessageCircle, Monitor, Navigation, ShieldAlert, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import SchoolLogo from "@/components/campus/SchoolLogo"
import { button, card, cardHover, EmptyState, focusRing, PriorityBadge, SectionHeader } from "@/components/campus/ui"
import ClaraMark from "@/components/clara/ClaraMark"
import { useClara } from "@/components/clara/ClaraContext"
import HowItWorks from "@/components/home/HowItWorks"
import QuickActions from "@/components/home/QuickActions"
import SmartCampusStrip from "@/components/home/SmartCampusStrip"
import CampusMapPreview from "@/components/map/CampusMapPreview"
import DestinationSearch from "@/components/map/DestinationSearch"
import MotionReveal, { StaggerGroup } from "@/components/motion/MotionReveal"
import QuickAccessCard from "@/components/home/QuickAccessCard"
import { announcements } from "@/data/announcements"
import { facilities, getFacilityById } from "@/data/facilities"
import { getFloorById } from "@/data/floors"
import { getFacilityEntranceNodes } from "@/data/mapNodes"
import { formatCampusDateTime, formatCampusShortTime } from "@/lib/campusTime"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { getNavigateHref } from "@/lib/mapLinks"
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

const NAVIGABLE_FACILITIES = facilities.filter((facility) => facility.navigable !== false && getFacilityEntranceNodes(facility.id, facility.floorId).length > 0)

const CLARA_SUGGESTIONS = ["Where is the Registrar?", "Is the Library open?", "What events are happening today?"]

export default function Home() {
  const { openClara } = useClara()
  const navigate = useNavigate()
  const [claraQuery, setClaraQuery] = useState("")
  const [destinationQuery, setDestinationQuery] = useState("")
  const snapshot = useMemo(() => getDashboardSnapshot({ now: new Date() }), [])
  const upcomingEvents = useMemo(() => [...snapshot.events.today, ...snapshot.events.upcoming].slice(0, 3), [snapshot])
  const navigationNotice = snapshot.navigationNotices[0] || null

  const quickAccessItems = QUICK_ACCESS
    .map((item) => ({ ...item, facility: getFacilityById(item.facilityId) }))
    .filter((item) => item.facility)

  const askClara = (event) => {
    event.preventDefault()
    openClara({ question: claraQuery.trim() || null })
    setClaraQuery("")
  }

  return (
    <div>
      <section aria-label="CampusNav overview" className="relative border-b border-line bg-canvas-raised px-[var(--app-page-gutter)] pb-8 pt-7 sm:pt-9 lg:pb-9 lg:pt-8">
        <div className="relative mx-auto grid max-w-[var(--app-max-width)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:items-stretch xl:gap-8">
          <StaggerGroup className="flex flex-col">
            <div className="flex items-center gap-3">
              <SchoolLogo size="lg" />
              <p className="ink-kicker">St. Clare College of Caloocan</p>
            </div>
            <h1 className="mt-4 font-display text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[3.25rem] xl:text-[3.75rem]">CampusNav</h1>
            <p className="mt-3 max-w-xl text-lg font-medium leading-snug tracking-[-0.01em] text-ink sm:text-xl">
              Smart Campus Navigation and Information Platform
            </p>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              Find any office, room, or laboratory across GF–5F, see how to get there in 2D or 3D, and ask CLARA along the way.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link to="/map" className={`${button.primary} group`}>
                <Navigation className="nav-icon h-4 w-4" data-motion="forward" aria-hidden="true" /> Navigate Campus
              </Link>
              <button type="button" onClick={() => openClara()} className={button.secondary}>
                <ClaraMark className="h-4 w-4" /> Ask CLARA
              </button>
              <Link to="/dashboard" className={button.ghost}>
                <LayoutGrid className="h-4 w-4" aria-hidden="true" /> View Dashboard
              </Link>
            </div>
            <DestinationSearch
              facilities={NAVIGABLE_FACILITIES}
              query={destinationQuery}
              onQueryChange={setDestinationQuery}
              onSelect={(facility) => navigate(getNavigateHref({ facilityId: facility.id }))}
              className="mt-6 max-w-xl"
            />
            <div className="mt-6 lg:mt-auto lg:pt-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">What CampusNav covers</p>
              <SmartCampusStrip />
            </div>
          </StaggerGroup>

          <MotionReveal index={2} className="rounded-[22px] border border-line bg-surface p-3 shadow-soft sm:p-4 lg:flex lg:flex-col">
            <div className="flex items-center justify-between gap-3 px-1">
              <div>
                <p className="ink-kicker">Campus at a glance</p>
                <h2 className="mt-1 text-[15px] font-semibold tracking-[-0.01em] text-ink">Explore the campus</h2>
              </div>
              <Link to="/map" className={`group inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-ink-soft hover:text-ink ${focusRing}`}>
                Open map <ArrowRight className="nav-icon h-3.5 w-3.5" data-motion="forward" aria-hidden="true" />
              </Link>
            </div>
            <CampusMapPreview
              className="mt-3 lg:flex lg:flex-1 lg:flex-col"
              preferredView="3D"
              label="St. Clare College campus map"
              heightClass="h-[22rem] sm:h-[26rem] lg:h-auto lg:min-h-[25rem] lg:flex-1"
            />
          </MotionReveal>
        </div>

        <div className="relative mx-auto mt-8 max-w-[var(--app-max-width)]">
          <SectionHeader
            eyebrow="Quick Access"
            title="Popular destinations"
            description="Frequently visited offices, laboratories, and services across the campus."
            action={<Link to="/facilities" className={`hidden items-center gap-1.5 rounded-md text-sm font-medium text-ink sm:inline-flex ${focusRing}`}>View all facilities <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
          />
          <StaggerGroup className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
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
          </StaggerGroup>
          <Link to="/facilities" className={`mt-4 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-ink sm:hidden ${focusRing}`}>
            View all facilities <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="quick-actions-title" className="px-[var(--app-page-gutter)] pt-10 sm:pt-12">
        <div className="mx-auto max-w-[var(--app-max-width)]">
          <SectionHeader eyebrow="Quick Actions" title="Start here" />
          <h2 id="quick-actions-title" className="sr-only">Quick actions</h2>
          <div className="mt-5"><QuickActions /></div>
        </div>
      </section>

      <HowItWorks />

      <section aria-label="Campus status" className="border-y border-line bg-canvas-raised px-[var(--app-page-gutter)] py-10 sm:py-12">
        <div className="mx-auto max-w-[var(--app-max-width)]">
          <SectionHeader eyebrow="Campus Status" title="Right now on campus" />
          <StaggerGroup className="mt-5 grid gap-4 md:grid-cols-2">
            <article className={`${card} p-5`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-700"><Database className="h-5 w-5" aria-hidden="true" /></span>
              <p className="mt-3 text-lg font-semibold tracking-tight">{snapshot.status.label}</p>
              <p className="mt-1 text-sm font-medium text-ink">Campus data status</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">{snapshot.status.notice}</p>
            </article>
            <article className={`${card} p-5`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fill text-ink"><ShieldAlert className="h-5 w-5" aria-hidden="true" /></span>
              {navigationNotice ? (
                <>
                  <p className="mt-3 text-lg font-semibold tracking-tight">{navigationNotice.title}</p>
                  <p className="mt-1 text-sm font-medium text-ink">Navigation notice</p>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-soft">{navigationNotice.message}</p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-lg font-semibold tracking-tight">No restrictions recorded</p>
                  <p className="mt-1 text-sm font-medium text-ink">Navigation notices</p>
                  <p className="mt-2 text-xs leading-relaxed text-ink-soft">Mapped route restrictions will appear here.</p>
                </>
              )}
            </article>
          </StaggerGroup>
        </div>
      </section>

      <section aria-labelledby="home-events-title" className="px-[var(--app-page-gutter)] py-10 sm:py-12">
        <div className="mx-auto max-w-[var(--app-max-width)]">
          <SectionHeader
            eyebrow="Upcoming Events"
            title="On the campus calendar"
            action={<Link to="/events" className={`inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-ink ${focusRing}`}>All events <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
          />
          <h2 id="home-events-title" className="sr-only">Upcoming events</h2>
          <div className="mt-5">
            {upcomingEvents.length ? (
              <div className="grid gap-4 md:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <article key={event.id} className={`${card} ${cardHover} p-5`}>
                    <CalendarDays className="h-5 w-5 text-ink-soft" aria-hidden="true" />
                    <h3 className="mt-4 font-semibold tracking-tight">{event.title}</h3>
                    <p className="mt-2 text-sm text-ink-soft">{formatCampusDateTime(event.startAt)}–{formatCampusShortTime(event.endAt)}</p>
                    {event.location && <p className="mt-1 text-sm text-ink-soft">{event.location}</p>}
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

      <section aria-label="Announcements and CLARA" className="border-t border-line px-[var(--app-page-gutter)] py-10 sm:py-12">
        <div className="mx-auto grid max-w-[var(--app-max-width)] gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <SectionHeader eyebrow="Important Announcements" title="Campus updates" />
            <div className="mt-5 space-y-3">
              {announcements.map((announcement) => (
                <article key={announcement.id} className={`${card} p-5`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold tracking-tight text-ink">{announcement.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{announcement.body}</p>
                      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Source: {announcement.source}</p>
                    </div>
                    <PriorityBadge priority={announcement.priority === "high" ? "IMPORTANT" : "NORMAL"} className="shrink-0" />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <MotionReveal as="aside" className="flex flex-col justify-between rounded-[22px] bg-ink p-6 text-on-ink">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-on-ink/15 text-on-ink">
                <ClaraMark className="h-5 w-5" />
              </span>
              <h2 className="mt-6 font-display text-2xl font-semibold tracking-[-0.02em]">Ask CLARA</h2>
              <p className="mt-2 text-sm leading-relaxed text-on-ink/70">
                Campus Learning Alerts &amp; Response Assistant — locations, services, schedules, and official campus information.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {CLARA_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => openClara({ question: suggestion })}
                    className={`rounded-full border border-on-ink/25 px-3.5 py-1.5 text-xs text-on-ink/85 transition-colors duration-200 hover:border-on-ink/70 hover:text-on-ink ${focusRing} focus-visible:ring-on-ink focus-visible:ring-offset-ink`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
            <form onSubmit={askClara} className="mt-8 flex items-center gap-2 rounded-full bg-surface p-1.5 pl-4">
              <MessageCircle className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
              <input
                value={claraQuery}
                onChange={(event) => setClaraQuery(event.target.value)}
                placeholder="Ask CLARA..."
                aria-label="Ask CLARA"
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              <button type="submit" aria-label="Send to CLARA" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-on-ink transition-colors hover:bg-brand-800 ${focusRing}`}>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </MotionReveal>
        </div>
      </section>
    </div>
  )
}
