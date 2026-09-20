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
  Map as MapIcon,
  Megaphone,
  Navigation,
  QrCode,
  ShieldAlert,
  UserRound,
  Users,
} from "lucide-react"
import { APP_ROLES } from "@/lib/authorization"

/**
 * Single source of truth for CampusNav navigation chrome.
 *
 * Every entry points at a route that already exists in `src/App.jsx`; the
 * redesign moves navigation from the old top bar into the left sidebar
 * without introducing new pages. Sections that the system does not yet
 * implement are intentionally absent rather than stubbed.
 */

export const isActivePath = (pathname, path, exact = false) => {
  if (exact) return pathname === path
  return pathname === path || pathname.startsWith(`${path}/`)
}

/**
 * Primary information architecture.
 *
 * `Schedules` and `Personnel` are not separate pages — the authorized
 * schedule and personnel-availability surfaces live inside the Dashboard, so
 * both deep-link into the existing Dashboard sections instead of duplicating
 * them.
 */
export const PRIMARY_NAV = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutGrid,
    exact: true,
    description: "Campus overview and status",
  },
  {
    id: "navigate",
    label: "Navigate",
    path: "/map",
    icon: Navigation,
    description: "2D and 3D indoor routing",
  },
  {
    id: "facilities",
    label: "Facilities",
    path: "/facilities",
    icon: Building2,
    description: "Offices, rooms, and laboratories",
  },
  {
    id: "schedules",
    label: "Schedules",
    path: "/dashboard",
    hash: "#todays-classes",
    icon: CalendarClock,
    description: "Today's published class schedule",
  },
  {
    id: "personnel",
    label: "Personnel",
    path: "/dashboard",
    hash: "#personnel-availability",
    icon: Users,
    description: "Schedule-based availability",
  },
  {
    id: "events",
    label: "Events",
    path: "/events",
    icon: CalendarDays,
    description: "Campus calendar",
  },
  {
    id: "emergency",
    label: "Emergency",
    path: "/emergency",
    icon: ShieldAlert,
    emphasis: true,
    description: "Verified safety information",
  },
]

const SUPER_ADMIN_ONLY = [APP_ROLES.SUPER_ADMIN]
const ACADEMIC_ADMIN = [APP_ROLES.DEPARTMENT_ADMIN, APP_ROLES.SUPER_ADMIN]

/**
 * Administration. Mirrors the routes registered in `src/App.jsx`, including
 * their `ProtectedRoute` role requirements, so the sidebar never advertises a
 * module the signed-in user is not authorized to open.
 */
export const ADMIN_NAV_GROUPS = [
  {
    id: "admin-overview",
    label: "Overview",
    items: [
      { id: "admin-home", label: "Admin Dashboard", path: "/admin", icon: LayoutGrid, exact: true, roles: SUPER_ADMIN_ONLY },
    ],
  },
  {
    id: "admin-content",
    label: "Content",
    items: [
      { id: "admin-announcements", label: "Announcements", path: "/admin/announcements", icon: Megaphone, roles: SUPER_ADMIN_ONLY },
      { id: "admin-events", label: "Events", path: "/admin/events", icon: CalendarDays, roles: SUPER_ADMIN_ONLY },
      { id: "admin-advisories", label: "Facility Advisories", path: "/admin/facility-advisories", icon: Building2, roles: SUPER_ADMIN_ONLY },
      { id: "admin-notifications", label: "Notifications", path: "/admin/notifications", icon: Bell, roles: SUPER_ADMIN_ONLY },
    ],
  },
  {
    id: "admin-academic",
    label: "Academic",
    items: [
      { id: "admin-personnel", label: "Personnel", path: "/admin/personnel", icon: UserRound, roles: ACADEMIC_ADMIN },
      { id: "admin-courses", label: "Courses", path: "/admin/courses", icon: GraduationCap, roles: ACADEMIC_ADMIN },
      { id: "admin-sections", label: "Sections", path: "/admin/sections", icon: Users, roles: ACADEMIC_ADMIN },
      { id: "admin-class-schedules", label: "Class Schedules", path: "/admin/class-schedules", icon: CalendarClock, roles: ACADEMIC_ADMIN },
      { id: "admin-schedule-exceptions", label: "Schedule Exceptions", path: "/admin/schedule-exceptions", icon: CalendarX2, roles: ACADEMIC_ADMIN },
      { id: "admin-assignments", label: "Personnel Assignments", path: "/admin/personnel-assignments", icon: MapIcon, roles: ACADEMIC_ADMIN },
      { id: "admin-consultation", label: "Consultation Hours", path: "/admin/consultation-hours", icon: Clock3, roles: ACADEMIC_ADMIN },
      { id: "admin-check-ins", label: "Check-ins", path: "/admin/check-ins", icon: CheckCircle2, roles: ACADEMIC_ADMIN },
      { id: "admin-availability", label: "Availability Overrides", path: "/admin/personnel-availability", icon: ShieldAlert, roles: ACADEMIC_ADMIN },
    ],
  },
  {
    id: "admin-system",
    label: "System",
    items: [
      { id: "admin-audit", label: "Audit Logs", path: "/admin/audit", icon: ClipboardList, roles: SUPER_ADMIN_ONLY },
      { id: "admin-qr", label: "QR Checkpoints", path: "/admin/qr-checkpoints", icon: QrCode, roles: SUPER_ADMIN_ONLY, developerOnly: true },
    ],
  },
]

export const developerToolsAvailable = () =>
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_MAP_VERIFICATION === "true"

/**
 * Filters the administration tree down to what `auth` may actually open.
 * Returns an empty array for unauthorized or signed-out users, so the
 * ADMINISTRATION section is never rendered for them.
 */
export const getAuthorizedAdminGroups = (auth) => {
  if (!auth?.isAuthenticated) return []
  const developerMode = developerToolsAvailable()
  return ADMIN_NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.developerOnly && !developerMode) return false
        return auth.hasAnyRole(item.roles)
      }),
    }))
    .filter((group) => group.items.length > 0)
}
