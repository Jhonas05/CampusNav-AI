# CampusNav AI — Decision Log

This file records deliberate project decisions so future coding agents do not revive old assumptions or create conflicting implementations.

## DEC-ARCH-001 — One dataset + one routing engine
**Status:** APPROVED / NON-NEGOTIABLE

2D, 3D, QR, Dashboard-linked navigation, personnel navigation, and future CLARA reuse the same campus records and routing result.

## DEC-NAV-001 — Pathfinding is not AI
**Status:** APPROVED

Normal route computation uses standard graph-based A* (or architecturally equivalent Dijkstra). CLARA is the intelligent component.

## DEC-NAV-002 — Standard and Avoid Stairs route preferences
**Status:** OWNER APPROVED / IMPLEMENTED_VERIFIED (ENGINE AND NAVIGATE UI) — 14 Oct 2026; adviser/defense classification unchanged

Normal CampusNav navigation may expose two route-session preferences through the existing A* engine:
- `STANDARD` preserves the current eligible-edge behavior, route costs, and deterministic tie handling
- `AVOID_STAIRS` is a hard constraint, not a penalty or best-effort preference

Under `AVOID_STAIRS`, an edge marked `stairs: true` is ineligible. A cross-floor transition is also ineligible unless its canonical metadata explicitly verifies a non-stair connector; an unknown or incomplete connector must fail closed. CampusNav must not silently substitute a stair route when no eligible path exists and must state: `No route that avoids stairs is available in the verified campus map.` A same-floor route may remain available when its actual traversed edges do not require stairs; the presence of a stair landing node alone does not make an otherwise walkable same-floor approach ineligible.

This preference is scoped to the active route request/session and is not persisted as an accessibility profile. `STEP_FREE`/wheelchair-accessible routing remains BLOCKED until the necessary infrastructure and route data are institutionally verified. Crowd-aware routing and accessible Emergency routing remain BLOCKED. Emergency navigation remains independent, continues to use only its approved-edge contract, and does not consume or fall back through this normal-navigation preference.

**Owner-authorized UI integration — 14 October 2026:** The owner separately authorized Standard/Avoid Stairs controls in Navigate, a phone/tablet preference dialog, desktop route-panel disclosure, explicit Standard recovery, session-state preservation, and automatic Git completion. The accepted engine/API is reused without modification. Changing an active preference replaces the route from confirmed endpoints and restarts user-advanced steps with an announcement; it never relocates the visitor. Step-free / Wheelchair remains informational and pending. Local deterministic, responsive Chrome, keyboard/focus, QR-resolver, shared-renderer, Emergency, and production-build offline evidence is recorded in `63` and `73`. This authorization is a scoped functional addition within the frozen UI and does not change Phase 4-FS-4 status or adviser/defense claims.

## DEC-3D-001 — 3D is a visualization layer
**Status:** APPROVED

3D must consume the same spatial coordinates and route node sequence as 2D. No separate 3D routing engine or independent room-coordinate truth.

## DEC-POS-001 — QR/manual are the reliable thesis-core indoor positioning methods
**Status:** APPROVED

Outdoor GPS is optional. BLE is an optional hardware upgrade. Wi-Fi fingerprinting/UWB are future/non-core.

## DEC-EMR-001 — Emergency graph is strict
**Status:** APPROVED / SAFETY CRITICAL

Emergency mode uses only verified/admin-approved emergency edges. No normal-route fallback.

## DEC-PRES-001 — Schedule does not prove physical presence
**Status:** APPROVED / PRIVACY CRITICAL

Use `SCHEDULED`, `IN_CLASS`, or `CONSULTATION` for timetable-based information. Only authorized check-in may show `CHECKED_IN`.

## DEC-PRIV-001 — No public live employee GPS
**Status:** APPROVED

CampusNav may expose approved schedule/availability, not live staff tracking.

## DEC-DASH-001 — Dashboard centralizes notification-style information
**Status:** APPROVED

Feature pages may show local task status, but the main feed/priority information belongs on Dashboard.

## DEC-AI-001 — CLARA comes after stable internal services
**Status:** APPROVED

CLARA uses authorized tools/internal services and verified campus data. AI provider calls remain server-side.

## DEC-DATA-001 — Preserve proven local spatial data during backend expansion
**Status:** CURRENT IMPLEMENTATION DECISION

Supabase currently owns identity/content/schedule/personnel domains while proven spatial/navigation data remains local/version-controlled unless an explicit migration is approved.

## DEC-UI-001 — Controlled map colors are allowed in the current working UI
**Status:** SUPERSEDED BY DEC-UI-002

The 14 Sep master source originally specified strict grayscale. The current working content folder deliberately allows controlled category colors **inside the map** for readability while keeping the surrounding app calm/minimal.

Rules:
- do not make the entire app arbitrarily colorful
- never rely on color alone
- emergency/restricted states still require icon/pattern/text
- if owner/adviser chooses strict grayscale later, update this decision and both UI documents together

