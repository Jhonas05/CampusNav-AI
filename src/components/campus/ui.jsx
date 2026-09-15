import { BadgeCheck, BookOpen, CalendarClock, CircleDashed, CircleDot, Clock3, Inbox, MessagesSquare, MinusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * CampusNav visual language.
 * Calm neutrals for layout, St. Clare royal blue + gold (from the official
 * seal) for identity and key actions, and stronger color reserved for maps,
 * statuses, and priorities. Green is semantic only: routes, exits, and
 * open/verified states. Color is never the only signal — badges keep icons
 * and text labels.
 */

export const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"

export const button = {
  primary: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-700 px-6 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-30", focusRing),
  secondary: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D2D2D7] bg-white px-6 text-sm font-medium text-[#1D1D1F] transition-colors duration-200 hover:border-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-30", focusRing),
  outline: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-brand-700 bg-white px-6 text-sm font-medium text-brand-700 transition-colors duration-200 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-30", focusRing),
  danger: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-700 px-6 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-30", focusRing),
  dangerOutline: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-700 bg-white px-6 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30", focusRing),
  ghost: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-[#6E6E73] transition-colors duration-200 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-30", focusRing),
  smallPrimary: cn("inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-brand-700 px-4 text-xs font-semibold text-white transition-colors duration-200 hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-30", focusRing),
  smallSecondary: cn("inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-[#D2D2D7] bg-white px-4 text-xs font-semibold text-[#1D1D1F] transition-colors duration-200 hover:border-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-30", focusRing),
}

export const card = "rounded-3xl border border-[#E5E5E7] bg-white"
export const cardHover = "transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D2D2D7] hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)] motion-reduce:transform-none motion-reduce:transition-none"

/** @param {Record<string, any>} props */
export function PageHeader(props) {
  const { eyebrow, title, lead = null, actions = null, className } = props
  return (
    <header className={cn("flex flex-col justify-between gap-6 md:flex-row md:items-end", className)}>
      <div className="max-w-3xl">
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">{eyebrow}</p>}
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#1D1D1F] sm:text-5xl">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#6E6E73] sm:text-lg">{lead}</p>}
      </div>
      {actions}
    </header>
  )
}

/** @param {Record<string, any>} props */
export function SectionHeader(props) {
  const { eyebrow, title, description = null, action = null, as: Heading = "h2" } = props
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">{eyebrow}</p>}
        <Heading className="mt-1.5 text-2xl font-semibold tracking-tight text-[#1D1D1F]">{title}</Heading>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6E6E73]">{description}</p>}
      </div>
      {action}
    </div>
  )
}

const prettify = (value) => String(value || "")
  .replaceAll("_", " ")
  .toLowerCase()
  .replace(/(^|\s)\S/g, (character) => character.toUpperCase())

/**
 * Status registry. `tone` picks the treatment:
 * positive — active/confirmed (green) · attention — closing/temporary (amber) ·
 * scheduled — planned states (blue) · muted — inactive (gray) · dashed — pending/unverified.
 */
const STATUS_STYLES = {
  positive: "border border-green-700 bg-green-700 text-white",
  attention: "border border-amber-300 bg-amber-50 text-amber-800",
  scheduled: "border border-blue-200 bg-blue-50 text-blue-700",
  muted: "border border-transparent bg-[#F0F0F2] text-[#6E6E73]",
  dashed: "border border-dashed border-[#86868B] bg-white text-[#6E6E73]",
}

const STATUS_REGISTRY = {
  OPEN_NOW: { label: "Open Now", tone: "positive", icon: CircleDot },
  CLOSING_SOON: { label: "Closing Soon", tone: "attention", icon: Clock3 },
  SCHEDULED_TO_OPEN: { label: "Scheduled to Open", tone: "scheduled", icon: CalendarClock },
  CLOSED: { label: "Closed", tone: "muted", icon: MinusCircle },
  TEMPORARILY_UNAVAILABLE: { label: "Temporarily Unavailable", tone: "attention", icon: CircleDashed },
  UNKNOWN: { label: "Pending Verification", tone: "dashed", icon: CircleDashed },
  PENDING_VERIFICATION: { label: "Pending Verification", tone: "dashed", icon: CircleDashed },
  UNDER_CONSTRUCTION: { label: "Under Construction", tone: "attention", icon: CircleDashed },

  CHECKED_IN: { label: "Checked In", tone: "positive", icon: BadgeCheck },
  SCHEDULED: { label: "Scheduled", tone: "scheduled", icon: CalendarClock },
  IN_CLASS: { label: "In Class", tone: "scheduled", icon: BookOpen },
  CONSULTATION: { label: "Consultation", tone: "scheduled", icon: MessagesSquare },
  UNAVAILABLE: { label: "Unavailable", tone: "muted", icon: MinusCircle },
  NO_ACTIVE_SCHEDULE: { label: "No Active Schedule", tone: "dashed", icon: CircleDashed },

  SCHEDULED_NOW: { label: "Scheduled Now", tone: "positive", icon: Clock3 },
  UPCOMING: { label: "Upcoming", tone: "scheduled", icon: CalendarClock },
  ENDED: { label: "Ended", tone: "muted", icon: MinusCircle },
  CANCELLED: { label: "Cancelled", tone: "muted", icon: MinusCircle },
}

/** @param {Record<string, any>} props */
export function StatusBadge(props) {
  const { status, label = null, className } = props
  const entry = STATUS_REGISTRY[status] || { label: prettify(status), tone: "scheduled", icon: null }
  const Icon = entry.icon
  return (
    <span className={cn("inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]", STATUS_STYLES[entry.tone], className)}>
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {label || entry.label}
    </span>
  )
}

const PRIORITY_REGISTRY = {
  URGENT: "border border-red-700 bg-red-700 text-white",
  IMPORTANT: "border border-amber-300 bg-amber-50 text-amber-800",
  NORMAL: "border border-[#B8B8BD] bg-white text-[#48484A]",
  INFORMATIONAL: "border border-dashed border-[#86868B] bg-white text-[#6E6E73]",
}

/** @param {Record<string, any>} props */
export function PriorityBadge(props) {
  const { priority, className } = props
  return (
    <span className={cn("inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]", PRIORITY_REGISTRY[priority] || PRIORITY_REGISTRY.NORMAL, className)}>
      {prettify(priority)}
    </span>
  )
}

/** @param {Record<string, any>} props */
export function Chip(props) {
  const { children, className } = props
  return <span className={cn("inline-flex min-h-7 items-center rounded-full border border-[#B8B8BD] bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#48484A]", className)}>{children}</span>
}

/** @param {Record<string, any>} props */
export function EmptyState(props) {
  const { icon: Icon = Inbox, title, message = null, action = null, className } = props
  return (
    <div role="status" className={cn("flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#C7C7CC] bg-[#FAFAFA] p-8 text-center", className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50">
        <Icon className="h-5 w-5 text-brand-700" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#1D1D1F]">{title}</p>
        {message && <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[#6E6E73]">{message}</p>}
      </div>
      {action}
    </div>
  )
}

/** @param {Record<string, any>} props */
export function Skeleton(props) {
  const { className } = props
  return <div aria-hidden="true" className={cn("animate-pulse rounded-2xl bg-[#E8E8ED] motion-reduce:animate-none", className)} />
}
