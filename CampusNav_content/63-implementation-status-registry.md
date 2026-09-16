# CampusNav AI — Implementation Status Registry

## Purpose
Separate **required/design** documentation from what is actually implemented. Update only from code, tests, or live verification. The canonical development roadmap was reset by `DEC-ROADMAP-001`; existing implementation is preserved as baseline evidence and is not automatically complete under the reset roadmap.

## Phase 3 release-candidate consolidation — Checkpoint A — 16 September 2026

**Overall classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Evidence / advisory |
|---|---|---|
| Canonical readiness | `ACCEPTED` | The owner authorized the release-consolidation subset of the canonical "Accepted Baseline Release and Manual QA" phase. Goal, evidence, security/privacy boundaries, migration impact, and quality gates are defined; no new feature was started |
| Phase 8C.2 implementation | `ACCEPTED_WITH_ADVISORY` | The staged candidate is the same preserved implementation accepted during Phase 2 live-cloud testing. Fresh deterministic suites, route rendering, lint, typecheck, and build pass; authenticated graphical Admin QA remains pending |
| Phase 8C.2 migration | `ACCEPTED` | Migration `20260915052147` is present in local/linked order, adds the three required exclusion constraints and consultation-location optionality, and neither creates replacement tables nor drops tables/columns nor changes RLS policies |
| RLS, RBAC, audit, and Realtime | `ACCEPTED_WITH_ADVISORY` | Exact-code Phase 2 evidence covers linked RLS/RBAC, trusted audit writes, authenticated Realtime, role scope, class lifecycle, and cleanup. This consolidation performed no new cloud mutation; the prior one-time Realtime timeout remains a timing advisory |
| Schedule/personnel invariants | `ACCEPTED` | Deterministic and exact-code Phase 2 evidence preserve `SCHEDULED != CHECKED_IN`, authorized active check-in, conflict enforcement, exception handling, precedence, privacy, and overlap-safe next availability |
| Fixture and credential hygiene | `ACCEPTED_WITH_ADVISORY` | Linked fixture audit returned zero across 14 DEVELOPMENT/DEMO categories; the temporary session file is absent/untracked; source/build scans found no real privileged/provider/database/JWT/private-key credential. Intentional rejected-key test canaries remain. Dependency advisories are unchanged |
| Quality gates | `ACCEPTED_WITH_ADVISORY` | All deterministic data/navigation/QR/Emergency/3D/Dashboard/Auth/Admin/Phase 8 suites, route rendering, ESLint, typecheck, and production build passed. Docker pgTAP and manual device/accessibility QA remain unavailable/pending |
| Deployment equivalence | `CONFLICT` | No deployment was performed. Cloudflare production must not be treated as equivalent to this staged release candidate until the exact approved revision is deployed and asset fingerprints are verified |
| Social preview | `DEFERRED` | Metadata and the canonical 1200×630 `campusnav-og.png` were validated as a separate Checkpoint B. The unapproved v3 concept is excluded because it displays unsupported institutional claims |

Checkpoint A is a scoped Git staging boundary, not a release or completion claim. No commit, push, deployment, stash mutation, or Phase 3 feature development was performed.

## CampusNav Ink laptop-space optimization — 16 September 2026

**Overall classification:** `IMPLEMENTED_UNVERIFIED`

| Area | Classification | Evidence / advisory |
|---|---|---|
| Shared density system | `ACCEPTED` | Centralized application width, gutter, page/section spacing, card padding, header height, Admin rail, and map-control-rail tokens are consumed by shared layout primitives |
| Public application surfaces | `ACCEPTED_WITH_ADVISORY` | Home, Dashboard, Facilities, Facility Detail, Events, Emergency, and CLARA use wider shells, compact vertical rhythm, and content-driven laptop grids; route rendering and deterministic regressions pass |
| Navigate 2D/3D shell | `ACCEPTED_WITH_ADVISORY` | Route planning, floor/view controls, summary, and notices occupy a compact laptop rail while the shared 2D/3D map receives the remaining width and viewport-aware height; routing, spatial data, 3D behavior, QR, and Emergency logic are unchanged and their regressions pass |
| Admin density | `ACCEPTED_WITH_ADVISORY` | Admin rail, content gutter, overview grids, filters, table rows, and logically grouped forms are more compact at laptop widths without RBAC/service changes; authenticated graphical workflow was not rerun |
| 1280–1440px visual evidence | `IMPLEMENTED_UNVERIFIED` | Layout rules explicitly target 1280×800, 1366×768, and 1440×900, but no connected graphical browser was available for screenshots or visual inspection |
| Tablet/mobile preservation | `IMPLEMENTED_UNVERIFIED` | Breakpoint fallbacks, mobile navigation, map route sheet, labelled controls, focus styles, and practical control heights remain in code; real tablet/mobile graphical QA was unavailable |
| Behavior preservation | `ACCEPTED` | ESLint, typecheck, production build, route render, and every existing deterministic data/navigation/QR/Emergency/3D/Dashboard/Auth/Admin/Phase 8 suite pass |