## DEC-UI-002 — CampusNav Ink is the approved application-wide visual baseline
**Status:** SUPERSEDED IN PART BY DEC-UI-003 (application chrome) — originally OWNER APPROVED 15 Sep 2026

CampusNav adopts the CampusNav Ink / architectural-blueprint visual direction as the canonical presentation baseline for the existing application.

Rules:
- neutral off-white, charcoal, and grayscale surfaces remain dominant
- CampusNav green (`#15703c`, hover `#0f5a2f`) identifies primary actions and selected states
- emergency red (`#b3261e`) is reserved for urgent, emergency, and destructive meaning
- controlled semantic map/status colors require labels, icons, patterns, shapes, or other non-color cues
- use Archivo for readable interface text and Barlow Condensed for compact architectural headings, delivered through maintainable open-source packages or safe fallbacks
- favor sharp geometry, thin technical borders, restrained shadows, compact uppercase labels, and selective blueprint registration marks
- preserve mobile behavior, accessibility semantics, routing, domain logic, lazy loading, and provider integrations

This decision supersedes DEC-UI-001 only where the earlier decision limited color and architectural visual language to the map canvas or implied a strict grayscale / Apple-only application shell. DEC-UI-001 remains historical evidence for the rule that color is never the only carrier of meaning.

`CampusNav-Ink-all-pages.html` is a visual and interaction-composition reference only. It is not production source, runtime logic, institutional truth, routing data, backend policy, or authorization evidence. Its inline styles, bundled scripts, embedded fonts, and static controls are not canonical implementation assets.

## DEC-UI-003 — Monochrome application shell, left sidebar navigation, floating CLARA
**Status:** OWNER REQUESTED — 3 Oct 2026 (owner redesign brief "Left Sidebar + Floating CLARA Assistant"); approved as part of the frozen baseline by DEC-UI-005

The owner's redesign brief replaces the CampusNav Ink application chrome and the top navigation with the following baseline.

Rules:
- global navigation is a left sidebar: expanded on wide screens (>= 1280px), an icon rail on laptop/tablet widths and inside the Admin CMS, and a left slide-out drawer below 768px; there is no horizontal top navigation bar and no bottom tab bar
- existing routes are unchanged; `/clara` remains a valid URL that opens the floating assistant and returns to Home
- CLARA is not a navigation entry or a page; it is one global floating assistant (lower-right trigger plus a non-modal chat popup / mobile sheet) reused by every "Ask CLARA" action
- application chrome is strictly black / white / grayscale; state is carried by fill, border weight, dashes, icons, labels, and type weight, never by hue (including emergency and destructive controls, which use the heaviest ink treatment)
- typography uses the system UI stack; no font files are bundled
- surfaces use soft radii (roughly 10–14px controls, 16–24px cards/panels), hairline borders, and subtle shadows; blueprint registration marks and the grid-paper hero are retired
- **map-canvas wayfinding colors are unchanged**: `MAP_COLORS` and the category `map` tints inside the 2D/3D viewport and its legend still follow the semantic map convention from DEC-UI-001/002 (route, destination, emergency path, exit, equipment), each reinforced by shape, pattern, or label. Converting the map canvas itself to grayscale is a separate owner decision because it affects wayfinding and emergency legibility
- routing, pathfinding, QR positioning, emergency logic, authentication/RBAC, providers, and data are untouched; CLARA still has no model, API key, or independent routing

This decision supersedes DEC-UI-002 for application chrome (color, typography, geometry, shell). DEC-UI-002 remains the record for map-canvas color semantics and the rule that color is never the only carrier of meaning.

## DEC-UI-004 — Light/Dark/System theme on semantic tokens, and the CampusNav motion system
**Status:** OWNER REQUESTED — 3 Oct 2026 (owner continuation brief "Light/Dark Mode + Premium Motion Experience"); approved as part of the frozen baseline by DEC-UI-005

A continuation of DEC-UI-003. The sidebar shell, floating CLARA, and grayscale chrome are unchanged; this decision adds theming and motion on top of them.

Theme rules:
- three preferences: Light, Dark, and System (follows `prefers-color-scheme`, live); the choice is stored in `localStorage` under `campusnav-theme` and applied by an inline script before first paint, so there is no flash of the wrong theme
- one implementation for the whole application, Admin included: the resolved theme is a `dark` class on `<html>`; every color comes from semantic CSS variables (`--canvas`, `--surface`, `--fill`, `--line`, `--ink`, `--ink-soft`, `--on-ink`, ...) exposed as Tailwind colors of the same name. Components must not hard-code hex color classes or add per-component `dark:` variants (`test:theme` enforces this)
- dark mode is a designed palette (canvas `#0A0A0A`, raised `#111111`, surface `#181818`, primary text `#F5F5F7`, primary control light with dark text), not an inversion
- theme changes cross-fade paint properties for about 200ms and are immediate under reduced motion

Map exception (unchanged in meaning):
- the 2D/3D viewport remains a functional visualization and keeps its semantic colors (category tints, route, emergency path, exit, equipment). In dark mode the 2D map inverts lightness while preserving hue so the same colors stay legible on a dark surface; the 3D view changes only its scene backdrop. The map legend draws its swatches from the same map colors. No pathfinding, emergency, or spatial data is affected

