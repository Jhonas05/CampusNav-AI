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