**MANUAL DEVICE QA PENDING.** No browser/device support or WCAG conformance claim is added by this refinement.

## CampusNav Ink baseline adoption — 15 September 2026

**Overall classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Evidence / advisory |
|---|---|---|
| Owner decision and source boundary | `ACCEPTED` | `DEC-UI-002` records the CampusNav Ink / architectural-blueprint baseline; the supplied HTML is registered as visual/UX reference only, not runtime or institutional truth |
| Centralized design system | `ACCEPTED` | `src/index.css` defines neutral, CampusNav green, emergency red, typography, radius, border, shadow, grid, and blueprint tokens; Tailwind brand compatibility tokens point to the approved green/neutral palette |
| Reusable primitives | `ACCEPTED` | Shared button/card/header treatments plus `BlueprintPanel`, `InkKicker`, and `InkSectionLabel` provide maintainable React mappings without copied artifact scripts or inline-style systems |
| Major public surfaces | `ACCEPTED_WITH_ADVISORY` | Home, Dashboard, Facilities, Facility Detail, Navigate shell, Events, Emergency, CLARA, Login, global search, notifications, and profile/account adopt the baseline; automated desktop captures were visually inspected |
| Admin presentation | `ACCEPTED_WITH_ADVISORY` | Shared Admin shell and existing Admin page primitives adopt the centralized tokens without changing RBAC or write behavior; authenticated graphical Admin interaction was not rerun |
| 2D/3D navigation presentation | `ACCEPTED` | Map controls/frame/summary surroundings adopt the blueprint system; navigation, multi-floor, 3D, emergency, and route-render regressions passed; spatial data and routing logic were unchanged |
| Responsive/browser evidence | `IMPLEMENTED_UNVERIFIED` | Existing responsive/mobile navigation code is preserved. Narrow headless screenshots are not treated as device certification. **AUTOMATED RENDER VERIFIED / MANUAL VISUAL QA PENDING.** |
| Accessibility evidence | `PARTIAL` | Existing semantic labels, focus utilities, reduced-motion handling, status text/icons, and 2D fallback remain; no new WCAG claim, screen-reader session, keyboard-only pass, or full contrast audit was completed |
| Performance/lazy-loading | `ACCEPTED_WITH_ADVISORY` | 3D, QR scanner, map verification, emergency panel, and Admin routes remain lazy. Production build passes; the existing approximately 878 kB minified 3D chunk warning remains |
| Behavior preservation | `ACCEPTED` | All deterministic data, A*, same-floor, multi-floor, QR, Emergency, 3D/WebGL, Dashboard, Auth/RBAC, Admin, Phase 8C.1, Phase 8C.2, and route-render suites passed after adoption |
| Deployment equivalence | `IMPLEMENTED_UNVERIFIED` | No deployment was requested or performed; current worktree must not be assumed equivalent to Cloudflare production |

The review of `25-performance-budget.md`, `26-accessibility-standards.md`, `55-browser-device-compatibility.md`, and `60-core-vs-optional-feature-matrix.md` found no requirement that conflicts with `DEC-UI-002`; their performance, fallback, accessibility, and thesis-core boundaries remain in force.

## Phase 2 acceptance snapshot — freshly revalidated 16 September 2026

