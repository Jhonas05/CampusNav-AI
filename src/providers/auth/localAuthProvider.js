import { BACKEND_MODES } from "../../lib/supabaseClient.js"

export const emptyAuthState = Object.freeze({
  user: null,
  profile: null,
  roles: [],
  isAuthenticated: false,
})

export const createLocalAuthProvider = ({ offline = false } = {}) => ({
  mode: BACKEND_MODES.LOCAL,
  status: offline ? "SUPABASE_OFFLINE" : "LOCAL_PROTOTYPE",
  getInitialState: async () => ({ ...emptyAuthState }),
  subscribe: () => () => {},
  signIn: async () => {
    const error = Object.assign(new Error(offline
      ? "Live authentication is temporarily unavailable."
      : "Sign in requires Supabase configuration."), {
      code: offline ? "SUPABASE_UNREACHABLE" : "SUPABASE_NOT_CONFIGURED",
    })
    throw error
  },
  signOut: async () => ({ ...emptyAuthState }),
})
