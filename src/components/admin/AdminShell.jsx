import {
  Bell,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  KeySquare,
  LayoutGrid,
  Map,
  Megaphone,
  QrCode,
  Settings,
  ShieldAlert,
  UserRound,
  Users,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import SchoolLogo from "@/components/campus/SchoolLogo"
import { focusRing } from "@/components/campus/ui"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const NAV_GROUPS = [
  { label: "Overview", items: [{ label: "Overview", icon: LayoutGrid, path: "/admin", exact: true }] },
  {
    label: "Content",
    items: [
      { label: "Announcements", icon: Megaphone, path: "/admin/announcements" },
      { label: "Events", icon: CalendarDays, path: "/admin/events" },
      { label: "Facility Advisories", icon: Building2, path: "/admin/facility-advisories" },
      { label: "Notifications", icon: Bell, path: "/admin/notifications" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Audit Activity", icon: ClipboardList, path: "/admin/audit" },
      { label: "QR Checkpoints", icon: QrCode, path: "/admin/qr-checkpoints", developerOnly: true },
    ],
  },
  {
    label: "Coming later",
    items: [
      { label: "Facilities", icon: Building2 },
      { label: "Personnel", icon: UserRound },
      { label: "Schedules", icon: CalendarClock },
      { label: "Map Management", icon: Map },
      { label: "Users", icon: Users },
      { label: "Roles", icon: KeySquare },
      { label: "Emergency Settings", icon: ShieldAlert },
      { label: "Settings", icon: Settings },
    ],
  },
]

export default function AdminShell({ children }) {
  const location = useLocation()
  const auth = useAuth()
  const developerModeAvailable = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MAP_VERIFICATION === "true"

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F5F5F7]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:py-10">
        <aside aria-label="Admin navigation" className="lg:w-64 lg:shrink-0">
          <div className="rounded-[1.5rem] border border-[#E5E5E7] bg-white p-3 lg:sticky lg:top-24">
            <div className="flex items-center gap-2.5 px-3 pb-3 pt-2">
              <SchoolLogo size="sm" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#86868B]">St. Clare College</p>
                <p className="text-[13px] font-semibold tracking-tight text-[#1D1D1F]">CampusNav Admin</p>
              </div>
            </div>

            <div className="mb-3 rounded-2xl bg-[#F5F5F7] px-3 py-3">
              <p className="truncate text-xs font-semibold text-[#1D1D1F]">{auth.profile?.display_name || "CampusNav Administrator"}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#6E6E73]">SUPER_ADMIN</p>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="contents lg:block lg:pt-2">
                  <p className="hidden px-3 pb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#86868B] lg:block">{group.label}</p>
                  {group.items.map(({ label, icon: Icon, path, exact, developerOnly }) => {
                    if (developerOnly && !developerModeAvailable) return null
                    const active = path && (exact ? location.pathname === path : location.pathname.startsWith(path))
                    if (path) {
                      return (
                        <Link
                          key={label}
                          to={path}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "mb-1 flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors duration-150",
                            active ? "bg-[#1D1D1F] text-white" : "text-[#48484A] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]",
                            focusRing
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> {label}
                        </Link>
                      )
                    }
                    return (
                      <span key={label} aria-disabled="true" className="hidden items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#B8B8BD] lg:flex">
                        <span className="flex items-center gap-2.5"><Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> {label}</span>
                        <span className="text-[8px] font-bold uppercase tracking-wide">Later</span>
                      </span>
                    )
                  })}
                </div>
              ))}
            </nav>
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