Motion rules:
- every animation must serve navigation feedback, spatial explanation, hierarchy, or the map/route/floor/QR/CLARA identity; no blobs, glows, gradients, confetti, or looping attention effects
- timing: fast about 140ms, normal about 220ms, reveal about 400ms, ambient 4–12s (the orbit ring is slower); one easing, `cubic-bezier(0.22, 1, 0.36, 1)`; pointer response at most a few pixels; hover lift at most 3px
- decorative graphics (route motif, campus graph, floor stack, QR motif, Campus Overview) are abstract (the floor stack and the conceptual Campus Overview graphic were later replaced by the real map; see the approved change under DEC-UI-005), `aria-hidden` where they carry no information, and are never presented as real routes, live activity, or history
- interactive controls do not move on their own; the only idle motion on a control is the CLARA trigger's 2px float
- `prefers-reduced-motion: reduce` removes reveal, parallax, ambient, count-up, page-transition, and theme-transition motion; functionality is identical
- ambient animation runs only while its section is on screen and the tab is visible; phones and touch devices get no parallax and fewer ambient layers
- implementation is CSS/SVG plus IntersectionObserver; no animation library is loaded for this

## DEC-UI-005 — UI freeze
**Status:** OWNER APPROVED — 3 Oct 2026 (owner "UI Freeze & Production Readiness Pass"); re-recorded on the current Phase 4 baseline at integration — 3 Oct 2026

The owner approved the interface built on `wip/map-ui-redesign-v2` — left sidebar (`DEC-UI-003`), floating CLARA (`DEC-UI-003`), Light/Dark/System theme and the motion system (`DEC-UI-004`) — as the working UI baseline, and it is **FROZEN** as of this decision. The owner-approved snapshot (`CampusNav-AI-ui-frozen.zip`) was built on `577610c` (Phase 4-FS-2B) and predates FS-2C, FS-3A, and FS-3B, so it was integrated selectively onto the Phase 4-FS-3B baseline (`c7037e3`) on `wip/ui-freeze-integration` rather than copied: the frozen design governs presentation, while current functionality, services, tests, RBAC/RLS, and canonical documentation remain authoritative.

After the freeze the UI may change only for:
- verified bugs
- accessibility problems
- responsive problems
- user-testing findings
- approved new functional requirements

Not permitted without a new owner decision: redesigning the visual system, adding decorative motion, changing routing, map semantics, navigation logic, or established interaction patterns, and aesthetic changes made for novelty.

Changes made during the freeze pass and its integration were limited to verified defects and to applying the frozen Admin visual system to the FS-3B Admin workflows; they are listed in `63-implementation-status-registry.md` and `CHANGELOG.md` v3.39. A change proposed under one of the permitted reasons must name the reason and the evidence (failing check, device report, user-testing note) in its changelog entry.

Boundaries:
- this is a presentation baseline decision; it does not reorder or complete Phase 4, start FS-3C, or change `DEC-ROADMAP-002`
- it is not the preserved `wip/claude-sidebar-redesign` work that `DEC-ROADMAP-002` keeps outside Phase 4; that branch was not used as a source
- the Phase 4 operational-status engine (`getFacilityStatus`) is still not wired into public UI; frozen facility surfaces continue to show canonical local hours fields or pending/unavailable wording
- removing packages with zero imports is not a dependency upgrade; no version was changed

Approved changes after the freeze:
- **3 Oct 2026 — real map reuse and immersive fullscreen navigation** (reason: approved new functional requirement, owner request "Real Map Reuse + Immersive Fullscreen Navigation"; evidence: `test:map-experience` and the browser QA recorded in `63` and `CHANGELOG.md` v3.40). Home and Dashboard now embed the real CampusNav map instead of the schematic floor stack and the conceptual Campus Overview graphic; the Navigate map gains 2D pan/zoom, 3D zoom/fit/reset controls, and an immersive fullscreen view. This is an implementation of `DEC-ARCH-001` and `DEC-3D-001` — one shared renderer (`CampusMapCanvas`) over the one canonical spatial dataset — and is presentation only: no geometry, graph, route, QR, emergency, or data rule changed, map semantic colors are unchanged, and the visual system is otherwise as frozen
- **4 Oct 2026 — owner visual refinement of Home, Dashboard, and Facilities.** Reason: owner-directed final visual polish pass. The owner rejected the Home desktop composition: dead space, an isolated hero, a disconnected map preview, and a wasteful decorative route band. Evidence: the before/after screenshots and browser QA recorded in `63` and `CHANGELOG.md` v3.41.
  - Home: the hero is top-aligned. The map is larger and stretches to the hero band. The hero gains the shared destination search (`DestinationSearch`, reused from Navigate) and a factual coverage strip (`SmartCampusStrip`). Popular destinations start in the first viewport. The decorative graph band and its scroll fade were removed.
  - Dashboard: sections render in the dashboard contract order. The map column stretches beside Priority Alerts and Navigation Shortcuts. Office Availability is a compact list.
  - Facilities: denser cards, with compact rows on phones.
  - 3D: portrait 3D framing no longer clips the building.
