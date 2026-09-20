# CampusNav AI — UI Registry

## Purpose
This file is the compact UI source-of-truth for CampusNav. It tells Codex/Claude which screens, reusable components, visual states, map controls, image slots, and interaction patterns already exist or are expected.

Use this together with `06-ui-ux-guidelines.md`:
- `06-ui-ux-guidelines.md` = visual/UX rules.
- `07-ui-registry.md` = actual UI inventory and component responsibilities.

Do not duplicate business logic in UI components. UI must consume the existing services, routing state, Supabase providers, and navigation engine.

---

## Approved design-system baseline

`DEC-UI-002` established CampusNav Ink / architectural blueprint as the application-wide presentation baseline. `DEC-UI-003` supersedes its color rules: normal CampusNav UI is **strictly monochrome** (white, off-white, light/medium/dark gray, black) and is enforced centrally through the remapped Tailwind scales in `tailwind.config.js` and the `--ink-*` tokens in `src/index.css`. Typography, geometry, border, shadow, and motion tokens remain as DEC-UI-002 defined them. Meaning is never carried by shade alone.

| Pattern | Visual structure | Required behavior/accessibility | React mapping |
|---|---|---|---|
| Application shell | Off-white canvas, charcoal typography, thin borders, left sidebar navigation with mobile drawer | Current route exposed; keyboard access; mobile navigation preserved | `AppLayout`, `Sidebar`, `MainHeader`, `MobileNavigationDrawer` |
| Blueprint panel | Sharp bordered surface with optional corner registration marks | Decorative marks hidden from assistive technology; caller supplies content semantics | shared CampusNav UI primitive |
| Kicker / section label | Compact uppercase condensed label with tracking | Never substitutes for a semantic heading | shared CampusNav UI primitive |
| Primary action | Near-black fill (`#1D1D1F`), white label, compact radius | Visible hover, active, focus, loading, and disabled states | shared button primitives and page actions |
| Emergency action | Black fill or heavy black border, always with icon and text reinforcement | Weight/fill is never the only signal; confirmation where destructive | Emergency surfaces and destructive action variants |
| Data/status chip | Neutral fill, border weight, or dashed border; compact technical shape | Text or icon states meaning explicitly | shared badge/status primitives |
| Map frame | Blueprint panel surrounding the existing 2D/3D renderer | One spatial dataset and one A* engine; 2D fallback; map legend; color-independent cues | Navigate map components |
| Dialog/drawer | Bordered neutral surface with restrained elevation | Focus management, close behavior, and labelled title | existing dialog/sheet primitives |

---

## 1. Primary app screens

| Surface / route | Purpose and major components | Approved visual structure | Data source | Responsive/accessibility notes | Status |
|---|---|---|---|---|---|
| Home `/` | Redirects to `/dashboard` — Dashboard is the CampusNav home surface | n/a | n/a | n/a | IMPLEMENTED — `DEC-UI-003` |
| Dashboard `/dashboard` | Home surface: welcome/campus context, global search, quick actions, quick facility access, then today overview, classes, office/personnel availability, advisories | Welcome panel, quick-action row, summary tiles, then dense modular grid with bordered sections | Existing Supabase-backed dashboard services and canonical derived status logic | Cards reflow; availability includes text and never implies presence from schedule alone | ACCEPTED_WITH_ADVISORY — automated desktop render passed; manual device QA pending |
| Facilities `/facilities` | Search, filters, category/floor browsing, facility cards | Technical filter rail and bordered results grid | Existing published facilities; unknown data remains unavailable/pending verification | Search labelled; filters keyboard operable; result state readable | ACCEPTED_WITH_ADVISORY — automated desktop render passed; manual device QA pending |
| Facility Detail `/facilities/:id` | Facility facts, services, hours/availability, nearby facilities, navigation CTA | Blueprint detail header with structured fact and action panels | Existing verified/published facility records only | Semantic labels; no invented room, schedule, or institutional data | ACCEPTED_WITH_ADVISORY — automated desktop render passed; manual device QA pending |
| Navigate `/map` | Start/destination, 2D/3D map, route summary, steps | Blueprint map frame with separate controls and route instruction rail | Canonical spatial dataset, one A* engine, existing route state | 2D fallback, keyboard controls, text steps, non-color cues, reduced motion | ACCEPTED_WITH_ADVISORY — 2D desktop render and 2D/3D regressions passed; manual 3D/device QA pending |
| Events `/events` | Today/upcoming event discovery and details | Calendar/list sections with compact date blocks and bordered entries | Existing published event records | Date/time in text; empty/loading/error states | ACCEPTED_WITH_ADVISORY — automated desktop render passed; manual device QA pending |
| Emergency `/emergency` | Emergency contacts, procedures, approved evacuation assistance | High-priority panels marked by heavy black borders and filled black headers, without decorative urgency | Existing verified emergency contacts, procedures, and emergency-approved graph only | Urgency reinforced with icons/headings/text, never weight alone; immediate keyboard/touch access | ACCEPTED_WITH_ADVISORY — automated desktop render and safety regressions passed; manual device QA pending |
| CLARA (floating assistant) | Concierge available on every shell route through a floating bottom-right button; `/clara`, `/clara?q=`, and `/clara?about=` remain as deep links that open the assistant and return to Dashboard | Floating circular trigger plus an anchored chat panel (bottom sheet on phones) | Existing placeholder/local behavior in `src/lib/claraEngine.js`; not final grounded Groq/tool integration | Messages and controls labelled; Escape closes; limitations visible | PARTIAL — presentation only; final grounding deferred |
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
- Automated desktop renders for Dashboard, Facilities, Navigate, Events, Emergency, and Login were inspected after the token/component adoption.
- After the `DEC-UI-003` shell redesign, headless-browser runs at 1440×900,
  834×1112, and 390×844 confirmed: no console errors, no horizontal overflow at
  any of the three widths, a live 2D route render, 2D↔3D switching with a
  correctly sized R3F canvas, floor switching, sidebar collapse, mobile drawer,
  CLARA open/close/persistence, and no ADMINISTRATION section for guests.
