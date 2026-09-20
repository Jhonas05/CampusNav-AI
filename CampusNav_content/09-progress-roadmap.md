# CampusNav AI — Canonical Progress and Roadmap

## Roadmap authority and reset

`DEC-ROADMAP-001` resets the **active development process** to canonical Phase 1. This is not a code reset. Existing implementation remains intact and is mapped to the canonical contracts in `63-implementation-status-registry.md`.

Historical phase labels from earlier development conversations no longer control future sequencing. They remain part of Git/project history, not the active roadmap.

## Phase 1 — Canonical Documentation Alignment and Repository Baseline

**Status:** COMPLETE — 15 September 2026

Completed outcomes:
- repository `AGENTS.md` points to `00-agent-entrypoint.md`
- canonical baseline and subsystem documents were reviewed using the entrypoint routing map
- the dirty worktree and existing Phase 8C.2 implementation were preserved
- major requirements were mapped to current code and fresh deterministic evidence
- implementation, live-cloud, browser/device, and institutional-data claims were separated
- internal documentation/status conflicts were recorded
- no application, routing, map, Supabase, Admin, schedule/personnel, Dashboard, Emergency, QR, or CLARA implementation was changed

See `63-implementation-status-registry.md` for the complete alignment matrix and verification scope.

## Existing implementation baseline

The following capabilities exist in the repository. Their exact evidence level is controlled by `63`, not by this summary.

- GF–5F local/version-controlled spatial and facility data
- same-floor and multi-floor A* navigation
- shared 2D/3D route and spatial model
- QR checkpoint and manual positioning
- strict emergency-approved routing with safe no-route behavior
- Dashboard local/Supabase provider boundary
- Supabase Auth, RBAC, RLS, Realtime, content, audit, and academic/personnel migrations
- Admin content CMS
- academic/personnel schedule and availability engine
- preserved Phase 8C.2 personnel and academic Admin WIP
- Cloudflare Workers Static Assets deployment configuration

This list does not convert historical live or production claims into fresh verification.

## Phase 2 — Existing Baseline Stabilization and Acceptance

**Status:** COMPLETE — freshly revalidated 16 September 2026 (`ACCEPTED_WITH_ADVISORY`)

Completed outcomes:
1. preserved the existing dirty worktree and backup stash without reset, restore, clean, discard, stash-pop, or overwrite
2. confirmed all four repository migrations are present on the linked Supabase project
3. ran the Phase 8A, 8B.1, 8C.1, and 8C.2 transactional suites against linked cloud PostgreSQL: 103 assertions passed and rolled back
4. freshly verified development-user login, profile/role reload, `SUPER_ADMIN`, session restoration/refresh, authorized and anonymous RLS behavior, logout cleanup, and re-login through the real Supabase client
5. freshly verified Admin CMS CRUD, trusted audit creation, public published reads, authenticated Realtime, and subscription cleanup
6. freshly verified Phase 8C.2 schedule/personnel writes, class insert/edit/cancel → Realtime → Dashboard refresh, schedule/check-in separation, status precedence, next availability, conflict constraints, public projection privacy, and audit events
7. reran all deterministic navigation, 2D/3D, QR, Emergency, Dashboard, Auth, Admin, and academic/personnel regressions plus render, lint, typecheck, and production build
8. deleted the ignored temporary session file and confirmed zero fixture records across all 14 audited DEVELOPMENT/DEMO categories
9. confirmed local `HEAD` equals GitHub `origin/main` at `7496a765bc3a7135a8a1c44aa23224ed5aa843b3`, while the preserved dirty worktree and its production build do not equal the currently deployed Cloudflare assets
10. completed static UI-registry, responsive-code, accessibility, credential, dependency, PWA, and CLARA boundary audits without overstating graphical/device evidence

Advisories and non-accepted claims:
- `MANUAL DEVICE QA PENDING`: no fresh graphical desktop/tablet/mobile, physical camera, keyboard-only, or screen-reader session was available
- local Docker pgTAP execution is `BLOCKED` because Docker is unavailable; the same repository SQL suites passed against linked cloud PostgreSQL
- the first fresh Node 22 Auth Realtime run timed out after the channels subscribed; the immediate cleanup audit was zero, the complete Auth suite passed on the second run, and the independent Admin and academic/personnel authenticated Realtime suites also passed
- Cloudflare production is reachable but is not deployment-equivalent to the preserved worktree; the deployed OG image path currently falls through to SPA HTML
- the 3D chunk remains approximately 878 kB minified
- dependency audit reports two low, three moderate, and one high advisory; Vite has a non-major remediation available, while the React Router and Quill dependency paths require deliberate major upgrades. No dependency change was made during acceptance
- PWA manifest presence is not offline support
- CLARA remains a conservative local facility matcher, not the final grounded Groq/tool integration

See `63-implementation-status-registry.md` for the evidence matrix.

## Owner-approved UI baseline adoption checkpoint

**Status:** COMPLETE WITH ADVISORY — 15 September 2026 (`ACCEPTED_WITH_ADVISORY`)

Completed without starting Phase 3:
1. recorded `DEC-UI-002`, superseding the older strict grayscale / Apple-only constraint where it conflicted with the approved CampusNav Ink direction
2. registered the supplied all-pages HTML as visual/UX reference only
3. centralized typography, neutral, CampusNav green, emergency red, radius, border, shadow, grid, and blueprint tokens
4. added reusable React blueprint/kicker/section-label primitives and aligned the global shell, public screens, Navigate surroundings, account surfaces, and Admin shell
5. preserved all existing routing, spatial data, Supabase, Auth/RBAC, Realtime, Dashboard, schedule/personnel, emergency, QR, 2D/3D, PWA, and CLARA behavior
6. passed ESLint, typecheck, production build, route rendering, and all deterministic regression suites
7. inspected automated desktop captures for eight public routes

