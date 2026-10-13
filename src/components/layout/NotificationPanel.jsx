import { ArrowRight, BellRing, BookOpen, CalendarDays, Construction, Navigation } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"
import { Link } from "react-router-dom"
import { PriorityBadge, focusRing } from "@/components/campus/ui"
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

export const NOTIFICATION_PREVIEW_LIMIT = 5

/**
 * The few items worth previewing, most important first: priority alerts,
 * facility advisories, navigation notices, today's classes, then events.
 * The complete feed stays on the Dashboard.
 */
export const getNotificationPreview = (feed, limit = NOTIFICATION_PREVIEW_LIMIT) => [
  ...feed.alerts.map((record) => ({ id: record.id, icon: BellRing, kind: "Alert", title: record.title, detail: record.message, priority: record.priority, href: record.emergencyHref || record.navigationHref || record.facilityHref || "/dashboard" })),
  ...feed.advisories.map((record) => ({ id: record.id, icon: Construction, kind: "Facility", title: record.title, detail: record.message, priority: record.priority, href: record.facilityHref || "/dashboard" })),
  ...feed.navigationNotices.map((record) => ({ id: record.id, icon: Navigation, kind: "Route", title: record.title, detail: record.message, priority: record.priority, href: record.navigationHref || "/map" })),
  ...feed.classes.map((record) => ({ id: record.id, icon: BookOpen, kind: "Class", title: record.subject, detail: `${record.room} · ${formatCampusShortTime(record.startAt)}–${formatCampusShortTime(record.endAt)}`, priority: null, href: record.facilityHref || "/dashboard" })),
  ...feed.events.map((record) => ({ id: record.id, icon: CalendarDays, kind: "Event", title: record.title, detail: record.location, priority: null, href: "/events" })),
].slice(0, limit)

function PanelItem({ item }) {
  const Icon = item.icon
  return (
    <li>
      <Link to={item.href} className={`flex min-h-12 items-start gap-3 rounded-xl px-2.5 py-2.5 transition-colors duration-150 hover:bg-fill ${focusRing}`}>
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold leading-snug text-ink">{item.title}</span>
          {item.detail && <span className="mt-0.5 line-clamp-1 block text-xs text-ink-soft">{item.detail}</span>}
        </span>
        {item.priority && item.priority !== "NORMAL" && item.priority !== "INFORMATIONAL"
          ? <PriorityBadge priority={item.priority} className="min-h-6 shrink-0 px-2 text-[9px]" />
          : <span className="shrink-0 pt-0.5 text-[11px] font-medium text-ink-faint">{item.kind}</span>}
      </Link>
    </li>
  )
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

  const items = getNotificationPreview(feed)

  return (
    <div
      ref={panelRef}
      role="region"
      aria-label="Notifications"
      className="ink-blueprint fixed z-dropdown overflow-hidden rounded-[18px] shadow-[0_12px_36px_rgba(0,0,0,0.14)] max-md:inset-x-3 max-md:top-[calc(var(--app-header-height)+0.5rem)] md:bottom-3 md:left-[calc(var(--sidebar-width)+0.5rem)] flex max-h-[min(70dvh,560px)] flex-col md:w-[380px]"
    >
      <header className="border-b border-line px-4 py-3.5">
        <h2 className="text-[15px] font-semibold text-ink">Notifications</h2>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {items.length === 0
          ? <p role="status" className="px-4 py-6 text-center text-sm text-ink-soft">No new notifications.</p>
          : <ul className="p-2">{items.map((item) => <PanelItem key={item.id} item={item} />)}</ul>}
      </div>

      <Link
        to="/dashboard"
        onClick={onClose}
        className={`flex min-h-12 items-center justify-center gap-2 border-t border-line bg-subtle px-4 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 ${focusRing}`}
      >
        View all notifications <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
