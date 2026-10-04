import { ChevronDown, ChevronUp } from "lucide-react"
import { useId, useState } from "react"
import { focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

/**
 * Floating container for page panels shown inside the fullscreen map (for
 * example the existing Emergency Mode panel). Below 1024px it collapses to a
 * one-line header so the map stays visible; at 1024px and wider it is always
 * expanded. It renders the given panel unchanged.
 * @param {Record<string, any>} props
 */
export default function ImmersiveMapPanel(props) {
  const { title, children, className } = props
  const [expanded, setExpanded] = useState(false)
  const contentId = useId()

  return (
    <section aria-label={title} className={cn("map-overlay-surface pointer-events-auto flex flex-col overflow-hidden", className)}>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((value) => !value)}
        className={cn("flex min-h-11 shrink-0 items-center justify-between gap-2 px-3.5 text-left font-heading text-sm font-semibold text-ink lg:hidden", focusRing)}
      >
        {title}
        {expanded ? <ChevronDown className="h-4 w-4" aria-hidden="true" /> : <ChevronUp className="h-4 w-4" aria-hidden="true" />}
        <span className="sr-only">{expanded ? "Collapse" : "Expand"}</span>
      </button>
      <div id={contentId} className={cn("min-h-0 overflow-y-auto overscroll-contain", !expanded && "max-lg:hidden")}>
        {children}
      </div>
    </section>
  )
}
