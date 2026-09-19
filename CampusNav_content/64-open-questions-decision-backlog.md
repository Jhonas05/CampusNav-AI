# CampusNav AI — Open Questions and Decision Backlog

Only unresolved decisions belong here. Resolved decisions move to `29-decision-log.md`.

## Thesis/research
- Does the adviser approve retaining the formal “tablet-based” title while the implementation is responsive web-based, or should the formal title be revised?
- What evaluation instrument, respondents, sample, metrics, acceptance thresholds, and statistical treatment will be approved for the final thesis evaluation?

## Institutional data
- Which office is the final authorized owner of map/facility verification?
- Which office supplies the approved class schedule and personnel public-availability data?
- Which office formally approves emergency digital data and verification dates?
- What exact staff/personnel fields are approved for public display?
- Which roles or offices may create, close, correct, and audit personnel check-ins?
- Is the current source-aligned emergency coverage sufficient for the thesis demonstration, or is a new formal safety-authority sign-off required?

## Product/implementation
- Is PWA offline emergency access required for the final defense build or allowed as a scoped roadmap item?
- Is a full visual map editor/version rollback required before final defense?
- Which optional delivery channels (web push/SMS) are in final scope?
- Which concrete browser/device matrix must pass before the responsive implementation may be claimed as production-verified?

The former strict-grayscale question is resolved by `DEC-UI-002` in `29-decision-log.md` and no longer belongs in this unresolved backlog.

## Post-Phase-3 sequencing

Phase 3 is `COMPLETE — ACCEPTED_WITH_ADVISORY`. The single exact next workstream is the **Post-Phase-3 Thesis/Defense Scope, Institutional Data, and Evaluation Decision Gate**. Decision coordination is `READY`; no downstream implementation phase is `READY` until its applicable adviser decisions, authorized institutional datasets/sign-offs, defense-scope choices, and demo-rehearsal plan are supplied or explicitly deferred.

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
