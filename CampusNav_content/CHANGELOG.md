# CampusNav Content Pack — Changelog

## v3.4 — 16 September 2026

CampusNav Ink laptop-space and responsive-density refinement.

### Updated
- added centralized application-shell, gutter, vertical-spacing, card-padding, header, Admin-rail, and map-control-rail density tokens
- widened data-heavy application shells while retaining narrower readable/focused surfaces where appropriate
- compacted the global/page headers and improved Home, Dashboard, Facilities, Facility Detail, Events, Emergency, CLARA, and Admin laptop layouts
- moved Navigate planning, view, summary, and notice content into a compact laptop control rail so the unchanged 2D/3D renderer receives the dominant viewport area
- documented explicit 1280×800, 1366×768, 1440×900, 1024×768, tablet, and mobile review intent under the existing `DEC-UI-002` decision

### Verification
- ESLint, typecheck, production build, and route-render suite passed
- all existing deterministic facility, A*, same-floor, multi-floor, QR, Emergency, 3D/WebGL, Dashboard, Auth/RBAC, Admin, Phase 8C.1, and Phase 8C.2 suites passed
- no connected graphical browser was available; 1280/1366/1440 screenshot review, authenticated Admin visual QA, and physical tablet/mobile QA remain **MANUAL DEVICE QA PENDING**
- the existing approximately 878 kB minified lazy 3D chunk warning remains

### Scope
- presentation/layout only; no A*, spatial data, QR, Emergency routing, Auth/RBAC/RLS/Realtime, schedule/personnel, Supabase, Cloudflare, PWA, or CLARA behavior changed
- consolidated into the owner-approved staged CampusNav Ink checkpoint while the backup stash remains preserved
- no commit, push, deployment, live Phase 2 verification, or Phase 3 work was performed

## v3.3 — 15 September 2026

Owner-approved CampusNav Ink / architectural-blueprint UI baseline adoption.

### Canonical alignment
- added `DEC-UI-002` and resolved the older strict grayscale / Apple-only conflict where it contradicted the owner-approved direction
- registered `CampusNav-Ink-all-pages.html` as a visual/UX reference only, not runtime source, institutional truth, routing data, or backend policy
- aligned the UI/UX guidelines and UI registry with the neutral-dominant, CampusNav green, emergency red, sharp-geometry, technical-border system
- reviewed performance, accessibility/reduced-motion, browser/device, and core-vs-optional contracts; their safeguards remain in force

### Implemented
- centralized CampusNav Ink colors, typography, spacing-adjacent geometry, borders, shadows, grid paper, and blueprint registration treatment
- added maintainable shared `BlueprintPanel`, `InkKicker`, and `InkSectionLabel` React primitives
- adopted Archivo and Barlow Condensed through open-source packages without extracting bundled reference fonts
- aligned Home, Dashboard, Facilities, Facility Detail, Navigate surroundings, Events, Emergency, CLARA, Login, search, notifications, profile/account, and Admin shell presentation
- preserved application logic, one A* engine, canonical spatial data, Supabase/Auth/RBAC/Realtime, 2D/3D, QR, Emergency, Dashboard, PWA manifest, and CLARA behavior

### Verification
- production build, ESLint, and typecheck passed
- route-render suite passed
- all deterministic facility, A*, same-floor, multi-floor, QR, Emergency, 3D/WebGL, Dashboard, Auth/RBAC, Admin CMS, Phase 8C.1, and Phase 8C.2 suites passed
- automated desktop captures for Home, Dashboard, Facilities, Navigate, Events, Emergency, CLARA, and Login were visually inspected
- **AUTOMATED RENDER VERIFIED / MANUAL VISUAL QA PENDING.**

### Scope
- no backend, schema, RLS, routing, emergency-path, map-data, institutional-data, PWA, or CLARA integration behavior changed
- no deployment was performed and production equivalence is not claimed
- Phase 3 was not started

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
