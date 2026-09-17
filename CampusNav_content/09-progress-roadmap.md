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

## Phase 2 — Existing Baseline Stabilization and Acceptance

**Status:** COMPLETE — freshly revalidated 16 September 2026 (`ACCEPTED_WITH_ADVISORY`)

Completed outcomes:
1. preserved the existing dirty worktree and backup stash without reset, restore, clean, discard, stash-pop, or overwrite
2. confirmed all four repository migrations are present on the linked Supabase project
3. ran the Phase 8A, 8B.1, 8C.1, and 8C.2 transactional suites against linked cloud PostgreSQL: 103 assertions passed and rolled back
4. freshly verified development-user login, profile/role reload, `SUPER_ADMIN`, session restoration/refresh, authorized and anonymous RLS behavior, logout cleanup, and re-login through the real Supabase client
5. freshly verified Admin CMS CRUD, trusted audit creation, public published reads, authenticated Realtime, and subscription cleanup
6. freshly verified Phase 8C.2 schedule/personnel writes, class insert/edit/cancel → Realtime → Dashboard refresh, schedule/check-in separation, status precedence, next availability, conflict constraints, public projection privacy, and audit events
7. reran all deterministic navigation, 2D/3D, QR, Emergency, Dashboard, Auth, Admin, and academic/personnel regressions plus render, lint, typecheck, and production build
8. deleted the ignored temporary session file and confirmed zero fixture records across all 14 audited DEVELOPMENT/DEMO categories
9. confirmed local `HEAD` equals GitHub `origin/main` at `7496a765bc3a7135a8a1c44aa23224ed5aa843b3`, while the preserved dirty worktree and its production build do not equal the currently deployed Cloudflare assets
10. completed static UI-registry, responsive-code, accessibility, credential, dependency, PWA, and CLARA boundary audits without overstating graphical/device evidence

Advisories and non-accepted claims:
- `MANUAL DEVICE QA PENDING`: no fresh graphical desktop/tablet/mobile, physical camera, keyboard-only, or screen-reader session was available
- local Docker pgTAP execution is `BLOCKED` because Docker is unavailable; the same repository SQL suites passed against linked cloud PostgreSQL
- the first fresh Node 22 Auth Realtime run timed out after the channels subscribed; the immediate cleanup audit was zero, the complete Auth suite passed on the second run, and the independent Admin and academic/personnel authenticated Realtime suites also passed
- Cloudflare production is reachable but is not deployment-equivalent to the preserved worktree; the deployed OG image path currently falls through to SPA HTML
- the 3D chunk remains approximately 878 kB minified
- dependency audit reports two low, three moderate, and one high advisory; Vite has a non-major remediation available, while the React Router and Quill dependency paths require deliberate major upgrades. No dependency change was made during acceptance
- PWA manifest presence is not offline support
- CLARA remains a conservative local facility matcher, not the final grounded Groq/tool integration

See `63-implementation-status-registry.md` for the evidence matrix.

## Owner-approved UI baseline adoption checkpoint

**Status:** COMPLETE WITH ADVISORY — 15 September 2026 (`ACCEPTED_WITH_ADVISORY`)

Completed without starting Phase 3:
1. recorded `DEC-UI-002`, superseding the older strict grayscale / Apple-only constraint where it conflicted with the approved CampusNav Ink direction
2. registered the supplied all-pages HTML as visual/UX reference only
3. centralized typography, neutral, CampusNav green, emergency red, radius, border, shadow, grid, and blueprint tokens
4. added reusable React blueprint/kicker/section-label primitives and aligned the global shell, public screens, Navigate surroundings, account surfaces, and Admin shell
5. preserved all existing routing, spatial data, Supabase, Auth/RBAC, Realtime, Dashboard, schedule/personnel, emergency, QR, 2D/3D, PWA, and CLARA behavior
6. passed ESLint, typecheck, production build, route rendering, and all deterministic regression suites
7. inspected automated desktop captures for eight public routes

Advisories:
- **AUTOMATED RENDER VERIFIED / MANUAL VISUAL QA PENDING.**
- authenticated Admin visual interaction, physical devices, keyboard-only use, screen readers, physical camera/QR, and representative WebGL devices remain manual QA work
- no deployment was requested or performed, so production equivalence is not claimed
- the existing approximately 878 kB minified 3D chunk warning remains

