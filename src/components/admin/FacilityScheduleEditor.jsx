import { AlertTriangle, LockKeyhole, Minus, Plus, RotateCcw, Save, X } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { button, focusRing } from "@/components/campus/ui"
import useModalDialog from "@/components/campus/useModalDialog"
import {
  FACILITY_ADMIN_UI_DATA_STATUSES,
  FACILITY_ADMIN_UI_LIFECYCLES,
  FACILITY_ADMIN_UI_VERIFICATION_STATUSES,
  buildFacilitySchedulePayloads,
  createFacilityAdminForm,
  isNonOfficialFacilityAdminRecord,
  safeFacilityAdminMessage,
} from "@/lib/facilityAdminUi"
import { cn } from "@/lib/utils"
import { FACILITY_ADMIN_RESOURCES, validateFacilityAdminRecord } from "@/services/facilityAdminService"

const pretty = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
const WEEKDAYS = Object.freeze(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
const fieldClass = cn("mt-1.5 block min-h-11 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm text-ink shadow-none disabled:cursor-not-allowed disabled:bg-fill disabled:text-ink-soft", focusRing)

function Field({ label, help = null, wide = false, children }) {
  return <label className={wide ? "sm:col-span-2" : ""}><span className="text-xs font-semibold text-ink-mid">{label}</span>{children}{help && <span className="mt-1 block text-[11px] leading-relaxed text-ink-soft">{help}</span>}</label>
}

function Input({ value, onChange, type = "text", ...props }) {
  return <input {...props} type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className={fieldClass} />
}

function Select({ value, onChange, children, ...props }) {
  return <select {...props} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className={fieldClass}>{children}</select>
}

function Group({ title, description, children }) {
  return <fieldset className="rounded-2xl border border-line p-4 sm:p-5"><legend className="px-1 text-xs font-semibold uppercase tracking-[0.06em] text-ink">{title}</legend><p className="mb-4 text-xs leading-relaxed text-ink-soft">{description}</p><div className="grid gap-4 sm:grid-cols-2">{children}</div></fieldset>
}

export default function FacilityScheduleEditor({ resource, record, facilities, open, busy, onOpenChange, onSave, onReload }) {
  const titleId = useId()
  const intervalSequence = useRef(1)
  const isHours = resource === FACILITY_ADMIN_RESOURCES.HOURS
  const [form, setForm] = useState(() => createFacilityAdminForm(resource, record))
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    if (!open) return
    intervalSequence.current = 1
    setForm(createFacilityAdminForm(resource, record))
    setFormError(null)
  }, [open, record, resource])

  const dialogRef = useModalDialog({ active: open, onClose: busy ? null : () => onOpenChange(false) })
  const selectedFacility = useMemo(() => facilities.find((facility) => facility.id === form.facility_id), [facilities, form.facility_id])
  const nonOfficial = isNonOfficialFacilityAdminRecord(form)
  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }))
  const setLifecycle = (value) => setForm((current) => ({
    ...current,
    lifecycle: value,
    public_visibility: value === "PUBLISHED" ? current.public_visibility : false,
  }))
  const setInterval = (key, field, value) => setForm((current) => ({ ...current, intervals: current.intervals.map((interval) => interval.key === key ? { ...interval, [field]: value } : interval) }))
  const addInterval = () => {
    intervalSequence.current += 1
    setForm((current) => ({ ...current, intervals: [...current.intervals, { key: `interval-${intervalSequence.current}`, start_time: "", end_time: "" }] }))
  }
  const removeInterval = (key) => setForm((current) => ({ ...current, intervals: current.intervals.filter((interval) => interval.key !== key) }))
  const setClosedAllDay = (checked) => setForm((current) => ({
    ...current,
    closed_all_day: checked,
    intervals: checked ? current.intervals : (current.intervals.length ? current.intervals : [{ key: "interval-1", start_time: "08:00", end_time: "17:00" }]),
  }))

  const submit = async (event) => {
    event.preventDefault()
    setFormError(null)
    try {
      if (!form.facility_id) throw Object.assign(new Error("Select a facility profile."), { code: "VALIDATION_ERROR" })
      if (!form.closed_all_day && !form.intervals.length) throw Object.assign(new Error("Add at least one operating interval or mark the facility closed all day."), { code: "VALIDATION_ERROR" })
      const operation = record ? "update" : "create"
      const primaryPayloads = buildFacilitySchedulePayloads(resource, form, { operation })
      const createPayloads = buildFacilitySchedulePayloads(resource, form, { operation: "create" })
      primaryPayloads.forEach((payload) => validateFacilityAdminRecord(resource, payload, { operation }))
      createPayloads.forEach((payload) => validateFacilityAdminRecord(resource, payload, { operation: "create" }))
      await onSave({ primaryPayload: primaryPayloads[0], additionalPayloads: createPayloads.slice(1) })
    } catch (error) {
      setFormError({ code: error?.code || "ADMIN_ERROR", message: safeFacilityAdminMessage(error) })
    }
  }

  if (!open) return null
  const resourceName = isHours ? "Weekly Operating Hours" : "Dated Hour Exception"

  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-3" onMouseDown={(event) => event.target === event.currentTarget && !busy && onOpenChange(false)}>
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[94dvh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-line-strong bg-surface shadow-2xl sm:rounded-3xl">
      <header className="border-b border-line px-5 pb-5 pt-6 text-left sm:px-6"><h2 id={titleId} className="text-2xl font-semibold tracking-tight text-ink">{record ? "Edit" : "Create"} {resourceName}</h2><p className="mt-1.5 text-sm leading-relaxed text-ink-soft">Edit source schedules only. Facility status remains computed by the accepted Manila-time status engine.</p></header>
      <button type="button" disabled={busy} onClick={() => onOpenChange(false)} aria-label="Close schedule editor" className={cn("absolute right-4 top-4 rounded-full p-2 text-ink-soft hover:bg-fill", focusRing)}><X className="h-4 w-4" aria-hidden="true" /></button>

      <form onSubmit={submit} noValidate>
        <div className="space-y-4 px-4 py-5 sm:px-6">
          {nonOfficial && <div role="status" className="flex gap-3 rounded-2xl border-[1.5px] border-dashed border-ink-faint bg-subtle p-4 text-sm text-ink"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><p><strong>Demo / non-official record.</strong> It must not be presented as verified institutional operating information.</p></div>}

          <Group title="Schedule" description={isHours ? "Each interval is a separate recurring source row. Split and overnight schedules remain explicit and are never silently merged." : "This campus-local Manila date replaces the weekly schedule. Split and overnight replacement intervals remain explicit."}>
            <Field label="Canonical facility profile" wide help={record ? "Facility identity is immutable after creation." : "Only canonical facilities with an operational profile are available."}>
              <div className="relative"><Select value={form.facility_id} onChange={(value) => setField("facility_id", value)} disabled={Boolean(record)} required><option value="">Select a facility profile</option>{facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name} · {facility.floor} · {facility.id}</option>)}</Select>{record && <LockKeyhole className="pointer-events-none absolute right-3 top-5 h-4 w-4 text-ink-faint" aria-hidden="true" />}</div>
            </Field>
            {isHours ? <Field label="Weekday"><Select value={form.day_of_week} onChange={(value) => setField("day_of_week", value)} required>{WEEKDAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}</Select></Field> : <Field label="Exception date" help="Strict YYYY-MM-DD Manila campus date; it is never converted to UTC."><Input type="date" value={form.exception_date} onChange={(value) => setField("exception_date", value)} required /></Field>}
            <label className="flex min-h-11 items-center gap-3 self-end rounded-xl border border-line-strong bg-fill px-3 py-2.5 text-sm text-ink-mid"><input type="checkbox" checked={Boolean(form.closed_all_day)} onChange={(event) => setClosedAllDay(event.target.checked)} className="h-4 w-4 accent-ink" /><span>Closed all day</span></label>
            <p className="self-end text-xs leading-relaxed text-ink-soft sm:col-span-2">{form.closed_all_day ? "No intervals will be submitted. The closed marker replaces other applicable intervals for this schedule key." : "End times at or before their start time represent an overnight interval owned by this weekday or exception date."}</p>

            {!form.closed_all_day && <div className="space-y-3 sm:col-span-2" aria-label="Operating intervals">
              {form.intervals.map((interval, index) => <fieldset key={interval.key} className="rounded-xl border border-line bg-subtle p-3"><legend className="px-1 text-xs font-semibold text-ink">Interval {index + 1}</legend><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"><Field label={`Start time for interval ${index + 1}`}><Input type="time" value={interval.start_time} onChange={(value) => setInterval(interval.key, "start_time", value)} required /></Field><Field label={`End time for interval ${index + 1}`}><Input type="time" value={interval.end_time} onChange={(value) => setInterval(interval.key, "end_time", value)} required /></Field><button type="button" disabled={form.intervals.length === 1} onClick={() => removeInterval(interval.key)} aria-label={`Remove interval ${index + 1}`} className={cn(button.smallSecondary, "self-end")}><Minus className="h-3.5 w-3.5" aria-hidden="true" />Remove</button></div></fieldset>)}
              <button type="button" onClick={addInterval} className={button.smallSecondary}><Plus className="h-3.5 w-3.5" aria-hidden="true" />Add interval</button>
            </div>}
          </Group>

          <Group title="Publication" description="Save and Publish are separate. New intervals remain draft, non-public, and pending until an explicit lifecycle action.">
            <Field label="Lifecycle" help="Published and expired transitions use the explicit list actions."><Select value={form.lifecycle} onChange={setLifecycle}>{FACILITY_ADMIN_UI_LIFECYCLES.map((value) => <option key={value} value={value} disabled={["PUBLISHED", "EXPIRED"].includes(value) && value !== form.lifecycle}>{pretty(value)}</option>)}</Select></Field>
            <label className="flex min-h-11 items-center gap-3 self-end rounded-xl border border-line-strong bg-fill px-3 py-2.5 text-sm text-ink-mid"><input type="checkbox" checked={Boolean(form.public_visibility)} readOnly disabled className="h-4 w-4 accent-ink" /><span>Public visibility (controlled by Publish)</span></label>
            <Field label="Effective time (Asia/Manila)" help="Required for Scheduled records."><Input type="datetime-local" value={form.effective_at} onChange={(value) => setField("effective_at", value)} /></Field>
            <Field label="Expiration time (Asia/Manila)"><Input type="datetime-local" value={form.expires_at} onChange={(value) => setField("expires_at", value)} /></Field>
          </Group>

          <Group title="Verification / Provenance" description="Configured and published do not mean official. Use only verification states supported by source evidence.">
            <Field label="Verification status"><Select value={form.verification_status} onChange={(value) => setField("verification_status", value)}>{FACILITY_ADMIN_UI_VERIFICATION_STATUSES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</Select></Field>
            <Field label="Data status"><Select value={form.data_status} onChange={(value) => setField("data_status", value)}>{FACILITY_ADMIN_UI_DATA_STATUSES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</Select></Field>
            <Field label="Source type"><Input value={form.source_type} onChange={(value) => setField("source_type", value)} maxLength={80} /></Field>
            <Field label="Source ID"><Input value={form.source_id} onChange={(value) => setField("source_id", value)} maxLength={160} /></Field>
            <Field label="Source label" wide><Input value={form.source_label} onChange={(value) => setField("source_label", value)} maxLength={240} /></Field>
            <Field label="Last verified time (Asia/Manila)" wide help="Required for Verified or Source Aligned records."><Input type="datetime-local" value={form.last_verified_at} onChange={(value) => setField("last_verified_at", value)} /></Field>
          </Group>

          {selectedFacility && <p className="rounded-xl bg-fill px-4 py-3 text-xs leading-relaxed text-ink-mid">Canonical reference: <strong>{selectedFacility.name}</strong> · {selectedFacility.floor} · {selectedFacility.id}. Spatial identity and route data remain read-only.</p>}
        </div>

        <footer className="sticky bottom-0 border-t border-line bg-surface px-5 py-4 sm:px-6">
          {formError && <div role="alert" className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-[1.5px] border-ink bg-surface px-4 py-3 text-sm font-medium text-ink"><span>{formError.message}</span>{formError.code === "STALE_RECORD" && <button type="button" onClick={onReload} className={button.smallSecondary}><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />Reload stored version</button>}</div>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={busy} onClick={() => onOpenChange(false)} className={button.smallSecondary}>Cancel</button><button type="submit" disabled={busy} className={button.smallPrimary}><Save className="h-3.5 w-3.5" aria-hidden="true" />{busy ? "Saving…" : record ? "Save changes" : "Save draft"}</button></div>
        </footer>
      </form>
    </section>
  </div>
}
