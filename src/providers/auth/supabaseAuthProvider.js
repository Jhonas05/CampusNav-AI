import { BACKEND_MODES } from "../../lib/supabaseClient.js"
import { emptyAuthState } from "./localAuthProvider.js"

const normalizeRoleRows = (rows = []) => rows.map((row) => ({
  code: Array.isArray(row.role) ? row.role[0]?.code : row.role?.code,
  departmentId: row.department_id ?? null,
})).filter((role) => role.code)

export const toPublicAuthError = (error) => {
  const message = String(error?.message || "").toLowerCase()
  if (message.includes("invalid login") || message.includes("invalid credentials")) {
    return Object.assign(new Error("The email or password is incorrect."), { code: "INVALID_LOGIN" })
  }
  if (message.includes("jwt") || message.includes("session") || message.includes("refresh token")) {
    return Object.assign(new Error("Your session has expired. Please sign in again."), { code: "SESSION_EXPIRED" })
  }
  if (message.includes("permission") || message.includes("row-level security") || error?.code === "42501") {
    return Object.assign(new Error("Your account does not have permission for that action."), { code: "PERMISSION_DENIED" })
  }
  if (message.includes("fetch") || message.includes("network") || message.includes("timeout")) {
    return Object.assign(new Error("Campus authentication is temporarily unreachable."), { code: "NETWORK_ERROR" })
  }
  return Object.assign(new Error("Authentication could not be completed. Please try again."), { code: "AUTH_ERROR" })
}

export const createSupabaseAuthProvider = (client) => {
  const loadUserState = async (user) => {
    if (!user) return { ...emptyAuthState }

    const [profileResult, rolesResult] = await Promise.all([
      client.from("profiles")
        .select("id, display_name, department_id, status, created_at, updated_at")
        .eq("id", user.id)
        .maybeSingle(),
      client.from("user_roles")
        .select("department_id, role:roles(code)")
        .eq("user_id", user.id),
    ])

    if (profileResult.error) throw profileResult.error
    if (rolesResult.error) throw rolesResult.error

    return {
      user,
      profile: profileResult.data || null,
      roles: normalizeRoleRows(rolesResult.data),
      isAuthenticated: true,
    }
  }

  return {
    mode: BACKEND_MODES.SUPABASE,
    status: "SUPABASE_CONNECTED",
    async getInitialState() {
      const { data, error } = await client.auth.getSession()
      if (error) throw toPublicAuthError(error)
      try {
        return await loadUserState(data.session?.user || null)
      } catch (profileError) {
        throw toPublicAuthError(profileError)
      }
    },
    subscribe(onChange) {
      let active = true
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        Promise.resolve(loadUserState(session?.user || null))
          .then((nextState) => { if (active) onChange(nextState) })
          .catch((error) => { if (active) onChange({ ...emptyAuthState, error: toPublicAuthError(error) }) })
      })
      return () => {
        active = false
        data.subscription.unsubscribe()
      }
    },
    async signIn({ email, password }) {
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      if (error) throw toPublicAuthError(error)
      try {
        return await loadUserState(data.user)
      } catch (profileError) {
        throw toPublicAuthError(profileError)
      }
    },
    async signOut() {
      const { error } = await client.auth.signOut()
      if (error) throw toPublicAuthError(error)
      return { ...emptyAuthState }
    },
  }
}
