import { CalendarX2, Edit3, Plus, RefreshCw, Search, Send, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminShell from "@/components/admin/AdminShell"
import FacilityOperationsEditor from "@/components/admin/FacilityOperationsEditor"
import useModalDialog from "@/components/campus/useModalDialog"
import { EmptyState, PageHeader, Skeleton, StatusBadge, button, focusRing } from "@/components/campus/ui"
import { useToast } from "@/components/ui/use-toast"
import { isNonOfficialFacilityAdminRecord, safeFacilityAdminMessage } from "@/lib/facilityAdminUi"
import { cn } from "@/lib/utils"
import { getAdminService } from "@/services/adminService"
import { FACILITY_ADMIN_LIFECYCLES, FACILITY_ADMIN_RESOURCES } from "@/services/facilityAdminService"

const pretty = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
const sentence = (value) => value.charAt(0).toUpperCase() + value.slice(1)
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }).format(new Date(value)) : "Not set"

const RESOURCE_UI = Object.freeze({
  [FACILITY_ADMIN_RESOURCES.PROFILES]: {
    title: "Facilities",
    singular: "facility profile",
    newLabel: "New profile",
    lead: "Maintain operational descriptions, public contacts, lifecycle, and provenance without changing canonical facility identity or spatial truth.",
    identityLabel: "Facility",
    relationLabel: "Overlay state",
    cardRelationLabel: "Overlay",
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
    identityLabel: "Service",
    relationLabel: "Department",
    listMethod: "listFacilityAdminServices",
    createMethod: "createFacilityAdminServiceRecord",
    updateMethod: "updateFacilityAdminServiceRecord",
    publishMethod: "publishFacilityAdminServiceRecord",
    expireMethod: "expireFacilityAdminServiceRecord",
    deleteMethod: "deleteFacilityAdminServiceRecord",
  },
  [FACILITY_ADMIN_RESOURCES.ALIASES]: {
    title: "Service Aliases",
    singular: "service alias",
    newLabel: "New alias",
    lead: "Maintain approved terms for configured services without turning aliases into service identities or public search behavior.",
    identityLabel: "Alias",
    relationLabel: "Service",
    listMethod: "listServiceAliases",
    createMethod: "createServiceAlias",
    updateMethod: "updateServiceAlias",
    publishMethod: "publishServiceAlias",
    expireMethod: "expireServiceAlias",
    deleteMethod: "deleteServiceAlias",
  },
  [FACILITY_ADMIN_RESOURCES.MAPPINGS]: {
    title: "Facility-Service Mappings",
    singular: "facility-service mapping",
    newLabel: "New mapping",
    lead: "Configure which existing facility profiles provide each service. Rank is stored administrator data, not a recommendation algorithm.",
    identityLabel: "Facility",
    relationLabel: "Service / Rank",
    listMethod: "listFacilityServiceMappings",
    createMethod: "createFacilityServiceMapping",
    updateMethod: "updateFacilityServiceMapping",
    publishMethod: "publishFacilityServiceMapping",
    expireMethod: "expireFacilityServiceMapping",
    deleteMethod: "deleteFacilityServiceMapping",
  },
})

