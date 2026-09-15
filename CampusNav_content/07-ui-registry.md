# CampusNav AI — UI Registry

## Purpose
This file is the compact UI source-of-truth for CampusNav. It tells Codex/Claude which screens, reusable components, visual states, map controls, image slots, and interaction patterns already exist or are expected.

Use this together with `06-ui-ux-guidelines.md`:
- `06-ui-ux-guidelines.md` = visual/UX rules.
- `07-ui-registry.md` = actual UI inventory and component responsibilities.

Do not duplicate business logic in UI components. UI must consume the existing services, routing state, Supabase providers, and navigation engine.

---

## 1. Primary app screens

| Surface | Purpose | Important UI behavior |
|---|---|---|
| Home | Entry point and campus overview | Branded hero, quick access, campus highlights, CLARA entry points |
| Dashboard | Centralized campus information hub | Alerts, classes, office/personnel availability, advisories, events, announcements, navigation notices |
| Facilities | Campus directory | Search, category filters, floor filters, facility cards |
| Facility Detail | Facility-specific information | Photo/gallery slot, status, hours, services, personnel/schedule, Navigate/Ask CLARA |
| Navigate | Core campus navigation | Current location, destination, QR, floor selector, 2D/3D, route summary |
| Emergency | Verified safety information | Emergency guidance, contacts, Emergency Mode entry |
| Events | Campus event browsing | Today, upcoming, venue navigation |
| CLARA | Intelligent digital concierge UI | Conversation + structured facility/personnel/schedule/result cards |
| Login | Supabase authentication | Email/password, sanitized errors, branded school identity |
| Admin | Protected CMS shell | Role-aware navigation and content management |

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
Current project decision: the map may use controlled category colors for readability, even though the original master source was grayscale-only. This is a deliberate local UI override recorded in `29-decision-log.md` (`DEC-UI-001`). Do not extend this into unrestricted app-wide color use.

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
- Desktop: 1440px class
- Laptop: 1024px class
- Tablet: 768px class
- Mobile: ~390px class

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
