# CampusNav Content Pack — Changelog

## v3.10 — 17 September 2026

Recorded owner-provided Phase 3-MQA-1 primary laptop browser acceptance evidence.

### Evidence recorded
- recorded owner-reported manual acceptance at `1366x768` and `1280x800`
- recorded coverage of Dashboard, Facilities, Navigate 2D, Navigate 3D, CLARA, Login, Admin, and a basic keyboard smoke check
- recorded that the owner found no blocker requiring application changes

### Evidence boundaries
- marked unprovided screenshot/device/browser details, per-screen findings, detailed keyboard behavior, contrast, touch targets, screen-reader output, reduced motion, and detailed 3D/WebGL behavior as `NOT SPECIFICALLY DOCUMENTED`
- retained pending status for `1440x900`, `1024x768`, tablet/mobile, physical QR/camera, and representative WebGL-device QA
- made no WCAG, broad browser-support, or physical-device certification claim

### Scope
- documentation-only evidence update; no application code, dependency, schema, production data, test fixture, commit, push, or deployment action
- Phase 3 remains in progress and may advance to Phase 3-MQA-2 Remaining Responsive Viewport Acceptance

## v3.9 — 17 September 2026

Attempted the remaining canonical Phase 3 manual acceptance subset without changing or redeploying the approved production baseline.

### Fresh evidence
- reconfirmed the approved production JavaScript/CSS fingerprints and canonical SCC/social-preview PNG responses; only canonical tracking documents changed after deployed runtime revision `128ac40`
- reran route rendering, Dashboard, QR, Emergency, 3D/WebGL fallback, Admin CMS, and Phase 8C.2 deterministic checks successfully
- statically reviewed responsive density and breakpoint code, map/mobile/Admin reflow, accessible names and labels, focus treatment, modal/status/error semantics, reduced-motion rules, and non-color cues

### Manual-QA boundary
- the approved in-app browser runtime failed before page launch with `failed to write kernel assets` (OS error 3)
- classified all six requested viewport inspections, keyboard-only testing, and authenticated Admin visual testing as `BLOCKED_BY_TOOLING`, not manual passes
- retained `LOGIC VERIFIED / PHYSICAL CAMERA QA PENDING` for QR and `AUTOMATED WEBGL VERIFIED / REPRESENTATIVE DEVICE QA PENDING` for 3D
- retained partial accessibility status and made no WCAG, physical-device, or browser-support claim

### Scope
- no reproducible application defect was found in available automated/static evidence
- no application code, dependency, schema, production data, credentials, commit, push, or deployment action was performed
- canonical Phase 3 remains in progress; no other canonical workstream was started

## v3.8 — 17 September 2026

Deployed and verified the owner-approved canonical Phase 3 exact-revision production baseline.

### Deployment
- deployed clean revision `128ac403c2fcf57f4f471543ea79b2c4f0ed6369` through the existing Cloudflare Workers Static Assets configuration
- recorded Cloudflare version `3636917e-ddf5-4b98-9737-c44f0478f226` at the canonical workers.dev endpoint
- made no application, dependency, Supabase schema, RLS, route, or runtime configuration change during deployment

### Production equivalence
- matched production HTML, main JavaScript, CSS, and lazy 3D chunk byte-for-byte to the approved local release build
- verified SPA fallback for Home, Dashboard, Facilities, normal/emergency Map, Login, and Admin routes
- verified the canonical SCC logo and social-preview assets return real PNG content; obsolete JPG and OG v2/v3 paths are not served as images
- verified complete canonical OG/Twitter metadata and classified production as `PRODUCTION_MATCHES_CURRENT_BASELINE`
- verified read-only Supabase Auth settings and public Data API initialization without live-data mutation or credential exposure

### Advisories and scope
- connected graphical browser automation was unavailable; authenticated graphical Admin, physical device, accessibility, QR-camera, and representative WebGL QA remain **MANUAL DEVICE QA PENDING**
- the existing approximately 878 kB lazy 3D chunk, dependency advisories, manifest-only PWA status, and deferred grounded CLARA integration remain unchanged
- stopped after exact-revision deployment and production-equivalence verification; no new canonical workstream was started

