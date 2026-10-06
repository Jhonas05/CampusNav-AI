# CampusNav AI — UI Registry

## Purpose
This file is the compact UI source-of-truth for CampusNav. It tells Codex/Claude which screens, reusable components, visual states, map controls, image slots, and interaction patterns already exist or are expected.

Use this together with `06-ui-ux-guidelines.md`:
- `06-ui-ux-guidelines.md` = visual/UX rules.
- `07-ui-registry.md` = actual UI inventory and component responsibilities.

Do not duplicate business logic in UI components. UI must consume the existing services, routing state, Supabase providers, and navigation engine.

---

## Approved design-system baseline

The frozen UI baseline (`DEC-UI-005`) is the monochrome application shell of `DEC-UI-003` with the Light/Dark/System theme and motion system of `DEC-UI-004`; it supersedes the CampusNav Ink chrome of `DEC-UI-002`. The implementation uses the centralized semantic tokens in `src/index.css` / `tailwind.config.js` (`canvas`, `surface`, `fill`, `line`, `ink`, `on-ink`, ...) rather than hex color classes; `npm run test:theme` enforces this. Map-canvas wayfinding colors remain the `MAP_COLORS` semantics.

| Pattern | Visual structure | Required behavior/accessibility | React mapping |
|---|---|---|---|
| Application shell | Grayscale canvas, left sidebar (expanded / icon rail / mobile drawer), floating CLARA | Current route exposed; skip link; keyboard access; drawer traps focus, closes on Escape, and returns focus to its opener | `AppShell`, `Sidebar`, `MobileSidebarDrawer`, `MobileTopBar` |
| Blueprint panel | Soft-radius bordered surface (registration marks retired by `DEC-UI-003`) | Caller supplies content semantics | shared CampusNav UI primitive |
| Kicker / section label | Compact uppercase label with modest tracking | Never substitutes for a semantic heading | shared CampusNav UI primitive |
| Primary action | Ink fill with on-ink label, soft radius (light ink in Dark) | Visible hover, active, focus, loading, and disabled states | shared button primitives and page actions |
| Emergency / destructive action | Heaviest ink treatment (solid ink-strong with a double rule, or a 2px ink outline) plus icon/text; no hue in chrome | Never relies on color; confirmation where destructive | Emergency surfaces and destructive action variants |
| Data/status chip | Monochrome tone (fill, border weight, dashed outline) plus icon and text | Text or icon states meaning explicitly | shared badge/status primitives |
| Map frame | Bordered surface around the existing 2D/3D renderer; the canvas keeps semantic `MAP_COLORS` | One spatial dataset and one A* engine; 2D fallback; legend swatches match the drawn marks per view; color-independent cues | Navigate map components |
| Dialog/drawer | Bordered surface with restrained elevation | Focus entry, Tab containment, Escape, and focus return (`useModalDialog` for custom dialogs; Radix for drawer/sheets); labelled title | `src/components/campus/useModalDialog.js`, existing dialog/sheet primitives |

---

## 1. Primary app screens

