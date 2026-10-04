import { getFacilityById } from "../data/facilities.js"
import { getFloorById } from "../data/floors.js"

/**
 * Link into the Navigate page using its existing query parameters:
 * `?facility=<id>` (opens on that facility's floor with it as the destination
 * when it has a usable entrance) or `?floor=<id>`. Unknown ids fall back to
 * plain `/map`; no new URL format is introduced.
 * @param {{ floorId?: string | null, facilityId?: string | null }} [target]
 */
export const getNavigateHref = (target = {}) => {
  const { floorId = null, facilityId = null } = target
  if (facilityId && getFacilityById(facilityId)) return `/map?facility=${encodeURIComponent(facilityId)}`
  if (floorId && getFloorById(floorId)) return `/map?floor=${encodeURIComponent(floorId)}`
  return "/map"
}
