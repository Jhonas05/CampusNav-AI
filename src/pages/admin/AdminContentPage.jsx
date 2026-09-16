import { Ban, CalendarX2, Edit3, Plus, Search, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminContentEditor from "@/components/admin/AdminContentEditor"
import AdminShell from "@/components/admin/AdminShell"
import { EmptyState, PageHeader, PriorityBadge, Skeleton, StatusBadge, button, focusRing } from "@/components/campus/ui"
import { useToast } from "@/components/ui/use-toast"
import { ADMIN_RESOURCE_CONFIG, ADMIN_RESOURCE_KEYS, LIFECYCLES, PRIORITIES, getAdminService } from "@/services/adminService"
import { cn } from "@/lib/utils"

const pretty = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not set"

export default function AdminContentPage({ resource }) {
  const config = ADMIN_RESOURCE_CONFIG[resource]
  const navigate = useNavigate()
  const { toast } = useToast()
  const [records, setRecords] = useState([])
  const [audiences, setAudiences] = useState([])
  const [facilities, setFacilities] = useState([])
  const [filters, setFilters] = useState({ search: "", lifecycle: "ALL", priority: "ALL", sortField: resource === ADMIN_RESOURCE_KEYS.EVENTS ? "starts_at" : "updated_at", ascending: false })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const handleServiceError = useCallback((serviceError) => {
    setError(serviceError?.message || "The Admin CMS could not load this content.")
    if (serviceError?.code === "SESSION_EXPIRED") {
      const returnTo = encodeURIComponent(window.location.pathname)
      navigate(`/login?returnTo=${returnTo}`)
    }
  }, [navigate])

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const service = await getAdminService()
      const [nextRecords, nextAudiences] = await Promise.all([
        service.listResource(resource, filters),
        service.listAudiences(),
      ])
      setRecords(nextRecords)
      setAudiences(nextAudiences)
      setFacilities(service.facilities)
    } catch (loadError) {
      handleServiceError(loadError)
    } finally {
      setLoading(false)
    }
  }, [filters, handleServiceError, resource])

  useEffect(() => {
    const timeoutId = window.setTimeout(load, 220)
    return () => window.clearTimeout(timeoutId)
  }, [load])

  const openEditor = (record = null) => {
    setSelectedRecord(record)
    setEditorOpen(true)
  }

  const save = async (form, lifecycle) => {
    setBusy(true)
    setError("")
    try {
      const service = await getAdminService()
      if (selectedRecord) await service.updateResource(resource, selectedRecord.id, form, { lifecycle, audienceIds: form.audienceIds })
      else await service.createResource(resource, form, { lifecycle, audienceIds: form.audienceIds })
      setEditorOpen(false)
      setSelectedRecord(null)
      toast({ title: lifecycle === "PUBLISHED" ? "Published successfully" : lifecycle === "SCHEDULED" ? "Scheduled successfully" : "Saved successfully", description: `${config.singular} changes are now stored in Supabase.` })
      await load()
    } catch (saveError) {
      handleServiceError(saveError)
      throw saveError
    } finally {
      setBusy(false)
    }
  }

  const transition = async (record, lifecycle) => {
    setBusy(true)
    setError("")
    try {
      const service = await getAdminService()
      await service.updateResource(resource, record.id, record, { lifecycle, audienceIds: record.audienceIds })
      toast({ title: lifecycle === "CANCELLED" ? "Content cancelled" : "Content expired", description: `${record.title} is no longer public.` })
      await load()
    } catch (transitionError) {
      handleServiceError(transitionError)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!deleteRecord) return
    setBusy(true)
    setError("")
    try {
      const service = await getAdminService()
      await service.deleteResource(resource, deleteRecord.id)
      toast({ title: `${config.singular} deleted`, description: "The record and its audience links were removed." })
      setDeleteRecord(null)
      await load()
    } catch (deleteError) {
      handleServiceError(deleteError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Admin CMS · Content"
        title={config.label}
        lead={`Create, review, schedule, and publish ${config.label.toLowerCase()} through the existing Supabase lifecycle and RLS policies.`}
        actions={<button type="button" onClick={() => openEditor()} className={button.primary}><Plus className="h-4 w-4" aria-hidden="true" /> New {config.singular}</button>}
      />

      <section aria-label={`${config.label} filters`} className="mt-5 grid gap-2.5 rounded-3xl border border-[#E5E5E7] bg-white p-3 md:grid-cols-[minmax(220px,1fr)_160px_160px_170px]">
        <label className="relative">
          <span className="sr-only">Search by title</span>
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#86868B]" aria-hidden="true" />
          <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} className={cn("min-h-11 w-full rounded-xl border border-[#D2D2D7] bg-white pl-9 pr-3 text-sm", focusRing)} placeholder="Search title" />
        </label>
        <label>
          <span className="sr-only">Lifecycle filter</span>
          <select value={filters.lifecycle} onChange={(event) => setFilters((current) => ({ ...current, lifecycle: event.target.value }))} className={cn("min-h-11 w-full rounded-xl border border-[#D2D2D7] bg-white px-3 text-sm", focusRing)}>
            <option value="ALL">All statuses</option>
            {LIFECYCLES.map((lifecycle) => <option key={lifecycle} value={lifecycle}>{pretty(lifecycle)}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Priority filter</span>
          <select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))} className={cn("min-h-11 w-full rounded-xl border border-[#D2D2D7] bg-white px-3 text-sm", focusRing)}>
            <option value="ALL">All priorities</option>
            {PRIORITIES.map((priority) => <option key={priority} value={priority}>{pretty(priority)}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Sort content</span>
          <select value={`${filters.sortField}:${filters.ascending}`} onChange={(event) => {
            const [sortField, ascending] = event.target.value.split(":")
            setFilters((current) => ({ ...current, sortField, ascending: ascending === "true" }))
          }} className={cn("min-h-11 w-full rounded-xl border border-[#D2D2D7] bg-white px-3 text-sm", focusRing)}>
            <option value="updated_at:false">Recently updated</option>
            <option value="created_at:false">Recently created</option>
            <option value="title:true">Title A–Z</option>
            <option value="effective_at:true">Effective date</option>
            {resource === ADMIN_RESOURCE_KEYS.EVENTS && <option value="starts_at:true">Event start</option>}
          </select>
        </label>
      </section>

      {error && (
        <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D2D2D7] bg-white px-5 py-4 text-sm text-[#1D1D1F]">
          <span>{error}</span><button type="button" onClick={load} className={button.smallSecondary}>Try again</button>
        </div>
      )}

      <section aria-label={`${config.label} records`} className="mt-4 overflow-hidden rounded-3xl border border-[#E5E5E7] bg-white">
        {loading ? (
          <div className="space-y-3 p-5">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-20 w-full" />)}</div>
        ) : records.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="border-b border-[#E5E5E7] bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-[0.12em] text-[#86868B]">
                <tr><th className="px-5 py-3">Title / Type</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Lifecycle</th><th className="px-4 py-3">Effective / Expires</th><th className="px-4 py-3">Updated</th><th className="px-5 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E7]">
                {records.map((record) => (
                  <tr key={record.id} className="align-top">
                    <td className="max-w-sm px-5 py-4"><p className="font-semibold text-[#1D1D1F]">{record.title}</p><p className="mt-1 text-xs text-[#86868B]">{pretty(record.category || record.advisory_type || (resource === ADMIN_RESOURCE_KEYS.EVENTS ? "EVENT" : resource))}{record.audienceIds.length ? ` · ${record.audienceIds.length} audience${record.audienceIds.length === 1 ? "" : "s"}` : " · Public lifecycle only"}</p></td>
                    <td className="px-4 py-4"><PriorityBadge priority={record.priority} /></td>
                    <td className="px-4 py-4"><StatusBadge status={record.lifecycle} /></td>
                    <td className="px-4 py-4 text-xs leading-relaxed text-[#48484A]"><span className="block">{formatDate(record.effective_at || record.starts_at)}</span><span className="block text-[#86868B]">to {formatDate(record.expires_at || record.ends_at)}</span></td>
                    <td className="px-4 py-4 text-xs text-[#6E6E73]">{formatDate(record.updated_at || record.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button type="button" disabled={busy} onClick={() => openEditor(record)} aria-label={`Edit ${record.title}`} title="Edit" className={cn("rounded-full p-2 text-[#48484A] hover:bg-[#F5F5F7]", focusRing)}><Edit3 className="h-4 w-4" /></button>
                        {!['CANCELLED', 'EXPIRED'].includes(record.lifecycle) && <button type="button" disabled={busy} onClick={() => transition(record, "CANCELLED")} aria-label={`Cancel ${record.title}`} title="Cancel content" className={cn("rounded-full p-2 text-[#48484A] hover:bg-[#F5F5F7]", focusRing)}><Ban className="h-4 w-4" /></button>}
                        {record.lifecycle === "PUBLISHED" && <button type="button" disabled={busy} onClick={() => transition(record, "EXPIRED")} aria-label={`Expire ${record.title}`} title="Expire content" className={cn("rounded-full p-2 text-[#48484A] hover:bg-[#F5F5F7]", focusRing)}><CalendarX2 className="h-4 w-4" /></button>}
                        <button type="button" disabled={busy} onClick={() => setDeleteRecord(record)} aria-label={`Delete ${record.title}`} title="Delete" className={cn("rounded-full p-2 text-[#48484A] hover:bg-[#F5F5F7]", focusRing)}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5"><EmptyState title={`No ${config.label.toLowerCase()} found`} message="Change the filters or create a new record. No sample content is generated automatically." action={<button type="button" onClick={() => openEditor()} className={button.smallPrimary}>Create {config.singular}</button>} /></div>
        )}
      </section>

      <AdminContentEditor resource={resource} record={selectedRecord} audiences={audiences} facilities={facilities} open={editorOpen} busy={busy} onOpenChange={setEditorOpen} onSave={save} />

      {deleteRecord && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => event.target === event.currentTarget && !busy && setDeleteRecord(null)}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description" className="w-full max-w-lg rounded-3xl border border-[#D2D2D7] bg-white p-6 shadow-2xl">
            <h2 id="delete-title" className="text-lg font-semibold text-[#1D1D1F]">Delete this {config.singular.toLowerCase()}?</h2>
            <p id="delete-description" className="mt-2 text-sm leading-relaxed text-[#6E6E73]">This permanently removes “{deleteRecord.title}” and its audience links. Prefer Cancel or Expire when retaining history is appropriate.</p>
            <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={() => setDeleteRecord(null)} className={button.smallSecondary}>Keep record</button><button type="button" disabled={busy} onClick={remove} className={button.smallPrimary}>{busy ? "Deleting…" : "Delete permanently"}</button></div>
          </section>
        </div>
      )}
    </AdminShell>
  )
}
