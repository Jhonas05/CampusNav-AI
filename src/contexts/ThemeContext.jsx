import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { DEFAULT_THEME_PREFERENCE, normalizeThemePreference, readStoredThemePreference, resolveTheme, THEME_COLOR, THEME_STORAGE_KEY, writeStoredThemePreference } from "@/lib/theme"

const DARK_QUERY = "(prefers-color-scheme: dark)"
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

const ThemeContext = createContext({
  preference: DEFAULT_THEME_PREFERENCE,
  resolvedTheme: "light",
  /** @type {(preference: string) => void} */
  setPreference: () => {},
})

const applyTheme = (resolved, { animate }) => {
  const root = document.documentElement
  if (root.classList.contains("dark") === (resolved === "dark") && root.dataset.theme === resolved) return
  const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches
  if (animate && !reduceMotion) {
    root.classList.add("theme-transition")
    window.setTimeout(() => root.classList.remove("theme-transition"), 260)
  }
  root.classList.toggle("dark", resolved === "dark")
  root.dataset.theme = resolved
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[resolved])
}

/**
 * Application-wide Light / Dark / System theme. The resolved theme is a
 * `dark` class on <html>; every color comes from the semantic CSS variables
 * in index.css, so no component needs theme-specific classes.
 */
export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() => (typeof window === "undefined" ? DEFAULT_THEME_PREFERENCE : readStoredThemePreference(window.localStorage)))
  const [systemDark, setSystemDark] = useState(() => (typeof window === "undefined" ? false : window.matchMedia(DARK_QUERY).matches))

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY)
    const update = () => setSystemDark(query.matches)
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  // Keep several open tabs in step.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY) setPreferenceState(normalizeThemePreference(event.newValue))
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const resolvedTheme = resolveTheme(preference, systemDark)

  useEffect(() => {
    applyTheme(resolvedTheme, { animate: true })
  }, [resolvedTheme])

  const setPreference = useCallback((next) => {
    const normalized = normalizeThemePreference(next)
    writeStoredThemePreference(window.localStorage, normalized)
    setPreferenceState(normalized)
  }, [])

  const value = useMemo(() => ({ preference, resolvedTheme, setPreference }), [preference, resolvedTheme, setPreference])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
