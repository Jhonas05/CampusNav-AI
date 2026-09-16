# CampusNav AI — UI Registry

## Purpose
This file is the compact UI source-of-truth for CampusNav. It tells Codex/Claude which screens, reusable components, visual states, map controls, image slots, and interaction patterns already exist or are expected.

Use this together with `06-ui-ux-guidelines.md`:
- `06-ui-ux-guidelines.md` = visual/UX rules.
- `07-ui-registry.md` = actual UI inventory and component responsibilities.

Do not duplicate business logic in UI components. UI must consume the existing services, routing state, Supabase providers, and navigation engine.

---

## Approved design-system baseline

`DEC-UI-002` establishes CampusNav Ink / architectural blueprint as the application-wide presentation baseline. The implementation must use centralized neutral, CampusNav green, emergency red, typography, geometry, border, and motion tokens rather than copying bundled artifact markup or inline styles.

| Pattern | Visual structure | Required behavior/accessibility | React mapping |
|---|---|---|---|
| Application shell | Off-white canvas, charcoal typography, thin borders, clear desktop/mobile navigation | Current route exposed; keyboard access; mobile navigation preserved | `AppLayout`, `Navbar`, `MobileTabBar` |
| Blueprint panel | Sharp bordered surface with optional corner registration marks | Decorative marks hidden from assistive technology; caller supplies content semantics | shared CampusNav UI primitive |
| Kicker / section label | Compact uppercase condensed label with tracking | Never substitutes for a semantic heading | shared CampusNav UI primitive |
| Primary action | CampusNav green fill, high-contrast label, compact radius | Visible hover, active, focus, loading, and disabled states | shared button primitives and page actions |
| Emergency action | Emergency red with icon/text reinforcement | Red is never the only signal; confirmation where destructive | Emergency surfaces and destructive action variants |
| Data/status chip | Neutral or controlled semantic color, compact technical shape | Text or icon states meaning explicitly | shared badge/status primitives |
| Map frame | Blueprint panel surrounding the existing 2D/3D renderer | One spatial dataset and one A* engine; 2D fallback; map legend; color-independent cues | Navigate map components |
| Dialog/drawer | Bordered neutral surface with restrained elevation | Focus management, close behavior, and labelled title | existing dialog/sheet primitives |

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
| Emergency `/emergency` | Emergency contacts, procedures, approved evacuation assistance | High-priority red-accented blueprint panels without decorative urgency | Existing verified emergency contacts, procedures, and emergency-approved graph only | Red reinforced with icons/headings/text; immediate keyboard/touch access | ACCEPTED_WITH_ADVISORY — automated desktop render and safety regressions passed; manual device QA pending |
| CLARA `/clara` | Current concierge placeholder and suggested prompts | Calm conversational panel with clear capability boundary | Existing placeholder/local behavior; not final grounded Groq/tool integration | Messages and controls labelled; limitations visible | PARTIAL — presentation only; final grounding deferred |
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
- `src/pages/Clara.jsx`
- `src/pages/Login.jsx`

---

## 2. Global shell registry

### `AppLayout`
Path: `src/components/layout/AppLayout.jsx`

Responsibilities:
- Global page shell
- Desktop/mobile composition
- Main navigation placement
- Shared page spacing

### `Navbar`
Path: `src/components/layout/Navbar.jsx`

Responsibilities:
- School logo / CampusNav branding
- Main navigation
- Search
- Notifications
- Profile/account entry

### `MobileTabBar`
Path: `src/components/layout/MobileTabBar.jsx`

Recommended primary mobile tabs:
- Home
- Dashboard
- Navigate
- CLARA
- More

Emergency must remain easy to access.

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
- Navbar
- Login
- Home hero
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
- `public/branding/scc-logo.jpg`

Social preview asset convention:
- `public/branding/campusnav-og-*.png`

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
- Use the wide application shell for data-heavy Home, Dashboard, Facilities, Navigate, Events, Emergency, CLARA, and Admin surfaces; keep focused flows such as Login and readable prose intentionally narrower.
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