### Acceptance vocabulary
- `ACCEPTED` — current implementation passed the relevant fresh deterministic and/or live acceptance evidence
- `ACCEPTED_WITH_ADVISORY` — accepted behavior passed, with a named non-blocking limitation or untested environment
- `IMPLEMENTED_UNVERIFIED` — implementation exists but the required evidence was not available
- `PARTIAL` — only part of the canonical contract is implemented
- `BLOCKED` — the check cannot proceed without a missing runtime, institutional input, or approved decision
- `DEFERRED` — intentionally postponed; it is not an implemented claim
- `CONFLICT` — current evidence contradicts the claimed or expected state

### Phase 2 evidence matrix

| Acceptance area | Classification | Fresh Phase 2 evidence / advisory |
|---|---|---|
| Worktree preservation | `ACCEPTED` | Preserved all pre-existing tracked/untracked work and `stash@{0}`; no reset, restore, clean, discard, stash-pop, or application overwrite was performed |
| Phase 8C.2 overall | `ACCEPTED_WITH_ADVISORY` | Deterministic UI/service checks, linked database constraints/RLS, authenticated writes, Realtime refresh, Dashboard refetch, audit, lifecycle, and cleanup passed; real graphical Admin interaction remains `MANUAL DEVICE QA PENDING` |
| Linked Supabase schema | `ACCEPTED` | Linked migration list contains `20260914151900`, `20260914231416`, `20260915002902`, and `20260915052147`; 24/24 public tables have RLS and 9/9 public views use `security_invoker` |
| Auth and RBAC | `ACCEPTED_WITH_ADVISORY` | Real client login, profile and role load, `SUPER_ADMIN`, `hasRole`, persisted session restoration, token refresh, logout state clearing, protected-access removal, and re-login passed under Node 22; no fresh graphical browser login run |
| Live cloud RLS | `ACCEPTED` | Linked transactional suites passed 35 + 21 + 34 + 13 assertions; authenticated allowed writes and anonymous administrative-write rejection also passed through `supabase-js` |
| Realtime | `ACCEPTED_WITH_ADVISORY` | Admin announcement/event INSERT/UPDATE/DELETE and Phase 8C.2 ACADEMIC/PERSONNEL refresh delivery passed under Node 22. The first fresh Auth-suite run timed out after subscription; its cleanup audit was zero, the complete suite passed on the second run, and both independent authenticated Realtime suites passed |
| Schedule/personnel invariants | `ACCEPTED` | Live `SCHEDULED → CHECKED_IN → SCHEDULED`, `UNAVAILABLE` precedence, public projection privacy, and schedule-only-not-presence behavior passed |
| Conflict enforcement | `ACCEPTED` | Client detects room/professor/section conflicts; all three live PostgreSQL exclusion constraints exist and linked conflict assertions passed |
| Next availability | `ACCEPTED` | Live 14:30–16:00 gap and overlapping-assignment counterexample passed in Asia/Manila calculations |
| Admin CMS and audit logging | `ACCEPTED_WITH_ADVISORY` | Live CRUD for announcements, events, advisories, and notifications; draft privacy; audience links; trusted audit creation; read-only audit boundary; and cleanup passed. Graphical Admin QA remains pending |
| Dashboard | `ACCEPTED_WITH_ADVISORY` | Local lifecycle/priority/deduplication tests and live public provider reads passed; class insert/edit/cancel emitted Realtime signals and refreshed Today's Classes. Graphical responsive QA remains pending |
| A*, same-floor, and multi-floor navigation | `ACCEPTED` | Fresh route, wall-crossing, blocked-edge, stair-continuity, construction, and render regressions passed through the single `pathfinding.js` engine |
| 2D and 3D | `ACCEPTED_WITH_ADVISORY` | Shared route/data/coordinate and WebGL-fallback regressions passed; graphical/device QA pending and the 3D chunk remains approximately 878 kB minified |
| QR/manual positioning | `ACCEPTED_WITH_ADVISORY` | Valid/invalid payload, graph origin, manual fallback, privacy, and route tests passed; physical camera and installed-label QA pending |
| Emergency | `ACCEPTED_WITH_ADVISORY` | Approved-edge-only routes, normal-edge rejection, construction/blocked handling, and safe no-route behavior passed; source coverage and safety-authority sign-off remain limited/pending |
| UI registry | `ACCEPTED_WITH_ADVISORY` | All 54 registered page/component paths are present; protected route rendering and responsive code patterns passed static checks. The color-direction question was later resolved by `DEC-UI-002`; manual device QA remains pending |
| Responsive/browser QA | `IMPLEMENTED_UNVERIFIED` | Responsive breakpoints, mobile map sheet, mobile Admin cards, and SPA route responses exist. **MANUAL DEVICE QA PENDING** |
| Accessibility QA | `PARTIAL` | Static labels, dialog roles, focus utilities, reduced-motion handling, and 2D fallback exist; no fresh keyboard-only, screen-reader, touch-target, or full contrast test, so no WCAG conformance claim is made |
| Credential/security audit | `ACCEPTED_WITH_ADVISORY` | Session file deleted and confirmed absent/untracked; no real service-role, provider, PostgreSQL-password URL, JWT, or private-key credential was found in source/build/local environment. The only source matches are intentional rejected-key test canaries; the build contains a role-name literal, not a key. Dependency audit reports 2 low + 3 moderate + 1 high advisory; Vite has a non-major remediation, while Router/Quill paths require deliberate major upgrades |
| Fixture cleanup | `ACCEPTED` | Post-test linked audit returned zero records in all 14 DEVELOPMENT/DEMO categories |
| Build and regression gates | `ACCEPTED_WITH_ADVISORY` | All 12 deterministic suites, route render, linked SQL suites, authenticated cloud suites, ESLint, typecheck, and production build passed. Local `test:rls` is `BLOCKED` only because Docker is unavailable |
| GitHub / deployment equivalence | `CONFLICT` | Local `HEAD` equals `origin/main` at `7496a765bc3a7135a8a1c44aa23224ed5aa843b3`, but preserved tracked/untracked work changes the build. Production entry/CSS asset names differ from the fresh worktree build, production still references `campusnav-og-v2.png`, and `/branding/campusnav-og.png` returns SPA HTML rather than PNG |
| Supabase production connection | `ACCEPTED` | Local environment and deployed production bundle both reference the linked project; live Data API, Auth, PostgreSQL, RLS, and Realtime checks passed |
| PWA/offline | `PARTIAL` | Manifest is valid and served, but no service worker/versioned emergency cache exists. A manifest alone is not offline support |
| CLARA | `PARTIAL` / `DEFERRED` | Current UI is an explicitly local, conservative facility matcher. It is not the final grounded Groq/tool integration, which remains deferred until an approved later phase |

