import { AlertTriangle, LockKeyhole, RotateCcw, Save, X } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { button, focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"
import {
  FACILITY_ADMIN_UI_DATA_STATUSES,
  FACILITY_ADMIN_UI_LIFECYCLES,
  FACILITY_ADMIN_UI_VERIFICATION_STATUSES,
  buildFacilityAdminPayload,
  createFacilityAdminForm,
  isNonOfficialFacilityAdminRecord,
  safeFacilityAdminMessage,
} from "@/lib/facilityAdminUi"
import { FACILITY_ADMIN_RESOURCES } from "@/services/facilityAdminService"

const pretty = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
const fieldClass = cn("mt-1.5 min-h-11 w-full rounded-xl border border-[#D2D2D7] bg-white px-3 text-sm text-[#1D1D1F] disabled:cursor-not-allowed disabled:bg-[#F5F5F7] disabled:text-[#6E6E73]", focusRing)

function Field({ label, help = null, wide = false, children }) {
  return (
    <label className={wide ? "sm:col-span-2" : ""}>
      <span className="text-xs font-semibold text-[#48484A]">{label}</span>
      {children}
      {help && <span className="mt-1 block text-[11px] leading-relaxed text-[#6E6E73]">{help}</span>}
    </label>
  )
}

function Input({ value, onChange, type = "text", ...props }) {
  return <input {...props} type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className={fieldClass} />
}

function Select({ value, onChange, children, ...props }) {
  return <select {...props} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className={fieldClass}>{children}</select>
}

function Group({ title, description, children }) {
  return (
    <fieldset className="rounded-2xl border border-[#E5E5E7] p-4 sm:p-5">
      <legend className="px-1 font-heading text-xs font-bold uppercase tracking-[0.12em] text-[#1D1F20]">{title}</legend>
      <p className="mb-4 text-xs leading-relaxed text-[#6E6E73]">{description}</p>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

export default function FacilityOperationsEditor({
  resource,
  record,
  initialIdentity = null,
  facilities,
  departments,
  open,
  busy,
  onOpenChange,
  onSave,
  onReload,
}) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const isProfile = resource === FACILITY_ADMIN_RESOURCES.PROFILES
  const [form, setForm] = useState(() => createFacilityAdminForm(resource, record, initialIdentity))
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    if (!open) return
    setForm(createFacilityAdminForm(resource, record, initialIdentity))
    setFormError(null)
  }, [initialIdentity, open, record, resource])

  useEffect(() => {
    if (!open) return undefined
    const previousFocus = document.activeElement
    const firstControl = dialogRef.current?.querySelector("input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled)")
    if (firstControl instanceof HTMLElement) firstControl.focus()
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !busy) onOpenChange(false)
    }
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("keydown", closeOnEscape)
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [busy, onOpenChange, open])

  const selectedFacility = useMemo(
    () => facilities.find((facility) => facility.id === form.facility_id),
    [facilities, form.facility_id],
  )
  const nonOfficial = isNonOfficialFacilityAdminRecord(form)
  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setFormError(null)
    try {
      const payload = buildFacilityAdminPayload(resource, form, { operation: record ? "update" : "create" })
      await onSave(payload)
    } catch (error) {
      setFormError({ code: error?.code || "ADMIN_ERROR", message: safeFacilityAdminMessage(error) })
    }
  }

  const editorTitle = record
    ? `Edit ${isProfile ? "Facility Profile" : "Service"}`
    : `Create ${isProfile ? "Facility Profile" : "Service"}`

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-3" onMouseDown={(event) => event.target === event.currentTarget && !busy && onOpenChange(false)}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[94dvh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#D2D2D7] bg-white shadow-2xl sm:rounded-3xl">
        <header className="border-b border-[#E5E5E7] px-5 pb-5 pt-6 text-left sm:px-6">
          <h2 id={titleId} className="font-display text-3xl font-bold uppercase tracking-[0.02em] text-[#1D1F20]">{editorTitle}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#6E6E73]">
            Save stores operational metadata only. It does not publish the record or change canonical spatial data.
          </p>
        </header>
        <button type="button" disabled={busy} onClick={() => onOpenChange(false)} aria-label="Close editor" className={cn("absolute right-4 top-4 rounded-full p-2 text-[#6E6E73] hover:bg-[#F5F5F7]", focusRing)}><X className="h-4 w-4" aria-hidden="true" /></button>

        <form onSubmit={submit} noValidate>
          <div className="space-y-4 px-4 py-5 sm:px-6">
            {nonOfficial && (
              <div role="status" className="flex gap-3 rounded-2xl border border-dashed border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p><strong>Demo / non-official record.</strong> This state must not be presented as verified institutional information.</p>
              </div>
            )}

            <Group title="Content" description={isProfile ? "Canonical facility identity is selected once. Floor, name, geometry, routes, QR, and emergency relationships are never editable here." : "The service code is stable identity: lowercase kebab-case on creation and locked afterward."}>
              {isProfile ? (
                <Field label="Canonical facility" wide help={record ? "Facility identity is immutable after profile creation." : "Uses the existing local CampusNav facility registry."}>
                  <Select value={form.facility_id} onChange={(value) => setField("facility_id", value)} disabled={Boolean(record)} required>
                    <option value="">Select a facility</option>
                    {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name} · {facility.floor} · {facility.id}</option>)}
                  </Select>
                </Field>
              ) : (
                <Field label="Service code" help={record ? "Stable identity is immutable after creation." : "Required lowercase kebab-case, for example student-records."}>
                  <div className="relative">
                    <Input value={form.code} onChange={(value) => setField("code", value)} disabled={Boolean(record)} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required />
                    {record && <LockKeyhole className="pointer-events-none absolute right-3 top-5 h-4 w-4 text-[#86868B]" aria-hidden="true" />}
                  </div>
                </Field>
              )}

              {!isProfile && <Field label="Service name"><Input value={form.name} onChange={(value) => setField("name", value)} required maxLength={160} /></Field>}
              <Field label="Department">
                <Select value={form.department_id} onChange={(value) => setField("department_id", value)}>
                  <option value="">No department assigned</option>
                  {departments.filter((item) => item.active !== false).map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}
                </Select>
              </Field>
              <Field label="Description" wide>
                <textarea value={form.description ?? ""} onChange={(event) => setField("description", event.target.value)} rows={5} maxLength={4000} className={cn(fieldClass, "py-3")} />
              </Field>

              {isProfile && <>
                <Field label="Public contact name"><Input value={form.public_contact_name} onChange={(value) => setField("public_contact_name", value)} maxLength={160} /></Field>
                <Field label="Public contact email"><Input type="email" value={form.public_contact_email} onChange={(value) => setField("public_contact_email", value)} maxLength={320} /></Field>
                <Field label="Public contact phone" wide><Input type="tel" value={form.public_contact_phone} onChange={(value) => setField("public_contact_phone", value)} maxLength={80} /></Field>
              </>}
            </Group>

            <Group title="Publication" description="Saving and publishing are separate. Use the explicit Publish or Expire actions from the list after saving valid content.">
              <Field label="Lifecycle" help="Lifecycle actions control published and expired states.">
                <Select value={form.lifecycle} onChange={() => {}} disabled>
                  {FACILITY_ADMIN_UI_LIFECYCLES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}
                </Select>
              </Field>
              <label className="flex min-h-11 items-center gap-3 self-end rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] px-3 py-2.5 text-sm text-[#48484A]">
                <input type="checkbox" checked={Boolean(form.public_visibility)} readOnly disabled className="h-4 w-4 accent-green-700" />
                <span>Public visibility (controlled by Publish)</span>
              </label>
              <Field label="Effective time (Asia/Manila)" help="Required when the record is scheduled."><Input type="datetime-local" value={form.effective_at} onChange={(value) => setField("effective_at", value)} /></Field>
              <Field label="Expiration time (Asia/Manila)"><Input type="datetime-local" value={form.expires_at} onChange={(value) => setField("expires_at", value)} /></Field>
            </Group>

            <Group title="Verification / Provenance" description="Configured is not verified. Select only states supported by the source evidence; demo states remain visibly non-official.">
              <Field label="Verification status">
                <Select value={form.verification_status} onChange={(value) => setField("verification_status", value)}>
                  {FACILITY_ADMIN_UI_VERIFICATION_STATUSES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}
                </Select>
              </Field>
              <Field label="Data status">
                <Select value={form.data_status} onChange={(value) => setField("data_status", value)}>
                  {FACILITY_ADMIN_UI_DATA_STATUSES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}
                </Select>
              </Field>
              <Field label="Source type"><Input value={form.source_type} onChange={(value) => setField("source_type", value)} maxLength={80} /></Field>
              <Field label="Source ID"><Input value={form.source_id} onChange={(value) => setField("source_id", value)} maxLength={160} /></Field>
              <Field label="Source label" wide><Input value={form.source_label} onChange={(value) => setField("source_label", value)} maxLength={240} /></Field>
              <Field label="Last verified time (Asia/Manila)" wide help="Required for Verified or Source Aligned records."><Input type="datetime-local" value={form.last_verified_at} onChange={(value) => setField("last_verified_at", value)} /></Field>
            </Group>

            {isProfile && selectedFacility && (
              <p className="rounded-xl bg-[#F5F5F7] px-4 py-3 text-xs leading-relaxed text-[#48484A]">
                Canonical reference: <strong>{selectedFacility.name}</strong> · {selectedFacility.floor} · {selectedFacility.id}. These values are read-only.
              </p>
            )}

            {formError && (
              <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#B3261E] bg-red-50 px-4 py-3 text-sm text-[#7A1B17]">
                <span>{formError.message}</span>
                {formError.code === "STALE_RECORD" && <button type="button" onClick={onReload} className={button.smallSecondary}><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reload stored version</button>}
              </div>
            )}
          </div>

          <footer className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[#E5E5E7] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button type="button" disabled={busy} onClick={() => onOpenChange(false)} className={button.smallSecondary}>Cancel</button>
            <button type="submit" disabled={busy} className={button.smallPrimary}><Save className="h-3.5 w-3.5" aria-hidden="true" />{busy ? "Saving…" : record ? "Save changes" : "Save draft"}</button>
          </footer>
        </form>
      </section>
    </div>
  )
}
