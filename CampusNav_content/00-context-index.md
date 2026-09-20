# CampusNav AI — Master Context Index

This folder is the canonical development/thesis-context pack for CampusNav AI. Coding agents should enter through `00-agent-entrypoint.md` rather than reading random files in isolation.

## Two different kinds of authority
### A. Requirement/design authority
1. Explicit approved overrides in `29-decision-log.md`
2. CampusNav AI Final Expanded Architecture — 14 Sep 2026
3. CampusNav Project Source Reference — 14 Sep 2026
4. Formal thesis proposal/presentation materials

### B. Implementation-state authority
1. Running code + passing tests/live verification
2. `63-implementation-status-registry.md`
3. `09-progress-roadmap.md`

A missing implementation does not cancel a requirement. A written requirement does not prove implementation.

## Primary source roles
- **Final Expanded Architecture**: latest target architecture, current phase direction, 3D/positioning, Dashboard, schedules/personnel, privacy/presence, CLARA boundary, testing, DoD
- **Project Source Reference**: full-system master requirements, detailed 3D/navigation, emergency, facilities/services, Admin CMS, search, reports, PWA/offline, database expectations
- **CampusNav thesis proposal**: formal research title/framing, rationale, beneficiaries, proposal objectives

## Core technical stack currently documented
- React + Vite
- Three.js + React Three Fiber / drei
- canonical A* routing
- QR + manual indoor positioning
- Supabase PostgreSQL/Auth/RLS/Realtime
- Cloudflare deployment
- future server-side CLARA/AI provider integration

## Core architectural rule
**One campus dataset + one routing engine.** No independent 3D route truth, CLARA route truth, or emergency fallback to normal routing.

## Non-negotiable safety/truth rules
- do not invent rooms, stairs, exits, accessibility infrastructure, live crowd info, schedules, office hours, suspensions, or personnel presence
- emergency routing uses verified emergency data only
- schedule is not presence
- no public live employee GPS
- CLARA must use verified internal tools/data
- secrets stay out of browser bundles

## Document map
### Foundation: `01–09`
Project overview, system rules, architecture, data model, security/RBAC, UI/UX, UI registry, testing/deployment, roadmap.

### Product/domain contracts: `10–30`
Navigation, spatial truth, emergency, facilities/services, schedules/personnel, Dashboard/notifications, Admin CMS, CLARA, API/service registry, Supabase schema, provenance, errors, Realtime, analytics, PWA/offline, performance, accessibility, demo/defense, DoD, decisions, limitations.

### Engineering/operations: `31–62`
Environment/config, search, demo data, IDs, sources, thesis traceability, agent contract, module ownership, coding/state/API/validation/auth/storage, admin approval, map versioning, notification lifecycle, audit/privacy/observability/backup/release/Git/dependencies, device/timezone, fixtures/acceptance/security, scope/NFR/deployment.

### Status/thesis/governance and future adoption contracts: `63–75`
Implementation status, open questions, glossary, user stories, E2E flows, data ownership, risks, evaluation gaps, documentation governance, Definition of Ready, quality gates, the planning-only AR-assisted navigation contract, and the adviser confirmation package.

## Agent integration
See `AGENTS-INTEGRATION.md` for a minimal `AGENTS.md` bridge.
