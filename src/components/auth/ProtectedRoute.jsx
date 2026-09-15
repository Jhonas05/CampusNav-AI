import { Navigate, useLocation } from "react-router-dom"
import AccessDenied from "@/components/auth/AccessDenied"
import { useAuth } from "@/contexts/AuthContext"
import { canAccessProtectedRoute } from "@/lib/routeAuthorization"

export { canAccessProtectedRoute } from "@/lib/routeAuthorization"

export default function ProtectedRoute({ children, requiredRoles = [] }) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.loading) {
    return <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#F5F5F7] px-6 text-sm text-[#6E6E73]">Checking session...</main>
  }

  if (!auth.isAuthenticated) {
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />
  }

  if (!canAccessProtectedRoute({ isAuthenticated: true, roles: auth.roles, requiredRoles })) return <AccessDenied />

  return children
}
