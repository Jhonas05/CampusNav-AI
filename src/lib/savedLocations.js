/**
 * Frontend-only saved locations (localStorage). A convenience for the UI —
 * no backend claim, no sync; storage failures degrade to an empty list.
 */
const STORAGE_KEY = "campusnav.savedLocations.v1"
const CHANGE_EVENT = "campusnav:saved-locations-changed"

const readStorage = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []
  } catch {
    return []
  }
}

const writeStorage = (ids) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Storage unavailable (private mode, quota) — saved locations simply do not persist.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

export const getSavedLocationIds = () => (typeof window === "undefined" ? [] : readStorage())

export const isLocationSaved = (facilityId) => getSavedLocationIds().includes(facilityId)

export const toggleSavedLocation = (facilityId) => {
  const current = getSavedLocationIds()
  const next = current.includes(facilityId) ? current.filter((id) => id !== facilityId) : [...current, facilityId]
  writeStorage(next)
  return next.includes(facilityId)
}

export const subscribeToSavedLocations = (listener) => {
  if (typeof window === "undefined") return () => {}
  const handler = () => listener(getSavedLocationIds())
  window.addEventListener(CHANGE_EVENT, handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler)
    window.removeEventListener("storage", handler)
  }
}
