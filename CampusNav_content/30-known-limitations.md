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

Navigate now exposes Standard and Avoid Stairs using the accepted engine. With the current sole cross-floor connector recorded as stairs, cross-floor `AVOID_STAIRS` fails safely and never substitutes a stair route. It is not a wheelchair/step-free accessibility claim. Institutionally verified non-stair connector/accessibility data remains pending; step-free/wheelchair, crowd-aware, and accessible Emergency routing remain BLOCKED. Preference changes restart route steps from the confirmed origin, not an inferred live position. Local Chrome and simulated QR-resolver evidence does not certify physical camera/device, iOS/Safari/Firefox, screen-reader, or WCAG behavior.

## Operating hours / schedules
Facility hours, class schedules, and staff assignments are only as reliable as the approved school data supplied and maintained.

## Public service discovery and configured recommendations
FS-4 is `COMPLETE / ACCEPTED_WITH_ADVISORY / OWNER AUTHORIZED` as of 16 October 2026 (`DEC-FAC-003`, evidence in `63`/`73`). The `/facilities` service/alias/configured-recommendation and GlobalSearch/DestinationSearch Services capabilities are verified with synthetic public-projection fixtures; official service/mapping completeness remains unverified. Only approved public/effective non-DEMO services, exact approved aliases, and explicit eligible mappings participate. Pending/DEMO service/mapping records are excluded; operational demo/pending labels remain independently visible. Configured rank/facility-ID order is administrator metadata, not AI or search relevance. Status/distance never rerank it. Missing mappings produce no destination; identical duplicates collapse and conflicting configured duplicates fail closed. Search consumers preserve canonical overlap explanations and explicit choices; none exposes configured rank as relevance. Personnel GlobalSearch remains a separate unimplemented personnel-domain integration. Broader unified ranking and partial/fuzzy aliases are deferred, not completed. Media and Dashboard/Realtime remain later unstarted Phase 4 work.

Facilities, GlobalSearch and activated Home/Navigate destination pickers share an active memory-only snapshot. Closing the last consumer releases records/indexes/timers; opening a new active session reloads. Overlapping consumers coalesce; offline/invalidation rejects late responses. Mounted-Map selection/handoff preserves origin/preference/confirmation and does not start a route. GlobalSearch's modal is locally Chrome-tested, including native/fallback fullscreen. DestinationSearch preserves its legacy direct-facility ranker and uses separate service grouping, not unified cross-consumer relevance. Its populated, empty, failure, viewport, preference, 2D/3D and simulated QR cases passed locally; camera/QR hardware, real software keyboards, physical devices, non-Chromium, screen readers and WCAG certification are not established.

Discovery reads three capped public projections once per load/revalidation, not per keystroke. A projection reaching 1,000 rows fails closed and requires a separately authorized pagination extension. Operational records are network-only. An uncached backend-client script failing during offline reload may need the explicit Reload page recovery after reconnection; it is not added to the service-worker cache. Normal reconnect without reload revalidates automatically. Browser evidence is local headless Chrome, not physical-device, Safari/Firefox, screen-reader, broad performance, or WCAG certification. Intentionally induced transport failures are recorded separately from unexpected console/page errors.

## Class suspensions
AI does not declare suspensions. Official status must come from authorized school administration.

## CLARA
CLARA now has a locally verified deterministic FAQ/campus-tool foundation with stable source display and an explicitly disabled provider interface. It is not a completed generative assistant: the production FAQ collection is empty pending institutional approval; role-aware private tools, current event/announcement/suspension/personnel integrations, and a live provider remain unavailable. Gemini public activation is blocked by the currently published under-18 audience terms. Offline CLARA remains unavailable and conversations/provider responses are not cached. See `76`.

Read-only production observation on 16 October confirms the grounded CLARA UI, stable Library source IDs/actions and safe unavailable answers, with zero external AI calls or unexpected errors in the inspected session. Production serves `index-rYEQVvGN.js`, not expected/local `index-CI2O9ZNl.js`; byte-for-byte build equivalence and the cause of variation are unproven. No privileged/provider key was detected in loaded first-party scripts, not a universal credential audit. No deployment/configuration change was made.