Advisories:
- **AUTOMATED RENDER VERIFIED / MANUAL VISUAL QA PENDING.**
- authenticated Admin visual interaction, physical devices, keyboard-only use, screen readers, physical camera/QR, and representative WebGL devices remain manual QA work
- no deployment was requested or performed, so production equivalence is not claimed
- the existing approximately 878 kB minified 3D chunk warning remains

This checkpoint is presentation-only and does not authorize Phase 3 or any new capability.

## Recommended Phase 3 — Accepted Baseline Release and Manual QA

**Status:** COMPLETE — 19 September 2026 (`ACCEPTED_WITH_ADVISORY`)

### Release-candidate Checkpoint A — prepared 16 September 2026

**Classification:** `ACCEPTED_WITH_ADVISORY`

Completed preparation:
1. classified every remaining modified/untracked path and isolated accepted Phase 8C.2 implementation from the separate social-preview work
2. confirmed the implementation under review is the same preserved code that received Phase 2 live-cloud acceptance evidence; the Phase 2 commit changed tracking documents only
3. reviewed migration `20260915052147_phase_8c2_personnel_academic_admin_ui.sql` for ordering, linked-cloud presence, conflict constraints, consultation-location optionality, and absence of table drops, replacement tables, or RLS-policy changes
4. reconfirmed zero DEVELOPMENT/DEMO fixtures across all 14 audited categories and reran the repository/build credential audit without exposing secrets
5. passed all deterministic regressions, route rendering, ESLint, typecheck, and production build
6. prepared an explicit-path Git staging set for the accepted Phase 8C.2 and Phase 2 support files only

Checkpoint boundaries and advisories:
- no commit, push, deployment, reset, clean, restore, stash-pop/drop, or dependency upgrade was performed
- the approved social-preview metadata and image remain a separate unstaged Checkpoint B
- the alternative `campusnav-og-v3.png` concept contains unsupported institutional claims and is excluded from both checkpoints
- current production remains non-equivalent until an exact accepted revision is deliberately deployed and verified
- **MANUAL DEVICE QA PENDING**; the existing approximately 878 kB minified lazy 3D chunk and dependency advisories remain

Recommended scope:
1. obtain owner review/approval and commit Checkpoint A as a deliberate release candidate
2. review and commit the separate social-preview Checkpoint B if approved
3. deploy the exact accepted revisions and verify Cloudflare asset equivalence, including the social-preview image response
4. complete real graphical desktop, tablet, and mobile QA
5. complete keyboard-only, focus, reduced-motion, contrast, and screen-reader QA without claiming WCAG conformance until evidence supports it
6. verify physical camera/QR fallback and representative WebGL-capable plus WebGL-fallback devices
7. triage the dependency advisories through deliberate, regression-tested upgrades

Do not begin a new facility, PWA, map-editor, reporting, or CLARA capability until this release-equivalence/manual-QA scope is approved or explicitly deferred by the owner.

### Exact-revision production deployment — verified 17 September 2026

**Classification:** `PRODUCTION_MATCHES_CURRENT_BASELINE` / `ACCEPTED_WITH_ADVISORY`

Completed outcomes:
1. deployed clean approved revision `128ac403c2fcf57f4f471543ea79b2c4f0ed6369` (`128ac40`) through the existing Cloudflare Workers Static Assets configuration
2. recorded Cloudflare version `3636917e-ddf5-4b98-9737-c44f0478f226` at the canonical workers.dev endpoint
3. matched production HTML, main JavaScript, CSS, and lazy 3D chunk byte-for-byte to the local release build
4. verified direct SPA responses for `/`, `/dashboard`, `/facilities`, `/map`, `/map?mode=emergency`, `/login`, and `/admin`
5. verified the canonical SCC logo and social-preview PNGs return real `image/png`, while obsolete JPG/v2/v3 paths return SPA HTML rather than approved image assets
6. verified complete canonical OG/Twitter metadata, production Supabase Auth settings initialization, and a read-only public Data API request
7. confirmed the heavy 3D chunk remains lazy and absent from initial HTML

Advisories:
- the connected graphical browser runtime was unavailable, so authenticated graphical Admin interaction was not repeated; byte-identical production bundles, deterministic Auth/Admin/render suites, direct route responses, and live read-only Supabase initialization provide deployment-equivalence evidence without replacing manual QA
- **MANUAL DEVICE QA PENDING** for real desktop/tablet/mobile, keyboard-only, screen-reader, physical camera/QR, and representative WebGL-capable/fallback devices
- the existing approximately 878 kB lazy 3D chunk, dependency advisories, manifest-only PWA status, and deferred grounded CLARA integration remain unchanged

### Manual acceptance attempt — 17 September 2026

**Classification:** `PARTIAL` / `BLOCKED_BY_TOOLING`

Completed within the available environment:
1. reconfirmed that production serves the approved main JavaScript/CSS fingerprints and canonical PNG assets, with no runtime-file change after deployed revision `128ac40`
2. reran route rendering, Dashboard, QR, Emergency, 3D/WebGL fallback, Admin CMS, and Phase 8C.2 deterministic checks successfully
3. statically reviewed responsive density/breakpoint behavior, map/mobile/Admin reflow, semantic labels, focus treatment, reduced-motion support, error/status roles, and non-color cues
4. preserved the clean worktree, `stash@{0}`, absent `.env.phase8a.session`, production data, and deployed revision; no fix or redeployment was performed

