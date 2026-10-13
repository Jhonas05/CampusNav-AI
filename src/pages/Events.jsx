import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns"
import { Activity, ChevronLeft, ChevronRight, Clock3, MapPin, Navigation, UserRound, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { button, card, Chip, Disclosure, focusRing, PageHeader, StatusBadge } from "@/components/campus/ui"
import { formatCampusDateTime, formatCampusShortTime, getCampusDateKey } from "@/lib/campusTime"
import { getDashboardSnapshot, loadDashboardSnapshot } from "@/services/dashboardService"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "calendar", label: "Calendar" },
]

/**
 * Event list card: name, when, where, one status, and at most two actions.
 * The organizer and audience open under Details.
 */
function EventCard({ event }) {
  const audience = Array.isArray(event.audience) ? event.audience : []
  const hasDetails = Boolean(event.organizer || audience.length || event.description)
  return (
    <article className={`${card} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-[16px] font-semibold leading-snug tracking-tight">{event.title}</h3>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <StatusBadge status={event.status} />
          {event.demo && <Chip>Demo data</Chip>}
        </div>
      </div>
      <p className="mt-1.5 flex items-center gap-2 text-sm text-ink-soft">
        <Clock3 className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
        {formatCampusDateTime(event.startAt)}–{formatCampusShortTime(event.endAt)}
      </p>
      {event.location && (
        <p className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
          {event.location}
        </p>
      )}
      {event.navigationHref && (
        <Link to={event.navigationHref} aria-label={`Navigate to the venue of ${event.title}`} className={cn(button.smallPrimary, "mt-3 min-h-11")}>
          <Navigation className="h-3.5 w-3.5" aria-hidden="true" /> Navigate
        </Link>
      )}
      {hasDetails && (
        <Disclosure summary="Details" className="mt-2 border-t border-line">
          <dl className="space-y-1.5 text-sm text-ink-soft">
            {event.description && <dd className="leading-relaxed">{event.description}</dd>}
            {event.organizer && (
              <div className="flex items-center gap-2">
                <dt className="sr-only">Organizer</dt>
                <UserRound className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
                <dd>{event.organizer}</dd>
              </div>
            )}
            {audience.length > 0 && (
              <div className="flex items-center gap-2">
                <dt className="sr-only">Audience</dt>
                <Users className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
                <dd>{audience.join(", ")}</dd>
              </div>
            )}
          </dl>
        </Disclosure>
      )}
    </article>
  )
}

/** @param {{ title: string, action?: import("react").ReactNode }} props */
function NoEvents({ title, action = null }) {
  return (
    <div role="status" className="rounded-[18px] border border-dashed border-line-strong bg-subtle px-4 py-8 text-center">
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

function MonthCalendar({ events, todayKey }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selectedKey, setSelectedKey] = useState(todayKey)

  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  }), [month])

  const eventsByDay = useMemo(() => {
    const map = new Map()
    events.forEach((event) => {
      const key = event.date
      if (!key) return
      map.set(key, [...(map.get(key) || []), event])
    })
    return map
  }, [events])

  const selectedEvents = eventsByDay.get(selectedKey) || []

  return (
    <div className={`${card} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h3 className="text-lg font-semibold tracking-tight">{format(month, "MMMM yyyy")}</h3>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setMonth((current) => addMonths(current, -1))} aria-label="Previous month" className={`flex h-11 w-11 items-center justify-center rounded-full border border-line-strong transition-colors hover:border-ink-faint ${focusRing}`}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setMonth((current) => addMonths(current, 1))} aria-label="Next month" className={`flex h-11 w-11 items-center justify-center rounded-full border border-line-strong transition-colors hover:border-ink-faint ${focusRing}`}>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-line px-3 pt-3 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day} className="pb-2">{day}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1 p-3">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd")
          const inMonth = isSameMonth(day, month)
          const hasEvents = eventsByDay.has(key)
          const isSelected = key === selectedKey
          const isToday = key === todayKey
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedKey(key)}
              aria-pressed={isSelected}
              aria-label={`${format(day, "MMMM d, yyyy")}${hasEvents ? ", has events" : ""}`}
              className={cn(
                "relative mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-full text-sm tabular-nums transition-colors duration-150 max-[380px]:h-10 max-[380px]:w-10",
                inMonth ? "text-ink" : "text-ink-ghost",
                isSelected ? "bg-brand-700 font-semibold text-on-ink" : "hover:bg-brand-50",
                isToday && !isSelected && "border-[1.5px] border-brand-700 font-semibold text-brand-800",
                focusRing
              )}
            >
              {format(day, "d")}
              {hasEvents && <span aria-hidden="true" className={cn("absolute bottom-1 h-1 w-1 rounded-full", isSelected ? "bg-surface" : "bg-brand-600")} />}
            </button>
          )
        })}
      </div>

      <div className="border-t border-line bg-subtle p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">{selectedKey === todayKey ? "Today" : format(new Date(`${selectedKey}T00:00:00`), "MMMM d, yyyy")}</p>
        {selectedEvents.length ? (
          <ul className="mt-3 space-y-2">
            {selectedEvents.map((event) => (
              <li key={event.id} className="rounded-xl border border-line bg-surface p-3.5">
                <p className="text-sm font-semibold">{event.title}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{formatCampusShortTime(event.startAt)}–{formatCampusShortTime(event.endAt)}{event.location ? ` · ${event.location}` : ""}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-ink-soft">No events on this date.</p>
        )}
      </div>
    </div>
  )
}

export default function Events() {
  const [searchParams] = useSearchParams()
  const demo = searchParams.get("demo") === "1"
  const [tab, setTab] = useState("today")
  const [now] = useState(() => new Date())
  const localSnapshot = useMemo(() => getDashboardSnapshot({ demo, now }), [demo, now])
  const [events, setEvents] = useState(localSnapshot.events)

  useEffect(() => {
    let active = true
    setEvents(localSnapshot.events)
    loadDashboardSnapshot({ demo, now }).then((snapshot) => {
      if (active) setEvents(snapshot.events)
    })
    return () => { active = false }
  }, [demo, localSnapshot, now])

  const todayKey = getCampusDateKey(now)
  const allEvents = useMemo(() => [...events.today, ...events.upcoming], [events])

  return (
    <div className="app-page bg-canvas">
      <div className="app-container">
        <PageHeader
          compact
          eyebrow="Campus calendar"
          title="Events"
          lead="Published campus events."
          actions={
            <div role="tablist" aria-label="Event views" className="flex shrink-0 rounded-full border border-line-strong bg-surface p-1 text-[13px] font-semibold max-md:w-full">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={cn("min-h-11 flex-1 rounded-full px-4 transition-colors duration-200 md:min-h-9", tab === item.id ? "bg-brand-700 text-on-ink" : "text-ink-soft hover:text-ink", focusRing)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          }
        />

        {demo && (
          <div role="status" className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-ink bg-ink p-4 text-on-ink">
            <Activity className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em]">Demo data</p>
              <p className="mt-1 text-sm text-on-ink/75">Sample data — not official school information.</p>
            </div>
          </div>
        )}

        <div className="mt-4 sm:mt-6">
          {tab === "today" && (
            events.today.length ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-3 sm:gap-4">
                {events.today.map((event) => <EventCard key={event.id} event={event} />)}
              </div>
            ) : (
              <NoEvents title="No events today." action={<button type="button" onClick={() => setTab("calendar")} className={cn(button.smallSecondary, "min-h-11")}>View calendar</button>} />
            )
          )}

          {tab === "upcoming" && (
            events.upcoming.length ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-3 sm:gap-4">
                {events.upcoming.map((event) => <EventCard key={event.id} event={event} />)}
              </div>
            ) : (
              <NoEvents title="No upcoming events." action={<button type="button" onClick={() => setTab("calendar")} className={cn(button.smallSecondary, "min-h-11")}>View calendar</button>} />
            )
          )}

          {tab === "calendar" && (
            <div className="grid gap-5 lg:grid-cols-[minmax(420px,0.9fr)_minmax(0,1.1fr)]">
              <MonthCalendar events={allEvents} todayKey={todayKey} />
              <div>
                <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">All events</h2>
                {allEvents.length ? (
                  <div className="mt-3 space-y-3">
                    {allEvents.map((event) => <EventCard key={event.id} event={event} />)}
                  </div>
                ) : (
                  <NoEvents title="No published events yet." />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
