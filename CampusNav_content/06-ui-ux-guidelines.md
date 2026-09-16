# CampusNav AI — UI/UX Guidelines

## Visual direction
CampusNav uses the owner-approved **CampusNav Ink / architectural-blueprint** presentation baseline defined by `DEC-UI-002`.

- neutral-dominant off-white, charcoal, and grayscale application surfaces
- CampusNav green for primary actions, active navigation, and verified positive states
- emergency red reserved for emergency, destructive, and urgent meanings
- controlled semantic map colors for wayfinding, with non-color reinforcement
- sharp geometry and compact radii rather than soft consumer-app cards
- thin technical borders and restrained shadows
- compact uppercase kickers and section labels with deliberate tracking
- selective blueprint registration marks on map, route, summary, and important shell panels
- dense but readable information hierarchy
- minimal, purposeful animation with reduced-motion support
- map/navigation remains the visual centerpiece
- avoid generic LMS/admin-template appearance

## Branding
- use St. Clare College logo tastefully in navbar/login/home/admin shell where appropriate
- use the owner-approved transparent high-resolution `public/branding/scc-logo.png` as the current institutional logo asset
- support office/lab/classroom/facility photos and galleries
- use polished placeholders when an image is unavailable

## Color decision
The earlier strict grayscale / Apple-only direction and map-only color exception are superseded where they conflict with `DEC-UI-002`. Restraint remains mandatory: neutral surfaces dominate while green, red, and map/status colors communicate specific meaning.

Even when colors are used:
- never rely on color alone
- restricted/construction/emergency states need icon/pattern/text treatment
- contrast and accessibility must remain strong

## Canonical presentation tokens
Centralize tokens in the application theme layer and consume them through reusable components or semantic utility classes.

- page background: approximately `#f2f2f3`
- raised/sunken surface: approximately `#e9e9ea`
- primary text/ink: approximately `#1d1f20`
- neutral ramp: approximately `#f5f5f8`, `#e7e7ea`, `#d4d4d7`, `#b7b7ba`, `#98989b`, `#7a7a7d`, `#5d5d60`, `#424244`, and `#2b2b2d`
- primary CampusNav green: `#15703c`
- primary hover/pressed green: `#0f5a2f`
- emergency red: `#b3261e`
- small/medium/large radii: approximately `2px`, `4px`, and `7px`
- borders are the main structural device; shadows provide subtle elevation only

## Typography
- readable interface/body type: Archivo with system-sans fallbacks
- architectural display/section type: Barlow Condensed with Archivo and system fallbacks
- headings may use heavier weights and condensed proportions but must remain legible at narrow widths
- kickers and labels may be uppercase with increased letter spacing; paragraphs must not use all caps
- font delivery must use legal, maintainable open-source packages or safe fallbacks; bundled reference fonts must not be extracted

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

## 3D labels
- full building: floor labels only
- selected floor: major facility labels
- close zoom: room labels
- avoid floating-label clutter

## Dashboard
Primary centralized information surface for:
- priority alerts
- today’s classes
- office availability
- personnel availability
- facility advisories
- events
- announcements
- navigation notices

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
- use subtle route/camera/floor transitions
- support reduced motion
- avoid game-like or excessive animation

## Responsive behavior
Design for desktop, laptop, tablet, and mobile. Mobile map/navigation should use a true bottom-sheet experience rather than a shrunken desktop layout.

- **Laptop-first application density:** application screens should maximize useful viewport area at approximately 1280–1440px widths while retaining readability, hierarchy, accessible controls, and practical touch targets. Use wide application shells, approximately 16–24px laptop gutters, compact application headers, and content-driven grids; keep long-form prose narrower.
- Treat 1280×800 and 1366×768 as primary application-layout conditions, including vertical-height review. Primary Dashboard, Facilities, Navigate, and Admin interactions should appear substantially above the fold without decorative whitespace displacing them.
- Map pages should give the 2D/3D viewport the majority of useful laptop width and height. Prefer a compact 260–320px control rail at laptop widths, while preserving the mobile route-sheet pattern.
- preserve the existing mobile navigation, responsive grids, dialogs, and drawers
- condensed headings must wrap without clipping
- dense blueprint panels must reflow into single-column or horizontally scrollable structures where appropriate
- avoid accidental page-plus-panel double scrolling; contained overflow is appropriate only for deliberate controls, tables, conversations, or map interactions
- device/browser compliance must remain pending unless supported by real graphical/device evidence

## 2D fallback
If WebGL fails or device performance is insufficient, the user must still be able to navigate in 2D with the same current location, destination, and route state.
