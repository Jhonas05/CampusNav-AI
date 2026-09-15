export const BACKEND_MODES = Object.freeze({
  SUPABASE: "SUPABASE_CONFIGURED",
  LOCAL: "LOCAL_FALLBACK",
})

const readJwtRole = (key) => {
  if (!key || !key.includes(".")) return null
  try {
    const unpadded = key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const payload = unpadded.padEnd(Math.ceil(unpadded.length / 4) * 4, "=")
    const decoded = typeof atob === "function"
      ? atob(payload)
      : globalThis.Buffer?.from(payload, "base64").toString("utf8")
    return decoded ? JSON.parse(decoded).role || null : null
  } catch {
    return null
  }
}

export const resolveSupabaseConfig = (env = {}) => {
  const url = String(env.VITE_SUPABASE_URL || "").trim()
  const anonKey = String(env.VITE_SUPABASE_ANON_KEY || "").trim()
  const exposedSecret = Object.entries(env).some(([name, value]) =>
    value && /SUPABASE.*(SERVICE_ROLE|SECRET)/i.test(name)
  )
  const unsafeKey = anonKey.startsWith("sb_secret_") || readJwtRole(anonKey) === "service_role"

  if (exposedSecret || unsafeKey) {
    return {
      configured: false,
      mode: BACKEND_MODES.LOCAL,
      reason: "UNSAFE_FRONTEND_KEY",
      url: "",
      anonKey: "",
    }
  }

  if (!url || !anonKey) {
    return {
      configured: false,
      mode: BACKEND_MODES.LOCAL,
      reason: "MISSING_CONFIGURATION",
      url: "",
      anonKey: "",
    }
  }

  try {
    const parsed = new URL(url)
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Unsupported protocol")
  } catch {
    return {
      configured: false,
      mode: BACKEND_MODES.LOCAL,
      reason: "INVALID_URL",
      url: "",
      anonKey: "",
    }
  }

  return { configured: true, mode: BACKEND_MODES.SUPABASE, reason: null, url, anonKey }
}

export const createSupabaseClientLoader = ({
  env = import.meta.env || {},
  importer = () => import("@supabase/supabase-js"),
} = {}) => {
  const config = resolveSupabaseConfig(env)
  let clientPromise = null

  return async () => {
    if (!config.configured) return null
    if (!clientPromise) {
      clientPromise = importer().then(({ createClient }) => createClient(config.url, config.anonKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true,
        },
      }))
    }
    return clientPromise
  }
}

const runtimeEnv = import.meta.env || {}
const defaultConfig = resolveSupabaseConfig(runtimeEnv)
const defaultClientLoader = createSupabaseClientLoader({ env: runtimeEnv })

export const getBackendAvailability = () => ({ ...defaultConfig })
export const isSupabaseConfigured = defaultConfig.configured
export const getSupabaseClient = () => defaultClientLoader()
