import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns"
import { Activity, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, UserRound, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { card, Chip, EmptyState, focusRing, PageHeader, StatusBadge } from "@/components/campus/ui"
import { formatCampusDateTime, formatCampusShortTime, getCampusDateKey } from "@/lib/campusTime"
import { getDashboardSnapshot, loadDashboardSnapshot } from "@/services/dashboardService"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "calendar", label: "Calendar" },
]

function EventCard({ event }) {
  return (
    <article className={`${card} p-6`}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-700">
          <CalendarDays className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="flex flex-wrap justify-end gap-2">
          <StatusBadge status={event.status} />
          {event.demo && <Chip>Demo data</Chip>}
        </div>
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight">{event.title}</h3>
      <dl className="mt-3 space-y-1.5 text-sm text-[#6E6E73]">
        <div className="flex items-center gap-2">
          <Clock3 className="h-3.5 w-3.5 shrink-0 text-[#86868B]" aria-hidden="true" />
          <dd>{formatCampusDateTime(event.startAt)}–{formatCampusShortTime(event.endAt)}</dd>
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#86868B]" aria-hidden="true" />
            <dd>{event.location}</dd>
          </div>
        )}
        {event.organizer && (
          <div className="flex items-center gap-2">
            <UserRound className="h-3.5 w-3.5 shrink-0 text-[#86868B]" aria-hidden="true" />
            <dd>{event.organizer}</dd>
          </div>
        )}
        {Array.isArray(event.audience) && event.audience.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0 text-[#86868B]" aria-hidden="true" />
            <dd>{event.audience.join(", ")}</dd>
          </div>
        )}
      </dl>
      {event.navigationHref && (
        <Link to={event.navigationHref} className={`mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-brand-700 px-4 text-xs font-semibold text-white transition-colors duration-200 hover:bg-brand-800 ${focusRing}`}>
          Navigate to Venue <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </article>
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
      <div className="flex items-center justify-between border-b border-[#E5E5E7] px-5 py-4">
        <h3 className="text-lg font-semibold tracking-tight">{format(month, "MMMM yyyy")}</h3>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setMonth((current) => addMonths(current, -1))} aria-label="Previous month" className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#D2D2D7] transition-colors hover:border-[#86868B] ${focusRing}`}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setMonth((current) => addMonths(current, 1))} aria-label="Next month" className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#D2D2D7] transition-colors hover:border-[#86868B] ${focusRing}`}>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-[#F0F0F2] px-3 pt-3 text-center text-[10px] font-semibold uppercase tracking-wide text-[#86868B]">
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
                "relative mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm tabular-nums transition-colors duration-150",
                inMonth ? "text-[#1D1D1F]" : "text-[#C7C7CC]",
                isSelected ? "bg-brand-700 font-semibold text-white" : "hover:bg-brand-50",
                isToday && !isSelected && "border-[1.5px] border-brand-700 font-semibold text-brand-800",
                focusRing
              )}
            >
              {format(day, "d")}
              {hasEvents && <span aria-hidden="true" className={cn("absolute bottom-1 h-1 w-1 rounded-full", isSelected ? "bg-white" : "bg-brand-600")} />}
            </button>
          )
        })}
      </div>

      <div className="border-t border-[#E5E5E7] bg-[#FAFAFA] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868B]">{selectedKey === todayKey ? "Today" : format(new Date(`${selectedKey}T00:00:00`), "MMMM d, yyyy")}</p>
        {selectedEvents.length ? (
          <ul className="mt-3 space-y-2">
            {selectedEvents.map((event) => (
              <li key={event.id} className="rounded-xl border border-[#E5E5E7] bg-white p-3.5">
                <p className="text-sm font-semibold">{event.title}</p>
                <p className="mt-0.5 text-xs text-[#6E6E73]">{formatCampusShortTime(event.startAt)}–{formatCampusShortTime(event.endAt)}{event.location ? ` · ${event.location}` : ""}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-[#6E6E73]">No events on this date.</p>
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
    <div className="min-h-[calc(100vh-64px)] bg-[#F5F5F7] px-4 py-12 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          eyebrow="Campus calendar"
          title="Events"
          lead="Official campus events, activities, and schedules — published records only."
          actions={
            <div role="tablist" aria-label="Event views" className="flex shrink-0 rounded-full border border-[#D2D2D7] bg-white p-1 text-xs font-semibold">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={cn("rounded-full px-4 py-2 transition-colors duration-200", tab === item.id ? "bg-brand-700 text-white" : "text-[#6E6E73] hover:text-[#1D1D1F]", focusRing)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          }
        />

        {demo && (
          <div role="status" className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-[#1D1D1F] bg-[#1D1D1F] p-4 text-white">
            <Activity className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em]">Demo data</p>
              <p className="mt-1 text-sm text-white/75">Sample data — not official school information.</p>
            </div>
          </div>
        )}

        <div className="mt-8">
          {tab === "today" && (
            events.today.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {events.today.map((event) => <EventCard key={event.id} event={event} />)}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No events are available for today."
                message="Published events for today will appear here once an official events source is connected."
                className="min-h-64"
              />
            )
          )}

          {tab === "upcoming" && (
            events.upcoming.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {events.upcoming.map((event) => <EventCard key={event.id} event={event} />)}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No upcoming events."
                message="Future campus events will appear here when they are published."
                className="min-h-64"
              />
            )
          )}

          {tab === "calendar" && (
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <MonthCalendar events={allEvents} todayKey={todayKey} />
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">All published events</h2>
                {allEvents.length ? (
                  <div className="mt-4 space-y-4">
                    {allEvents.map((event) => <EventCard key={event.id} event={event} />)}
                  </div>
                ) : (
                  <EmptyState icon={CalendarDays} title="Nothing on the calendar yet." message="Published events will be marked on the calendar automatically." className="mt-4 min-h-44" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
