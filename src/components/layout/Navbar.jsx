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
  { label: "Emergency", path: "/emergency" },
]

const isActivePath = (pathname, path) => (path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`))

const iconButtonClass = cn(
  "relative flex h-10 w-10 items-center justify-center rounded-full text-[#1D1D1F] transition-colors duration-200 hover:bg-[#F5F5F7]",
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
    <header className="sticky top-0 z-50 border-b border-[#E5E5E7]/80 bg-white/85 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className={cn("flex min-w-0 items-center gap-2.5 rounded-lg", focusRing)} aria-label="CampusNav home">
          <SchoolLogo size="sm" />
          <span className="flex min-w-0 flex-col justify-center leading-none">
            <span className="hidden truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-[#86868B] min-[480px]:block sm:text-[10px]">St. Clare College of Caloocan</span>
            <span className="truncate text-[16px] font-semibold tracking-tight text-brand-800 min-[480px]:mt-1">CampusNav</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex">
          {navItems.map((item) => {
            const active = isActivePath(location.pathname, item.path)
            return (
              <Link
                key={item.label}
                to={item.path}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md py-1 text-[13px] transition-colors duration-200",
                  active ? "font-semibold text-brand-700" : "text-[#6E6E73] hover:text-[#1D1D1F]",
                  focusRing
                )}
              >
                {item.label}
                {active && <span aria-hidden="true" className="absolute -bottom-[3px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-700" />}
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
            <kbd className="hidden rounded-md border border-[#D2D2D7] bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#86868B] xl:block">⌘K</kbd>
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