Phase 2 changes only acceptance tracking documents. It does not deploy, refactor, add a feature, or start Phase 3.

## Phase 1 status vocabulary
- `IMPLEMENTED_VERIFIED` — implementation exists and relevant deterministic evidence passed during this audit; this does not imply browser/device or live-cloud verification unless explicitly stated
- `IMPLEMENTED_UNVERIFIED` — implementation exists, but a required external, live, or environment-specific check was not freshly performed
- `PARTIAL` — only part of the canonical contract is implemented
- `MISSING` — no implementation evidence was found
- `DEFERRED` — intentionally postponed by an approved architectural decision
- `BLOCKED` — cannot be completed without approved institutional data or a decision
- `CONFLICT` — implementation or documentation contradicts a controlling rule and requires explicit resolution

## Phase 1 requirement-to-code alignment matrix

| Subsystem | Canonical references | Relevant implementation | Status and evidence | Gap / risk | Recommended future phase |
|---|---|---|---|---|---|
| Project scope | `01`, `02`, `37`, `60` | `src/App.jsx`, `src/pages/` | `IMPLEMENTED_VERIFIED` — route and source audit found campus navigation/information functions and no LMS/ERP implementation | Future work could introduce scope drift | Phase 2 baseline guardrails |
| 2D navigation | `06`, `07`, `10`, `11`, `58` | `src/pages/Map.jsx`, `src/components/map/IndoorMap2D.jsx` | `IMPLEMENTED_VERIFIED` — navigation, multi-floor, render tests passed | Browser interaction was not freshly tested | Phase 2 browser acceptance |
| 3D navigation | `03`, `07`, `10`, `11`, `25`, `58` | `src/components/map3d/`, `src/lib/map3d.js` | `IMPLEMENTED_VERIFIED` — shared coordinate, shared-route, WebGL-fallback tests passed | Device/browser QA not reverified; production chunk is about 878 kB | Phase 2 browser/device/performance QA |
| A* routing | `02`, `10`, `18` | `src/lib/pathfinding.js`, `src/lib/navigation.js` | `IMPLEMENTED_VERIFIED` — same-floor, multi-floor, blocked-edge and wall-crossing tests passed | Distances remain schematic rather than verified metres | Preserve in all future phases |
| GF–5F spatial data | `04`, `11`, `20`, `34` | `src/data/floors.js`, `facilities.js`, `additionalFloorMaps.js`, `mapNodes.js`, `mapEdges.js`, `stairs.js` | `IMPLEMENTED_VERIFIED` — 95 source-supported facility assignments and graph integrity passed | Exact dimensions remain estimated; institutional final verification is pending | Future approved map-verification phase |
| QR positioning | `03`, `10`, `20`, `58` | `src/data/qrCheckpoints.js`, `src/lib/checkpointPositioning.js`, `src/components/map/QRScanner.jsx` | `IMPLEMENTED_VERIFIED` — valid, invalid, payload, privacy and A* origin tests passed | Physical installation/label placement not verified | Future deployment QA |
| Manual positioning | `03`, `10`, `20`, `55`, `58` | `src/lib/checkpointPositioning.js`, `src/pages/Map.jsx` | `IMPLEMENTED_VERIFIED` — manual fallback and state-preservation tests passed | Browser accessibility/interaction not freshly tested | Phase 2 browser acceptance |
| Emergency routing | `02`, `12`, `20`, `42`, `58` | `src/lib/emergencyNavigation.js`, `src/data/emergencyRoutes.js`, `src/components/map/EmergencyModePanel.jsx` | `IMPLEMENTED_VERIFIED` — approved-only routing, rejected normal edges, blocked routes and safe no-route behavior passed | Digital coverage is limited to source-supported routes | Preserve; future safety-authority review |
| Emergency equipment/data | `12`, `20`, `45`, `68` | `src/data/emergencyExits.js`, `emergencyEquipment.js`, `emergencyContacts.js` | `PARTIAL` — static source-aligned modules and emergency tests exist | Verified plotted coverage is incomplete on some floors; no full authorized admin workflow | `BLOCKED` pending safety-authority data |
| Dashboard | `15`, `21`, `22`, `47` | `src/pages/Dashboard.jsx`, `src/components/dashboard/`, `src/services/dashboardService.js`, `src/providers/dashboard/` | `IMPLEMENTED_VERIFIED` locally — lifecycle, priority, deduplication, Manila time, demo isolation and empty states passed | Live content/provider behavior not freshly reverified | Phase 2 live/provider verification |
| Supabase foundation | `03`, `04`, `19`, `31` | `src/lib/supabaseClient.js`, `supabase/migrations/`, `supabase/config.toml` | `IMPLEMENTED_UNVERIFIED` — client/config/migrations exist and deterministic structure tests passed | Linked schema and current provider configuration were not queried in this audit | Phase 2 linked-environment verification |
| Authentication | `05`, `43`, `59` | `src/contexts/AuthContext.jsx`, `src/services/authService.js`, `src/providers/auth/`, `src/pages/Login.jsx` | `IMPLEMENTED_UNVERIFIED` — lifecycle and render tests passed; historical live validation is documented | Live login/refresh/logout not freshly reverified | Phase 2 live auth verification |
| RBAC | `05`, `16`, `43`, `59` | `src/lib/authorization.js`, `src/components/auth/ProtectedRoute.jsx`, `src/App.jsx` | `IMPLEMENTED_UNVERIFIED` — role helpers and route guards passed structural tests | UI guards are not proof of current database authorization | Phase 2 role-boundary verification |
| RLS | `05`, `19`, `42`, `59` | `supabase/migrations/*.sql`, `supabase/tests/*.sql` | `IMPLEMENTED_UNVERIFIED` — policies and transactional tests exist; structural suites passed | Local pgTAP/linked database policies were not executed during Phase 1 | Phase 2 local/linked RLS verification |
| Realtime | `15`, `22`, `47` | `src/services/realtimeService.js`, Dashboard provider, `dashboard_refresh_events` migration/triggers | `IMPLEMENTED_UNVERIFIED` — centralized subscription lifecycle tests passed | Authenticated live delivery and cleanup not freshly reverified | Phase 2 authenticated Realtime verification |
| Admin CMS | `05`, `16`, `45` | `src/pages/admin/AdminOverview.jsx`, `AdminContentPage.jsx`, `src/services/adminService.js` | `IMPLEMENTED_UNVERIFIED` — content validation, route protection, service boundaries and rendering passed | Live CRUD, ownership and RLS were not freshly exercised | Phase 2 live admin acceptance |
| Audit logging | `16`, `48`, `59` | `src/pages/admin/AdminAudit.jsx`, Phase 8B/8C audit triggers and tests | `IMPLEMENTED_UNVERIFIED` — read-only UI and trigger structure tests passed | Current linked audit creation/access was not reverified | Phase 2 audit/RLS verification |
| Personnel | `04`, `14`, `16`, `49` | `src/services/personnelService.js`, Phase 8C.1 schema, Phase 8C.2 WIP UI/service | `PARTIAL` — backend rules and current WIP deterministic tests passed | Official data, approved public fields, live role scope and the WIP lifecycle remain unverified | Phase 2 WIP stabilization; institutional-data phase later |
| Class schedules | `04`, `14`, `16`, `56` | `src/services/scheduleService.js`, Phase 8C.1 schema, Phase 8C.2 WIP | `PARTIAL` — recurrence, exceptions, overlaps and conflict constraints passed deterministic tests | No approved institutional schedule dataset; live database constraints not reverified | Phase 2 WIP/database verification |
| Availability engine | `14`, `20`, `42`, `56` | `src/services/personnelService.js`, `src/services/scheduleService.js` | `IMPLEMENTED_VERIFIED` locally — precedence, exceptions, Manila time and next-availability overlap tests passed | Live public projections and real approved data not reverified | Phase 2 live projection verification |
| Check-in logic | `02`, `05`, `14`, `49` | `personnel_checkins` migration/policies, `personnelService.js`, Phase 8C.2 WIP | `IMPLEMENTED_VERIFIED` locally — only an active check-in produces `CHECKED_IN`; schedule-only cases do not | Role-scoped create/close behavior not freshly tested against linked RLS | Phase 2 live authorization verification |
| Facility information | `13`, `20`, `32` | `src/data/facilities.js`, `src/pages/Facilities.jsx`, `FacilityDetail.jsx` | `PARTIAL` — verified floor assignments, details, search foundation and navigation links exist | Services, public contacts, images and institutional completeness vary | Future approved facility-data phase |
| Operating hours | `13`, `42`, `56` | pending-state handling in facility UI/data | `BLOCKED` — unknown hours are not invented | No authorized hours, exception calendar, or status engine dataset | Institutional-data decision and owner approval |
| Notifications | `15`, `22`, `47` | `notifications` schema/RLS, Dashboard provider, Admin content pages | `IMPLEMENTED_UNVERIFIED` — local lifecycle/provider tests passed | Live audience and permission behavior not freshly reverified; optional push/SMS absent | Phase 2 live in-app verification; delivery channels deferred |
| Events | `15`, `22`, `47` | `events` schema/RLS, `src/pages/Events.jsx`, Dashboard/Admin providers | `IMPLEMENTED_UNVERIFIED` — local lifecycle and rendering evidence passed | Live event CRUD/audience behavior not freshly reverified | Phase 2 live content verification |
| CLARA | `17`, `18`, `20`, `41`, `60` | `src/pages/Clara.jsx` | `PARTIAL` — UI and conservative local facility matcher exist | No server-side model, tool orchestration, role-aware grounding, or provider endpoint; must not be called production AI | `DEFERRED` until internal services and authorization are accepted |
| PWA/offline emergency access | `12`, `24`, `30` | `public/manifest.json` only | `MISSING` — no service worker, cache strategy, or versioned emergency cache was found | Manifest alone can create an unsupported offline claim | Future approved PWA/emergency-cache phase |
| Map administration | `11`, `16`, `45`, `46` | developer verification panel and `src/pages/admin/QRCheckpoints.jsx` | `PARTIAL` — inspection/QR tooling exists | No production floor-plan upload, calibration, geometry editor, map version history or coherent rollback | Future approved map-administration phase |
| Reports/analytics | `23`, `49`, `60` | no dedicated implementation found | `MISSING` | No report workflow, verification queue, privacy model, or analytics dashboard | Future approved reporting phase |
| UI registry compliance | `06`, `07`, `21`, `26`, `55` | registered pages/components under `src/pages/` and `src/components/` | `IMPLEMENTED_VERIFIED` for code structure and automated desktop render under `DEC-UI-002` | Keyboard, screen-reader, contrast, and physical-device matrix remain pending | Approved UI adoption follow-up QA |
| Deployment | `08`, `31`, `52`, `62` | `vite.config.js`, `wrangler.jsonc`, `package.json`, GitHub remotes, Cloudflare production URL | `IMPLEMENTED_UNVERIFIED` — production build passed; configuration exists; production URL returned HTTP 200 during Phase 1 | Current worktree was not deployed; production-browser equivalence was not established; both `origin` and `old-origin` remotes require deliberate release targeting | Phase 2 release verification |
| Testing/QA | `08`, `25`, `55`, `57`, `58`, `73` | `scripts/test-*.mjs`, `supabase/tests/*.sql` | `PARTIAL` — all selected local deterministic non-cloud suites, render, lint, typecheck and build passed in Phase 1 | Local pgTAP, linked-cloud, production browser, responsive and physical-device checks were not run | Phase 2 acceptance baseline |

