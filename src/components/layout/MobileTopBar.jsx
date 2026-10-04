import { Bell, Menu, Search } from "lucide-react"
import { Link } from "react-router-dom"
import SchoolLogo from "@/components/campus/SchoolLogo"
import { cn } from "@/lib/utils"

const iconButton = "relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-fill-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1"

/**
 * Phone-only context bar. It carries the drawer trigger and two utilities —
 * it is not a navigation bar and contains no route links besides the brand.
 * @param {Record<string, any>} props
 */
export default function MobileTopBar(props) {
  const { menuOpen, onOpenMenu, onSearch, onToggleNotifications, notificationsOpen, unread } = props
  return (
    <header data-app-chrome="mobile-top-bar" className="sticky top-0 z-sticky flex h-[var(--app-header-height)] items-center gap-1 border-b border-line bg-canvas-raised/90 px-2 backdrop-blur-xl md:hidden print:hidden">
      <button type="button" onClick={onOpenMenu} aria-label="Open navigation menu" aria-haspopup="dialog" aria-expanded={menuOpen} className={iconButton}>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <Link to="/" aria-label="CampusNav home" className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink">
        <SchoolLogo size="sm" className="h-7 w-7" />
        <span className="truncate text-[15px] font-semibold tracking-[-0.015em] text-ink">CampusNav</span>
      </Link>
      <button type="button" onClick={onSearch} aria-label="Search CampusNav" className={iconButton}>
        <Search className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onToggleNotifications}
        aria-expanded={notificationsOpen}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        data-shell-panel-toggle="notifications"
        className={cn(iconButton)}
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