## v3.7 — 16 September 2026

Prepared the owner-approved Phase 3 canonical public-asset cleanup checkpoint.

### Asset reconciliation
- recorded `DEC-ASSET-001`: the owner-approved high-resolution `public/branding/scc-logo.png` supersedes the preliminary JPG-only release staging decision as the sole canonical SCC runtime logo
- removed only the PNG's edge-connected exterior background; the 600×600 RGB seal artwork, internal white/light details, wording, symbols, colors, and proportions remain unchanged
- migrated `SchoolLogo` to `/branding/scc-logo.png` only and removed the JPG automatic fallback
- reclassified the former `scc-logo.jpg` as a historical asset and removed it from runtime `public/` while preserving it in Git history and the non-runtime owner archive
- retained `public/branding/campusnav-og.png` as the sole active Open Graph/Twitter preview image
- removed obsolete `campusnav-og-v2.png` and unsupported-claims `campusnav-og-v3.png` from runtime `public/` build inputs
- preserved source/legacy/excluded binaries outside the repository runtime tree for owner review; historical documentation references remain history

### Verification
- ESLint, typecheck, route rendering, and production build passed
- verified the transparent logo pixel/alpha invariants and its appearance on canonical light, charcoal, green, and emergency-red surfaces
- verified `dist/branding` contains only the approved SCC PNG and CampusNav OG PNG
- verified complete OG/Twitter image metadata, real image MIME/content, successful PNG-only `SchoolLogo` resolution, and absence of temporary session/design-reference files
- reran the credential scan without exposing secret values

### Scope
- asset/reference cleanup only; no routing, map, QR, Emergency, Auth/RBAC/RLS/Realtime, Dashboard, Admin, personnel, schedule, CLARA, PWA, Supabase, or Cloudflare behavior changed
- no commit, push, deployment, stash mutation, or production-equivalence claim was made

## v3.6 — 16 September 2026

Prepared canonical Phase 3 release-candidate Checkpoint A without committing, pushing, or deploying.

### Consolidation
- classified every remaining modified/untracked file and isolated accepted Phase 8C.2 plus Phase 2 support work from the separate social-preview checkpoint
- confirmed exact-code continuity with the implementation accepted during Phase 2; the intervening Phase 2 commit changed canonical tracking documents only
- reviewed migration `20260915052147` for linked ordering, conflict constraints, consultation-location optionality, destructive changes, and RLS-policy impact
- retained only explicit accepted paths for Checkpoint A staging and preserved `stash@{0}`

### Verification
- all deterministic data/navigation/QR/Emergency/3D/Dashboard/Auth/Admin/Phase 8 and route-render suites passed
- ESLint, typecheck, and production build passed; the existing approximately 878 kB minified lazy 3D chunk remains
- linked migration equivalence and zero DEVELOPMENT/DEMO records across all 14 fixture-audit categories passed
- repository/build credential audit found no real privileged/provider/database/JWT/private-key credential; the temporary session file remains absent/untracked
- dependency audit still reports two low, three moderate, one high, and zero critical advisories; no dependency change was made

### Separate social-preview checkpoint
- validated complete production Open Graph/Twitter metadata and the canonical 1200×630 PNG build output
- corrected the metadata target to registered asset `/branding/campusnav-og.png`
- excluded the alternative `campusnav-og-v3.png` concept because it contains unsupported institutional availability, hours, personnel, and routing claims
- kept all social-preview files unstaged as Checkpoint B

### Scope
- no commit, push, deployment, cloud-data mutation, reset, clean, restore, stash-pop/drop, dependency upgrade, or new feature was performed
- production equivalence and manual device/accessibility QA remain pending

## v3.5 — 16 September 2026

Fresh canonical Phase 2 acceptance rerun against the committed CampusNav Ink baseline `7496a76` and the preserved Phase 8C.2/social-preview worktree.

