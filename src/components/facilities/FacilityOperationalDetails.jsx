import { CalendarDays, Clock3, Contact, Info, Mail, Phone, ShieldCheck } from "lucide-react"
import { StatusBadge } from "@/components/campus/ui"
import { FACILITY_AVAILABILITY, FACILITY_OPERATIONAL_STATUS } from "@/data/facilityContracts"
import { formatCampusDateTime, timeToMinutes } from "@/lib/campusTime"
import { cn } from "@/lib/utils"

const WEEKDAYS = Object.freeze(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])

const statePresentation = ({ section, provenances = [], status = null, demo = false }) => {
  if (!section || section.availability === FACILITY_AVAILABILITY.UNAVAILABLE) {
    return { label: "Unavailable", className: "border-dashed border-ink-faint text-ink-soft" }
  }
  if (!section.ok || section.availability === FACILITY_AVAILABILITY.PROVIDER_UNAVAILABLE) {
    return { label: "Data unavailable", className: "border-dashed border-ink-faint text-ink-soft" }
  }
  if (demo || provenances.some((provenance) => provenance?.demo)) {
    return { label: "Demo · not official", className: "border-ink bg-ink text-on-ink" }
  }
  if (
    status === FACILITY_OPERATIONAL_STATUS.PENDING_VERIFICATION
    || provenances.some((provenance) => (
      provenance?.verificationStatus === "PENDING_VERIFICATION"
      || provenance?.dataStatus === "PENDING_VERIFICATION"
    ))
  ) {
    return { label: "Pending verification", className: "border-dashed border-ink-faint text-ink-soft" }
  }
  if (status === FACILITY_OPERATIONAL_STATUS.UNKNOWN) {
    return { label: "Unavailable", className: "border-dashed border-ink-faint text-ink-soft" }
  }
  return { label: "Published", className: "border-line-strong bg-fill text-ink-mid" }
}

function DataStateBadge(props) {
  const state = statePresentation(props)
  return (
    <span className={cn("inline-flex min-h-6 items-center rounded-full border bg-surface px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em]", state.className)}>
      {state.label}
    </span>
  )
}

function SectionMessage({ children, error = false }) {
  return (
    <p className={cn("rounded-xl border border-dashed bg-subtle p-3 text-xs leading-relaxed", error ? "border-ink-faint text-ink" : "border-line-strong text-ink-soft")}>
      {children}
    </p>
  )
}

const formatWallClock = (value) => {
  const minutes = timeToMinutes(value)
  if (!Number.isFinite(minutes)) return "Time unavailable"
  const wholeMinutes = Math.floor(minutes)
  const hour24 = Math.floor(wholeMinutes / 60)
  const minute = wholeMinutes % 60
  const hour12 = hour24 % 12 || 12
  return `${hour12}:${String(minute).padStart(2, "0")} ${hour24 < 12 ? "AM" : "PM"}`
}

const formatInterval = (record) => {
  if (record.closedAllDay) return "Closed all day"
  const overnight = timeToMinutes(record.endTime) <= timeToMinutes(record.startTime)
  return `${formatWallClock(record.startTime)}–${formatWallClock(record.endTime)}${overnight ? " next day" : ""}`
}

const groupWeeklyHours = (records = []) => WEEKDAYS.map((day, dayOfWeek) => ({
  day,
  records: records.filter((record) => record.dayOfWeek === dayOfWeek),
}))

