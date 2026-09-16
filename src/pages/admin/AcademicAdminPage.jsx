import { Ban, CalendarPlus, CheckCircle2, Edit3, Eye, LogOut, Navigation, Plus, RefreshCw, Search, UserCheck, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import AcademicAdminEditor from "@/components/admin/AcademicAdminEditor"
import AdminShell from "@/components/admin/AdminShell"
import { EmptyState, PageHeader, Skeleton, StatusBadge, button, focusRing } from "@/components/campus/ui"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { getAdminService } from "@/services/adminService"
import { ACADEMIC_ADMIN_CONFIG, ACADEMIC_ADMIN_RESOURCES, DAYS, PERSONNEL_TYPES, SCHEDULE_STATUSES, validateAcademicRecord } from "@/services/academicAdminService"

const pretty = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
const formatDate = (value, time = false) => value ? new Intl.DateTimeFormat("en-PH", time ? { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" } : { dateStyle: "medium", timeZone: "Asia/Manila" }).format(new Date(value)) : "Open-ended"
const formatTime = (value) => value ? new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }).format(new Date(`2000-01-01T${value}+08:00`)) : "—"
const dayLabel = (value) => DAYS.find((day) => day.value === Number(value))?.label || "—"

const PAGE_COPY = {
  [ACADEMIC_ADMIN_RESOURCES.PERSONNEL]: "Manage approved public and system personnel records without exposing private employee information.",
  [ACADEMIC_ADMIN_RESOURCES.COURSES]: "Manage verified course references used by the existing academic schedule engine.",
  [ACADEMIC_ADMIN_RESOURCES.SECTIONS]: "Manage academic section references without student enrollment or rosters.",
  [ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES]: "Manage recurring classes with facility, professor, and section conflict protection.",
  [ACADEMIC_ADMIN_RESOURCES.SCHEDULE_EXCEPTIONS]: "Record a single-date cancellation or change without altering the permanent weekly schedule.",
  [ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS]: "Manage scheduled office and laboratory assignments. Scheduled never means checked in.",
  [ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS]: "Manage recurring consultation windows through the existing personnel status engine.",
  [ACADEMIC_ADMIN_RESOURCES.CHECK_INS]: "Manage authorized confirmed check-ins and check-outs. Schedules alone never prove presence.",
  [ACADEMIC_ADMIN_RESOURCES.AVAILABILITY_OVERRIDES]: "Manage temporary unavailable, leave, and special-assignment periods.",
}

export default function AcademicAdminPage({ resource }) {
  const config = ACADEMIC_ADMIN_CONFIG[resource]
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [records, setRecords] = useState([])
  const [references, setReferences] = useState(null)
  const [filters, setFilters] = useState({ search: "", departmentId: "ALL", personnelType: "ALL", active: "ALL", day: "ALL", personnelId: "ALL", sectionId: "ALL", facilityId: "ALL", status: "ALL" })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [realtimeStatus, setRealtimeStatus] = useState("CONNECTING")
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [initialValues, setInitialValues] = useState(null)
  const [pendingCheckIn, setPendingCheckIn] = useState(null)
  const [details, setDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const handleError = useCallback((nextError) => {
    setError(nextError?.message || `The ${config.label.toLowerCase()} page could not be loaded.`)
    if (nextError?.code === "SESSION_EXPIRED") navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`)
  }, [config.label, navigate])

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setError("")
    try {
      const service = await getAdminService()
      const [rows, refs] = await Promise.all([service.listAcademicRecords(resource, filters), service.loadAcademicReferences()])
      setRecords(rows); setReferences(refs)
    } catch (loadError) { handleError(loadError) } finally { if (!silent) setLoading(false) }
  }, [filters, handleError, resource])

  useEffect(() => { const timer = window.setTimeout(() => load(), 180); return () => window.clearTimeout(timer) }, [load])
  useEffect(() => {
    let cleanup = () => {}
    let active = true
    getAdminService().then((service) => {
      if (!active) return
      cleanup = service.subscribeToAcademicChanges(() => load({ silent: true }), setRealtimeStatus)
    }).catch(() => setRealtimeStatus("CHANNEL_ERROR"))
    return () => { active = false; cleanup() }
  }, [load])

  useEffect(() => {
    const scheduleId = searchParams.get("scheduleId")
    if (resource === ACADEMIC_ADMIN_RESOURCES.SCHEDULE_EXCEPTIONS && scheduleId && references && !editorOpen) {
      const schedule = references.classSchedules.find((item) => Number(item.id) === Number(scheduleId))
      if (schedule) {
        setInitialValues({ class_schedule_id: schedule.id, department_id: schedule.department_id })
        setSelectedRecord(null); setEditorOpen(true)
        navigate("/admin/schedule-exceptions", { replace: true })
      }
    }
  }, [editorOpen, navigate, references, resource, searchParams])

  const openEditor = (record = null, defaults = null) => { setSelectedRecord(record); setInitialValues(defaults); setEditorOpen(true) }
  const save = async (form) => {
    if (resource === ACADEMIC_ADMIN_RESOURCES.CHECK_INS) { validateAcademicRecord(resource, form); setPendingCheckIn(form); setEditorOpen(false); return }
    setBusy(true); setError("")
    try {
      const service = await getAdminService()
      if (selectedRecord) await service.updateAcademicRecord(resource, selectedRecord.id, form)
      else await service.createAcademicRecord(resource, form)
      setEditorOpen(false); setSelectedRecord(null); setInitialValues(null)
      toast({ title: `${config.singular} saved`, description: "The change passed validation and was stored through existing RLS." })
      await load({ silent: true })
    } catch (saveError) { handleError(saveError); throw saveError } finally { setBusy(false) }
  }
  const runAction = async (action, successTitle) => {
    setBusy(true); setError("")
    try { await action(await getAdminService()); toast({ title: successTitle, description: "History and auditability were preserved." }); await load({ silent: true }) }
    catch (actionError) { handleError(actionError) } finally { setBusy(false) }
  }
  const confirmCheckIn = async () => {
    if (!pendingCheckIn) return
    await runAction((service) => service.createAcademicRecord(resource, pendingCheckIn), "Personnel checked in")
    setPendingCheckIn(null)
  }
  const showDetails = async (id) => {
    setDetailsLoading(true); setError("")
    try { setDetails(await (await getAdminService()).getPersonnelDetails(id)) } catch (detailsError) { handleError(detailsError) } finally { setDetailsLoading(false) }
  }

  const actionLabel = resource === ACADEMIC_ADMIN_RESOURCES.SCHEDULE_EXCEPTIONS ? "Add Exception" : resource === ACADEMIC_ADMIN_RESOURCES.CHECK_INS ? "Check In" : resource === ACADEMIC_ADMIN_RESOURCES.AVAILABILITY_OVERRIDES ? "Create Override" : `New ${config.singular}`
  const filteredPersonnel = references?.personnel || []
  const selectedCheckInPerson = filteredPersonnel.find((item) => Number(item.id) === Number(pendingCheckIn?.personnel_id))
  const selectedCheckInFacility = references?.facilities?.find((item) => item.id === pendingCheckIn?.facility_id)

  return (
    <AdminShell>
      <PageHeader eyebrow="Admin CMS · Academic & Personnel" title={config.label} lead={PAGE_COPY[resource]} actions={<button type="button" onClick={() => openEditor()} className={button.primary}><Plus className="h-4 w-4" /> {actionLabel}</button>} />

      <section aria-label={`${config.label} filters`} className="mt-5 grid gap-2.5 rounded-3xl border border-[#E5E5E7] bg-white p-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
        <label className="relative sm:col-span-2 xl:col-span-1"><span className="sr-only">Search</span><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#86868B]" /><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} className={cn("min-h-11 w-full rounded-xl border border-[#D2D2D7] bg-white pl-9 pr-3 text-sm", focusRing)} placeholder={`Search ${config.label.toLowerCase()}`} /></label>
        <FilterSelect value={filters.departmentId} onChange={(value) => setFilters((current) => ({ ...current, departmentId: value }))}><option value="ALL">All departments</option>{references?.departments?.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}</FilterSelect>
        {resource === ACADEMIC_ADMIN_RESOURCES.PERSONNEL && <><FilterSelect value={filters.personnelType} onChange={(value) => setFilters((current) => ({ ...current, personnelType: value }))}><option value="ALL">All personnel types</option>{PERSONNEL_TYPES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</FilterSelect><FilterSelect value={filters.active} onChange={(value) => setFilters((current) => ({ ...current, active: value }))}><option value="ALL">All activity states</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></FilterSelect></>}
        {resource === ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES && <><FilterSelect value={filters.day} onChange={(value) => setFilters((current) => ({ ...current, day: value }))}><option value="ALL">All days</option>{DAYS.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}</FilterSelect><FilterSelect value={filters.status} onChange={(value) => setFilters((current) => ({ ...current, status: value }))}><option value="ALL">All statuses</option>{SCHEDULE_STATUSES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</FilterSelect><FilterSelect value={filters.personnelId} onChange={(value) => setFilters((current) => ({ ...current, personnelId: value }))}><option value="ALL">All professors</option>{filteredPersonnel.filter((item) => item.personnel_type === "FACULTY").map((item) => <option key={item.id} value={item.id}>{item.display_name}</option>)}</FilterSelect><FilterSelect value={filters.sectionId} onChange={(value) => setFilters((current) => ({ ...current, sectionId: value }))}><option value="ALL">All sections</option>{references?.sections?.map((item) => <option key={item.id} value={item.id}>{item.program} {item.year_level}-{item.section_name}</option>)}</FilterSelect><FilterSelect value={filters.facilityId} onChange={(value) => setFilters((current) => ({ ...current, facilityId: value }))}><option value="ALL">All facilities</option>{references?.facilities?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</FilterSelect></>}
        {!([ACADEMIC_ADMIN_RESOURCES.PERSONNEL, ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES].includes(resource)) && <button type="button" onClick={() => load()} className={button.smallSecondary}><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh</button>}
      </section>

      <div className="mt-3 flex justify-end"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#86868B]">Realtime: {realtimeStatus === "SUBSCRIBED" ? "Connected" : pretty(realtimeStatus)}</span></div>
      {error && <div role="alert" className="mt-4 rounded-2xl border border-[#D2D2D7] bg-white px-5 py-4 text-sm text-[#1D1D1F]">{error}</div>}

      <section aria-label={`${config.label} records`} className="mt-5 overflow-hidden rounded-3xl border border-[#E5E5E7] bg-white">
        {loading ? <div className="space-y-3 p-5">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-20 w-full" />)}</div> : records.length ? <>
          <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[920px] border-collapse text-left"><thead className="border-b border-[#E5E5E7] bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-[0.12em] text-[#86868B]"><tr><th className="px-5 py-3">Record</th><th className="px-4 py-3">Assignment</th><th className="px-4 py-3">Schedule / Window</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#E5E5E7]">{records.map((record) => <RecordRow key={record.id} resource={resource} record={record} busy={busy} onEdit={() => openEditor(record)} onDetails={() => showDetails(record.id)} runAction={runAction} navigate={navigate} />)}</tbody></table></div>
          <div className="divide-y divide-[#E5E5E7] md:hidden">{records.map((record) => <RecordCard key={record.id} resource={resource} record={record} busy={busy} onEdit={() => openEditor(record)} onDetails={() => showDetails(record.id)} runAction={runAction} navigate={navigate} />)}</div>
        </> : <div className="p-5"><EmptyState title={config.empty} message="No demo or fabricated production records are created automatically." action={<button type="button" onClick={() => openEditor()} className={button.smallPrimary}>{actionLabel}</button>} /></div>}
      </section>

      <AcademicAdminEditor resource={resource} record={selectedRecord} initialValues={initialValues} references={references} open={editorOpen} busy={busy} onOpenChange={setEditorOpen} onSave={save} />
      {pendingCheckIn && <CheckInConfirmation person={selectedCheckInPerson} facility={selectedCheckInFacility} busy={busy} onCancel={() => setPendingCheckIn(null)} onConfirm={confirmCheckIn} />}
      {(details || detailsLoading) && <PersonnelDetails details={details} loading={detailsLoading} onClose={() => setDetails(null)} />}
    </AdminShell>
  )
}

function FilterSelect({ value, onChange, children }) { return <label><span className="sr-only">Filter</span><select value={value} onChange={(event) => onChange(event.target.value)} className={cn("min-h-11 w-full rounded-xl border border-[#D2D2D7] bg-white px-3 text-sm", focusRing)}>{children}</select></label> }

function recordSummary(resource, record) {
  if (resource === ACADEMIC_ADMIN_RESOURCES.PERSONNEL) return [record.display_name, `${pretty(record.personnel_type)} · ${record.department?.code || "Department"}`]
  if (resource === ACADEMIC_ADMIN_RESOURCES.COURSES) return [record.code, record.name]
  if (resource === ACADEMIC_ADMIN_RESOURCES.SECTIONS) return [`${record.program} ${record.year_level}-${record.section_name}`, record.department?.name || "Department"]
  if (resource === ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES) return [record.course ? `${record.course.code} — ${record.course.name}` : `Class Schedule #${record.id}`, record.section ? `${record.section.program} ${record.section.year_level}-${record.section.section_name}` : "Section"]
  if (resource === ACADEMIC_ADMIN_RESOURCES.SCHEDULE_EXCEPTIONS) return [`${pretty(record.exception_type)} · ${formatDate(record.exception_date)}`, `Class Schedule #${record.class_schedule_id}`]
  if (resource === ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS) return [record.personnel?.display_name || "Personnel", record.role_label || "Scheduled assignment"]
  if (resource === ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS) return [record.personnel?.display_name || "Personnel", "Consultation schedule"]
  if (resource === ACADEMIC_ADMIN_RESOURCES.CHECK_INS) return [record.personnel?.display_name || "Personnel", `Source: ${pretty(record.source)}`]
  return [record.personnel?.display_name || "Personnel", pretty(record.override_type)]
}

function assignmentText(resource, record) {
  if (resource === ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES) return <><span>{record.personnel?.display_name || "Professor"}</span><FacilityLinks record={record} /></>
  if ([ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS, ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS, ACADEMIC_ADMIN_RESOURCES.CHECK_INS].includes(resource)) return <><FacilityLinks record={record} /></>
  if (resource === ACADEMIC_ADMIN_RESOURCES.SCHEDULE_EXCEPTIONS) return record.facility ? <FacilityLinks record={record} /> : <span>No room change</span>
  return <span>{record.department?.name || "—"}</span>
}

function scheduleText(resource, record) {
  if ([ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES, ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS, ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS].includes(resource)) return <><span>{dayLabel(record.day_of_week)} · {formatTime(record.start_time)}–{formatTime(record.end_time)}</span><span className="block text-[#86868B]">{formatDate(record.effective_from)} to {formatDate(record.effective_until)}</span></>
  if (resource === ACADEMIC_ADMIN_RESOURCES.CHECK_INS) return <><span>{formatDate(record.checked_in_at, true)}</span>{record.checked_out_at && <span className="block text-[#86868B]">Out {formatDate(record.checked_out_at, true)}</span>}</>
  if (resource === ACADEMIC_ADMIN_RESOURCES.AVAILABILITY_OVERRIDES) return <><span>{formatDate(record.starts_at, true)}</span><span className="block text-[#86868B]">to {formatDate(record.ends_at, true)}</span></>
  if (resource === ACADEMIC_ADMIN_RESOURCES.SCHEDULE_EXCEPTIONS) return <span>{formatDate(record.exception_date)}</span>
  return <span>{record.active === false ? "Inactive reference" : "Active reference"}</span>
}

function statusFor(resource, record) {
  if (resource === ACADEMIC_ADMIN_RESOURCES.PERSONNEL) return record.derivedStatus?.status || (record.active ? "NO_ACTIVE_SCHEDULE" : "INACTIVE")
  if (resource === ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES || resource === ACADEMIC_ADMIN_RESOURCES.CHECK_INS) return record.status
  if (resource === ACADEMIC_ADMIN_RESOURCES.SCHEDULE_EXCEPTIONS) return record.verification_status
  if (resource === ACADEMIC_ADMIN_RESOURCES.AVAILABILITY_OVERRIDES) return record.override_type
  return record.active ? "ACTIVE" : "INACTIVE"
}

function RecordRow(props) {
  const [title, subtitle] = recordSummary(props.resource, props.record)
  return <tr className="align-top"><td className="px-5 py-3"><p className="font-semibold text-[#1D1D1F]">{title}</p><p className="mt-1 text-xs text-[#86868B]">{subtitle}</p></td><td className="px-4 py-3 text-xs leading-relaxed text-[#48484A]">{assignmentText(props.resource, props.record)}</td><td className="px-4 py-3 text-xs leading-relaxed text-[#48484A]">{scheduleText(props.resource, props.record)}</td><td className="px-4 py-3"><StatusBadge status={statusFor(props.resource, props.record)} /></td><td className="px-5 py-3"><RecordActions {...props} /></td></tr>
}

function RecordCard(props) {
  const [title, subtitle] = recordSummary(props.resource, props.record)
  return <article className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-[#1D1D1F]">{title}</h2><p className="mt-1 text-xs text-[#86868B]">{subtitle}</p></div><StatusBadge status={statusFor(props.resource, props.record)} /></div><div className="mt-4 space-y-2 text-xs leading-relaxed text-[#48484A]">{assignmentText(props.resource, props.record)}{scheduleText(props.resource, props.record)}</div><div className="mt-4 border-t border-[#E5E5E7] pt-3"><RecordActions {...props} /></div></article>
}

function FacilityLinks({ record }) {
  if (!record.facility) return <span>Facility not specified</span>
  return <span className="mt-1 flex flex-wrap gap-2"><Link to={`/facilities/${record.facility.id}`} className="inline-flex items-center gap-1 font-semibold text-[#1D1D1F] underline underline-offset-2"><Eye className="h-3 w-3" />View Room</Link><Link to={`/map?facility=${record.facility.id}`} className="inline-flex items-center gap-1 font-semibold text-[#1D1D1F] underline underline-offset-2"><Navigation className="h-3 w-3" />Navigate</Link></span>
}

function RecordActions({ resource, record, busy, onEdit, onDetails, runAction, navigate }) {
  const serviceAction = (fn, title) => runAction(fn, title)
  return <div className="flex flex-wrap justify-end gap-1">
    {resource === ACADEMIC_ADMIN_RESOURCES.PERSONNEL && <button type="button" onClick={onDetails} disabled={busy} title="View details" aria-label={`View ${record.display_name}`} className={iconButton}><Eye className="h-4 w-4" /></button>}
    {resource !== ACADEMIC_ADMIN_RESOURCES.CHECK_INS && <button type="button" onClick={onEdit} disabled={busy} title="Edit" aria-label={`Edit record ${record.id}`} className={iconButton}><Edit3 className="h-4 w-4" /></button>}
    {[ACADEMIC_ADMIN_RESOURCES.PERSONNEL, ACADEMIC_ADMIN_RESOURCES.COURSES, ACADEMIC_ADMIN_RESOURCES.SECTIONS, ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS, ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS].includes(resource) && <button type="button" disabled={busy} onClick={() => serviceAction((service) => service.setAcademicRecordActive(resource, record.id, !record.active), record.active ? "Record deactivated" : "Record activated")} title={record.active ? "Deactivate" : "Activate"} className={iconButton}>{record.active ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</button>}
    {resource === ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES && <><button type="button" disabled={busy} onClick={() => navigate(`/admin/schedule-exceptions?scheduleId=${record.id}`)} title="Add exception" className={iconButton}><CalendarPlus className="h-4 w-4" /></button>{record.status !== "CANCELLED" && <button type="button" disabled={busy} onClick={() => serviceAction((service) => service.cancelClassSchedule(record.id), "Class schedule cancelled")} title="Cancel class" className={iconButton}><Ban className="h-4 w-4" /></button>}</>}
    {resource === ACADEMIC_ADMIN_RESOURCES.CHECK_INS && record.status === "ACTIVE" && <button type="button" disabled={busy} onClick={() => serviceAction((service) => service.checkOutPersonnel(record.id), "Personnel checked out")} className={button.smallSecondary}><LogOut className="h-3.5 w-3.5" />Check Out</button>}
    {resource === ACADEMIC_ADMIN_RESOURCES.AVAILABILITY_OVERRIDES && new Date(record.ends_at) > new Date() && <button type="button" disabled={busy} onClick={() => serviceAction((service) => service.endAvailabilityOverride(record), "Override ended")} className={button.smallSecondary}>End Override</button>}
  </div>
}
const iconButton = cn("rounded-full p-2 text-[#48484A] hover:bg-[#F5F5F7]", focusRing)

function CheckInConfirmation({ person, facility, busy, onCancel, onConfirm }) {
  return <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4"><section role="alertdialog" aria-modal="true" aria-labelledby="checkin-title" className="w-full max-w-lg rounded-3xl border border-[#D2D2D7] bg-white p-6 shadow-2xl"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F5F7]"><UserCheck className="h-5 w-5" /></div><h2 id="checkin-title" className="mt-4 text-xl font-semibold text-[#1D1D1F]">Confirm Check-In</h2><dl className="mt-5 grid gap-3 rounded-2xl bg-[#F5F5F7] p-4 text-sm"><div><dt className="text-xs text-[#6E6E73]">Personnel</dt><dd className="font-semibold text-[#1D1D1F]">{person?.display_name || "Selected personnel"}</dd></div><div><dt className="text-xs text-[#6E6E73]">Facility</dt><dd className="font-semibold text-[#1D1D1F]">{facility?.name || "Selected facility"}</dd></div></dl><p className="mt-4 text-sm leading-relaxed text-[#48484A]">This action will mark this personnel record as currently checked in.</p><div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onCancel} className={button.smallSecondary}>Cancel</button><button type="button" disabled={busy} onClick={onConfirm} className={button.smallPrimary}>{busy ? "Confirming…" : "Confirm"}</button></div></section></div>
}

function PersonnelDetails({ details, loading, onClose }) {
  const person = details?.personnel
  const next = details?.nextAvailability
  return <div className="fixed inset-0 z-[90] flex justify-end bg-black/60" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside role="dialog" aria-modal="true" aria-labelledby="personnel-details-title" className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#86868B]">Personnel Details</p><h2 id="personnel-details-title" className="mt-2 text-3xl font-semibold tracking-tight text-[#1D1D1F]">{person?.display_name || "Loading…"}</h2></div><button type="button" onClick={onClose} className={iconButton} aria-label="Close details"><X className="h-5 w-5" /></button></div>{loading ? <div className="mt-8 space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-48 w-full" /></div> : details && <div className="mt-7 space-y-5"><DetailBlock title="Public Profile"><p>{pretty(person.personnel_type)} · {person.public_visibility ? "Public" : "Not public"} · {person.active ? "Active" : "Inactive"}</p></DetailBlock><DetailBlock title="Current Derived Status"><StatusBadge status={details.currentStatus?.status || "NO_ACTIVE_SCHEDULE"} /><p className="mt-2 text-xs text-[#6E6E73]">Derived by the existing personnelService precedence. A schedule is never treated as a check-in.</p></DetailBlock><DetailBlock title="Next Available"><p className="font-semibold">{next ? `${formatDate(next.startAt, true)} – ${formatDate(next.endAt, true)}` : "Availability cannot be determined."}</p></DetailBlock><DetailBlock title="Current Class / Class Schedule"><p>{details.currentStatus?.source === "CLASS_SCHEDULE" ? "Current class is active in the schedule engine." : "No current class."}</p><p className="mt-1 text-xs text-[#6E6E73]">{details.classSchedules.length} recurring class schedule record(s)</p></DetailBlock><DetailBlock title="Facility Assignments"><p>{details.assignments.length ? `${details.assignments.length} scheduled assignment(s)` : "No facility assignments."}</p></DetailBlock><DetailBlock title="Consultation Hours"><p>{details.consultations.length ? `${details.consultations.length} consultation schedule(s)` : "No consultation hours."}</p></DetailBlock><DetailBlock title="Active Check-In"><p>{details.activeCheckIn ? `Currently checked in at ${details.activeCheckIn.facility?.name || "an approved facility"}.` : "No active check-in."}</p></DetailBlock><DetailBlock title="Availability Override"><p>{details.activeOverride ? pretty(details.activeOverride.override_type) : "No active availability override."}</p></DetailBlock></div>}</aside></div>
}
function DetailBlock({ title, children }) { return <section className="rounded-2xl border border-[#E5E5E7] p-4"><h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#86868B]">{title}</h3><div className="mt-2 text-sm text-[#1D1D1F]">{children}</div></section> }