| Surface / route | Purpose and major components | Approved visual structure | Data source | Responsive/accessibility notes | Status |
|---|---|---|---|---|---|
| Home `/` | Entry point, global discovery, primary actions, campus summaries | Architectural hero, compact kicker/title, blueprint summary/action panels | Existing published facility, event, schedule, and advisory selectors only | Preserve mobile stacking, semantic heading order, and labelled actions | ACCEPTED_WITH_ADVISORY — automated desktop render passed; manual device QA pending |
| Dashboard `/dashboard` | Today overview, classes, office/personnel availability, advisories | Dense modular grid with bordered sections and compact metadata | Existing Supabase-backed dashboard services and canonical derived status logic | Cards reflow; availability includes text and never implies presence from schedule alone | ACCEPTED_WITH_ADVISORY — automated desktop render passed; manual device QA pending |
| Facilities `/facilities` | Search, filters, category/floor browsing, facility cards | Technical filter rail and bordered results grid | Existing published facilities; unknown data remains unavailable/pending verification | Search labelled; filters keyboard operable; result state readable | ACCEPTED_WITH_ADVISORY — automated desktop render passed; manual device QA pending |
| Facility Detail `/facilities/:id` | Facility facts, services, hours/availability, nearby facilities, navigation CTA | Blueprint detail header with structured fact and action panels | Existing verified/published facility records only | Semantic labels; no invented room, schedule, or institutional data | ACCEPTED_WITH_ADVISORY — automated desktop render passed; manual device QA pending |
| Navigate `/map` | Start/destination, 2D/3D map, route summary, steps | Blueprint map frame with separate controls and route instruction rail | Canonical spatial dataset, one A* engine, existing route state | 2D fallback, keyboard controls, text steps, non-color cues, reduced motion | ACCEPTED_WITH_ADVISORY — 2D desktop render and 2D/3D regressions passed; manual 3D/device QA pending |
| Events `/events` | Today/upcoming event discovery and details | Calendar/list sections with compact date blocks and bordered entries | Existing published event records | Date/time in text; empty/loading/error states | ACCEPTED_WITH_ADVISORY — automated desktop render passed; manual device QA pending |
| Emergency `/emergency` | Emergency contacts, procedures, approved evacuation assistance | High-priority heavy-ink panels without decorative urgency; only the map canvas keeps semantic red | Existing verified emergency contacts, procedures, and emergency-approved graph only | Urgency carried by weight, icons, headings, and text; immediate keyboard/touch access | ACCEPTED_WITH_ADVISORY — automated desktop render and safety regressions passed; manual device QA pending |
| CLARA (floating assistant; `/clara` opens it) | Current concierge placeholder and suggested prompts | Lower-right floating trigger with a non-modal chat popup / mobile sheet and a clear capability boundary | Existing placeholder/local behavior; not final grounded Groq/tool integration | Messages and controls labelled; limitations visible | PARTIAL — presentation only; final grounding deferred |
| Login `/login` | Supabase authentication entry | Focused blueprint sign-in panel on neutral canvas | Existing Supabase Auth integration | Explicit labels/errors, password autocomplete, visible focus | ACCEPTED_WITH_ADVISORY — automated desktop render passed; manual authenticated flow QA pending |
| Admin `/admin/*` | RBAC-protected CMS, personnel/schedules, audit views | Dense technical shell, section navigation, tables/forms/dialogs | Existing Supabase services and RLS-authorized operations | Tables scroll/reflow; errors linked; authorization is not visual-only | IMPLEMENTED_UNVERIFIED visually — render/RBAC regressions pass; authenticated graphical Admin QA pending |

### Global surfaces

| Surface | Purpose | Approved visual structure | Behavior/status |
|---|---|---|---|
| Global search | Cross-application discovery | Sharp search trigger and bordered dialog/results | Preserve search logic and keyboard behavior |
| Notifications | Published notices and activity entry point | Compact trigger, neutral panel, explicit unread text/status | Preserve data behavior; color is not the only unread cue |
| Profile/account | Identity, roles, account actions, sign out | Compact account trigger and bordered menu | Preserve AuthProvider state, RBAC visibility, and logout cleanup |

Current adoption evidence:
- `BlueprintPanel`, `InkKicker`, and `InkSectionLabel` are implemented in `src/components/campus/ui.jsx`.
- Automated desktop renders for Home, Dashboard, Facilities, Navigate, Events, Emergency, CLARA, and Login were inspected after the token/component adoption.
- **AUTOMATED RENDER VERIFIED / MANUAL VISUAL QA PENDING.**

Known page files include:
- `src/pages/Home.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/Facilities.jsx`
- `src/pages/FacilityDetail.jsx`
- `src/pages/Map.jsx`
- `src/pages/Emergency.jsx`
- `src/pages/Events.jsx`
- `src/components/clara/ClaraAssistant.jsx`
- `src/pages/Login.jsx`

---

