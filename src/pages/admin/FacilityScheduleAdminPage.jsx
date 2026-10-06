import { CalendarX2, Edit3, Plus, RefreshCw, Search, Send, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminShell from "@/components/admin/AdminShell"
import FacilityScheduleEditor from "@/components/admin/FacilityScheduleEditor"
import useModalDialog from "@/components/campus/useModalDialog"
import { EmptyState, PageHeader, Skeleton, StatusBadge, button, focusRing } from "@/components/campus/ui"
import { useToast } from "@/components/ui/use-toast"
import { isNonOfficialFacilityAdminRecord, safeFacilityAdminMessage } from "@/lib/facilityAdminUi"
import { cn } from "@/lib/utils"
import { getAdminService } from "@/services/adminService"
import { FACILITY_ADMIN_LIFECYCLES, FACILITY_ADMIN_RESOURCES } from "@/services/facilityAdminService"

const WEEKDAYS = Object.freeze(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
const pretty = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
const sentence = (value) => value.charAt(0).toUpperCase() + value.slice(1)
const formatDateTime = (value) => value ? new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }).format(new Date(value)) : "Not set"
const formatTime = (value) => value ? String(value).slice(0, 5) : "—"

const RESOURCE_UI = Object.freeze({
  [FACILITY_ADMIN_RESOURCES.HOURS]: {
    title: "Operating Hours",
    singular: "weekly-hours record",
    newLabel: "Add weekly hours",
    lead: "Maintain recurring Manila-time operating intervals without storing or manually overriding computed facility status.",
    listMethod: "listFacilityHours",
    createMethod: "createFacilityHours",
    updateMethod: "updateFacilityHours",
    publishMethod: "publishFacilityHours",
    expireMethod: "expireFacilityHours",
    deleteMethod: "deleteFacilityHours",
  },
  [FACILITY_ADMIN_RESOURCES.EXCEPTIONS]: {
    title: "Hour Exceptions",
    singular: "dated exception",
    newLabel: "Add dated exception",
    lead: "Maintain Manila-date replacement schedules that supersede weekly hours for one campus date.",
    listMethod: "listFacilityHourExceptions",
    createMethod: "createFacilityHourException",
    updateMethod: "updateFacilityHourException",
    publishMethod: "publishFacilityHourException",
    expireMethod: "expireFacilityHourException",
    deleteMethod: "deleteFacilityHourException",
  },
})

