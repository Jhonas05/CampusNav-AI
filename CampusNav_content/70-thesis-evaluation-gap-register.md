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
