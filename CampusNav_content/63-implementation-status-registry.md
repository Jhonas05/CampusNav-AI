# CampusNav AI — Implementation Status Registry

## Purpose
Separate **required/design** documentation from what is actually implemented. Update only from code, tests, or live verification. The canonical development roadmap was reset by `DEC-ROADMAP-001`; existing implementation is preserved as baseline evidence and is not automatically complete under the reset roadmap.

## AR-Assisted Camera Navigation / AR Guidance Mode — canonical planning adoption 19 September 2026

**Classification:** `PROPOSED / DEFERRED / NOT_IMPLEMENTED / NOT_READY`

| Area | Classification | Evidence / boundary |
|---|---|---|
| Owner authorization | `PLANNING_ONLY` | `DEC-AR-001` authorizes canonical concept documentation, not implementation |
| Routing architecture | `REQUIRED_FUTURE_CONTRACT` | AR Guidance must consume the existing A* route sequence and canonical spatial data; no second routing engine or coordinate truth is permitted |
| Positioning | `REQUIRED_FUTURE_CONTRACT` | QR checkpoint is primary and manual confirmation is fallback; no continuous indoor tracking or autonomous camera localization claim |
| Camera/privacy | `REQUIRED_FUTURE_CONTRACT` | Explicit permission, local use, no recording/upload/persistence by default, and no facial/person recognition |
| Accessibility/fallback | `REQUIRED_FUTURE_CONTRACT` | 2D/3D/text alternatives and QR/manual verification remain available; unsupported camera behavior must fail safely |
| Emergency | `DEFERRED_CONDITIONAL` | AR may only present an already-approved emergency route after separate canonical and safety approval; no normal-route fallback |
| Implementation evidence | `NOT_IMPLEMENTED` | No AR source, route-step adapter, camera-guidance shell, overlay, schema, dependency, test, or deployment is claimed by this documentation task |
| Definition of Ready | `NOT_READY` | Route-step semantics, device matrix, camera/QR lifecycle, privacy/security verification, performance thresholds, accessibility plan, and emergency-stage authority remain unresolved |
| Active sequencing | `DEFERRED` | Current Phase 3 remains `IN PROGRESS`; MQA-5 is `ACCEPTED_WITH_ADVISORY`, and Phase 3-MQA-6 Representative WebGL-Capable and WebGL-Fallback Device Acceptance is the exact next canonical work |

`74-ar-assisted-navigation-contract.md` is a future adoption contract, not implementation proof. Do not start AR-0 or any later AR stage until a future roadmap authorization exists and the Definition of Ready passes.

## Phase 3-MQA-4 screen-reader and authenticated Admin manual acceptance — historical attempt recovered 19 September 2026

**Subset classification:** `PARTIAL` / `BLOCKED_BY_TOOLING`

The original attempt date was not supplied. This section restores previous-laptop evidence whose documentation changes were not pushed; it does not describe a new execution attempt.

| Area | Classification | Historical evidence / boundary |
|---|---|---|
| Definition of Ready | `READY` | Goal, contracts, accessibility boundary, Auth/Admin security context, and required acceptance evidence were defined before execution |
| Execution | `BLOCKED_BY_TOOLING` | The browser failed before production launch with `failed to write kernel assets` (OS error 3) |
| Screen reader | `SCREEN_READER_QA_PENDING` | No successful screen-reader environment was launched; no screen-reader manual acceptance evidence exists |
| Authenticated Admin | `IMPLEMENTED_UNVERIFIED` | No authenticated browser Admin session was completed; requested graphical/manual Admin checks remain unverified |
| Role-specific Admin claims | `NOT_CLAIMED` | No `SUPER_ADMIN_MANUAL_ADMIN_PASS` or `DEPARTMENT_ADMIN_MANUAL_BROWSER_PASS` is claimed |
| Auth/session checks | `NOT_TESTED_MANUALLY` | AccessDenied, session, and logout behavior were not manually tested during this attempt |
| Fixtures and institutional data | `UNCHANGED` | No test fixtures were created and no institutional records were mutated |
| Credentials and session file | `NOT_USED` | No temporary credentials were requested or used; `.env.phase8a.session` was absent, untracked, and ignored |
| Defect outcome | `NO_APPLICATION_DEFECT_FOUND` | Failure was classified as environmental/browser-tooling failure; no code fix was justified or made |
| Deployment | `NOT_PERFORMED` | No production deployment occurred |
| Conformance/device claims | `NOT_CLAIMED` | No WCAG conformance, physical-device certification, QR-camera acceptance, representative WebGL-device acceptance, or exact browser/OS certification is claimed |