Blocked/pending evidence:
- the approved in-app browser failed before page launch with `failed to write kernel assets` (OS error 3), so none of the six requested viewports received a fresh manual graphical pass
- keyboard-only interaction, contrast, screen-reader output, physical camera/QR, and representative physical WebGL-device checks remain pending
- authenticated Admin visual QA was blocked by browser tooling before credentials were relevant; no temporary credentials were requested

Phase 3 therefore remains **IN PROGRESS**. The next authorized work is the same remaining manual acceptance matrix in a functioning graphical browser and on representative devices, not a new feature phase.

### Phase 3-MQA-1 — Primary Laptop Browser Acceptance — owner completed 17 September 2026

**Classification:** `ACCEPTED_WITH_ADVISORY`

Owner-provided manual evidence records:
- `1366x768` and `1280x800` were manually checked and found acceptable
- Dashboard, Facilities, Navigate 2D, Navigate 3D, CLARA, Login, and Admin were included
- a basic keyboard smoke check was included
- no blocker requiring an application change was found

Evidence boundaries:
- no screenshot set, browser/version, operating system, physical device model, per-screen findings, or detailed per-control results were supplied
- exact Tab/Shift+Tab order, Enter/Space/Escape and arrow-key behavior, focus-trap behavior, focus visibility, contrast, touch targets, screen-reader output, reduced-motion behavior, 3D interaction details, and performance observations are `NOT SPECIFICALLY DOCUMENTED`
- this evidence does not cover `1440x900`, `1024x768`, 768px tablet, approximately 390px mobile, physical QR/camera, or representative physical WebGL-device acceptance
- no WCAG, physical-device, or broad browser-support claim is added

Phase 3-MQA-1 closes the primary laptop-browser subset only. Phase 3 remains **IN PROGRESS** and may advance to Phase 3-MQA-2 — Remaining Responsive Viewport Acceptance.

### Phase 3-MQA-2 — Remaining Responsive Viewport Acceptance — owner completed 17 September 2026

**Classification:** `ACCEPTED_WITH_ADVISORY`

Owner-provided manual evidence records:
- `1440x900` — `OWNER_REPORTED_MANUAL_BROWSER_PASS`
- `1024x768` — `OWNER_REPORTED_MANUAL_BROWSER_PASS`
- 768px tablet viewport — `OWNER_REPORTED_RESPONSIVE_VIEWPORT_PASS`
- approximately 390px mobile viewport — `OWNER_REPORTED_RESPONSIVE_VIEWPORT_PASS`
- the owner reported `NO BLOCKER FOUND`

The responsive application scope included, where applicable, Home, Dashboard, Facilities, Facility Detail, Navigate 2D/3D, Events, Emergency, CLARA, Login, and Admin. This is an overall responsive result only; individual per-screen PASS claims and detailed findings are `NOT SPECIFICALLY DOCUMENTED`.

Evidence boundaries:
- screenshots, browser/version, operating system, physical-device model, per-screen measurements, detailed interactions, and performance observations were not supplied
- tablet/mobile evidence is viewport/browser evidence; `PHYSICAL_DEVICE_DETAILS_NOT_DOCUMENTED`
- MQA-2 does not add a WCAG, screen-reader, keyboard-only, physical QR/camera, representative WebGL-device, or exact browser/OS certification claim

MQA-1 and MQA-2 now cover all six canonical responsive viewport targets at the owner-reported evidence level. Phase 3 remains **IN PROGRESS** and may advance to Phase 3-MQA-3 — Keyboard-Only and Accessibility Manual Acceptance.

### Phase 3-MQA-3 — Keyboard-Only and Accessibility Manual Acceptance — owner completed 17 September 2026

**Classification:** `ACCEPTED_WITH_ADVISORY`

Owner-provided manual evidence records `OWNER_REPORTED_KEYBOARD_ACCESSIBILITY_PASS` for the tested behavior, where applicable:
- keyboard-only navigation using Tab and Shift+Tab
- Enter activation and Space activation where appropriate
- Escape/dialog behavior
- focus visibility, forms/navigation usability, and no observed keyboard blocker or trap
- readable visual contrast, reduced-motion behavior, and usability at approximately 200% zoom
- labels, headings, status, and error presentation
- no blocker requiring an application change was found

The evidence applies to the current approved CampusNav production baseline. Relevant application scope may include global navigation, Login, Dashboard, Facilities, Navigate controls, dialogs/drawers, CLARA controls, and Admin navigation/forms; individual screen and control PASS claims are `NOT SPECIFICALLY_DOCUMENTED`.

Evidence boundaries:
- exact browser/OS, screenshots, assistive-technology configuration, detailed focus order, individual control behavior, and per-screen findings were not supplied
- `SCREEN_READER_QA_PENDING`; screen-reader behavior is not inferred from keyboard, visual, or semantic-markup evidence
- no WCAG conformance, physical tablet/mobile certification, physical QR/camera PASS, representative WebGL-device PASS, or exact browser/OS certification is claimed
- authenticated Admin was within earlier general owner-reported screen scope, but authentication state and detailed protected-form behavior remain `NOT SPECIFICALLY_DOCUMENTED`

Phase 3 remains **IN PROGRESS**, and **Phase 3-MQA-4 — Screen-Reader and Authenticated Admin Manual Acceptance** is the current unfinished subphase. Under `72-definition-of-ready.md`, that subset is `READY`: its goal, contracts, boundaries, security context, and acceptance evidence are defined. Completion still requires a functioning screen-reader/browser environment and temporary ignored-session credentials only if authenticated Admin verification needs them. Physical QR/camera and representative WebGL-device acceptance remain later Phase 3 manual-QA work.

