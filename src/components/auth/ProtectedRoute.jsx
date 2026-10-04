import { Navigate, useLocation } from "react-router-dom"
import AccessDenied from "@/components/auth/AccessDenied"
import { useAuth } from "@/contexts/AuthContext"
import { canAccessProtectedRoute } from "@/lib/routeAuthorization"

export { canAccessProtectedRoute } from "@/lib/routeAuthorization"

export default function ProtectedRoute({ children, requiredRoles = [] }) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.loading) {
    return <main className="flex min-h-[calc(100dvh-var(--app-header-height))] items-center justify-center bg-canvas px-6 text-sm text-ink-soft">Checking session...</main>
  }

  if (!auth.isAuthenticated) {
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />
  }

  if (!canAccessProtectedRoute({ isAuthenticated: true, roles: auth.roles, requiredRoles })) return <AccessDenied />

  return children
}
