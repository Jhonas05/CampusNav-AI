import { Link } from "react-router-dom"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

/**
 * A single sidebar destination.
 *
 * The selected state must be readable without color, so it combines three
 * independent signals: a filled dark surface, a solid leading rail, and
 * `aria-current="page"` for assistive technology. `emphasis` items (Emergency)
 * additionally carry a heavier border so safety navigation stays findable.
 */
export default function SidebarItem({ item, active, collapsed = false, onNavigate }) {
  const { label, path, hash, icon: Icon, emphasis = false, description } = item
  const to = hash ? `${path}${hash}` : path

  const link = (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      onClick={onNavigate}
      className={cn(
        "group relative flex min-h-11 items-center gap-3 rounded-xl text-[14px] font-medium transition-colors duration-200 motion-reduce:transition-none",
        collapsed ? "justify-center px-0" : "px-3",
        active
          ? "bg-[#1D1D1F] text-white"
          : "text-[#48484A] hover:bg-[#EBEBED] hover:text-[#1D1D1F]",
        emphasis && !active && "border border-[#AEAEB2]",
        emphasis && active && "border border-[#1D1D1F]",
        focusRing
      )}
    >
      {/* Non-color selection rail. Hidden when collapsed: the fill carries it. */}
      {active && !collapsed && (
        <span aria-hidden="true" className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-white" />
      )}
      <Icon
        className="h-[18px] w-[18px] shrink-0"
        strokeWidth={active ? 2.3 : 1.9}
        aria-hidden="true"
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )

  if (!collapsed) return link

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10} className="bg-[#1D1D1F] text-white">
        <span className="font-medium">{label}</span>
        {description && <span className="ml-2 text-white/60">{description}</span>}
      </TooltipContent>
    </Tooltip>
  )
}
