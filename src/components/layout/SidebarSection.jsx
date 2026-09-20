import { ChevronDown } from "lucide-react"
import { focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

/**
 * A labelled group of sidebar destinations.
 *
 * When `collapsible` is set the label becomes a disclosure button so long
 * groups (Administration) can be folded away. In icon-only mode the label is
 * replaced by a divider, keeping the rail uncluttered.
 */
export default function SidebarSection({
  title,
  children,
  collapsed = false,
  collapsible = false,
  open = true,
  onToggle,
  id,
  action = null,
}) {
  if (collapsed) {
    return (
      <div className="pt-2">
        <div aria-hidden="true" className="mx-auto mb-2 h-px w-8 bg-[#D2D2D7]" />
        <ul role="list" className="space-y-1">{children}</ul>
      </div>
    )
  }

  if (!collapsible) {
    return (
      <div className="pt-4">
        {title && (
          <div className="flex items-center justify-between gap-2 px-3 pb-2">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8E8E93]">{title}</h2>
            {action}
          </div>
        )}
        <ul role="list" className="space-y-1">{children}</ul>
      </div>
    )
  }

  const panelId = `${id}-panel`

  return (
    <div className="pt-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8E8E93] transition-colors duration-200 hover:text-[#1D1D1F]",
          focusRing
        )}
      >
        <span>{title}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 transition-transform duration-200 motion-reduce:transition-none", open ? "rotate-0" : "-rotate-90")}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul id={panelId} role="list" className="mt-1 space-y-1">{children}</ul>
      )}
    </div>
  )
}