export default function FacilityOperationsAdminPage({ resource }) {
  const config = RESOURCE_UI[resource]
  const isProfile = resource === FACILITY_ADMIN_RESOURCES.PROFILES
  const isService = resource === FACILITY_ADMIN_RESOURCES.SERVICES
  const isAlias = resource === FACILITY_ADMIN_RESOURCES.ALIASES
  const isMapping = resource === FACILITY_ADMIN_RESOURCES.MAPPINGS
  const navigate = useNavigate()
  const { toast } = useToast()
  const [records, setRecords] = useState([])
  const [facilities, setFacilities] = useState([])
  const [departments, setDepartments] = useState([])
  const [services, setServices] = useState([])
  const [profiles, setProfiles] = useState([])
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
      const nextRecordsPromise = service[config.listMethod]()
      const referencesPromise = (isAlias || isMapping)
        ? service.loadFacilityAdminReferences()
        : Promise.all([
            service.listFacilityAdminDepartments(),
            Promise.resolve(service.listCanonicalFacilities()),
          ]).then(([nextDepartments, nextFacilities]) => ({
            departments: nextDepartments,
            facilities: nextFacilities,
          }))
      const [nextRecords, references] = await Promise.all([nextRecordsPromise, referencesPromise])
      setRecords(nextRecords)
      setDepartments(references.departments || [])
      setFacilities(references.facilities || [])
      setServices(references.services || (isService ? nextRecords : []))
      setProfiles(references.profiles || (isProfile ? nextRecords : []))
      return nextRecords
    } catch (loadError) {
      handleError(loadError)
      return []
    } finally {
      setLoading(false)
    }
  }, [config.listMethod, handleError, isAlias, isMapping, isProfile, isService])

  useEffect(() => { load() }, [load])

  const profileByFacility = useMemo(() => new Map(records.map((record) => [record.facility_id, record])), [records])
  const serviceById = useMemo(() => new Map(services.map((service) => [Number(service.id), service])), [services])
  const facilityById = useMemo(() => new Map(facilities.map((facility) => [facility.id, facility])), [facilities])
  const rows = useMemo(() => {
    const candidates = isProfile
      ? facilities.map((facility) => ({ ...facility, record: profileByFacility.get(facility.id) || null }))
      : records.map((record) => ({ record }))
    const query = filters.search.trim().toLowerCase()
    return candidates.filter((item) => {
      const record = item.record
      const text = isProfile
        ? `${item.name} ${item.id} ${item.floor} ${record?.description || ""}`
        : isService
          ? `${record.code} ${record.name} ${record.description || ""}`
          : isAlias
            ? `${record.alias} ${serviceById.get(Number(record.service_id))?.name || ""} ${serviceById.get(Number(record.service_id))?.code || ""}`
            : `${record.facility_id} ${facilityById.get(record.facility_id)?.name || ""} ${serviceById.get(Number(record.service_id))?.name || ""} ${serviceById.get(Number(record.service_id))?.code || ""} ${record.public_notes || ""} ${record.recommendation_rank}`
      return (!query || text.toLowerCase().includes(query))
        && (filters.lifecycle === "ALL" || record?.lifecycle === filters.lifecycle)
    })
  }, [facilities, facilityById, filters.lifecycle, filters.search, isAlias, isProfile, isService, profileByFacility, records, serviceById])

  const missingFacilities = useMemo(() => facilities.filter((facility) => !profileByFacility.has(facility.id)), [facilities, profileByFacility])
  const profileFacilityIds = useMemo(() => new Set(profiles.map((profile) => profile.facility_id)), [profiles])
  const mappingFacilities = useMemo(() => facilities.filter((facility) => profileFacilityIds.has(facility.id)), [facilities, profileFacilityIds])

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
      toast({ title: selectedRecord ? "Changes saved" : `${sentence(config.singular)} created as draft`, description: "Change saved and recorded in Audit Activity." })
      await load()
    } catch (saveError) {
      // The editor displays save errors. Only an expired session concerns the
      // page (it redirects to sign-in); a copy here would outlive Cancel.
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
      toast({ title: `${sentence(config.singular)} deleted`, description: "The disposable record was removed and recorded in Audit Activity." })
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

  const editorFacilities = isProfile
    ? (selectedRecord ? facilities : missingFacilities)
    : isMapping
      ? mappingFacilities
      : facilities
  const newDisabled = (isProfile && missingFacilities.length === 0)
    || (isAlias && services.length === 0)
    || (isMapping && (services.length === 0 || mappingFacilities.length === 0))
  const disabledLabel = isProfile
    ? "All profiles configured"
    : isAlias
      ? "Create a service first"
      : "Create profiles and services first"
  const deleteDialogRef = useModalDialog({ active: Boolean(deleteRecord), onClose: busy ? null : () => setDeleteRecord(null) })

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Admin CMS · Facility Operations"
        title={config.title}
        lead={config.lead}
        actions={<button type="button" disabled={newDisabled} onClick={() => openEditor()} className={button.primary}><Plus className="h-4 w-4" aria-hidden="true" />{newDisabled ? disabledLabel : config.newLabel}</button>}
      />

      <section aria-label={`${config.title} filters`} className="mt-5 grid gap-2.5 rounded-3xl border border-line bg-surface p-3 sm:grid-cols-[minmax(0,1fr)_minmax(8.5rem,180px)_auto]">
        <label className="relative">
          <span className="sr-only">Search {config.title.toLowerCase()}</span>
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-ink-faint" aria-hidden="true" />
          <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} className={cn("min-h-11 w-full rounded-xl border border-line-strong bg-surface pl-9 pr-3 text-sm", focusRing)} placeholder={isProfile ? "Search facility, ID, or floor" : isService ? "Search service name or code" : isAlias ? "Search alias or service" : "Search facility, service, notes, or rank"} />
        </label>
        <label>
          <span className="sr-only">Lifecycle filter</span>
          <select value={filters.lifecycle} onChange={(event) => setFilters((current) => ({ ...current, lifecycle: event.target.value }))} className={cn("min-h-11 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm", focusRing)}>
            <option value="ALL">All lifecycle states</option>
            {FACILITY_ADMIN_LIFECYCLES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}
          </select>
        </label>
        <button type="button" disabled={loading} onClick={load} className={button.smallSecondary}><RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />Refresh</button>
      </section>

      <p className="mt-3 text-xs leading-relaxed text-ink-soft">
        {isProfile
          ? `${facilities.length} canonical facilities · ${records.length} operational profiles`
          : isService
            ? `${records.length} configured services`
            : isAlias
              ? `${records.length} configured aliases · ${services.length} services`
              : `${records.length} configured mappings · ${mappingFacilities.length} eligible facility profiles`} · Configured does not mean verified or official.
      </p>

      {error && (
        <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line-strong bg-surface px-5 py-4 text-sm text-ink">
          <span>{error.message}{["DELETE_CONFLICT", "DELETE_NOT_ALLOWED"].includes(error.code) ? " Prefer Expire or refresh the record." : ""}</span>
          <button type="button" onClick={load} className={button.smallSecondary}>Refresh</button>
        </div>
      )}

      <section aria-label={`${config.title} records`} className="mt-4 overflow-hidden rounded-3xl border border-line bg-surface">
        {loading ? (
          <div className="space-y-3 p-5">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-24 w-full" />)}</div>
        ) : rows.length ? <>
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead className="border-b border-line bg-subtle text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                <tr><th className="px-5 py-3">{config.identityLabel}</th><th className="px-4 py-3">{config.relationLabel}</th><th className="px-4 py-3">Lifecycle</th><th className="px-4 py-3">Verification</th><th className="px-4 py-3">Visibility / Updated</th><th className="px-5 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-line">{rows.map((item) => <OperationsRow key={isProfile ? item.id : item.record.id} item={item} resource={resource} departments={departments} serviceById={serviceById} facilityById={facilityById} busy={busy} onEdit={openEditor} onPublish={(record) => runLifecycleAction(record, config.publishMethod, `${sentence(config.singular)} published`)} onExpire={(record) => runLifecycleAction(record, config.expireMethod, `${sentence(config.singular)} expired`)} onDelete={setDeleteRecord} />)}</tbody>
            </table>
          </div>
          <div className="divide-y divide-line xl:hidden">{rows.map((item) => <OperationsCard key={isProfile ? item.id : item.record.id} item={item} resource={resource} relationLabel={config.cardRelationLabel || config.relationLabel} departments={departments} serviceById={serviceById} facilityById={facilityById} busy={busy} onEdit={openEditor} onPublish={(record) => runLifecycleAction(record, config.publishMethod, `${sentence(config.singular)} published`)} onExpire={(record) => runLifecycleAction(record, config.expireMethod, `${sentence(config.singular)} expired`)} onDelete={setDeleteRecord} />)}</div>
        </> : (
          <div className="p-5"><EmptyState title={`No ${config.title.toLowerCase()} match`} message={isProfile ? "All canonical facilities remain in the registry; clear filters to see missing profiles." : "No official or demo operational records are created automatically."} /></div>
        )}
      </section>

      <FacilityOperationsEditor resource={resource} record={selectedRecord} initialIdentity={initialIdentity} facilities={editorFacilities} services={services} departments={departments} open={editorOpen} busy={busy} onOpenChange={closeEditor} onSave={save} onReload={reloadEditorRecord} />

      {deleteRecord && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => event.target === event.currentTarget && !busy && setDeleteRecord(null)}>
          <section ref={deleteDialogRef} role="alertdialog" aria-modal="true" aria-labelledby="facility-delete-title" aria-describedby="facility-delete-description" className="w-full max-w-lg rounded-2xl border border-line-strong bg-surface p-6 shadow-2xl sm:rounded-3xl">
            <h2 id="facility-delete-title" className="text-lg font-semibold text-ink">Delete this {config.singular}?</h2>
            <p id="facility-delete-description" className="mt-2 text-sm leading-relaxed text-ink-soft">Hard deletion is allowed only for disposable, unreferenced records. Prefer Expire to retain operational history. No dependent record will be force-deleted.</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" disabled={busy} onClick={() => setDeleteRecord(null)} className={button.smallSecondary}>Keep record</button>
              <button type="button" disabled={busy} onClick={remove} className={cn(button.smallPrimary, "bg-ink-strong font-semibold ring-2 ring-ink-strong ring-offset-2 ring-offset-surface hover:bg-ink")}>{busy ? "Deleting…" : "Delete disposable record"}</button>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  )
}

