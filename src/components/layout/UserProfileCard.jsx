import { ChevronsUpDown, UserRound } from "lucide-react"
import { useState } from "react"
import ProfileMenu from "./ProfileMenu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { focusRing } from "@/components/campus/ui"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  DEPARTMENT_ADMIN: "Department Admin",
  FACILITY_MANAGER: "Facility Manager",
  FACULTY: "Faculty",
  STAFF: "Staff",
  STUDENT: "Student",
  PARENT: "Parent",
  GUEST: "Guest",
}

const roleCode = (role) => (typeof role === "string" ? role : role?.code)

/** Two-letter monogram. Falls back to a glyph so the row never renders empty. */
const initialsOf = (value = "") =>
  value
    .split(/[\s.@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

/**
 * Account summary pinned to the bottom of the sidebar.
 *
 * Shows only what identifies the current session — display name and primary
 * role — and defers every account action to the existing ProfileMenu so saved
 * locations, the admin entry, and sign-out keep one implementation.
 */
export default function UserProfileCard({ collapsed = false }) {
  const auth = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const displayName = auth.isAuthenticated
    ? auth.profile?.display_name || auth.user?.email || "Signed in"
    : "Guest"
  const primaryRole = auth.roles?.map(roleCode).filter(Boolean)[0]
  const roleLabel = auth.isAuthenticated
    ? ROLE_LABELS[primaryRole] || "Campus account"
    : "Public access"
  const initials = initialsOf(displayName) || null

  const trigger = (
    <button
      type="button"
      onClick={() => setMenuOpen((current) => !current)}
      aria-expanded={menuOpen}
      aria-haspopup="menu"
      aria-label={collapsed ? `Account menu — ${displayName}` : undefined}
      className={cn(
        "flex w-full items-center rounded-xl border border-[#D2D2D7] bg-white transition-colors duration-200 hover:border-[#8E8E93] motion-reduce:transition-none",
        collapsed ? "justify-center p-2" : "gap-3 p-2.5",
        focusRing
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D2D2D7] bg-[#F5F5F7] text-[11px] font-bold tracking-tight text-[#1D1D1F]"
      >
        {initials || <UserRound className="h-4 w-4" />}
      </span>
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[13px] font-semibold text-[#1D1D1F]">{displayName}</span>
            <span className="block truncate text-[11px] text-[#6E6E73]">{roleLabel}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#8E8E93]" aria-hidden="true" />
        </>
      )}
    </button>
  )

  return (
    <div className="relative">
      {collapsed ? (
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={10} className="bg-[#1D1D1F] text-white">
            {displayName} · {roleLabel}
          </TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <ProfileMenu open={menuOpen} onClose={() => setMenuOpen(false)} placement="sidebar" />
    </div>
  )
}
