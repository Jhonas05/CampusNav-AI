# CampusNav AI — Master Development & Thesis Context Pack (v3)

This folder is the **canonical handoff/context documentation** for CampusNav AI development agents and human developers. It consolidates source-derived architecture, safety/data-truth rules, implementation contracts, development governance, operations, and thesis traceability.

## Connect this to AGENTS.md
Point `AGENTS.md` to:

**`CampusNav_content/00-agent-entrypoint.md`**

A ready-to-paste bridge is provided in `AGENTS-INTEGRATION.md`.

## Read first
1. `00-agent-entrypoint.md`
2. `00-context-index.md`

## Major documentation groups
### Foundation
`01–09` — project, rules, architecture, data, security, UI, testing/deployment, roadmap

### Domain contracts
`10–30` — navigation, spatial truth, emergency, facilities, schedules/personnel, Dashboard, Admin, CLARA, service/schema registries, provenance, error states, Realtime, analytics, PWA, performance, accessibility, demo/defense, DoD, decisions, limitations

### Engineering/operations governance
`31–62` — environment, search, demo data, IDs, sources, traceability, agent behavior, module boundaries, coding/state/API/validation/auth/storage, approval/map versioning, notifications/audit/privacy, observability, backup, release/Git/dependencies, compatibility/timezone, fixtures, acceptance/security, scope/NFR/deployment

### Status, thesis, governance, and future adoption contracts
`63–75` — implementation truth, unresolved decisions, glossary, use cases, flows, ownership, risks, research-evaluation gap, documentation governance, Definition of Ready, release quality gates, the planning-only AR-assisted navigation contract, and the adviser confirmation package

## Core invariant
**One campus dataset + one routing engine.** 2D, 3D, QR, Dashboard-linked navigation, schedules/personnel routing, emergency mode, Admin, and future CLARA must reference the same canonical records and route logic.

## Truth rule
If information is not verified, CampusNav must label it unavailable, estimated, demo, or pending verification. Never fabricate school facts.

## Maintenance
When a development task changes architecture, implementation status, or an authoritative contract, update this pack in the same work. The pack should describe both **what CampusNav is supposed to be** and, through `63-implementation-status-registry.md`, **what is actually verified as implemented**.