## 2. Global shell registry

### `AppShell`
Path: `src/components/layout/AppShell.jsx`

Responsibilities:
- Single application shell (`DEC-UI-003`): one left navigation, page content, floating CLARA
- Sidebar collapsed/expanded state, mobile drawer state, universal search, notification and account panels
- Chooses the navigation for the route: the global `Sidebar` / `MobileSidebarDrawer` / `MobileTopBar` on public pages, or the Admin navigation (`AdminSidebar`, the Admin menu drawer, `AdminTopBar`) for a signed-in administrator inside `/admin/*` (`usesAdminShell` in `sidebar/navigation.js`). The two are never rendered together; while the session is still being checked on an Admin URL neither is shown
- Notification panel, account menu, universal search, and CLARA are shared by both navigations
- Provides `ClaraProvider` to every page

### `Sidebar` / `MobileSidebarDrawer`
Paths: `src/components/layout/sidebar/Sidebar.jsx`, `SidebarParts.jsx`, `MobileSidebarDrawer.jsx`, `navigation.js`

Responsibilities:
- Only global navigation: Home, Dashboard, Navigate, Facilities · Events, Alerts, Emergency · role-aware Admin
- Search trigger, notifications trigger with unread count, collapse control, account area
- Icon-rail tooltips; left drawer below 768px
- `MobileSidebarDrawer` is also the Admin menu drawer (it takes the Admin navigation as its content and hides from 1024px); it closes itself when the window grows past its breakpoint
- Not rendered inside `/admin/*` for administrators (see `AdminNavigation`)

CLARA must not appear in this navigation. Emergency must remain one tap away.

### `MobileTopBar`
Path: `src/components/layout/MobileTopBar.jsx`

A phone-only context bar (menu trigger, brand, search, notifications). It is not a navigation bar.

### `ClaraAssistant`
Paths: `src/components/clara/*`, `src/services/claraService.js`

The single global CLARA instance: `ClaraFloatingButton`, `ClaraChatPanel` (`ClaraHeader`, `ClaraMessageList`, `ClaraSuggestionChips`, `ClaraResultCard`, `ClaraComposer`), `ClaraContext`, and `ClaraRoute` (legacy `/clara` URL). All "Ask CLARA" actions call `useClara().openClara()`.

### Theme
Paths: `src/lib/theme.js`, `src/contexts/ThemeContext.jsx`, `src/components/theme/ThemeToggle.jsx`, inline script in `index.html`

Light / Dark / System with persisted preference (`campusnav-theme`). Tokens in `src/index.css`.

### Motion components
Path: `src/components/motion/*`, plus `src/components/home/QuickActions.jsx` and `src/components/home/HowItWorks.jsx`

Page-independent motion primitives and the CampusNav motifs (route, graph, QR checkpoint). The former schematic floor stack and conceptual Campus Overview were replaced by the real map (section 6). `CampusGraphBackground` keeps only its full-field variant (Login); the decorative Home graph band and its scroll fade were removed in the owner visual refinement (DEC-UI-005).

### `SmartCampusStrip`
Path: `src/components/home/SmartCampusStrip.jsx`

The Home coverage strip. It shows four facts, each derived from the canonical data and each linking to the page that provides it:
- the mapped floor range, for example GF–5F, with the number of mapped floors
- the count of facilities placed on the map
- QR + manual indoor positioning
- 2D + 3D views of one route

It never shows live, usage, availability, or invented figures.

### Home destination search
Home reuses `src/components/map/DestinationSearch.jsx`, the same combobox as Navigate, with the same navigable-destination rule. Choosing a destination opens Navigate with `?facility=<id>` (`getNavigateHref`). No second search implementation exists.

### `GlobalSearch`
Path: `src/components/layout/GlobalSearch.jsx`

Search groups:
- Facilities
- Rooms
- Services
- Personnel
- Events

### `NotificationPanel`
Path: `src/components/layout/NotificationPanel.jsx`