## Core invariant verification

| Invariant | Status | Phase 1 evidence |
|---|---|---|
| One canonical campus/spatial dataset | `ALIGNED` | 2D and 3D import the same floors, facilities, nodes and edges; shared-transform test passed |
| One A* engine for route consumers | `ALIGNED` | `navigation.js` and `emergencyNavigation.js` call `pathfinding.js`; 2D/3D render the returned route; QR/manual resolve into the same node graph; personnel links enter the normal Map route; CLARA has no independent router |
| Schedule does not mean physical presence | `ALIGNED` | service precedence and UI wording distinguish `SCHEDULED`/`IN_CLASS`/`CONSULTATION`; Phase 8C tests passed |
| Only authorized active check-in may produce `CHECKED_IN` | `ALIGNED_NEEDS_LIVE_AUTHORIZATION_QA` | status engine tests passed; linked RLS authorization was not freshly executed |
| QR/manual are thesis-core indoor positioning | `ALIGNED` | both flows exist and deterministic tests passed; no exact continuous indoor-tracking claim found |
| Emergency uses verified emergency-approved paths only | `ALIGNED` | approved-edge filter, rejected normal edge and no-route tests passed |
| No AI-created evacuation path | `ALIGNED` | no AI emergency generator exists; CLARA links to verified emergency information only |
| Unknown institutional data stays unavailable/pending | `ALIGNED` | normal Dashboard/facility/CLARA states use empty, unavailable or pending wording; demo isolation test passed |
| No generic LMS/ERP expansion | `ALIGNED` | no grades, exams, learning modules, tuition payment, or enrollment subsystem found |
| Future CLARA must use verified internal tools/data | `ALIGNED_AS_DEFERRED` | current code is explicitly a local placeholder; production tool/AI integration remains deferred |

