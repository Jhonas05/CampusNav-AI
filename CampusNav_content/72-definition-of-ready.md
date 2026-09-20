# CampusNav AI — Definition of Ready

A feature/task is ready for implementation when the following are sufficiently clear.

## Required
- user/system goal is known
- core vs optional status is known
- relevant source/contract is identified
- authoritative data source is known or the feature explicitly handles unavailable/pending data
- security/role requirements are known
- privacy implications are understood
- expected error/empty states are known
- acceptance/test cases are identified

## Additional for database/admin work
- data owner is known or deliberately generic pending institutional confirmation
- migration/RLS impact is understood
- audit requirements are identified

## Additional for map/emergency work
- spatial source/verification state is known
- affected graph/QR/stair/emergency relationships are identified
- regression routes are selected

## Additional for CLARA
- internal tool/service exists and is stable
- authorization boundary exists
- hallucination/unavailable behavior is defined

If these conditions are not met, move the missing item to `64-open-questions-decision-backlog.md` instead of guessing.

## Phase 4-FS-1 readiness assessment — 20 September 2026

**Task:** Phase 4-FS-1 — Facility Operational Data and Service Foundation

**Result:** `READY_WITH_BOUNDARIES`

| Definition-of-Ready area | Result | Basis / boundary |
|---|---|---|
| Goal and scope | `READY` | Establish the facility operational schema/service foundation only; FS-2 through FS-7 are excluded |
| Core status and contracts | `READY` | Facility/service information is thesis-core; `04`, `13`, `16`, `18`, `19`, `20`, `32`, `42`, `48`, `58`, and `68` control the work |
| Authoritative identity/data source | `READY_WITH_BOUNDARIES` | Existing local facility IDs remain authoritative; operational values may be unavailable/pending or isolated `DEMO`/`DEVELOPMENT`; no official seed data |
| Migration impact | `READY` | One version-controlled forward migration adds operational profiles, services/aliases, mappings, provenance/lifecycle, RLS, and trusted-audit foundations without changing spatial tables |
| Security and roles | `READY_WITH_BOUNDARIES` | RLS is authoritative; `SUPER_ADMIN` is the safe initial write boundary; broader manager scope requires explicit generic relationships and must not invent an institutional office assignment |
| Privacy and provenance | `READY` | No personnel/emergency expansion; public results preserve verification/data status and demo labels |
| Error/empty states | `READY` | Missing overlay/provider/data returns normalized unavailable/pending results; invalid facility IDs and unconfigured mappings fail safely |
| Acceptance cases | `READY` | Migration reproducibility, canonical-ID compatibility, no spatial duplication, public/draft isolation, unauthorized-write rejection, permitted writes, audit creation, provider fallback, and fixture cleanup are identified |
| Toolchain | `READY_WITH_BOUNDARY` | Use supported Node 22 before implementation/testing; Node 24 on the current laptop is advisory and does not authorize dependency changes |

FS-1 must not seed official institutional records, alter facility/spatial/navigation identity, implement hours/status/Admin/public/media/Dashboard UI, or start CLARA/PWA/AR/reports/map-editor/positioning/delivery/redesign/dependency work.

**Exact next implementation task after authorization:** Phase 4-FS-1 — Facility Operational Data and Service Foundation.