function identityFor(item, resource, serviceById, facilityById) {
  if (resource === FACILITY_ADMIN_RESOURCES.PROFILES) return { title: item.name, subtitle: `${item.floor} · ${item.id}` }
  if (resource === FACILITY_ADMIN_RESOURCES.SERVICES) return { title: item.record.name, subtitle: item.record.code }
  if (resource === FACILITY_ADMIN_RESOURCES.ALIASES) {
    return { title: item.record.alias, subtitle: null }
  }
  const facility = facilityById.get(item.record.facility_id)
  return {
    title: facility?.name || item.record.facility_id,
    subtitle: facility ? `${facility.floor} · ${facility.id}` : item.record.facility_id,
  }
}

function departmentName(record, departments) {
  if (!record?.department_id) return "No department assigned"
  const department = departments.find((item) => Number(item.id) === Number(record.department_id))
  return department ? `${department.code} — ${department.name}` : "Department reference unavailable"
}

function relationshipSummary(record, resource, departments, serviceById) {
  if (resource === FACILITY_ADMIN_RESOURCES.PROFILES) {
    return record ? <><span className="font-semibold">Configured</span><span className="mt-1 block line-clamp-2">{record.description || "No public description provided."}</span></> : "No operational profile"
  }
  if (resource === FACILITY_ADMIN_RESOURCES.SERVICES) return departmentName(record, departments)
  const service = serviceById.get(Number(record?.service_id))
  if (resource === FACILITY_ADMIN_RESOURCES.ALIASES) return service ? `${service.name} · ${service.code}` : "Service reference unavailable"
  return <><span className="font-semibold">{service ? `${service.name} · ${service.code}` : "Service reference unavailable"}</span><span className="mt-1 block">Rank {record?.recommendation_rank ?? "—"}{record?.public_notes ? ` · ${record.public_notes}` : ""}</span></>
}

