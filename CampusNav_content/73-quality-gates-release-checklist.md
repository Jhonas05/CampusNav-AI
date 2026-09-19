# CampusNav AI — Quality Gates and Release Checklist

## Baseline gates
- production build succeeds
- no secret is committed/exposed in client output
- migrations/configuration are reproducible
- relevant tests pass
- new UI includes loading/empty/error/permission states
- documentation/status is updated where changed

## Navigation/map gate
- same-floor + multi-floor smoke routes pass
- no wall crossing
- blocked/construction behavior passes
- 2D/3D preserve same route/current/destination
- QR/manual fallback passes

## Emergency gate
- approved emergency route test passes where data exists
- no normal-route fallback is possible
- safe no-route state verified

## Auth/admin gate
- unauthorized direct write fails
- role-scoped action succeeds for permitted user
- audit behavior checked for important actions

## Schedule/personnel gate
- precedence/exceptions tested
- UI language does not claim presence from schedule

## Responsive/performance gate
- mobile/tablet/desktop smoke test
- 3D fallback/reduced-motion behavior checked where relevant

## Thesis-demo gate
- demo records labeled
- implemented vs future features clearly separated
- known limitations rehearsed rather than hidden

## Phase 3 release-candidate Checkpoint A evidence — 16 September 2026

- `PASS` — all deterministic facility/data, A*, same-floor, multi-floor, QR, Emergency, 3D/WebGL, Dashboard, Auth/RBAC, Admin, Phase 8C.1, Phase 8C.2, and route-render suites
- `PASS` — ESLint, typecheck, and production build
- `PASS` — linked migration list includes all four repository migrations in order
- `PASS` — linked fixture audit reports zero records in all 14 DEVELOPMENT/DEMO categories
- `PASS` — repository and build credential scan found no real privileged/provider/database/JWT/private-key credential; `.env.phase8a.session` is absent and untracked
- `PASS` — Phase 8C.2 migration review found no replacement table, table/column drop, or RLS-policy change
- `ACCEPTED_WITH_ADVISORY` — RLS, RBAC, audit, Realtime, class lifecycle, schedule/personnel invariants, conflict enforcement, and Dashboard refresh use the exact implementation accepted by Phase 2 live-cloud evidence; no new cloud mutation was needed for staging consolidation
- `DEFERRED` — social-preview metadata and canonical image are isolated as Checkpoint B and are not included in Checkpoint A
- `PENDING` — owner approval, commit, deployment-equivalence verification, physical device/browser/QR/WebGL QA, keyboard-only and screen-reader QA
- `ADVISORY` — the approximately 878 kB minified lazy 3D chunk and dependency audit findings remain; no dependency update was made

## Phase 3 canonical asset-cleanup evidence — 16 September 2026

- `PASS` — `SchoolLogo` has one approved image source: `/branding/scc-logo.png`; no JPG automatic fallback remains, and the existing accessible non-image fallback is preserved
- `PASS` — the canonical logo is a 600×600 PNG with true exterior alpha; RGB artwork is unchanged, internal white/light details remain opaque, and light/charcoal/green/emergency-red surface inspection passed
- `PASS` — Open Graph and Twitter metadata consistently target the absolute production URL for `/branding/campusnav-og.png`
- `PASS` — production `dist/branding` contains only `scc-logo.png` and `campusnav-og.png`
- `PASS` — legacy `scc-logo.jpg`, obsolete `campusnav-og-v2.png`, and unsupported `campusnav-og-v3.png` are absent from the production build
- `PASS` — ESLint, typecheck, route rendering, and production build
- `PASS` — no temporary session file, privileged/provider key, credentialed database URI, private key, JWT/token, or design-reference HTML is emitted
- `PENDING` — owner approval, commit, push, exact-revision deployment, and production-equivalence verification

## Phase 3 exact-revision production evidence — 17 September 2026