- **4 Oct 2026 — Admin routes use a single Admin navigation shell (owner decision).** Reason: owner finding from the live authenticated `SUPER_ADMIN` review. Two navigation panels side by side inside the Admin CMS were redundant and made the work area cramped. An interim fix on the same day kept a compact global rail beside the Admin sidebar; the owner rejected it as still redundant, and this rule supersedes it. Evidence: `test:phase4-fs3c` and the browser QA recorded in `63` and `CHANGELOG.md` v3.42.
  - Inside `/admin/*`, a signed-in administrator sees ONE left navigation panel: the Admin sidebar from 1024px, or one Admin menu drawer below that. The global sidebar, rail, drawer, and phone context bar are not rendered beside it.
  - The Admin navigation provides, once each: the Admin identity, "Back to CampusNav" (to the Dashboard), the Admin sections, the theme control, notifications, and the account button with Sign Out.
  - Public pages keep the global navigation exactly as frozen. `DEC-UI-003` (left sidebar as the global navigation) is unchanged for them.
  - Defects fixed while doing this: two sections marked current on routes sharing a prefix, empty group headings for department administrators, the editor error rendered out of view, a save error left on the list after closing the editor, record actions with identical names, a second `main` landmark on the access-denied and session-check screens, an open drawer left locking the page when the window grows past its breakpoint, and the stale "authentication pending" label on QR Checkpoints.
  - This is a refinement within the frozen visual system. It changes no route, guard decision, role boundary, data rule, or dependency.

## DEC-UI-006 — Mobile-first UX simplification and information architecture
**Status:** OWNER APPROVED — `COMPLETE — ACCEPTED_WITH_ADVISORY` — 13 Oct 2026

The owner directed a UX simplification pass with the phone (390–430px) as the primary design target. It is an information-architecture refinement, not a feature expansion and not a new visual system: the monochrome tokens, Light/Dark/System theme, motion system, and map semantic colors of `DEC-UI-003`/`DEC-UI-004` are unchanged.

Relationship to earlier decisions (their history stands; nothing is erased):
- `DEC-UI-003`: superseded **only in its mobile navigation provisions** ("a left slide-out drawer below 768px" and "no bottom tab bar"). Everything else in it stands, including the left sidebar and the floating CLARA assistant.
- `DEC-UI-005`: this is an **approved, scoped exception** to the UI freeze. The freeze remains in force for everything outside this decision.
- Desktop and tablet navigation remains sidebar-based.
- Phone primary navigation is **Home / Navigate / Facilities / Alerts / More**.
- CLARA remains a floating assistant and is not a navigation destination.

Rules:
- **Phone primary navigation is a bottom bar** with at most five slots: Home, Navigate, Facilities, Alerts, More. More opens a bottom sheet with Emergency, Events, Dashboard, role-aware Admin, Appearance, and the account. Common tasks need no hamburger. The left drawer remains only as the Admin menu.
- **CLARA is never a navigation entry.** Its floating button sits above the bottom bar and above any page sheet; none of the three may overlap.
- **Phone top bar** holds the brand and at most two utilities (search, notifications). Theme and account live under More.
- **Progressive disclosure, three levels:** always visible (context, destination search, primary action, a priority alert, essential map controls); one tap away (filters, details, hours, route steps, extra map tools); deep detail (full descriptions, verification detail, data notes).
- **Maximum visible actions:** one primary and one secondary per card or panel; further actions go under More/⋯ or a sheet. A facility card shows name, floor, one status, Navigate, and Details.
- **Home and Dashboard stay separate (owner decision).** Home is the fast, at-a-glance, mobile-first entry point: destination search, fixed shortcuts, the real map preview, one Campus status module, four quick actions, and at most four Today items. The Dashboard is the deeper, contract-required campus status and information surface (`DEC-DASH-001` unchanged) at `/dashboard`. Home links to it and does not repeat its eight sections.
- **Home never states an official status it does not hold.** With no published alert it says "No active alerts"; it does not say "Normal operations" or "No suspension".
- **Navigate is map-first on phones and tablets:** one destination field, a compact "From" row (with Scan QR and Change), the map, and ONE contextual bottom sheet. Phone map controls are Floor, 2D/3D, my location, and fullscreen; zoom is by pinch and the full tool set is in fullscreen. The legend stays a button.
- **CampusNav never infers the visitor's location.** A fresh Navigate session has no current location and no destination. The current location comes only from a QR checkpoint, a manual choice, or another legitimately implemented positioning source. The manual picker starts with no floor and no location chosen and never follows the viewed floor. The former Library → Virtual Laboratory start exists only behind an explicit, visibly labelled `?demo=1`.
- **Links set the destination and the view, never the start.** `?facility=<id>` sets the destination and views its floor. `?floor=<id>` changes the viewed floor only, alone or beside a destination. Neither creates or moves the current location.
- **No route without both ends.** With a destination but no current location, Navigate shows "Set your location to create a route." with Scan QR and Choose manually, and calculates nothing. Emergency Mode likewise will not search for an exit from an unset position.
- **No request for a photo that does not exist.** A facility image is requested only when the facility record carries an approved `photoSrc`; otherwise a category placeholder renders. No facility has one yet; no photograph is invented.
- **Bottom sheets** are used for contextual phone content (More, Filters, the Navigate sheet); a sheet is never opened from inside another sheet or dialog.
- **Touch targets** are at least 44px for phone controls; safe-area insets are respected by the bottom bar, sheets, CLARA, and the fullscreen map.
- **Nothing is removed that a user could do before.** Capabilities moved behind Details, More, Filters, "All steps", "Map data notes", or fullscreen. All routes are unchanged.
- **Provenance and safety wording is not shortened.** Demo, pending, unknown, estimated-dimension, and emergency notices remain; some moved from always-visible to one tap away.

