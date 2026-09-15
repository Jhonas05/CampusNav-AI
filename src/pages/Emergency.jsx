import { DoorOpen, Layers, Map, MapPin, Phone, Route, ShieldAlert } from "lucide-react"
import { Link } from "react-router-dom"
import { button, card, PageHeader } from "@/components/campus/ui"
import { EMERGENCY_DISCLAIMER, emergencyContacts, emergencyGuidance } from "@/data/emergencyContacts"
import { emergencyExits } from "@/data/emergencyExits"
import { emergencyEquipment } from "@/data/emergencyEquipment"

const supportedFloors = (records) => [...new Set(records.map((record) => record.floorId))]

export default function Emergency() {
  const exitFloors = supportedFloors(emergencyExits)
  const equipmentFloors = supportedFloors(emergencyEquipment)

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F5F5F7] px-4 py-12 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          eyebrow="Verified safety information"
          title="Emergency Information"
          lead="Serious, verified guidance for campus emergencies — calm, factual, and aligned to the official evacuation plan."
        />

        <div role="status" className="mt-8 flex flex-col gap-4 rounded-[1.75rem] border-2 border-red-700 bg-white p-6 sm:flex-row sm:items-center sm:p-7">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-700 text-white">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Important</p>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-[#1D1D1F]">{EMERGENCY_DISCLAIMER}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link to="/map?mode=emergency" className={button.danger}>
            <ShieldAlert className="h-4 w-4" aria-hidden="true" /> Emergency Mode
          </Link>
          <Link to="/map?mode=emergency" className={button.dangerOutline}>
            <Map className="h-4 w-4" aria-hidden="true" /> View Emergency Map
          </Link>
          <Link to="/map?mode=emergency" className={button.secondary}>
            <Route className="h-4 w-4" aria-hidden="true" /> Find Verified Exit
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className={`${card} p-6`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><MapPin className="h-5 w-5" aria-hidden="true" /></span>
            <h2 className="mt-4 font-semibold tracking-tight">Current Floor</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">
              Confirm your floor in Emergency Mode by scanning a CampusNav QR checkpoint or selecting your location manually.
            </p>
          </article>
          <article className={`${card} p-6`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700"><DoorOpen className="h-5 w-5" aria-hidden="true" /></span>
            <h2 className="mt-4 font-semibold tracking-tight">Nearest Verified Exit</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">
              Calculated in Emergency Mode from your confirmed location, using only administrator- or source-approved evacuation paths.
            </p>
          </article>
          <article className={`${card} p-6`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Layers className="h-5 w-5" aria-hidden="true" /></span>
            <h2 className="mt-4 font-semibold tracking-tight">Emergency Floor Plan</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">
              Source-supported exits are plotted on {exitFloors.join(" and ")}; emergency equipment on {equipmentFloors.join(" and ")}. Other floors remain pending verification — follow posted signage there.
            </p>
          </article>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <article className={`${card} p-7`}>
            <h2 className="text-xl font-semibold tracking-tight">Evacuation Guidance</h2>
            <ol className="mt-6 space-y-4">
              {emergencyGuidance.map((item, index) => (
                <li key={item} className="flex gap-4">
                  <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-red-700 text-xs font-bold text-red-700">{index + 1}</span>
                  <p className="pt-1 text-sm leading-relaxed text-[#48484A]">{item}</p>
                </li>
              ))}
            </ol>
          </article>

          <article className={`${card} p-7`}>
            <h2 className="text-xl font-semibold tracking-tight">Emergency Contacts</h2>
            <p className="mt-2 text-xs leading-relaxed text-[#6E6E73]">
              Document-listed contacts are shown for reference. Verification is pending — follow official posted contact information when it differs.
            </p>
            <div className="mt-5 space-y-4">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="flex items-start gap-4 border-t border-[#F0F0F2] pt-4 first:border-0 first:pt-0">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50">
                    <Phone className="h-4 w-4 text-red-700" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug">{contact.label}</p>
                    <p className="mt-1 text-sm tabular-nums text-[#48484A]">{contact.numbers.join(" / ")}</p>
                    <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#86868B]">Last verified: {contact.lastVerified || "Pending verification"}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