### Phase 3-MQA-4 — Screen-Reader and Authenticated Admin Manual Acceptance — historical attempt recovered 19 September 2026

**Classification:** `PARTIAL` / `BLOCKED_BY_TOOLING`

This documentation-only recovery records a previous-laptop execution attempt whose original documentation changes were not pushed. The original attempt date was not supplied. It is historical evidence, not a new execution attempt.

Readiness and execution result:
- Definition of Ready: `READY`
- execution result: `BLOCKED_BY_TOOLING`
- the browser failed before production launch with `failed to write kernel assets` (OS error 3)
- the failure was environmental/browser-tooling failure; no application defect was found

Evidence boundaries:
- `SCREEN_READER_QA_PENDING`; no successful screen-reader environment was launched
- no authenticated browser Admin session was completed
- no `SUPER_ADMIN_MANUAL_ADMIN_PASS` or `DEPARTMENT_ADMIN_MANUAL_BROWSER_PASS` is claimed
- requested Admin graphical/manual checks remain `IMPLEMENTED_UNVERIFIED`
- AccessDenied, session, and logout behavior were not manually tested during that attempt
- no WCAG conformance, physical-device, QR-camera, representative WebGL-device, or exact browser/OS certification is claimed

Execution safety boundary:
- no test fixtures were created and no institutional records were mutated
- no temporary credentials were requested or used
- `.env.phase8a.session` was absent, untracked, and ignored
- no code fix or production deployment occurred

Phase 3 remains **IN PROGRESS**. Phase 3-MQA-4 remains the current unfinished subphase and the exact next canonical work: complete real screen-reader manual acceptance and real authenticated Admin manual acceptance in a functioning environment. This recovered tooling failure does not authorize later QR/camera, WebGL/device, CLARA, PWA, reports, map-editor, GPS/BLE, or dependency-upgrade work.

### Phase 3-MQA-4 — Screen-Reader and Authenticated Admin Manual Acceptance — owner completed 19 September 2026

**Classification:** `ACCEPTED_WITH_ADVISORY`

This resumed owner-reported run is later evidence and controls the current MQA-4 status. It does not delete, rewrite, or replace the preserved historical `PARTIAL` / `BLOCKED_BY_TOOLING` attempt above.

Screen-reader evidence:
- environment: Windows, Windows Narrator, and a functioning graphical browser environment
- `OWNER_REPORTED_SCREEN_READER_PASS` for Home, Dashboard, Facilities, Navigate, Login, and CLARA
- `OWNER_REPORTED_SCREEN_READER_PASS` for navigation elements, buttons and links, heading structure, form labels, and status/error presentation
- no blocker was observed during the manual screen-reader smoke test

Authenticated Admin evidence:
- actual browser role tested: `SUPER_ADMIN`
- `SUPER_ADMIN_MANUAL_ADMIN_PASS` for Admin Overview, Announcements, Events, Facility Advisories, Notifications, Audit, Personnel, Courses, Sections, Class Schedules, Schedule Exceptions, Assignments, Consultation Hours, Check-ins, and Availability Overrides
- `SUPER_ADMIN_MANUAL_ADMIN_PASS` for authenticated Admin navigation, page/layout readability, tables/cards, form usability, labels, dialogs, validation presentation, and absence of an observed clipping/overflow blocker
- session behavior and logout behavior passed in the tested `SUPER_ADMIN` browser session
- no application blocker was observed

Evidence boundaries:
- `DEPARTMENT_ADMIN_BROWSER_NOT_TESTED`; existing SQL/RLS/backend evidence is not converted into a Department Admin browser pass
- `ACCESSDENIED_MANUAL_QA_NOT_TESTED`; successful `SUPER_ADMIN` use does not establish an AccessDenied pass
- no WCAG conformance, full accessibility certification, screen-reader certification, physical-device certification, physical QR/camera acceptance, representative WebGL-device acceptance, or broad browser-support claim is added
- this is owner-reported manual smoke evidence, not formal certification
- no credential value, fixture, institutional-data mutation, environment-file change, application change, or deployment is part of this documentation task

MQA-4 therefore advances to `ACCEPTED_WITH_ADVISORY`. Its required screen-reader smoke and authenticated `SUPER_ADMIN` manual subsets are complete at the evidence level supplied; the Department Admin and AccessDenied boundaries remain explicit advisories rather than inferred passes. Phase 3 remains **IN PROGRESS**.

### Phase 3-MQA-5 — Physical QR/Camera and Manual-Fallback Acceptance — next authorized subphase

**Readiness:** `READY` under `72-definition-of-ready.md`

**Execution:** `NOT_STARTED`

Definition-of-Ready basis:
- the goal is to obtain real camera-device evidence for the thesis-core QR positioning flow without changing the current build
- QR positioning and manual current-location fallback are thesis-core; AR Guidance remains optional, deferred, unimplemented, and out of scope
- controlling contracts are `10-navigation-engine.md`, `11-spatial-map-source-of-truth.md`, `20-data-provenance-verification.md`, `21-error-state-contract.md`, `25-performance-budget.md`, `26-accessibility-standards.md`, `40-state-management-contract.md`, `46-map-versioning-change-control.md`, `55-browser-device-compatibility.md`, and `58-module-acceptance-criteria.md`
- the canonical QR payload/checkpoint registry and checkpoint-to-node relationships are known; checkpoint installation/placement remains pending verification and must not be certified by this smoke test
- no authenticated role or data write is required; camera permission must be explicit, frames remain locally processed and are not recorded, stored, or uploaded, and manual selection remains available
- expected permission-denied, unavailable-camera, invalid/unknown/inactive/unlinked checkpoint, and safe no-location-change states are defined
- acceptance cases are a recognized canonical QR resolving the intended current node, invalid QR failing safely without changing location, denied/unavailable camera preserving manual fallback, current location/destination/route state remaining coherent, and normal routing continuing through the existing A* engine
- affected QR/node/graph relationships are identified, and `QR-3F-LIBRARY → Registrar’s Office` is the selected regression route

