import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { useConnectivity } from "./ConnectivityContext"
import { createFacilityDiscoverySnapshot } from "@/services/facilityDiscoverySnapshot"

const FacilityDiscoveryContext = createContext(null)

/** @param {Record<string, any>} props */
export function FacilityDiscoveryProvider({ children, snapshot: suppliedSnapshot }) {
  const connectivity = useConnectivity()
  const [snapshot] = useState(() => suppliedSnapshot || createFacilityDiscoverySnapshot({ isOnline: connectivity.isOnline }))
  useEffect(() => { snapshot.setOnline(connectivity.isOnline) }, [snapshot, connectivity.isOnline, connectivity.reconnectVersion])
  return <FacilityDiscoveryContext.Provider value={snapshot}>{children}</FacilityDiscoveryContext.Provider>
}

export function useFacilityDiscovery(enabled = true) {
  const snapshot = useContext(FacilityDiscoveryContext)
  if (!snapshot) throw new Error("useFacilityDiscovery must be used inside FacilityDiscoveryProvider")
  const connectivity = useConnectivity()
  const state = useSyncExternalStore(snapshot.subscribe, snapshot.getSnapshot, snapshot.getSnapshot)
  useEffect(() => enabled ? snapshot.retain() : undefined, [snapshot, enabled])
  return useMemo(() => {
    const usable = enabled && connectivity.isOnline
    return {
      loading: usable && (state.loading || !state.result),
      result: usable ? state.result : null,
      discoveryIndex: usable && !state.loading ? state.discoveryIndex : null,
      recommendationIndex: usable && !state.loading ? state.recommendationIndex : null,
      retry: snapshot.retry,
    }
  }, [enabled, connectivity.isOnline, state, snapshot])
}
