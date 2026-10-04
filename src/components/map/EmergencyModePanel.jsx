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
        <section className="rounded-3xl border-2 border-ink bg-surface p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]"><WifiOff className="h-4 w-4" /> Offline Mode</div>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">Displaying bundled emergency reference data. No live status is claimed while offline.</p>
        </section>
      )}

      <section className="rounded-3xl border-2 border-ink bg-surface p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-on-ink"><ShieldAlert className="h-5 w-5" /></span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink">Emergency Mode</p>
        <h2 className="mt-2 text-xl font-semibold">Find a source-approved exit</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">Current: {currentLocation?.name || "Not selected"} - {currentFloorId}</p>
        <button type="button" onClick={onFindExit} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 font-heading text-sm font-semibold text-on-ink transition-colors duration-200 hover:bg-ink-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">
          <Route className="h-4 w-4" /> Find Nearest Verified Exit
        </button>
        <p className="mt-5 border-t border-line-strong pt-4 text-xs font-medium leading-relaxed text-ink">{EMERGENCY_DISCLAIMER}</p>
      </section>

      {result?.ok && (
        <section className="rounded-3xl border-l-4 border-ink bg-ink p-5 text-on-ink" role="status">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-ink/55">Verified digital route</p>
          <h2 className="mt-2 text-xl font-semibold">{result.exit.label}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-on-ink/15 pt-4 text-sm">
            <div><p className="text-[10px] uppercase tracking-wide text-on-ink/55">Approved route cost</p><p className="mt-1 font-semibold">{result.route.distance.label}</p></div>
            <div><p className="text-[10px] uppercase tracking-wide text-on-ink/55">Floor changes</p><p className="mt-1 font-semibold">{result.route.floorChanges}</p></div>
            <div className="col-span-2"><p className="text-[10px] uppercase tracking-wide text-on-ink/55">Route</p><p className="mt-1 font-semibold">{result.route.routeFloorIds.join(" -> ")}</p></div>
          </div>
          <ol className="mt-5 space-y-3 border-t border-on-ink/15 pt-4">
            {instructions.map((instruction, index) => <li key={`${instruction.type}-${index}`} className="flex gap-3 text-sm leading-relaxed text-on-ink/80"><span className="font-semibold text-on-ink">{index + 1}.</span>{instruction.text}</li>)}
          </ol>
        </section>
      )}

      {result && !result.ok && (
        <section role="alert" className="rounded-3xl border-2 border-dashed border-ink bg-fill p-5">
          <CircleAlert className="h-6 w-6 text-ink" />
          <h2 className="mt-4 text-lg font-semibold text-ink">No verified route</h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-ink">{result.message}</p>
        </section>
      )}

      <section className="rounded-3xl border border-line-strong bg-surface p-6">
        <h2 className="font-semibold">Evacuation guidance</h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink-soft">
          {emergencyGuidance.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true">-</span>{item}</li>)}
        </ul>
      </section>

      <section className="rounded-3xl border border-line-strong bg-surface p-6">
        <h2 className="font-semibold">Emergency contacts</h2>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">Document-listed contacts are shown for reference. Current verification is pending.</p>
        <div className="mt-4 space-y-4">
          {emergencyContacts.map((contact) => (
            <article key={contact.id} className="border-t border-line pt-4 first:border-0 first:pt-0">
              <p className="text-sm font-semibold">{contact.label}</p>
              <p className="mt-1 text-sm text-ink">{contact.numbers.join(" / ")}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">Last verified: {contact.lastVerified || "Pending verification"}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

