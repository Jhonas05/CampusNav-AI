import { Bell } from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { getAccountIdentity, getAdminNavSection, isNavItemActive, PRIMARY_NAV_SECTIONS } from "./navigation"
import { SidebarAccountButton, SidebarActionButton, SidebarCollapseButton, SidebarHeader, SidebarItem, SidebarSearchButton, SidebarSection } from "./SidebarParts"
import ThemeToggle from "@/components/theme/ThemeToggle"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const noop = () => {}
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

/**
 * Measures the active navigation link so one rounded highlight can glide
 * between items instead of each item switching its own background.
 */
const useActiveIndicator = (navRef, deps) => {
  const [box, setBox] = useState(null)
  useIsomorphicLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return undefined
    const measure = () => {
      const active = nav.querySelector('a[aria-current="page"]')
      if (!active) return setBox(null)
      const navRect = nav.getBoundingClientRect()
      const rect = active.getBoundingClientRect()
      setBox({ top: rect.top - navRect.top + nav.scrollTop, left: rect.left - navRect.left, width: rect.width, height: rect.height })
    }
    measure()
    if (typeof ResizeObserver === "undefined") return undefined
    const observer = new ResizeObserver(measure)
    observer.observe(nav)
    return () => observer.disconnect()
  }, deps)
  return box
}

/**
 * Sidebar navigation content, shared by the desktop/tablet rail and the
 * mobile drawer. It renders no top bar and no CLARA entry.
 * @param {Record<string, any>} props
 */
export function SidebarNavigation(props) {
  const { collapsed = false, onNavigate = noop, onSearch = noop, onToggleNotifications = noop, onToggleProfile = noop, onToggleCollapse = null, onClose = null, unread = 0, openPanel = null } = props
  const location = useLocation()
  const auth = useAuth()
  const developerMode = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MAP_VERIFICATION === "true"
  const adminSection = getAdminNavSection(auth, { developerMode })
  const sections = adminSection ? [...PRIMARY_NAV_SECTIONS, adminSection] : PRIMARY_NAV_SECTIONS
  const identity = getAccountIdentity(auth)
  const navRef = useRef(null)
  const indicator = useActiveIndicator(navRef, [location.pathname, collapsed, sections.length])

  return (
    <TooltipProvider delayDuration={150} skipDelayDuration={300}>
      <div className="flex h-full min-h-0 flex-col">
        <SidebarHeader collapsed={collapsed} onNavigate={onNavigate} onClose={onClose} />

        <div className="shrink-0 px-3 pb-3">
          <SidebarSearchButton collapsed={collapsed} onClick={onSearch} />
        </div>

        <nav ref={navRef} aria-label="Primary" className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 pt-1">
          {indicator && (
            <span
              aria-hidden="true"
              className="sidebar-indicator pointer-events-none absolute left-0 top-0 rounded-xl bg-fill-strong motion-reduce:transition-none"
              style={{ width: indicator.width, height: indicator.height, transform: `translate3d(${indicator.left}px, ${indicator.top}px, 0)` }}
            />
          )}
          {sections.map((section) => (
            <SidebarSection key={section.id} label={section.label} collapsed={collapsed}>
              {section.items.map((item) => (
                <SidebarItem key={item.path} item={item} collapsed={collapsed} active={isNavItemActive(location.pathname, item)} indicator={Boolean(indicator)} onNavigate={onNavigate} />
              ))}
            </SidebarSection>
          ))}
        </nav>

        <div className="shrink-0 space-y-0.5 border-t border-line p-3">
          <div className={collapsed ? "pb-0.5" : "pb-2"}>
            {!collapsed && <p className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-faint">Appearance</p>}
            <ThemeToggle compact={collapsed} />
          </div>
          <SidebarActionButton
            icon={Bell}
            label="Notifications"
            collapsed={collapsed}
            badge={unread > 0 ? (unread > 9 ? "9+" : unread) : null}
            badgeLabel={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
            expanded={openPanel === "notifications"}
            toggleId="notifications"
            onClick={onToggleNotifications}
          />
          {onToggleCollapse && <SidebarCollapseButton collapsed={collapsed} onToggle={onToggleCollapse} />}
          <SidebarAccountButton identity={identity} collapsed={collapsed} expanded={openPanel === "profile"} onClick={onToggleProfile} />
        </div>
      </div>
    </TooltipProvider>
  )
}

/**
 * Desktop/tablet rail: sticky, full height, collapsible to icons.
 * Hidden below 768px, where MobileSidebarDrawer takes over.
 * @param {Record<string, any>} props
 */
export default function Sidebar(props) {
  const { collapsed = false, className, ...rest } = props
  return (
    <aside
      id="campusnav-sidebar"
      aria-label="CampusNav navigation"
      data-collapsed={collapsed || undefined}
      className={cn(
        "sticky top-0 z-sidebar hidden h-dvh shrink-0 border-r border-line bg-canvas-raised transition-[width] duration-200 ease-out motion-reduce:transition-none md:block print:hidden",
        collapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width-expanded)]",
        className
      )}
    >
      <SidebarNavigation collapsed={collapsed} {...rest} />
    </aside>
  )
}
