# CampusNav AI — UI/UX Guidelines

## Visual direction
**UI FROZEN — `DEC-UI-005`, 3 Oct 2026.** Change this interface only for verified bugs, accessibility or responsive problems, user-testing findings, or approved new functional requirements.

**Mobile-first simplification — `DEC-UI-006`, OWNER APPROVED; `COMPLETE — ACCEPTED_WITH_ADVISORY` 13 Oct 2026.** A scoped exception to the freeze that supersedes only the mobile navigation provisions of `DEC-UI-003`. The owner's simplification direction makes the phone the primary design target. It changes information architecture and interaction patterns only; the visual system below is unchanged. See "Mobile-first rules".

CampusNav uses the owner-requested **monochrome application shell** defined by `DEC-UI-003` (3 Oct 2026), which supersedes the CampusNav Ink chrome of `DEC-UI-002`, with the **Light/Dark/System theme and motion system** of `DEC-UI-004`.

- strictly black, white, off-white, and gray application surfaces — no green, red, blue, amber, or gradients in application chrome
- minimal, spacious, calm; hairline borders, subtle shadows, soft radii
- state is communicated by fill, border weight, dashed outlines, icons, labels, and type weight
- map/navigation remains the visual centerpiece
- avoid generic LMS/admin-template appearance and any imitation of third-party brand assets

