import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  applyServiceWorkerUpdate,
  getServiceWorkerState,
  subscribeToServiceWorker,
} from "@/pwa/serviceWorkerRegistration"

const PwaContext = createContext(null)

const isStandalone = () => (
  window.matchMedia("(display-mode: standalone)").matches
  || window.navigator.standalone === true
)

const isIosBrowser = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent)

export function PwaProvider({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(isStandalone)
  const [installHelpOpen, setInstallHelpOpen] = useState(false)
  const [installOfferDismissed, setInstallOfferDismissed] = useState(false)
  const [workerState, setWorkerState] = useState(getServiceWorkerState)

  useEffect(() => subscribeToServiceWorker(setWorkerState), [])

  useEffect(() => {
    const captureInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
      setInstallOfferDismissed(false)
    }
    const markInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
      setInstallHelpOpen(false)
    }
    window.addEventListener("beforeinstallprompt", captureInstallPrompt)
    window.addEventListener("appinstalled", markInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt)
      window.removeEventListener("appinstalled", markInstalled)
    }
  }, [])

  const requestInstall = useCallback(async () => {
    if (!installPrompt) {
      setInstallHelpOpen(true)
      return false
    }
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    setInstallPrompt(null)
    setInstallOfferDismissed(true)
    return choice.outcome === "accepted"
  }, [installPrompt])

  const value = useMemo(() => ({
    installed,
    canInstall: Boolean(installPrompt) && !installed,
    shouldOfferInstall: Boolean(installPrompt) && !installed && !installOfferDismissed,
    iosInstallAvailable: isIosBrowser() && !installed,
    installHelpOpen,
    requestInstall,
    showInstallHelp: () => setInstallHelpOpen(true),
    hideInstallHelp: () => setInstallHelpOpen(false),
    dismissInstallOffer: () => setInstallOfferDismissed(true),
    ...workerState,
    applyUpdate: applyServiceWorkerUpdate,
  }), [installHelpOpen, installOfferDismissed, installPrompt, installed, requestInstall, workerState])

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>
}

export const usePwa = () => {
  const value = useContext(PwaContext)
  if (!value) throw new Error("usePwa must be used inside PwaProvider")
  return value
}