Execution requires a camera-capable physical device, a graphical browser in a secure context, and a scannable canonical test label/payload. Those are execution dependencies, not missing contract decisions. The exact next work is MQA-5 only; representative WebGL-device acceptance remains a later Phase 3 subset and is not started here.

### Phase 3-MQA-5 — Physical QR/Camera and Manual-Fallback Acceptance — owner completed 19 September 2026

**Classification:** `ACCEPTED_WITH_ADVISORY`

Owner-reported physical-device evidence:
- `MQA5_OWNER_REPORTED_PHYSICAL_QR_CAMERA_PASS` on the production HTTPS Navigate page
- the camera prompt appeared, permission was granted, the physical scanner feed opened, and rear/environment-camera behavior worked as expected
- the valid canonical payload resolved to `QR-3F-LIBRARY`, Library on the Third Floor, and displayed the QR-confirmed positioning state
- Registrar’s Office remained selected and the existing A* engine generated the canonical `3F → 4F → 5F` route; QR established only the origin checkpoint and introduced no separate routing logic
- an unknown/invalid QR was rejected without replacing the valid location, inventing an origin, or inventing a route; retry and manual fallback remained available
- manual fallback to Library on 3F worked, remained distinguishable from QR-confirmed positioning, preserved Registrar’s Office, and generated the same multi-floor route through the existing A* engine
- camera-denied/blocked behavior produced a usable error/fallback state; Set Location Manually remained usable and the user was not trapped
- the camera indicator/feed stopped after successful detection, exit, or switching to manual location
- no application blocker or defect was observed

Evidence boundaries:
- exact device model/type and OS/browser names and versions are `NOT_DOCUMENTED`; this single physical pass is not broad device/browser certification
- `QR_PAYLOAD_CAMERA_ACCEPTANCE` is recorded, but the QR came from a temporary test medium; `PHYSICAL_LABEL_PLACEMENT_PENDING` remains and the test image is not official installed campus signage
- the owner observed no visible recording, upload, or person-identification behavior; this is a limited observation, not backend/privacy certification
- QR/manual positioning establishes a discrete origin only; no continuous indoor positioning, AI routing, or A*-as-AI claim is added
- no all-mobile-device, iOS, Android, broad-browser, installed-checkpoint, or broad physical-device certification is claimed

MQA-5 therefore advances to `ACCEPTED_WITH_ADVISORY`. Phase 3 remains **IN PROGRESS**.

### Phase 3-MQA-6 — Representative WebGL-Capable and WebGL-Fallback Device Acceptance — next authorized subphase

**Readiness:** `READY` under `72-definition-of-ready.md`

**Execution:** `NOT_STARTED`

Definition-of-Ready basis:
- the goal is to obtain representative physical-device evidence for the thesis-core 3D navigation path and its required usable 2D fallback
- controlling contracts are `10-navigation-engine.md`, `11-spatial-map-source-of-truth.md`, `21-error-state-contract.md`, `25-performance-budget.md`, `26-accessibility-standards.md`, `40-state-management-contract.md`, `55-browser-device-compatibility.md`, `58-module-acceptance-criteria.md`, and `60-core-vs-optional-feature-matrix.md`
- the canonical spatial dataset, central 2D→3D transform, shared A* route, current-location/destination state, floor relationships, and fallback behavior are defined; no authenticated role or data write is required
- expected unsupported/failed-WebGL behavior is a clear `3D view unavailable; switched to 2D.` state with current location, destination, and route preserved
- required acceptance cases are successful 3D loading on a representative WebGL-capable physical device, floor focus/isolation and current/destination/path rendering from shared state, 2D↔3D state preservation, and usable automatic or selected 2D fallback in a real WebGL-disabled/unsupported/failure environment
- `Library 3F → Registrar’s Office 5F` is the selected multi-floor regression route; 2D and 3D must retain the same canonical node sequence across `3F → 4F → 5F`

Execution requires documented device model/type, OS and browser/version for at least one representative WebGL-capable physical device plus a real reproducible WebGL-disabled/unsupported/failure environment. These are execution dependencies, not missing contract decisions. MQA-6 is the single exact next work and is not started here. Broader physical-device evidence and installed QR-label placement verification remain later gaps.

### Phase 3-MQA-6 — Representative WebGL-Capable and WebGL-Fallback Device Acceptance — owner completed 19 September 2026

**Classification:** `ACCEPTED_WITH_ADVISORY`

Owner-reported representative evidence:
- `OWNER_REPORTED_REPRESENTATIVE_WEBGL_CAPABLE_PASS` on the production HTTPS Navigate page in a WebGL-capable browser environment
- 3D loaded successfully; campus/floor geometry plus current-location and destination markers rendered
- the canonical `Library 3F → Registrar’s Office 5F` A* route remained `3F → 4F → 5F`; 3D remained a presentation of the shared spatial data, route sequence, and navigation state rather than a separate routing engine
- Exploded, Stacked, 3F/4F/5F floor selection, Isolate Floor, Focus Floor, Entire Building, Reset View, orbit, zoom, pan, and applicable facility selection/focus behavior passed
- multi-floor transitions remained understandable; 2D → 3D → 2D and return-to-3D switching preserved navigation state
- no major clipping, unusable-control blocker, crash, blank scene, infinite loading state, or unrecoverable state was observed; the user could return to 2D and continue navigation
- `OWNER_REPORTED_WEBGL_FALLBACK_PASS` in the prepared reproducible WebGL-disabled Edge session using an isolated profile and WebGL-disabling launch flags
- the disabled session showed no fake 3D success, remained in or returned to 2D without a crash, permanent blank state, or infinite loading state, and preserved current location, Registrar’s Office, the active `3F → 4F → 5F` route, selected-floor/applicable navigation state, textual instructions, and usable 2D route-floor navigation