This historical result does not close or supersede MQA-4. Phase 3 remains **IN PROGRESS**, and Phase 3-MQA-4 remains the current unfinished subphase. The exact next canonical work is real screen-reader manual acceptance plus real authenticated Admin manual acceptance in a functioning environment.

## Phase 3-MQA-4 screen-reader and authenticated Admin manual acceptance — owner completed 19 September 2026

**Subset classification:** `ACCEPTED_WITH_ADVISORY`

This resumed owner-reported evidence controls the current MQA-4 status without deleting, rewriting, or replacing the historical tooling-blocker record above.

| Area | Classification | Owner-provided evidence / boundary |
|---|---|---|
| Execution environment | `ACCEPTED_WITH_ADVISORY` | Windows, Windows Narrator, and a functioning graphical browser environment were used; browser name/version and formal assistive-technology configuration were not supplied |
| Screen-reader smoke | `OWNER_REPORTED_SCREEN_READER_PASS` | Home, Dashboard, Facilities, Navigate, Login, and CLARA were manually checked and reported acceptable with no blocker |
| Screen-reader semantics | `OWNER_REPORTED_SCREEN_READER_PASS` | Navigation elements, buttons and links, heading structure, form labels, and status/error presentation were manually checked and reported acceptable |
| Authenticated role | `SUPER_ADMIN_MANUAL_ADMIN_PASS` | The actual authenticated browser role tested was `SUPER_ADMIN` |
| Admin screen scope | `SUPER_ADMIN_MANUAL_ADMIN_PASS` | Admin Overview, Announcements, Events, Facility Advisories, Notifications, Audit, Personnel, Courses, Sections, Class Schedules, Schedule Exceptions, Assignments, Consultation Hours, Check-ins, and Availability Overrides passed the owner-reported manual check |
| Admin interaction/presentation | `SUPER_ADMIN_MANUAL_ADMIN_PASS` | Authenticated navigation, page/layout readability, tables/cards, form usability, labels, dialogs, validation presentation, and no observed clipping/overflow blocker were reported acceptable |
| Session and logout | `SUPER_ADMIN_MANUAL_ADMIN_PASS` | Session behavior and logout behavior passed in the tested browser session |
| AccessDenied | `ACCESSDENIED_MANUAL_QA_NOT_TESTED` | No explicit owner evidence states that an AccessDenied path was exercised; successful `SUPER_ADMIN` use is not treated as an AccessDenied pass |
| Department Admin | `DEPARTMENT_ADMIN_BROWSER_NOT_TESTED` | No separate `DEPARTMENT_ADMIN` browser session was reported; SQL/RLS/backend evidence is not converted into manual browser evidence |
| Defect outcome | `NO_APPLICATION_BLOCKER_OBSERVED` | The owner reported no blocker during either manual subset; no application fix is justified by this evidence |
| Safety/scope | `DOCUMENTATION_ONLY` | No credentials are recorded or exposed, and no fixture, institutional-data mutation, environment-file change, application change, or deployment is part of this documentation task |
| Conformance/device claims | `NOT_CLAIMED` | No WCAG conformance, full accessibility certification, screen-reader certification, physical-device certification, QR-camera acceptance, representative WebGL-device acceptance, or broad browser-support claim is added |

MQA-4 is complete at the supplied owner-reported smoke-evidence level. Its advisory boundaries remain explicit. Phase 3 remains **IN PROGRESS**.

## Phase 3-MQA-5 physical QR/camera and manual-fallback acceptance — next authorized subphase

**Readiness:** `READY`

**Execution:** `NOT_STARTED`

