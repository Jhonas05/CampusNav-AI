import { PanelLeftClose, PanelLeftOpen, Search, UserRound, X } from "lucide-react"
import { Link } from "react-router-dom"
import SchoolLogo from "@/components/campus/SchoolLogo"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const ring = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1"

/** Shows a tooltip only while the sidebar is collapsed to icons. */
function CollapsedTooltip({ collapsed, label, children }) {
  if (!collapsed) return children
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10} className="z-overlay rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-on-ink">{label}</TooltipContent>
    </Tooltip>
  )
}

const rowClass = (collapsed, active = false, indicator = false) => cn(
  "group relative flex min-h-11 w-full items-center rounded-xl text-[14px] transition-colors duration-150 motion-reduce:transition-none",
  collapsed ? "justify-center px-0" : "gap-3 px-3",
  active ? cn("font-semibold text-ink", !indicator && "bg-fill-strong") : "font-medium text-ink-mid hover:bg-fill hover:text-ink",
  ring
)

/** @param {Record<string, any>} props */
export function SidebarHeader(props) {
  const { collapsed, onNavigate, onClose = null } = props
  return (
    <div className={cn("flex h-16 shrink-0 items-center", collapsed ? "justify-center px-2" : "justify-between gap-2 pl-4 pr-3")}>
      <Link to="/" onClick={onNavigate} aria-label="CampusNav home" className={cn("flex min-w-0 items-center gap-2.5 rounded-xl", collapsed && "h-11 w-11 justify-center", ring)}>
        <SchoolLogo size="sm" />
        {!collapsed && (
          <span className="sidebar-label min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-semibold tracking-[-0.015em] text-ink">CampusNav</span>
            <span className="block truncate text-[11px] text-ink-faint">St. Clare College of Caloocan</span>
          </span>
        )}
      </Link>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Close navigation menu" className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-fill hover:text-ink", ring)}>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

/** @param {Record<string, any>} props */
export function SidebarSearchButton(props) {
  const { collapsed, onClick } = props
  return (
    <CollapsedTooltip collapsed={collapsed} label="Search (Ctrl/⌘ K)">
      <button
        type="button"
        onClick={onClick}
        aria-label="Search CampusNav"
        aria-keyshortcuts="Control+K Meta+K"
        className={cn(
          "flex min-h-11 w-full items-center rounded-xl border border-line bg-fill text-[14px] text-ink-soft transition-colors duration-150 hover:border-line-strong hover:text-ink",
          collapsed ? "justify-center" : "gap-2.5 px-3",
          ring
        )}
      >
        <Search className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">Search</span>
            <kbd className="max-md:hidden rounded-md border border-line-strong bg-surface px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-soft">⌘K</kbd>
          </>
        )}
      </button>
    </CollapsedTooltip>
  )
}

/** @param {Record<string, any>} props */
export function SidebarSection(props) {
  const { label, collapsed, children } = props
  const headingId = `sidebar-section-${label.toLowerCase()}`
  return (
    <div role="group" aria-labelledby={headingId} className="mt-5 [&:first-of-type]:mt-0">
      <p id={headingId} className={cn("px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-faint", collapsed && "sr-only")}>{label}</p>
      {collapsed && <span aria-hidden="true" className="mx-auto mb-2 block h-px w-6 bg-line" />}
      <ul className="space-y-0.5">{children}</ul>
    </div>
  )
}

/** @param {Record<string, any>} props */
export function SidebarItem(props) {
  const { item, active, collapsed, onNavigate, indicator = false } = props
  const Icon = item.icon
  return (
    <li>
      <CollapsedTooltip collapsed={collapsed} label={item.description || item.label}>
        <Link
          to={item.path}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          aria-label={collapsed ? item.label : undefined}
          className={rowClass(collapsed, active, indicator)}
        >
          <Icon data-motion={item.motion} className={cn("nav-icon h-[18px] w-[18px] shrink-0", active ? "text-ink-strong" : "text-ink-soft group-hover:text-ink", item.motion === "strong" && "group-hover:[stroke-width:2.4]")} strokeWidth={active ? 2.25 : 1.9} aria-hidden="true" />
          {!collapsed && <span className="sidebar-label truncate">{item.label}</span>}
        </Link>
      </CollapsedTooltip>
    </li>
  )
}

/** @param {Record<string, any>} props */
export function SidebarActionButton(props) {
  const { icon: Icon, label, collapsed, badge = null, badgeLabel = null, expanded = false, onClick, toggleId = null } = props
  return (
    <CollapsedTooltip collapsed={collapsed} label={badgeLabel || label}>
      <button
        type="button"
        onClick={onClick}
        aria-expanded={expanded}
        aria-label={badgeLabel || label}
        data-shell-panel-toggle={toggleId || undefined}
        className={rowClass(collapsed, expanded)}
      >
        <Icon className="h-[18px] w-[18px] shrink-0 text-ink-soft group-hover:text-ink" strokeWidth={1.9} aria-hidden="true" />
        {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
        {badge != null && (
          <span aria-hidden="true" className={cn("flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[10px] font-semibold leading-none text-on-ink", collapsed && "absolute right-1.5 top-1 h-4 min-w-4 border-2 border-on-ink px-1 text-[9px]")}>
            {badge}
          </span>
        )}
      </button>
    </CollapsedTooltip>
  )
}

/** @param {Record<string, any>} props */
export function SidebarAccountButton(props) {
  const { identity, collapsed, expanded, onClick } = props
  return (
    <CollapsedTooltip collapsed={collapsed} label={`Account: ${identity.name}`}>
      <button
        type="button"
        onClick={onClick}
        aria-expanded={expanded}
        aria-label={`Account menu, ${identity.name}, ${identity.role}`}
        data-shell-panel-toggle="profile"
        className={cn(
          "flex min-h-[52px] w-full items-center rounded-xl text-left transition-colors duration-150 hover:bg-fill",
          collapsed ? "justify-center" : "gap-3 px-2",
          expanded && "bg-fill-strong",
          ring
        )}
      >
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-fill text-[12px] font-semibold text-ink">
          {identity.initials || <UserRound className="h-[18px] w-[18px]" />}
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[13px] font-semibold text-ink">{identity.name}</span>
            <span className="block truncate text-[11px] text-ink-faint">{identity.role}</span>
          </span>
        )}
      </button>
    </CollapsedTooltip>
  )
}

/** @param {Record<string, any>} props */
export function SidebarCollapseButton(props) {
  const { collapsed, onToggle } = props
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar"
  return (
    <CollapsedTooltip collapsed={collapsed} label={label}>
      <button type="button" onClick={onToggle} aria-label={label} aria-expanded={!collapsed} aria-controls="campusnav-sidebar" className={rowClass(collapsed)}>
        <Icon className="h-[18px] w-[18px] shrink-0 text-ink-soft group-hover:text-ink" strokeWidth={1.9} aria-hidden="true" />
        {!collapsed && <span className="flex-1 truncate text-left">Collapse</span>}
      </button>
    </CollapsedTooltip>
  )
}
