# CampusNav AI — Thesis Evaluation Gap Register

## What the supplied sources support
The proposal/architecture expects the system to be evaluated for usefulness/effectiveness/efficiency and demonstrated through working navigation and information flows.

## What the supplied sources do **not** yet define
No supplied CampusNav source establishes the final approved:
- research design for evaluation
- respondent population/sample size/sampling technique
- questionnaire/usability instrument
- ISO 25010/SUS/TAM or other framework selection
- task-completion metrics and thresholds
- statistical tests/treatment
- success criteria for accepting/rejecting evaluation results

## Documentation rule
Do not present any of the above as adviser-approved merely because they are common research approaches.

## What can be prepared now
The software documentation can preserve measurable technical evidence such as:
- route correctness/regression results
- task flows and demo completion
- response/error states
- performance observations
- accessibility checks
- security/authorization tests

## Decision needed
Finalize research evaluation methodology with the thesis adviser/research coordinator, then add the approved method as a new research-evaluation contract and update `36-thesis-traceability-matrix.md`.

## Current software-acceptance evidence gap — 17 September 2026

The production baseline and deterministic regressions are verified, but the requested Phase 3 manual acceptance matrix could not be completed because the approved graphical browser runtime failed before page launch. The evidence package must continue to distinguish:

- automated/static responsive and accessibility signals
- real manual browser results at the required viewports
- physical camera/QR results
- representative WebGL-device results
- keyboard-only and screen-reader observations

Until those sessions are performed, record `BLOCKED_BY_TOOLING` or `DEVICE_QA_PENDING`; do not convert automated rendering into device certification or WCAG conformance.

### Phase 3-MQA-1 evidence update — 17 September 2026

The owner subsequently completed the primary laptop browser subset at `1366x768` and `1280x800` for Dashboard, Facilities, Navigate 2D/3D, CLARA, Login, Admin, and a basic keyboard smoke check, and reported the result acceptable with no blocker requiring an application change.

This closes only that named subset. Screenshots/device details and finer-grained layout, keyboard, accessibility, performance, and 3D interaction findings are `NOT SPECIFICALLY_DOCUMENTED`. The remaining responsive viewports, screen-reader/contrast/reduced-motion checks, physical QR/camera checks, and representative WebGL-device checks remain evidence gaps. This update does not resolve the separate adviser-dependent research-methodology gap above.

### Phase 3-MQA-2 evidence update — 17 September 2026

The owner subsequently reported acceptable responsive viewport results with no blocker at `1440x900`, `1024x768`, 768px tablet viewport, and approximately 390px mobile viewport. Together with MQA-1, all six canonical responsive viewport targets now have owner-reported browser/viewport evidence.

Tablet/mobile physical-device details, screenshots, browser/OS information, per-screen findings, measurements, detailed interactions, and performance observations are `NOT SPECIFICALLY_DOCUMENTED`. Dedicated keyboard-only/accessibility, screen-reader, contrast, reduced-motion, physical QR/camera, and representative WebGL-device evidence remain gaps. This update does not resolve the separate adviser-dependent research-methodology gap.

### Phase 3-MQA-3 evidence update — 17 September 2026

The owner subsequently completed the keyboard-only/accessibility manual subset on the current approved production baseline and reported the tested behavior acceptable with no blocker requiring an application change. `OWNER_REPORTED_KEYBOARD_ACCESSIBILITY_PASS` covers, where applicable, keyboard-only navigation, Tab/Shift+Tab, Enter, Space, Escape/dialog behavior, focus visibility, forms/navigation usability, no observed keyboard blocker/trap, readable contrast, reduced motion, approximately 200% zoom, and labels/headings/status/error presentation.

Detailed per-control and per-screen results, screenshots, exact browser/OS, assistive-technology configuration, and formal accessibility measurements are `NOT SPECIFICALLY_DOCUMENTED`. `SCREEN_READER_QA_PENDING` remains because no explicit screen-reader evidence was supplied. No WCAG, physical tablet/mobile, QR-camera, representative WebGL-device, or exact browser/OS certification is claimed. Authenticated Admin state and detailed protected-form behavior also remain undocumented. These boundaries do not change the separate adviser-dependent research-methodology gap.