| Definition-of-Ready area | Result | Basis / boundary |
|---|---|---|
| Goal and scope | `READY` | Obtain real camera-device evidence for thesis-core QR positioning and manual fallback without changing the build; AR Guidance is excluded |
| Contracts and data | `READY` | QR payload/checkpoint registry, checkpoint-to-node relationships, one A* engine, safe errors, state preservation, local camera processing, and manual fallback are defined in the canonical navigation/map/UI contracts |
| Provenance | `READY_WITH_BOUNDARY` | Canonical checkpoint records and relationships are known, but physical installation/label placement remains pending verification; MQA-5 must not certify institutional installation accuracy |
| Security/privacy | `READY` | No authenticated role or write is required; permission is explicit, camera frames remain local and are not recorded/stored/uploaded, and no fixture or institutional-data mutation is required |
| Error/fallback cases | `READY` | Permission denied, camera unavailable, invalid/unknown/inactive/unlinked QR, unchanged location on failure, and manual current-location fallback are defined |
| Acceptance cases | `READY` | Recognized canonical QR resolves the intended node; invalid QR fails safely; denied/unavailable camera preserves manual fallback; state remains coherent; routing uses the existing A* engine |
| Map relationships and regression route | `READY` | Affected QR/node/graph relationships are identified; `QR-3F-LIBRARY → Registrar’s Office` is the selected regression route |
| Execution dependencies | `PENDING_EXECUTION` | A camera-capable physical device, graphical browser in a secure context, and scannable canonical test label/payload are required when the subphase is started |

MQA-5 is the single exact next Phase 3 subphase. Representative WebGL-device acceptance and broader physical-device evidence remain later gaps; neither is started by this readiness decision.

## Phase 3-MQA-5 physical QR/camera and manual-fallback acceptance — owner completed 19 September 2026

**Subset classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Owner-provided evidence / boundary |
|---|---|---|
| Overall physical result | `MQA5_OWNER_REPORTED_PHYSICAL_QR_CAMERA_PASS` | All prepared physical QR/camera, invalid-QR, manual-fallback, camera-denial, and camera-lifecycle checks were reported passed on the production HTTPS Navigate page; no blocker or defect was observed |
| Device details | `NOT_DOCUMENTED` | A real camera-capable physical device was used, but exact device model/type and OS/browser names and versions were not supplied |
| Camera permission/feed | `QR_PAYLOAD_CAMERA_ACCEPTANCE` | Permission prompt appeared, permission was granted, the scanner feed opened, and rear/environment-camera behavior worked as expected |
| Valid checkpoint/location | `QR_PAYLOAD_CAMERA_ACCEPTANCE` | The canonical QR resolved to `QR-3F-LIBRARY`, Library on the Third Floor, and displayed the QR-confirmed positioning state |
| Route | `ACCEPTED` | Registrar’s Office remained selected and the existing A* engine generated `3F → 4F → 5F`; QR supplied only the origin checkpoint and no second routing engine was introduced |
| Invalid/unknown QR | `ACCEPTED` | The invalid QR was rejected without replacing the valid location, inventing an origin, or inventing a route; retry and manual fallback remained available |
| Manual fallback | `ACCEPTED` | Library on 3F could be set manually, the manual state was distinguishable from QR-confirmed positioning, Registrar’s Office remained selected, and the same multi-floor A* route was generated |
| Camera denial/accessibility | `ACCEPTED` | Denied/blocked camera access produced a usable error/fallback state; Set Location Manually remained usable and the user was not trapped |
| Camera lifecycle | `ACCEPTED` | Camera indicator/feed stopped after successful detection, exit, or switching to manual location |
| Privacy observation | `OWNER_OBSERVED_NO_VISIBLE_RECORDING_UPLOAD_OR_PERSON_IDENTIFICATION` | This is an interface/device observation only and is not backend, privacy, or data-protection certification |
| Label placement | `PHYSICAL_LABEL_PLACEMENT_PENDING` | The QR came from a temporary test medium. `QR_PAYLOAD_CAMERA_ACCEPTANCE` does not establish installed campus checkpoint/signage acceptance |
| Claims boundary | `NOT_CLAIMED` | No continuous indoor positioning, AI routing, A*-as-AI, all-mobile-device support, broad browser support, iOS/Android certification, installed-label acceptance, or broad physical-device certification |
| Change scope | `DOCUMENTATION_ONLY` | No application, source, package, QR, routing, data, environment, deployment, or production change is part of this evidence record |

MQA-5 is complete at the supplied owner-reported physical-evidence level. Its device-detail, label-placement, and certification boundaries remain advisories. Phase 3 remains **IN PROGRESS**.