## Phase 8C.2 worktree acceptance

Phase 8C.2 files remain preserved as existing work and received fresh Phase 2 acceptance evidence. Acceptance does not mean the dirty worktree is deployed or that graphical/device QA occurred.

| WIP area | Classification | Evidence / remaining verification |
|---|---|---|
| Personnel management | `ACCEPTED_WITH_ADVISORY` | protected route, editor, list/detail, activation lifecycle, authenticated write, linked RLS, privacy projection, audit, and cleanup passed; approved official fields/data remain pending |
| Courses and sections | `ACCEPTED_WITH_ADVISORY` | CRUD service/forms, department references, authenticated writes, RLS, audit, and cleanup passed; real graphical Admin QA pending |
| Class schedules | `ACCEPTED` | room/professor/section client validation and all three live exclusion constraints passed; live insert/edit/cancel refreshed Dashboard correctly |
| Schedule exceptions | `ACCEPTED_WITH_ADVISORY` | canonical types, linking, live RLS, and audit assertions passed; graphical workflow QA pending |
| Personnel assignments | `ACCEPTED` | stable facility IDs, schedule-derived wording, live status, and next-availability behavior passed |
| Consultation hours | `ACCEPTED_WITH_ADVISORY` | optional facility, recurring windows, linked permissions, and deterministic status-engine checks passed; graphical workflow QA pending |
| Check-in/check-out | `ACCEPTED` | explicit active check-in alone produced `CHECKED_IN`; close restored `SCHEDULED`; RLS, audit, Realtime, and cleanup passed |
| Availability overrides | `ACCEPTED` | `UNAVAILABLE` precedence, role-scoped policies, audit, and safe cleanup passed |
| Audit and Dashboard refresh | `ACCEPTED` | trusted audit triggers and centralized `dashboard_refresh_events` passed live class edit/cancel and personnel check-in transitions |
| Lifecycle and deletion | `ACCEPTED` | UI/services use activation, cancellation, check-out, and end-override actions instead of generic destructive deletion |
| Overall Phase 8C.2 | `ACCEPTED_WITH_ADVISORY` | deterministic, linked PostgreSQL, authenticated Data API, RLS, Realtime, Dashboard, audit, and cleanup evidence passed; files remain uncommitted/not deployment-equivalent and manual device QA is pending |