function VerificationState({ record }) {
  if (!record) return <StatusBadge status="PENDING_VERIFICATION" label="No profile" />
  const nonOfficial = isNonOfficialFacilityAdminRecord(record)
  return <div className="flex flex-wrap gap-1.5"><StatusBadge status={record.verification_status} />{nonOfficial && <StatusBadge status="DEMO_ONLY" label="Demo · non-official" />}</div>
}

function actionLabelFor(item, resource, serviceById, facilityById) {
  const record = item.record
  if (resource === FACILITY_ADMIN_RESOURCES.PROFILES) return item.name
  if (resource === FACILITY_ADMIN_RESOURCES.SERVICES) return record.name
  const service = serviceById.get(Number(record.service_id))
  const serviceName = service?.name || "unavailable service"
  if (resource === FACILITY_ADMIN_RESOURCES.ALIASES) return `alias ${record.alias} for ${serviceName}`
  return `mapping of ${facilityById.get(record.facility_id)?.name || record.facility_id} to ${serviceName}`
}

/** @param {any} props */
function RecordActions({ item, label, busy, onEdit, onPublish, onExpire, onDelete }) {
  const record = item.record
  if (!record) return <button type="button" disabled={busy} onClick={() => onEdit(null, item.id)} aria-label={`Create profile for ${item.name}`} className={button.smallPrimary}><Plus className="h-3.5 w-3.5" aria-hidden="true" />Create profile</button>
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <button type="button" disabled={busy} onClick={() => onEdit(record)} aria-label={`Edit ${label}`} className={button.smallSecondary}><Edit3 className="h-3.5 w-3.5" aria-hidden="true" />Edit</button>
      {record.lifecycle !== "PUBLISHED" && <button type="button" disabled={busy} onClick={() => onPublish(record)} aria-label={`Publish ${label}`} className={button.smallPrimary}><Send className="h-3.5 w-3.5" aria-hidden="true" />Publish</button>}
      {!['EXPIRED', 'CANCELLED'].includes(record.lifecycle) && <button type="button" disabled={busy} onClick={() => onExpire(record)} aria-label={`Expire ${label}`} className={button.smallSecondary}><CalendarX2 className="h-3.5 w-3.5" aria-hidden="true" />Expire</button>}
      <button type="button" disabled={busy} onClick={() => onDelete(record)} aria-label={`Delete ${label}`} className={cn(button.smallSecondary, "border-2 border-ink-strong font-semibold text-ink-strong hover:border-ink-strong hover:bg-fill")}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" />Delete</button>
    </div>
  )
}