## Phase 3-MQA-6 representative WebGL-capable and WebGL-fallback device acceptance — next authorized subphase

**Readiness:** `READY`

**Execution:** `NOT_STARTED`

| Definition-of-Ready area | Result | Basis / boundary |
|---|---|---|
| Goal and core scope | `READY` | Obtain representative physical-device evidence for thesis-core 3D navigation and its required usable 2D fallback; no new feature is authorized |
| Contracts/data/state | `READY` | One spatial dataset, central 2D→3D transform, shared A* route, current/destination/path state, floor focus, and fallback contracts are identified |
| Security/privacy | `READY` | No authenticated role, data write, new sensor collection, or private-data handling is required |
| Error/fallback behavior | `READY` | WebGL unavailable/failure must provide a clear 2D fallback while preserving current location, destination, route, selected floor, and applicable progress |
| Acceptance cases | `READY` | Representative WebGL-capable physical-device 3D load/interaction, shared-state rendering, floor focus/isolation, 2D↔3D preservation, and real WebGL-disabled/unsupported/failure fallback are defined |
| Regression route | `READY` | `Library 3F → Registrar’s Office 5F` is selected; 2D and 3D must retain the same canonical `3F → 4F → 5F` route/node sequence |
| Execution dependencies | `PENDING_EXECUTION` | Documented device/OS/browser evidence is required for a representative WebGL-capable device and a real reproducible WebGL-disabled/unsupported/failure environment |

MQA-6 is the single exact next Phase 3 subphase and is not started. Broader physical-device evidence and installed QR-label placement verification remain later gaps.

## Phase 3-MQA-3 keyboard-only and accessibility manual acceptance — owner completed 17 September 2026

**Subset classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Owner-provided evidence / boundary |
|---|---|---|
| Evidence source | `ACCEPTED_WITH_ADVISORY` | The owner reports completing the keyboard-only/accessibility manual check on the current approved production baseline, finding the tested behavior acceptable, and finding no blocker requiring an application change. Detailed per-control, per-screen, browser/OS, screenshot, and assistive-technology evidence was not supplied |
| Keyboard-only operation | `OWNER_REPORTED_KEYBOARD_ACCESSIBILITY_PASS` | Keyboard-only navigation, Tab, Shift+Tab, Enter, Space where appropriate, and no observed keyboard blocker or trap were reported acceptable |
| Focus and navigation | `OWNER_REPORTED_KEYBOARD_ACCESSIBILITY_PASS` | Focus visibility and forms/navigation usability were reported acceptable; exact focus sequence and individual control results are `NOT SPECIFICALLY_DOCUMENTED` |
| Dialogs and forms | `OWNER_REPORTED_KEYBOARD_ACCESSIBILITY_PASS` | Escape/dialog behavior and applicable form use were reported acceptable; no per-dialog or per-form PASS claim is added |
| Visual and motion accessibility | `OWNER_REPORTED_KEYBOARD_ACCESSIBILITY_PASS` | Readable visual contrast, reduced-motion behavior, approximately 200% zoom usability, and labels/headings/status/error presentation were reported acceptable; formal measurements and per-screen findings are `NOT SPECIFICALLY_DOCUMENTED` |
| Application scope | `ACCEPTED_WITH_ADVISORY` | Relevant scope may include global navigation, Login, Dashboard, Facilities, Navigate controls, dialogs/drawers, CLARA controls, and Admin navigation/forms. These are scope references, not individual screen PASS claims |
| Screen reader | `SCREEN_READER_QA_PENDING` | No explicit screen-reader evidence was provided; semantic markup, keyboard behavior, and visual inspection are not substitutes for a screen-reader session |
| Formal conformance/device claims | `NOT_CLAIMED` | No WCAG conformance, physical tablet/mobile certification, QR-camera PASS, representative WebGL-device PASS, or exact browser/OS certification is added |
| Authenticated Admin detail | `IMPLEMENTED_UNVERIFIED` | Admin appeared in prior general owner-reported screen scope, but authenticated state and detailed protected navigation/form behavior remain `NOT SPECIFICALLY_DOCUMENTED` |
| Defect outcome | `ACCEPTED` | Owner reported no blocker requiring application changes; no code fix, test change, service mutation, or redeployment is justified by this evidence |

