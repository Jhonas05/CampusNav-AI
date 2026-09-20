import { Bell, Menu, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import GlobalSearch from "./GlobalSearch"
import NotificationPanel, { getUnseenNotificationCount } from "./NotificationPanel"
import { PRIMARY_NAV, isActivePath } from "./navigationConfig"
import { focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

/** Page titles for routes that are not themselves sidebar destinations. */
const EXTRA_TITLES = [
  { path: "/facilities", label: "Facilities" },
  { path: "/alerts", label: "Alerts & Announcements" },
  { path: "/login", label: "Sign In" },
  { path: "/admin", label: "Administration" },
]

const resolveTitle = (pathname) => {
  const primary = PRIMARY_NAV.find((item) => !item.hash && isActivePath(pathname, item.path, item.exact))
  if (primary) return primary.label
  const extra = EXTRA_TITLES.find((item) => isActivePath(pathname, item.path))
  return extra?.label || "CampusNav"
}

const iconButtonClass = cn(
  "relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-[#1D1D1F] transition-colors duration-200 hover:border-[#D2D2D7] hover:bg-white motion-reduce:transition-none",
  focusRing
)

/**
 * Lightweight contextual header for the main workspace.
 *
 * Deliberately does not repeat the sidebar's destinations — it carries the
 * mobile navigation trigger, the current page title, global search, and the
 * notification entry point only.
 */
export default function MainHeader({ onOpenNavigation }) {
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  const title = resolveTitle(location.pathname)

  useEffect(() => {
    setSearchOpen(false)
    setNotificationsOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!notificationsOpen) setUnread(getUnseenNotificationCount())
  }, [location.pathname, notificationsOpen])

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setNotificationsOpen(false)
        setSearchOpen((current) => !current)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-[#E3E3E6] bg-[#F5F5F7]/90 backdrop-blur-xl">
      <div className="flex h-[var(--app-header-height)] items-center gap-2 px-[var(--app-page-gutter)]">
        <button
          type="button"
          onClick={onOpenNavigation}
          aria-label="Open navigation"
          className={cn(iconButtonClass, "-ml-1 lg:hidden")}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <h1 className="min-w-0 flex-1 truncate font-display text-[1.35rem] font-bold uppercase leading-none tracking-[0.03em] text-[#1D1D1F] sm:text-[1.5rem]">
          {title}
        </h1>

        <button
          type="button"
          onClick={() => { setNotificationsOpen(false); setSearchOpen(true) }}
          aria-label="Search CampusNav"
          className={cn(iconButtonClass, "w-auto gap-2 px-3 md:border-[#D2D2D7] md:bg-white")}
        >
          <Search className="h-[18px] w-[18px]" aria-hidden="true" />
          <span className="hidden text-[13px] font-medium text-[#6E6E73] md:block">Search campus</span>
          <kbd className="hidden rounded border border-[#D2D2D7] bg-[#F5F5F7] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#6E6E73] xl:block">
            ⌘K
          </kbd>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((current) => !current)}
            aria-expanded={notificationsOpen}
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
            className={iconButtonClass}
          >
            <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
            {unread > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#F5F5F7] bg-[#1D1D1F] px-0.5 text-[9px] font-bold leading-none text-white"
              >
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        </div>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
