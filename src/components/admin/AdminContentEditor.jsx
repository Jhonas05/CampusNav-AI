import { CalendarClock, FileText, Send, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { button, focusRing } from "@/components/campus/ui"
import {
  ADMIN_RESOURCE_CONFIG,
  ADMIN_RESOURCE_KEYS,
  ADVISORY_TYPES,
  CATEGORIES,
  PRIORITIES,
  VERIFICATION_STATUSES,
} from "@/services/adminService"
import { cn } from "@/lib/utils"

const fieldClass = cn("min-h-11 rounded-xl border-[#D2D2D7] bg-white shadow-none", focusRing)

const toLocalDateTime = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

const emptyForm = (resource) => ({
  title: "",
  message: "",
  description: "",
  category: resource === ADMIN_RESOURCE_KEYS.EVENTS ? "EVENT" : "GENERAL",
  advisory_type: "MAINTENANCE",
  priority: "NORMAL",
  lifecycle: "DRAFT",
  effective_at: "",
  expires_at: "",
  starts_at: "",
  ends_at: "",
  location: "",
  organizer: "",
  related_facility_id: "",
  verification_status: "PENDING_VERIFICATION",
  audienceIds: [],
})

const formFromRecord = (resource, record) => ({
  ...emptyForm(resource),
  ...record,
  effective_at: toLocalDateTime(record?.effective_at),
  expires_at: toLocalDateTime(record?.expires_at),
  starts_at: toLocalDateTime(record?.starts_at),
  ends_at: toLocalDateTime(record?.ends_at),
  related_facility_id: record?.related_facility_id || "",
  audienceIds: record?.audienceIds || [],
})

const pretty = (value) => String(value).replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())