MQA-3 supersedes earlier pending classifications only for the owner-reported keyboard, focus, dialog/form, contrast, reduced-motion, zoom, and presentation behaviors named above. Phase 3 remains **IN PROGRESS**. The next canonical manual-QA subset is Phase 3-MQA-4 — Screen-Reader and Authenticated Admin Manual Acceptance, classified `READY` under the Definition of Ready with screen-reader/browser and possible temporary credential execution dependencies.

## Phase 3-MQA-2 remaining responsive viewport acceptance — owner completed 17 September 2026

**Subset classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Owner-provided evidence / boundary |
|---|---|---|
| Evidence source | `ACCEPTED_WITH_ADVISORY` | The owner reports completing the remaining responsive viewport review and finding `NO BLOCKER FOUND`. Screenshots, browser/version, operating system, measurements, and detailed findings were not supplied |
| `1440x900` | `OWNER_REPORTED_MANUAL_BROWSER_PASS` | Manually checked and reported acceptable; per-screen and per-control results are `NOT SPECIFICALLY_DOCUMENTED` |
| `1024x768` | `OWNER_REPORTED_MANUAL_BROWSER_PASS` | Manually checked and reported acceptable; per-screen and per-control results are `NOT SPECIFICALLY_DOCUMENTED` |
| 768px tablet viewport | `OWNER_REPORTED_RESPONSIVE_VIEWPORT_PASS` | Responsive viewport result reported acceptable; `PHYSICAL_DEVICE_DETAILS_NOT_DOCUMENTED` |
| Approximately 390px mobile viewport | `OWNER_REPORTED_RESPONSIVE_VIEWPORT_PASS` | Responsive viewport result reported acceptable; `PHYSICAL_DEVICE_DETAILS_NOT_DOCUMENTED` |
| Responsive screen scope | `ACCEPTED_WITH_ADVISORY` | The current responsive application, including where applicable Home, Dashboard, Facilities, Facility Detail, Navigate 2D/3D, Events, Emergency, CLARA, Login, and Admin, was within scope. Individual screen PASS claims are not added because per-screen findings were not provided |
| Accessibility/device claim | `PARTIAL` | MQA-2 adds responsive viewport evidence only. WCAG, screen reader, detailed keyboard-only behavior, physical QR/camera, representative WebGL-device, and exact browser/OS certification remain pending |
| Defect outcome | `ACCEPTED` | Owner reported no blocker requiring an application change; no code fix or redeployment is justified by this evidence |

Together, MQA-1 and MQA-2 provide owner-reported responsive evidence for all six canonical viewport targets. Tablet/mobile physical-device certification is not claimed. Canonical Phase 3 remains **IN PROGRESS** pending dedicated accessibility and physical-device acceptance.

## Phase 3-MQA-1 primary laptop browser acceptance — owner completed 17 September 2026

**Subset classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Owner-provided evidence / boundary |
|---|---|---|
| Evidence source | `ACCEPTED_WITH_ADVISORY` | The owner reports completing the manual laptop browser pass and finding no blocker requiring application changes. Screenshots, browser/version, operating system, and physical device details were not supplied |
| `1366x768` | `OWNER-REPORTED_MANUAL_BROWSER_PASS` | Manually checked by the owner and reported acceptable; detailed layout findings are `NOT SPECIFICALLY_DOCUMENTED` |
| `1280x800` | `OWNER-REPORTED_MANUAL_BROWSER_PASS` | Manually checked by the owner and reported acceptable; detailed layout findings are `NOT SPECIFICALLY_DOCUMENTED` |
| Covered screens | `OWNER-REPORTED_MANUAL_BROWSER_PASS` | Dashboard, Facilities, Navigate 2D, Navigate 3D, CLARA, Login, and Admin were included and reported acceptable; per-screen subcheck results are `NOT SPECIFICALLY_DOCUMENTED` |
| Keyboard smoke | `ACCEPTED_WITH_ADVISORY` | A basic keyboard smoke check was included and reported acceptable. Exact focus order, Tab/Shift+Tab, Enter/Space/Escape, arrow-key behavior, traps, dialog exit behavior, and focus visibility are `NOT SPECIFICALLY_DOCUMENTED` |
| Accessibility claim | `PARTIAL` | MQA-1 adds limited keyboard evidence only. Contrast, touch targets, screen-reader output, reduced motion, detailed semantics, and WCAG conformance remain undocumented/pending |
| 3D/device claim | `ACCEPTED_WITH_ADVISORY` | Navigate 3D was included in the owner laptop pass. Orbit/camera, floor isolation, stacked/exploded mode, route/marker details, Emergency overlay, performance, WebGL failure, and representative physical GPU/device results are `NOT SPECIFICALLY_DOCUMENTED` |
| Defect outcome | `ACCEPTED` | Owner reported no blocker requiring an application change; no code fix or redeployment is justified by this evidence |
| Remaining viewport/device scope | `IMPLEMENTED_UNVERIFIED` | `1440x900`, `1024x768`, 768px tablet, approximately 390px mobile, physical QR/camera, screen reader, and representative WebGL devices remain pending |

