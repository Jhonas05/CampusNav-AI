import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import SidebarItem from "./SidebarItem"
import SidebarSection from "./SidebarSection"
import UserProfileCard from "./UserProfileCard"
import { getAuthorizedAdminGroups, isActivePath, PRIMARY_NAV } from "./navigationConfig"
import SchoolLogo from "@/components/campus/SchoolLogo"
import { TooltipProvider } from "@/components/ui/tooltip"
import { focusRing } from "@/components/campus/ui"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

/** Dashboard anchors used by the Schedules and Personnel sidebar entries. */
const DASHBOARD_ANCHORS = PRIMARY_NAV.filter((item) => item.hash).map((item) => item.hash)

const resolveActive = (item, location) => {
  if (item.hash) return location.pathname === item.path && location.hash === item.hash
  if (item.exact) return location.pathname === item.path && !DASHBOARD_ANCHORS.includes(location.hash)
  return isActivePath(location.pathname, item.path)
}

/**
 * CampusNav application sidebar.
 *
 * Rendered twice with different chrome: as the fixed desktop rail and inside
 * the mobile navigation drawer. The drawer instance is never collapsed, so
 * `collapsed` is honoured only in the desktop variant.
 */
export default function Sidebar({
  collapsed = false,
  onToggleCollapse = null,
  onNavigate = null,
  variant = "desktop",
}) {
  const location = useLocation()
  const auth = useAuth()
  const [adminOpen, setAdminOpen] = useState(true)

  const adminGroups = useMemo(() => getAuthorizedAdminGroups(auth), [auth])
  const isCollapsed = variant === "desktop" && collapsed

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 flex-col bg-white">
        {/* Branding */}
        <div
          className={cn(
            "flex items-center gap-2.5 border-b border-[#E3E3E6]",
            isCollapsed ? "justify-center px-2 py-4" : "px-4 py-4",
            // Leaves room for the drawer's close control.
            variant === "drawer" && "pr-16"
          )}
        >
          <Link
            to="/dashboard"
            onClick={onNavigate}
            aria-label="CampusNav dashboard"
            className={cn("flex min-w-0 items-center gap-2.5 rounded-lg", focusRing)}
          >
            <SchoolLogo size="sm" />
            {!isCollapsed && (
              <span className="flex min-w-0 flex-col justify-center leading-none">
                <span className="truncate font-display text-[19px] font-extrabold uppercase leading-none tracking-[0.03em] text-[#1D1D1F]">
                  CampusNav
                </span>
                <span className="mt-1 font-heading text-[9px] font-bold uppercase leading-[1.3] tracking-[0.1em] text-[#6E6E73]">
                  St. Clare College of Caloocan
                </span>
              </span>
            )}
          </Link>
          {onToggleCollapse && !isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              className={cn(
                "ml-auto hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#6E6E73] transition-colors duration-200 hover:bg-[#F0F0F2] hover:text-[#1D1D1F] lg:flex",
                focusRing
              )}
            >
              <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          )}
        </div>

        {onToggleCollapse && isCollapsed && (
          <div className="flex justify-center border-b border-[#E3E3E6] px-2 py-2">
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-[#6E6E73] transition-colors duration-200 hover:bg-[#F0F0F2] hover:text-[#1D1D1F]",
                focusRing
              )}
            >
              <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Destinations */}
        <nav
          aria-label="Primary"
          className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4", isCollapsed ? "px-2" : "px-3")}
        >
          <ul role="list" className="space-y-1 pt-3">
            {PRIMARY_NAV.map((item) => (
              <li key={item.id}>
                <SidebarItem
                  item={item}
                  active={resolveActive(item, location)}
                  collapsed={isCollapsed}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>

          {adminGroups.length > 0 && (
            <SidebarSection
              id="sidebar-administration"
              title="Administration"
              collapsed={isCollapsed}
              collapsible
              open={adminOpen}
              onToggle={() => setAdminOpen((current) => !current)}
            >
              {adminGroups.map((group) => (
                <li key={group.id}>
                  {!isCollapsed && (
                    <p className="px-3 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#AEAEB2]">
                      {group.label}
                    </p>
                  )}
                  <ul role="list" className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <SidebarItem
                          item={item}
                          active={resolveActive(item, location)}
                          collapsed={isCollapsed}
                          onNavigate={onNavigate}
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </SidebarSection>
          )}
        </nav>

        {/* Account */}
        <div className={cn("border-t border-[#E3E3E6]", isCollapsed ? "px-2 py-3" : "px-3 py-3")}>
          <UserProfileCard collapsed={isCollapsed} />
        </div>
      </div>
    </TooltipProvider>
  )
}
