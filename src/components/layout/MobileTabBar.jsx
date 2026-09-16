import { Bell, Building2, CalendarDays, ChevronRight, CircleEllipsis, House, LayoutGrid, LogIn, LogOut, Navigation, QrCode, ShieldAlert, Sparkles, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { focusRing } from "@/components/campus/ui"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "Home", path: "/", icon: House },
  { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
  { label: "Navigate", path: "/map", icon: Navigation },
  { label: "CLARA", path: "/clara", icon: Sparkles },
]

const moreLinks = [
  { label: "Facilities", detail: "Campus directory, GF–5F", path: "/facilities", icon: Building2 },
  { label: "Events", detail: "Today, upcoming, calendar", path: "/events", icon: CalendarDays },
  { label: "Alerts & Announcements", detail: "Official notices", path: "/alerts", icon: Bell },
]

const isActivePath = (pathname, path) => (path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`))

export default function MobileTabBar() {
  const location = useLocation()
  const auth = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)
  const developerModeAvailable = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MAP_VERIFICATION === "true"

  useEffect(() => setMoreOpen(false), [location.pathname])

  useEffect(() => {
    if (!moreOpen) return
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMoreOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [moreOpen])

  const moreActive = [...moreLinks.map((link) => link.path), "/emergency", "/login"].some((path) => isActivePath(location.pathname, path))

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-[55] bg-[#1D1D1F]/40 backdrop-blur-sm lg:hidden" role="presentation" onMouseDown={() => setMoreOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="More options"
            onMouseDown={(event) => event.stopPropagation()}
            className="absolute inset-x-0 bottom-0 rounded-t-[7px] border-t border-[#98989B] bg-[#F2F2F3] pb-[calc(76px+env(safe-area-inset-bottom))] shadow-[0_-18px_42px_rgba(29,31,32,0.16)]"
          >
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#D2D2D7]" aria-hidden="true" />
            <div className="flex items-center justify-between px-6 pb-2 pt-4">
              <h2 className="font-display text-2xl font-bold uppercase tracking-[0.04em] text-[#1D1F20]">More</h2>
              <button type="button" onClick={() => setMoreOpen(false)} aria-label="Close menu" className={cn("flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] text-[#1D1D1F]", focusRing)}>
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="px-4 pb-2">
              <Link
                to="/emergency"
                className={cn("flex items-center gap-4 rounded-2xl border-[1.5px] border-red-700 bg-white p-4 transition-colors hover:bg-red-50", focusRing)}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-700 text-white">
                  <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-[#1D1D1F]">Emergency</span>
                  <span className="block text-xs text-[#6E6E73]">Verified safety information and exits</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#86868B]" aria-hidden="true" />
              </Link>

              <ul className="mt-2">
                {moreLinks.map(({ label, detail, path, icon: Icon }) => (
                  <li key={path}>
                    <Link to={path} className={cn("flex items-center gap-4 rounded-2xl p-3.5 transition-colors hover:bg-[#F5F5F7]", focusRing)}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E5E7] bg-white text-[#1D1D1F]">
                        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-[#1D1D1F]">{label}</span>
                        <span className="block text-xs text-[#86868B]">{detail}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#D2D2D7]" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
                {developerModeAvailable && (
                  <li>
                    <Link to="/admin/qr-checkpoints" className={cn("flex items-center gap-4 rounded-2xl p-3.5 transition-colors hover:bg-[#F5F5F7]", focusRing)}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E5E7] bg-white text-[#1D1D1F]">
                        <QrCode className="h-[18px] w-[18px]" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-[#1D1D1F]">QR Checkpoints</span>
                        <span className="block text-xs text-[#86868B]">Developer-only admin tools</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#D2D2D7]" aria-hidden="true" />
                    </Link>
                  </li>
                )}
                <li className="mt-1 border-t border-[#E5E5E7] pt-1">
                  {auth.isAuthenticated ? (
                    <button type="button" disabled={auth.loading} onClick={() => { auth.signOut(); setMoreOpen(false) }} className={cn("flex w-full items-center gap-4 rounded-2xl p-3.5 text-left transition-colors hover:bg-[#F5F5F7] disabled:opacity-50", focusRing)}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E5E7] bg-white text-[#1D1D1F]"><LogOut className="h-[18px] w-[18px]" aria-hidden="true" /></span>
                      <span className="text-sm font-medium text-[#1D1D1F]">Sign Out</span>
                    </button>
                  ) : (
                    <Link to="/login" className={cn("flex items-center gap-4 rounded-2xl p-3.5 transition-colors hover:bg-[#F5F5F7]", focusRing)}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E5E7] bg-white text-[#1D1D1F]"><LogIn className="h-[18px] w-[18px]" aria-hidden="true" /></span>
                      <span className="text-sm font-medium text-[#1D1D1F]">Sign In</span>
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-[56] border-t border-[#98989B] bg-[#F2F2F3]/96 backdrop-blur-xl lg:hidden print:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid h-[64px] grid-cols-5">
          {tabs.map(({ label, path, icon: Icon }) => {
            const active = isActivePath(location.pathname, path) && !moreOpen
            return (
              <Link
                key={path}
                to={path}
                aria-current={active ? "page" : undefined}
                className={cn("flex flex-col items-center justify-center gap-1 rounded font-heading text-[11px] font-semibold uppercase tracking-[0.04em] transition-colors duration-150", active ? "bg-brand-50 text-brand-700" : "text-[#5D5D60]", focusRing)}
              >
                <Icon className="h-[21px] w-[21px]" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                {label}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((current) => !current)}
            aria-expanded={moreOpen}
            className={cn("flex flex-col items-center justify-center gap-1 rounded font-heading text-[11px] font-semibold uppercase tracking-[0.04em] transition-colors duration-150", moreOpen || moreActive ? "bg-brand-50 text-brand-700" : "text-[#5D5D60]", focusRing)}
          >
            <CircleEllipsis className="h-[21px] w-[21px]" strokeWidth={moreOpen || moreActive ? 2.4 : 2} aria-hidden="true" />
            More
          </button>
        </div>
      </nav>
    </>
  )
}
