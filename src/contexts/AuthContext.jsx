import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { canManageEmergencyData, canManageFacilities, canManageSchedules, canPublishAnnouncements, hasAnyRole, hasRole } from "@/lib/authorization"
import { BACKEND_MODES } from "@/lib/supabaseClient"
import { emptyAuthState } from "@/providers/auth/localAuthProvider"
import { createActiveAuthProvider } from "@/services/authService"

const defaultValue = {
  ...emptyAuthState,
  loading: false,
  error: null,
  backendMode: BACKEND_MODES.LOCAL,
  backendStatus: "LOCAL_PROTOTYPE",
  signIn: async (_credentials) => ({ ok: false }),
  signOut: async () => ({ ok: true }),
  hasRole: () => false,
  hasAnyRole: () => false,
  canManageFacilities: () => false,
  canManageSchedules: () => false,
  canPublishAnnouncements: () => false,
  canManageEmergencyData: () => false,
}

const AuthContext = createContext(defaultValue)

export function AuthProvider({ children, providerFactory = createActiveAuthProvider }) {
  const providerRef = useRef(null)
  const [state, setState] = useState(/** @type {any} */ ({ ...defaultValue, loading: true }))

  useEffect(() => {
    let active = true
    let unsubscribe = () => {}

    providerFactory().then(async (provider) => {
      if (!active) return
      providerRef.current = provider
      unsubscribe = provider.subscribe((nextState) => {
        if (!active) return
        setState((current) => ({
          ...current,
          ...nextState,
          loading: false,
          error: nextState.error || null,
          backendMode: provider.mode,
          backendStatus: provider.status,
        }))
      })

      try {
        const initialState = await provider.getInitialState()
        if (active) setState((current) => ({
          ...current,
          ...initialState,
          loading: false,
          error: null,
          backendMode: provider.mode,
          backendStatus: provider.status,
        }))
      } catch (error) {
        if (active) setState((current) => ({
          ...current,
          ...emptyAuthState,
          loading: false,
          error,
          backendMode: provider.mode,
          backendStatus: provider.mode === BACKEND_MODES.SUPABASE ? "SUPABASE_OFFLINE" : provider.status,
        }))
      }
    }).catch((error) => {
      if (active) setState((current) => ({ ...current, loading: false, error, backendStatus: "SUPABASE_OFFLINE" }))
    })

    return () => {
      active = false
      providerRef.current = null
      unsubscribe()
    }
  }, [providerFactory])

  const signIn = useCallback(async (credentials) => {
    if (!providerRef.current) return { ok: false, error: new Error("Authentication is still loading.") }
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const nextState = await providerRef.current.signIn(credentials)
      setState((current) => ({ ...current, ...nextState, loading: false, error: null }))
      return { ok: true }
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error }))
      return { ok: false, error }
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!providerRef.current) return { ok: true }
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      await providerRef.current.signOut()
      setState((current) => ({ ...current, ...emptyAuthState, loading: false, error: null }))
      return { ok: true }
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error }))
      return { ok: false, error }
    }
  }, [])

  const value = useMemo(() => ({
    ...state,
    signIn,
    signOut,
    hasRole: (role) => hasRole(state.roles, role),
    hasAnyRole: (roles) => hasAnyRole(state.roles, roles),
    canManageFacilities: () => canManageFacilities(state.roles),
    canManageSchedules: () => canManageSchedules(state.roles),
    canPublishAnnouncements: () => canPublishAnnouncements(state.roles),
    canManageEmergencyData: () => canManageEmergencyData(state.roles),
  }), [signIn, signOut, state])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
