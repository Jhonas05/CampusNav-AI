import { useCallback, useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import MainHeader from "./MainHeader"
import MobileNavigationDrawer from "./MobileNavigationDrawer"
import Sidebar from "./Sidebar"
import ClaraChatPanel from "@/components/clara/ClaraChatPanel"
import ClaraFloatingButton from "@/components/clara/ClaraFloatingButton"
import { focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

const COLLAPSE_STORAGE_KEY = "campusnav.sidebar.collapsed"

const readStoredCollapsed = () => {
  try {
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true"
  } catch {
    return false
  }
}

/**
 * CampusNav application shell.
 *
 * Left sidebar for navigation chrome, a compact contextual header, and an
 * uninterrupted main workspace — the 2D/3D map and module content are the
 * product, so the shell stays deliberately quiet. The sidebar is fixed and
 * out of flow; the workspace reserves its width through
 * `--app-sidebar-current-width`, which lets the collapse animate and lets any
 * canvas inside resize from real layout width.
 */
export default function AppLayout() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(readStoredCollapsed)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(collapsed))
    } catch {
      /* Storage is optional; the layout works without a remembered preference. */
    }
  }, [collapsed])

  // A destination was chosen — the slide-over has done its job.
  useEffect(() => setDrawerOpen(false), [location.pathname, location.hash])

  const toggleCollapse = useCallback(() => setCollapsed((current) => !current), [])

  return (
    <div
      className="campusnav-ink app-shell text-[#1D1D1F]"
      style={{
        "--app-sidebar-current-width": collapsed
          ? "var(--app-sidebar-collapsed-width)"
          : "var(--app-sidebar-width)",
      }}
    >
      <a
        href="#campusnav-main"
        className={cn(
          "sr-only z-[80] rounded-lg bg-[#1D1D1F] px-5 py-2.5 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4",
          focusRing
        )}
      >
        Skip to content
      </a>

      <aside
        aria-label="CampusNav navigation"
        className="app-shell-sidebar fixed inset-y-0 left-0 z-50 hidden border-r border-[#E3E3E6] lg:block"
      >
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </aside>

      <MobileNavigationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="app-shell-main">
        <MainHeader onOpenNavigation={() => setDrawerOpen(true)} />
        <main id="campusnav-main" className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>

      <ClaraChatPanel />
      <ClaraFloatingButton />
    </div>
  )
}
