import { Bell, Building2, CalendarDays, House, LayoutDashboard, Navigation, QrCode, Settings, ShieldAlert } from "lucide-react"
import { APP_ROLES } from "@/lib/authorization"

/**
 * Global navigation model for the left sidebar and the mobile drawer.
 * Paths are the existing application routes; only labels and grouping are
 * presentation. CLARA is intentionally absent: it is the floating assistant.
 */

export const PRIMARY_NAV_SECTIONS = [
  {
    id: "main",
    label: "Main",
    items: [
      { label: "Home", path: "/", icon: House, exact: true, motion: "lift" },
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, motion: "grow" },
      { label: "Navigate", path: "/map", icon: Navigation, motion: "forward" },
      { label: "Facilities", path: "/facilities", icon: Building2, motion: "lift" },
    ],
  },
  {
    id: "campus",
    label: "Campus",
    items: [
      { label: "Events", path: "/events", icon: CalendarDays, motion: "grow" },
      { label: "Alerts", path: "/alerts", icon: Bell, description: "Alerts & Announcements", motion: "tilt" },
      { label: "Emergency", path: "/emergency", icon: ShieldAlert, motion: "strong" },
    ],
  },
]

const ADMIN_ROLES = [APP_ROLES.SUPER_ADMIN, APP_ROLES.DEPARTMENT_ADMIN]

/**
 * Role-aware admin section. Returns null for guests and non-admin accounts so
 * nothing admin-related is rendered for them. This is presentation only;
 * `ProtectedRoute` and database RLS remain the authorization boundary.
 * @param {{ hasRole: (role: string) => boolean, hasAnyRole: (roles: string[]) => boolean }} auth
 * @param {{ developerMode?: boolean }} [options]
 */
export const getAdminNavSection = (auth, options = {}) => {
  if (!auth.hasAnyRole(ADMIN_ROLES)) return null
  const superAdmin = auth.hasRole(APP_ROLES.SUPER_ADMIN)
  /** @type {Array<Record<string, any>>} */
  const items = [
    { label: "Admin", path: superAdmin ? "/admin" : "/admin/personnel", icon: Settings, activePrefix: "/admin", excludePrefix: "/admin/qr-checkpoints", description: "Admin CMS" },
  ]
  if (superAdmin && options.developerMode) {
    items.push({ label: "QR Checkpoints", path: "/admin/qr-checkpoints", icon: QrCode, description: "Developer-only checkpoint tools" })
  }
  return { id: "admin", label: "Admin", items }
}

/** True for the Admin CMS (`/admin` and everything beneath it). */
export const isAdminPath = (pathname) => pathname === "/admin" || pathname.startsWith("/admin/")

/**
 * Whether the Admin navigation replaces the global navigation. Inside
 * `/admin/*` a signed-in administrator gets one navigation only, the Admin
 * one; the global sidebar, rail, and drawer are not rendered beside it.
 * Everyone else on an Admin URL (redirected to sign-in or shown "Access
 * denied") keeps the public shell. Presentation only: `ProtectedRoute` and
 * database RLS remain the authorization boundary.
 * @param {string} pathname
 * @param {{ hasAnyRole: (roles: string[]) => boolean }} auth
 */
export const usesAdminShell = (pathname, auth) => isAdminPath(pathname) && auth.hasAnyRole(ADMIN_ROLES)

/**
 * Whether the global sidebar is the icon rail: a remembered choice for the
 * current width class wins; otherwise it is expanded on wide screens and the
 * rail below that.
 * @param {{ wide: boolean, prefs?: Record<string, any> }} state
 */
export const resolveSidebarCollapsed = ({ wide, prefs = {} }) => {
  const remembered = prefs[wide ? "wide" : "compact"]
  return typeof remembered === "boolean" ? remembered : !wide
}

export const isNavItemActive = (pathname, item) => {
  if (item.excludePrefix && pathname.startsWith(item.excludePrefix)) return false
  if (item.exact) return pathname === item.path
  const prefix = item.activePrefix || item.path
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

const ROLE_LABELS = {
  [APP_ROLES.SUPER_ADMIN]: "Super Admin",
  [APP_ROLES.DEPARTMENT_ADMIN]: "Department Admin",
  [APP_ROLES.FACILITY_MANAGER]: "Facility Manager",
  [APP_ROLES.FACULTY]: "Faculty",
  [APP_ROLES.STAFF]: "Staff",
  [APP_ROLES.STUDENT]: "Student",
  [APP_ROLES.PARENT]: "Parent",
}

const ROLE_ORDER = Object.keys(ROLE_LABELS)

/** Display identity for the sidebar account area, from existing auth state only. */
export const getAccountIdentity = (auth) => {
  if (!auth.isAuthenticated) return { name: "Guest", role: "Browsing without an account", initials: null }
  const name = auth.profile?.display_name || auth.user?.email || "Signed in"
  const codes = (auth.roles || []).map((role) => (typeof role === "string" ? role : role?.code)).filter(Boolean)
  const primary = ROLE_ORDER.find((code) => codes.includes(code))
  const initials = name.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")
  return { name, role: primary ? ROLE_LABELS[primary] : "Signed in", initials: initials || null }
}
