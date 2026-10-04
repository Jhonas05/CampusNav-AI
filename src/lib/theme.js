/**
 * Theme preference helpers (DEC-UI-004). Pure functions so the same rules are
 * used by ThemeProvider, the pre-paint script in index.html, and tests.
 */

export const THEME_STORAGE_KEY = "campusnav-theme"
export const THEME_PREFERENCES = Object.freeze(["light", "dark", "system"])
export const DEFAULT_THEME_PREFERENCE = "system"
export const THEME_COLOR = Object.freeze({ light: "#FFFFFF", dark: "#0A0A0A" })

/** Any unknown or missing stored value falls back to "system". */
export const normalizeThemePreference = (value) => (THEME_PREFERENCES.includes(value) ? value : DEFAULT_THEME_PREFERENCE)

/** "system" follows the operating-system setting; explicit choices win. */
export const resolveTheme = (preference, systemPrefersDark) => {
  const normalized = normalizeThemePreference(preference)
  if (normalized === "system") return systemPrefersDark ? "dark" : "light"
  return normalized
}

export const readStoredThemePreference = (storage) => {
  try {
    return normalizeThemePreference(storage?.getItem(THEME_STORAGE_KEY))
  } catch {
    return DEFAULT_THEME_PREFERENCE
  }
}

export const writeStoredThemePreference = (storage, preference) => {
  try {
    storage?.setItem(THEME_STORAGE_KEY, normalizeThemePreference(preference))
    return true
  } catch {
    return false
  }
}