Behaviour fixes recorded with this decision (A*, the graph, QR resolution, and emergency routing are untouched):
- Navigate no longer assumes "Library, 3F" as the current location or preselects "Virtual Laboratory".
- A `?facility=` link no longer moves the assumed current location onto the destination's floor (which could make the start the destination itself and produce a zero-length "arrived" route), and `?floor=` no longer places the visitor on that floor. A link to Library no longer answers "already there".

Requirement-aligned test updates (not weakening): `test-map-experience.mjs` follows the "Open map" wording; `test-phase4-fs3c.mjs` validates the bottom navigation and More sheet for the public shell and that the Admin drawer is represented once; `test-route-render.mjs` asserts the fresh unset state and keeps its original Navigate assertions against the labelled demo start.

Acceptance evidence includes all deterministic suites and headless Chromium across the required responsive matrix. Physical Android Chrome, iOS Safari, other non-Chromium browsers, and screen-reader testing were not performed and remain explicit advisories; browser emulation is not physical-device or assistive-technology certification. The owner approved completion without another visual-review checkpoint and authorized the normal automatic deployment path from `main`.

Known boundary: destination search still covers mapped, navigable facilities by name, floor, and category. Service, alias, and personnel search remain the later Phase 4 discovery work and were not started here.

## DEC-TITLE-001 — Formal proposal title vs current responsive implementation
**Status:** REQUIRES THESIS/ADVISER ALIGNMENT, NOT A CODE BLOCKER

Proposal materials describe CampusNav AI as tablet-based. The approved technical architecture explicitly says the system should be web-based/responsive and not tablet-only. Keep the software responsive; do not silently rename the formal thesis title without thesis approval.

## DEC-DEPLOY-001 — Current cloud architecture
**Status:** CURRENT

- GitHub main → Cloudflare static deployment
- Supabase for Auth/database/RLS/Realtime
- AI secret stays server-side when CLARA is added

## DEC-ASSET-001 — High-resolution transparent SCC PNG is the canonical runtime logo
**Status:** OWNER APPROVED — 16 Sep 2026

`public/branding/scc-logo.png` is the current canonical SCC institutional logo used by CampusNav. The owner approved this exact higher-resolution visual and superseded the temporary release instruction that kept the older JPG as primary.

Rules:
- runtime UI uses `/branding/scc-logo.png` only; the JPG is not an automatic fallback or active visual
- only the edge-connected exterior background may be made transparent; wording, symbols, colors, proportions, and legitimate internal white/light details must remain unchanged
- CSS controls display size so the source is not unnecessarily downscaled
- the JPG remains historical/legacy evidence outside runtime `public/`
- any future visual-content change requires a new owner/institutional asset decision

## DEC-AR-001 — AR-Assisted Camera Navigation is approved for canonical planning only
**Status:** OWNER APPROVED FOR PLANNING / IMPLEMENTATION NOT AUTHORIZED — 19 Sep 2026

CampusNav may plan an optional AR-Assisted Camera Navigation / AR Guidance Mode under `74-ar-assisted-navigation-contract.md`.

Decision boundaries:
- AR Guidance is a presentation layer over the existing canonical A* route; it is not a routing engine
- QR checkpoints and manual confirmation remain the location-verification truth
- no exact continuous indoor tracking, autonomous localization, or invented orientation is claimed
- emergency presentation may consume only an already-approved emergency route and remains separately gated
- camera use is explicit, local-first, non-recorded/non-uploaded by default, with no facial/person recognition
- 2D, 3D, and textual guidance remain available fallbacks
- the feature is `NOT_IMPLEMENTED`, `DEFERRED`, and `NOT_READY`
- at the time of adoption, Phase 3 and unfinished MQA-4 controlled sequencing; Phase 3 is now complete, and no AR implementation stage is authorized by either decision

## DEC-DEFENSE-001 — Proposed final defense scope baseline
**Status:** OWNER APPROVED / ADVISER CONFIRMATION REQUIRED — 19 Sep 2026

The owner approves the following proposed final defense baseline. This is an owner scope decision only; it is not adviser approval, institutional approval, or implementation authorization.