This checkpoint is presentation-only and does not authorize Phase 3 or any new capability.

## Recommended Phase 3 — Accepted Baseline Release and Manual QA

**Status:** IN PROGRESS — exact-revision production deployment verified 17 September 2026; manual-device QA remains pending

### Release-candidate Checkpoint A — prepared 16 September 2026

**Classification:** `ACCEPTED_WITH_ADVISORY`

Completed preparation:
1. classified every remaining modified/untracked path and isolated accepted Phase 8C.2 implementation from the separate social-preview work
2. confirmed the implementation under review is the same preserved code that received Phase 2 live-cloud acceptance evidence; the Phase 2 commit changed tracking documents only
3. reviewed migration `20260915052147_phase_8c2_personnel_academic_admin_ui.sql` for ordering, linked-cloud presence, conflict constraints, consultation-location optionality, and absence of table drops, replacement tables, or RLS-policy changes
4. reconfirmed zero DEVELOPMENT/DEMO fixtures across all 14 audited categories and reran the repository/build credential audit without exposing secrets
5. passed all deterministic regressions, route rendering, ESLint, typecheck, and production build
6. prepared an explicit-path Git staging set for the accepted Phase 8C.2 and Phase 2 support files only

Checkpoint boundaries and advisories:
- no commit, push, deployment, reset, clean, restore, stash-pop/drop, or dependency upgrade was performed
- the approved social-preview metadata and image remain a separate unstaged Checkpoint B
- the alternative `campusnav-og-v3.png` concept contains unsupported institutional claims and is excluded from both checkpoints
- current production remains non-equivalent until an exact accepted revision is deliberately deployed and verified
- **MANUAL DEVICE QA PENDING**; the existing approximately 878 kB minified lazy 3D chunk and dependency advisories remain

Recommended scope:
1. obtain owner review/approval and commit Checkpoint A as a deliberate release candidate
2. review and commit the separate social-preview Checkpoint B if approved
3. deploy the exact accepted revisions and verify Cloudflare asset equivalence, including the social-preview image response
4. complete real graphical desktop, tablet, and mobile QA
5. complete keyboard-only, focus, reduced-motion, contrast, and screen-reader QA without claiming WCAG conformance until evidence supports it
6. verify physical camera/QR fallback and representative WebGL-capable plus WebGL-fallback devices
7. triage the dependency advisories through deliberate, regression-tested upgrades

Do not begin a new facility, PWA, map-editor, reporting, or CLARA capability until this release-equivalence/manual-QA scope is approved or explicitly deferred by the owner.

### Exact-revision production deployment — verified 17 September 2026

**Classification:** `PRODUCTION_MATCHES_CURRENT_BASELINE` / `ACCEPTED_WITH_ADVISORY`

Completed outcomes:
1. deployed clean approved revision `128ac403c2fcf57f4f471543ea79b2c4f0ed6369` (`128ac40`) through the existing Cloudflare Workers Static Assets configuration
2. recorded Cloudflare version `3636917e-ddf5-4b98-9737-c44f0478f226` at the canonical workers.dev endpoint
3. matched production HTML, main JavaScript, CSS, and lazy 3D chunk byte-for-byte to the local release build
4. verified direct SPA responses for `/`, `/dashboard`, `/facilities`, `/map`, `/map?mode=emergency`, `/login`, and `/admin`
5. verified the canonical SCC logo and social-preview PNGs return real `image/png`, while obsolete JPG/v2/v3 paths return SPA HTML rather than approved image assets
6. verified complete canonical OG/Twitter metadata, production Supabase Auth settings initialization, and a read-only public Data API request
7. confirmed the heavy 3D chunk remains lazy and absent from initial HTML

Advisories:
- the connected graphical browser runtime was unavailable, so authenticated graphical Admin interaction was not repeated; byte-identical production bundles, deterministic Auth/Admin/render suites, direct route responses, and live read-only Supabase initialization provide deployment-equivalence evidence without replacing manual QA
- **MANUAL DEVICE QA PENDING** for real desktop/tablet/mobile, keyboard-only, screen-reader, physical camera/QR, and representative WebGL-capable/fallback devices
- the existing approximately 878 kB lazy 3D chunk, dependency advisories, manifest-only PWA status, and deferred grounded CLARA integration remain unchanged

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
