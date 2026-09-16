import { Bell, Search, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import GlobalSearch from "./GlobalSearch"
import NotificationPanel, { getUnseenNotificationCount } from "./NotificationPanel"
import ProfileMenu from "./ProfileMenu"
import SchoolLogo from "@/components/campus/SchoolLogo"
import { focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Facilities", path: "/facilities" },
  { label: "CLARA", path: "/clara" },
  { label: "Navigate", path: "/map" },
  { label: "Events", path: "/events" },
  { label: "Emergency", path: "/emergency" },
]

const isActivePath = (pathname, path) => (path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`))

const iconButtonClass = cn(
  "relative flex h-10 w-10 items-center justify-center rounded border border-transparent text-[#1D1F20] transition-colors duration-200 hover:border-[#D4D4D7] hover:bg-white",
  focusRing
)

export default function Navbar() {
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [openPanel, setOpenPanel] = useState(null)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    setSearchOpen(false)
    setOpenPanel(null)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (openPanel !== "notifications") setUnread(getUnseenNotificationCount())
  }, [location.pathname, openPanel])

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpenPanel(null)
        setSearchOpen((current) => !current)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const togglePanel = (panel) => setOpenPanel((current) => (current === panel ? null : panel))

  return (
    <header className="sticky top-0 z-50 border-b border-[#98989B]/70 bg-[#F2F2F3]/95 backdrop-blur-xl">
      <div className="relative mx-auto flex h-[var(--app-header-height)] max-w-[var(--app-max-width)] items-center justify-between gap-3 px-[var(--app-page-gutter)]">
        <Link to="/" className={cn("flex min-w-0 items-center gap-2.5 rounded-lg", focusRing)} aria-label="CampusNav home">
          <SchoolLogo size="sm" />
          <span className="flex min-w-0 flex-col justify-center leading-none">
            <span className="hidden truncate font-heading text-[10px] font-bold uppercase tracking-[0.14em] text-[#5D5D60] min-[480px]:block">St. Clare College of Caloocan</span>
            <span className="truncate font-display text-[19px] font-extrabold uppercase leading-none tracking-[0.03em] text-brand-800 min-[480px]:mt-1">CampusNav</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-4 xl:gap-6 lg:flex">
          {navItems.map((item) => {
            const active = isActivePath(location.pathname, item.path)
            return (
              <Link
                key={item.label}
                to={item.path}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded py-1 font-heading text-[14px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200",
                  active ? "font-semibold text-brand-700" : "text-[#6E6E73] hover:text-[#1D1D1F]",
                  focusRing
                )}
              >
                {item.label}
                {active && <span aria-hidden="true" className="absolute -bottom-[5px] inset-x-0 h-[2px] bg-brand-700" />}
              </Link>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => { setOpenPanel(null); setSearchOpen(true) }}
            className={cn(iconButtonClass, "w-auto gap-2 px-3 xl:pr-2")}
            aria-label="Search CampusNav"
          >
            <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="hidden text-[13px] text-[#6E6E73] xl:block">Search</span>
            <kbd className="hidden rounded border border-[#D4D4D7] bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#5D5D60] xl:block">⌘K</kbd>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => togglePanel("notifications")}
              aria-expanded={openPanel === "notifications"}
              aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
              className={iconButtonClass}
            >
              <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
              {unread > 0 && (
                <span aria-hidden="true" className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-red-600 px-0.5 text-[9px] font-bold leading-none text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            <NotificationPanel open={openPanel === "notifications"} onClose={() => setOpenPanel(null)} />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => togglePanel("profile")}
              aria-expanded={openPanel === "profile"}
              aria-label="Account menu"
              className={iconButtonClass}
            >
              <UserRound className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
            <ProfileMenu open={openPanel === "profile"} onClose={() => setOpenPanel(null)} />
          </div>
        </div>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
