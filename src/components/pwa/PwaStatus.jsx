import { CheckCircle2, Download, RefreshCw, Share, WifiOff, X } from "lucide-react"
import { useEffect, useState } from "react"
import { button, focusRing } from "@/components/campus/ui"
import { useConnectivity } from "@/contexts/ConnectivityContext"
import { usePwa } from "@/contexts/PwaContext"
import { cn } from "@/lib/utils"

const panelClass = "pwa-status-panel fixed bottom-[calc(var(--app-bottom-nav-height)+env(safe-area-inset-bottom)+var(--clara-lift,0px)+0.75rem)] left-3 right-[5rem] z-toast rounded-2xl border border-line-strong bg-surface p-3 shadow-[0_12px_36px_rgba(0,0,0,0.16)] md:bottom-[calc(1rem+var(--clara-lift,0px))] md:left-auto md:right-[5.5rem] md:w-[min(26rem,calc(100vw-7rem))] print:hidden"

export default function PwaStatus() {
  const connectivity = useConnectivity()
  const pwa = usePwa()
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    if (!connectivity.reconnectVersion) return undefined
    setShowReconnected(true)
    const timeout = window.setTimeout(() => setShowReconnected(false), 4_000)
    return () => window.clearTimeout(timeout)
  }, [connectivity.reconnectVersion])

  if (pwa.updateAvailable) {
    return (
      <section aria-live="polite" aria-label="CampusNav update" className={panelClass}>
        <div className="flex items-start gap-3">
          <RefreshCw className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">CampusNav update ready</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">Apply it when you are ready. The page will reload once.</p>
            <button type="button" onClick={pwa.applyUpdate} className={cn(button.smallPrimary, "mt-3")}>Update now</button>
          </div>
        </div>
      </section>
    )
  }

  if (pwa.installHelpOpen) {
    return (
      <section aria-live="polite" aria-label="Install CampusNav" className={panelClass}>
        <button type="button" onClick={pwa.hideInstallHelp} aria-label="Close install help" className={cn("absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-fill", focusRing)}><X className="h-4 w-4" aria-hidden="true" /></button>
        <div className="flex items-start gap-3 pr-8">
          <Share className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-ink">Install CampusNav</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">{pwa.iosInstallAvailable ? "In Safari, tap Share, then Add to Home Screen." : "Use your browser menu and choose Install app or Add to Home screen."}</p>
          </div>
        </div>
      </section>
    )
  }

  if (connectivity.isOffline) {
    return (
      <section aria-live="assertive" aria-label="Offline status" className={panelClass}>
        <div className="flex items-start gap-3">
          <WifiOff className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">You are offline</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">Cached 2D navigation and canonical locations remain available. Live status and Emergency routing are unavailable.</p>
            <button type="button" onClick={connectivity.retryConnectivity} className={cn(button.smallSecondary, "mt-3")}>Check connection</button>
          </div>
        </div>
      </section>
    )
  }

  if (pwa.shouldOfferInstall) {
    return (
      <section aria-live="polite" aria-label="Install CampusNav" className={panelClass}>
        <button type="button" onClick={pwa.dismissInstallOffer} aria-label="Dismiss install offer" className={cn("absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-fill", focusRing)}><X className="h-4 w-4" aria-hidden="true" /></button>
        <div className="flex items-start gap-3 pr-8">
          <Download className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-ink">Install CampusNav</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">Keep campus navigation within reach from your home screen.</p>
            <button type="button" onClick={pwa.requestInstall} className={cn(button.smallPrimary, "mt-3")}>Install</button>
          </div>
        </div>
      </section>
    )
  }

  if (showReconnected) {
    return (
      <div role="status" className={panelClass}>
        <p className="flex items-center gap-2 text-sm font-semibold text-ink"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /> Back online</p>
        <p className="mt-1 pl-7 text-xs text-ink-soft">Live facility information can refresh again.</p>
      </div>
    )
  }

  return null
}