Evidence boundaries and advisories:
- physical device model/type, Windows edition/version/build, GPU, exact successful-execution browser version, capable-session native WebGL probe values, and fallback-session native WebGL probe values are `NOT_DOCUMENTED`
- `EXACT_FALLBACK_WORDING_NOT_DOCUMENTED`; the owner did not supply the exact message visually observed during the successful disabled-session run
- the canonical copy is `3D view unavailable; switched to 2D.` while the implementation/precheck copy is `3D view is unavailable on this device. CampusNav has switched to 2D.`; this is retained as `ADVISORY_UI_COPY_MISMATCH`, not treated as a behavioral acceptance blocker because the owner-reported safe fallback, understandable unavailable state, 2D continuation, and route/state preservation passed
- the existing approximately 878 kB lazy 3D chunk advisory remains; successful representative loading is not performance, universal-smoothness, GPU, broad-device, broad-browser, or universal-WebGL certification
- no A*-as-AI, Three.js/WebGL-as-route-intelligence, independent-3D-spatial-truth, or separate-3D-routing claim is added

MQA-6 therefore advances to `ACCEPTED_WITH_ADVISORY`. Phase 3 remains **IN PROGRESS**.

### Phase 3-MQA-7 — Final Phase 3 Acceptance and Evidence Reconciliation — next authorized subphase

**Readiness:** `READY` under `72-definition-of-ready.md`

**Execution:** `NOT_STARTED`

Definition-of-Ready basis:
- the goal is to reconcile the accepted production baseline and Phase 3-MQA-1 through MQA-6 evidence, distinguish release blockers from retained advisories, and determine the final Phase 3 acceptance status without starting a new feature
- controlling sources are `09-progress-roadmap.md`, `28-definition-of-done.md`, `30-known-limitations.md`, `55-browser-device-compatibility.md`, `58-module-acceptance-criteria.md`, `63-implementation-status-registry.md`, `70-thesis-evaluation-gap-register.md`, and `73-quality-gates-release-checklist.md`
- the evidence source is the existing canonical deployment, deterministic, and owner-reported acceptance record; undocumented details must remain undocumented and cannot be upgraded into certification
- no authenticated role, credential, institutional-data write, new sensor collection, application change, deployment, or external research decision is required to perform the reconciliation
- acceptance cases are cross-document status consistency; explicit classification of the fallback-copy mismatch, approximately 878 kB lazy-chunk advisory, broader physical-device evidence, installed QR-label placement, Department Admin/AccessDenied browser gaps, and other retained boundaries; no unsupported WCAG, device, browser, GPU, performance, installation, AI-routing, CLARA, PWA, or AR claim; and one final evidence-aware Phase 3 status/next-step decision

MQA-7 is ready because its scope, sources, boundaries, and acceptance checks are defined and its inputs already exist. It is not started by the MQA-6 evidence update. Broader physical-device evidence and installed QR-label placement verification remain inputs/gaps to classify during reconciliation, not silently inferred passes.

### Phase 3-MQA-7 — Final Phase 3 Acceptance and Evidence Reconciliation — completed 19 September 2026

**Classification:** `ACCEPTED_WITH_ADVISORY`

Final reconciliation:
- the exact-revision production baseline and MQA-1 through MQA-6 are accepted at their recorded evidence levels; no unresolved Phase 3 release blocker is supported by the canonical record
- broader physical-device/browser coverage, installed QR-label placement, MQA-5 device/OS/browser details, MQA-6 device/OS/GPU/browser and native-probe details, exact fallback wording, `ADVISORY_UI_COPY_MISMATCH`, the approximately 878 kB lazy 3D chunk, Department Admin browser coverage, AccessDenied manual coverage, and earlier evidence granularity remain nonblocking advisories
- authorized institutional map/facility/hours/services/schedule/personnel data, check-in authority, and emergency coverage/sign-off are owner/institutional dependencies; conservative pending/unavailable states and strict emergency no-route behavior prevent them from becoming Phase 3 acceptance blockers
- the adviser-approved title treatment, evaluation instrument, respondents/sample, metrics, thresholds, and statistical treatment are research dependencies outside software release acceptance
- CLARA provider/tool grounding, PWA/offline caching, map editor/version rollback, reports/analytics, AR Guidance, GPS/BLE/UWB, and other optional expansion remain deferred or outside Phase 3
- the final-system thesis/demo Definition of Done remains incomplete where `28-definition-of-done.md` marks items `UNSATISFIED` or `DEFERRED`; closing Phase 3 does not convert those items into implementation or acceptance

Phase 3 is therefore **COMPLETE — `ACCEPTED_WITH_ADVISORY`**. This closes the defined accepted-baseline release and manual-QA scope without claiming WCAG conformance, broad device/browser/GPU/performance certification, installed QR signage, complete institutional data, adviser approval, or completion of deferred features.

### Exact next canonical workstream — Post-Phase-3 Thesis/Defense Scope, Institutional Data, and Evaluation Decision Gate

