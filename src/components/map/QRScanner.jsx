import { Camera, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { button } from "@/components/campus/ui"
import useModalDialog from "@/components/campus/useModalDialog"
import { getCameraAccessMessage } from "@/lib/cameraAccess"

const FRAME_CORNERS = [
  "left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-2xl",
  "right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-2xl",
  "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-2xl",
  "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-2xl",
]

export default function QRScanner({ onDetected, onClose, onManual }) {
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const browserCodeReaderRef = useRef(null)
  const settledRef = useRef(false)
  const [cameraError, setCameraError] = useState("")

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null

    const video = videoRef.current
    const stream = video?.srcObject
    if (stream && typeof stream.getTracks === "function") {
      stream.getTracks().forEach((track) => track.stop())
    }
    if (video) {
      video.pause()
      video.srcObject = null
    }
    browserCodeReaderRef.current?.releaseAllStreams()
  }, [])

  useEffect(() => {
    let cancelled = false
    settledRef.current = false
    setCameraError("")

    const startScanner = async () => {
      try {
        const { BrowserCodeReader, BrowserQRCodeReader } = await import("@zxing/browser")
        if (cancelled) return
        browserCodeReaderRef.current = BrowserCodeReader
        const reader = new BrowserQRCodeReader(undefined, {
          delayBetweenScanAttempts: 250,
          delayBetweenScanSuccess: 500,
        })
        const controls = await reader.decodeFromConstraints(
          { audio: false, video: { facingMode: { ideal: "environment" } } },
          videoRef.current,
          (result) => {
            if (!result || settledRef.current) return
            settledRef.current = true
            const payload = result.getText()
            stopCamera()
            onDetected(payload)
          }
        )
        if (cancelled || settledRef.current) controls.stop()
        else controlsRef.current = controls
      } catch (error) {
        if (cancelled) return
        stopCamera()
        setCameraError(getCameraAccessMessage(error))
      }
    }

    startScanner()
    return () => {
      cancelled = true
      stopCamera()
    }
  }, [onDetected, stopCamera])

  const closeScanner = () => {
    stopCamera()
    onClose()
  }

  const dialogRef = useModalDialog({ onClose: closeScanner })

  const useManualLocation = () => {
    stopCamera()
    onManual()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="qr-scanner-title">
      <section ref={dialogRef} className="w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
        <header className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">QR positioning</p>
            <h2 id="qr-scanner-title" className="mt-2 text-2xl font-semibold tracking-tight">Scan CampusNav Checkpoint</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">Align the CampusNav QR code inside the frame.</p>
          </div>
          <button type="button" onClick={closeScanner} aria-label="Close QR scanner" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong transition-colors duration-200 hover:border-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="p-5 sm:p-6">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" aria-label="QR camera preview" />
            {!cameraError && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
                <div className="absolute inset-0 bg-black/25 [mask-image:radial-gradient(circle_at_center,transparent_112px,black_128px)]" />
                <div className="relative h-44 w-44">
                  {FRAME_CORNERS.map((corner) => (
                    <span key={corner} className={`absolute h-9 w-9 border-white ${corner}`} />
                  ))}
                </div>
              </div>
            )}
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
                <div>
                  <Camera className="mx-auto h-7 w-7" aria-hidden="true" />
                  <p className="mt-4 text-sm leading-relaxed">{cameraError}</p>
                </div>
              </div>
            )}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink-soft">Camera frames are processed locally for QR recognition and are not recorded, stored, or uploaded.</p>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <button type="button" onClick={useManualLocation} className={`${button.outline} w-full sm:flex-1`}>
              Set Location Manually
            </button>
            <button type="button" onClick={closeScanner} className={`${button.secondary} w-full sm:w-auto sm:px-8`}>
              Close
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
