import { useCallback, useEffect, useRef, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import GlobalSearch from "./GlobalSearch"
import MobileTopBar from "./MobileTopBar"
import NotificationPanel, { getUnseenNotificationCount } from "./NotificationPanel"
import ProfileMenu from "./ProfileMenu"
import MobileSidebarDrawer from "./sidebar/MobileSidebarDrawer"
import Sidebar from "./sidebar/Sidebar"
import ClaraAssistant from "@/components/clara/ClaraAssistant"
import { ClaraProvider } from "@/components/clara/ClaraContext"

const SIDEBAR_PREF_KEY = "campusnav.sidebar.v1"
const WIDE_QUERY = "(min-width: 1280px)"

const readPrefs = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SIDEBAR_PREF_KEY) || "{}")
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

const writePrefs = (prefs) => {
  try {
    window.localStorage.setItem(SIDEBAR_PREF_KEY, JSON.stringify(prefs))
  } catch {
    // Storage unavailable — the sidebar simply uses its responsive default.
  }
}

/**
 * Sidebar width state. Default: expanded on wide screens (>= 1280px),
 * icon rail below that and inside the Admin CMS (which has its own section
 * rail). A manual choice is remembered per width class.
 */
const useSidebarCollapsed = (pathname) => {
  const [wide, setWide] = useState(() => (typeof window === "undefined" ? true : window.matchMedia(WIDE_QUERY).matches))
  const [prefs, setPrefs] = useState(() => (typeof window === "undefined" ? {} : readPrefs()))

  useEffect(() => {
    const query = window.matchMedia(WIDE_QUERY)
    const update = () => setWide(query.matches)
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  const widthClass = wide ? "wide" : "compact"
  const defaultCollapsed = !wide || pathname.startsWith("/admin")
  const collapsed = typeof prefs[widthClass] === "boolean" ? prefs[widthClass] : defaultCollapsed

  const toggle = useCallback(() => {
    setPrefs((current) => {
      const next = { ...current, [widthClass]: !collapsed }
      writePrefs(next)
      return next
    })
  }, [collapsed, widthClass])

  return [collapsed, toggle]
}

/**
 * Keeps <html> in step with the visitor's motion setting and tab visibility:
 * `motion-ok` enables decorative motion, `motion-paused` freezes ambient
 * animation while the tab is hidden.
 */
const useMotionEnvironment = () => {
  useEffect(() => {
    const root = document.documentElement
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const syncMotion = () => root.classList.toggle("motion-ok", !query.matches)
    const syncVisibility = () => root.classList.toggle("motion-paused", document.hidden)
    syncMotion()
    syncVisibility()
    query.addEventListener("change", syncMotion)
    document.addEventListener("visibilitychange", syncVisibility)
    return () => {
      query.removeEventListener("change", syncMotion)
      document.removeEventListener("visibilitychange", syncVisibility)
    }
  }, [])
}

/** Replays the short page-enter animation when the route path changes. */
const usePageEnter = (pathname) => {
  const ref = useRef(null)
  const first = useRef(true)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (first.current) {
      first.current = false
      return
    }
    element.classList.remove("page-enter")
    void element.offsetWidth
    element.classList.add("page-enter")
  }, [pathname])
  return ref
}

/**
 * Application shell: left sidebar (rail or mobile drawer), page content, and
 * the global floating CLARA assistant. There is no top navigation bar.
 */
export default function AppShell() {
  const location = useLocation()
  const [collapsed, toggleCollapsed] = useSidebarCollapsed(location.pathname)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openPanel, setOpenPanel] = useState(null)
  const [unread, setUnread] = useState(0)
  const pageRef = usePageEnter(location.pathname)
  useMotionEnvironment()

  useEffect(() => {
    setDrawerOpen(false)
    setSearchOpen(false)
    setOpenPanel(null)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (openPanel !== "notifications") setUnread(getUnseenNotificationCount())
  }, [location.pathname, openPanel])

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpenPanel(null)
        setDrawerOpen(false)
        setSearchOpen((current) => !current)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const closePanel = useCallback(() => setOpenPanel(null), [])
  const togglePanel = (panel) => setOpenPanel((current) => (current === panel ? null : panel))
  const openSearch = () => { setOpenPanel(null); setSearchOpen(true) }

  const navigationProps = {
    unread,
    openPanel,
    onSearch: openSearch,
    onToggleNotifications: () => togglePanel("notifications"),
    onToggleProfile: () => togglePanel("profile"),
  }

  return (
    <ClaraProvider>
      <div
        className="campusnav-ink flex min-h-dvh bg-canvas text-ink md:[--sidebar-width:var(--sidebar-width-expanded)] md:data-[sidebar=collapsed]:[--sidebar-width:var(--sidebar-width-collapsed)]"
        data-sidebar={collapsed ? "collapsed" : "expanded"}
      >
        <a
          href="#campusnav-main"
          className="sr-only z-modal rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-on-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
        >
          Skip to content
        </a>

        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} {...navigationProps} />
        <MobileSidebarDrawer open={drawerOpen} onOpenChange={setDrawerOpen} {...navigationProps} />

        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar
            menuOpen={drawerOpen}
            onOpenMenu={() => { setOpenPanel(null); setDrawerOpen(true) }}
            onSearch={openSearch}
            onToggleNotifications={() => togglePanel("notifications")}
            notificationsOpen={openPanel === "notifications"}
            unread={unread}
          />
          <main id="campusnav-main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
            <div ref={pageRef} className="page-enter">
              <Outlet />
            </div>
          </main>
          <footer className="border-t border-line px-[var(--app-page-gutter)] py-4 pr-24 text-xs text-ink-faint print:hidden">
            <p>CampusNav AI · St. Clare College of Caloocan · Independent campus navigation system</p>
          </footer>
        </div>

        <NotificationPanel open={openPanel === "notifications"} onClose={closePanel} />
        <ProfileMenu open={openPanel === "profile"} onClose={closePanel} />
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        <ClaraAssistant />
      </div>
    </ClaraProvider>
  )
}