### Phase 3-MQA-4 historical evidence recovery — 19 September 2026

A previous-laptop MQA-4 attempt, whose original attempt date was not supplied and whose documentation changes were not pushed, is restored as `PARTIAL` / `BLOCKED_BY_TOOLING`. Definition of Ready remained `READY`, but the browser failed before production launch with `failed to write kernel assets` (OS error 3). The failure was classified as environmental/browser-tooling failure, and no application defect was found.

No successful screen-reader environment or authenticated browser Admin session was launched. `SCREEN_READER_QA_PENDING` remains, requested Admin graphical/manual checks remain `IMPLEMENTED_UNVERIFIED`, and no `SUPER_ADMIN_MANUAL_ADMIN_PASS` or `DEPARTMENT_ADMIN_MANUAL_BROWSER_PASS` is claimed. AccessDenied, session, and logout behavior were not manually tested during the attempt.

No test fixtures were created, no institutional records were mutated, no temporary credentials were requested or used, and `.env.phase8a.session` was absent, untracked, and ignored. No code fix or production deployment occurred. No WCAG conformance, physical-device, QR-camera, representative WebGL-device, or exact browser/OS certification is added.

MQA-4 remains the current unfinished subphase. The remaining evidence gap is real screen-reader manual acceptance and real authenticated Admin manual acceptance in a functioning environment. This recovery does not change the separate adviser-dependent research-methodology gap.

### Phase 3-MQA-4 resumed acceptance evidence — 19 September 2026

The owner subsequently completed the resumed MQA-4 run on Windows using Windows Narrator in a functioning graphical browser environment. `OWNER_REPORTED_SCREEN_READER_PASS` covers Home, Dashboard, Facilities, Navigate, Login, CLARA, navigation elements, buttons and links, heading structure, form labels, and status/error presentation. No blocker was reported. This later evidence controls current MQA-4 status while preserving the historical `PARTIAL` / `BLOCKED_BY_TOOLING` attempt above.

The actual authenticated browser role tested was `SUPER_ADMIN`. `SUPER_ADMIN_MANUAL_ADMIN_PASS` covers Admin Overview, Announcements, Events, Facility Advisories, Notifications, Audit, Personnel, Courses, Sections, Class Schedules, Schedule Exceptions, Assignments, Consultation Hours, Check-ins, Availability Overrides, authenticated navigation, page/layout readability, tables/cards, form usability, labels, dialogs, validation presentation, no observed clipping/overflow blocker, session behavior, and logout behavior. No application blocker was reported.

No explicit AccessDenied exercise was supplied, so `ACCESSDENIED_MANUAL_QA_NOT_TESTED` remains. No separate Department Admin browser session was supplied, so `DEPARTMENT_ADMIN_BROWSER_NOT_TESTED` remains; backend/RLS evidence is not a manual browser pass. No WCAG conformance, full accessibility certification, screen-reader certification, physical-device certification, physical QR/camera acceptance, representative WebGL-device acceptance, or broad browser-support claim is added.

MQA-4 advances to `ACCEPTED_WITH_ADVISORY`. Phase 3 remains in progress. The single exact next subphase is **Phase 3-MQA-5 — Physical QR/Camera and Manual-Fallback Acceptance**, which is `READY` under `72-definition-of-ready.md` and `NOT_STARTED`. Its execution requires a camera-capable physical device, secure graphical browser context, and scannable canonical test label/payload. Representative WebGL-device and broader physical-device evidence remain later gaps. The separate adviser-dependent research-methodology gap is unchanged.

### Phase 3-MQA-5 physical-device evidence update — 19 September 2026

The owner subsequently reported `MQA5_OWNER_REPORTED_PHYSICAL_QR_CAMERA_PASS` on the production HTTPS Navigate page. Camera prompting, permission, scanner feed, rear/environment-camera behavior, valid `QR-3F-LIBRARY` recognition, Library/Third Floor confirmation, QR-positioning presentation, retained Registrar’s Office destination, and the canonical `3F → 4F → 5F` A* route all passed. QR established only the checkpoint origin; no separate routing logic or continuous-position claim is added.

