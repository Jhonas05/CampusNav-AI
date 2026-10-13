import { Map, Phone, ShieldAlert } from "lucide-react"
import { useRef } from "react"
import { Link } from "react-router-dom"
import { button, card, Disclosure, PageHeader } from "@/components/campus/ui"
import { EMERGENCY_DISCLAIMER, emergencyContacts, emergencyGuidance } from "@/data/emergencyContacts"
import { emergencyExits } from "@/data/emergencyExits"
import { emergencyEquipment } from "@/data/emergencyEquipment"
import { cn } from "@/lib/utils"

const supportedFloors = (records) => [...new Set(records.map((record) => record.floorId))]

/**
 * Emergency information, tools first: the emergency map and the contacts are
 * the first two controls, then the standing notice, the short guidance, and
 * the contacts. How Emergency Mode works is one tap away. Safety wording is
 * the canonical text and is not shortened.
 */
export default function Emergency() {
  const exitFloors = supportedFloors(emergencyExits)
  const equipmentFloors = supportedFloors(emergencyEquipment)
  const contactsRef = useRef(/** @type {HTMLElement | null} */ (null))

  const showContacts = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    contactsRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
    contactsRef.current?.focus({ preventScroll: true })
  }

  return (
    <div className="app-page bg-canvas">
      <div className="app-container-readable">
        <PageHeader compact eyebrow="Verified safety information" title="Emergency Information" />

        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-5 sm:flex sm:flex-wrap">
          <Link to="/map?mode=emergency" className={cn(button.danger, "min-h-12 px-3 sm:px-5")}>
            <Map className="h-4 w-4 shrink-0" aria-hidden="true" /> Emergency Map
          </Link>
          <button type="button" onClick={showContacts} className={cn(button.dangerOutline, "min-h-12 px-3 sm:px-5")}>
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> Contacts
          </button>
        </div>

        <div role="status" className="mt-4 flex items-start gap-3 rounded-2xl border-2 border-ink bg-surface p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[15px] font-medium leading-relaxed text-ink">{EMERGENCY_DISCLAIMER}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Exits are mapped on {exitFloors.join(" and ")}; emergency equipment on {equipmentFloors.join(" and ")}. On other floors, follow posted signage.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <article className={`${card} p-4 sm:p-6`}>
            <h2 className="text-[18px] font-semibold tracking-tight">Evacuation guidance</h2>
            <ol className="mt-3 space-y-2.5">
              {emergencyGuidance.map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink text-xs font-bold text-ink">{index + 1}</span>
                  <p className="pt-0.5 text-[15px] leading-relaxed text-ink-mid">{item}</p>
                </li>
              ))}
            </ol>
          </article>

          <article ref={contactsRef} tabIndex={-1} aria-labelledby="emergency-contacts-title" className={`${card} scroll-mt-20 p-4 outline-none sm:p-6`}>
            <h2 id="emergency-contacts-title" className="text-[18px] font-semibold tracking-tight">Emergency contacts</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              Document-listed contacts; verification is pending. Follow official posted contact information when it differs.
            </p>
            <ul className="mt-3 divide-y divide-line">
              {emergencyContacts.map((contact) => (
                <li key={contact.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-[15px] font-semibold leading-snug">{contact.label}</p>
                  <p className="mt-0.5 text-[15px] tabular-nums text-ink-mid">{contact.numbers.join(" / ")}</p>
                  <p className="mt-1 text-[12px] text-ink-faint">Last verified: {contact.lastVerified || "Pending verification"}</p>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <Disclosure summary="How Emergency Mode works" className="mt-4 border-t border-line pt-1">
          <ul className="space-y-2 text-sm leading-relaxed text-ink-soft">
            <li><span className="font-semibold text-ink">Your floor.</span> Confirm it by scanning a CampusNav QR checkpoint or selecting your location manually.</li>
            <li><span className="font-semibold text-ink">Nearest verified exit.</span> Calculated from your confirmed location, using only administrator- or source-approved evacuation paths.</li>
            <li><span className="font-semibold text-ink">Floor plan.</span> Floors without source-supported exits remain pending verification.</li>
          </ul>
        </Disclosure>
      </div>
    </div>
  )
}
