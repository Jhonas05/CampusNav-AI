import { CalendarX2, Edit3, Plus, RefreshCw, Search, Send, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminShell from "@/components/admin/AdminShell"
import FacilityOperationsEditor from "@/components/admin/FacilityOperationsEditor"
import { EmptyState, PageHeader, Skeleton, StatusBadge, button, focusRing } from "@/components/campus/ui"
import { useToast } from "@/components/ui/use-toast"
import { isNonOfficialFacilityAdminRecord, safeFacilityAdminMessage } from "@/lib/facilityAdminUi"
import { cn } from "@/lib/utils"
import { getAdminService } from "@/services/adminService"
import { FACILITY_ADMIN_LIFECYCLES, FACILITY_ADMIN_RESOURCES } from "@/services/facilityAdminService"

const pretty = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }).format(new Date(value)) : "Not set"

const RESOURCE_UI = Object.freeze({
  [FACILITY_ADMIN_RESOURCES.PROFILES]: {
    title: "Facilities",
    singular: "facility profile",
    newLabel: "New profile",
    lead: "Maintain operational descriptions, public contacts, lifecycle, and provenance without changing canonical facility identity or spatial truth.",
    listMethod: "listFacilityOperationalProfiles",
    createMethod: "createFacilityOperationalProfile",
    updateMethod: "updateFacilityOperationalProfile",
    publishMethod: "publishFacilityOperationalProfile",
    expireMethod: "expireFacilityOperationalProfile",
    deleteMethod: "deleteFacilityOperationalProfile",
  },
  [FACILITY_ADMIN_RESOURCES.SERVICES]: {
    title: "Services",
    singular: "service",
    newLabel: "New service",
    lead: "Maintain the provider-neutral service catalog with stable codes, explicit publication, and visible verification state.",
    listMethod: "listFacilityAdminServices",
    createMethod: "createFacilityAdminServiceRecord",
    updateMethod: "updateFacilityAdminServiceRecord",
    publishMethod: "publishFacilityAdminServiceRecord",
    expireMethod: "expireFacilityAdminServiceRecord",
    deleteMethod: "deleteFacilityAdminServiceRecord",
  },
})

