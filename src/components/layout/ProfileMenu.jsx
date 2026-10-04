import { Accessibility, Bell, Bookmark, LayoutGrid, LogIn, LogOut, QrCode, UserRound } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { focusRing } from "@/components/campus/ui"
import { usesAdminShell } from "@/components/layout/sidebar/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { getFacilityById } from "@/data/facilities"
import { getFloorById } from "@/data/floors"
import { APP_ROLES } from "@/lib/authorization"
import { getSavedLocationIds, subscribeToSavedLocations } from "@/lib/savedLocations"

const plannedItems = [
  { label: "Profile", icon: UserRound },
  { label: "Notification Preferences", icon: Bell },
  { label: "Accessibility Preferences", icon: Accessibility },
]

export default function ProfileMenu({ open, onClose }) {
  const auth = useAuth()
  const location = useLocation()
  // Inside the Admin shell the Admin navigation already lists these destinations.
  const insideAdmin = usesAdminShell(location.pathname, auth)
  const menuRef = useRef(null)
  const [savedIds, setSavedIds] = useState(() => getSavedLocationIds())
  const developerModeAvailable = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MAP_VERIFICATION === "true"

  useEffect(() => subscribeToSavedLocations(setSavedIds), [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event) => {
      if (event.target instanceof Element && event.target.closest("[data-shell-panel-toggle]")) return
      if (menuRef.current && !menuRef.current.contains(event.target)) onClose()
    }
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const savedFacilities = savedIds.map((id) => getFacilityById(id)).filter(Boolean).slice(0, 4)

  return (
    <div
      ref={menuRef}
      role="region"
      aria-label="Account menu"
      className="ink-blueprint fixed z-dropdown overflow-hidden rounded-[18px] shadow-[0_12px_36px_rgba(0,0,0,0.14)] max-md:inset-x-3 max-md:top-[calc(var(--app-header-height)+0.5rem)] md:bottom-3 md:left-[calc(var(--sidebar-width)+0.5rem)] md:w-[320px]"
    >
      <header className="border-b border-line px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">CampusNav Account</p>
        <p className="mt-1.5 text-sm font-semibold text-ink">
          {auth.isAuthenticated ? auth.profile?.display_name || auth.user?.email || "Signed in" : "Browsing as guest"}
        </p>
        <p className="mt-0.5 text-xs text-ink-soft">
          {auth.isAuthenticated ? "Signed in" : "Public campus navigation is available without an account."}
        </p>
      </header>

      <section aria-label="Saved locations" className="border-b border-line px-2 py-2">
        <div className="flex items-center gap-2 px-3 pb-1 pt-2">
          <Bookmark className="h-3.5 w-3.5 text-ink-soft" aria-hidden="true" />
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">Saved Locations</h3>
        </div>
        {savedFacilities.length ? (
          <ul>
            {savedFacilities.map((facility) => (
              <li key={facility.id}>
                <Link to={`/facilities/${facility.id}`} onClick={onClose} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-ink transition-colors hover:bg-fill ${focusRing}`}>
                  <span className="truncate font-medium">{facility.name}</span>
                  <span className="shrink-0 text-[10px] font-bold text-ink-faint">{getFloorById(facility.floorId)?.shortName || facility.floorId}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 pb-2 pt-1 text-xs leading-relaxed text-ink-faint">No saved locations yet. Save one from any facility page.</p>
        )}
      </section>

      <section aria-label="Preferences" className="border-b border-line px-2 py-2">
        {!insideAdmin && auth.hasAnyRole([APP_ROLES.SUPER_ADMIN, APP_ROLES.DEPARTMENT_ADMIN]) && (
          <Link to={auth.hasRole(APP_ROLES.SUPER_ADMIN) ? "/admin" : "/admin/personnel"} onClick={onClose} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink transition-colors hover:bg-fill ${focusRing}`}>
            <LayoutGrid className="h-4 w-4" aria-hidden="true" /> Admin CMS
            <span className="ml-auto rounded-full bg-ink px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-on-ink">Admin</span>
          </Link>
        )}
        {plannedItems.map(({ label, icon: Icon }) => (
          <div key={label} aria-disabled="true" className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-ink-ghost">
            <span className="flex items-center gap-2.5"><Icon className="h-4 w-4" aria-hidden="true" /> {label}</span>
            <span className="rounded-full border border-dashed border-line-strong px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-ghost">Planned</span>
          </div>
        ))}
        {!insideAdmin && developerModeAvailable && auth.hasRole(APP_ROLES.SUPER_ADMIN) && (
          <Link to="/admin/qr-checkpoints" onClick={onClose} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink transition-colors hover:bg-fill ${focusRing}`}>
            <QrCode className="h-4 w-4" aria-hidden="true" /> QR Checkpoints
            <span className="ml-auto rounded-full bg-fill px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-soft">Admin</span>
          </Link>
        )}
      </section>

      <div className="p-2">
        {auth.isAuthenticated ? (
          <button
            type="button"
            disabled={auth.loading}
            onClick={() => { auth.signOut(); onClose() }}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-fill disabled:opacity-50 ${focusRing}`}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign Out
          </button>
        ) : (
          <Link to="/login" onClick={onClose} className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-fill ${focusRing}`}>
            <LogIn className="h-4 w-4" aria-hidden="true" /> Sign In
          </Link>
        )}
      </div>
    </div>
  )
}
