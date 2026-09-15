import { AlertTriangle, Bell, Info } from "lucide-react"
import { card, PageHeader, PriorityBadge } from "@/components/campus/ui"
import { announcements } from "@/data/announcements"
import { FACILITY_DATA_NOTICE } from "@/data/facilities"

export default function Alerts() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F5F5F7] px-4 py-12 sm:px-6 sm:py-14">
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
              <article key={announcement.id} className={`${card} ${high ? "border-[1.5px] border-[#1D1D1F]" : ""} p-6 sm:p-8`}>
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${high ? "bg-[#1D1D1F] text-white" : "border border-[#E5E5E7] bg-[#FAFAFA]"}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-lg font-semibold tracking-tight">{announcement.title}</h2>
                      <PriorityBadge priority={high ? "IMPORTANT" : "NORMAL"} />
                    </div>
                    <p className="mt-2 leading-relaxed text-[#6E6E73]">{announcement.body}</p>
                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#86868B]">Source: {announcement.source}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-dashed border-[#C7C7CC] bg-white p-5 text-sm text-[#6E6E73]">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="text-xs leading-relaxed">{FACILITY_DATA_NOTICE}</p>
        </div>
      </div>
    </div>
  )
}
