import { getBackendAvailability, getSupabaseClient } from "@/lib/supabaseClient"
import { createLocalAuthProvider } from "@/providers/auth/localAuthProvider"
import { createSupabaseAuthProvider } from "@/providers/auth/supabaseAuthProvider"

export const resolveAuthProvider = ({ client = null, configured = false, offline = false } = {}) =>
  configured && client ? createSupabaseAuthProvider(client) : createLocalAuthProvider({ offline })

export const createActiveAuthProvider = async () => {
  const availability = getBackendAvailability()
  if (!availability.configured) return createLocalAuthProvider()

  try {
    const client = await getSupabaseClient()
    return resolveAuthProvider({ client, configured: true })
  } catch (error) {
    console.warn("CampusNav could not initialize the optional Supabase auth provider.", error)
    return createLocalAuthProvider({ offline: true })
  }
}