- `PASS` — clean `HEAD == origin/main == 128ac403c2fcf57f4f471543ea79b2c4f0ed6369`; temporary session file absent and backup stash untouched before deployment
- `PASS` — all deterministic data/navigation/QR/Emergency/3D/Dashboard/Auth/Admin/Phase 8 suites, route rendering, ESLint, typecheck, and production build
- `PASS` — Cloudflare Workers Static Assets deployment completed at the canonical endpoint as version `3636917e-ddf5-4b98-9737-c44f0478f226`
- `PASS` — production HTML, main JavaScript, CSS, and lazy 3D chunk match the local release build byte-for-byte
- `PASS` — direct SPA access for `/`, `/dashboard`, `/facilities`, `/map`, `/map?mode=emergency`, `/login`, and `/admin`
- `PASS` — canonical `scc-logo.png` and `campusnav-og.png` return real `image/png`; legacy JPG and OG v2/v3 paths are not image assets
- `PASS` — complete OG/Twitter metadata targets the canonical `campusnav-og.png`
- `PASS` — read-only production Supabase Auth settings and public Data API initialization return HTTP 200; no secret-key pattern is present in the deployed JavaScript
- `PASS` — 3D remains a separately loaded chunk and is absent from initial HTML
- `PRODUCTION_MATCHES_CURRENT_BASELINE` — exact production fingerprints and assets match the approved release build
- `PENDING` — graphical authenticated Admin, desktop/tablet/mobile, keyboard-only, screen-reader, physical camera/QR, and representative WebGL-device QA; no manual-device or WCAG completion claim is made
- `ADVISORY` — connected browser automation was unavailable, the approximately 878 kB lazy 3D chunk remains, and existing dependency advisories were not changed

## Phase 3 manual acceptance attempt — 17 September 2026

- `PASS` — canonical Phase 3 still authorizes the remaining manual acceptance subset; no new feature scope was entered
- `PASS` — production still serves the approved `index-D88W5mFD.js`, `index-DVdLsi8t.css`, `scc-logo.png`, and `campusnav-og.png`; only canonical tracking documents changed after deployed runtime revision `128ac40`
- `PASS` — fresh route rendering, Dashboard, QR/manual fallback, strict Emergency, shared 3D/WebGL fallback, Admin CMS, and Phase 8C.2 deterministic checks
- `STATIC REVIEW PASS` — responsive variables/breakpoints, laptop rails/grids, mobile navigation/route sheet, focus utilities, semantic labels, modal/status/error roles, reduced-motion rules, and non-color cues remain present
- `BLOCKED_BY_TOOLING` — approved in-app browser setup failed before page launch with OS error 3; no manual result is claimed for 1366x768, 1280x800, 1440x900, 1024x768, 768px tablet, or 390px mobile
- `BLOCKED_BY_TOOLING` — keyboard-only and authenticated Admin visual sessions could not start; credentials were not required or requested
- `LOGIC VERIFIED / PHYSICAL CAMERA QA PENDING` — QR logic passes; no camera-capable device evidence is available
- `AUTOMATED WEBGL VERIFIED / REPRESENTATIVE DEVICE QA PENDING` — 3D/WebGL fallback logic passes; no representative physical GPU/device evidence is available
- `PARTIAL` — static accessibility evidence remains, but contrast, touch-target use, focus order/traps, Escape behavior, and screen-reader output were not manually verified; no WCAG claim is made
- `NO FIX / NO REDEPLOY` — no reproducible application defect was found in available evidence, so application code and production were left unchanged

## Phase 3-MQA-1 primary laptop browser evidence — 17 September 2026

- `OWNER-REPORTED_MANUAL_BROWSER_PASS` — `1366x768` and `1280x800` were manually checked by the owner and reported acceptable
- `OWNER-REPORTED_MANUAL_BROWSER_PASS` — Dashboard, Facilities, Navigate 2D, Navigate 3D, CLARA, Login, and Admin were included and reported acceptable
- `ACCEPTED_WITH_ADVISORY` — a basic keyboard smoke check was included and reported acceptable
- `PASS` — the owner reported no blocker requiring application changes
- `NOT SPECIFICALLY DOCUMENTED` — screenshot/device/browser details; per-screen layout findings; exact keyboard commands/focus order/trap behavior; contrast; touch targets; screen-reader output; reduced motion; detailed 3D interaction/performance/WebGL-fallback observations
- `PENDING` — `1440x900`, `1024x768`, 768px tablet, approximately 390px mobile, physical QR/camera, and representative WebGL-device acceptance
- `NO CODE CHANGE / NO REDEPLOY` — evidence recording only; existing production equivalence remains unchanged
- `NEXT` — Phase 3-MQA-2 Remaining Responsive Viewport Acceptance

