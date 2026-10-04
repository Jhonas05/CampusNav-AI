import { ArrowLeft, Bell, Menu, X } from "lucide-react"
import { useEffect, useLayoutEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import { ADMIN_COMING_LATER, NAV_GROUPS } from "@/components/admin/AdminShell"
import SchoolLogo from "@/components/campus/SchoolLogo"
import { focusRing } from "@/components/campus/ui"
import { getAccountIdentity, isNavItemActive } from "@/components/layout/sidebar/navigation"
import { SidebarAccountButton, SidebarActionButton } from "@/components/layout/sidebar/SidebarParts"
import ThemeToggle from "@/components/theme/ThemeToggle"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

// Where "Back to CampusNav" leads: the public application's main information page.
const APP_RETURN_PATH = "/dashboard"

const noop = () => {}
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect
const groupLabelClass = "px-3 pb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-ink-faint"

/**
 * The Admin navigation: Admin identity, the way back to the public app, the
 * Admin sections, and the appearance, notification, and account controls.
 * Inside `/admin/*` it is the only navigation (the global sidebar is not
 * rendered there), as the desktop sidebar or inside the Admin menu drawer.
 * @param {Record<string, any>} props
 */
export function AdminNavigation(props) {
  const { onNavigate = noop, onClose = null, showBack = true, onToggleNotifications = noop, onToggleProfile = noop, unread = 0, openPanel = null } = props
  const location = useLocation()
  const auth = useAuth()
  const navRef = useRef(/** @type {HTMLElement | null} */ (null))
  const isSuperAdmin = !auth.isAuthenticated || auth.roles?.some((role) => role.code === "SUPER_ADMIN")
  const developerModeAvailable = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MAP_VERIFICATION === "true"
  const groups = NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => (!item.developerOnly || developerModeAvailable) && (!item.superAdminOnly || isSuperAdmin)),
    }))
    .filter((group) => group.items.length > 0)

  // Keep the current section in view when the list is taller than the viewport.
  useIsomorphicLayoutEffect(() => {
    const nav = navRef.current
    if (!nav || nav.scrollHeight <= nav.clientHeight) return
    const active = nav.querySelector('a[aria-current="page"]')
    if (!active) return
    const navBox = nav.getBoundingClientRect()
    const box = active.getBoundingClientRect()
    if (box.top < navBox.top + 8) nav.scrollTop -= navBox.top + 8 - box.top
    else if (box.bottom > navBox.bottom - 8) nav.scrollTop += box.bottom - navBox.bottom + 8
  }, [location.pathname])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 pl-4 pr-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <SchoolLogo size="sm" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[15px] font-semibold tracking-[-0.015em] text-ink">CampusNav Admin</p>
            <p className="truncate text-[11px] text-ink-faint">St. Clare College of Caloocan</p>
          </div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close Admin menu" className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-fill hover:text-ink", focusRing)}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {showBack && (
        <div className="shrink-0 px-3 pb-3">
          <Link to={APP_RETURN_PATH} onClick={onNavigate} className={cn("flex min-h-11 items-center gap-2 rounded-xl border border-line px-3 text-[13px] font-medium text-ink-mid transition-colors duration-150 hover:border-line-strong hover:bg-fill hover:text-ink", focusRing)}>
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" /> Back to CampusNav
          </Link>
        </div>
      )}

      <nav ref={navRef} aria-label="Admin navigation" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
        {groups.map((group) => (
          <div key={group.label} className="pt-3 first:pt-1">
            <p className={groupLabelClass}>{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map(({ label, icon: Icon, ...item }) => {
                const active = isNavItemActive(location.pathname, item)
                return (
                  <li key={label}>
                    <Link
                      to={item.path}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors duration-150 lg:min-h-10",
                        active ? "bg-brand-700 text-on-ink" : "text-ink-mid hover:bg-brand-50 hover:text-brand-800",
                        focusRing
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
        <div className="pt-4">
          <p className={groupLabelClass}>Coming later</p>
          <p className="px-3 text-[11px] leading-relaxed text-ink-soft">{ADMIN_COMING_LATER.join(" · ")}</p>
        </div>
      </nav>

      <div className="shrink-0 space-y-0.5 border-t border-line p-3">
        <div className="pb-2">
          <p className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-faint">Appearance</p>
          <ThemeToggle />
        </div>
        <SidebarActionButton
          icon={Bell}
          label="Notifications"
          collapsed={false}
          badge={unread > 0 ? (unread > 9 ? "9+" : unread) : null}
          badgeLabel={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
          expanded={openPanel === "notifications"}
          toggleId="notifications"
          onClick={onToggleNotifications}
        />
        <SidebarAccountButton identity={getAccountIdentity(auth)} collapsed={false} expanded={openPanel === "profile"} onClick={onToggleProfile} />
      </div>
    </div>
  )
}

/**
 * Desktop Admin sidebar (from 1024px): sticky, full height, at the viewport's
 * left edge, in the slot the global sidebar uses on public pages.
 * @param {Record<string, any>} props
 */
export function AdminSidebar(props) {
  return (
    <aside
      id="campusnav-admin-sidebar"
      aria-label="CampusNav Admin"
      className="sticky top-0 z-sidebar hidden h-dvh w-[var(--sidebar-width-expanded)] shrink-0 border-r border-line bg-canvas-raised lg:block print:hidden"
    >
      <AdminNavigation {...props} />
    </aside>
  )
}

/**
 * Admin context bar below 1024px: the one Admin menu button and the way back
 * to the public app. The sections themselves open in the Admin menu drawer.
 * @param {Record<string, any>} props
 */
export function AdminTopBar(props) {
  const { menuOpen, onOpenMenu } = props
  return (
    <header data-app-chrome="admin-top-bar" className="sticky top-0 z-sticky flex h-[var(--app-header-height)] items-center gap-2 border-b border-line bg-canvas-raised/90 px-2 backdrop-blur-xl lg:hidden print:hidden">
      <button type="button" onClick={onOpenMenu} aria-label="Open Admin menu" aria-haspopup="dialog" aria-expanded={menuOpen} className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-fill-strong", focusRing)}>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <p className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.015em] text-ink">CampusNav Admin</p>
      <Link to={APP_RETURN_PATH} className={cn("inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 text-xs font-semibold text-ink transition-colors duration-150 hover:bg-fill", focusRing)}>
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to CampusNav
      </Link>
    </header>
  )
}