export default function AdminContentEditor({ resource, record, audiences, facilities, open, busy, onOpenChange, onSave }) {
  const config = ADMIN_RESOURCE_CONFIG[resource]
  const draftKey = useMemo(() => `campusnav:admin-draft:${resource}:${record?.id || "new"}`, [record?.id, resource])
  const [form, setForm] = useState(() => formFromRecord(resource, record))
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    let nextForm = formFromRecord(resource, record)
    try {
      const saved = window.sessionStorage.getItem(draftKey)
      if (saved) nextForm = { ...nextForm, ...JSON.parse(saved) }
    } catch {
      // A malformed browser draft must never prevent the editor from opening.
    }
    setForm(nextForm)
    setError("")
  }, [draftKey, open, record, resource])

  useEffect(() => {
    if (!open) return
    try {
      window.sessionStorage.setItem(draftKey, JSON.stringify(form))
    } catch {
      // Browser storage can be unavailable; the live form remains usable.
    }
  }, [draftKey, form, open])

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const toggleAudience = (audienceId, checked) => setForm((current) => ({
    ...current,
    audienceIds: checked
      ? [...new Set([...current.audienceIds, audienceId])]
      : current.audienceIds.filter((id) => id !== audienceId),
  }))

  const submit = async (lifecycle) => {
    setError("")
    try {
      await onSave(form, lifecycle)
      window.sessionStorage.removeItem(draftKey)
    } catch (saveError) {
      setError(saveError?.message || "The record could not be saved.")
    }
  }

  const isEvent = resource === ADMIN_RESOURCE_KEYS.EVENTS
  const isAdvisory = resource === ADMIN_RESOURCE_KEYS.FACILITY_ADVISORIES
  const hasCategory = resource === ADMIN_RESOURCE_KEYS.ANNOUNCEMENTS || resource === ADMIN_RESOURCE_KEYS.NOTIFICATIONS

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3" onMouseDown={(event) => event.target === event.currentTarget && !busy && onOpenChange(false)}>
      <section role="dialog" aria-modal="true" aria-labelledby="admin-editor-title" className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.5rem] border border-[#D2D2D7] bg-white shadow-2xl">
        <header className="border-b border-[#E5E5E7] px-6 pb-5 pt-6 pr-12">
          <h2 id="admin-editor-title" className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">{record ? `Edit ${config.singular}` : `New ${config.singular}`}</h2>
          <p className="mt-1.5 text-sm text-[#6E6E73]">Content is stored as plain text and remains private until explicitly published.</p>
        </header>
        <button type="button" disabled={busy} onClick={() => onOpenChange(false)} aria-label="Close editor" className={cn("absolute right-4 top-4 rounded-full p-2 text-[#6E6E73] hover:bg-[#F5F5F7]", focusRing)}><X className="h-4 w-4" /></button>

        <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-semibold text-[#48484A]">Title</span>
            <input value={form.title} maxLength={180} onChange={(event) => setField("title", event.target.value)} className={`${fieldClass} mt-1.5 w-full px-3 text-sm`} placeholder={`${config.singular} title`} />
          </label>

          <label className="sm:col-span-2">
            <span className="text-xs font-semibold text-[#48484A]">{isEvent ? "Description" : "Message"}</span>
            <textarea
              value={isEvent ? form.description : form.message}
              maxLength={10_000}
              rows={6}
              onChange={(event) => setField(isEvent ? "description" : "message", event.target.value)}
              className={`${fieldClass} mt-1.5 min-h-32 resize-y`}
              placeholder="Plain-text content"
            />
          </label>

          {hasCategory && (
            <label>
              <span className="text-xs font-semibold text-[#48484A]">Category</span>
              <select value={form.category} onChange={(event) => setField("category", event.target.value)} className={`${fieldClass} mt-1.5 w-full px-3 text-sm`}>
                {CATEGORIES.map((category) => <option key={category} value={category}>{pretty(category)}</option>)}
              </select>
            </label>
          )}

          {isAdvisory && (
            <label>
              <span className="text-xs font-semibold text-[#48484A]">Advisory type</span>
              <select value={form.advisory_type} onChange={(event) => setField("advisory_type", event.target.value)} className={`${fieldClass} mt-1.5 w-full px-3 text-sm`}>
                {ADVISORY_TYPES.map((type) => <option key={type} value={type}>{pretty(type)}</option>)}
              </select>
            </label>
          )}

          <label>
            <span className="text-xs font-semibold text-[#48484A]">Priority</span>
            <select value={form.priority} onChange={(event) => setField("priority", event.target.value)} className={`${fieldClass} mt-1.5 w-full px-3 text-sm`}>
              {PRIORITIES.map((priority) => <option key={priority} value={priority}>{pretty(priority)}</option>)}
            </select>
          </label>

          <label>
            <span className="text-xs font-semibold text-[#48484A]">Verification</span>
            <select value={form.verification_status} onChange={(event) => setField("verification_status", event.target.value)} className={`${fieldClass} mt-1.5 w-full px-3 text-sm`}>
              {VERIFICATION_STATUSES.map((status) => <option key={status} value={status}>{pretty(status)}</option>)}
            </select>
          </label>

          {isEvent && (
            <>
              <label>
                <span className="text-xs font-semibold text-[#48484A]">Start time</span>
                <input type="datetime-local" value={form.starts_at} onChange={(event) => setField("starts_at", event.target.value)} className={`${fieldClass} mt-1.5 w-full px-3 text-sm`} />
              </label>
              <label>
                <span className="text-xs font-semibold text-[#48484A]">End time</span>
                <input type="datetime-local" value={form.ends_at} onChange={(event) => setField("ends_at", event.target.value)} className={`${fieldClass} mt-1.5 w-full px-3 text-sm`} />
              </label>
              <label>
                <span className="text-xs font-semibold text-[#48484A]">Location label</span>
                <input value={form.location} onChange={(event) => setField("location", event.target.value)} className={`${fieldClass} mt-1.5 w-full px-3 text-sm`} placeholder="Pending verification" />
              </label>
              <label>
                <span className="text-xs font-semibold text-[#48484A]">Organizer</span>
                <input value={form.organizer} onChange={(event) => setField("organizer", event.target.value)} className={`${fieldClass} mt-1.5 w-full px-3 text-sm`} placeholder="Pending verification" />
              </label>
            </>
          )}

          <label className={isAdvisory ? "sm:col-span-2" : ""}>
            <span className="text-xs font-semibold text-[#48484A]">Facility {isAdvisory ? "" : "(optional)"}</span>
            <select value={form.related_facility_id} onChange={(event) => setField("related_facility_id", event.target.value)} className={`${fieldClass} mt-1.5 w-full px-3 text-sm`}>
              {!isAdvisory && <option value="">No linked facility</option>}
              {isAdvisory && <option value="">Select an existing facility</option>}
              {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name} — {facility.floorId}</option>)}
            </select>
            <span className="mt-1 block text-[10px] text-[#86868B]">Uses the same stable CampusNav facility ID as maps, navigation, QR, and Dashboard.</span>
          </label>

          <label>
            <span className="text-xs font-semibold text-[#48484A]">Effective at</span>
            <input type="datetime-local" value={form.effective_at} onChange={(event) => setField("effective_at", event.target.value)} className={`${fieldClass} mt-1.5 w-full px-3 text-sm`} />
          </label>
          <label>
            <span className="text-xs font-semibold text-[#48484A]">Expires at</span>
            <input type="datetime-local" value={form.expires_at} onChange={(event) => setField("expires_at", event.target.value)} className={`${fieldClass} mt-1.5 w-full px-3 text-sm`} />
          </label>

          <fieldset className="sm:col-span-2">
            <legend className="text-xs font-semibold text-[#48484A]">Audience targeting</legend>
            {audiences.length ? (
              <div className="mt-2 grid gap-2 rounded-2xl border border-[#E5E5E7] p-3 sm:grid-cols-2">
                {audiences.map((audience) => (
                  <label key={audience.id} className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-[#48484A] hover:bg-[#F5F5F7]">
                    <input type="checkbox" checked={form.audienceIds.includes(audience.id)} onChange={(event) => toggleAudience(audience.id, event.target.checked)} className="h-4 w-4 accent-black" />
                    <span>{audience.label || pretty(audience.audience_type)}</span>
                  </label>
                ))}
              </div>
            ) : <p className="mt-2 text-xs text-[#86868B]">No audience records are currently configured. Public visibility still follows lifecycle and RLS.</p>}
          </fieldset>
        </div>

        {error && <p role="alert" className="mx-6 mb-4 rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] px-4 py-3 text-sm text-[#1D1D1F]">{error}</p>}

        <footer className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-[#E5E5E7] bg-white px-6 py-4">
          <button type="button" disabled={busy} onClick={() => onOpenChange(false)} className={button.ghost}>Close</button>
          <button type="button" disabled={busy} onClick={() => submit(record?.lifecycle || "DRAFT")} className={button.smallSecondary}>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" /> {record ? "Save Changes" : "Save Draft"}
          </button>
          <button type="button" disabled={busy} onClick={() => submit("SCHEDULED")} className={button.smallSecondary}>
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> Schedule
          </button>
          <button type="button" disabled={busy} onClick={() => submit("PUBLISHED")} className={button.smallPrimary}>
            <Send className="h-3.5 w-3.5" aria-hidden="true" /> {busy ? "Saving…" : "Publish"}
          </button>
        </footer>
      </section>
    </div>
  )
}