export default function FacilityOperationsAdminPage({ resource }) {
  const config = RESOURCE_UI[resource]
  const isProfile = resource === FACILITY_ADMIN_RESOURCES.PROFILES
  const navigate = useNavigate()
  const { toast } = useToast()
  const [records, setRecords] = useState([])
  const [facilities, setFacilities] = useState([])
  const [departments, setDepartments] = useState([])
  const [filters, setFilters] = useState({ search: "", lifecycle: "ALL" })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [initialIdentity, setInitialIdentity] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const handleError = useCallback((serviceError) => {
    const nextError = { code: serviceError?.code || "ADMIN_ERROR", message: safeFacilityAdminMessage(serviceError) }
    setError(nextError)
    if (serviceError?.code === "SESSION_EXPIRED") {
      navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`)
    }
    return nextError
  }, [navigate])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const service = await getAdminService()
      const [nextRecords, nextDepartments] = await Promise.all([
        service[config.listMethod](),
        service.listFacilityAdminDepartments(),
      ])
      setRecords(nextRecords)
      setDepartments(nextDepartments)
      setFacilities(service.listCanonicalFacilities())
      return nextRecords
    } catch (loadError) {
      handleError(loadError)
      return []
    } finally {
      setLoading(false)
    }
  }, [config.listMethod, handleError])

  useEffect(() => { load() }, [load])

  const profileByFacility = useMemo(() => new Map(records.map((record) => [record.facility_id, record])), [records])
  const rows = useMemo(() => {
    const candidates = isProfile
      ? facilities.map((facility) => ({ ...facility, record: profileByFacility.get(facility.id) || null }))
      : records.map((record) => ({ record }))
    const query = filters.search.trim().toLowerCase()
    return candidates.filter((item) => {
      const record = item.record
      const text = isProfile
        ? `${item.name} ${item.id} ${item.floor} ${record?.description || ""}`
        : `${record.code} ${record.name} ${record.description || ""}`
      return (!query || text.toLowerCase().includes(query))
        && (filters.lifecycle === "ALL" || record?.lifecycle === filters.lifecycle)
    })
  }, [facilities, filters.lifecycle, filters.search, isProfile, profileByFacility, records])

  const missingFacilities = useMemo(() => facilities.filter((facility) => !profileByFacility.has(facility.id)), [facilities, profileByFacility])

  const openEditor = (record = null, identity = null) => {
    setSelectedRecord(record)
    setInitialIdentity(identity)
    setEditorOpen(true)
  }

  const closeEditor = (nextOpen) => {
    setEditorOpen(nextOpen)
    if (!nextOpen) {
      setSelectedRecord(null)
      setInitialIdentity(null)
    }
  }

  const save = async (payload) => {
    setBusy(true)
    setError(null)
    try {
      const service = await getAdminService()
      if (selectedRecord) {
        await service[config.updateMethod](selectedRecord.id, payload, { expectedUpdatedAt: selectedRecord.updated_at })
      } else {
        await service[config.createMethod](payload)
      }
      closeEditor(false)
      toast({ title: selectedRecord ? "Changes saved" : `${pretty(config.singular)} created as draft`, description: "Change saved and recorded in Audit Activity." })
      await load()
    } catch (saveError) {
      handleError(saveError)
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
      toast({ title: `${pretty(config.singular)} deleted`, description: "The disposable record was removed and recorded in Audit Activity." })
      setDeleteRecord(null)
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

  const editorFacilities = selectedRecord ? facilities : missingFacilities
  const newDisabled = isProfile && missingFacilities.length === 0

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Admin CMS · Facility Operations"
        title={config.title}
        lead={config.lead}
        actions={<button type="button" disabled={newDisabled} onClick={() => openEditor()} className={button.primary}><Plus className="h-4 w-4" aria-hidden="true" />{newDisabled ? "All profiles configured" : config.newLabel}</button>}
      />

      <section aria-label={`${config.title} filters`} className="mt-5 grid gap-2.5 rounded-3xl border border-[#E5E5E7] bg-white p-3 sm:grid-cols-[minmax(220px,1fr)_180px_auto]">
        <label className="relative">
          <span className="sr-only">Search {config.title.toLowerCase()}</span>
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#86868B]" aria-hidden="true" />
          <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} className={cn("min-h-11 w-full rounded-xl border border-[#D2D2D7] bg-white pl-9 pr-3 text-sm", focusRing)} placeholder={isProfile ? "Search facility, ID, or floor" : "Search service name or code"} />
        </label>
        <label>
          <span className="sr-only">Lifecycle filter</span>
          <select value={filters.lifecycle} onChange={(event) => setFilters((current) => ({ ...current, lifecycle: event.target.value }))} className={cn("min-h-11 w-full rounded-xl border border-[#D2D2D7] bg-white px-3 text-sm", focusRing)}>
            <option value="ALL">All lifecycle states</option>
            {FACILITY_ADMIN_LIFECYCLES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}
          </select>
        </label>
        <button type="button" disabled={loading} onClick={load} className={button.smallSecondary}><RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />Refresh</button>
      </section>

      <p className="mt-3 text-xs leading-relaxed text-[#6E6E73]">
        {isProfile ? `${facilities.length} canonical facilities · ${records.length} operational profiles` : `${records.length} configured services`} · Configured does not mean verified or official.
      </p>

      {error && (
        <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D2D2D7] bg-white px-5 py-4 text-sm text-[#1D1D1F]">
          <span>{error.message}{["DELETE_CONFLICT", "DELETE_NOT_ALLOWED"].includes(error.code) ? " Prefer Expire or refresh the record." : ""}</span>
          <button type="button" onClick={load} className={button.smallSecondary}>Refresh</button>
        </div>
      )}

      <section aria-label={`${config.title} records`} className="mt-4 overflow-hidden rounded-3xl border border-[#E5E5E7] bg-white">
        {loading ? (
          <div className="space-y-3 p-5">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-24 w-full" />)}</div>
        ) : rows.length ? <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead className="border-b border-[#E5E5E7] bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-[0.12em] text-[#6E6E73]">
                <tr><th className="px-5 py-3">{isProfile ? "Facility" : "Service"}</th><th className="px-4 py-3">{isProfile ? "Overlay state" : "Department"}</th><th className="px-4 py-3">Lifecycle</th><th className="px-4 py-3">Verification</th><th className="px-4 py-3">Visibility / Updated</th><th className="px-5 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E7]">{rows.map((item) => <OperationsRow key={isProfile ? item.id : item.record.id} item={item} isProfile={isProfile} departments={departments} busy={busy} onEdit={openEditor} onPublish={(record) => runLifecycleAction(record, config.publishMethod, `${pretty(config.singular)} published`)} onExpire={(record) => runLifecycleAction(record, config.expireMethod, `${pretty(config.singular)} expired`)} onDelete={setDeleteRecord} />)}</tbody>
            </table>
          </div>
          <div className="divide-y divide-[#E5E5E7] lg:hidden">{rows.map((item) => <OperationsCard key={isProfile ? item.id : item.record.id} item={item} isProfile={isProfile} departments={departments} busy={busy} onEdit={openEditor} onPublish={(record) => runLifecycleAction(record, config.publishMethod, `${pretty(config.singular)} published`)} onExpire={(record) => runLifecycleAction(record, config.expireMethod, `${pretty(config.singular)} expired`)} onDelete={setDeleteRecord} />)}</div>
        </> : (
          <div className="p-5"><EmptyState title={`No ${config.title.toLowerCase()} match`} message={isProfile ? "All canonical facilities remain in the registry; clear filters to see missing profiles." : "No official or demo services are created automatically."} /></div>
        )}
      </section>

      <FacilityOperationsEditor resource={resource} record={selectedRecord} initialIdentity={initialIdentity} facilities={editorFacilities} departments={departments} open={editorOpen} busy={busy} onOpenChange={closeEditor} onSave={save} onReload={reloadEditorRecord} />

      {deleteRecord && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => event.target === event.currentTarget && !busy && setDeleteRecord(null)}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="facility-delete-title" aria-describedby="facility-delete-description" className="w-full max-w-lg rounded-2xl border border-[#D2D2D7] bg-white p-6 shadow-2xl sm:rounded-3xl">
            <h2 id="facility-delete-title" className="text-lg font-semibold text-[#1D1D1F]">Delete this {config.singular}?</h2>
            <p id="facility-delete-description" className="mt-2 text-sm leading-relaxed text-[#6E6E73]">Hard deletion is allowed only for disposable, unreferenced records. Prefer Expire to retain operational history. No dependent record will be force-deleted.</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" autoFocus disabled={busy} onClick={() => setDeleteRecord(null)} className={button.smallSecondary}>Keep record</button>
              <button type="button" disabled={busy} onClick={remove} className={cn(button.smallPrimary, "bg-[#B3261E] hover:bg-red-800")}>{busy ? "Deleting…" : "Delete disposable record"}</button>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  )
}

function identityFor(item, isProfile) {
  if (isProfile) return { title: item.name, subtitle: `${item.floor} · ${item.id}` }
  return { title: item.record.name, subtitle: item.record.code }
}

function departmentName(record, departments) {
  if (!record?.department_id) return "No department assigned"
  const department = departments.find((item) => Number(item.id) === Number(record.department_id))
  return department ? `${department.code} — ${department.name}` : "Department reference unavailable"
}

function VerificationState({ record }) {
  if (!record) return <StatusBadge status="PENDING_VERIFICATION" label="No profile" />
  const nonOfficial = isNonOfficialFacilityAdminRecord(record)
  return <div className="flex flex-wrap gap-1.5"><StatusBadge status={record.verification_status} />{nonOfficial && <StatusBadge status="DEMO_ONLY" label="Demo · non-official" />}</div>
}

/** @param {any} props */
function RecordActions({ item, isProfile, busy, onEdit, onPublish, onExpire, onDelete }) {
  const record = item.record
  if (!record) return <button type="button" disabled={busy} onClick={() => onEdit(null, item.id)} className={button.smallPrimary}><Plus className="h-3.5 w-3.5" aria-hidden="true" />Create profile</button>
  const label = isProfile ? item.name : record.name
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <button type="button" disabled={busy} onClick={() => onEdit(record)} aria-label={`Edit ${label}`} className={button.smallSecondary}><Edit3 className="h-3.5 w-3.5" aria-hidden="true" />Edit</button>
      {record.lifecycle !== "PUBLISHED" && <button type="button" disabled={busy} onClick={() => onPublish(record)} aria-label={`Publish ${label}`} className={button.smallPrimary}><Send className="h-3.5 w-3.5" aria-hidden="true" />Publish</button>}
      {!['EXPIRED', 'CANCELLED'].includes(record.lifecycle) && <button type="button" disabled={busy} onClick={() => onExpire(record)} aria-label={`Expire ${label}`} className={button.smallSecondary}><CalendarX2 className="h-3.5 w-3.5" aria-hidden="true" />Expire</button>}
      <button type="button" disabled={busy} onClick={() => onDelete(record)} aria-label={`Delete ${label}`} className={cn(button.smallSecondary, "border-[#B3261E] text-[#B3261E] hover:bg-red-50")}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" />Delete</button>
    </div>
  )
}

/** @param {any} props */
function OperationsRow({ item, isProfile, departments, ...actions }) {
  const record = item.record
  const identity = identityFor(item, isProfile)
  return (
    <tr className="align-top">
      <td className="px-5 py-4"><p className="font-semibold text-[#1D1D1F]">{identity.title}</p><p className="mt-1 text-xs text-[#6E6E73]">{identity.subtitle}</p></td>
      <td className="px-4 py-4 text-xs leading-relaxed text-[#48484A]">{isProfile ? (record ? <><span className="font-semibold">Configured</span><span className="mt-1 block line-clamp-2">{record.description || "No public description provided."}</span></> : "No operational profile") : departmentName(record, departments)}</td>
      <td className="px-4 py-4">{record ? <StatusBadge status={record.lifecycle} /> : <StatusBadge status="PENDING_VERIFICATION" label="Not configured" />}</td>
      <td className="px-4 py-4"><VerificationState record={record} /></td>
      <td className="px-4 py-4 text-xs leading-relaxed text-[#48484A]"><span className="block font-semibold">{record?.public_visibility ? "Public" : "Not public"}</span><span className="block text-[#6E6E73]">{record ? formatDate(record.updated_at) : "Never updated"}</span></td>
      <td className="px-5 py-4"><RecordActions item={item} isProfile={isProfile} {...actions} /></td>
    </tr>
  )
}

/** @param {any} props */
function OperationsCard({ item, isProfile, departments, ...actions }) {
  const record = item.record
  const identity = identityFor(item, isProfile)
  return (
    <article className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 className="font-semibold text-[#1D1D1F]">{identity.title}</h2><p className="mt-1 text-xs text-[#6E6E73]">{identity.subtitle}</p></div>
        {record ? <StatusBadge status={record.lifecycle} /> : <StatusBadge status="PENDING_VERIFICATION" label="Not configured" />}
      </div>
      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
        <div><dt className="font-bold uppercase tracking-[0.08em] text-[#86868B]">{isProfile ? "Overlay" : "Department"}</dt><dd className="mt-1 text-[#48484A]">{isProfile ? (record ? "Configured" : "No operational profile") : departmentName(record, departments)}</dd></div>
        <div><dt className="font-bold uppercase tracking-[0.08em] text-[#86868B]">Verification</dt><dd className="mt-1"><VerificationState record={record} /></dd></div>
        <div><dt className="font-bold uppercase tracking-[0.08em] text-[#86868B]">Public visibility</dt><dd className="mt-1 text-[#48484A]">{record?.public_visibility ? "Public" : "Not public"}</dd></div>
        <div><dt className="font-bold uppercase tracking-[0.08em] text-[#86868B]">Last updated</dt><dd className="mt-1 text-[#48484A]">{record ? formatDate(record.updated_at) : "Never updated"}</dd></div>
      </dl>
      <div className="mt-4 border-t border-[#E5E5E7] pt-4"><RecordActions item={item} isProfile={isProfile} {...actions} /></div>
    </article>
  )
}