This newer owner evidence supersedes the earlier tooling blocker only for the two named laptop viewports and listed screens. It does not rewrite the earlier attempt or convert unreported subchecks into passes. Canonical Phase 3 remains **IN PROGRESS**.

## Phase 3 manual acceptance attempt — 17 September 2026

**Manual-QA subset classification:** `PARTIAL` / `BLOCKED_BY_TOOLING`

| Area | Classification | Evidence / advisory |
|---|---|---|
| Production baseline | `ACCEPTED` | Production remains available and serves `index-D88W5mFD.js`, `index-DVdLsi8t.css`, the canonical SCC PNG, and the canonical OG PNG. `HEAD` and `origin/main` are `bf9cc9b`; their only changes after deployed runtime revision `128ac40` are canonical tracking documents, so no runtime delta or redeployment was introduced |
| Requested viewport matrix | `BLOCKED_BY_TOOLING` | The approved in-app browser runtime failed before page launch with `failed to write kernel assets` (OS error 3). No manual claim is made for 1366x768, 1280x800, 1440x900, 1024x768, 768px tablet, or 390px mobile |
| Public-screen visual QA | `IMPLEMENTED_UNVERIFIED` | Home, Dashboard, Facilities, Facility Detail, Navigate 2D/3D, Events, Emergency, CLARA, and Login remain covered by existing route/static evidence, but no fresh graphical manual inspection was possible |
| Authenticated Admin visual QA | `IMPLEMENTED_UNVERIFIED` | Deterministic Admin CMS and Phase 8C.2 route/form/security checks passed. The graphical browser failed before authentication, so credentials were not requested and no authenticated visual claim is added |
| Responsive implementation | `ACCEPTED_WITH_ADVISORY` | Static review confirms centralized responsive density variables, 1024px desktop transition, responsive grids/rails, mobile navigation, mobile route sheet, overflow handling, and viewport-aware map/Admin heights. This is code evidence, not device certification |
| Keyboard and accessibility | `PARTIAL` | Static review confirms a skip link, semantic page headings/regions, form labels, accessible names, status/error roles, visible-focus utilities, modal semantics, reduced-motion rules, and non-color text/icon cues. Keyboard order/traps, Escape behavior, contrast, touch targets, and screen-reader output remain manually unverified; no WCAG claim is made |
| QR/camera | `ACCEPTED_WITH_ADVISORY` | Fresh QR payload, valid/invalid checkpoint, manual fallback, location preservation, and QR-to-A* regressions passed. `LOGIC VERIFIED / PHYSICAL CAMERA QA PENDING` |
| 3D/WebGL | `ACCEPTED_WITH_ADVISORY` | Fresh shared-route, floor conversion, stairs, construction, emergency eligibility, and WebGL-fallback regression passed. `AUTOMATED WEBGL VERIFIED / REPRESENTATIVE DEVICE QA PENDING` |
| Emergency | `ACCEPTED_WITH_ADVISORY` | Fresh approved-edge-only, normal-edge rejection, blocked/construction handling, inactive/unverified edge, route-cost, and safe no-route regressions passed; graphical readability remains unverified |
| Defects and changes | `ACCEPTED` | No reproducible application defect was found within available automated/static evidence. No application code, dependency, configuration, schema, production data, or deployment was changed |

Canonical Phase 3 remains **IN PROGRESS**. Exact-revision deployment stays accepted, but the remaining manual acceptance scope cannot be closed until real graphical browser/device, keyboard, camera, and representative WebGL evidence is available.

