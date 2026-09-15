import QRCode from "qrcode"
import { ArrowLeft, Check, Copy, Download, Printer, QrCode as QrCodeIcon, RefreshCw } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import AdminShell from "@/components/admin/AdminShell"
import { focusRing } from "@/components/campus/ui"
import { getFacilityById } from "@/data/facilities"
import { getFloorById } from "@/data/floors"
import { getMapNodeById } from "@/data/mapNodes"
import { createCheckpointPayload, qrCheckpoints } from "@/data/qrCheckpoints"
import { cn } from "@/lib/utils"

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
})[character])

const buildQrImage = (payload) => QRCode.toDataURL(payload, {
  width: 512,
  margin: 3,
  errorCorrectionLevel: "M",
  color: { dark: "#000000", light: "#FFFFFF" },
})

const actionButtonClass = cn("inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-[#D2D2D7] bg-white px-3.5 text-xs font-medium text-[#1D1D1F] transition-colors duration-200 hover:border-[#86868B] disabled:cursor-not-allowed disabled:text-[#B8B8BD]", focusRing)
const primaryActionClass = cn("inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-brand-700 px-3.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-brand-800", focusRing)

export default function QRCheckpoints() {
  const developerModeAvailable = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MAP_VERIFICATION === "true"
  const [qrImages, setQrImages] = useState({})
  const [copiedId, setCopiedId] = useState("")
  const [generationError, setGenerationError] = useState("")

  if (!developerModeAvailable) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#F5F5F7] px-6 py-20 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">Developer-only</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">QR checkpoint tools are unavailable in this build.</h1>
      </div>
    )
  }

  const generateQr = async (checkpoint) => {
    setGenerationError("")
    try {
      const dataUrl = await buildQrImage(createCheckpointPayload(checkpoint.id))
      setQrImages((current) => ({ ...current, [checkpoint.id]: dataUrl }))
      return dataUrl
    } catch {
      setGenerationError("CampusNav could not generate this QR preview.")
      return null
    }
  }

  const copyPayload = async (checkpoint) => {
    const payload = createCheckpointPayload(checkpoint.id)
    try {
      await navigator.clipboard.writeText(payload)
      setCopiedId(checkpoint.id)
      window.setTimeout(() => setCopiedId(""), 1600)
    } catch {
      setGenerationError("CampusNav could not copy this payload. Select and copy the displayed payload manually.")
    }
  }

  const printLabel = async (checkpoint) => {
    const printWindow = window.open("", "_blank", "width=640,height=760")
    if (!printWindow) return
    printWindow.opener = null
    const image = qrImages[checkpoint.id] || await generateQr(checkpoint)
    if (!image) {
      printWindow.close()
      return
    }

    const facility = getFacilityById(checkpoint.facilityId)
    const floor = getFloorById(checkpoint.floorId)
    printWindow.document.write(`<!doctype html><html><head><title>${escapeHtml(checkpoint.id)}</title><style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#000;background:#fff}.label{box-sizing:border-box;width:420px;margin:32px auto;border:2px solid #000;border-radius:24px;padding:32px;text-align:center}.brand{font-size:18px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.facility{margin-top:18px;font-size:32px;font-weight:700}.floor{margin-top:8px;font-size:18px}.qr{display:block;width:300px;height:300px;margin:28px auto}.id{font:700 16px ui-monospace,SFMono-Regular,Menlo,monospace}@media print{.label{margin:0 auto;page-break-inside:avoid}}</style></head><body><main class="label"><div class="brand">CampusNav</div><div class="facility">${escapeHtml(facility?.name || checkpoint.label)}</div><div class="floor">${escapeHtml(floor?.name || checkpoint.floorId)}</div><img class="qr" src="${image}" alt=""><div class="id">${escapeHtml(checkpoint.id)}</div></main></body></html>`)
    printWindow.document.close()
    printWindow.setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 250)
  }

  const renderActions = (checkpoint, image) => (
    <>
      <button type="button" onClick={() => generateQr(checkpoint)} className={primaryActionClass}>
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Generate QR
      </button>
      <button type="button" onClick={() => copyPayload(checkpoint)} className={actionButtonClass}>
        <Copy className="h-3.5 w-3.5" aria-hidden="true" /> {copiedId === checkpoint.id ? "Copied" : "Copy Payload"}
      </button>
      <button type="button" onClick={() => printLabel(checkpoint)} className={actionButtonClass}>
        <Printer className="h-3.5 w-3.5" aria-hidden="true" /> Print Label
      </button>
      {image ? (
        <a href={image} download={`${checkpoint.id}.png`} className={actionButtonClass}>
          <Download className="h-3.5 w-3.5" aria-hidden="true" /> Save QR
        </a>
      ) : (
        <span aria-disabled="true" className={cn(actionButtonClass, "cursor-not-allowed text-[#B8B8BD] hover:border-[#D2D2D7]")}>
          <Download className="h-3.5 w-3.5" aria-hidden="true" /> Save QR
        </span>
      )}
    </>
  )

  return (
    <AdminShell>
      <Link to="/map?verify=1" className={`inline-flex items-center gap-2 rounded-md text-sm font-medium text-[#6E6E73] transition-colors hover:text-[#1D1D1F] ${focusRing}`}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Map verification
      </Link>
      <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">Developer-only · authentication pending</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">QR Checkpoints</h1>
          <p className="mt-3 max-w-2xl text-[#6E6E73]">Generate, verify, print, and save checkpoint labels. Payloads identify checkpoint IDs only.</p>
        </div>
        <div className="shrink-0 rounded-full border border-[#D2D2D7] bg-white px-4 py-2 text-xs font-medium text-[#6E6E73]">{qrCheckpoints.length} active checkpoints</div>
      </div>

      {generationError && <p role="alert" className="mt-5 rounded-2xl border-[1.5px] border-[#1D1D1F] bg-white p-4 text-sm font-medium">{generationError}</p>}

      {/* Desktop: clean admin table */}
      <div className="mt-7 hidden overflow-hidden rounded-[1.5rem] border border-[#E5E5E7] bg-white lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#E5E5E7] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#86868B]">
              <th scope="col" className="px-5 py-4 font-semibold">Checkpoint</th>
              <th scope="col" className="px-4 py-4 font-semibold">Facility</th>
              <th scope="col" className="px-4 py-4 font-semibold">Floor</th>
              <th scope="col" className="px-4 py-4 font-semibold">Linked node</th>
              <th scope="col" className="px-4 py-4 font-semibold">Status</th>
              <th scope="col" className="px-4 py-4 font-semibold">Preview</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {qrCheckpoints.map((checkpoint) => {
              const facility = getFacilityById(checkpoint.facilityId)
              const floor = getFloorById(checkpoint.floorId)
              const node = getMapNodeById(checkpoint.nodeId)
              const image = qrImages[checkpoint.id]
              return (
                <tr key={checkpoint.id} className="border-b border-[#F0F0F2] align-middle transition-colors duration-150 last:border-0 hover:bg-[#FAFAFA]">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-bold text-[#1D1D1F]">{checkpoint.id}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-[#86868B]">{checkpoint.verificationStatus}</p>
                  </td>
                  <td className="px-4 py-4 font-medium">{facility?.name}</td>
                  <td className="px-4 py-4 text-[#6E6E73]">{floor?.shortName || checkpoint.floorId}</td>
                  <td className="max-w-40 truncate px-4 py-4 font-mono text-xs text-[#6E6E73]">{node?.id}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-brand-700 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white">{checkpoint.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    {image ? (
                      <img src={image} alt={`${checkpoint.id} QR preview`} className="h-12 w-12 rounded-lg border border-[#E5E5E7] object-contain [image-rendering:pixelated]" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-[#D2D2D7] text-[#C7C7CC]"><QrCodeIcon className="h-5 w-5" aria-hidden="true" /></span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap justify-end gap-1.5">{renderActions(checkpoint, image)}</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:hidden">
        {qrCheckpoints.map((checkpoint) => {
          const facility = getFacilityById(checkpoint.facilityId)
          const floor = getFloorById(checkpoint.floorId)
          const node = getMapNodeById(checkpoint.nodeId)
          const payload = createCheckpointPayload(checkpoint.id)
          const image = qrImages[checkpoint.id]

          return (
            <article key={checkpoint.id} className="overflow-hidden rounded-[1.5rem] border border-[#E5E5E7] bg-white">
              <div className="border-b border-[#F0F0F2] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#86868B]">Checkpoint ID</p>
                    <h2 className="mt-1 font-mono text-sm font-bold">{checkpoint.id}</h2>
                  </div>
                  <span className="rounded-full bg-brand-700 px-2.5 py-1 text-[10px] font-bold text-white">{checkpoint.status}</span>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-[10px] uppercase tracking-wide text-[#86868B]">Facility</dt><dd className="mt-1 font-medium">{facility?.name}</dd></div>
                  <div><dt className="text-[10px] uppercase tracking-wide text-[#86868B]">Floor</dt><dd className="mt-1 font-medium">{floor?.name}</dd></div>
                  <div className="col-span-2"><dt className="text-[10px] uppercase tracking-wide text-[#86868B]">Linked node</dt><dd className="mt-1 break-all font-mono text-xs font-medium">{node?.id}</dd></div>
                  <div className="col-span-2"><dt className="text-[10px] uppercase tracking-wide text-[#86868B]">Verification status</dt><dd className="mt-1 text-xs font-medium">{checkpoint.verificationStatus}</dd></div>
                </dl>
              </div>

              <div className="p-5">
                <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#F5F5F7] p-5">
                  {image ? (
                    <img src={image} alt={`${checkpoint.id} QR preview`} className="h-full w-full object-contain [image-rendering:pixelated]" />
                  ) : (
                    <div className="text-center text-[#86868B]">
                      <QrCodeIcon className="mx-auto h-10 w-10" aria-hidden="true" />
                      <p className="mt-3 text-xs">QR Preview</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 rounded-xl bg-[#F5F5F7] p-3">
                  <p className="text-[10px] uppercase tracking-wide text-[#86868B]">Payload</p>
                  <code className="mt-1 block break-all text-xs font-semibold text-[#1D1D1F]">{payload}</code>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">{renderActions(checkpoint, image)}</div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#E5E5E7] bg-white p-4 text-xs text-[#6E6E73]">
        <Check className="h-4 w-4 shrink-0 text-[#1D1D1F]" aria-hidden="true" /> QR payloads contain no routes, coordinates, facility metadata, or sensitive information.
      </div>
    </AdminShell>
  )
}
