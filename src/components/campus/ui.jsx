import { BadgeCheck, BookOpen, CalendarClock, ChevronDown, CircleAlert, CircleDashed, CircleDot, Clock3, Inbox, MessagesSquare, MinusCircle, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * CampusNav visual language (DEC-UI-003).
 * Monochrome system: white and off-white surfaces, near-black ink, and a
 * gray ramp. Meaning is carried by fill, border weight, dashes, icons, and
 * type weight — never by hue. Map-canvas wayfinding colors are governed
 * separately by `MAP_COLORS`.
 */

export const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"

const buttonBase = "inline-flex items-center justify-center font-body font-medium tracking-[-0.005em] transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 disabled:active:scale-100 motion-reduce:transform-none"
const buttonLarge = "min-h-11 gap-2 rounded-xl px-5 text-sm"
const buttonSmall = "min-h-9 gap-1.5 rounded-[10px] px-3.5 text-[13px]"

export const button = {
  primary: cn(buttonBase, buttonLarge, "bg-ink text-on-ink hover:bg-ink-strong", focusRing),
  secondary: cn(buttonBase, buttonLarge, "border border-line-strong bg-surface text-ink hover:border-ink-faint hover:bg-subtle", focusRing),
  outline: cn(buttonBase, buttonLarge, "border-[1.5px] border-ink bg-surface text-ink hover:bg-fill", focusRing),
  // Urgent/destructive: same ink as primary, with a double rule so it reads as
  // a distinct, heavier control without relying on hue.
  danger: cn(buttonBase, buttonLarge, "bg-ink-strong font-semibold text-on-ink ring-2 ring-ink-strong ring-offset-2 ring-offset-white hover:bg-ink", focusRing),
  dangerOutline: cn(buttonBase, buttonLarge, "border-2 border-ink-strong bg-surface font-semibold text-ink-strong hover:bg-fill", focusRing),
  ghost: cn(buttonBase, buttonLarge, "px-4 text-ink-soft hover:bg-fill-strong hover:text-ink", focusRing),
  smallPrimary: cn(buttonBase, buttonSmall, "bg-ink text-on-ink hover:bg-ink-strong", focusRing),
  smallSecondary: cn(buttonBase, buttonSmall, "border border-line-strong bg-surface text-ink hover:border-ink-faint hover:bg-subtle", focusRing),
}

export const card = "rounded-[18px] border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
export const cardHover = "transition-[border-color,box-shadow,transform] duration-200 hover:border-line-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] motion-reduce:transition-none"

/** @param {Record<string, any>} props */
export function BlueprintPanel(props) {
  const { as: Element = "section", className, children, ...rest } = props
  return <Element className={cn("ink-blueprint", className)} {...rest}>{children}</Element>
}

/** @param {Record<string, any>} props */
export function InkKicker(props) {
  const { as: Element = "p", className, children, ...rest } = props
  return <Element className={cn("ink-kicker", className)} {...rest}>{children}</Element>
}

/** @param {Record<string, any>} props */
export function InkSectionLabel(props) {
  const { as: Element = "p", className, children, ...rest } = props
  return <Element className={cn("ink-section-label", className)} {...rest}>{children}</Element>
}

/**
 * Page title block. `compact` (public pages) shows only the title on phones:
 * the eyebrow and lead return from 640px, where there is room for them.
 * @param {Record<string, any>} props
 */
export function PageHeader(props) {
  const { eyebrow = null, title, lead = null, actions = null, compact = false, className } = props
  return (
    <header className={cn("flex flex-col justify-between gap-3 md:flex-row md:items-end md:gap-4", className)}>
      <div className="max-w-3xl">
        {eyebrow && <InkKicker className={cn(compact && "max-sm:hidden")}>{eyebrow}</InkKicker>}
        <h1 className={cn("font-display text-[1.625rem] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[2.125rem]", eyebrow && (compact ? "sm:mt-1.5" : "mt-1.5"))}>{title}</h1>
        {lead && <p className={cn("mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-[15px]", compact && "max-sm:hidden")}>{lead}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  )
}

/**
 * Progressive disclosure for secondary detail: a native `details` element, so
 * it works with the keyboard and assistive technology and needs no state.
 * @param {Record<string, any>} props
 */
export function Disclosure(props) {
  const { summary, children, defaultOpen = false, className } = props
  return (
    <details open={defaultOpen || undefined} className={cn("group/disclosure", className)}>
      <summary className={cn("flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden", focusRing)}>
        <span className="min-w-0">{summary}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-soft transition-transform duration-200 group-open/disclosure:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
      </summary>
      <div className="pb-1 pt-1">{children}</div>
    </details>
  )
}

/** @param {Record<string, any>} props */
export function SectionHeader(props) {
  const { eyebrow, title, description = null, action = null, as: Heading = "h2" } = props
  return (
    <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <InkKicker>{eyebrow}</InkKicker>}
        <Heading className="mt-1 font-display text-[1.375rem] font-semibold leading-tight tracking-[-0.02em] text-ink">{title}</Heading>
        {description && <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft">{description}</p>}
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
 * Status registry. `tone` picks a monochrome treatment; every status also has
 * its own icon and label, so state never depends on color:
 * positive — solid ink fill (active/confirmed) · attention — heavy ink border
 * (closing/temporary) · scheduled — soft gray fill with a hairline (planned) ·
 * muted — flat gray, no border (inactive) · dashed — pending/unverified.
 */
const STATUS_STYLES = {
  positive: "border border-ink bg-ink text-on-ink",
  attention: "border-[1.5px] border-ink bg-surface text-ink",
  scheduled: "border border-line-strong bg-fill text-ink-mid",
  muted: "border border-transparent bg-fill-strong text-ink-soft",
  dashed: "border border-dashed border-ink-faint bg-surface text-ink-soft",
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
    <span className={cn("inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em]", STATUS_STYLES[entry.tone], className)}>
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {label || entry.label}
    </span>
  )
}

const PRIORITY_REGISTRY = {
  URGENT: { className: "border border-ink-strong bg-ink-strong text-on-ink", icon: TriangleAlert },
  IMPORTANT: { className: "border-[1.5px] border-ink bg-surface text-ink", icon: CircleAlert },
  NORMAL: { className: "border border-line-strong bg-surface text-ink-mid", icon: null },
  INFORMATIONAL: { className: "border border-dashed border-ink-faint bg-surface text-ink-soft", icon: null },
}

/** @param {Record<string, any>} props */
export function PriorityBadge(props) {
  const { priority, className } = props
  const entry = PRIORITY_REGISTRY[priority] || PRIORITY_REGISTRY.NORMAL
  const Icon = entry.icon
  return (
    <span className={cn("inline-flex min-h-7 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em]", entry.className, className)}>
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {prettify(priority)}
    </span>
  )
}

/** @param {Record<string, any>} props */
export function Chip(props) {
  const { children, className } = props
  return <span className={cn("inline-flex min-h-7 items-center rounded-full border border-line-strong bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-mid", className)}>{children}</span>
}

/** @param {Record<string, any>} props */
export function EmptyState(props) {
  const { icon: Icon = Inbox, title, message = null, action = null, className } = props
  return (
    <div role="status" className={cn("flex min-h-36 flex-col items-center justify-center gap-2.5 rounded-[18px] border border-dashed border-line-strong bg-subtle p-5 text-center", className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface">
        <Icon className="h-5 w-5 text-ink-soft" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        {message && <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-soft">{message}</p>}
      </div>
      {action}
    </div>
  )
}

/** @param {Record<string, any>} props */
export function Skeleton(props) {
  const { className } = props
  return <div aria-hidden="true" className={cn("animate-pulse rounded-xl bg-fill-strong motion-reduce:animate-none", className)} />
}
