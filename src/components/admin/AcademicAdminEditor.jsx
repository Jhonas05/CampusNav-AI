import { Save, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { button, focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"
import {
  ACADEMIC_ADMIN_CONFIG,
  ACADEMIC_ADMIN_RESOURCES,
  DAYS,
  EXCEPTION_TYPES,
  OVERRIDE_TYPES,
  PERSONNEL_TYPES,
  SCHEDULE_STATUSES,
  VERIFICATION_STATUSES,
} from "@/services/academicAdminService"

const fieldClass = cn("min-h-11 w-full rounded-xl border border-[#D2D2D7] bg-white px-3 text-sm text-[#1D1D1F]", focusRing)
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())
const localDateTime = (value) => value ? new Date(value).toLocaleString("sv-SE", { timeZone: "Asia/Manila" }).slice(0, 16).replace(" ", "T") : ""
const pretty = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())

const defaultsFor = (resource, record) => {
  if (record) {
    const copy = { ...record }
    if (copy.starts_at) copy.starts_at = localDateTime(copy.starts_at)
    if (copy.ends_at) copy.ends_at = localDateTime(copy.ends_at)
    if (copy.checked_in_at) copy.checked_in_at = localDateTime(copy.checked_in_at)
    return copy
  }
  const shared = { department_id: "", public_visibility: false, verification_status: "PENDING_VERIFICATION", active: true }
  const defaults = {
    [ACADEMIC_ADMIN_RESOURCES.PERSONNEL]: { ...shared, first_name: "", middle_name: "", last_name: "", display_name: "", personnel_type: "FACULTY" },
    [ACADEMIC_ADMIN_RESOURCES.COURSES]: { ...shared, code: "", name: "" },
    [ACADEMIC_ADMIN_RESOURCES.SECTIONS]: { ...shared, program: "", year_level: "1", section_name: "" },
    [ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES]: { ...shared, course_id: "", section_id: "", personnel_id: "", facility_id: "", day_of_week: 1, start_time: "08:00", end_time: "09:00", effective_from: today(), effective_until: "", status: "ACTIVE" },
    [ACADEMIC_ADMIN_RESOURCES.SCHEDULE_EXCEPTIONS]: { department_id: "", class_schedule_id: "", exception_date: today(), exception_type: "CANCELLED", replacement_facility_id: "", replacement_personnel_id: "", replacement_start_time: "", replacement_end_time: "", verification_status: "PENDING_VERIFICATION" },
    [ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS]: { ...shared, personnel_id: "", facility_id: "", role_label: "", day_of_week: 1, start_time: "08:00", end_time: "17:00", effective_from: today(), effective_until: "" },
    [ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS]: { ...shared, personnel_id: "", facility_id: "", day_of_week: 1, start_time: "08:00", end_time: "09:00", effective_from: today(), effective_until: "" },
    [ACADEMIC_ADMIN_RESOURCES.CHECK_INS]: { department_id: "", personnel_id: "", facility_id: "", checked_in_at: localDateTime(new Date().toISOString()) },
    [ACADEMIC_ADMIN_RESOURCES.AVAILABILITY_OVERRIDES]: { ...shared, personnel_id: "", starts_at: "", ends_at: "", override_type: "UNAVAILABLE", reason: "" },
  }
  return defaults[resource]
}

function Field({ label, children, help = null, wide = false }) {
  return <label className={wide ? "sm:col-span-2" : ""}><span className="text-xs font-semibold text-[#48484A]">{label}</span>{children}{help && <span className="mt-1 block text-[10px] leading-relaxed text-[#86868B]">{help}</span>}</label>
}

function Select({ value, onChange, children, disabled = false }) {
  return <select value={value ?? ""} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} mt-1.5 disabled:bg-[#F5F5F7] disabled:text-[#86868B]`}>{children}</select>
}