**Historical readiness at Phase 3 closure:** `READY` for decision coordination; downstream implementation was `NOT_READY` / `BLOCKED` until its applicable decisions and authorized inputs existed. `DEC-ROADMAP-002` later supersedes this as active software sequencing without resolving the external decisions.

The gate may start because unresolved questions, evidence boundaries, and decision owners are identified. It must obtain or explicitly defer: adviser-approved title/evaluation methodology; authorized map/facility/hours/services/schedule/personnel fields and check-in authority; emergency data ownership, coverage, verification dates, and safety sign-off; final defense scope for PWA/offline, map editor/versioning, reports/analytics, grounded CLARA, and AR Guidance; and a thesis-demo rehearsal plan using verified or clearly demo-labeled data. No feature implementation is authorized merely by opening this gate.

### Owner-approved proposed final defense scope baseline — 19 September 2026

**Decision:** `OWNER APPROVED / ADVISER CONFIRMATION REQUIRED` under `DEC-DEFENSE-001`

The owner proposes the currently accepted responsive web, GF–5F shared spatial/A* navigation, 2D/3D/multi-floor, QR/manual positioning, Facilities, Dashboard, Auth/RBAC, Admin CMS, academic/personnel engine, accepted Supabase foundation, and strict Emergency/safe-no-route behavior as `CORE_FOR_DEFENSE` at their documented evidence levels. A* remains pathfinding and is not described as AI.

Grounded server-side CLARA/Groq and PWA/offline emergency caching are `CONDITIONAL / DEFERRED PENDING ADVISER DIRECTION`. The current local CLARA matcher may be demonstrated only as its documented conservative matcher. AR Guidance and the other optional expansions listed below remain deferred and are not required by the owner-approved proposal.

The owner also approves the proposed verified/demo/unavailable defense-data policy: verified claims require provenance and authority evidence; demo/sample data must be visibly labeled; unavailable/pending data may remain unavailable; and no demo value becomes institutional, personnel-presence, or emergency truth. Emergency and schedule/personnel claims remain within their canonical safety, provenance, wording, and institutional-approval boundaries.

**Historical exact next actionable work at this decision gate:** Prepare Adviser Confirmation Package.

**Readiness:** `READY` for documentation/request-package preparation. The package must request adviser decisions on final defense scope, formal tablet-based versus responsive-web title treatment, grounded CLARA, PWA/offline, the proposed data policy, and research/evaluation methodology. Adviser approval has not been obtained, and no downstream feature implementation is authorized.

### Adviser confirmation package — prepared 20 September 2026

**Status:** `PREPARED / AWAITING_ADVISER_CONFIRMATION`

`75-adviser-confirmation-package.md` now provides the adviser-facing decision form for final defense scope, title treatment, grounded CLARA, PWA/offline, verified/demo/unavailable data policy, research/evaluation methodology, optional/deferred features, institutional-approval boundaries, and a final-page decision summary. No choice is preselected, and package preparation supplies no adviser or institutional approval.

**External decision action:** `HUMAN ACTION REQUIRED — OBTAIN ADVISER CONFIRMATION`.

The prepared package remains pending external evidence and is not adviser-approved. Under `DEC-ROADMAP-002`, waiting for that evidence no longer controls safe owner-directed software-development sequencing. Final thesis/defense claims and any adviser-dependent feature requirement remain unresolved.

## Phase 4 — Core Facility & Service Workflow Completion

**Status:** `IN_PROGRESS — FS-1A ACCEPTED_WITH_ADVISORY`

**Owner authorization:** `DEC-ROADMAP-002 — OWNER APPROVED 20 September 2026`

### Goal

Build the complete software workflows for facility operational information, services, hours, status, search/recommendation, Admin management, media, Dashboard integration, provenance, security, audit, and Realtime. Official institutional completeness is not claimed. Unknown values remain unavailable/pending; implementation and testing may use isolated synthetic `DEVELOPMENT` or visibly labeled `DEMO` fixtures.

### Preserved baseline and operational-overlay boundary

Phase 1 remains `COMPLETE`; Phase 2 and Phase 3 remain `COMPLETE — ACCEPTED_WITH_ADVISORY`. Phase 4 uses clean `main` as the authoritative implementation baseline and does not use the backup/reference `wip/claude-sidebar-redesign` branch.

Supabase facility operational records are an **operational overlay** keyed by existing canonical facility IDs. They must not create a second facility identity system, spatial dataset, navigation truth, or routing system. Existing geometry, nodes/edges, A*, QR/manual positioning, emergency-approved-only routing, and schedule/personnel truth rules remain controlling.

### Objectives

1. facility operational profiles
2. administrator-managed service catalog
3. approved service aliases
4. facility-service mappings
5. weekly operating hours
6. dated schedule/hour exceptions
7. `Asia/Manila` facility-status engine
8. operational advisory/status precedence
9. shared facility search/discovery
10. configured service-based facility recommendations
11. facility Admin management workflows
12. safe media/image lifecycle
13. public Facilities/detail enrichment
14. Dashboard office-availability integration
15. RLS, trusted audit, Realtime, and validation
16. provenance plus `DEMO` / `PENDING_VERIFICATION` / `VERIFIED` handling
17. regression protection for navigation, QR, Emergency, and personnel/schedules

### Implementation sequence