### Live verification
- confirmed all four local migrations on the linked Supabase project, 24/24 public tables with RLS, 9/9 public views with `security_invoker`, and the five expected Realtime publication tables
- passed 103 linked-cloud transactional RLS/RBAC/Admin/audit/academic/personnel assertions with rollback
- passed real-client login, profile and role restoration, `SUPER_ADMIN`, `hasRole`, session refresh, authorized RLS writes, logout cleanup, protected-access removal, and re-login
- passed authenticated Admin CMS CRUD/audit, draft privacy, anonymous write rejection, public reads, Realtime delivery, and subscription cleanup
- passed class insert/edit/cancel → Realtime → Dashboard refresh, `SCHEDULED → CHECKED_IN → SCHEDULED`, `UNAVAILABLE` precedence, next-availability overlap safety, privacy, audit, and cleanup
- confirmed zero remaining records in all 14 DEVELOPMENT/DEMO fixture categories after testing

### Quality and security
- reran all deterministic navigation, 2D/3D, QR, Emergency, Dashboard, Auth/RBAC, Admin, Phase 8C.1, Phase 8C.2, and route-render suites successfully
- ESLint, typecheck, and production build passed; the existing approximately 878 kB minified 3D chunk warning remains
- deleted `.env.phase8a.session`, confirmed it is absent and was never tracked, and found no real privileged/provider/database/JWT/private-key credential in source, build, or local environment
- dependency audit reports 2 low, 3 moderate, and 1 high advisory; remediation is deferred to a deliberate regression-tested dependency update
- one fresh Auth Realtime run timed out after subscription, then the complete suite and both independent authenticated Realtime suites passed; retained as a non-blocking timing advisory

### Deployment and scope
- confirmed `HEAD` and GitHub `origin/main` both resolve to `7496a765bc3a7135a8a1c44aa23224ed5aa843b3`
- confirmed Cloudflare production is reachable but is not equivalent to the current worktree build; its JS/CSS fingerprints differ and `/branding/campusnav-og.png` currently falls through to SPA HTML
- no reset, clean, restore, stash-pop/drop, staging, commit, push, deployment, application change, or Phase 3 work was performed

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

## v3.2 — 15 September 2026

Canonical Phase 2 existing-baseline stabilization and acceptance.

### Verified
- preserved the dirty Phase 8C.2/social-preview worktree and backup stash without destructive git actions
- matched all four repository migrations to the linked Supabase project
- passed 103 linked-cloud transactional RLS/RBAC/Admin/audit/academic/personnel assertions
- passed fresh real-client Auth, session persistence/refresh, profile/role reload, `SUPER_ADMIN`, logout cleanup, protected-access removal, and re-login checks
- passed live public reads, anonymous write rejection, authenticated Admin CMS writes, trusted audit creation, and Realtime cleanup
- passed Phase 8C.2 class insert/edit/cancel → Realtime → Dashboard refresh, status precedence, check-in separation, next availability, conflict constraints, and privacy checks
- passed all deterministic navigation, 2D/3D, QR, Emergency, Dashboard, Auth, Admin, schedule/personnel, and route-render regressions
- passed ESLint, typecheck, and production build
- deleted the ignored temporary session file and confirmed zero records in all 14 DEVELOPMENT/DEMO fixture categories

### Audited
- all 24 public cloud tables have RLS; all nine public views use `security_invoker`
- all 54 registered UI page/component paths exist
- credential scan found no real privileged/service/provider/database credentials in source or build; scanner canary/CSS false positives were classified without exposing values
- dependency audit reports two low and two moderate advisories whose offered fixes are breaking upgrades
- responsive and accessibility implementation signals exist, but `MANUAL DEVICE QA PENDING`; no WCAG conformance claim is made
- PWA manifest remains manifest-only with no offline cache/service worker
- CLARA remains a local verified-facility matcher, not the final grounded Groq/tool integration

### Deployment advisory
- local `HEAD` equals GitHub `origin/main`, but the preserved dirty worktree build does not equal current Cloudflare production assets
- the production social-preview image path currently falls through to SPA HTML instead of serving a PNG
- no deployment was performed during Phase 2

### Scope
- only canonical tracking documents changed in Phase 2
- no application, migration, map, routing, QR, Emergency, Dashboard, Admin, Auth, schedule/personnel, PWA, or CLARA implementation changed
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
