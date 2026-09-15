# CampusNav Content Pack — Changelog

## v3.1 — 15 September 2026

Canonical Phase 1 documentation alignment and repository baseline.

### Updated
- linked repository `AGENTS.md` to the mandatory canonical entrypoint
- reset the active development roadmap to documentation-alignment Phase 1 without deleting or reverting existing implementation
- replaced phase-history assumptions in the implementation registry with a requirement-to-code evidence matrix
- separated local deterministic verification from linked-cloud, production-browser, and device QA claims
- recorded current Phase 8C.2 work as preserved, aligned work that still needs database/live/browser verification
- recorded the 3D status, UI color, CLARA placeholder, PWA manifest, and roadmap-numbering alignment issues
- expanded the open-decision backlog for check-in authority, emergency sign-off, and the required browser/device acceptance matrix

### Verification
- all selected local deterministic non-cloud CampusNav npm regression suites passed
- route rendering, ESLint, typecheck, and production build passed
- linked Supabase, local pgTAP, production-browser, physical-device, and deployment-equivalence checks were intentionally not rerun in Phase 1

### Scope
- no application, map, routing, QR, Emergency, Dashboard, Supabase migration, Admin, academic/personnel, or CLARA implementation changed

## v3 — 15 September 2026
Documentation-first master pack intended to be the single context source linked from repository `AGENTS.md`.

### Added
- `00-agent-entrypoint.md` and `AGENTS-INTEGRATION.md`
- environment/configuration registry
- search/discovery contract
- demo/seed data policy
- canonical ID/naming conventions
- source/asset registry
- thesis traceability matrix
- coding-agent operating contract
- repository/module boundaries
- coding/state/API/validation/auth/storage standards
- admin approval and map-change workflows
- notification, audit, privacy, observability, backup/recovery contracts
- release/Git/dependency/device/timezone guidance
- test fixture and module acceptance criteria
- security threat model
- thesis core-vs-optional matrix
- non-functional requirements
- deployment runbook
- implementation status registry
- open decision backlog
- glossary, user stories, end-to-end flow registry
- data ownership matrix, risk register, thesis evaluation gap register
- documentation governance, Definition of Ready, and release quality gates

### Updated
- `README.md` to make this the master agent/thesis context pack
- `00-context-index.md` with separate requirement vs implementation precedence
- `29-decision-log.md` with documentation governance decisions

### Important
v3 does not declare missing source information “resolved.” Institutional ownership, research evaluation methodology, retention periods, final title alignment, and some optional-scope choices remain explicit decision items rather than fabricated requirements.

## v2 — 15 September 2026
Expanded the original compact content folder with domain contracts for navigation, spatial truth, emergency, facilities, schedules/personnel, Dashboard, Admin, CLARA, schema/services, provenance, Realtime, PWA, performance, accessibility, demo/defense, DoD, decisions, and limitations.