Purpose:
- Compact notification preview only
- Full notification feed belongs to Dashboard

### `ProfileMenu`
Path: `src/components/layout/ProfileMenu.jsx`

Future-ready items:
- Profile
- Saved Locations
- Notification Preferences
- Accessibility Preferences
- Sign Out

---

## 3. Branding and image components

### `SchoolLogo`
Path: `src/components/campus/SchoolLogo.jsx`

Use the official St. Clare College logo tastefully in:
- Sidebar header and mobile context bar
- Login
- Home hero
- Admin navigation header (once: the Admin sidebar, or the Admin menu drawer)

Do not repeat the logo everywhere.

### `FacilityPhoto`
Path: `src/components/campus/FacilityPhoto.jsx`

Supports:
- Office photos
- Laboratory photos
- Classroom photos
- Clinic/service area photos
- Placeholder when no image exists

Recommended image placements:
- Facility cards: small thumbnail
- Facility detail: hero image or gallery
- Dashboard/event cards: optional contextual image

Known school logo asset:
- `public/branding/scc-logo.png`
- `SchoolLogo` must use this approved release asset directly and must not prefer an unregistered filename variant.
- the transparent high-resolution PNG is used at CSS-controlled display sizes; do not stretch, redraw, recolor, or overuse it.

Current social preview asset:
- `public/branding/campusnav-og.png`
- obsolete or unapproved preview variants must remain outside runtime `public/` build inputs.

---

## 4. Facility UI registry

### `FacilityCard`
Path: `src/components/facilities/FacilityCard.jsx`

Display:
- Facility name
- Floor
- Category
- Status
- Short description
- Optional image thumbnail
- View/details affordance

Layout:
- On phones, the card is a compact row: an 80px category tile beside the details. The kind chip and arrow are hidden there.
- On wider screens, it is a vertical card with a short photo band.
- The Facilities grid auto-fills columns with a minimum width of 230px.
- Content and states are identical in both layouts.

### `FacilityStatusBadge`
Path: `src/components/facilities/FacilityStatusBadge.jsx`

Supported status vocabulary should remain consistent with services:
- OPEN_NOW
- CLOSED
- CLOSING_SOON
- SCHEDULED_TO_OPEN
- TEMPORARILY_UNAVAILABLE
- PENDING_VERIFICATION / UNKNOWN

Do not invent operating hours.

---

## 5. Dashboard UI registry

Known components:
- `src/components/dashboard/DashboardPrimitives.jsx`
- `src/components/dashboard/DashboardSections.jsx`
- `src/components/dashboard/CampusOverview.jsx` (`CampusOverview`: the real map preview plus campus counts; `NavigationShortcuts`)

Primary sections:
1. Priority Alerts
2. Today's Classes
3. Office Availability
4. Personnel Availability
5. Facility Advisories
6. Events & Calendar
7. General Announcements
8. Navigation Notices

Dashboard rules:
- It is the main information feed.
- Do not duplicate full notification feeds elsewhere.
- Normal mode must not fabricate official data.
- Demo data must be visibly labeled.
- Realtime records come through the existing provider/service layer.
- Sections render in the order above. Campus Overview sits beside Priority Alerts and Navigation Shortcuts, and its map grows to that column’s height.
- Office Availability is a compact list with one row per office: name and status, then floor and hours, then the Navigate and View Facility actions. `RecordActions` accepts a `className` so a row can drop its top margin.

---

## 6. 2D map UI registry

