# CampusNav AI — Open Questions and Decision Backlog

Only unresolved decisions belong here. Resolved decisions move to `29-decision-log.md`.

## Thesis/research
- Does the adviser approve retaining the formal “tablet-based” title while the implementation is responsive web-based, or should the formal title be revised?
- What evaluation instrument, respondents, sample, metrics, acceptance thresholds, and statistical treatment will be approved for the final thesis evaluation?
- Does the adviser confirm the owner-proposed final defense scope and verified/demo/unavailable data policy in `DEC-DEFENSE-001`?
- Does the adviser require grounded server-side CLARA/Groq for the thesis AI claim, or approve its conditional deferral?

## Institutional data
- Which office is the final authorized owner of map/facility verification?
- Which office approves facility operational profiles, service taxonomy/aliases, service mappings, hours/exceptions, public contacts, and media publication?
- Which roles may manage facility records beyond the safe initial `SUPER_ADMIN` boundary, and what department/facility scope applies?
- What institutional asset-usage, publication, and removal rules apply to facility photographs?
- Which office supplies the approved class schedule and personnel public-availability data?
- Which office formally approves emergency digital data and verification dates?
- What exact staff/personnel fields are approved for public display?
- Which roles or offices may create, close, correct, and audit personnel check-ins?
- Is the current source-aligned emergency coverage sufficient for the thesis demonstration, or is a new formal safety-authority sign-off required?

## Product/implementation
- Does the adviser require PWA offline emergency access for the final defense, or confirm its conditional deferral under `DEC-DEFENSE-001`?
- Does the adviser require any owner-deferred feature—reports/analytics, map editor/version rollback, expanded positioning, AR, push/SMS, hardware presence, or photorealistic 3D—for the final defense?
- Does the adviser require additional browser/device evidence beyond the accepted Phase 3 baseline for a specific final-defense claim?

The former strict-grayscale question is resolved by `DEC-UI-002` in `29-decision-log.md` and no longer belongs in this unresolved backlog.

## Post-Phase-3 sequencing

Phase 3 is `COMPLETE — ACCEPTED_WITH_ADVISORY`. `DEC-DEFENSE-001` and `75-adviser-confirmation-package.md` remain preserved; the package is `PREPARED / AWAITING_ADVISER_CONFIRMATION` and no adviser approval is claimed.

`DEC-ROADMAP-002` makes **Phase 4 — Core Facility & Service Workflow Completion** the active owner-controlled software-development phase. Missing official data does not block generic workflows that preserve unavailable/pending states or use isolated visibly labeled fixtures. The single exact next implementation task is **Phase 4-FS-1 — Facility Operational Data and Service Foundation**, classified `READY_WITH_BOUNDARIES` and `NOT_STARTED`.

Adviser confirmation remains a separate external action and still controls adviser/academic claims. Institutional questions above still control whether values may be presented as official; they do not authorize agents to invent those values.

### AR-Assisted Camera Navigation planning
- After current Phase 3 acceptance, when—if ever—may AR-0 be authorized on the roadmap?
- What final maneuver-derivation and approximate-distance semantics are approved for the route-step adapter?
- Which representative mobile browsers, devices, cameras, and permission states must pass?
- How must Camera Guidance and QR scanning share, stop, or reacquire the camera stream?
- What verification proves that frames are not recorded, uploaded, persisted, or analyzed beyond approved local guidance?
- What performance/resource-release thresholds and accessibility test plan must pass?
- Is AR-7 emergency presentation permitted, and which safety authority must approve it?

## Policy
- retention periods for audit/check-in/CLARA/report data
- final backup/recovery expectations under the selected provider plan

Do not guess answers to these items in code or thesis claims.
