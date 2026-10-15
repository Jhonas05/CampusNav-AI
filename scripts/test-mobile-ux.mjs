import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { fileURLToPath, URL } from "node:url"
import React from "react"
import { renderToString } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { createServer } from "vite"

// Mobile-first UX simplification (DEC-UI-006): phone primary navigation, route
// and deep-link compatibility, Home as the at-a-glance surface beside the
// retained Dashboard, no CLARA navigation entry, and the critical phone layout
// states (bottom navigation clearance, one Navigate sheet, at most two card actions).

const projectRoot = new URL("..", import.meta.url)
const read = (path) => readFile(new URL(path, projectRoot), "utf8")
const count = (text, pattern) => (text.match(pattern) || []).length

const vite = await createServer({
  appType: "custom",
  configFile: false,
  esbuild: { jsx: "automatic" },
  logLevel: "error",
  optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
  root: fileURLToPath(projectRoot),
  server: { middlewareMode: true },
})
const originalConsoleError = console.error
console.error = (...args) => { if (!String(args[0]).includes("useLayoutEffect does nothing on the server")) originalConsoleError(...args) }

try {
  const load = async (path) => vite.ssrLoadModule(path)
  const { ConnectivityProvider } = await load("/src/contexts/ConnectivityContext.jsx")
  const { FacilityDiscoveryProvider } = await load("/src/contexts/FacilityDiscoveryContext.jsx")
  const render = (entry, element) => renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: [entry] },
      React.createElement(ConnectivityProvider, null, React.createElement(FacilityDiscoveryProvider, null, element))
    )
  )

  // 1. Navigation model: five phone slots at most, nothing lost, no CLARA entry.
  const navigation = await load("/src/components/layout/sidebar/navigation.js")
  const { MOBILE_NAV_ITEMS, MOBILE_MORE_ITEMS, PRIMARY_NAV_SECTIONS } = navigation
  assert.deepEqual(MOBILE_NAV_ITEMS.map((item) => item.path), ["/", "/map", "/facilities", "/alerts"], "phone bottom navigation destinations")
  assert.ok(MOBILE_NAV_ITEMS.length + 1 <= 5, "bottom navigation has at most five slots including More")
  assert.deepEqual(MOBILE_MORE_ITEMS.map((item) => item.path), ["/emergency", "/events", "/dashboard"], "More holds the remaining destinations, Emergency first")
  const sidebarPaths = PRIMARY_NAV_SECTIONS.flatMap((section) => section.items.map((item) => item.path))
  const phonePaths = [...MOBILE_NAV_ITEMS, ...MOBILE_MORE_ITEMS].map((item) => item.path)
  assert.deepEqual([...sidebarPaths].sort(), [...phonePaths].sort(), "every sidebar destination is reachable on phones, and nothing else")
  assert.equal(new Set(phonePaths).size, phonePaths.length, "no destination appears twice on phones")
  assert.deepEqual(PRIMARY_NAV_SECTIONS[0].items.map((item) => item.path), ["/", "/map", "/facilities"], "desktop primary group is Home, Navigate, Facilities")
  for (const path of [...sidebarPaths, ...phonePaths]) assert.notEqual(path, "/clara", "CLARA is never a navigation entry")

  // 2. Bottom navigation render: landmark, current page, More, phone-only, safe area.
  const { default: MobileBottomNav } = await load("/src/components/layout/MobileBottomNav.jsx")
  const bottomNav = (entry) => render(entry, React.createElement(MobileBottomNav, { moreOpen: false, onOpenMore: () => {} }))
  const homeNav = bottomNav("/")
  assert.match(homeNav, /<nav[^>]*aria-label="Primary"/)
  assert.equal(count(homeNav, /<a\b/g), 4, "four destinations")
  assert.equal(count(homeNav, /<button\b/g), 1, "one More button")
  assert.match(homeNav, /aria-haspopup="dialog"[^>]*aria-expanded="false"|aria-expanded="false"[^>]*aria-haspopup="dialog"/)
  assert.match(homeNav, /md:hidden/, "bottom navigation is phone-only; the sidebar takes over from 768px")
  assert.match(homeNav, /env\(safe-area-inset-bottom\)/, "bottom navigation respects the home-indicator inset")
  assert.match(homeNav, /data-app-chrome="mobile-bottom-nav"/, "bottom navigation steps aside for the fullscreen map")
  assert.doesNotMatch(homeNav, /clara/i, "no CLARA item in the bottom navigation")
  const currentOf = (html) => [...html.matchAll(/<a\b[^>]*aria-current="page"[^>]*href="([^"]+)"|<a\b[^>]*href="([^"]+)"[^>]*aria-current="page"/g)].map((match) => match[1] || match[2])
  assert.deepEqual(currentOf(homeNav), ["/"])
  assert.deepEqual(currentOf(bottomNav("/map?mode=emergency")), ["/map"])
  assert.deepEqual(currentOf(bottomNav("/facilities/library")), ["/facilities"])
  assert.deepEqual(currentOf(bottomNav("/events")), [], "pages behind More mark no bottom destination current")
  assert.match(bottomNav("/events"), /aria-label="More, current section"/)
  assert.match(bottomNav("/emergency"), /aria-label="More, current section"/)

  // 3. Phone top bar: brand plus at most two utilities; no menu, theme, or navigation links.
  const { default: MobileTopBar } = await load("/src/components/layout/MobileTopBar.jsx")
  const topBar = (entry) => render(entry, React.createElement(MobileTopBar, { onSearch: () => {}, onToggleNotifications: () => {}, notificationsOpen: false, unread: 0 }))
  const facilitiesBar = topBar("/facilities")
  assert.equal(count(facilitiesBar, /<button\b/g), 2, "search and notifications")
  assert.equal(count(facilitiesBar, /<a\b/g), 1, "the brand is the only link")
  assert.doesNotMatch(facilitiesBar, /navigation menu|Appearance|theme/i, "no hamburger and no theme control in the top bar")
  assert.equal(count(topBar("/"), /<button\b/g), 1, "Home leaves the search icon to its own destination search")

  // 4. Shell wiring and offsets (source contract).
  const [appSource, shellSource, moreSource, css, claraButtonSource, claraPanelSource, sheetSource, mapSource, sidebarSource] = await Promise.all([
    read("src/App.jsx"),
    read("src/components/layout/AppShell.jsx"),
    read("src/components/layout/MoreSheet.jsx"),
    read("src/index.css"),
    read("src/components/clara/ClaraFloatingButton.jsx"),
    read("src/components/clara/ClaraChatPanel.jsx"),
    read("src/components/map/MobileRouteSheet.jsx"),
    read("src/pages/Map.jsx"),
    read("src/components/layout/sidebar/Sidebar.jsx"),
  ])
  assert.match(shellSource, /<ClaraAssistant \/>/, "CLARA stays one floating assistant")
  assert.equal(count(shellSource, /<ClaraAssistant /g), 1)
  assert.match(shellSource, /pb-\[var\(--app-bottom-nav-height\)\]/, "page content clears the bottom navigation")
  assert.match(moreSource, /MOBILE_MORE_ITEMS/)
  assert.match(moreSource, /<ThemeToggle/, "appearance lives under More on phones")
  assert.match(moreSource, /getAdminNavSection/, "Admin stays reachable for authorized roles")
  assert.doesNotMatch(moreSource, /clara/i, "no CLARA entry under More")
  assert.doesNotMatch(sidebarSource, /clara"/i)
  assert.match(css, /--app-bottom-nav-height: 0rem;/, "no bottom navigation offset by default (tablet, desktop, Admin)")
  assert.match(css, /@media \(max-width: 767px\) \{[\s\S]*?\[data-shell="app"\] \{[\s\S]*?--app-bottom-nav-height: calc\(4rem \+ env\(safe-area-inset-bottom, 0px\)\);/, "phones reserve the bottom navigation height")
  assert.match(css, /html\[data-map-immersive\] \[data-shell="app"\] \{[\s\S]*?--app-bottom-nav-height: 0rem;/, "fullscreen map reclaims the bottom navigation space")
  assert.match(claraButtonSource, /var\(--app-bottom-nav-height\)/, "the CLARA button floats above the bottom navigation")
  assert.match(claraButtonSource, /var\(--clara-lift,0px\)/, "and above the Navigate sheet")
  assert.match(claraPanelSource, /var\(--app-bottom-nav-height\)/, "the CLARA sheet sits above the bottom navigation")
  assert.match(sheetSource, /bottom-\[var\(--app-bottom-nav-height\)\]/, "the Navigate sheet sits above the bottom navigation")
  assert.equal(count(mapSource, /<MobileRouteSheet\b/g), 1, "Navigate has exactly one contextual sheet")
  assert.match(mapSource, /searchParams\.get\("scan"\) === "1"/, "Home's Scan QR opens the scanner directly")

  // 5. Deep links: every existing public route is still declared.
  for (const path of ["/", "/dashboard", "/facilities", "/facilities/:id", "/clara", "/map", "/alerts", "/events", "/emergency", "/login", "/admin"]) {
    assert.ok(appSource.includes(`path="${path}"`), `route ${path} is preserved`)
  }
  const { getNavigateHref } = await load("/src/lib/mapLinks.js")
  assert.equal(getNavigateHref({ facilityId: "registrar-office" }), "/map?facility=registrar-office")

  // 6. Home: destination search first, one status module, four quick actions, Today,
  //    the Dashboard kept as the detailed feed, and no duplicate CLARA or Navigate entry.
  const { default: Home } = await load("/src/pages/Home.jsx")
  const homeHtml = render("/", React.createElement(Home))
  assert.match(homeHtml, /<label for="destination-input"[^>]*>Where do you want to go\?<\/label>/)
  assert.ok(homeHtml.indexOf('id="destination-input"') < homeHtml.indexOf("data-map-preview"), "the search precedes the map")
  assert.ok(homeHtml.indexOf("data-map-preview") < homeHtml.indexOf('id="home-status-title"'), "the map precedes campus status")
  assert.equal(count(homeHtml, /data-map-preview=/g), 1, "the map is mounted once")
  assert.deepEqual([...homeHtml.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((match) => match[1]), ["Campus status", "Quick access", "Today"], "three sections under the search")
  for (const href of ["/map?scan=1", "/facilities", "/events", "/emergency"]) assert.match(homeHtml, new RegExp(`href="${href.replace("?", "\\?")}"`), `quick access links to ${href}`)
  const quickAccess = homeHtml.slice(homeHtml.indexOf('id="home-quick-title"'), homeHtml.indexOf('id="home-today-title"'))
  assert.equal(count(quickAccess, /<a\b/g), 4, "exactly four quick actions")
  assert.doesNotMatch(quickAccess, /clara|>Navigate</i, "no Ask CLARA or Navigate tile duplicating the floating assistant and the search")
  assert.doesNotMatch(homeHtml, /Ask CLARA|Navigate Campus|View Dashboard|How CampusNav works/, "duplicate calls to action and the explainer are gone")
  assert.match(homeHtml, /href="\/map\?facility=registrar-office"[^>]*aria-label="Navigate to Registrar"|aria-label="Navigate to Registrar"[^>]*href="\/map\?facility=registrar-office"/, "one-tap shortcut to route setup")
  assert.match(homeHtml, /href="\/dashboard"/, "Home links to the Dashboard for the full feed")
  assert.match(homeHtml, /No active alerts/, "the status module reports published alerts only")
  assert.doesNotMatch(homeHtml, /Normal operations|No suspension/i, "Home never states an official campus status it does not have")
  const { default: Dashboard } = await load("/src/pages/Dashboard.jsx")
  assert.match(render("/dashboard", React.createElement(Dashboard)), /CampusNav Dashboard/, "/dashboard still renders the detailed information view")

  // 7. Navigate on phones: one destination sheet, minimal controls, notes one tap away.
  const { default: Navigate } = await load("/src/pages/Map.jsx")
  const navigate = (entry) => render(entry, React.createElement(Navigate))
  const NOT_SET = /From <\/span><span class="font-semibold">Not set<\/span>/
  const sheetOf = (html) => (html.match(/<section[^>]*aria-label="Selected destination"[\s\S]*?<\/section>/) || [""])[0]
  const viewing = (html) => (html.match(/Viewing (?:<!-- -->)?([A-Za-z]+ Floor)/) || [])[1]

  // Fresh session: nothing is assumed, so there is nothing to route and no sheet.
  const navigateHtml = navigate("/map")
  assert.match(navigateHtml, NOT_SET, "a fresh session has no current location")
  assert.match(navigateHtml, /id="destination-input"[^>]*value=""/, "a fresh session has no destination")
  assert.doesNotMatch(navigateHtml, /aria-label="Selected destination"/)
  assert.match(navigateHtml, /aria-label="Show my location"/)
  assert.match(navigateHtml, /aria-label="Change current location"/)
  assert.match(navigateHtml, /Map data notes/)
  assert.match(navigateHtml, /placeholder="Where do you want to go\?"/)

  // A facility link sets the destination and the viewed floor, never the visitor's location.
  // Without a location the sheet asks for one and offers the two ways to set it; no route starts.
  const registrarHtml = navigate("/map?facility=registrar-office")
  assert.match(registrarHtml, NOT_SET, "a destination link does not create a current location")
  assert.equal(count(registrarHtml, /aria-label="Selected destination"/g), 1, "one contextual sheet")
  const registrarSheet = sheetOf(registrarHtml)
  assert.match(registrarSheet, /Registrar&#x27;s Office[\s\S]*Fifth Floor/, "the destination is the linked facility")
  assert.match(registrarSheet, /Set your location to create a route\./)
  assert.match(registrarSheet, /Scan QR[\s\S]*Choose manually/)
  assert.doesNotMatch(registrarSheet, /Start Navigation/, "no route is offered until start and destination both exist")
  assert.equal(viewing(registrarHtml), "Fifth Floor", "the destination's floor is viewed")
  assert.doesNotMatch(registrarHtml, /Manual selection|You are already|Arrived/)

  // `?floor=` changes the viewed floor only, alone or beside a destination.
  const floorHtml = navigate("/map?floor=5F")
  assert.match(floorHtml, NOT_SET, "a floor link does not place the visitor on that floor")
  assert.equal(viewing(floorHtml), "Fifth Floor")
  const bothHtml = navigate("/map?facility=library&floor=5F")
  assert.match(bothHtml, NOT_SET, "facility + floor does not create a current location")
  assert.match(sheetOf(bothHtml), /Library[\s\S]*Third Floor/)

  // Regression: a link to Library used to answer "already there" because Library was the assumed start.
  const libraryHtml = navigate("/map?facility=library")
  assert.match(libraryHtml, NOT_SET)
  assert.match(sheetOf(libraryHtml), /Set your location to create a route\./)
  assert.doesNotMatch(libraryHtml, /You are already|You have arrived|Arrived/, "no zero-length route to the linked facility")

  // The former default start exists only in the explicit, labelled demo mode.
  const demoHtml = navigate("/map?demo=1")
  assert.match(demoHtml, /Demo start — a sample location and destination, not your position/)
  assert.match(demoHtml, /From <\/span><span class="font-semibold">Library<\/span>/)
  assert.match(sheetOf(demoHtml), /Virtual Laboratory[\s\S]*Start Navigation/)

  const emergencyHtml = navigate("/map?mode=emergency")
  assert.match(emergencyHtml, NOT_SET, "Emergency Mode does not assume a position either")
  assert.doesNotMatch(emergencyHtml, /aria-label="Selected destination"/, "Emergency Mode has no destination sheet")
  assert.match(emergencyHtml, /Find Nearest Verified Exit/)

  // 8. Cards: at most two visible actions.
  const { default: FacilityCard } = await load("/src/components/facilities/FacilityCard.jsx")
  const { getFacilityById } = await load("/src/data/facilities.js")
  const cardHtml = render("/facilities", React.createElement(FacilityCard, { facility: getFacilityById("library") }))
  assert.equal(count(cardHtml, /<a\b/g) + count(cardHtml, /<button\b/g), 2, "facility card: Navigate and Details only")
  assert.ok(cardHtml.indexOf("Navigate to Library") < cardHtml.indexOf("View details for Library"), "the primary action comes first")
  // No approved photo reference exists, so no image is requested (each card used to fire a 404).
  const { default: FacilityPhoto } = await load("/src/components/campus/FacilityPhoto.jsx")
  const { facilities: allFacilities } = await load("/src/data/facilities.js")
  assert.ok(allFacilities.every((facility) => !facility.photoSrc), "no facility claims a photo that has not been supplied")
  assert.doesNotMatch(cardHtml, /<img\b/, "a facility without an approved photo renders the placeholder, not an image request")
  assert.match(cardHtml, /role="img"[^>]*aria-label="Library photo placeholder"/)
  const photoHtml = renderToString(React.createElement(FacilityPhoto, { facility: { ...getFacilityById("library"), photoSrc: "/images/facilities/library.jpg" } }))
  assert.match(photoHtml, /<img[^>]*src="\/images\/facilities\/library\.jpg"/, "a supplied photo is used")
  assert.match(photoHtml, /loading="lazy"/, "and loads lazily")
  const { default: ClaraResultCard } = await load("/src/components/clara/ClaraResultCard.jsx")
  const claraCardHtml = render("/", React.createElement(ClaraResultCard, { facility: getFacilityById("registrar-office"), onNavigate: () => {} }))
  assert.equal(count(claraCardHtml, /<a\b/g), 2, "CLARA result: Navigate and Details only")
  const facilitySheetSource = await read("src/components/map/FacilitySheet.jsx")
  assert.match(facilitySheetSource, /const VISIBLE_ACTIONS = 2/)

  // 9. Notification preview: capped, most important first; the full feed stays on the Dashboard.
  const { getNotificationPreview, NOTIFICATION_PREVIEW_LIMIT } = await load("/src/components/layout/NotificationPanel.jsx")
  assert.equal(NOTIFICATION_PREVIEW_LIMIT, 5)
  const record = (id, extra = {}) => ({ id, title: id, message: "", ...extra })
  const preview = getNotificationPreview({
    alerts: [record("alert-1", { priority: "URGENT" })],
    advisories: [record("advisory-1"), record("advisory-2")],
    navigationNotices: [record("notice-1")],
    classes: [{ id: "class-1", subject: "Class", room: "Room", startAt: "2026-09-14T01:00:00.000Z", endAt: "2026-09-14T02:00:00.000Z" }, { id: "class-2", subject: "Class", room: "Room", startAt: "2026-09-14T03:00:00.000Z", endAt: "2026-09-14T04:00:00.000Z" }],
    events: [record("event-1"), record("event-2")],
  })
  assert.deepEqual(preview.map((item) => item.id), ["alert-1", "advisory-1", "advisory-2", "notice-1", "class-1"])

  // 10. Emergency page: the two tools come before the guidance.
  const { default: Emergency } = await load("/src/pages/Emergency.jsx")
  const emergencyPageHtml = render("/emergency", React.createElement(Emergency))
  assert.ok(emergencyPageHtml.indexOf('href="/map?mode=emergency"') < emergencyPageHtml.indexOf("Evacuation guidance"), "the emergency map comes first")
  assert.equal(count(emergencyPageHtml, /href="\/map\?mode=emergency"/g), 1, "one emergency-map action instead of three identical links")
  assert.match(emergencyPageHtml, /CampusNav Emergency Mode supplements, but does not replace/, "the safety notice is not shortened")

  console.log("Mobile UX: phone navigation model and render, top bar, shell offsets, deep links, Home hierarchy, Navigate sheet, two-action cards, notification preview, and Emergency tools-first: PASS")
} finally {
  console.error = originalConsoleError
  await vite.close()
}