export default function FacilityScheduleAdminPage({ resource }) {
  const config = RESOURCE_UI[resource]
  const isHours = resource === FACILITY_ADMIN_RESOURCES.HOURS
  const navigate = useNavigate()
  const { toast } = useToast()
  const [records, setRecords] = useState([])
  const [facilities, setFacilities] = useState([])
  const [filters, setFilters] = useState({ search: "", lifecycle: "ALL", facilityId: "ALL" })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const handleError = useCallback((serviceError) => {
    const nextError = { code: serviceError?.code || "ADMIN_ERROR", message: safeFacilityAdminMessage(serviceError) }
    setError(nextError)
    if (serviceError?.code === "SESSION_EXPIRED") navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`)
    return nextError
  }, [navigate])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const service = await getAdminService()
      const [nextRecords, references] = await Promise.all([service[config.listMethod](), service.loadFacilityAdminReferences()])
      const profileIds = new Set((references.profiles || []).map((profile) => profile.facility_id))
      setRecords(nextRecords)
      setFacilities((references.facilities || []).filter((facility) => profileIds.has(facility.id)))
      return nextRecords
    } catch (loadError) {
      handleError(loadError)
      return []
    } finally {
      setLoading(false)
    }
  }, [config.listMethod, handleError])

  useEffect(() => { load() }, [load])

  const facilityById = useMemo(() => new Map(facilities.map((facility) => [facility.id, facility])), [facilities])
  const rows = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    return records.filter((record) => {
      const facility = facilityById.get(record.facility_id)
      const schedule = isHours ? WEEKDAYS[record.day_of_week] : record.exception_date
      const interval = record.closed_all_day ? "closed all day" : `${record.start_time} ${record.end_time}`
      const text = `${facility?.name || ""} ${record.facility_id} ${facility?.floor || ""} ${schedule} ${interval}`.toLowerCase()
      return (!query || text.includes(query))
        && (filters.lifecycle === "ALL" || record.lifecycle === filters.lifecycle)
        && (filters.facilityId === "ALL" || record.facility_id === filters.facilityId)
    })
  }, [facilityById, filters, isHours, records])

  const closeEditor = (nextOpen) => {
    setEditorOpen(nextOpen)
    if (!nextOpen) setSelectedRecord(null)
  }

  const cleanupCreated = async (service, created) => {
    for (const row of [...created].reverse()) {
      try { await service[config.deleteMethod](row.id, { expectedUpdatedAt: row.updated_at }) } catch { /* Best-effort cleanup; the original safe error remains authoritative. */ }
    }
  }

  const save = async ({ primaryPayload, additionalPayloads }) => {
    setBusy(true)
    setError(null)
    const created = []
    let service = null
    try {
      service = await getAdminService()
      if (selectedRecord) {
        for (const payload of additionalPayloads) created.push(await service[config.createMethod]({
          ...payload,
          lifecycle: "DRAFT",
          public_visibility: false,
          published_at: null,
          verification_status: "PENDING_VERIFICATION",
          data_status: "PENDING_VERIFICATION",
          last_verified_at: null,
        }))
        await service[config.updateMethod](selectedRecord.id, primaryPayload, { expectedUpdatedAt: selectedRecord.updated_at })
      } else {
        created.push(await service[config.createMethod](primaryPayload))
        for (const payload of additionalPayloads) created.push(await service[config.createMethod](payload))
      }
      closeEditor(false)
      toast({ title: selectedRecord ? "Schedule changes saved" : `${created.length} ${created.length === 1 ? "record" : "records"} created as draft`, description: "Source rows were saved through the accepted Admin service and recorded in Audit Activity." })
      await load()
    } catch (saveError) {
      if (created.length && service) await cleanupCreated(service, created)
      if (saveError?.code === "SESSION_EXPIRED") handleError(saveError)
      throw saveError
    } finally {
      setBusy(false)
    }
  }

  const runLifecycleAction = async (record, method, successTitle) => {
    setBusy(true)
    setError(null)
    try {
      const service = await getAdminService()
      await service[method](record.id, { expectedUpdatedAt: record.updated_at })
      toast({ title: successTitle, description: "Change saved and recorded in Audit Activity." })
      await load()
    } catch (actionError) {
      handleError(actionError)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!deleteRecord) return
    setBusy(true)
    setError(null)
    try {
      const service = await getAdminService()
      await service[config.deleteMethod](deleteRecord.id, { expectedUpdatedAt: deleteRecord.updated_at })
      setDeleteRecord(null)
      toast({ title: `${sentence(config.singular)} deleted`, description: "Only the selected disposable source row was removed." })
      await load()
    } catch (deleteError) {
      setDeleteRecord(null)
      handleError(deleteError)
    } finally {
      setBusy(false)
    }
  }

  const reloadEditorRecord = async () => {
    if (!selectedRecord) return
    setBusy(true)
    try {
      const service = await getAdminService()
      const nextRecords = await service[config.listMethod]()
      setRecords(nextRecords)
      const current = nextRecords.find((record) => record.id === selectedRecord.id)
      if (!current) throw Object.assign(new Error("Record not found"), { code: "NOT_FOUND" })
      setSelectedRecord(current)
      setError(null)
    } catch (reloadError) {
      handleError(reloadError)
    } finally {
      setBusy(false)
    }
  }

  const deleteDialogRef = useModalDialog({ active: Boolean(deleteRecord), onClose: busy ? null : () => setDeleteRecord(null) })
  const newDisabled = facilities.length === 0

  return <AdminShell>
    <PageHeader eyebrow="Admin CMS · Facility Operations" title={config.title} lead={config.lead} actions={<button type="button" disabled={newDisabled} onClick={() => setEditorOpen(true)} className={button.primary}><Plus className="h-4 w-4" aria-hidden="true" />{newDisabled ? "Create a facility profile first" : config.newLabel}</button>} />

    <section aria-label={`${config.title} filters`} className="mt-5 grid gap-2.5 rounded-3xl border border-line bg-surface p-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(10rem,220px)_minmax(10rem,190px)_auto]">
      <label className="relative"><span className="sr-only">Search {config.title.toLowerCase()}</span><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-ink-faint" aria-hidden="true" /><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} className={cn("min-h-11 w-full rounded-xl border border-line-strong bg-surface pl-9 pr-3 text-sm", focusRing)} placeholder="Search facility, floor, day, date, or interval" /></label>
      <label><span className="sr-only">Facility filter</span><select value={filters.facilityId} onChange={(event) => setFilters((current) => ({ ...current, facilityId: event.target.value }))} className={cn("min-h-11 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm", focusRing)}><option value="ALL">All facility profiles</option>{facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name} · {facility.floor}</option>)}</select></label>
      <label><span className="sr-only">Lifecycle filter</span><select value={filters.lifecycle} onChange={(event) => setFilters((current) => ({ ...current, lifecycle: event.target.value }))} className={cn("min-h-11 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm", focusRing)}><option value="ALL">All lifecycle states</option>{FACILITY_ADMIN_LIFECYCLES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</select></label>
      <button type="button" disabled={loading} onClick={load} className={button.smallSecondary}><RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />Refresh</button>
    </section>

    <p className="mt-3 text-xs leading-relaxed text-ink-soft">{records.length} configured source rows · {facilities.length} eligible facility profiles · Configured or published does not mean verified or official.</p>
    {error && <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line-strong bg-surface px-5 py-4 text-sm text-ink"><span>{error.message}{["DELETE_CONFLICT", "DELETE_NOT_ALLOWED"].includes(error.code) ? " Prefer Expire or refresh the record." : ""}</span><button type="button" onClick={load} className={button.smallSecondary}>Refresh</button></div>}

    <section aria-label={`${config.title} records`} className="mt-4 overflow-hidden rounded-3xl border border-line bg-surface">
      {loading ? <div className="space-y-3 p-5">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-24 w-full" />)}</div> : rows.length ? <><div className="hidden overflow-x-auto xl:block"><table className="w-full min-w-[900px] border-collapse text-left"><thead className="border-b border-line bg-subtle text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft"><tr><th className="px-5 py-3">Facility</th><th className="px-4 py-3">{isHours ? "Weekday" : "Campus date"}</th><th className="px-4 py-3">Interval</th><th className="px-4 py-3">Lifecycle</th><th className="px-4 py-3">Verification / Updated</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-line">{rows.map((record) => <ScheduleRow key={record.id} record={record} facility={facilityById.get(record.facility_id)} isHours={isHours} busy={busy} onEdit={() => { setSelectedRecord(record); setEditorOpen(true) }} onPublish={() => runLifecycleAction(record, config.publishMethod, `${sentence(config.singular)} published`)} onExpire={() => runLifecycleAction(record, config.expireMethod, `${sentence(config.singular)} expired`)} onDelete={() => setDeleteRecord(record)} />)}</tbody></table></div><div className="divide-y divide-line xl:hidden">{rows.map((record) => <ScheduleCard key={record.id} record={record} facility={facilityById.get(record.facility_id)} isHours={isHours} busy={busy} onEdit={() => { setSelectedRecord(record); setEditorOpen(true) }} onPublish={() => runLifecycleAction(record, config.publishMethod, `${sentence(config.singular)} published`)} onExpire={() => runLifecycleAction(record, config.expireMethod, `${sentence(config.singular)} expired`)} onDelete={() => setDeleteRecord(record)} />)}</div></> : <div className="p-5"><EmptyState title={`No ${config.title.toLowerCase()} match`} message="No official or demo schedule records are generated automatically. Change the filters or add an explicitly sourced record." /></div>}
    </section>

    <FacilityScheduleEditor resource={resource} record={selectedRecord} facilities={facilities} open={editorOpen} busy={busy} onOpenChange={closeEditor} onSave={save} onReload={reloadEditorRecord} />

    {deleteRecord && <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => event.target === event.currentTarget && !busy && setDeleteRecord(null)}><section ref={deleteDialogRef} role="alertdialog" aria-modal="true" aria-labelledby="schedule-delete-title" aria-describedby="schedule-delete-description" className="w-full max-w-lg rounded-2xl border border-line-strong bg-surface p-6 shadow-2xl sm:rounded-3xl"><h2 id="schedule-delete-title" className="text-lg font-semibold text-ink">Delete this {config.singular}?</h2><p id="schedule-delete-description" className="mt-2 text-sm leading-relaxed text-ink-soft">Only disposable draft or explicitly demo/development rows may be deleted. Prefer Expire to retain operational history. No related row will be force-deleted.</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={busy} onClick={() => setDeleteRecord(null)} className={button.smallSecondary}>Keep record</button><button type="button" disabled={busy} onClick={remove} className={cn(button.smallPrimary, "bg-ink-strong font-semibold ring-2 ring-ink-strong ring-offset-2 ring-offset-surface hover:bg-ink")}>{busy ? "Deleting…" : "Delete disposable record"}</button></div></section></div>}
  </AdminShell>
}

function scheduleLabel(record, isHours) {
  return isHours ? WEEKDAYS[record.day_of_week] || `Weekday ${record.day_of_week}` : record.exception_date
}

function intervalLabel(record) {
  if (record.closed_all_day) return "Closed all day"
  const overnight = String(record.end_time) <= String(record.start_time)
  return `${formatTime(record.start_time)}–${formatTime(record.end_time)}${overnight ? " · Overnight" : ""}`
}

function actionLabel(record, facility, isHours) {
  return `${isHours ? "hours" : "exception"} for ${facility?.name || record.facility_id} on ${scheduleLabel(record, isHours)} at ${intervalLabel(record)}`
}

function ScheduleActions({ record, facility, isHours, busy, onEdit, onPublish, onExpire, onDelete }) {
  const label = actionLabel(record, facility, isHours)
  return <div className="flex flex-wrap justify-end gap-1.5"><button type="button" disabled={busy} onClick={onEdit} aria-label={`Edit ${label}`} className={button.smallSecondary}><Edit3 className="h-3.5 w-3.5" aria-hidden="true" />Edit</button>{record.lifecycle !== "PUBLISHED" && <button type="button" disabled={busy} onClick={onPublish} aria-label={`Publish ${label}`} className={button.smallPrimary}><Send className="h-3.5 w-3.5" aria-hidden="true" />Publish</button>}{!["EXPIRED", "CANCELLED"].includes(record.lifecycle) && <button type="button" disabled={busy} onClick={onExpire} aria-label={`Expire ${label}`} className={button.smallSecondary}><CalendarX2 className="h-3.5 w-3.5" aria-hidden="true" />Expire</button>}<button type="button" disabled={busy} onClick={onDelete} aria-label={`Delete ${label}`} className={cn(button.smallSecondary, "border-2 border-ink-strong font-semibold text-ink-strong hover:bg-fill")}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" />Delete</button></div>
}

function Verification({ record }) {
  return <div className="flex flex-wrap gap-1.5"><StatusBadge status={record.verification_status} />{isNonOfficialFacilityAdminRecord(record) && <StatusBadge status="DEMO_ONLY" label="Demo · non-official" />}</div>
}

function ScheduleRow({ record, facility, isHours, busy, onEdit, onPublish, onExpire, onDelete }) {
  return <tr className="align-top"><td className="px-5 py-4"><p className="font-semibold text-ink">{facility?.name || record.facility_id}</p><p className="mt-1 text-xs text-ink-soft">{facility ? `${facility.floor} · ${facility.id}` : record.facility_id}</p></td><td className="px-4 py-4 text-sm text-ink-mid">{scheduleLabel(record, isHours)}</td><td className="px-4 py-4 text-sm font-semibold text-ink">{intervalLabel(record)}</td><td className="px-4 py-4"><StatusBadge status={record.lifecycle} /></td><td className="px-4 py-4 text-xs text-ink-mid"><Verification record={record} /><span className="mt-1 block text-ink-soft">{formatDateTime(record.updated_at)}</span></td><td className="px-5 py-4"><ScheduleActions record={record} facility={facility} isHours={isHours} busy={busy} onEdit={onEdit} onPublish={onPublish} onExpire={onExpire} onDelete={onDelete} /></td></tr>
}

function ScheduleCard({ record, facility, isHours, busy, onEdit, onPublish, onExpire, onDelete }) {
  return <article className="p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-semibold text-ink">{facility?.name || record.facility_id}</h2><p className="mt-1 text-xs text-ink-soft">{facility ? `${facility.floor} · ${facility.id}` : record.facility_id}</p></div><StatusBadge status={record.lifecycle} /></div><dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2"><div><dt className="font-bold uppercase tracking-[0.08em] text-ink-faint">{isHours ? "Weekday" : "Campus date"}</dt><dd className="mt-1 text-ink-mid">{scheduleLabel(record, isHours)}</dd></div><div><dt className="font-bold uppercase tracking-[0.08em] text-ink-faint">Interval</dt><dd className="mt-1 font-semibold text-ink">{intervalLabel(record)}</dd></div><div><dt className="font-bold uppercase tracking-[0.08em] text-ink-faint">Verification</dt><dd className="mt-1"><Verification record={record} /></dd></div><div><dt className="font-bold uppercase tracking-[0.08em] text-ink-faint">Last updated</dt><dd className="mt-1 text-ink-mid">{formatDateTime(record.updated_at)}</dd></div></dl><div className="mt-4 border-t border-line pt-4"><ScheduleActions record={record} facility={facility} isHours={isHours} busy={busy} onEdit={onEdit} onPublish={onPublish} onExpire={onExpire} onDelete={onDelete} /></div></article>
}