Proposed `CORE_FOR_DEFENSE` capabilities at their currently accepted evidence levels:
- responsive web-based CampusNav experience
- GF–5F source-aligned spatial foundation, one canonical spatial dataset, A* routing, 2D/3D, and multi-floor navigation
- QR checkpoint positioning and manual-location fallback
- Facilities directory/navigation and Dashboard
- Auth/RBAC, Admin CMS, and accepted Supabase/Auth/RLS/Realtime foundation
- academic schedule/personnel engine and personnel-availability logic with `SCHEDULED != CHECKED_IN`
- strict Emergency Mode using only verified/emergency-approved data, including rejected non-approved edges and safe no-route/error behavior

Scope boundaries:
- A* is navigation/pathfinding logic and is not AI
- grounded server-side CLARA/Groq and PWA/offline emergency caching are `CONDITIONAL / DEFERRED PENDING ADVISER DIRECTION`
- the current conservative/local CLARA matcher may be shown only at its documented evidence level and is not grounded production AI, a production-ready LLM integration, or a completed AI assistant
- AR Guidance remains `PROPOSED / OPTIONAL / DEFERRED / NOT_IMPLEMENTED / NOT_READY` and is not required for the proposed defense baseline
- reports/analytics, advanced map editor/version rollback, GPS/BLE/Wi-Fi/UWB positioning, hardware presence, native AR/SLAM/VPS, push/SMS, photorealistic 3D, and unrelated dependency upgrades remain optional/deferred unless the adviser explicitly requires them

Defense-data policy:
- only data supported by canonical provenance and authority evidence may be called verified institutional data
- clearly labeled `DEMO`, `SAMPLE`, or equivalent data may demonstrate supported workflows
- unknown data may remain unavailable or pending verification and must not be invented
- demo data is not official/live/current institutional truth, verified personnel presence, or verified emergency truth
- emergency demonstration is limited to strict routing behavior and currently verified/source-aligned data; complete institutional coverage, safety-authority approval, and complete official evacuation coverage are not claimed
- schedule/personnel demonstrations preserve canonical status precedence and require clear demo labeling where records are not institutional truth

The formal tablet-based versus responsive-web title, final adviser scope confirmation, grounded CLARA/PWA requirement, defense-data-policy acceptance, and research/evaluation methodology remain `ADVISER_APPROVAL_REQUIRED`.

## DEC-PWA-001 — Owner-directed installability and offline 2D engineering scope
**Status:** OWNER AUTHORIZED FOR ENGINEERING / ADVISER DEFENSE CONFIRMATION STILL REQUIRED — 14 Oct 2026

The owner authorizes a separate, optional, cross-cutting PWA engineering workstream. This authorization is independent of the unanswered adviser decision about whether PWA capability belongs in the final-defense scope. It does not select an adviser answer, claim adviser approval, or change implementation status before code and tests provide evidence. Section 4 of `75-adviser-confirmation-package.md` remains the unanswered academic decision form.

Proposed first-release boundary:
- complete manifest identity, approved app icons, Android installation, iPhone/iPad Add to Home Screen guidance, and standalone launch behavior
- versioned public app-shell and canonical 2D navigation caching using the existing spatial dataset and A* engine
- manual positioning and supported offline SPA reload/deep links
- network-only operational data in the initial release, with `UNKNOWN`/unavailable behavior and no stale `OPEN_NOW`, `CLOSED`, personnel-presence, suspension, or current-advisory claims
- optional QR decoder and 3D bundles cached only after explicit use or approved opt-in
- no offline Admin mutation, background write queue, authenticated-response/token cache, crowd inference, unverified accessible routing, or offline Emergency route claim

Approved engineering direction, subject to dependency review and acceptance evidence:
- use `vite-plugin-pwa` with Workbox `injectManifest` for a root-scoped custom worker, build-revisioned public-static caching, an explicit API/auth denylist, controlled old-cache cleanup, and user-controlled updates
- retain a handwritten worker as the alternative, while recognizing that the repository's Vite-hashed lazy chunks would require custom build-manifest and lifecycle handling
- create a dedicated monochrome CampusNav app mark derived from approved CampusNav branding; do not distort the SCC seal or crop the social-sharing image

Offline Emergency navigation remains `BLOCKED` and outside this proposal pending verified route coverage, approved cross-floor transitions, verified contacts, approved emergency-data versioning, and authorized safety release/invalidation ownership. Ordinary A* routes remain forbidden as emergency substitutes.

The proposed work packages in `75` are planning labels, not new canonical phase numbers. Owner-controlled engineering may proceed through the authorized PWA workstream once each slice satisfies `72-definition-of-ready.md`; adviser confirmation still controls thesis/defense classification and claims, not this optional engineering authorization.