- **AUTOMATED RENDER VERIFIED / MANUAL VISUAL QA PENDING.**

Known page files include:
- `src/pages/Dashboard.jsx`
- `src/pages/Facilities.jsx`
- `src/pages/FacilityDetail.jsx`
- `src/pages/Map.jsx`
- `src/pages/Emergency.jsx`
- `src/pages/Events.jsx`
- `src/pages/Clara.jsx`
- `src/pages/Login.jsx`

---

## 2. Global shell registry

CampusNav uses a **left sidebar application shell**. The former full-width top
navigation and bottom mobile tab bar are retired; primary navigation is the
sidebar on large screens and a slide-over drawer below `lg`.

### `AppLayout`
Path: `src/components/layout/AppLayout.jsx`

Responsibilities:
- Global application shell (fixed sidebar + fluid main workspace)
- Desktop / tablet / mobile composition
- Sidebar collapse state (persisted per browser)
- Mounts the floating CLARA assistant on every shell route

The sidebar is taken out of flow; the workspace reserves its width through
`--app-sidebar-current-width` so collapsing animates and any canvas inside the
workspace resizes from real layout width.

### `Sidebar`
Path: `src/components/layout/Sidebar.jsx`

Responsibilities:
- School logo / CampusNav branding
- Primary navigation (Dashboard, Navigate, Facilities, Schedules, Personnel,
  Events, Emergency)
- Permission-aware ADMINISTRATION section (collapsible)
- Account summary at the bottom

Rendered twice: as the fixed desktop rail and inside the mobile drawer. Composed
from `SidebarItem`, `SidebarSection`, and `UserProfileCard`. Destinations come
from `src/components/layout/navigationConfig.js`, the single source of truth for
navigation chrome.

Selected state must never rely on color alone: it combines a filled dark
surface, a solid leading rail, and `aria-current="page"`. Collapsed (icon-only)
mode exposes each label through a tooltip.

### `MainHeader`
Path: `src/components/layout/MainHeader.jsx`

Compact contextual header for the main workspace. Carries the mobile navigation
trigger, the current page title, global search, and the notification entry
point. It must not repeat the sidebar's destinations.

### `MobileNavigationDrawer`
Path: `src/components/layout/MobileNavigationDrawer.jsx`

Slide-over navigation below `lg`. Holds the same `Sidebar`, traps focus while
open, closes on Escape, on backdrop press, and after a destination is chosen.

Emergency must remain easy to access in every mode.

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
- Sidebar branding (desktop rail and mobile drawer)
- Login
- Admin shell

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

---

## 6. 2D map UI registry

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
- Entire Building
- Reset View
- Animate Route
- Switch to 2D

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
- `src/components/admin/AdminShell.jsx`
- `src/components/admin/AdminContentEditor.jsx`
- `src/pages/admin/AdminOverview.jsx`
- `src/pages/admin/AdminContentPage.jsx`
- `src/pages/admin/AdminAudit.jsx`
- `src/pages/admin/QRCheckpoints.jsx`

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

Admin design rules:
- Same CampusNav identity as public app
- Tables on desktop, stacked cards/rows on mobile
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
- Use the wide application workspace for data-heavy Dashboard, Facilities, Navigate, Events, Emergency, and Admin surfaces; keep focused flows such as Login and readable prose intentionally narrower. Navigate is edge-to-edge so the map dominates.
- Use approximately 16–24px practical gutters, compact page headers, and content-driven grids rather than tablet-like vertical stacking where horizontal space is available.
- Facilities use a compact filter rail plus auto-fitting results grid when space permits. Admin uses a compact navigation rail and wider tables/forms. Navigate uses a compact control rail with the 2D/3D map as the dominant surface.
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