## Phase 3-MQA-2 remaining responsive viewport evidence — 17 September 2026

- `OWNER_REPORTED_MANUAL_BROWSER_PASS` — `1440x900` was manually checked and reported acceptable
- `OWNER_REPORTED_MANUAL_BROWSER_PASS` — `1024x768` was manually checked and reported acceptable
- `OWNER_REPORTED_RESPONSIVE_VIEWPORT_PASS` — 768px tablet viewport was checked and reported acceptable; `PHYSICAL_DEVICE_DETAILS_NOT_DOCUMENTED`
- `OWNER_REPORTED_RESPONSIVE_VIEWPORT_PASS` — approximately 390px mobile viewport was checked and reported acceptable; `PHYSICAL_DEVICE_DETAILS_NOT_DOCUMENTED`
- `ACCEPTED_WITH_ADVISORY` — responsive application scope included, where applicable, Home, Dashboard, Facilities, Facility Detail, Navigate 2D/3D, Events, Emergency, CLARA, Login, and Admin; individual per-screen findings are `NOT SPECIFICALLY_DOCUMENTED`
- `PASS` — owner reported `NO BLOCKER FOUND`
- `NOT SPECIFICALLY DOCUMENTED` — screenshots, browser/version, OS, physical-device model, measurements, detailed interactions, per-screen behavior, and performance observations
- `PENDING` — dedicated keyboard-only/accessibility, screen reader, contrast, reduced motion, physical QR/camera, and representative WebGL-device acceptance
- `NO CODE CHANGE / NO REDEPLOY` — evidence recording only; existing production equivalence remains unchanged
- `NEXT` — Phase 3-MQA-3 Keyboard-Only and Accessibility Manual Acceptance

## Phase 3-MQA-3 keyboard-only and accessibility evidence — 17 September 2026

- `OWNER_REPORTED_KEYBOARD_ACCESSIBILITY_PASS` — keyboard-only navigation, Tab, Shift+Tab, Enter, Space where appropriate, Escape/dialog behavior, focus visibility, forms/navigation usability, and no observed keyboard blocker/trap were manually checked and reported acceptable
- `OWNER_REPORTED_KEYBOARD_ACCESSIBILITY_PASS` — readable visual contrast, reduced-motion behavior, approximately 200% zoom usability, and labels/headings/status/error presentation were manually checked and reported acceptable
- `PASS` — owner reported no blocker requiring an application change
- `ACCEPTED_WITH_ADVISORY` — evidence applies to the current approved production baseline; relevant areas may include global navigation, Login, Dashboard, Facilities, Navigate controls, dialogs/drawers, CLARA controls, and Admin navigation/forms, but individual per-screen and per-control PASS results are `NOT SPECIFICALLY_DOCUMENTED`
- `SCREEN_READER_QA_PENDING` — no explicit screen-reader session evidence was provided
- `NOT SPECIFICALLY DOCUMENTED` — screenshots, exact browser/OS, assistive-technology configuration, detailed focus sequence, individual control behavior, authenticated Admin state, and detailed protected-form behavior
- `NOT_CLAIMED` — WCAG conformance, physical tablet/mobile certification, physical QR/camera PASS, representative WebGL-device PASS, and exact browser/OS certification
- `NO CODE CHANGE / NO REDEPLOY` — evidence recording only; existing production equivalence remains unchanged
- `NEXT` — Phase 3-MQA-4 Screen-Reader and Authenticated Admin Manual Acceptance; `READY` under the Definition of Ready, with screen-reader/browser and possible temporary credential execution dependencies

## Phase 3-MQA-4 historical attempt evidence — recovered 19 September 2026

