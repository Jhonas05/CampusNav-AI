import { hasAnyRole } from "./authorization.js"

export const canAccessProtectedRoute = ({ isAuthenticated, roles = [], requiredRoles = [] }) =>
  Boolean(isAuthenticated) && (!requiredRoles.length || hasAnyRole(roles, requiredRoles))