**Engineering outcome — 14 Oct 2026:** The owner-authorized workstream is `COMPLETE — ACCEPTED_WITH_ADVISORY`. CampusNav now has complete install identity, a bounded Workbox `injectManifest` worker, offline canonical 2D navigation using the existing data/graph/A* engine, manual positioning, conservative network-only operational data, explicit update UX, and tested optional 3D/QR script cache-on-use boundaries. Local production-build Chromium verified service-worker control, offline facility/spatial fallback, offline multi-floor routing, optional 3D reuse, Emergency blocking, and fail-closed Admin behavior. Physical-device installation/camera tests, iOS/iPadOS, non-Chromium browsers, screen-reader acceptance, and production deployment equivalence remain separate evidence boundaries. Every adviser choice remains unanswered; this outcome does not make PWA thesis-core or adviser-approved.

## DEC-PWA-002 — Owner-approved installed-app icon
**Status:** OWNER APPROVED / IMPLEMENTED_VERIFIED — 14 Oct 2026

The owner selected the supplied 1254×1254 monochrome `CampusNav St. Clare College Icon.png` (SHA-256 `2CFBF3EAA8E5967AACB20B476A60A12144AC66F299A6BCB2E1025F6F69358779`) as the CampusNav installed-app identity. Launcher assets use only the rounded-square building/navigation illustration; the separate `CampusNav` wordmark is not reduced into small launcher icons.

The illustration is deterministically cropped from source rectangle `(227,143,800,800)` without redrawing, tracing, stretching, or AI approximation. The standard 192×192 and 512×512 icons fill the square; the 512×512 maskable icon places the same illustration at `(64,64,384,384)` on an opaque white background so its pin, walkway, building, and school-name details remain inside representative adaptive masks. The Apple touch icon uses the same approved crop at 180×180.

The inaccurate legacy SVG app mark is retired from the manifest and favicon in favor of the approved PNG asset set. Manifest `id`, name, start URL, scope, display mode, theme/background colors, service-worker/update policy, and offline boundaries are unchanged. The SCC seal and `campusnav-og.png` remain separate approved assets and are not replaced. Physical Android/iOS installation and launcher-cache refresh behavior remain device-level advisories; this owner decision does not resolve the pending adviser/defense classification in `DEC-PWA-001` or `75-adviser-confirmation-package.md`.

## DEC-ROADMAP-002 — Phase 4 product-completion reprioritization
**Status:** OWNER APPROVED — 20 Sep 2026

The owner reprioritizes active software development toward building a more complete functional CampusNav system. The next canonical implementation phase is **Phase 4 — Core Facility & Service Workflow Completion**.

Decision boundaries:
- software/product completion is the active development priority; waiting for adviser confirmation is no longer the active software-development workstream
- `75-adviser-confirmation-package.md` remains `PREPARED / AWAITING_ADVISER_CONFIRMATION` as preserved external-decision material and is not adviser-approved
- adviser waiting does not block safe owner-controlled engineering that preserves pending/unavailable states and clearly labeled `DEMO` / `DEVELOPMENT` fixtures
- official facility hours, services, mappings, contacts, photographs, department ownership, personnel facts, and emergency facts must not be fabricated
- Phase 1 remains `COMPLETE`; Phase 2 and Phase 3 remain `COMPLETE — ACCEPTED_WITH_ADVISORY`; their historical evidence is not reopened or rewritten
- Phase 4 Supabase facility data is an **operational overlay** keyed by existing canonical local facility IDs; it is not a second facility identity system, spatial dataset, navigation truth, or routing system
- existing geometry, nodes/edges, A*, QR/manual positioning, emergency-approved-only routing, and schedule/personnel truth rules remain controlling
- grounded CLARA, PWA/offline, AR Guidance, reports/analytics, advanced map editing, GPS/BLE/UWB, push/SMS, the Claude redesign, and dependency upgrades remain outside Phase 4

Only **Phase 4-FS-1 — Facility Operational Data and Service Foundation** is the exact next implementation subphase. This decision adopts and sequences the phase; it does not implement FS-1 or claim adviser, institutional, safety-authority, or academic approval.

## DEC-FAC-001 — Public configured service locations, separate from search relevance

**Status:** OWNER AUTHORIZED — 15 October 2026

The owner authorizes deterministic configured service-to-facility recommendations on the existing `/facilities` discovery surface, with automatic Git completion after passing readiness and quality gates. This scoped functional addition is permitted under the existing UI freeze; it does not authorize a redesign or require another routine visual approval.

Use only approved public/effective service and explicit mapping chains to existing canonical facility IDs. Reuse the accepted FS-1B ordering contract: ascending `recommendation_rank`, then stable facility-ID ties. Present “Configured locations for this service” and administrator-defined order separately from unchanged search matching/relevance. No relationship inference, AI/ML, popularity/distance/crowd/accessibility/status reranking, or live-availability claim is authorized. Missing/DEMO/pending data remains unavailable/excluded; no institutional data is seeded. Operational labels and canonical routing truth remain independent.