- `READY` — Definition of Ready passed before execution; the MQA-4 goal, contracts, security/privacy boundaries, and evidence requirements were defined
- `PARTIAL / BLOCKED_BY_TOOLING` — historical execution did not complete
- `BLOCKED_BY_TOOLING` — browser failed before production launch with `failed to write kernel assets` (OS error 3)
- `SCREEN_READER_QA_PENDING` — no successful screen-reader environment was launched
- `IMPLEMENTED_UNVERIFIED` — no authenticated browser Admin session was completed; requested graphical/manual Admin checks remain unverified
- `NOT_CLAIMED` — no `SUPER_ADMIN_MANUAL_ADMIN_PASS` or `DEPARTMENT_ADMIN_MANUAL_BROWSER_PASS`
- `NOT TESTED MANUALLY` — AccessDenied, session, and logout behavior were not exercised during the attempt
- `NO FIXTURES / NO DATA MUTATION` — no test fixtures were created and no institutional records were mutated
- `NO CREDENTIAL USE` — no temporary credentials were requested or used; `.env.phase8a.session` was absent, untracked, and ignored
- `NO APPLICATION DEFECT FOUND` — failure was environmental/browser tooling; no code fix was made
- `NO DEPLOYMENT` — no production deployment occurred
- `NOT_CLAIMED` — WCAG conformance, physical-device certification, QR-camera acceptance, representative WebGL-device acceptance, and exact browser/OS certification
- `CURRENT UNFINISHED SUBPHASE` — MQA-4 remains open; historical tooling failure is not successful acceptance
- `NEXT` — complete real screen-reader manual acceptance and real authenticated Admin manual acceptance in a functioning environment

## Phase 3-MQA-4 resumed successful evidence — owner completed 19 September 2026

- `ACCEPTED_WITH_ADVISORY` — this later owner-reported run controls current MQA-4 status while the historical `PARTIAL / BLOCKED_BY_TOOLING` attempt above remains preserved
- `OWNER_REPORTED_SCREEN_READER_PASS` — Windows Narrator in a functioning graphical browser environment; Home, Dashboard, Facilities, Navigate, Login, and CLARA were reported acceptable
- `OWNER_REPORTED_SCREEN_READER_PASS` — navigation elements, buttons and links, heading structure, form labels, and status/error presentation were reported acceptable
- `SUPER_ADMIN_MANUAL_ADMIN_PASS` — the actual authenticated browser role tested was `SUPER_ADMIN`
- `SUPER_ADMIN_MANUAL_ADMIN_PASS` — Admin Overview, Announcements, Events, Facility Advisories, Notifications, Audit, Personnel, Courses, Sections, Class Schedules, Schedule Exceptions, Assignments, Consultation Hours, Check-ins, and Availability Overrides were reported acceptable
- `SUPER_ADMIN_MANUAL_ADMIN_PASS` — authenticated navigation, page/layout readability, tables/cards, form usability, labels, dialogs, validation presentation, no observed clipping/overflow blocker, session behavior, and logout behavior were reported acceptable
- `PASS` — owner reported no application blocker during the screen-reader or authenticated Admin smoke subsets
- `ACCESSDENIED_MANUAL_QA_NOT_TESTED` — no explicit AccessDenied exercise was supplied; it is not inferred from successful `SUPER_ADMIN` use
- `DEPARTMENT_ADMIN_BROWSER_NOT_TESTED` — no separate Department Admin browser session was supplied; SQL/RLS/backend evidence is not converted into manual browser evidence
- `NOT_CLAIMED` — WCAG conformance, full accessibility certification, screen-reader certification, physical-device certification, physical QR/camera acceptance, representative WebGL-device acceptance, and broad browser support
- `DOCUMENTATION ONLY` — no credential value, fixture, institutional-data mutation, environment-file change, application change, test execution, commit, push, or deployment

## Phase 3-MQA-5 physical QR/camera and manual-fallback readiness — 19 September 2026

- `READY` — goal, thesis-core status, contracts, canonical checkpoint relationships, privacy/security boundaries, error/fallback states, and acceptance cases satisfy `72-definition-of-ready.md`
- `READY_WITH_BOUNDARY` — checkpoint installation/label placement remains pending verification; this future smoke subset must not become an institutional installation certification
- `READY` — selected regression route is `QR-3F-LIBRARY → Registrar’s Office`; recognized QR resolution, invalid QR safety, denied/unavailable-camera manual fallback, state coherence, and existing A* routing are the required acceptance cases
- `PENDING_EXECUTION` — a camera-capable physical device, graphical browser in a secure context, and scannable canonical test label/payload are required
- `NOT_STARTED` — no QR/camera test or representative WebGL/device test is started by this documentation update
- `NEXT` — Phase 3-MQA-5 Physical QR/Camera and Manual-Fallback Acceptance
- `LATER GAPS` — representative WebGL-device acceptance and broader physical-device evidence
