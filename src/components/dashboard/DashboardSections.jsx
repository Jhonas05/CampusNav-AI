import { AlertTriangle, ArrowRight, Building2, CalendarDays, Clock3, Construction, Megaphone, MessageCircle, Navigation, ShieldAlert } from "lucide-react"
import { Link } from "react-router-dom"
import { DashboardSection, EmptyState, RecordActions, VerificationMetadata, focusClass } from "./DashboardPrimitives"
import { Chip, PriorityBadge, StatusBadge } from "@/components/campus/ui"
import { formatCampusDateTime, formatCampusShortTime } from "@/lib/campusTime"

/**
 * Priority treatments pair color with border weight so no state relies on
 * color alone: URGENT — red 2px · IMPORTANT — amber · NORMAL — hairline ·
 * INFORMATIONAL — dashed light gray.
 */
const priorityStyles = {
  URGENT: "border-2 border-red-700 bg-red-50/50",
  IMPORTANT: "border-[1.5px] border-amber-400 bg-amber-50/50",
  NORMAL: "border border-[#D2D2D7] bg-white",
  INFORMATIONAL: "border border-dashed border-[#B8B8BD] bg-[#FAFAFA]",
}

const priorityIcon = (category) => category === "EMERGENCY" || category === "SUSPENSION" ? ShieldAlert : category === "NAVIGATION" ? Navigation : AlertTriangle

