import {
  Bell,
  Building2,
  CalendarClock,
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  GraduationCap,
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
  { label: "Overview", items: [{ label: "Overview", icon: LayoutGrid, path: "/admin", exact: true, superAdminOnly: true }] },
  {
    label: "Content",
    items: [
      { label: "Announcements", icon: Megaphone, path: "/admin/announcements", superAdminOnly: true },
      { label: "Events", icon: CalendarDays, path: "/admin/events", superAdminOnly: true },
      { label: "Facility Advisories", icon: Building2, path: "/admin/facility-advisories", superAdminOnly: true },
      { label: "Notifications", icon: Bell, path: "/admin/notifications", superAdminOnly: true },
    ],
  },
  {
    label: "Academic",
    items: [
      { label: "Personnel", icon: UserRound, path: "/admin/personnel" },
      { label: "Courses", icon: GraduationCap, path: "/admin/courses" },
      { label: "Sections", icon: Users, path: "/admin/sections" },
      { label: "Class Schedules", icon: CalendarClock, path: "/admin/class-schedules" },
      { label: "Schedule Exceptions", icon: CalendarX2, path: "/admin/schedule-exceptions" },
      { label: "Personnel Assignments", icon: Map, path: "/admin/personnel-assignments" },
      { label: "Consultation Hours", icon: Clock3, path: "/admin/consultation-hours" },
      { label: "Check-ins", icon: CheckCircle2, path: "/admin/check-ins" },
      { label: "Availability Overrides", icon: ShieldAlert, path: "/admin/personnel-availability" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Audit Activity", icon: ClipboardList, path: "/admin/audit", superAdminOnly: true },
      { label: "QR Checkpoints", icon: QrCode, path: "/admin/qr-checkpoints", developerOnly: true, superAdminOnly: true },
    ],
  },
  {
    label: "Coming later",
    items: [
      { label: "Facilities", icon: Building2 },
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
  const isSuperAdmin = !auth.isAuthenticated || auth.roles?.some((role) => role.code === "SUPER_ADMIN")
  const developerModeAvailable = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MAP_VERIFICATION === "true"

  return (
    <div className="min-h-[calc(100dvh-var(--app-header-height))] bg-[#F5F5F7]">
      <div className="mx-auto flex max-w-[var(--app-max-width)] flex-col gap-4 px-[var(--app-page-gutter)] py-5 lg:flex-row lg:py-6">
        <aside aria-label="Admin navigation" className="lg:w-[var(--app-admin-rail-width)] lg:shrink-0">
          <div className="ink-blueprint p-2.5 lg:sticky lg:top-[calc(var(--app-header-height)+1rem)] lg:max-h-[calc(100dvh-var(--app-header-height)-2rem)] lg:overflow-y-auto">
            <div className="flex items-center gap-2.5 px-3 pb-3 pt-2">
              <SchoolLogo size="sm" />
              <div>
                <p className="font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-[#5D5D60]">St. Clare College</p>
                <p className="font-display text-lg font-bold uppercase tracking-[0.04em] text-[#1D1F20]">CampusNav Admin</p>
              </div>
            </div>

            <div className="mb-2 rounded-2xl bg-[#F5F5F7] px-3 py-2.5">
              <p className="truncate text-xs font-semibold text-[#1D1D1F]">{auth.profile?.display_name || "CampusNav Administrator"}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#6E6E73]">{auth.roles?.map((role) => role.code).filter((code) => ["SUPER_ADMIN", "DEPARTMENT_ADMIN"].includes(code)).join(" · ") || "ADMIN"}</p>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="contents lg:block lg:pt-2">
                  <p className="hidden px-3 pb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#86868B] lg:block">{group.label}</p>
                  {group.items.map(({ label, icon: Icon, path, exact, developerOnly, superAdminOnly }) => {
                    if (developerOnly && !developerModeAvailable) return null
                    if (superAdminOnly && !isSuperAdmin) return null
                    const active = path && (exact ? location.pathname === path : location.pathname.startsWith(path))
                    if (path) {
                      return (
                        <Link
                          key={label}
                          to={path}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "mb-1 flex min-h-10 shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors duration-150",
                            active ? "bg-brand-700 text-white" : "text-[#48484A] hover:bg-brand-50 hover:text-brand-800",
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
