import { Check, QrCode } from "lucide-react"
import { useEffect } from "react"
import { button } from "@/components/campus/ui"

export default function LocationConfirmationDialog({ confirmation, onChooseDestination, onScanAgain, onClose, primaryLabel = "Choose Destination" }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  if (!confirmation) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1D1D1F]/40 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-confirmed-title"
        className="w-full max-w-sm rounded-[1.75rem] border border-[#E5E5E7] bg-white p-7 text-center shadow-[0_32px_80px_rgba(0,0,0,0.25)]"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white">
          <Check className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 id="location-confirmed-title" className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Location Confirmed</h2>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-[#1D1D1F]">{confirmation.facilityName}</p>
        <p className="mt-1 text-sm text-[#6E6E73]">{confirmation.floorName || confirmation.floorShortName}</p>

        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-[#F5F5F7] px-4 py-3">
          <QrCode className="h-4 w-4 shrink-0 text-[#48484A]" aria-hidden="true" />
          <p className="text-xs text-[#48484A]">
            <span className="font-semibold">Positioning Method:</span> QR Checkpoint
            <span className="ml-1.5 font-mono text-[10px] text-[#86868B]">{confirmation.checkpointId}</span>
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <button type="button" onClick={onChooseDestination} className={`${button.primary} w-full`}>{primaryLabel}</button>
          <button type="button" onClick={onScanAgain} className={`${button.secondary} w-full`}>Scan Again</button>
        </div>
      </section>
    </div>
  )
}