### Shared map presentation (one renderer, one dataset)
- `src/components/map/CampusMapCanvas.jsx`: the only component that mounts the 2D renderer (`IndoorMap2D`) and the lazy 3D renderer (`Campus3D`); it imports the canonical floors, facilities, nodes/edges, QR checkpoints, and emergency records itself. Used by Navigate and `CampusMapPreview`
- `src/components/map/CampusMapPreview.jsx`: Home and Dashboard preview variant (floor selector, 2D/3D, zoom, reset, facility card, "Open full map"; cooperative gestures; 3D mounted near the viewport and paused off screen)
- `src/components/map/MapViewControls.jsx`: shared Zoom in / Zoom out / Fit / Reset / Center / Fullscreen control group for 2D and 3D (replaces `MapTools2D`)
- `src/components/map/usePanZoom2D.js`: 2D pan, pinch, wheel zoom at the pointer, keyboard, resize, and view requests; math in `src/lib/mapViewport.js`
- `src/components/map/useMapFullscreen.js` and `ImmersiveMapPanel.jsx`: immersive Navigate map (native Fullscreen API or fixed-overlay fallback); `src/lib/mapLinks.js` builds Navigate links from the existing `?floor=` / `?facility=` parameters
- the Facility Detail page shows a static, non-interactive thumbnail of `IndoorMap2D` for the same canonical floor

Known components:
- `src/components/map/IndoorMap2D.jsx`
- `src/components/map/MapLegend.jsx`
- `src/components/map/RouteSummaryPanel.jsx`
- `src/components/map/MobileRouteSheet.jsx`
- `src/components/map/QRScanner.jsx`
- `src/components/map/LocationConfirmationDialog.jsx`
- `src/components/map/EmergencyMapOverlay.jsx`
- `src/components/map/EmergencyModePanel.jsx`
- `src/components/map/MapVerificationPanel.jsx`

Core controls:
- Current Location
- Destination Search
- Current Floor
- Scan QR
- Start Navigation
- Navigate / Emergency Mode
- 2D / 3D
- Zoom in / Zoom out / Fit / Reset / Center on facility
- Enter / Exit fullscreen map

### Map color policy
Under `DEC-UI-002`, controlled map colors remain valid inside the neutral-dominant CampusNav Ink system. CampusNav green identifies the active route/action system, emergency red is reserved for emergency meaning, and other map category/status colors must remain restrained and reinforced by icon, label, pattern, or shape.

Use consistent category colors for:
- Classrooms
- Laboratories
- Administrative Offices
- Student Services
- Health Services
- Food Areas
- Emergency/Safety Areas

Route and markers should remain immediately distinguishable:
- Current location: distinct "you are here" marker
- Destination: distinct destination marker
- Recommended route: highly readable route color
- Restricted/construction: explicit pattern/label, not color alone

Do not change geometry or pathfinding to satisfy visual design.

---

## 7. 3D map UI registry

Known components:
- `src/components/map3d/Campus3D.jsx`
- `src/components/map3d/Building3D.jsx`
- `src/components/map3d/Floor3D.jsx`
- `src/components/map3d/Room3D.jsx`
- `src/components/map3d/Route3D.jsx`
- `src/components/map3d/CameraController.jsx`
- `src/components/map3d/Map3DControls.jsx`
- `src/components/map3d/FacilityLabel3D.jsx`
- `src/components/map3d/LocationMarkers3D.jsx`
- `src/components/map3d/EmergencyOverlay3D.jsx`
- `src/components/map3d/DebugOverlay3D.jsx`
- `src/components/map3d/Map3DErrorBoundary.jsx`
- `src/components/map3d/geometry3d.js`

3D controls:
- Exploded
- Stacked
- Isolate Floor
- Focus Floor / Focus Facility
- Animate Route
- Switch to 2D
- Zoom in / Zoom out / Fit building to view / Reset map view (shared `MapViewControls` on Navigate and previews; `Map3DControls` keeps its own Entire Building / Reset View tools when rendered without them)
- orbit (drag), pan (right-drag / two fingers), zoom (wheel / pinch) through the existing OrbitControls

Label policy:
- Full building: floor labels only
- Selected floor: major facility labels
- Close zoom: room labels

The 3D renderer must use the same map/facility/routing data as 2D.

---

## 8. Auth and protected-state UI

Known components:
- `src/components/auth/ProtectedRoute.jsx`
- `src/components/auth/AccessDenied.jsx`
- `src/contexts/AuthContext.jsx`