## Global layout
- **Left sidebar** is the global navigation on public pages from 768px: brand, universal search, `Main` (Home, Navigate, Facilities), `Campus` (Events, Alerts, Emergency, Dashboard), role-aware `Admin`, then appearance, notifications, collapse control, and the account area
- expanded (about 264px) by default at >= 1280px and an icon rail (about 76px) with tooltips below that; the user's choice is remembered per width class
- **Admin routes use a single Admin navigation shell** (owner decision, 4 Oct 2026, recorded under `DEC-UI-005`). For a signed-in administrator inside `/admin/*`, the global sidebar, rail, drawer, and phone context bar are not rendered; the Admin navigation takes their place, so there is only one left navigation panel:
  - from 1024px: the Admin sidebar (about 264px, at the viewport's left edge, full height), then the Admin work area;
  - below 1024px: an Admin context bar with one "Admin menu" button and a "Back to CampusNav" action; the menu is a left drawer with the same focus trap, Escape, and focus-return behaviour as the public drawer;
  - the Admin navigation holds, once each: the logo and "CampusNav Admin", "Back to CampusNav" (to the Dashboard), the Admin sections, the Light/Dark/System control, notifications, and the account button (current user and role, with Sign Out in its menu);
  - public pages keep the global navigation unchanged, and the remembered sidebar choice is not touched;
  - anyone who is not an administrator on an Admin URL (sent to sign-in, or shown "Access denied") keeps the public shell
- below 768px (`DEC-UI-006`) the primary navigation is a **bottom bar** with five slots (Home, Navigate, Facilities, Alerts, More) above the home-indicator inset. More opens a bottom sheet with Emergency, Events, Dashboard, role-aware Admin, Appearance, and the account; it traps focus, closes on Escape, overlay tap, the close button, and route selection, and returns focus to the More button. The phone context bar holds the brand and at most two utilities (search, notifications; Home omits search because its destination search leads the page)
- no horizontal top navigation
- **CLARA** is a floating assistant in the lower-right corner on every page: a 56px circle (an "Ask CLARA" pill on wide screens), opening a non-modal popup above the trigger, or a near full-width bottom sheet on phones. On phones it sits above the bottom bar and above the Navigate sheet. It never navigates away from the current page and is never a navigation entry

## Mobile-first rules (`DEC-UI-006`)
Design and review at 390px and 430px first, then 768, 820, 1024, 1280, 1366, and 1440.

- **Reduce before adding.** Remove, combine, shorten, or disclose before creating a component.
- **Three information levels.** Always visible: context, destination search, the primary action, a priority alert, essential map controls. One tap away: filters, details, hours, route steps, extra map tools. Deep detail: full descriptions, verification detail, data notes.
- **One primary action per screen.** Home: search a destination. Navigate: choose a destination, then Start Navigation. Facilities: search. Facility: Navigate. Emergency: Emergency Map, then Contacts.
- **At most two visible actions** per card or panel (one primary, one secondary). More actions go under ⋯ or a sheet. Hover never reveals extra actions.
- **Card content:** title, one supporting line, one status, at most two actions.
- **One status representation** per item. Do not repeat the same state as a badge, a sentence, and a footer.
- **Bottom sheets** for contextual phone content (More, Filters, the Navigate sheet). Never open a sheet or dialog from inside another.
- **Touch targets** at least 44px on phones (48px for the most common). Frequent actions sit in the middle or lower part of the screen.
- **Safe areas:** the bottom bar, sheets, CLARA, and the fullscreen map respect `env(safe-area-inset-*)`. Shell offsets come from `--app-bottom-nav-height` and `--app-bottom-safe` in `src/index.css`.
- **Type on phones:** page title 22–28px, section 17–20px, card title 15–17px, body 14–16px, metadata 12–14px. Shorten copy instead of shrinking text.
- **Honest summaries.** Never state an official campus status that is not published; never shorten safety wording; keep demo, pending, unknown, and estimate labels (they may be one tap away, never removed).
- **Admin exception:** Admin screens stay information-dense management tools and keep their own navigation.

## Overlay order
`sticky (20) < sidebar (30) < dropdown panels (40) < CLARA button (45) < CLARA panel (46) < drawer/overlay (50) < modal dialogs (70+) < toasts (100)`. Use the named Tailwind `z-*` tokens; do not introduce arbitrary large values.

## Branding
- use the owner-approved transparent `public/branding/scc-logo.png` in the sidebar header, mobile context bar, Home, and Login
- use the separate owner-approved `DEC-PWA-002` campus-building/navigation illustration only for installed-app, launcher, Apple touch, and favicon identity; it does not replace the SCC seal inside the application or the social-sharing preview
- support office/lab/classroom/facility photos and galleries; use polished placeholders when an image is unavailable

## Color decision
Application chrome is grayscale (`DEC-UI-003`). The only color in the product is inside the 2D/3D map canvas and its legend, where semantic wayfinding colors remain and are always paired with a shape, pattern, or label.

- never rely on color alone
- restricted/construction/emergency states need icon/pattern/text treatment
- contrast and accessibility must remain strong

## Theme
- Light, Dark, and System; control in the sidebar footer (segmented control when expanded, one cycling button on the icon rail) and, on phones, under More → Appearance
- preference key `campusnav-theme` (`light` / `dark` / `system`); unknown values fall back to `system`
- applied before first paint by the inline script in `index.html`; `ThemeProvider` (`src/contexts/ThemeContext.jsx`) keeps it in step with the OS setting and other tabs

## Canonical presentation tokens
Defined once in `src/index.css` (`:root` and `.dark`) and mapped in `tailwind.config.js`. Use the token classes; do not write hex color classes or `dark:` variants in components.

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#F5F5F7` | `#0A0A0A` | page background |
| `canvas-raised` | `#FFFFFF` | `#111111` | sidebar, full-bleed bands |
| `surface` | `#FFFFFF` | `#181818` | cards, panels, inputs, CLARA |
| `subtle` / `fill` / `fill-strong` | `#FAFAFA` / `#F5F5F7` / `#EDEDF0` | `#1C1C1E` / `#222224` / `#2E2E31` | inset areas, fills, hover/active |
| `line` / `line-strong` | `#E5E5EA` / `#D2D2D7` | `#2A2A2D` / `#3A3A3D` | hairlines, control borders |
| `ink` / `ink-strong` | `#1D1D1F` / `#000000` | `#F5F5F7` / `#FFFFFF` | primary text and primary controls |
| `ink-mid` / `ink-soft` / `ink-faint` / `ink-ghost` | `#3A3A3C` / `#6E6E73` / `#86868B` / `#AEAEB2` | `#D1D1D6` / `#A1A1A6` / `#8E8E93` / `#636366` | secondary to decorative text |
| `on-ink` | `#FFFFFF` | `#111111` | text on ink-filled controls |

- the legacy `brand-*`, `gold-*`, and `--ink-*` names resolve to these tokens
- spacing scale 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48; page gutters 16px mobile, 20–24px tablet, 24–40px desktop

## Typography
- system UI stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Helvetica Neue", Arial, sans-serif`; no font files are bundled or redistributed
- page titles are sentence case, semibold, with tight tracking; small section labels may be uppercase with modest tracking; paragraphs are never all caps

## Navigation UI
Must support:
- current location
- destination search
- floor selector
- Scan QR
- Start Navigation
- 2D / 3D switch
- Navigate / Emergency Mode switch
- route summary
- step-by-step directions

On phones and tablets (below 1024px) Navigate is map-first (`DEC-UI-006`): the destination field, a compact "From" row with Scan QR and Change, the map, and one bottom sheet. The sheet shows the chosen destination with Start Navigation, then ONE current instruction with the next one and Next Step ("All steps" opens the list and route figures), then the arrival with Plan Another Route. Visible map controls are Floor, 2D/3D, my location, and fullscreen; zoom is by pinch, and zoom, fit, reset, and center are in fullscreen. The remaining data notes open under "Map data notes". From 1024px the control rail, context bar, and route panel are unchanged.

**Location is never inferred (`DEC-UI-006`).** A fresh Navigate session has no current location and no destination. The current location comes only from a QR checkpoint, a manual choice, or another legitimately implemented positioning source; the manual picker starts with no floor and no location and never follows the viewed floor. `?facility=` sets the destination and views its floor; `?floor=` changes the viewed floor only; neither sets a location. With a destination but no location the page shows "Set your location to create a route." with Scan QR and Choose manually and calculates no route; Emergency Mode will not search for an exit from an unset position. The Library → Virtual Laboratory demonstration start exists only under `?demo=1`, with a visible "Demo start" label.

## Map presentation
One map, one source of spatial truth, several presentations. Navigate, Home ("Campus at a glance"), and Dashboard ("Campus Overview") all render `CampusMapCanvas`, which draws the canonical floor maps, facility geometry, graph, QR checkpoints, and emergency records with the same 2D renderer (`IndoorMap2D`) and the same lazily loaded 3D model (`Campus3D`). No page keeps its own geometry, coordinates, or map image. The Facility Detail page keeps a static, non-interactive thumbnail of the same 2D renderer.

- **2D**: drag to pan (grab cursor), wheel/trackpad zoom around the pointer, pinch to zoom, one-finger pan on touch; zoom limits relative to the floor size; Zoom in / Zoom out / Fit map to screen / Reset map view / center on the selected facility; with the map focused, arrow keys pan and plus/minus zoom. Dragging never selects a room; a tap or click does
- **3D**: drag to orbit, right-drag or two fingers to pan, wheel/pinch to zoom (existing OrbitControls, light damping); Zoom in / Zoom out / Fit building to view / Reset map view (default isometric, exploded, not isolated) / floor focus / facility focus; releasing an orbit over a room does not select it
- **Previews (Home, Dashboard)**: floor selector, 2D/3D switch, a compact facility card, and "Open map" to Navigate using its existing `?floor=` / `?facility=` parameters; no route workflow. The Dashboard preview also shows zoom and reset; the Home preview (`compact`) leaves zoom to gestures. Gestures are cooperative: plain wheel and vertical swipes scroll the page, Ctrl/⌘ + wheel or a pinch zooms the map. Home starts in 3D on capable desktops and in 2D on phones, touch devices, low-memory or data-saver devices, or without WebGL; Dashboard starts in 2D. 3D mounts only near the viewport and stops rendering while off screen or in a hidden tab; only the active view is mounted
- **Immersive fullscreen (Navigate)**: "Enter fullscreen map" puts the same mounted map into the browser Fullscreen API, or into a fixed full-viewport overlay (`100dvh`) where the API is unavailable or refused. Floor, 2D/3D view, selection, current location, destination, route, emergency mode, and progress are preserved; it is a view mode only. Exit by the visible "Exit fullscreen" button, the control, or Escape; focus stays inside while immersive and returns to the control afterwards. The route steps (desktop panel / phone bottom sheet) and the unchanged Emergency Mode panel are available inside. The floating CLARA trigger is hidden while immersive (its conversation is kept); "Ask CLARA" from a facility sheet leaves fullscreen first
- map semantic colors are unchanged in every presentation and theme; legend swatches follow the drawn marks

## 3D labels
- full building: floor labels only
- selected floor: major facility labels
- close zoom: room labels
- avoid floating-label clutter

## Home
Home answers "what can I do right now?" (`DEC-UI-006`). In order, in one column on phones and tablets:

1. the destination search, "Where do you want to go?" (the same `DestinationSearch` used on Navigate; choosing a destination opens Navigate with `?facility=<id>`), with a row of fixed shortcuts (Registrar, Library, Clinic, Guidance, OSAS) that open Navigate with that destination. They are fixed shortcuts, not history or popularity
2. the real campus map preview ("Campus at a glance"): Floor, 2D/3D, and Open map only
3. one **Campus status** module: a published priority alert if there is one, otherwise "No active alerts" with counts of facility advisories, route notices, and today's events. It never states "Normal operations" or a suspension status
4. **Quick access**, four actions: Scan QR (opens Navigate with the scanner, `?scan=1`), Facilities, Events, Emergency. There is no Navigate tile (the search does that) and no Ask CLARA tile (the floating button does that)
5. **Today**: at most four items (today's events, facility advisories, route notices), then "View all" to the Dashboard

From 1024px the map takes the wide right column beside the same blocks, and the factual coverage strip (`SmartCampusStrip`) appears below them. The strip shows only facts derived from the canonical floor and facility data and never live, usage, or availability figures. Home has no marketing paragraph, no announcements list (Alerts), no CLARA panel, and no "How CampusNav works" explainer.

## Dashboard
Kept as its own route (`DEC-UI-006`): Home is the at-a-glance summary and links here for the full feed. Primary centralized information surface for:
- priority alerts
- today’s classes
- office availability
- personnel availability
- facility advisories
- events
- announcements
- navigation notices

Layout:
- Sections render in the order above.
- Campus Overview sits beside Priority Alerts and Navigation Shortcuts. Its map grows to that column’s height, so neither column leaves a gap.
- Below that, the left column holds Today’s Classes and Office Availability. Office Availability is a compact list: name and status on the first line, floor and hours below, actions at the end of the row.
- The right column holds Personnel Availability through Navigation Notices.

## Facilities directory
- Every card shows the name, the floor (full name, not the abbreviation), one operational status (plus demo or pending markers when they apply), and at most two actions: Navigate, then Details.
- On phones, cards are compact rows: a category tile beside the details. The page is the title, one search field, and one chip row (Filters, All, GF–5F); categories open in the Filters bottom sheet.
- From 640px cards also show the category and a two-line description under a short photo band, in an auto-fill grid with a minimum width of 230px. From 1024px search and filters are a left rail.
- The facility data notice sits below the results.

## Facility detail
Top: status, name, floor and category, then Navigate (primary), Ask CLARA (secondary), and a save toggle. Then the public facility details (status, information, services, hours), "Location & accessibility" (open from 640px, one tap on phones), the map preview, and advisories. Loading and unavailable states are stated once.

## Events, Alerts, Emergency
- **Events:** each card shows the name, date and time, venue, and one status; Navigate when a venue is mapped; organizer and audience open under Details. Empty states are one line with "View calendar".
- **Alerts:** one list, most important first. Each item shows its title, priority, and source; the text opens on tap, and important items start open.
- **Emergency:** Emergency Map and Contacts are the first two controls, then the unshortened safety notice with the mapped-floor coverage, the guidance, and the contacts. "How Emergency Mode works" is one tap away.

## Personnel wording
Visually distinguish:
- Scheduled
- In Class (Scheduled)
- Consultation
- Checked In
- Unavailable
- No Active Schedule

Never visually imply physical presence from schedule data alone.

## Motion
Governed by `DEC-UI-004`. Motion must communicate location, direction, destination, floors, routes, facilities, campus information, or CLARA assistance.

- reusable pieces in `src/components/motion/`: `MotionReveal`, `StaggerGroup`, `AnimatedCounter`, `CampusRouteMotif`, `CampusGraphBackground` (`InteractiveCard` and `QRCheckpointMotif` were removed with the Home quick-action cards, `DEC-UI-006`; the `interactive-card` hover style remains)
- Home: no decorative motion beyond the shared page transition and the hover lift on quick-access tiles (`DEC-UI-006`). The quick-action motifs and the "How CampusNav works" route line were removed with those sections
- Dashboard: count-up on summary values (once, only for real values), staggered section reveal, "Campus Overview" with the real CampusNav map and campus counts, fixed "Navigation Shortcuts", and a one-time emphasis on urgent alerts
- shell: 200ms page-content transition (the sidebar and CLARA never animate between pages), gliding active highlight and hover micro-motions in the sidebar, CLARA idle float and hover ring
- timings: fast 140ms, normal 220ms, reveal 400ms, ambient 4–12s; easing `cubic-bezier(0.22, 1, 0.36, 1)`
- reduced motion removes all of the above; ambient motion pauses off screen and when the tab is hidden; phones get no parallax
- never label decorative motion as a real route, live activity, or navigation history

## Responsive behavior
Design for desktop, laptop, tablet, and mobile. Mobile map/navigation should use a true bottom-sheet experience rather than a shrunken desktop layout.

- **Laptop-first application density:** application screens should maximize useful viewport area at approximately 1280–1440px widths while retaining readability, hierarchy, accessible controls, and practical touch targets. Use wide application shells, approximately 16–24px laptop gutters, compact application headers, and content-driven grids; keep long-form prose narrower.
- Treat 1280×800 and 1366×768 as primary application-layout conditions, including vertical-height review. Primary Dashboard, Facilities, Navigate, and Admin interactions should appear substantially above the fold without decorative whitespace displacing them.
- Map pages should give the 2D/3D viewport the majority of useful laptop width and height. Prefer a compact 260–320px control rail at laptop widths, while preserving the mobile route-sheet pattern.
- preserve the phone bottom navigation and More sheet, responsive grids, dialogs, and the Admin drawer
- condensed headings must wrap without clipping
- dense blueprint panels must reflow into single-column or horizontally scrollable structures where appropriate
- avoid accidental page-plus-panel double scrolling; contained overflow is appropriate only for deliberate controls, tables, conversations, or map interactions
- device/browser compliance must remain pending unless supported by real graphical/device evidence

## 2D fallback
If WebGL fails or device performance is insufficient, the user must still be able to navigate in 2D with the same current location, destination, and route state.