1. **Phase 4-FS-1 — Facility Operational Data and Service Foundation** — `IN_PROGRESS — FS-1A ACCEPTED_WITH_ADVISORY`
2. **Phase 4-FS-2 — Operating Hours and Facility Status Engine** — `NOT_STARTED`
3. **Phase 4-FS-3 — Facility and Service Admin Workflows** — `NOT_STARTED`
4. **Phase 4-FS-4 — Public Facilities, Search and Recommendation** — `NOT_STARTED`
5. **Phase 4-FS-5 — Facility Media Management** — `NOT_STARTED`
6. **Phase 4-FS-6 — Dashboard and Realtime Integration** — `NOT_STARTED`
7. **Phase 4-FS-7 — Final Acceptance and Evidence Reconciliation** — `NOT_STARTED`

### Phase 4-FS-1 Definition of Ready

**Result:** `READY_WITH_BOUNDARIES`

FS-1 is limited to a version-controlled Supabase schema/migration; operational facility profiles; services and approved aliases; facility-service mappings; provenance/lifecycle fields; RLS foundations; trusted-audit foundations; and provider-neutral `FacilityService` contracts. It must not seed official institutional records, alter spatial/navigation truth, implement later Phase 4 UI/status/media/Dashboard subphases, or start an excluded feature.

Unknown institutional owners/data do not block the generic foundation because the schema and services explicitly preserve unavailable/pending states and allow isolated labeled fixtures. FS-1A acceptance ran under supported Node 22; dependency/package changes remain outside Phase 4 adoption unless separately authorized.

**Exact next implementation task after separate authorization:** Phase 4-FS-1B within the existing Facility Operational Data and Service Foundation boundary. FS-1B is `NOT_STARTED` by this acceptance update.

### Phase 4-FS-1A implementation snapshot — 20 September 2026

**Status:** `IMPLEMENTED_UNVERIFIED`

The version-controlled FS-1A migration now defines facility operational profiles, services, approved aliases, configured facility-service mappings, lifecycle/provenance constraints, public security-invoker projections, `SUPER_ADMIN`-only write policies, and trusted audit triggers. It contains no official records and no hours, status engine, Admin/public UI, media, Dashboard/Realtime, spatial, routing, QR, emergency, or personnel expansion.

The deterministic schema/scope test passes against all 95 canonical local facility IDs. A 20 September 2026 acceptance attempt also passed the full requested Node 22 regression set, ESLint, typecheck, route rendering, and production build after confirmed untracked dependency residue was relocated outside the repository.

At that earlier acceptance attempt, real database evidence remained incomplete: the actual CampusNav SQL target was not yet safely linked, no migration or fixture mutation was performed, and no pgTAP assertion was claimed. FS-1A therefore remained `IMPLEMENTED_UNVERIFIED` at that checkpoint.

### Phase 4-FS-1A linked acceptance — 20 September 2026

**Status:** `ACCEPTED_WITH_ADVISORY`

The pinned Supabase CLI is now safely linked to actual CampusNav project `yiuwvyznteizxxmjqcfn`. Migration history matches locally and remotely through `20260920122741`. Read-only catalog verification confirms all four tables, RLS on every table, all four `security_invoker`/`security_barrier` public views, the complete policy set, trusted audit/update triggers, private audit functions with empty search paths and no `anon`/`authenticated` execute privilege, and no spatial/navigation columns in the overlay.

The owner-reported SQL Editor run directly demonstrated full-script execution through `ok 58` and rollback but did not visually establish assertions 1–57. A fresh linked rollback-only capture then returned `ok 1` through `ok 58`; a separate duplicate-mapping assertion and four anonymous/ordinary-authenticated update/delete assertions also passed. Post-run checks report zero FS-1A fixtures in all four tables and zero associated test auth users, role assignments, or audit rows. Node 22 deterministic FS-1A, ESLint, typecheck, and production build pass.

The advisory preserves the evidence-method distinction: the SQL Editor screenshot directly showed only assertion 58, while full 58/58 evidence came from an equivalent temporary-result collector because the pinned CLI normally returns only the final result set. The collector and all fixtures were transaction-local and rolled back. FS-1A is accepted; FS-1 remains in progress, and FS-1B was not started by this verification task.

## Later canonical work candidates

The following remain outside Phase 4 and require separate owner authorization plus their own Definition-of-Ready review:
- PWA service worker and versioned offline emergency cache
- map administration, calibration, versioning, and coherent rollback
- privacy-conscious user reporting and analytics
- grounded server-side CLARA tool integration after its internal services and authorization are accepted
- AR-Assisted Camera Navigation / AR Guidance Mode under `74-ar-assisted-navigation-contract.md`

### AR-Assisted Camera Navigation planning adoption — 19 September 2026

**Status:** `PROPOSED / DEFERRED / NOT_IMPLEMENTED / NOT_READY`

The owner approved AR Guidance for canonical planning only. It is an optional presentation layer over the existing A* route and canonical spatial data, using QR/manual location verification without claiming continuous indoor tracking. No AR stage is authorized to start. Phase 3 is **COMPLETE — `ACCEPTED_WITH_ADVISORY`**; `DEC-DEFENSE-001` excludes AR from the owner-proposed defense core, the adviser package remains pending, and `DEC-ROADMAP-002` makes Phase 4-FS-1 the exact next implementation subphase.

## Blocked by institutional data or decision

These items block official population or claims, not the generic Phase 4 software workflows that safely support unavailable/pending/demo states:

- final map/facility verification owner
- approved operating hours and facility service mappings
- approved class schedule and public personnel dataset
- exact public personnel fields and check-in authority
- emergency data owner, verification dates, and missing floor coverage
- final PWA/map-editor scope for the defense build
- final responsive-web versus formal tablet-title treatment
- final thesis evaluation method and acceptance thresholds

## Thesis-core boundary

CampusNav remains centered on verified campus navigation and information. It must remain usable without BLE, UWB, photorealistic 3D, a paid AI dependency, or generic LMS/ERP features.