UI rules:
- Public navigation remains accessible without login.
- Admin surfaces require role-aware access.
- Frontend guards are UX only; Supabase RLS is authoritative.
- Do not expose raw Supabase/PostgreSQL errors to normal users.

---

## 9. Admin UI registry

Known components/pages include:
- `src/components/admin/AdminShell.jsx` (Admin page frame and the Admin section registry `NAV_GROUPS`)
- `src/components/admin/AdminNavigation.jsx` (`AdminNavigation`, `AdminSidebar`, `AdminTopBar`: the single Admin navigation, rendered by `AppShell`)
- `src/components/admin/AdminContentEditor.jsx`
- `src/pages/admin/AdminOverview.jsx`
- `src/pages/admin/AdminContentPage.jsx`
- `src/pages/admin/AdminAudit.jsx`
- `src/pages/admin/QRCheckpoints.jsx`
- `src/pages/admin/FacilityAdminPage.jsx` and `src/pages/admin/ServiceAdminPage.jsx` (`/admin/facilities`, `/admin/services`; `SUPER_ADMIN`; Phase 4-FS-3B)
- `src/pages/admin/ServiceAliasAdminPage.jsx` and `src/pages/admin/FacilityServiceMappingAdminPage.jsx` (`/admin/service-aliases`, `/admin/facility-service-mappings`; `SUPER_ADMIN`; Phase 4-FS-3C)
- `src/pages/admin/FacilityOperationsAdminPage.jsx` and `src/components/admin/FacilityOperationsEditor.jsx` (shared FS-3B/FS-3C list/editor for profiles, services, aliases, and mappings; table at `xl` and wider, cards below)
- `src/pages/admin/FacilityHoursAdminPage.jsx` and `src/pages/admin/FacilityHourExceptionsAdminPage.jsx` (`/admin/facility-hours`, `/admin/facility-hour-exceptions`; `SUPER_ADMIN`; unnumbered final FS-3 implementation capability)
- `src/pages/admin/FacilityScheduleAdminPage.jsx` and `src/components/admin/FacilityScheduleEditor.jsx` (shared hours/exceptions list and schedule-aware editor; explicit split/overnight intervals, closed-all-day markers, strict Manila exception dates, lifecycle, provenance, stale handling, and responsive table/cards)

Phase 8C.2 work may also include academic/personnel admin surfaces such as:
- Personnel
- Courses
- Sections
- Class Schedules
- Schedule Exceptions
- Personnel Assignments
- Consultation Hours
- Check-ins
- Availability Overrides

Admin navigation (single Admin navigation shell; owner decision of 4 Oct 2026 under `DEC-UI-005`):
- `AdminShell` is only the page frame (work area, gutters, bottom clearance for CLARA). It renders no navigation.
- `AdminNavigation` is the only navigation inside `/admin/*`. `AppShell` renders it in the slot the global sidebar uses on public pages, so it persists across Admin pages and keeps its scroll position.
- From 1024px (`AdminSidebar`): sticky, full height, at the viewport's left edge. Header with the logo and "CampusNav Admin"; "Back to CampusNav" (to `/dashboard`); the grouped sections (the list scrolls on its own only when taller than the viewport and keeps the current section in view); then the appearance control, notifications, and the account button with the current user and role.
- Below 1024px (`AdminTopBar` and the Admin menu drawer): one "Open Admin menu" button and a "Back to CampusNav" action in the context bar. The drawer holds the same navigation without repeating "Back to CampusNav". There is no global menu button on Admin routes.
- Landmarks: one `aside` named "CampusNav Admin" and exactly one `nav` named "Admin navigation".
- Exactly one section is marked `aria-current="page"`; matching is by path segment (shared `isNavItemActive`), so `/admin/personnel-assignments` does not also mark Personnel.
- Groups with no section available to the signed-in role are not rendered. Planned areas without a route are listed under "Coming later" as text, not as links.

