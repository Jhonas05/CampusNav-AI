export const APP_ROLES = Object.freeze({
  GUEST: "GUEST",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
  FACULTY: "FACULTY",
  STAFF: "STAFF",
  FACILITY_MANAGER: "FACILITY_MANAGER",
  DEPARTMENT_ADMIN: "DEPARTMENT_ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
})

const normalizeRoles = (roles = []) => new Set(roles.map((role) =>
  typeof role === "string" ? role : role?.code
).filter(Boolean))

export const hasRole = (roles, role) => normalizeRoles(roles).has(role)
export const hasAnyRole = (roles, requiredRoles = []) => {
  const available = normalizeRoles(roles)
  return requiredRoles.some((role) => available.has(role))
}

export const canManageFacilities = (roles) => hasAnyRole(roles, [
  APP_ROLES.FACILITY_MANAGER,
  APP_ROLES.DEPARTMENT_ADMIN,
  APP_ROLES.SUPER_ADMIN,
])
export const canManageSchedules = (roles) => hasAnyRole(roles, [APP_ROLES.DEPARTMENT_ADMIN, APP_ROLES.SUPER_ADMIN])
export const canPublishAnnouncements = (roles) => hasAnyRole(roles, [APP_ROLES.DEPARTMENT_ADMIN, APP_ROLES.SUPER_ADMIN])
export const canManageEmergencyData = (roles) => hasRole(roles, APP_ROLES.SUPER_ADMIN)

