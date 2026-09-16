import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { EmptyState as CampusEmptyState, focusRing as campusFocusRing } from "@/components/campus/ui"
import { formatCampusDateTime } from "@/lib/campusTime"

export const focusClass = campusFocusRing

export function DashboardSection({ id, eyebrow, title, description = null, children, action = null }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="ink-blueprint scroll-mt-20 p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          {eyebrow && <p className="ink-kicker">{eyebrow}</p>}
          <h2 id={`${id}-title`} className="mt-1 font-display text-2xl font-bold uppercase tracking-[0.03em] text-[#1D1F20]">{title}</h2>
          {description && <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[#6E6E73]">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function EmptyState({ title, message = null }) {
  return <CampusEmptyState title={title} message={message} className="min-h-28" />
}

export function StatusLabel({ children, strong = false }) {
  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${strong ? "border-[#1D1D1F] bg-[#1D1D1F] text-white" : "border-[#B8B8BD] bg-white text-[#48484A]"}`}>
      {children}
    </span>
  )
}

export function RecordActions({ record, navigateLabel = "Navigate", facilityLabel = "View Facility" }) {
  if (!record.navigationHref && !record.facilityHref && !record.emergencyHref) return null
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {record.emergencyHref && (
        <Link to={record.emergencyHref} className={`${focusClass} inline-flex min-h-10 items-center gap-2 rounded-full bg-[#1D1D1F] px-4 text-xs font-semibold text-white transition-colors duration-200 hover:bg-black`}>
          Open Emergency Mode <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
      {record.navigationHref && (
        <Link to={record.navigationHref} className={`${focusClass} inline-flex min-h-10 items-center gap-2 rounded bg-brand-700 px-4 font-heading text-xs font-bold uppercase tracking-[0.06em] text-white transition-colors duration-200 hover:bg-brand-800`}>
          {navigateLabel} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
      {record.facilityHref && (
        <Link to={record.facilityHref} className={`${focusClass} inline-flex min-h-10 items-center rounded-full border border-[#D2D2D7] bg-white px-4 text-xs font-semibold text-[#1D1D1F] transition-colors duration-200 hover:border-[#86868B]`}>
          {facilityLabel}
        </Link>
      )}
    </div>
  )
}

export function VerificationMetadata({ record, visible }) {
  if (!visible) return null
  return (
    <dl className="mt-4 grid gap-2 border-t border-[#E5E5E7] pt-4 text-[10px] text-[#6E6E73] sm:grid-cols-2">
      <div><dt className="font-semibold uppercase tracking-wide">Source</dt><dd className="mt-0.5 break-all">{record.sourceType || "UNAVAILABLE"}</dd></div>
      <div><dt className="font-semibold uppercase tracking-wide">Source ID</dt><dd className="mt-0.5 break-all">{record.sourceId || "UNAVAILABLE"}</dd></div>
      <div><dt className="font-semibold uppercase tracking-wide">Verification</dt><dd className="mt-0.5">{record.verificationStatus || "PENDING_VERIFICATION"}</dd></div>
      <div><dt className="font-semibold uppercase tracking-wide">Data status</dt><dd className="mt-0.5">{record.dataStatus || "UNAVAILABLE"}</dd></div>
      {record.effectiveAt && <div><dt className="font-semibold uppercase tracking-wide">Effective</dt><dd className="mt-0.5">{formatCampusDateTime(record.effectiveAt)}</dd></div>}
      {record.expiresAt && <div><dt className="font-semibold uppercase tracking-wide">Expires</dt><dd className="mt-0.5">{formatCampusDateTime(record.expiresAt)}</dd></div>}
    </dl>
  )
}
