import { createFacilityResult, FACILITY_AVAILABILITY, FACILITY_ERROR_CODES } from "../data/facilityContracts.js"

const unavailable = () => createFacilityResult({
  ok: false, availability: FACILITY_AVAILABILITY.PROVIDER_UNAVAILABLE, data: null,
  error: { code: FACILITY_ERROR_CODES.PROVIDER_UNAVAILABLE, message: "Facility information is temporarily unavailable.", retryable: true },
})
const loadPublicDiscovery = async () => (await import("./facilityService.js"))
  .getFacilityDiscoveryData(undefined, { includeConfiguredMappings: true })

/** Active-consumer snapshot only: no persistence, background polling, or per-query reads.
 * @param {Record<string, any>} [options]
 */
export const createFacilityDiscoverySnapshot = (options = {}) => {
  const { load = loadPublicDiscovery, clock = Date.now, schedule = setTimeout, cancel = clearTimeout } = options
  const listeners = new Set()
  let online = Boolean(options.isOnline)
  let consumers = 0, generation = 0, releaseVersion = 0
  let inFlight = null, boundaryTimer = null
  let state = { loading: false, result: null, discoveryIndex: null, recommendationIndex: null }
  const publish = (next) => { state = next; for (const listener of listeners) listener() }
  const clearBoundary = () => { if (boundaryTimer !== null) cancel(boundaryTimer); boundaryTimer = null }
  const invalidate = () => {
    generation++
    inFlight = null
    clearBoundary()
    publish({ loading: false, result: null, discoveryIndex: null, recommendationIndex: null })
  }
  const request = (replace = false) => {
    if (!online || consumers === 0) return Promise.resolve(null)
    if (inFlight && !replace) return inFlight
    if (replace) invalidate()
    const ticket = ++generation
    clearBoundary()
    publish({ loading: true, result: null, discoveryIndex: null, recommendationIndex: null })
    const current = () => ticket === generation && online && consumers > 0
    const settle = async (result) => {
      if (!current()) return result
      if (!result || typeof result.ok !== "boolean") result = unavailable()
      let discoveryIndex = null, recommendationIndex = null
      if (result.ok) {
        const { createFacilityDiscoveryIndex, createConfiguredServiceRecommendationIndex } = await import("./facilityService.js")
        if (!current()) return result
        discoveryIndex = createFacilityDiscoveryIndex(result.data)
        recommendationIndex = createConfiguredServiceRecommendationIndex(result.data)
      }
      publish({ loading: false, result, discoveryIndex, recommendationIndex })
      const boundary = Date.parse(result?.data?.nextRefreshAt)
      if (Number.isFinite(boundary)) {
        boundaryTimer = schedule(() => { boundaryTimer = null; request(true) }, Math.max(1, Math.min(2_147_483_647, boundary - clock() + 1)))
      }
      return result
    }
    inFlight = Promise.resolve().then(load).then(settle).catch(() => settle(unavailable()))
      .finally(() => { if (ticket === generation) inFlight = null })
    return inFlight
  }
  return {
    getSnapshot: () => state,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
    retain() {
      consumers++
      releaseVersion++
      if (consumers === 1) request()
      let released = false
      return () => {
        if (released) return
        released = true
        consumers--
        const ticket = ++releaseVersion
        // Coalesce React effect handoffs without keeping an inactive catalog alive.
        queueMicrotask(() => { if (consumers === 0 && ticket === releaseVersion) invalidate() })
      }
    },
    setOnline(value) {
      if (online === value) return
      online = value
      invalidate()
      if (online) request()
    },
    retry: () => request(true),
  }
}
