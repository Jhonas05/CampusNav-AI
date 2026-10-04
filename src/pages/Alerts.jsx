import { AlertTriangle, Bell, Info } from "lucide-react"
import { card, PageHeader, PriorityBadge } from "@/components/campus/ui"
import { announcements } from "@/data/announcements"
import { FACILITY_DATA_NOTICE } from "@/data/facilities"

export default function Alerts() {
  return (
    <div className="min-h-[calc(100dvh-var(--app-header-height))] bg-canvas px-4 py-12 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          eyebrow="Notice center"
          title="Alerts & Announcements"
          lead="A single place for campus notices, event information, and urgent updates."
        />

        <div className="mt-10 space-y-4">
          {announcements.map((announcement) => {
            const high = announcement.priority === "high"
            const Icon = high ? AlertTriangle : Bell
            return (
              <article key={announcement.id} className={`${card} ${high ? "border-[1.5px] border-ink" : ""} p-6 sm:p-8`}>
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${high ? "bg-ink text-on-ink" : "border border-line bg-subtle"}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-lg font-semibold tracking-tight">{announcement.title}</h2>
                      <PriorityBadge priority={high ? "IMPORTANT" : "NORMAL"} />
                    </div>
                    <p className="mt-2 leading-relaxed text-ink-soft">{announcement.body}</p>
                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Source: {announcement.source}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-dashed border-line-strong bg-surface p-5 text-sm text-ink-soft">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="text-xs leading-relaxed">{FACILITY_DATA_NOTICE}</p>
        </div>
      </div>
    </div>
  )
}