## PWA/offline
The owner-authorized PWA supports installability and locally browser-verified offline canonical 2D navigation after an initial successful online load. Operational/provider data remains network-only and becomes `UNKNOWN` or unavailable when current data cannot be fetched. Offline Emergency routing is not implemented or authorized. Physical Android/iOS installation, physical camera/QR, iOS/iPadOS, non-Chromium, screen-reader, low-end-device, and broad storage-eviction behavior are not certified; adviser/defense classification remains pending.

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
- Admin screens, including `/admin/facilities`, `/admin/services`, `/admin/service-aliases`, `/admin/facility-service-mappings`, `/admin/facility-hours`, and `/admin/facility-hour-exceptions`, have deterministic/Vite fixture evidence rather than live Supabase data or real-account mutation evidence. The hours/exceptions routes additionally passed headless Chrome QA with a development-only intercepted network fixture at the required responsive widths; real authenticated Supabase mutation, Firefox, Safari/WebKit, and physical-device QA remain pending
- the owner supplied visual/functional sign-off for the frozen UI direction, final single Admin navigation shell, FS-3C aliases/mappings UI, weekly-hours UI, and dated-exceptions UI. The single shell and editor behavior also passed headless Chromium fixture QA. No browser, OS, physical-device, screen-reader, credential, or live-mutation details are inferred from those sign-offs
- the reused legacy facility-advisory CRUD remains intentionally unchanged under FS-3. It uses confirmed deletion plus existing RLS, constraints, and trusted audit, but not the newer FS-3 optimistic `updated_at` stale-token pattern
- no deployment-equivalence claim exists for the FS-3 revision
- the Admin navigation lists about 20 sections for `SUPER_ADMIN`, so on laptop-height screens the section list scrolls inside the sidebar; it keeps its position and the current section in view
- inside Admin there is no universal-search button; the Ctrl/⌘ K shortcut still opens it, and "Back to CampusNav" returns to the public pages where the search control is
- `/admin/qr-checkpoints` is a developer-only tool (hidden and disabled in production builds unless `VITE_ENABLE_MAP_VERIFICATION=true`); its route requires a signed-in `SUPER_ADMIN`. It is not a production Admin feature
- QR camera start/stop and error states were verified with a simulated camera; scanning a printed checkpoint with a real camera has not been re-verified since Phase 3
- CLARA's behaviour with a phone's software keyboard was simulated, not observed on a device
- in dark mode the 2D map inverts lightness while preserving hue, so rendered map colors differ from the light-mode hex values; the legend follows the same treatment
- as of the FS-3 final reconciliation on 6 October 2026, `npm audit` reports 17 open advisories (8 moderate, 9 high, 0 critical), while `npm audit --omit=dev` reports 11 (5 moderate, 6 high). Vite has a non-major remediation, React Router requires a deliberate major upgrade, and the Tailwind dependency chain has no complete automated fix; none was changed by the documentation-only reconciliation

## Map interaction and fullscreen verification limits
- 2D drag, wheel, keyboard, and synthetic touch pan/pinch, 3D orbit/pan/zoom, and fullscreen (native Fullscreen API and the overlay fallback) were verified in headless Chromium only; trackpad gestures and real touch hardware (phones, tablets) have not been exercised
- iPhone Safari offers no element fullscreen, so it uses the fixed full-viewport overlay; this fallback was verified by disabling the Fullscreen API in Chromium, not on an iPhone
- 3D rotation has no keyboard equivalent; keyboard users have the zoom, fit, reset, floor-focus, and facility-focus buttons and the full 2D map
- WebGL 3D was rendered with a software renderer (SwiftShader); frame rate and memory of the 3D Home preview on low-powered devices are not measured
- the operational facility status (`getFacilityStatus`) is still not shown on the map or the previews

## Owner visual refinement limits (4 October 2026)
- The Home coverage strip states dataset coverage only: the mapped floor range, the facilities placed on the map, the positioning methods, and the 2D/3D views. It does not claim verified physical dimensions, live availability, or usage.
- The refined Home, Dashboard, and Facilities layouts were verified in headless Chromium only. The recorded frozen-UI owner sign-off does not establish Firefox, Safari/WebKit, or physical-device certification for these later refinements.

## Source basis
- CampusNav AI Final Expanded Architecture — thesis feasibility/claims boundaries
- CampusNav Project Source Reference — limitations, verification, emergency/accessibility restrictions
