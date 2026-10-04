import { ArrowRight, BellRing, BookOpen, CalendarDays, Construction, Navigation } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"
import { Link } from "react-router-dom"
import { EmptyState, PriorityBadge, focusRing } from "@/components/campus/ui"
import { formatCampusShortTime } from "@/lib/campusTime"
import { getDashboardSnapshot } from "@/services/dashboardService"

const SEEN_KEY = "campusnav.notifications.seen.v1"

const readSeenIds = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SEEN_KEY) || "[]")
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeSeenIds = (ids) => {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(ids.slice(-200)))
  } catch {
    // Storage unavailable — the unread badge simply resets next visit.
  }
}

export const getNotificationFeed = (now = new Date()) => {
  const snapshot = getDashboardSnapshot({ now })
  return {
    alerts: snapshot.alerts,
    classes: snapshot.classes,
    advisories: snapshot.advisories,
    events: [...snapshot.events.today, ...snapshot.events.upcoming].slice(0, 3),
    navigationNotices: snapshot.navigationNotices,
  }
}

const trackedIds = (feed) => [...feed.alerts, ...feed.advisories, ...feed.navigationNotices].map((record) => record.id)

export const getUnseenNotificationCount = () => {
  if (typeof window === "undefined") return 0
  const seen = new Set(readSeenIds())
  return trackedIds(getNotificationFeed()).filter((id) => !seen.has(id)).length
}

export const markNotificationsSeen = () => {
  if (typeof window === "undefined") return
  const seen = new Set(readSeenIds())
  trackedIds(getNotificationFeed()).forEach((id) => seen.add(id))
  writeSeenIds([...seen])
}

function PanelSection({ icon: Icon, title, tint = "text-ink-soft", children }) {
  return (
    <section aria-label={title}>
      <div className="flex items-center gap-2 px-4 pb-2 pt-4">
        <Icon className={`h-3.5 w-3.5 ${tint}`} aria-hidden="true" />
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">{title}</h3>
      </div>
      <div className="space-y-1 px-2">{children}</div>
    </section>
  )
}

function PanelItem({ record, href = null, meta = null }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold leading-snug text-ink">{record.title || record.subject || record.name}</p>
        {record.priority && <PriorityBadge priority={record.priority} className="min-h-6 shrink-0 px-2 text-[8px]" />}
      </div>
      {record.message && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">{record.message}</p>}
      {meta && <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-ink-faint">{meta}</p>}
    </>
  )
  if (href) {
    return <Link to={href} className={`block rounded-xl px-2.5 py-2.5 transition-colors duration-150 hover:bg-fill ${focusRing}`}>{body}</Link>
  }
  return <div className="rounded-xl px-2.5 py-2.5">{body}</div>
}

export default function NotificationPanel({ open, onClose }) {
  const panelRef = useRef(null)

  const feed = useMemo(() => (open ? getNotificationFeed(new Date()) : null), [open])

  useEffect(() => {
    if (open) markNotificationsSeen()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event) => {
      if (event.target instanceof Element && event.target.closest("[data-shell-panel-toggle]")) return
      if (panelRef.current && !panelRef.current.contains(event.target)) onClose()
    }
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  if (!open || !feed) return null

  const isEmpty = !feed.alerts.length && !feed.classes.length && !feed.advisories.length && !feed.events.length && !feed.navigationNotices.length

  return (
    <div
      ref={panelRef}
      role="region"
      aria-label="Notifications"
      className="ink-blueprint fixed z-dropdown overflow-hidden rounded-[18px] shadow-[0_12px_36px_rgba(0,0,0,0.14)] max-md:inset-x-3 max-md:top-[calc(var(--app-header-height)+0.5rem)] md:bottom-3 md:left-[calc(var(--sidebar-width)+0.5rem)] flex max-h-[min(70dvh,560px)] flex-col md:w-[380px]"
    >
      <header className="flex items-center justify-between border-b border-line px-4 py-3.5">
        <h2 className="text-sm font-semibold text-ink">Notifications</h2>
        <span className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">Official campus updates</span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3">
        {isEmpty ? (
          <div className="p-4">
            <EmptyState icon={BellRing} title="You're all caught up." message="Priority alerts, schedule updates, advisories, and events will appear here when published." className="min-h-32" />
          </div>
        ) : (
          <>
            {feed.alerts.length > 0 && (
              <PanelSection icon={BellRing} title="Priority Alerts" tint="text-ink">
                {feed.alerts.map((record) => <PanelItem key={record.id} record={record} href={record.emergencyHref || record.navigationHref || record.facilityHref || "/dashboard"} />)}
              </PanelSection>
            )}
            {feed.classes.length > 0 && (
              <PanelSection icon={BookOpen} title="Schedule Updates" tint="text-ink">
                {feed.classes.map((record) => <PanelItem key={record.id} record={{ ...record, title: record.subject, message: `${record.room} · ${formatCampusShortTime(record.startAt)}–${formatCampusShortTime(record.endAt)}` }} href={record.facilityHref || "/dashboard"} />)}
              </PanelSection>
            )}
            {feed.advisories.length > 0 && (
              <PanelSection icon={Construction} title="Facility Advisories" tint="text-ink">
                {feed.advisories.map((record) => <PanelItem key={record.id} record={record} href={record.facilityHref || "/dashboard"} />)}
              </PanelSection>
            )}
            {feed.events.length > 0 && (
              <PanelSection icon={CalendarDays} title="Events" tint="text-brand-700">
                {feed.events.map((record) => <PanelItem key={record.id} record={{ ...record, message: record.location }} href="/events" />)}
              </PanelSection>
            )}
            {feed.navigationNotices.length > 0 && (
              <PanelSection icon={Navigation} title="Navigation Notices">
                {feed.navigationNotices.map((record) => <PanelItem key={record.id} record={record} href={record.navigationHref || "/map"} />)}
              </PanelSection>
            )}
          </>
        )}
      </div>

      <Link
        to="/dashboard"
        onClick={onClose}
        className={`flex items-center justify-center gap-2 border-t border-line bg-subtle px-4 py-3.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 ${focusRing}`}
      >
        View All in Dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
