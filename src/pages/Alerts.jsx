import { AlertTriangle, ArrowRight, Bell, ChevronDown } from "lucide-react"
import { Link } from "react-router-dom"
import { card, focusRing, PageHeader, PriorityBadge } from "@/components/campus/ui"
import { announcements } from "@/data/announcements"
import { cn } from "@/lib/utils"

// Most important first; within a priority the published order is kept.
const byPriority = [...announcements].sort((a, b) => Number(b.priority === "high") - Number(a.priority === "high"))

/**
 * Alerts: one scannable list, most important first. Each item shows its
 * title, priority, and source; the full text opens on tap. Important items
 * start open so nothing urgent sits behind a tap.
 */
export default function Alerts() {
  return (
    <div className="app-page bg-canvas">
      <div className="app-container-readable max-w-3xl">
        <PageHeader compact eyebrow="Notice center" title="Alerts" lead="Campus notices and announcements, most important first." />

        <ul className="mt-4 space-y-2.5 sm:mt-6">
          {byPriority.map((announcement) => {
            const high = announcement.priority === "high"
            const Icon = high ? AlertTriangle : Bell
            return (
              <li key={announcement.id}>
                <details open={high || undefined} className={cn(card, "group/alert", high && "border-[1.5px] border-ink")}>
                  <summary className={cn("flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-[18px] px-4 py-3 [&::-webkit-details-marker]:hidden", focusRing)}>
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", high ? "bg-ink text-on-ink" : "border border-line bg-subtle text-ink-mid")}>
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-semibold leading-snug tracking-tight text-ink">{announcement.title}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-ink-soft">
                        {high && <PriorityBadge priority="IMPORTANT" className="min-h-6 py-0.5" />}
                        {announcement.source}
                      </span>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-ink-soft transition-transform duration-200 group-open/alert:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                  </summary>
                  <p className="px-4 pb-4 text-[15px] leading-relaxed text-ink-mid">{announcement.body}</p>
                </details>
              </li>
            )
          })}
        </ul>

        <Link to="/dashboard" className={cn("mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-ink", focusRing)}>
          All campus updates <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