export function PriorityAlertsSection({ records, verify }) {
  return (
    <DashboardSection id="priority-alerts" eyebrow="Time-sensitive information" title="Priority Alerts" description="Official alerts will appear here when a campus data source is connected.">
      {!records.length ? <EmptyState title="No priority alerts are available." message="Campus data connection is pending." /> : (
        <div className="space-y-3">
          {records.map((record) => {
            const Icon = priorityIcon(record.category)
            const urgent = record.priority === "URGENT"
            return (
              <article key={record.id} className={`rounded-2xl p-5 ${priorityStyles[record.priority] || priorityStyles.NORMAL}`}>
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${urgent ? "bg-red-700 text-white" : "bg-amber-100 text-amber-800"}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={record.priority} />
                      <Chip>{record.category}</Chip>
                      {record.demo && <Chip>Demo data</Chip>}
                    </div>
                    <h3 className={`mt-3 text-base font-semibold tracking-tight ${urgent ? "text-[17px]" : ""}`}>{record.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#6E6E73]">{record.message}</p>
                    <RecordActions record={record} />
                    <VerificationMetadata record={record} visible={verify} />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </DashboardSection>
  )
}

export function ClassesSection({ records, verify }) {
  return (
    <DashboardSection id="todays-classes" eyebrow="Academic schedule" title="Today's Classes" description="Schedule data does not indicate a person's physical presence.">
      {!records.length ? <EmptyState title="Schedule information unavailable." message="No authorized class schedule source is connected." /> : (
        <ol className="relative space-y-0">
          {records.map((record, index) => (
            <li key={record.id} className="relative flex gap-4 pb-5 last:pb-0 sm:gap-6">
              <div className="flex w-[74px] shrink-0 flex-col items-end pt-4 text-right">
                <span className="text-sm font-semibold tabular-nums text-[#1D1D1F]">{formatCampusShortTime(record.startAt)}</span>
                <span className="mt-0.5 text-xs tabular-nums text-[#86868B]">{formatCampusShortTime(record.endAt)}</span>
              </div>
              <div aria-hidden="true" className="relative flex w-3 shrink-0 justify-center">
                {index < records.length - 1 && <span className="absolute bottom-0 top-6 w-px bg-[#E5E5E7]" />}
                <span className={`mt-[22px] h-2.5 w-2.5 shrink-0 rounded-full ${record.scheduleStatus === "SCHEDULED_NOW" ? "bg-green-600" : "border-2 border-blue-300 bg-white"}`} />
              </div>
              <article className="min-w-0 flex-1 rounded-2xl border border-[#E5E5E7] p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold tracking-tight">{record.subject}</h3>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={record.scheduleStatus} />
                    {record.demo && <Chip>Demo data</Chip>}
                  </div>
                </div>
                <p className="mt-1 text-xs font-medium text-[#6E6E73]">{record.courseCode} · {record.section}</p>
                <dl className="mt-3 space-y-1.5 text-sm text-[#6E6E73]">
                  <div><dt className="inline font-medium text-[#1D1D1F]">Professor: </dt><dd className="inline">{record.professor}</dd></div>
                  <div><dt className="inline font-medium text-[#1D1D1F]">Room: </dt><dd className="inline">{record.room}</dd></div>
                </dl>
                <RecordActions record={record} facilityLabel="View Room" />
                <VerificationMetadata record={record} visible={verify} />
              </article>
            </li>
          ))}
        </ol>
      )}
    </DashboardSection>
  )
}

export function OfficesSection({ records, verify }) {
  return (
    <DashboardSection id="office-availability" eyebrow="Facility information" title="Office Availability" description="Operating status remains unknown until official hours are connected and verified.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {records.map((record) => (
          <article key={record.id} className="flex flex-col rounded-2xl border border-[#E5E5E7] p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E5E7] bg-[#FAFAFA]"><Building2 className="h-[18px] w-[18px]" aria-hidden="true" /></span>
              {record.demo && <Chip>Demo data</Chip>}
            </div>
            <h3 className="mt-4 font-semibold tracking-tight">{record.facilityName}</h3>
            <p className="mt-0.5 text-xs text-[#86868B]">{record.floorId}</p>
            <div className="mt-3"><StatusBadge status={record.operatingStatus} /></div>
            <p className="mt-3 text-sm leading-relaxed text-[#6E6E73]">
              {record.openingTime && record.closingTime ? `${record.openingTime}–${record.closingTime}` : "Operating hours pending verification."}
            </p>
            <RecordActions record={record} />
            <VerificationMetadata record={record} visible={verify} />
          </article>
        ))}
      </div>
    </DashboardSection>
  )
}

const personnelMessage = (record) => {
  if (record.status === "CHECKED_IN") return "Currently checked in."
  if (record.status === "IN_CLASS") return `Scheduled to teach in ${record.facilityName || "a listed room"} from ${formatCampusShortTime(record.scheduledStartAt)} to ${formatCampusShortTime(record.scheduledEndAt)}.`
  if (record.status === "SCHEDULED") return `Scheduled at ${record.facilityName || "a listed facility"} until ${formatCampusShortTime(record.scheduledEndAt)}.`
  if (record.status === "CONSULTATION") return `Scheduled consultation until ${formatCampusShortTime(record.scheduledEndAt)}.`
  if (record.status === "UNAVAILABLE") return "Marked unavailable in the connected schedule source."
  return "No active schedule is available."
}

const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "—"

export function PersonnelSection({ records, verify }) {
  return (
    <DashboardSection id="personnel-availability" eyebrow="Privacy-aware status" title="Personnel Availability" description="A schedule is not proof of physical presence. Only a CHECKED_IN record may indicate confirmed presence.">
      {!records.length ? <EmptyState title="Personnel availability information is not available." message="No authorized personnel schedule or check-in source is connected." /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {records.map((record) => (
            <article key={record.id} className="rounded-2xl border border-[#E5E5E7] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E5E7] bg-[#FAFAFA] text-sm font-semibold text-[#48484A]">{initials(record.name)}</span>
                  <div>
                    <h3 className="font-semibold tracking-tight">{record.name}</h3>
                    <p className="text-xs text-[#86868B]">{record.role}</p>
                  </div>
                </div>
                {record.demo && <Chip>Demo data</Chip>}
              </div>
              <div className="mt-4"><StatusBadge status={record.status} /></div>
              <p className="mt-3 text-sm leading-relaxed text-[#6E6E73]">{personnelMessage(record)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/clara?q=${encodeURIComponent(`Where is ${record.name} scheduled today?`)}`} className={`${focusClass} inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#D2D2D7] bg-white px-4 text-xs font-semibold text-[#1D1D1F] transition-colors duration-200 hover:border-[#86868B]`}>
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> Ask CLARA
                </Link>
              </div>
              <VerificationMetadata record={record} visible={verify} />
            </article>
          ))}
        </div>
      )}
    </DashboardSection>
  )
}

export function AdvisoriesSection({ records, verify }) {
  return (
    <DashboardSection id="facility-advisories" eyebrow="Access and services" title="Facility Advisories">
      {!records.length ? <EmptyState title="No current facility advisories." message="Official closure, maintenance, restriction, and interruption notices will appear here." /> : (
        <div className="space-y-3">
          {records.map((record) => (
            <article key={record.id} className="rounded-2xl border-[1.5px] border-amber-400 bg-amber-50/40 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Construction className="h-5 w-5 text-amber-700" aria-hidden="true" />
                <PriorityBadge priority={record.priority} />
                {record.demo && <Chip>Demo data</Chip>}
              </div>
              <h3 className="mt-3 font-semibold tracking-tight">{record.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">{record.message}</p>
              <RecordActions record={record} />
              <VerificationMetadata record={record} visible={verify} />
            </article>
          ))}
        </div>
      )}
    </DashboardSection>
  )
}

const EventList = ({ records, verify, emptyTitle }) => !records.length ? <EmptyState title={emptyTitle} /> : (
  <div className="space-y-3">
    {records.map((record) => (
      <article key={record.id} className="rounded-2xl border border-[#E5E5E7] p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E5E7] bg-[#FAFAFA]"><CalendarDays className="h-[18px] w-[18px]" aria-hidden="true" /></span>
          <div className="flex flex-wrap justify-end gap-2">
            <StatusBadge status={record.status} />
            {record.demo && <Chip>Demo data</Chip>}
          </div>
        </div>
        <h3 className="mt-4 font-semibold tracking-tight">{record.title}</h3>
        <p className="mt-2 text-sm text-[#6E6E73]">{formatCampusDateTime(record.startAt)}–{formatCampusShortTime(record.endAt)}</p>
        <p className="mt-1 text-sm text-[#6E6E73]">{record.location} · {record.organizer}</p>
        <RecordActions record={record} navigateLabel="Navigate to Venue" />
        <VerificationMetadata record={record} visible={verify} />
      </article>
    ))}
  </div>
)

export function EventsSection({ events, verify }) {
  return (
    <DashboardSection
      id="events-calendar"
      eyebrow="Calendar"
      title="Events & Calendar"
      action={<Link to="/events" className={`${focusClass} inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-[#1D1D1F]`}>All events <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Clock3 className="h-4 w-4" aria-hidden="true" /> Today</h3>
          <EventList records={events.today} verify={verify} emptyTitle="No events are available for today." />
        </div>
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><CalendarDays className="h-4 w-4" aria-hidden="true" /> Upcoming</h3>
          <EventList records={events.upcoming} verify={verify} emptyTitle="No upcoming events." />
        </div>
      </div>
    </DashboardSection>
  )
}

export function AnnouncementsSection({ records, verify }) {
  return (
    <DashboardSection id="general-announcements" eyebrow="Published feed" title="General Announcements" description="Only published, currently effective records are included.">
      {!records.length ? <EmptyState title="No general announcements are available." /> : (
        <div className="space-y-3">
          {records.map((record) => (
            <article key={record.id} className="rounded-2xl border border-[#E5E5E7] p-5">
              <div className="flex items-start gap-3">
                <Megaphone className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <PriorityBadge priority={record.priority} />
                    {record.demo && <Chip>Demo data</Chip>}
                  </div>
                  <h3 className="mt-3 font-semibold tracking-tight">{record.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">{record.message}</p>
                </div>
              </div>
              <VerificationMetadata record={record} visible={verify} />
            </article>
          ))}
        </div>
      )}
    </DashboardSection>
  )
}

export function NavigationNoticesSection({ records, verify }) {
  return (
    <DashboardSection id="navigation-notices" eyebrow="Existing map restrictions" title="Navigation Notices" description="These notices reuse CampusNav's existing facility and route-restriction sources.">
      {!records.length ? <EmptyState title="No current navigation notices." /> : (
        <div className="space-y-3">
          {records.map((record) => (
            <article key={record.id} className="rounded-2xl border border-dashed border-[#86868B] bg-[#FAFAFA] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Navigation className="h-5 w-5 text-brand-700" aria-hidden="true" />
                <PriorityBadge priority={record.priority} />
                <Chip>{record.category}</Chip>
                {record.demo && <Chip>Demo data</Chip>}
              </div>
              <h3 className="mt-3 font-semibold tracking-tight">{record.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">{record.message}</p>
              <RecordActions record={record} />
              <VerificationMetadata record={record} visible={verify} />
            </article>
          ))}
        </div>
      )}
    </DashboardSection>
  )
}
