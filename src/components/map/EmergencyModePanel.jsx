import { CircleAlert, Route, ShieldAlert, WifiOff } from "lucide-react"
import { useEffect, useState } from "react"
import { EMERGENCY_DISCLAIMER, emergencyContacts, emergencyGuidance } from "@/data/emergencyContacts"

export default function EmergencyModePanel({ result, instructions, currentLocation, currentFloorId, onFindExit }) {
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  return (
    <div className="space-y-4" data-testid="emergency-mode-panel">
      {!online && (
        <section className="rounded-3xl border-2 border-[#1D1D1F] bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]"><WifiOff className="h-4 w-4" /> Offline Mode</div>
          <p className="mt-2 text-xs leading-relaxed text-[#6E6E73]">Displaying bundled emergency reference data. No live status is claimed while offline.</p>
        </section>
      )}

      <section className="rounded-3xl border-2 border-red-700 bg-white p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-700 text-white"><ShieldAlert className="h-5 w-5" /></span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-red-700">Emergency Mode</p>
        <h2 className="mt-2 text-xl font-semibold">Find a source-approved exit</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#6E6E73]">Current: {currentLocation?.name || "Not selected"} - {currentFloorId}</p>
        <button type="button" onClick={onFindExit} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-700 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2">
          <Route className="h-4 w-4" /> Find Nearest Verified Exit
        </button>
        <p className="mt-5 border-t border-[#D2D2D7] pt-4 text-xs font-medium leading-relaxed text-[#1D1D1F]">{EMERGENCY_DISCLAIMER}</p>
      </section>

      {result?.ok && (
        <section className="rounded-3xl bg-green-900 p-6 text-white" role="status">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Verified digital route</p>
          <h2 className="mt-2 text-xl font-semibold">{result.exit.label}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/15 pt-4 text-sm">
            <div><p className="text-[10px] uppercase tracking-wide text-white/55">Approved route cost</p><p className="mt-1 font-semibold">{result.route.distance.label}</p></div>
            <div><p className="text-[10px] uppercase tracking-wide text-white/55">Floor changes</p><p className="mt-1 font-semibold">{result.route.floorChanges}</p></div>
            <div className="col-span-2"><p className="text-[10px] uppercase tracking-wide text-white/55">Route</p><p className="mt-1 font-semibold">{result.route.routeFloorIds.join(" -> ")}</p></div>
          </div>
          <ol className="mt-5 space-y-3 border-t border-white/15 pt-4">
            {instructions.map((instruction, index) => <li key={`${instruction.type}-${index}`} className="flex gap-3 text-sm leading-relaxed text-white/80"><span className="font-semibold text-white">{index + 1}.</span>{instruction.text}</li>)}
          </ol>
        </section>
      )}

      {result && !result.ok && (
        <section role="alert" className="rounded-3xl border-2 border-dashed border-red-700 bg-red-50 p-6">
          <CircleAlert className="h-6 w-6 text-red-700" />
          <h2 className="mt-4 text-lg font-semibold text-red-900">No verified route</h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-red-900">{result.message}</p>
        </section>
      )}

      <section className="rounded-3xl border border-[#D2D2D7] bg-white p-6">
        <h2 className="font-semibold">Evacuation guidance</h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#6E6E73]">
          {emergencyGuidance.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true">-</span>{item}</li>)}
        </ul>
      </section>

      <section className="rounded-3xl border border-[#D2D2D7] bg-white p-6">
        <h2 className="font-semibold">Emergency contacts</h2>
        <p className="mt-2 text-xs leading-relaxed text-[#6E6E73]">Document-listed contacts are shown for reference. Current verification is pending.</p>
        <div className="mt-4 space-y-4">
          {emergencyContacts.map((contact) => (
            <article key={contact.id} className="border-t border-[#E5E5E7] pt-4 first:border-0 first:pt-0">
              <p className="text-sm font-semibold">{contact.label}</p>
              <p className="mt-1 text-sm text-[#1D1D1F]">{contact.numbers.join(" / ")}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">Last verified: {contact.lastVerified || "Pending verification"}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