## Phase 3 exact-revision production deployment — 17 September 2026

**Overall classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Evidence / advisory |
|---|---|---|
| Approved release revision | `ACCEPTED` | Clean `main`, fetched `origin/main`, and deployed source all resolved to `128ac403c2fcf57f4f471543ea79b2c4f0ed6369`; `.env.phase8a.session` was absent and `stash@{0}` remained untouched |
| Cloudflare deployment | `ACCEPTED` | Existing `wrangler.jsonc` Workers Static Assets workflow deployed `campusnav-ai` to the canonical workers.dev endpoint as Cloudflare version `3636917e-ddf5-4b98-9737-c44f0478f226` |
| Production equivalence | `ACCEPTED` | Production HTML, `index-D88W5mFD.js`, `index-DVdLsi8t.css`, and `Campus3D-DNMDm-2E.js` matched the local release build byte-for-byte; classification is `PRODUCTION_MATCHES_CURRENT_BASELINE` |
| SPA routes | `ACCEPTED` | `/`, `/dashboard`, `/facilities`, `/map`, `/map?mode=emergency`, `/login`, and `/admin` returned HTTP 200 with the exact release HTML fallback |
| Branding and metadata | `ACCEPTED` | Canonical SCC and OG URLs returned real PNGs with matching hashes; obsolete JPG/v2/v3 paths returned HTML rather than image assets; all required OG/Twitter tags target `campusnav-og.png` |
| Supabase production initialization | `ACCEPTED` | Production-safe URL/publishable configuration is present in the exact bundle; Auth settings and a read-only public announcements query both returned HTTP 200; no secret-key pattern was present in production JavaScript |
| Auth/Admin production boundary | `ACCEPTED_WITH_ADVISORY` | `/login` and `/admin` deliver the exact locally tested protected-route bundle, Supabase Auth initializes, and deterministic Auth/RBAC/Admin/render suites passed. A connected graphical browser was unavailable, so no fresh interactive login/Admin claim is added |
| 3D production boundary | `ACCEPTED_WITH_ADVISORY` | The approximately 878 kB 3D chunk remains a separate matching asset and is absent from initial HTML; deterministic shared-route and WebGL-fallback tests passed, while representative-device graphical QA remains pending |
| Manual device/accessibility QA | `IMPLEMENTED_UNVERIFIED` | **MANUAL DEVICE QA PENDING**; no WCAG, physical camera/QR, screen-reader, keyboard-only, or representative WebGL-device completion claim is made |

The earlier checkpoint rows below remain historical evidence of their pre-deployment state. This dated section controls the current production-equivalence classification.

## Phase 3 canonical asset-cleanup checkpoint — 16 September 2026

**Overall classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Evidence / advisory |
|---|---|---|
| SCC runtime logo | `ACCEPTED` | Under owner-approved `DEC-ASSET-001`, `SchoolLogo` requests only the registered high-resolution transparent `public/branding/scc-logo.png`; the JPG is not an automatic fallback, while accessible text and the non-image monogram fallback remain unchanged |
| Social preview | `ACCEPTED` | Open Graph and Twitter metadata target the registered absolute `/branding/campusnav-og.png` production URL; the production build emits a real 1200×630 PNG |
| Public build inputs | `ACCEPTED` | Historical `scc-logo.jpg`, obsolete `campusnav-og-v2.png`, and unsupported-claims `campusnav-og-v3.png` were removed from runtime `public/`; source/legacy binaries were preserved outside the repository runtime tree for owner review |
| Quality and security gates | `ACCEPTED_WITH_ADVISORY` | The transparent PNG preserves the original 600×600 RGB artwork exactly while changing only exterior alpha. ESLint, typecheck, route rendering, and production build pass; the release build contains only the approved SCC PNG and CampusNav OG PNG under `dist/branding`. Existing dependency, manual-device, and 3D chunk advisories remain |
| Deployment | `IMPLEMENTED_UNVERIFIED` | Cleanup is staged for owner review only. No commit, push, or production deployment/equivalence verification has occurred |

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
| Social preview | `ACCEPTED` | Checkpoint B was committed at `b860cf1`; the canonical 1200×630 `campusnav-og.png` is the active metadata target, and the subsequent asset-cleanup checkpoint excludes obsolete/unapproved public variants |

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
