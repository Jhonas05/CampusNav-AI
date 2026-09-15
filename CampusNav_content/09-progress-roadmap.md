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

## Recommended Phase 2 — Existing Baseline Stabilization and Acceptance

**Status:** RECOMMENDED / NOT STARTED / REQUIRES OWNER APPROVAL

Recommended scope:
1. review and isolate the existing uncommitted Phase 8C.2 work without discarding unrelated changes
2. run local PostgreSQL/pgTAP RLS suites against a reproducible Supabase environment
3. rerun linked-cloud Auth, RBAC, RLS, Realtime, Admin CMS, audit, and academic/personnel checks using temporary credentials only
4. verify Phase 8C.2 department and `SUPER_ADMIN` boundaries, conflict constraints, audit events, Dashboard refresh, and fixture cleanup
5. perform production-browser and responsive checks for public navigation, 2D/3D fallback, QR/manual fallback, Dashboard, login/logout, and protected Admin routes
6. verify deployment equivalence between the accepted commit and Cloudflare production assets
7. update `63`, Definition of Done, and changelog only from the resulting evidence

Phase 2 should stabilize and verify existing work before adding a new product capability.

## Later canonical work candidates

Do not assign or start these as numbered phases until Phase 2 is approved and completed:
- verified facility services, operating hours, and service-to-facility mappings
- PWA service worker and versioned offline emergency cache
- map administration, calibration, versioning, and coherent rollback
- privacy-conscious user reporting and analytics
- grounded server-side CLARA tool integration after its internal services and authorization are accepted

## Blocked by institutional data or decision

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
