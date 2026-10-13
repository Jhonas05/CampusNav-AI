import { Bell, Search } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import SchoolLogo from "@/components/campus/SchoolLogo"

const iconButton = "relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-fill-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1"

/**
 * Phone-only context bar: the brand and at most two utilities (search and
 * notifications). Navigation lives in the bottom bar; appearance and the
 * account live under More. Home leaves the search icon out because its own
 * destination search is the first thing on the page.
 * @param {Record<string, any>} props
 */
export default function MobileTopBar(props) {
  const { onSearch, onToggleNotifications, notificationsOpen, unread } = props
  const { pathname } = useLocation()
  return (
    <header data-app-chrome="mobile-top-bar" className="sticky top-0 z-sticky flex h-[var(--app-header-height)] items-center gap-1 border-b border-line bg-canvas-raised/90 pl-3 pr-2 backdrop-blur-xl md:hidden print:hidden">
      <Link to="/" aria-label="CampusNav home" className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink">
        <SchoolLogo size="sm" className="h-7 w-7" />
        <span className="truncate text-[17px] font-semibold tracking-[-0.015em] text-ink">CampusNav</span>
      </Link>
      {pathname !== "/" && (
        <button type="button" onClick={onSearch} aria-label="Search CampusNav" className={iconButton}>
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        onClick={onToggleNotifications}
        aria-expanded={notificationsOpen}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        data-shell-panel-toggle="notifications"
        className={iconButton}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unread > 0 && (
          <span aria-hidden="true" className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-on-ink bg-ink px-0.5 text-[9px] font-semibold leading-none text-on-ink">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </header>
  )
}