## Recorded alignment and documentation conflicts

| Document A | Document B | Observed code/evidence | Recommended decision or treatment |
|---|---|---|---|
| `01-project-overview.md`, `09-progress-roadmap.md`, and `28-definition-of-done.md` describe 3D as implemented/completed | Previous version of this registry described 3D as in progress | 3D renderer and shared-data tests pass locally; browser/device QA was not performed | Treat implementation as verified locally and device/browser QA as outstanding; do not merge those claims |
| Original 14 Sep source required strict grayscale | Owner-approved `DEC-UI-002` adopts neutral-dominant CampusNav Ink with controlled green/red/map color | Current UI uses centralized neutral, CampusNav green, emergency red, and controlled category/status colors | Resolved by explicit owner decision; color still cannot be the only signal |
| `17` defines future grounded CLARA integration | `07` registers a current CLARA screen | Current screen is a local facility matcher with no model/tool endpoint | Keep status `PARTIAL`; do not describe the UI as production grounded AI |
| A web manifest and PWA-facing language can imply install/offline capability | `24` and `30` require evidence of a real cache strategy | No service worker or versioned emergency cache exists | Keep offline/PWA status `MISSING` until implemented and tested |
| Previous `09` used historical Phase 1–8C numbering | `DEC-ROADMAP-001` resets active development to canonical alignment Phase 1 | Advanced implementation remains present and must not be discarded | Preserve code as baseline evidence; use the reset roadmap for future work |

## Verification scope for this snapshot

Fresh Phase 1 evidence:
- `test:data`, `test:navigation`, `test:multi-floor`, `test:qr`, `test:emergency`, `test:3d`, `test:dashboard`
- `test:phase8a`, `test:phase8b`, `test:phase8c`, `test:phase8c2`, `test:render`
- `lint`, `typecheck`, and production `build`
- Cloudflare production endpoint HTTP availability (`200`) and local deployment-topology/config inspection

Not freshly verified:
- Docker/local pgTAP `test:rls`
- linked Supabase cloud suites and database advisors
- production login/RLS/Realtime/Admin behavior
- current worktree deployment equivalence
- production-browser, responsive, accessibility, WebGL-device, camera-device and offline behavior

Historical documentation claims are retained as history but are not converted into fresh Phase 1 verification.

## Rule
When this file conflicts with running code, passing tests, or live verification, record the mismatch and apply the authority rules in `00-agent-entrypoint.md`. Never rewrite a safety/business requirement merely to match existing code.