Admin design rules:
- Same CampusNav identity and semantic theme tokens as the public app (`DEC-UI-003`/`DEC-UI-004`), in Light and Dark
- Tables on desktop, stacked cards/rows on mobile; record actions must stay visible beside the Admin sidebar at 1280px
- Editor validation and save errors are shown in the sticky editor footer so they are visible wherever the form is scrolled; they are not copied onto the list behind the dialog
- Record actions carry an accessible name that identifies the exact record (for a mapping: facility and service)
- Strong empty/loading/error states
- Prefer deactivate/cancel/end over destructive deletion when history matters
- Audit remains read-only

---

## 10. Shared UI primitives

The project already contains reusable UI primitives under:
- `src/components/ui/`

Examples include:
- button
- card
- badge
- input
- select
- dialog
- drawer
- sheet
- tabs
- table
- tooltip
- skeleton
- toast / sonner
- dropdown-menu
- navigation-menu
- popover
- checkbox
- radio-group
- switch

Rule: reuse existing primitives before introducing a duplicate component pattern.

---

## 11. Status vocabulary registry

### Personnel
Use only service-backed statuses:
- UNAVAILABLE
- CHECKED_IN
- IN_CLASS
- CONSULTATION
- SCHEDULED
- NO_ACTIVE_SCHEDULE

Strict wording rule:
- `SCHEDULED` ≠ physical presence
- `IN_CLASS` means scheduled to teach, not confirmed present
- only an authorized active check-in may display `Currently checked in`

### Notifications
Categories:
- GENERAL
- ACADEMIC
- EVENT
- FACILITY
- SCHEDULE
- EMERGENCY
- SUSPENSION
- NAVIGATION

Priority:
- INFORMATIONAL
- NORMAL
- IMPORTANT
- URGENT

Lifecycle:
- DRAFT
- SCHEDULED
- PUBLISHED
- EXPIRED
- CANCELLED

---

## 12. Empty / loading / error state registry

Use intentional states instead of fake content.

Examples:
- No priority alerts.
- Schedule information unavailable.
- No current facility advisories.
- No upcoming events.
- Personnel availability information is not available.
- No verified route available.
- Camera permission required.
- 3D view unavailable; switched to 2D.
- Campus data temporarily unavailable.

Loading:
- Prefer skeletons/subtle progress indicators.
- Avoid blocking the whole app for optional cloud data.

---

## 13. Responsive registry

Target layouts:
- Wide desktop: 1600px+ class with increased breathing room
- Primary laptop: 1280–1440px class, including 1280×800 and 1366×768 height constraints
- Compact laptop: 1024×768 class
- Tablet: 768px class
- Mobile: ~390px class

Laptop application rules:
- Use the wide application shell for data-heavy Home, Dashboard, Facilities, Navigate, Events, Emergency, CLARA, and Admin surfaces; keep focused flows such as Login and readable prose intentionally narrower.
- Use approximately 16–24px practical gutters, compact page headers, and content-driven grids rather than tablet-like vertical stacking where horizontal space is available.
- Facilities use a compact filter rail plus auto-fitting results grid when space permits. Admin uses its single Admin sidebar and wider tables/forms. Navigate uses a compact control rail with the 2D/3D map as the dominant surface.
- Viewport-aware panels may use deliberate internal scrolling, but must not create unexplained nested or duplicate page scrollbars.

Mobile rules:
- Do not simply shrink desktop layout.
- Map/navigation should use a bottom-sheet pattern.
- Tables may become cards.
- Primary actions need large touch targets.

---

## 14. UI handoff rules for Codex / Claude

Before changing UI:
1. Inspect existing component first.
2. Preserve routes and component contracts.
3. Preserve service/provider boundaries.
4. Do not change A*, map coordinates, QR payloads, emergency rules, RLS, or backend logic for visual reasons.
5. Reuse shared primitives.
6. Keep school branding and facility imagery optional/fallback-safe.
7. Verify desktop + mobile after changes.
8. Report which UI files changed.

This registry should be updated whenever a new major screen/component family is added or renamed.