The implementation reuses the existing seven public projection reads, snapshot completeness guards, discovery normalization/matcher, status evaluator, and card/actions. Dynamic recommendations remain network-only and disappear offline. Schema/RLS/grants/audit/Auth/Admin/provider queries, worker policy, spatial/navigation/Emergency/mobility, media, GlobalSearch/DestinationSearch, CLARA, FS-5/FS-6, and adviser/academic claims are unchanged. Broader unified ranking and later consumers remain separately gated. See `13`, `18`, `32`, `63`, and `73` for contract and implementation evidence.

## DEC-FAC-002 — Service-aware destination selection for Home and Navigate

**Status:** OWNER APPROVED — 15 October 2026

The owner explicitly chooses to implement, rather than defer, FS-4 DestinationSearch service resolution on Home and Navigate. This is an approved functional addition within the frozen monochrome UI. It reuses the accepted public discovery matcher, explicit eligible service mappings, shared memory-only snapshot, canonical destination identities and existing selection callbacks. It does not supply official institutional data or complete overall FS-4.

DestinationSearch preserves its existing direct-facility exact/prefix/word-prefix/substring/category/floor order and selected-name/empty browse mode. Service-derived choices remain distinguishable and use the accepted service-name exact/prefix/substring and exact normalized approved-alias tiers, stable service-code ties and canonical dataset order. Canonical overlaps appear once with service explanations retained; capped-out direct matches may appear in Services so no mapped choice is concealed. This is consumer-local composition, not unified cross-consumer ranking or administrator `recommendation_rank` relevance.

Only canonical navigable facilities with existing entrance nodes are selectable. Zero eligible mappings produces an honest no-configured-navigable-destination state. One or multiple service locations still require deliberate selection; no service name becomes a destination or starting point. Existing direct exact-facility query compatibility remains. Home passes the established `?facility=<id>` destination deep link. Mounted Navigate preserves confirmed origin, QR/manual confirmation and session Standard/Avoid Stairs, clears obsolete route output and never starts navigation automatically.

Dynamic service relationships remain network-only; offline retains local canonical lookup and valid bundled-graph navigation. No schema/provider query/security/Auth/Admin/worker-policy/dependency/spatial/engine/Emergency/CLARA change, seeding, Personnel, broader ranking, or FS-5/FS-6 work is authorized. Adviser/institutional/device acceptance remains separate. `07`, `18`, `32`, `63`, and `73` record implementation contracts/evidence; earlier slice exclusions remain historical.

**Reason:** complete the remaining owner-selected destination consumer without duplicating discovery/routing truth or guessing service locations. Automatic verified Git delivery and safe current-task cleanup follow `53`.

## How to add a decision
Use:
- ID
- date if known
- status
- decision
- reason
- supersedes/affected files if relevant

## DEC-DOC-001 — One documentation gateway for coding agents
**Status:** APPROVED DOCUMENTATION CONVENTION — 15 Sep 2026

Repository `AGENTS.md` should point to `CampusNav_content/00-agent-entrypoint.md`. The agent entrypoint then selects baseline + task-specific contracts. This prevents copying a large, drifting architecture block into multiple agent files.

**Owner-directed Git lifecycle extension — 15 October 2026:** The owner establishes mandatory task branches and a one-active-authoritative-worktree default, with isolation only when genuinely needed. After successful required verification, agents automatically complete exact staging, commit, fast-forward-only integration, post-merge checks, push, and safe cleanup of the current task's merged local branch/disposable temporary worktree, then return to clean synchronized main. Existing review/protection, task restrictions, secret safety, protected stashes, and unrelated/unique work take precedence over cleanup. Legacy cleanup requires separate audit/authorization. `AGENTS.md` carries only the mandatory summary; `53-git-workflow.md` is the single complete operational procedure. This is owner-authorized repository governance, not a new product decision/phase or a background cleanup implementation; no new decision ID is introduced.

## DEC-DOC-002 — Separate requirement truth from implementation truth
**Status:** APPROVED DOCUMENTATION CONVENTION — 15 Sep 2026

Architecture/source documents define required behavior. Running code/tests plus `63-implementation-status-registry.md` define what is actually implemented. A requirement does not prove completion, and an implementation gap does not silently delete a requirement.

## DEC-DOC-003 — Unknown institutional/research policy remains unresolved, not guessed
**Status:** APPROVED DOCUMENTATION CONVENTION — 15 Sep 2026

When the supplied sources do not define a final data owner, retention period, research evaluation instrument, or other institutional policy, document the gap in `64`/`70` instead of presenting a common practice as an approved school requirement.

## DEC-ROADMAP-001 — Canonical development roadmap reset
**Status:** OWNER APPROVED — 15 Sep 2026

The active development roadmap restarts at **Phase 1 — Canonical Documentation Alignment and Repository Baseline**. This is a process and phase-numbering reset only, not a code reset. Existing navigation, 3D, QR, Emergency, Dashboard, Supabase, Admin, and academic/personnel work must be preserved and mapped to the canonical contracts before further implementation.

Phase 8C.2 work already present in the worktree remains preserved as existing implementation evidence, but it is not considered complete under the reset roadmap until a future approved phase performs the required database, live-cloud, browser/device, and acceptance verification. Phase 2 must be explicitly approved before implementation begins.