function DetailSection({ id, icon: Icon, title, state, children, className = "" }) {
  return (
    <section aria-labelledby={id} className={cn("rounded-2xl border border-line bg-surface p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={id} className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Icon className="h-4 w-4" aria-hidden="true" /> {title}
        </h3>
        {state}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function LoadingDetails() {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">Loading public facility information.</span>
      {["profile", "services", "hours"].map((key) => (
        <div key={key} className="animate-pulse rounded-2xl border border-line bg-subtle p-5 motion-reduce:animate-none">
          <div className="h-4 w-32 rounded bg-fill-strong" />
          <div className="mt-4 h-3 w-full rounded bg-fill-strong" />
          <div className="mt-2 h-3 w-2/3 rounded bg-fill-strong" />
        </div>
      ))}
    </div>
  )
}

export default function FacilityOperationalDetails({ detail, loading = false }) {
  if (loading) return <LoadingDetails />
  if (!detail) {
    return (
      <div role="alert" className="rounded-2xl border border-dashed border-ink-faint bg-subtle p-4 text-sm text-ink">
        Facility information is temporarily unavailable.
      </div>
    )
  }

  const profileSection = detail.operationalProfile
  const servicesSection = detail.services
  const hoursSection = detail.hours
  const statusSection = detail.status
  const profile = profileSection?.data
  const services = servicesSection?.data || []
  const hours = hoursSection?.data || { weeklyHours: [], exceptions: [], dateRange: null }
  const status = statusSection?.data || { status: FACILITY_OPERATIONAL_STATUS.UNKNOWN }
  const contact = profile?.publicContact || {}
  const hasContact = Boolean(contact.name || contact.email || contact.phone)
  const hourProvenances = [
    ...(hours.weeklyHours || []),
    ...(hours.exceptions || []),
    ...(hours.statusAdvisories || []),
  ].map((record) => record.provenance)

  return (
    <div className="space-y-3">
      <DetailSection
        id="facility-status-heading"
        icon={ShieldCheck}
        title="Operational status"
        state={<DataStateBadge section={statusSection} status={status.status} demo={status.demo} />}
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge
            status={status.status}
            label={status.status === FACILITY_OPERATIONAL_STATUS.UNKNOWN ? "Unknown" : null}
          />
          <p className="text-xs leading-relaxed text-ink-soft">
            Computed for {status.timezone || "Asia/Manila"}. This does not change whether the facility is navigable.
          </p>
        </div>
        {statusSection?.ok && status.nextTransitionAt && (
          <p className="mt-3 text-xs text-ink-soft">Next schedule transition: <span className="font-semibold text-ink">{formatCampusDateTime(status.nextTransitionAt)}</span></p>
        )}
        {!statusSection?.ok && (
          <SectionMessage error>Operational status is unavailable. No open or closed state has been inferred.</SectionMessage>
        )}
      </DetailSection>

      <DetailSection
        id="facility-profile-heading"
        icon={Info}
        title="Operational information"
        state={<DataStateBadge section={profileSection} provenances={[profile?.provenance]} />}
      >
        {profileSection?.ok && profile?.description ? (
          <p className="text-sm leading-relaxed text-ink-mid">{profile.description}</p>
        ) : profileSection?.ok ? (
          <SectionMessage>Operational description unavailable.</SectionMessage>
        ) : (
          <SectionMessage error>Facility information is temporarily unavailable.</SectionMessage>
        )}
        {profile?.provenance?.sourceLabel && (
          <p className="mt-3 text-[11px] text-ink-faint">Source: {profile.provenance.sourceLabel}</p>
        )}
      </DetailSection>

      <DetailSection
        id="facility-services-heading"
        icon={Contact}
        title="Services"
        state={<DataStateBadge section={servicesSection} provenances={services.map(({ mapping }) => mapping.provenance)} />}
      >
        {!servicesSection?.ok ? (
          <SectionMessage error>Service information is temporarily unavailable.</SectionMessage>
        ) : services.length ? (
          <ul className="grid gap-2 sm:grid-cols-2" aria-label="Configured public services">
            {services.map(({ service, mapping }) => (
              <li key={service.code} className="rounded-xl border border-line bg-subtle p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">{service.name}</span>
                  <DataStateBadge section={servicesSection} provenances={[mapping.provenance]} />
                </div>
                <span className="mt-1 block font-mono text-[10px] text-ink-faint">{service.code}</span>
                {mapping.publicNotes && <p className="mt-2 text-xs leading-relaxed text-ink-soft">{mapping.publicNotes}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <SectionMessage>No configured public services are available for this facility.</SectionMessage>
        )}
      </DetailSection>

      <DetailSection
        id="facility-hours-heading"
        icon={Clock3}
        title="Operating hours"
        state={<DataStateBadge section={hoursSection} provenances={hourProvenances} />}
      >
        {!hoursSection?.ok ? (
          <SectionMessage error>Operating hours unavailable.</SectionMessage>
        ) : hours.weeklyHours.length ? (
          <div className="overflow-hidden rounded-xl border border-line">
            <dl>
              {groupWeeklyHours(hours.weeklyHours).map(({ day, records }) => (
                <div key={day} className="grid grid-cols-[minmax(5.5rem,0.7fr)_minmax(0,1.3fr)] gap-3 border-b border-line px-3 py-2.5 last:border-0">
                  <dt className="text-xs font-semibold text-ink">{day}</dt>
                  <dd className="text-right text-xs leading-relaxed text-ink-soft">
                    {records.length ? records.map(formatInterval).join(" · ") : "No published hours"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <SectionMessage>Operating hours unavailable.</SectionMessage>
        )}

        {hoursSection?.ok && hours.exceptions.length > 0 && (
          <div className="mt-4 rounded-xl border border-line bg-subtle p-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-ink"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Applicable date exceptions</p>
            <ul className="mt-2 space-y-1.5">
              {hours.exceptions.map((record, index) => (
                <li key={`${record.exceptionDate}-${record.startTime || "closed"}-${index}`} className="flex flex-wrap justify-between gap-2 text-xs text-ink-soft">
                  <span>{record.exceptionDate}</span>
                  <span className="font-medium text-ink">{formatInterval(record)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {hours.dateRange && (
          <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
            Date exceptions shown only for the current status window ({hours.dateRange.startDate} to {hours.dateRange.endDate}), evaluated in Asia/Manila.
          </p>
        )}
      </DetailSection>

      <DetailSection
        id="facility-contact-heading"
        icon={Contact}
        title="Public contact"
        state={<DataStateBadge section={profileSection} provenances={[profile?.provenance]} />}
      >
        {profileSection?.ok && hasContact ? (
          <address className="space-y-2 not-italic text-sm text-ink-mid">
            {contact.name && <p className="font-semibold text-ink">{contact.name}</p>}
            {contact.email && <p className="flex items-center gap-2 break-all"><Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> {contact.email}</p>}
            {contact.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> {contact.phone}</p>}
          </address>
        ) : profileSection?.ok ? (
          <SectionMessage>Public contact information unavailable.</SectionMessage>
        ) : (
          <SectionMessage error>Public contact information is temporarily unavailable.</SectionMessage>
        )}
      </DetailSection>
    </div>
  )
}
