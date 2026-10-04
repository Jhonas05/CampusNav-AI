# CampusNav AI — Known Limitations and Claims Boundary

## Why this file exists
These are not defects to hide. They protect the thesis from overclaiming and keep development feasible.

## Indoor positioning
CampusNav does **not** claim exact continuous indoor tracking from QR/manual positioning.
- QR = exact to the checkpoint when scanned
- manual = exact to the user-selected location
- GPS is weaker indoors
- BLE needs hardware/calibration
- UWB is future/high-cost

## 3D mapping
CampusNav does not need Google-level photorealistic 3D. The thesis target is an interactive, data-driven campus-specific 3D representation tied to verified floor-plan geometry.

## Pathfinding vs AI
A* routing is standard pathfinding, not the AI contribution. CLARA is the intelligent conversational component.

## Emergency
CampusNav does not autonomously invent evacuation routes. If verified emergency data is missing, it must defer to posted plans and authorized personnel.

## Personnel presence
A schedule does not prove that a person is physically in a room. Confirmed presence requires authorized check-in/presence integration.

## Crowd levels
Do not claim real-time crowd information unless an actual verified data source exists.

## Accessibility
Do not invent elevators, ramps, accessible entrances, or accessible restrooms. Unverified infrastructure remains pending/unavailable.

## Operating hours / schedules
Facility hours, class schedules, and staff assignments are only as reliable as the approved school data supplied and maintained.

## Class suspensions
AI does not declare suspensions. Official status must come from authorized school administration.

## CLARA
CLARA should not be considered complete until it is connected to stable internal services, role-aware authorization, and verified source data.

## PWA/offline
The master source requires PWA-capable offline emergency access, but implementation must be verified before claiming it in the thesis demo.

## Advanced map administration
A full visual floor-plan editor/version rollback is source-required/valuable but may remain a scoped roadmap item if not completed by final thesis, provided the implemented navigation remains accurate and maintainable.

## Formal title mismatch risk
Proposal wording is tablet-based, while current architecture is responsive web-based. This should be explained as broader device compatibility, not hidden. Any formal title revision should go through thesis approval.

## Monochrome shell adoption verification
The application-wide visual direction is governed by `DEC-UI-003` (left sidebar, floating CLARA, grayscale chrome).

- application chrome is grayscale in both Light and Dark themes (`DEC-UI-004`); the 2D/3D map canvas keeps its semantic wayfinding colors
- decorative motion (route motifs, campus graph) is conceptual and never represents a real route, live activity, or navigation history; the Home and Dashboard maps are the real CampusNav map, not decoration
- color must not be the only signal
- headless Chromium renders at 1440, 1366, 1280, 1024, 820, 768, 430, and 390px in Light and Dark were inspected for the integrated build; real-device/browser confirmation and live authenticated Admin visual QA remain pending

## UI freeze verification limits (`DEC-UI-005`)
- automated UI evidence for the frozen pass and for its integration onto the Phase 4-FS-3B baseline is headless Chromium only; Firefox, Safari/WebKit, and physical phones/tablets have not been tested
- Admin screens, including `/admin/facilities`, `/admin/services`, `/admin/service-aliases`, and `/admin/facility-service-mappings`, have deterministic/Vite fixture evidence rather than live Supabase data or real-account mutation evidence; real authenticated browser, Firefox, Safari/WebKit, and physical-device QA remain pending
- the single Admin navigation shell (Admin sidebar, Admin menu drawer, "Back to CampusNav", and the theme, notification, and account controls in it) and the editor error placement were verified in headless Chromium with a QA network fixture; the owner's live authenticated `SUPER_ADMIN` reviews predate it and should be repeated
- the Admin navigation lists about 20 sections for `SUPER_ADMIN`, so on laptop-height screens the section list scrolls inside the sidebar; it keeps its position and the current section in view
- inside Admin there is no universal-search button; the Ctrl/⌘ K shortcut still opens it, and "Back to CampusNav" returns to the public pages where the search control is
- `/admin/qr-checkpoints` is a developer-only tool (hidden and disabled in production builds unless `VITE_ENABLE_MAP_VERIFICATION=true`); its route requires a signed-in `SUPER_ADMIN`. It is not a production Admin feature
- QR camera start/stop and error states were verified with a simulated camera; scanning a printed checkpoint with a real camera has not been re-verified since Phase 3
- CLARA's behaviour with a phone's software keyboard was simulated, not observed on a device
- in dark mode the 2D map inverts lightness while preserving hue, so rendered map colors differ from the light-mode hex values; the legend follows the same treatment
- `npm audit` advisories for `react-router` (requires a major upgrade) and build-tool dependencies remain open

## Map interaction and fullscreen verification limits
- 2D drag, wheel, keyboard, and synthetic touch pan/pinch, 3D orbit/pan/zoom, and fullscreen (native Fullscreen API and the overlay fallback) were verified in headless Chromium only; trackpad gestures and real touch hardware (phones, tablets) have not been exercised
- iPhone Safari offers no element fullscreen, so it uses the fixed full-viewport overlay; this fallback was verified by disabling the Fullscreen API in Chromium, not on an iPhone
- 3D rotation has no keyboard equivalent; keyboard users have the zoom, fit, reset, floor-focus, and facility-focus buttons and the full 2D map
- WebGL 3D was rendered with a software renderer (SwiftShader); frame rate and memory of the 3D Home preview on low-powered devices are not measured
- the operational facility status (`getFacilityStatus`) is still not shown on the map or the previews

## Owner visual refinement limits (4 October 2026)
- The Home coverage strip states dataset coverage only: the mapped floor range, the facilities placed on the map, the positioning methods, and the 2D/3D views. It does not claim verified physical dimensions, live availability, or usage.
- The refined Home, Dashboard, and Facilities layouts were verified in headless Chromium only. Owner visual sign-off, Firefox, Safari/WebKit, and physical-device review remain pending.

## Source basis
- CampusNav AI Final Expanded Architecture — thesis feasibility/claims boundaries
- CampusNav Project Source Reference — limitations, verification, emergency/accessibility restrictions
