import { VERIFICATION_STATUS } from "../data/mapStandards.js"

export const ROUTE_PREFERENCE = Object.freeze({
  STANDARD: "STANDARD",
  AVOID_STAIRS: "AVOID_STAIRS",
})

export const ROUTE_PREFERENCE_FAILURE = Object.freeze({
  INVALID_PREFERENCE: "INVALID_ROUTE_PREFERENCE",
  NO_ROUTE: "NO_ROUTE",
  NO_AVOID_STAIRS_ROUTE: "NO_AVOID_STAIRS_ROUTE",
})

export const AVOID_STAIRS_NO_ROUTE_MESSAGE =
  "No route that avoids stairs is available in the verified campus map."

export const AVOID_STAIRS_NO_FALLBACK_GUIDANCE =
  "CampusNav will not automatically substitute a route that uses stairs."

export const INVALID_ROUTE_PREFERENCE_MESSAGE =
  "The requested route preference is not supported."

const VALID_PREFERENCES = new Set(Object.values(ROUTE_PREFERENCE))
const VERIFIED_CONNECTOR_STATUSES = new Set([
  VERIFICATION_STATUS.VERIFIED,
  VERIFICATION_STATUS.SOURCE_ALIGNED,
])

const invalidRouteOptions = () => ({
  ok: false,
  code: ROUTE_PREFERENCE_FAILURE.INVALID_PREFERENCE,
  preference: null,
  message: INVALID_ROUTE_PREFERENCE_MESSAGE,
})

export function resolveRouteOptions(routeOptions) {
  if (routeOptions === undefined) {
    return { ok: true, preference: ROUTE_PREFERENCE.STANDARD }
  }
  if (!routeOptions || typeof routeOptions !== "object" || Array.isArray(routeOptions)) {
    return invalidRouteOptions()
  }
  if (Object.keys(routeOptions).some((key) => key !== "preference")) {
    return invalidRouteOptions()
  }

  const preference = routeOptions.preference === undefined
    ? ROUTE_PREFERENCE.STANDARD
    : routeOptions.preference
  if (!VALID_PREFERENCES.has(preference)) return invalidRouteOptions()

  return { ok: true, preference }
}

export function isRouteEdgeEligibleForPreference(edge, preference) {
  if (preference === ROUTE_PREFERENCE.STANDARD) return true
  if (preference !== ROUTE_PREFERENCE.AVOID_STAIRS) return false
  if (edge.stairs === true) return false
  if (edge.type !== "FLOOR_TRANSITION") return true

  return edge.stairs === false && VERIFIED_CONNECTOR_STATUSES.has(edge.verificationStatus)
}

export const createRouteEdgeEligibility = (preference) =>
  (edge) => isRouteEdgeEligibleForPreference(edge, preference)
