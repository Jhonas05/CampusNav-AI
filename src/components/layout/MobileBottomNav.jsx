import { Ellipsis } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { isNavItemActive, MOBILE_MORE_ITEMS, MOBILE_NAV_ITEMS } from "./sidebar/navigation"
import { cn } from "@/lib/utils"

const slot = "group flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] leading-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink motion-reduce:transition-none"
const pill = "flex h-7 w-14 items-center justify-center rounded-full transition-colors duration-150 motion-reduce:transition-none"

/**
 * Phone primary navigation: four destinations and More, in thumb reach. It
 * replaces the hamburger drawer below 768px; tablets and desktops keep the
 * left sidebar. CLARA is not an entry here: it stays the floating assistant.
 * @param {Record<string, any>} props
 */
export default function MobileBottomNav(props) {
  const { moreOpen, onOpenMore } = props
  const { pathname } = useLocation()
  // More reads as current while the visitor is on a page that lives behind it.
  const insideMore = MOBILE_MORE_ITEMS.some((item) => isNavItemActive(pathname, item))

  return (
    <nav
      aria-label="Primary"
      data-app-chrome="mobile-bottom-nav"
      // The height (border and safe area included) is the shell token that pages and sheets offset by.
      className="fixed inset-x-0 bottom-0 z-sidebar box-border flex h-[var(--app-bottom-nav-height)] border-t border-line bg-canvas-raised/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden print:hidden"
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item)
        const Icon = item.icon
        return (
          <Link key={item.path} to={item.path} aria-current={active ? "page" : undefined} className={cn(slot, active ? "font-semibold text-ink" : "font-medium text-ink-soft")}>
            <span className={cn(pill, active ? "bg-fill-strong" : "group-active:bg-fill")}>
              <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.9} aria-hidden="true" />
            </span>
            {item.label}
          </Link>
        )
      })}
      <button
        type="button"
        onClick={onOpenMore}
        aria-haspopup="dialog"
        aria-expanded={moreOpen}
        aria-label={insideMore ? "More, current section" : "More"}
        className={cn(slot, insideMore || moreOpen ? "font-semibold text-ink" : "font-medium text-ink-soft")}
      >
        <span className={cn(pill, insideMore || moreOpen ? "bg-fill-strong" : "group-active:bg-fill")}>
          <Ellipsis className="h-5 w-5" strokeWidth={insideMore || moreOpen ? 2.25 : 1.9} aria-hidden="true" />
        </span>
        More
      </button>
    </nav>
  )
}