The invalid/unknown QR was rejected without replacing the valid location or inventing an origin/route. Retry/manual fallback remained available. Manual Library/3F positioning was distinguishable from QR positioning, preserved Registrar’s Office, and generated the same multi-floor route. Camera denial produced a usable manual fallback without trapping the user, and the camera indicator/feed stopped after detection, exit, or switching to manual location. No application blocker or defect was observed.

Exact device model/type and OS/browser names and versions are `NOT_DOCUMENTED`, so this does not establish broad device/browser, iOS, Android, or all-mobile-device support. The QR used a temporary test medium: `QR_PAYLOAD_CAMERA_ACCEPTANCE` is supported, while `PHYSICAL_LABEL_PLACEMENT_PENDING` remains. The owner observed no visible recording, upload, or person-identification behavior; that observation is not backend/privacy certification.

MQA-5 advances to `ACCEPTED_WITH_ADVISORY`. Phase 3 remains in progress. The single exact next subphase is **Phase 3-MQA-6 — Representative WebGL-Capable and WebGL-Fallback Device Acceptance**, classified `READY` under `72-definition-of-ready.md` and `NOT_STARTED`. Broader physical-device evidence and installed QR-label placement verification remain later gaps. The separate adviser-dependent research-methodology gap is unchanged.

### Phase 3-MQA-6 representative WebGL-device evidence update — 19 September 2026

The owner subsequently reported `OWNER_REPORTED_REPRESENTATIVE_WEBGL_CAPABLE_PASS` on the production HTTPS Navigate page in a WebGL-capable browser environment. The 3D view loaded; campus/floor geometry and current/destination markers rendered; Exploded, Stacked, 3F/4F/5F floor selection, Isolate Floor, Focus Floor, Entire Building, Reset View, orbit, zoom, pan, and applicable facility selection/focus worked; and multi-floor transitions remained understandable. The canonical `Library 3F → Registrar’s Office 5F` route remained `3F → 4F → 5F` through the existing A* engine and shared state. Switching 2D → 3D → 2D and returning to 3D preserved navigation state. No major clipping, unusable-control blocker, crash, blank scene, infinite loading state, or unrecoverable state was observed.

The owner also reported `OWNER_REPORTED_WEBGL_FALLBACK_PASS` in the prepared reproducible WebGL-disabled Edge session using an isolated profile and WebGL-disabling launch flags. Selecting 3D did not produce fake success. The application remained in or returned to 2D without crashing, becoming permanently blank, or loading indefinitely. Current location, Registrar’s Office, the active `3F → 4F → 5F` route, selected-floor/applicable state, textual instructions, and usable 2D route-floor navigation remained available, and the user was not trapped.

Physical device model/type, Windows edition/version/build, GPU, exact browser version from the successful execution, and exact capable/fallback native WebGL probe values are `NOT_DOCUMENTED`. The exact visually observed fallback message is `EXACT_FALLBACK_WORDING_NOT_DOCUMENTED`. The canonical copy `3D view unavailable; switched to 2D.` differs from the implementation/precheck copy `3D view is unavailable on this device. CampusNav has switched to 2D.`; because the owner-reported safe fallback and continuity behavior passed, the difference is retained as `ADVISORY_UI_COPY_MISMATCH`, not silently treated as exact-copy evidence and not elevated by assumption into a behavioral blocker.

The approximately 878 kB lazy 3D chunk advisory remains. This representative result does not establish performance certification, universal smoothness, GPU certification, broad device/browser support, or universal WebGL support. 3D remains a presentation layer over canonical spatial data and the existing A* route; A*, Three.js, and WebGL are not described as AI or independent route intelligence.

MQA-6 advances to `ACCEPTED_WITH_ADVISORY`. Phase 3 remains in progress. The single exact next subphase is **Phase 3-MQA-7 — Final Phase 3 Acceptance and Evidence Reconciliation**, classified `READY` under `72-definition-of-ready.md` and `NOT_STARTED`. That reconciliation must classify retained gaps—including broader physical-device evidence, installed QR-label placement, missing execution metadata/probes, the fallback-copy advisory, Department Admin/AccessDenied browser gaps, and other release boundaries—without inventing evidence. The separate adviser-dependent research-methodology gap is unchanged.
