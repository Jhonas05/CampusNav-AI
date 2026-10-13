import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

const PROBE_TIMEOUT_MS = 5_000
const ConnectivityContext = createContext(null)

const initialStatus = () => (
  typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "checking"
)

export function ConnectivityProvider({ children }) {
  const [status, setStatus] = useState(initialStatus)
  const [reconnectVersion, setReconnectVersion] = useState(0)
  const previousStatus = useRef(initialStatus())
  const probeInFlight = useRef(null)

  const commitStatus = useCallback((nextStatus) => {
    const previous = previousStatus.current
    previousStatus.current = nextStatus
    setStatus(nextStatus)
    if (nextStatus === "online" && previous === "offline") {
      setReconnectVersion((version) => version + 1)
    }
  }, [])

  const checkConnectivity = useCallback(async () => {
    if (navigator.onLine === false) {
      commitStatus("offline")
      return false
    }
    if (probeInFlight.current) return probeInFlight.current

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
    const probe = fetch(`/manifest.json?__campusnav_network_probe=${Date.now()}`, {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then((response) => {
        const reachable = response.ok
        commitStatus(reachable ? "online" : "offline")
        return reachable
      })
      .catch(() => {
        commitStatus("offline")
        return false
      })
      .finally(() => {
        window.clearTimeout(timeout)
        probeInFlight.current = null
      })

    probeInFlight.current = probe
    return probe
  }, [commitStatus])

  useEffect(() => {
    const onOffline = () => commitStatus("offline")
    const onOnline = () => { checkConnectivity() }
    const onVisibility = () => {
      if (document.visibilityState === "visible") checkConnectivity()
    }

    checkConnectivity()
    window.addEventListener("offline", onOffline)
    window.addEventListener("online", onOnline)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("offline", onOffline)
      window.removeEventListener("online", onOnline)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [checkConnectivity, commitStatus])

  const value = useMemo(() => ({
    status,
    isChecking: status === "checking",
    isOnline: status === "online",
    isOffline: status === "offline",
    reconnectVersion,
    retryConnectivity: checkConnectivity,
  }), [checkConnectivity, reconnectVersion, status])

  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>
}

export const useConnectivity = () => {
  const value = useContext(ConnectivityContext)
  if (!value) throw new Error("useConnectivity must be used inside ConnectivityProvider")
  return value
}