function Input({ value, onChange, type = "text", ...props }) {
  return <input {...props} type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} mt-1.5`} />
}

function Toggle({ checked, onChange, label, help }) {
  return <label className="flex min-h-11 items-start gap-3 rounded-xl border border-[#D2D2D7] px-3 py-2.5"><input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 accent-black" /><span><span className="block text-xs font-semibold text-[#1D1D1F]">{label}</span>{help && <span className="mt-0.5 block text-[10px] leading-relaxed text-[#86868B]">{help}</span>}</span></label>
}

export default function AcademicAdminEditor({ resource, record, initialValues = null, references, open, busy, onOpenChange, onSave }) {
  const [form, setForm] = useState(() => ({ ...defaultsFor(resource, record), ...(initialValues || {}) }))
  const [error, setError] = useState("")
  const config = ACADEMIC_ADMIN_CONFIG[resource]

  useEffect(() => { if (open) { setForm({ ...defaultsFor(resource, record), ...(initialValues || {}) }); setError("") } }, [initialValues, open, record, resource])
  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }))
  const personnel = references?.personnel || []
  const courses = references?.courses || []
  const sections = references?.sections || []
  const classSchedules = references?.classSchedules || []
  const departments = references?.departments || []
  const facilities = references?.facilities || []
  const selectedSchedule = useMemo(() => classSchedules.find((item) => Number(item.id) === Number(form.class_schedule_id)), [classSchedules, form.class_schedule_id])

  useEffect(() => {
    const personnelRow = personnel.find((item) => Number(item.id) === Number(form.personnel_id))
    const courseRow = courses.find((item) => Number(item.id) === Number(form.course_id))
    const inferredDepartment = selectedSchedule?.department_id || personnelRow?.department_id || courseRow?.department_id
    if (inferredDepartment && Number(form.department_id) !== Number(inferredDepartment)) setForm((current) => ({ ...current, department_id: inferredDepartment }))
  }, [courses, form.course_id, form.department_id, form.personnel_id, personnel, selectedSchedule])

  const submit = async () => {
    setError("")
    try { await onSave(form) } catch (saveError) { setError(saveError?.message || "The record could not be saved.") }
  }

  if (!open) return null
  const departmentOptions = <>{departments.filter((item) => item.active !== false).map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</>
  const personnelOptions = <>{personnel.filter((item) => item.active !== false).map((item) => <option key={item.id} value={item.id}>{item.display_name} — {pretty(item.personnel_type)}</option>)}</>
  const facilityOptions = <>{facilities.filter((item) => item.navigable !== false).map((item) => <option key={item.id} value={item.id}>{item.name} · {item.floorId} · {item.id}</option>)}</>

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3" onMouseDown={(event) => event.target === event.currentTarget && !busy && onOpenChange(false)}>
      <section role="dialog" aria-modal="true" aria-labelledby="academic-editor-title" className="relative max-h-[94dvh] w-full max-w-4xl overflow-y-auto rounded-[1.5rem] border border-[#D2D2D7] bg-white shadow-2xl">
        <header className="border-b border-[#E5E5E7] px-6 pb-5 pt-6 pr-12">
          <h2 id="academic-editor-title" className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">{record ? `Edit ${config.singular}` : resource === ACADEMIC_ADMIN_RESOURCES.SCHEDULE_EXCEPTIONS ? "Add Exception" : resource === ACADEMIC_ADMIN_RESOURCES.CHECK_INS ? "Check In Personnel" : `New ${config.singular}`}</h2>
          <p className="mt-1.5 text-sm text-[#6E6E73]">Changes use the existing CampusNav tables, role-scoped RLS, audit stream, and Realtime refresh signal.</p>
        </header>
        <button type="button" disabled={busy} onClick={() => onOpenChange(false)} aria-label="Close editor" className={cn("absolute right-4 top-4 rounded-full p-2 text-[#6E6E73] hover:bg-[#F5F5F7]", focusRing)}><X className="h-4 w-4" /></button>

        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2 sm:px-6">
          {resource === ACADEMIC_ADMIN_RESOURCES.PERSONNEL && <>
            <Field label="First name"><Input value={form.first_name} onChange={(value) => setField("first_name", value)} /></Field>
            <Field label="Middle name (optional)"><Input value={form.middle_name} onChange={(value) => setField("middle_name", value)} /></Field>
            <Field label="Last name"><Input value={form.last_name} onChange={(value) => setField("last_name", value)} /></Field>
            <Field label="Display name"><Input value={form.display_name} onChange={(value) => setField("display_name", value)} placeholder="Defaults to full name" /></Field>
            <Field label="Department"><Select value={form.department_id} onChange={(value) => setField("department_id", value)}><option value="">Select department</option>{departmentOptions}</Select></Field>
            <Field label="Personnel type"><Select value={form.personnel_type} onChange={(value) => setField("personnel_type", value)}>{PERSONNEL_TYPES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</Select></Field>
          </>}

          {resource === ACADEMIC_ADMIN_RESOURCES.COURSES && <>
            <Field label="Course code"><Input value={form.code} onChange={(value) => setField("code", value)} placeholder="Official code only" /></Field>
            <Field label="Course name"><Input value={form.name} onChange={(value) => setField("name", value)} placeholder="Official name only" /></Field>
            <Field label="Department" wide><Select value={form.department_id} onChange={(value) => setField("department_id", value)}><option value="">Select department</option>{departmentOptions}</Select></Field>
          </>}

          {resource === ACADEMIC_ADMIN_RESOURCES.SECTIONS && <>
            <Field label="Program"><Input value={form.program} onChange={(value) => setField("program", value)} /></Field>
            <Field label="Year level"><Input type="number" min="1" max="12" value={form.year_level} onChange={(value) => setField("year_level", value)} /></Field>
            <Field label="Section name"><Input value={form.section_name} onChange={(value) => setField("section_name", value)} /></Field>
            <Field label="Department"><Select value={form.department_id} onChange={(value) => setField("department_id", value)}><option value="">Select department</option>{departmentOptions}</Select></Field>
          </>}

          {resource === ACADEMIC_ADMIN_RESOURCES.CLASS_SCHEDULES && <>
            <Field label="Course"><Select value={form.course_id} onChange={(value) => setField("course_id", value)}><option value="">Select course</option>{courses.filter((item) => item.active !== false).map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</Select></Field>
            <Field label="Section"><Select value={form.section_id} onChange={(value) => setField("section_id", value)}><option value="">Select section</option>{sections.filter((item) => item.active !== false && (!form.department_id || Number(item.department_id) === Number(form.department_id))).map((item) => <option key={item.id} value={item.id}>{item.program} {item.year_level}-{item.section_name}</option>)}</Select></Field>
            <Field label="Professor"><Select value={form.personnel_id} onChange={(value) => setField("personnel_id", value)}><option value="">Select professor</option>{personnel.filter((item) => item.active !== false && item.personnel_type === "FACULTY" && (!form.department_id || Number(item.department_id) === Number(form.department_id))).map((item) => <option key={item.id} value={item.id}>{item.display_name}</option>)}</Select></Field>
            <Field label="Facility / Room" help="Only stable IDs from the existing CampusNav facility registry are accepted."><Select value={form.facility_id} onChange={(value) => setField("facility_id", value)}><option value="">Select facility</option>{facilityOptions}</Select></Field>
            <DayAndTime form={form} setField={setField} />
            <EffectiveDates form={form} setField={setField} />
            <Field label="Status"><Select value={form.status} onChange={(value) => setField("status", value)}>{SCHEDULE_STATUSES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</Select></Field>
          </>}

          {resource === ACADEMIC_ADMIN_RESOURCES.SCHEDULE_EXCEPTIONS && <>
            <Field label="Class schedule" wide><Select value={form.class_schedule_id} onChange={(value) => setField("class_schedule_id", value)}><option value="">Select an existing class schedule</option>{classSchedules.filter((item) => item.status === "ACTIVE").map((item) => <option key={item.id} value={item.id}>#{item.id} · {courses.find((course) => Number(course.id) === Number(item.course_id))?.code || "Course"} · {DAYS.find((day) => day.value === Number(item.day_of_week))?.label}</option>)}</Select></Field>
            <Field label="Exception date"><Input type="date" value={form.exception_date} onChange={(value) => setField("exception_date", value)} /></Field>
            <Field label="Exception type"><Select value={form.exception_type} onChange={(value) => setField("exception_type", value)}>{EXCEPTION_TYPES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</Select></Field>
            <Field label="Replacement facility"><Select value={form.replacement_facility_id} onChange={(value) => setField("replacement_facility_id", value)}><option value="">No room change</option>{facilityOptions}</Select></Field>
            <Field label="Replacement professor"><Select value={form.replacement_personnel_id} onChange={(value) => setField("replacement_personnel_id", value)}><option value="">No professor change</option>{personnelOptions}</Select></Field>
            <Field label="Replacement start"><Input type="time" value={form.replacement_start_time} onChange={(value) => setField("replacement_start_time", value)} /></Field>
            <Field label="Replacement end"><Input type="time" value={form.replacement_end_time} onChange={(value) => setField("replacement_end_time", value)} /></Field>
          </>}

          {[ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS, ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS].includes(resource) && <>
            <Field label="Personnel"><Select value={form.personnel_id} onChange={(value) => setField("personnel_id", value)}><option value="">Select personnel</option>{personnelOptions}</Select></Field>
            <Field label={resource === ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS ? "Facility (optional)" : "Facility"} help="A scheduled assignment does not prove physical presence."><Select value={form.facility_id} onChange={(value) => setField("facility_id", value)}><option value="">{resource === ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS ? "No facility specified" : "Select facility"}</option>{facilityOptions}</Select></Field>
            {resource === ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS && <Field label="Role label" wide><Input value={form.role_label} onChange={(value) => setField("role_label", value)} placeholder="Optional public role label" /></Field>}
            <DayAndTime form={form} setField={setField} />
            <EffectiveDates form={form} setField={setField} />
          </>}

          {resource === ACADEMIC_ADMIN_RESOURCES.CHECK_INS && <>
            <Field label="Personnel"><Select value={form.personnel_id} onChange={(value) => setField("personnel_id", value)}><option value="">Select personnel</option>{personnelOptions}</Select></Field>
            <Field label="Facility"><Select value={form.facility_id} onChange={(value) => setField("facility_id", value)}><option value="">Select facility</option>{facilityOptions}</Select></Field>
            <Field label="Checked in at" wide><Input type="datetime-local" value={form.checked_in_at} onChange={(value) => setField("checked_in_at", value)} /></Field>
          </>}

          {resource === ACADEMIC_ADMIN_RESOURCES.AVAILABILITY_OVERRIDES && <>
            <Field label="Personnel" wide><Select value={form.personnel_id} onChange={(value) => setField("personnel_id", value)}><option value="">Select personnel</option>{personnelOptions}</Select></Field>
            <Field label="Start"><Input type="datetime-local" value={form.starts_at} onChange={(value) => setField("starts_at", value)} /></Field>
            <Field label="End"><Input type="datetime-local" value={form.ends_at} onChange={(value) => setField("ends_at", value)} /></Field>
            <Field label="Status"><Select value={form.override_type} onChange={(value) => setField("override_type", value)}>{OVERRIDE_TYPES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</Select></Field>
            <Field label="Reason (optional)"><Input value={form.reason} onChange={(value) => setField("reason", value)} /></Field>
          </>}

          {![ACADEMIC_ADMIN_RESOURCES.CHECK_INS].includes(resource) && <>
            {![ACADEMIC_ADMIN_RESOURCES.SCHEDULE_EXCEPTIONS].includes(resource) && <Toggle checked={form.public_visibility} onChange={(value) => setField("public_visibility", value)} label="Public visibility" help="Visible only when RLS verification rules also allow it." />}
            {[ACADEMIC_ADMIN_RESOURCES.PERSONNEL, ACADEMIC_ADMIN_RESOURCES.COURSES, ACADEMIC_ADMIN_RESOURCES.SECTIONS, ACADEMIC_ADMIN_RESOURCES.PERSONNEL_ASSIGNMENTS, ACADEMIC_ADMIN_RESOURCES.CONSULTATION_HOURS].includes(resource) && <Toggle checked={form.active} onChange={(value) => setField("active", value)} label="Active" help="Deactivate to retain history without deleting the record." />}
            <Field label="Verification status" wide><Select value={form.verification_status} onChange={(value) => setField("verification_status", value)}>{VERIFICATION_STATUSES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</Select></Field>
          </>}
        </div>

        {error && <p role="alert" className="mx-6 mb-4 rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] px-4 py-3 text-sm text-[#1D1D1F]">{error}</p>}
        <footer className="sticky bottom-0 flex justify-end gap-2 border-t border-[#E5E5E7] bg-white px-6 py-4"><button type="button" disabled={busy} onClick={() => onOpenChange(false)} className={button.smallSecondary}>Cancel</button><button type="button" disabled={busy} onClick={submit} className={button.smallPrimary}><Save className="h-3.5 w-3.5" />{busy ? "Saving…" : resource === ACADEMIC_ADMIN_RESOURCES.CHECK_INS ? "Continue" : "Save"}</button></footer>
      </section>
    </div>
  )
}

function DayAndTime({ form, setField }) {
  return <><Field label="Day"><Select value={form.day_of_week} onChange={(value) => setField("day_of_week", Number(value))}>{DAYS.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}</Select></Field><div /><Field label="Start time"><Input type="time" value={form.start_time} onChange={(value) => setField("start_time", value)} /></Field><Field label="End time"><Input type="time" value={form.end_time} onChange={(value) => setField("end_time", value)} /></Field></>
}

function EffectiveDates({ form, setField }) {
  return <><Field label="Effective from"><Input type="date" value={form.effective_from} onChange={(value) => setField("effective_from", value)} /></Field><Field label="Effective until"><Input type="date" value={form.effective_until} onChange={(value) => setField("effective_until", value)} /></Field></>
}