/** @param {any} props */
function OperationsRow({ item, resource, departments, serviceById, facilityById, ...actions }) {
  const record = item.record
  const identity = identityFor(item, resource, serviceById, facilityById)
  return (
    <tr className="align-top">
      <td className="px-5 py-4"><p className="font-semibold text-ink">{identity.title}</p>{identity.subtitle && <p className="mt-1 text-xs text-ink-soft">{identity.subtitle}</p>}</td>
      <td className="px-4 py-4 text-xs leading-relaxed text-ink-mid">{relationshipSummary(record, resource, departments, serviceById)}</td>
      <td className="px-4 py-4">{record ? <StatusBadge status={record.lifecycle} /> : <StatusBadge status="PENDING_VERIFICATION" label="Not configured" />}</td>
      <td className="px-4 py-4"><VerificationState record={record} /></td>
      <td className="px-4 py-4 text-xs leading-relaxed text-ink-mid"><span className="block font-semibold">{record?.public_visibility ? "Public" : "Not public"}</span><span className="block text-ink-soft">{record ? formatDate(record.updated_at) : "Never updated"}</span></td>
      <td className="px-5 py-4"><RecordActions item={item} label={record ? actionLabelFor(item, resource, serviceById, facilityById) : null} {...actions} /></td>
    </tr>
  )
}

/** @param {any} props */
function OperationsCard({ item, resource, relationLabel, departments, serviceById, facilityById, ...actions }) {
  const record = item.record
  const identity = identityFor(item, resource, serviceById, facilityById)
  return (
    <article className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 className="font-semibold text-ink">{identity.title}</h2>{identity.subtitle && <p className="mt-1 text-xs text-ink-soft">{identity.subtitle}</p>}</div>
        {record ? <StatusBadge status={record.lifecycle} /> : <StatusBadge status="PENDING_VERIFICATION" label="Not configured" />}
      </div>
      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
        <div><dt className="font-bold uppercase tracking-[0.08em] text-ink-faint">{relationLabel}</dt><dd className="mt-1 text-ink-mid">{relationshipSummary(record, resource, departments, serviceById)}</dd></div>
        <div><dt className="font-bold uppercase tracking-[0.08em] text-ink-faint">Verification</dt><dd className="mt-1"><VerificationState record={record} /></dd></div>
        <div><dt className="font-bold uppercase tracking-[0.08em] text-ink-faint">Public visibility</dt><dd className="mt-1 text-ink-mid">{record?.public_visibility ? "Public" : "Not public"}</dd></div>
        <div><dt className="font-bold uppercase tracking-[0.08em] text-ink-faint">Last updated</dt><dd className="mt-1 text-ink-mid">{record ? formatDate(record.updated_at) : "Never updated"}</dd></div>
      </dl>
      <div className="mt-4 border-t border-line pt-4"><RecordActions item={item} label={record ? actionLabelFor(item, resource, serviceById, facilityById) : null} {...actions} /></div>
    </article>
  )
}
