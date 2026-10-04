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
  LayoutGrid,
  Map,
  Megaphone,
  QrCode,
  ShieldAlert,
  Tags,
  UserRound,
  Users,
} from "lucide-react"

/** Admin sections: the registry the Admin navigation renders. Paths are the existing Admin routes. */
export const NAV_GROUPS = [
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
    label: "Facilities",
    items: [
      { label: "Facilities", icon: Building2, path: "/admin/facilities", superAdminOnly: true },
      { label: "Services", icon: Tags, path: "/admin/services", superAdminOnly: true },
      { label: "Service Aliases", icon: Tags, path: "/admin/service-aliases", superAdminOnly: true },
      { label: "Service Mappings", icon: Building2, path: "/admin/facility-service-mappings", superAdminOnly: true },
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
]

/** Planned Admin areas that have no route yet. They are listed, not linked. */
export const ADMIN_COMING_LATER = ["Map Management", "Users", "Roles", "Emergency Settings", "Settings"]

/**
 * Admin page frame: the work area beside the Admin sidebar. It renders no
 * navigation; `AppShell` renders the single Admin navigation
 * (`AdminNavigation.jsx`). The bottom padding keeps the last row clear of the
 * floating CLARA button, as on public pages.
 */
export default function AdminShell({ children }) {
  return (
    <div className="min-h-[calc(100dvh-var(--app-header-height))] bg-canvas">
      <div className="mx-auto max-w-[var(--app-max-width)] px-[var(--app-page-gutter)] pb-24 pt-5 lg:pt-6">{children}</div>
    </div>
  )
}
