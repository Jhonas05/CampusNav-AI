# CampusNav AI — Quality Gates and Release Checklist

## Baseline gates
- production build succeeds
- no secret is committed/exposed in client output
- migrations/configuration are reproducible
- relevant tests pass
- new UI includes loading/empty/error/permission states
- documentation/status is updated where changed

## FS-4 final engineering acceptance gates — 16 October 2026

- `COMPLETE / ACCEPTED_WITH_ADVISORY / OWNER AUTHORIZED` — `DEC-FAC-003`; the seven-capability requirement/owner/reuse/evidence matrix in `63` satisfies `13`/`18`/`20`/`32`/`42`/`58`. No mandatory FS-4 engineering defect remains; final-system DoD and Phase 4 remain incomplete.
- `37 DISTINCT DETERMINISTIC SUITES PASS` — fresh enumeration: 34 direct non-cloud package-script suites, GlobalSearch 42/42, DestinationSearch 43/43, plus PWA built artifacts after build. Discovery 53/53, recommendations 45/45 and CLARA 32/32 pass; FS-1/FS-2/FS-3/Phase 8, navigation/mobility/preferences/QR/Emergency/3D, Dashboard/theme/mobile/map/render coverage is retained. No tests changed or weakened.
- `TOOLING PASS` — lint, typecheck, production build, PWA built-artifact checks (47 public-static precache entries) and `git diff --check`. Existing lazy-3D/dependency advisories remain; no package/lockfile update or new performance certification.
- `RETAINED BROWSER EVIDENCE` — Detail 24 / Directory 18 fixture captures; discovery 160 responsive + 9 interactions + 7 offline; recommendations 160 + 8 + 7; GlobalSearch 192 + 15 + 6; DestinationSearch 288 + 14 + 6. These are recorded slice runs, not freshly rerun device acceptance. Fresh deterministic coverage confirms retained contracts; FS-4 implementation files are unchanged through the CLARA baseline.
- `PRODUCTION READ-ONLY PASS AT OBSERVED LEVEL` — CLARA build check for `474102b` completed successfully at `2026-10-15T16:24:51Z`; 11 live Chrome checks at 390/1440 passed, including new grounded welcome/sources, honest unavailable events, destination-only Map handoff and existing Facilities/Detail. All 24 observed public projection GETs returned HTTP 200 with zero rows; no official catalog coverage inferred. Zero unexpected page/console errors, external AI calls or remote writes.
- `ASSET VARIATION RETAINED` — production HTTP 200 serves `index-rYEQVvGN.js`, not expected/local `index-CI2O9ZNl.js` or previous `index-Drw9zF2G.js`. New foundation behavior and disabled provider factory are observed; byte-for-byte build equivalence/cause of variation are unproven. No manual deployment or configuration change. Future unused provider-policy fields are tree-shaken in both builds; final external QA used the emitted disabled-capability factory after correcting selector/literal assumptions.
- `RLS ENVIRONMENT UNAVAILABLE / NOT A PASS` — `npm run test:rls` failed to connect to local PostgreSQL `127.0.0.1:54322`; Docker is absent. No new schema/security change or fresh cloud RLS/CRUD claim. Prior accepted linked security evidence remains preserved.
- `OWNER DISPOSITIONS, NOT IMPLEMENTATION` — Personnel GlobalSearch separate and unimplemented; unified ranking/partial-fuzzy aliases deferred; exact approved aliases and existing deterministic consumer policies retained. Official institutional coverage, physical-device/camera/software-keyboard/non-Chromium/screen-reader/WCAG, broad performance and adviser acceptance remain explicit advisories/external dependencies.
- `DOCUMENTATION ONLY / PRESERVED BOUNDARIES` — no source/tests/packages, Supabase schema/RLS/grants/data, CLARA/Gemini configuration, worker/cache, spatial/A*, Emergency/preferences, Admin, FS-5 or FS-6 change. Canonical references/fences/current status/decision scope and protected stash are checked. External evidence: `C:/Users/St.Clare/Documents/CampusNav-AI-fs4-acceptance-qa/2026-10-16`.
- `GIT DELIVERY GATE` — apply `53` with exact documentation staging, complete staged review/check, clean task commit, unexpected-advancement guard, FF-only integration, post-merge verification, push/equality and safe deletion only of this task branch. Results are reported after execution; legacy worktrees/stashes remain protected.

The dated evidence sections below preserve their original slice-stage status, suite counts and exclusions; this final reconciliation controls current FS-4 acceptance, not a retroactive rewrite of those runs.

## CLARA grounded foundation evidence — 16 October 2026

- `READY_WITH_BOUNDARIES / IMPLEMENTED_VERIFIED / OWNER AUTHORIZED FOUNDATION` — deterministic FAQ/public-tool grounding only; no approved production FAQ content and no claim of completed generative CLARA
- `32/32 PASS` — exact/alternative/Filipino/Taglish/multiple/ambiguous/no-result/unpublished/expired/effectivity-boundary/DEMO retrieval; facility/status/service/missing mapping; freshness, personnel privacy, Emergency isolation, provenance, injection resistance, canonical actions; disabled provider, rate/quota fallback, content-free usage monitoring, key/cache/privacy scans, mobile accessibility and existing conservative behavior
- `ZERO EXTERNAL AI REQUESTS` — disabled policy rejects before provider invocation; no SDK, key, endpoint, paid tier/fallback, automatic upgrade, or raw conversation persistence
- `LOCAL PERFORMANCE` — final pre-regression run over 500 synthetic eligible FAQ records and 1,000 queries: P50 0.897 ms / P95 1.389 ms under Node 22; no device/network guarantee
- `GEMINI BLOCKED` — official sources checked 16 October 2026; current terms prohibit API clients likely accessed by under-18s. Free-tier availability does not remove the audience, privacy, quota, or billing gates. See `76`
- `FULL LOCAL REGRESSION PASS` — all 34 top-level deterministic commands / 36 underlying suites passed, including retained FS-1–FS-4, search, navigation, mobility, QR, Emergency, 3D, Dashboard, theme, mobile, render, PWA and Phase 8 coverage; lint, typecheck, production build, generated PWA artifact and diff checks also passed
- `RLS ENVIRONMENT BLOCKED` — `npm run test:rls` could not connect to the local PostgreSQL endpoint at `127.0.0.1:54322`; Docker is not installed in this environment. This is an environment limitation, not a passing database result
- Git delivery, production deployment observation and cleanup are recorded only after their corresponding commands complete

## Git delivery and cleanup gate — owner-directed 15 October 2026

Apply the single operational procedure in `53-git-workflow.md`: dedicated task branch, one authoritative worktree by default, verified clean/fetched baseline, required pre/post-merge tests and lint/typecheck/build/PWA/documentation checks, exact path staging/full staged review/cached whitespace check, fast-forward-only integration, verified main push/equality, then safe current-task cleanup. Do not bypass failed checks, required PR review/protection, unexpected divergence, or preservation safeguards. Confirm committed/pushed reachability, no unique commits/changes/ignored or untracked work, unused disposable temporary worktree, and task-owned process shutdown before non-force Git removal and safe branch deletion. Report clean synchronized authoritative main separately from preserved dirty legacy worktrees and exact cleanup blockers; legacy cleanup is separately authorized. This gate adds no product implementation or background cleanup job.

## Navigation/map gate
- same-floor + multi-floor smoke routes pass
- no wall crossing
- blocked/construction behavior passes
- 2D/3D preserve same route/current/destination
- QR/manual fallback passes

## FS-4 DestinationSearch service resolution evidence — 15 October 2026

- `READY_WITH_BOUNDARIES / IMPLEMENTED_VERIFIED / OWNER AUTHORIZED` — explicit owner implement-not-defer decision in `DEC-FAC-002`; Home/Navigate reuse accepted public matcher/snapshot and unchanged canonical selection callbacks; overall FS-4 remains `IN_PROGRESS`
- `43/43 PASS` — exhaustive legacy direct ranking/browse compatibility, service tiers/exact aliases, zero/one/multiple/non-navigable mappings, canonical identity, deduplication/explanations/overflow, no configured-rank leakage, provenance/lifecycle, count/cap guards, snapshot coalescing/offline/late-response/retry/boundary/cleanup, source/render/accessibility/selection contracts
- `FULL REGRESSION PASS` — 36 deterministic suites (previous 35 plus DestinationSearch), including retained GlobalSearch/discovery/recommendations, all FS-1–FS-4, navigation/mobility/preferences/multi-floor/QR/Emergency/3D, Dashboard/theme/mobile/render/PWA/Phase 8; lint/typecheck/build/PWA artifact/diff gates
- `288/288 PASS` — Home/Navigate × eight widths × Light/Dark × nine responsive cases; service names/exact alias, canonical/overlap/extra choices, pending/DEMO/unmapped/non-navigable/zero catalog, three activation-only reads, zero typing reads, 44px controls/overflow/CLARA-button/bottom-nav clearance
- `14/14 PASS` — deliberate Home keyboard handoff, grouped Arrow/Enter/Escape/Tab/Clear, GlobalSearch coalescing, normalized failure/retry, expiry, both session preferences at 390/1440, unchanged origin, obsolete route clearing, 2D/3D, simulated QR resolution/confirmation and task-modal isolation, System/reduced-motion/simulated keyboard viewport, Emergency exclusion
- `6/6 PASS` — real built-worker control, immediate dynamic suppression, Home canonical selection, offline reload/manual positioning/Standard and Avoid Stairs routes, reconnect/explicit uncached-client reload recovery, no API/Auth cache, blocked offline Emergency
- `ERROR ACCOUNTING` — zero unexpected browser errors; three deliberately induced HTTP-400 and seven offline transport errors separately recorded. Initial DOM iteration/type/static-query issues and focused Escape/reopen defect were corrected; lazy-route browser-driver readiness corrected, then passing reruns recorded in `63`
- `PERFORMANCE/PRESERVATION` — zero picker startup reads, three successful public reads per activation, coalesced concurrent consumers, zero per-result/keystroke directory reads; unchanged 1,000-row/exact-count guards and snapshot lifecycle. Concrete local timing/bundle/cache observations in `63`; no formal low-end-device claim
- `BOUNDARIES` — no remote mutation/seed, provider-query/private/schema/grant/RLS/Auth/audit/Admin, matching/recommendation algorithm, dependency, worker policy, spatial/engine/Emergency/CLARA business-logic change. Physical-device/camera/non-Chromium/screen-reader/WCAG/software-keyboard/institutional/adviser limits remain; no automatic FS-4 closure, Personnel/unified-ranking or FS-5/FS-6 implementation

## FS-4 GlobalSearch Services evidence — 15 October 2026 (earlier slice checkpoint)

- `READY_WITH_BOUNDARIES / IMPLEMENTED_VERIFIED / OWNER AUTHORIZED` — accepted public matcher/projections, shared active snapshot and explicit canonical destination choices; overall FS-4 remains `IN_PROGRESS`
- `42/42 PASS` — new GlobalSearch deterministic suite: names/exact aliases/multiple/unmapped/overlap/deduplication/provenance/eligibility/truncation/public boundary/coalescing/offline/late responses/retry/boundaries/compatibility/source/render checks; interactive assertions are separately browser-verified
- `FULL REGRESSION PASS` — 35 suites (previous 34 plus new GlobalSearch), including FS-1–FS-4, mobility/preferences, navigation/QR/Emergency/3D, Phase 8, Dashboard/theme/mobile/render/PWA; lint/typecheck/build/built-worker/diff gates
- `192/192 PASS` — eight widths × Light/Dark × twelve responsive cases; canonical/service/alias/overlap/one/multiple/unmapped/pending/DEMO/non-navigable/zero states, labels/actions/44px/overflow/CLARA clearance
- `15/15 PASS` — shared/in-flight read counts, focus/Tab/Escape/return, Arrow/Enter Details, native Navigate link Enter, failure/retry, expiry, simulated keyboard viewport, both route preferences and repeated URL handoffs, task-dialog/More activation, native/fallback fullscreen, resize and memory observation
- `6/6 PASS` — built-worker control, immediate dynamic suppression/canonical fallback, offline reload/Navigate, reconnect with explicit uncached-client recovery, no operational/API/Auth cache, offline Emergency block; seven expected offline transport errors separately recorded
- `PERFORMANCE` — three standalone discovery reads, seven total when Facilities shares the snapshot, zero typing/filter requests; unchanged exact-count/1,000-row guards; lazy GlobalSearch/processing; inactive snapshot/index/timer release; concrete bundle/load/memory limits in `63`
- `PRESERVATION` — no remote writes/seeds, provider queries, schema/RLS/grants/audit/Auth/Admin/worker/dependency/lockfile/branding/spatial/routing-engine changes; protected legacy work/stash untouched
- `ADVISORIES` — synthetic populated evidence is not official catalog coverage; no full GlobalSearch/FS-4, unified ranking, physical-device/non-Chromium/screen-reader/WCAG, real keyboard or broad performance claim. DestinationSearch/Personnel remain separately gated. Browser harness corrections and resolved modal-guard issue are disclosed in `63`

## FS-4 configured service recommendation evidence — 15 October 2026 (earlier slice checkpoint)

- `READY_WITH_BOUNDARIES` — FS-4 scope, accepted public rank/parent availability, existing FS-1B rank/ID ordering, existing discovery foundation, and explicit owner authorization satisfy readiness; no migration or institutional-data fabrication
- `IMPLEMENTED_VERIFIED / OWNER AUTHORIZED` — separate configured-location lists on `/facilities`; accepted Detail/Directory/discovery preserved; overall FS-4 `IN_PROGRESS`
- `45/45 PASS` — configured eligibility/order/ties/deduplication/lifecycle/parents/provenance/pending/DEMO/no inference/status-distance independence/invalid rank/failure/offline/canonical actions/search preservation/rendering/bounded public reads/950-mapping scale
- `FULL REGRESSION PASS` — complete 34-suite deterministic matrix including retained discovery 53/53, all FS-1–FS-4/Phase 8/navigation/mobility/mobile/QR/Emergency/3D/Dashboard/theme/render/PWA suites and built-worker checks; lint/typecheck/build/diff gates
- `160/160 PASS` — eight requested widths in Light/Dark; one/multiple locations, rank/ties, service/alias/unmapped/excluded/zero-data/failure states, CLOSED/UNKNOWN and operational pending/DEMO labels, filters/counts/actions/44px/CLARA/overflow
- `8/8 PASS` — canonical Navigate/Details, keyboard filters/focus, mapping/alias expiry, provider retry, System theme/reduced motion
- `7/7 PASS` — production worker, immediate offline suppression, canonical lookup/deep link/actions, reconnect revalidation, no API/Auth cache, explicit uncached-client reload recovery
- `PERFORMANCE` — seven successful initial public reads, zero typing/filter reads; memoized indexes; local 950-mapping sort 1.69 ms; fixture ready 706–1,597 ms; Facilities +2,393 bytes, service +2,156 bytes, shell/CSS/lazy-3D unchanged; see `63` for measurement boundaries
- `SECURITY/PRESERVATION` — no remote writes/seeds, private/React query, schema/RLS/grants/audit/Auth/Admin/provider-query/worker/lockfile/dependency/branding/spatial/route change; protected stash/unrelated worktrees preserved
- `ADVISORIES` — zero-data production remains valid; official completeness, 1,000-row cap, physical devices/non-Chromium/screen readers/WCAG, broad performance, existing dependency/lazy-3D and adviser limits remain; no full-FS-4 or AI claim

## FS-4 public service discovery / approved alias evidence — 15 October 2026 (earlier slice checkpoint)

- `IMPLEMENTED_VERIFIED / OWNER AUTHORIZED` — existing `/facilities` only; Detail and Directory/Card remain owner-approved; overall FS-4 remains `IN_PROGRESS`
- `53/53 PASS` — canonical compatibility/priority, approved exact aliases, public/effective parent/mapping checks, independent provenance, DEMO/pending exclusion, no inference, deterministic deduplication, filters/counts, failure/expiry/offline fallback, bounded public reads with exact-count truncation detection, rendering/security, and local processing
- `FULL REGRESSION PASS` — complete 33-suite matrix including all accepted safety/domain/UI suites and PWA built-worker checks; affected suites rerun after scoped recovery changes
- `160/160 PASS` — eight requested widths in Light/Dark, canonical/service/alias, multiple mappings, unmapped/pending/DEMO/provider-failure states, floor/category filters, announcements, 44px actions, CLARA clearance, no critical overflow, and zero unexpected console/page errors
- `9/9 PASS` — deep links/actions, keyboard filter dialog and resize, service-provider failure/retry, independent status-provider failure, empty catalog, and automatic loaded-alias expiry revalidation
- `7/7 PASS` — real production-worker control, offline dynamic removal/local search/deep links, ordinary reconnect revalidation, no API responses in Cache Storage, and explicit reload recovery for an uncached backend-client module after offline reload
- `EXPECTED TRANSPORT FAILURES` — intentionally induced network aborts and offline static/client cache misses recorded separately; no unexpected application error
- `BOUNDED PERFORMANCE` — seven successful initial public queries (4 existing + 3 discovery), exact-count truncation checks, zero keystroke/filter requests; existing SDK failure retries remain bounded (up to four attempts/projection in fixtures). Memoized index; approximately 41–61 ms per 1,000 local searches; 673–2,086 ms local fixture readiness is observational, not a real-device budget claim
- `PASS` — lint/typecheck/production build, 44 public-static precache entries / 1612.91 KiB, and Git diff checks; 3D remains lazy and unchanged in size
- `BOUNDARIES` — no database/RLS/grant/view/Auth/audit or remote mutation; no dependency/lockfile/worker-policy changes; no inferred services, recommendation rank scoring, configured recommendations, GlobalSearch/DestinationSearch, fuzzy/AI, media, Dashboard/Realtime, mobility/Emergency changes, FS-5/FS-6, or official seeding
- `ADVISORIES` — official catalog completeness; 1,000-row fail-closed projection cap; broader ranking; physical devices/non-Chromium/screen readers; unchanged dependency and lazy-3D advisories

## Mobile Route Preferences UI evidence (`DEC-NAV-002`) — 14 October 2026

- `COMPLETE — ACCEPTED_WITH_ADVISORY / OWNER AUTHORIZED` — phone/tablet dialog, desktop disclosure, same state in fullscreen; only Standard and Avoid Stairs selectable
- `23/23 PASS` — dedicated UI/API/state/failure/position/overlay contracts; accepted mobility-engine suite and complete 32-suite regression matrix retained
- `64/64 PASS` — four route states at all eight authorized widths in Light/Dark; no overflow, CLARA/route overlap, or console errors
- `14/14 PASS` — focus entry/containment/Escape/return, resize, active preference change, safe failure, explicit recovery, manual/QR positioning, Next/End, shared 2D/3D/floor/fullscreen state, and Emergency separation in local Chrome
- `7/7 PASS` — production-build worker control and offline Standard/Avoid Stairs routes, deep links/manual origin, safe failure/recovery, and blocked offline Emergency
- `PASS` — old geometry/instructions/progress cleared before every new route request; only confirmed endpoints reach the accepted API; preference has no storage/profile persistence
- `BUG FIXED` — destination results layer above the map; phone Scan QR remains reachable during navigation; offline notices clear the route sheet and yield to preference controls
- `BLOCKED / NOT CLAIMED` — step-free/wheelchair, crowd-aware, accessible Emergency, inferred connectors, physical camera/device, broad browser, screen-reader, or WCAG certification
- `PASS` — lint, typecheck, production build, built-worker boundaries, and Git diff checks; exact paths only and fast-forward-only owner-authorized Git completion

## Mobility route-options foundation evidence (`DEC-NAV-002`) — 14 October 2026 (earlier engine checkpoint)

- `IMPLEMENTED_VERIFIED (ENGINE ONLY) / OWNER APPROVED` — adviser/defense classification remains unchanged
- `17/17 PASS` — explicit route-option, eligibility, failure, immutability, consumer-isolation, offline, and scope-boundary checks
- `PASS` — omitted preference retains the exact existing `STANDARD` route contract; explicit `STANDARD` produces the same route
- `PASS — HARD CONSTRAINT` — `AVOID_STAIRS` rejects stair edges and unknown cross-floor connectors without graph mutation or cost penalties
- `PASS — SAFE FAILURE` — current cross-floor avoid-stairs request returns the canonical no-route message plus no-substitution guidance; no silent stair fallback
- `PASS` — same-floor eligible routing and deterministic entrance selection remain available; a stair landing node alone does not reject non-stair same-floor edges
- `PASS` — blocked, restricted, construction, QR/manual, 2D/3D shared-route, and Emergency approved-edge-only behavior remain intact
- `PASS` — bundled local implementation remains compatible with the accepted offline canonical 2D architecture; no worker/cache change
- `NO ACCESSIBILITY OVERCLAIM` — no STEP_FREE/wheelchair, elevator/ramp, crowd-aware, accessible-Emergency, or mobile UI capability is implemented
- `NO DATABASE / PROVIDER / DEPENDENCY CHANGE` — no schema, migration, remote data, provider, package dependency, or lockfile change
- `FULL REGRESSION PASS` — all 31 deterministic test scripts, ESLint, typecheck, production build, and Git diff checks are required for release

## Emergency gate
- approved emergency route test passes where data exists
- no normal-route fallback is possible
- safe no-route state verified

## Auth/admin gate
- unauthorized direct write fails
- role-scoped action succeeds for permitted user
- audit behavior checked for important actions

## Owner-directed PWA acceptance evidence (`DEC-PWA-001`) — 14 October 2026

- `COMPLETE — ACCEPTED_WITH_ADVISORY / OWNER AUTHORIZED` — adviser/defense classification remains unanswered and is not inferred
- `PASS` — manifest identity, scope, standalone behavior, raster/maskable/Apple/SVG icons, and deterministic manifest checks
- `PASS` — Workbox `injectManifest`, root registration, revisioned public-static precache, controlled cleanup, and explicit waiting-worker activation
- `PASS` — 44 initial precache entries totaling 898.57 KiB; Admin, Emergency, Supabase, QR decoder, optional Campus3D/Three, and social-preview assets excluded
- `PASS` — no API/Auth/Supabase/cross-origin/non-GET/runtime data caching, token caching, background sync, or offline mutation queue
- `PASS` — local production-build Chrome worker control, supported offline SPA/deep links, 95-entry facility fallback, manual positioning, and multi-floor route through the existing graph/A* engine
- `PASS` — real no-cache origin probe, network-only operational records, offline `UNKNOWN`/unavailable states, and reconnect revalidation
- `PASS` — non-forced install affordance, iOS guidance, offline/reconnected status, user-controlled update action, and mobile/focus/keyboard layout boundaries
- `PASS_WITH_ADVISORY` — QR decoder cache-on-use implemented but physical offline camera/QR not exercised
- `PASS_WITH_ADVISORY` — optional 3D cache-on-use verified in local Chrome; physical low-end/WebGL device behavior not certified
- `PASS — REQUIRED SAFETY BOUNDARY` — offline Emergency route action blocked with conservative guidance; ordinary A* never substitutes for approved emergency routing
- `PASS — FAIL CLOSED` — offline Admin unsupported; no authenticated response or write queued/cached
- `PENDING` — physical Android/iOS install, iOS/iPadOS, non-Chromium, screen-reader, low-end-device, broad eviction/storage, and post-merge Cloudflare production verification

## Phase 4 facility/service gate
- operational records use existing canonical facility IDs and introduce no competing spatial or routing truth
- migrations, RLS, grants, trusted audit, and fixture cleanup pass locally/linked as applicable
- no migration or test fixture is presented as official institutional data
- service recommendations come only from configured mappings; no-result behavior does not guess a destination
- facility-status tests cover weekly/overnight hours, dated exceptions, temporary closures, service interruptions, the 30-minute closing-soon threshold, scheduled-to-open, closed, and pending/unknown states in `Asia/Manila`
- operational status never blocks navigation unless canonical navigation/restriction data separately requires it
- media publication remains authorized, provenance-aware, type/size validated, and safely unavailable when missing
- public/Admin/Dashboard consumers reuse the provider-neutral FacilityService and centralized Realtime/provider pattern
- navigation, QR/manual, Emergency, Dashboard, Admin, and schedule/personnel regressions pass before Phase 4 acceptance

## Mobile-first UX simplification evidence (`DEC-UI-006`) — 13 October 2026

- `COMPLETE — ACCEPTED_WITH_ADVISORY / OWNER APPROVED` — no further visual-review checkpoint is required; Git completion and the automatic deployment path from `main` are authorized

- `PASS` — phone bottom navigation with five slots and a More sheet; every sidebar destination reachable once on phones; no CLARA navigation entry
- `PASS` — Home hierarchy (search, shortcuts, one map, Campus status, four quick actions, Today); Home and Dashboard kept separate by owner decision
- `PASS` — Navigate starts with no current location and no destination; `?facility=` and `?floor=` never set a location; no route or emergency search without a set location; the old start only under the labelled `?demo=1`; `?facility=library` regression covered
- `PASS` — at most two visible actions per card; one contextual Navigate sheet; notification preview capped at five
- `PASS` — facility images requested only with an approved `photoSrc`; zero image requests on the directory
- `PASS` — 26 local test scripts, ESLint, typecheck, and production build; routing, QR, emergency, 3D, and theme suites unchanged and passing
- `128/128 PASS + 18/18 INTERACTIONS PASS` — headless-Chromium responsive matrix: eight route states at 360, 375, 390, 430, 768, 820, 1024, and 1440 pixels in Light and Dark; no horizontal overflow, no bottom-navigation/CLARA overlap, no console error, and no non-local host contacted; interaction checks cover More/Filters focus and Escape, CLARA containment, destination/location setup, shell breakpoints, and Admin entry compatibility
- `REQUIREMENT-ALIGNED TEST UPDATES` — `test-map-experience.mjs`, `test-phase4-fs3c.mjs`, and `test-route-render.mjs` follow the owner-approved contract; no assertion was removed to make a test pass
- `NO DATABASE / REMOTE / DEPENDENCY CHANGE` — no schema, migration, RLS, remote Supabase mutation, package dependency, or lockfile change
- `ADVISORY — NOT PERFORMED` — physical Android Chrome, iOS Safari/non-Chromium, and representative-device checks (one-handed reach, soft keyboard, map gestures, safe areas, orientation, native fullscreen, camera QR). Chromium emulation is not physical-device validation
- `ADVISORY` — no screen-reader pass on the bottom navigation, sheets, or unset-location prompt

## Phase 4-FS-4 directory/card implementation evidence — 6 October 2026

- `PASS` — all 95 canonical facilities and IDs remain present and ordered; operational records are overlays only
- `PASS` — `getFacilitiesDirectory` uses one provider aggregate and the accepted FS-2 evaluator; the Supabase provider performs exactly four public-view reads independent of card count, with no N+1 or direct React query
- `PASS` — cards expose canonical name/floor/category, all seven status values, safe optional description, restrained demo/pending markers, Details, and optional canonical Navigate
- `PASS` — `UNKNOWN` remains distinct from `PENDING_VERIFICATION`; `CLOSED` and `TEMPORARILY_UNAVAILABLE` remain visible and do not alter routing
- `PASS` — provider/payload failure retains every canonical card, changes operational state to `UNKNOWN`, and shows one sanitized retry notice
- `PASS` — canonical-name/kind/floor search, category/floor filters, announced result count, labelled actions, semantic status text/icons, theme tokens, and keyboard controls are preserved
- `18/18 PASS` — intercepted headless-Chromium directory captures cover the populated directory in Light/Dark at 1440, 1366, 1280, 1024, 820, 768, 430, and 390 pixels plus provider failure at 1280 and 390; search, category, floor, result-count, and action checks pass without horizontal overflow, CLARA/action overlap, or console errors
- `25/25 PASS + TOOLING PASS` — dedicated directory and retained Facility Detail suites, all current deterministic FS-1/FS-2/FS-3 and safety/regression suites, route rendering, ESLint, typecheck, production build, and diff checks
- `NO DATABASE / REMOTE / DEPENDENCY CHANGE` — no schema, migration, RLS, fixture, official data, remote Supabase mutation, package dependency, or lockfile change
- `OWNER APPROVED` — the Facilities directory/card slice is accepted and committed independently of the unfinished Mobile UX presentation work
- `FS-4 IN_PROGRESS` — unified search/discovery, service/alias resolution, fuzzy matching, ranking/recommendation, GlobalSearch/DestinationSearch, media, Dashboard/Realtime, and later FS-4 work remain unstarted

## Phase 4-FS-4 first-slice implementation evidence — 6 October 2026

- `PASS` — canonical Facility Detail identity and existing Navigate handoff remain local/spatially authoritative
- `PASS` — provider-neutral `getFacilityDetail` composes independent profile, service, hours, and status envelopes with one hours-provider read and the sole accepted FS-2 evaluator
- `PASS` — missing/failed sections preserve canonical identity and successful sections; failed hours/status remain unavailable/`UNKNOWN` without an inferred closed state
- `PASS` — demo, pending, unavailable, published, split/overnight, closed-all-day, exception, and all seven accepted operational-status presentations are covered
- `PASS` — no public component queries Supabase directly; existing public projections and browser-safe provider remain the boundary
- `24/24 PASS` — intercepted headless-Chromium Facility Detail captures across both themes, eight required widths, and representative success/failure/status/not-found states; no horizontal overflow or console error
- `PASS` — dedicated FS-4 test, all current deterministic FS-1/FS-2/FS-3 and retained safety/regression suites, route rendering, ESLint, typecheck, production build, and diff checks
- `NO DATABASE / REMOTE / DEPENDENCY CHANGE` — no schema, migration, RLS, fixture, official data, remote Supabase mutation, package dependency, or lockfile change
- `OWNER APPROVED` — the Facility Detail slice is the accepted public-detail baseline
- `FS-4 IN_PROGRESS` — search/discovery/recommendation, GlobalSearch/DestinationSearch, media, Dashboard/Realtime, and later FS-4 work remain unstarted

## Phase 4-FS-3 final acceptance evidence — 6 October 2026

- `PASS` — FS-3A mutation/service foundation, allowlists, normalized errors, stale-write protection, guarded deletion, advisory reuse, and security boundaries
- `PASS` — FS-3B operational-profile and service-catalog workflows
- `PASS` — FS-3C service-alias and facility-service-mapping workflows
- `PASS` — weekly-hours and dated-exception workflows, including split, overnight, closed-all-day, strict Manila dates, lifecycle, provenance, stale handling, and guarded deletion
- `81/81 PASS` — FS-2C status evaluator/orchestration regression
- `PASS` — route rendering, ESLint, typecheck, production build, and diff checks
- `PASS AT SUPPLIED EVIDENCE LEVEL` — owner visual/functional sign-offs for the frozen UI direction, final single Admin shell, aliases/mappings UI, weekly-hours UI, and dated-exceptions UI; no browser, OS, physical-device, screen-reader, credential, or live-mutation detail is inferred
- `ACCEPTED_WITH_ADVISORY` — incomplete official institutional data; no fresh authenticated live mutation for every FS-3 resource; Firefox, Safari/WebKit, physical phone/tablet, and current FS-3 manual screen-reader verification pending; approximately 879.70 kB lazy Campus3D chunk; unresolved broader role delegation; no deployment-equivalence claim; reused legacy advisory CRUD without the newer optimistic stale-token pattern; and open dependency/security advisories
- `DEPENDENCY ADVISORY` — full `npm audit`: 17 total (8 moderate, 9 high, 0 critical); `npm audit --omit=dev`: 11 total (5 moderate, 6 high); no package was changed or claimed fixed
- `PHASE 4-FS-3 COMPLETE — ACCEPTED_WITH_ADVISORY` — no implementation, database, RLS, audit, or test blocker remains
- `FS-4 NOT_STARTED AT THIS CHECKPOINT` — the later first-slice FS-4 evidence above controls current status

## Schedule/personnel gate
- precedence/exceptions tested
- UI language does not claim presence from schedule

## Responsive/performance gate
- mobile/tablet/desktop smoke test
- 3D fallback/reduced-motion behavior checked where relevant

## Thesis-demo gate
- demo records labeled
- implemented vs future features clearly separated
- known limitations rehearsed rather than hidden

## Phase 3 release-candidate Checkpoint A evidence — 16 September 2026

- `PASS` — all deterministic facility/data, A*, same-floor, multi-floor, QR, Emergency, 3D/WebGL, Dashboard, Auth/RBAC, Admin, Phase 8C.1, Phase 8C.2, and route-render suites
- `PASS` — ESLint, typecheck, and production build
- `PASS` — linked migration list includes all four repository migrations in order
- `PASS` — linked fixture audit reports zero records in all 14 DEVELOPMENT/DEMO categories
- `PASS` — repository and build credential scan found no real privileged/provider/database/JWT/private-key credential; `.env.phase8a.session` is absent and untracked
- `PASS` — Phase 8C.2 migration review found no replacement table, table/column drop, or RLS-policy change
- `ACCEPTED_WITH_ADVISORY` — RLS, RBAC, audit, Realtime, class lifecycle, schedule/personnel invariants, conflict enforcement, and Dashboard refresh use the exact implementation accepted by Phase 2 live-cloud evidence; no new cloud mutation was needed for staging consolidation
- `DEFERRED` — social-preview metadata and canonical image are isolated as Checkpoint B and are not included in Checkpoint A
- `PENDING` — owner approval, commit, deployment-equivalence verification, physical device/browser/QR/WebGL QA, keyboard-only and screen-reader QA
- `ADVISORY` — the approximately 878 kB minified lazy 3D chunk and dependency audit findings remain; no dependency update was made

## Phase 3 canonical asset-cleanup evidence — 16 September 2026

- `PASS` — `SchoolLogo` has one approved image source: `/branding/scc-logo.png`; no JPG automatic fallback remains, and the existing accessible non-image fallback is preserved
- `PASS` — the canonical logo is a 600×600 PNG with true exterior alpha; RGB artwork is unchanged, internal white/light details remain opaque, and light/charcoal/green/emergency-red surface inspection passed
- `PASS` — Open Graph and Twitter metadata consistently target the absolute production URL for `/branding/campusnav-og.png`
- `PASS` — production `dist/branding` contains only `scc-logo.png` and `campusnav-og.png`
- `PASS` — legacy `scc-logo.jpg`, obsolete `campusnav-og-v2.png`, and unsupported `campusnav-og-v3.png` are absent from the production build
- `PASS` — ESLint, typecheck, route rendering, and production build
- `PASS` — no temporary session file, privileged/provider key, credentialed database URI, private key, JWT/token, or design-reference HTML is emitted
- `PENDING` — owner approval, commit, push, exact-revision deployment, and production-equivalence verification

## Phase 3 exact-revision production evidence — 17 September 2026

- `PASS` — clean `HEAD == origin/main == 128ac403c2fcf57f4f471543ea79b2c4f0ed6369`; temporary session file absent and backup stash untouched before deployment
- `PASS` — all deterministic data/navigation/QR/Emergency/3D/Dashboard/Auth/Admin/Phase 8 suites, route rendering, ESLint, typecheck, and production build
- `PASS` — Cloudflare Workers Static Assets deployment completed at the canonical endpoint as version `3636917e-ddf5-4b98-9737-c44f0478f226`
- `PASS` — production HTML, main JavaScript, CSS, and lazy 3D chunk match the local release build byte-for-byte
- `PASS` — direct SPA access for `/`, `/dashboard`, `/facilities`, `/map`, `/map?mode=emergency`, `/login`, and `/admin`
- `PASS` — canonical `scc-logo.png` and `campusnav-og.png` return real `image/png`; legacy JPG and OG v2/v3 paths are not image assets
- `PASS` — complete OG/Twitter metadata targets the canonical `campusnav-og.png`
- `PASS` — read-only production Supabase Auth settings and public Data API initialization return HTTP 200; no secret-key pattern is present in the deployed JavaScript
- `PASS` — 3D remains a separately loaded chunk and is absent from initial HTML
- `PRODUCTION_MATCHES_CURRENT_BASELINE` — exact production fingerprints and assets match the approved release build
- `PENDING` — graphical authenticated Admin, desktop/tablet/mobile, keyboard-only, screen-reader, physical camera/QR, and representative WebGL-device QA; no manual-device or WCAG completion claim is made
- `ADVISORY` — connected browser automation was unavailable, the approximately 878 kB lazy 3D chunk remains, and existing dependency advisories were not changed

## Phase 3 manual acceptance attempt — 17 September 2026

- `PASS` — canonical Phase 3 still authorizes the remaining manual acceptance subset; no new feature scope was entered
- `PASS` — production still serves the approved `index-D88W5mFD.js`, `index-DVdLsi8t.css`, `scc-logo.png`, and `campusnav-og.png`; only canonical tracking documents changed after deployed runtime revision `128ac40`
- `PASS` — fresh route rendering, Dashboard, QR/manual fallback, strict Emergency, shared 3D/WebGL fallback, Admin CMS, and Phase 8C.2 deterministic checks
- `STATIC REVIEW PASS` — responsive variables/breakpoints, laptop rails/grids, mobile navigation/route sheet, focus utilities, semantic labels, modal/status/error roles, reduced-motion rules, and non-color cues remain present
- `BLOCKED_BY_TOOLING` — approved in-app browser setup failed before page launch with OS error 3; no manual result is claimed for 1366x768, 1280x800, 1440x900, 1024x768, 768px tablet, or 390px mobile
- `BLOCKED_BY_TOOLING` — keyboard-only and authenticated Admin visual sessions could not start; credentials were not required or requested
- `LOGIC VERIFIED / PHYSICAL CAMERA QA PENDING` — QR logic passes; no camera-capable device evidence is available
- `AUTOMATED WEBGL VERIFIED / REPRESENTATIVE DEVICE QA PENDING` — 3D/WebGL fallback logic passes; no representative physical GPU/device evidence is available
- `PARTIAL` — static accessibility evidence remains, but contrast, touch-target use, focus order/traps, Escape behavior, and screen-reader output were not manually verified; no WCAG claim is made
- `NO FIX / NO REDEPLOY` — no reproducible application defect was found in available evidence, so application code and production were left unchanged

## Phase 3-MQA-1 primary laptop browser evidence — 17 September 2026

- `OWNER-REPORTED_MANUAL_BROWSER_PASS` — `1366x768` and `1280x800` were manually checked by the owner and reported acceptable
- `OWNER-REPORTED_MANUAL_BROWSER_PASS` — Dashboard, Facilities, Navigate 2D, Navigate 3D, CLARA, Login, and Admin were included and reported acceptable
- `ACCEPTED_WITH_ADVISORY` — a basic keyboard smoke check was included and reported acceptable
- `PASS` — the owner reported no blocker requiring application changes
- `NOT SPECIFICALLY DOCUMENTED` — screenshot/device/browser details; per-screen layout findings; exact keyboard commands/focus order/trap behavior; contrast; touch targets; screen-reader output; reduced motion; detailed 3D interaction/performance/WebGL-fallback observations
- `PENDING` — `1440x900`, `1024x768`, 768px tablet, approximately 390px mobile, physical QR/camera, and representative WebGL-device acceptance
- `NO CODE CHANGE / NO REDEPLOY` — evidence recording only; existing production equivalence remains unchanged
- `NEXT` — Phase 3-MQA-2 Remaining Responsive Viewport Acceptance

## Phase 3-MQA-2 remaining responsive viewport evidence — 17 September 2026

- `OWNER_REPORTED_MANUAL_BROWSER_PASS` — `1440x900` was manually checked and reported acceptable
- `OWNER_REPORTED_MANUAL_BROWSER_PASS` — `1024x768` was manually checked and reported acceptable
- `OWNER_REPORTED_RESPONSIVE_VIEWPORT_PASS` — 768px tablet viewport was checked and reported acceptable; `PHYSICAL_DEVICE_DETAILS_NOT_DOCUMENTED`
- `OWNER_REPORTED_RESPONSIVE_VIEWPORT_PASS` — approximately 390px mobile viewport was checked and reported acceptable; `PHYSICAL_DEVICE_DETAILS_NOT_DOCUMENTED`
- `ACCEPTED_WITH_ADVISORY` — responsive application scope included, where applicable, Home, Dashboard, Facilities, Facility Detail, Navigate 2D/3D, Events, Emergency, CLARA, Login, and Admin; individual per-screen findings are `NOT SPECIFICALLY_DOCUMENTED`
- `PASS` — owner reported `NO BLOCKER FOUND`
- `NOT SPECIFICALLY DOCUMENTED` — screenshots, browser/version, OS, physical-device model, measurements, detailed interactions, per-screen behavior, and performance observations
- `PENDING` — dedicated keyboard-only/accessibility, screen reader, contrast, reduced motion, physical QR/camera, and representative WebGL-device acceptance
- `NO CODE CHANGE / NO REDEPLOY` — evidence recording only; existing production equivalence remains unchanged
- `NEXT` — Phase 3-MQA-3 Keyboard-Only and Accessibility Manual Acceptance

## Phase 3-MQA-3 keyboard-only and accessibility evidence — 17 September 2026

- `OWNER_REPORTED_KEYBOARD_ACCESSIBILITY_PASS` — keyboard-only navigation, Tab, Shift+Tab, Enter, Space where appropriate, Escape/dialog behavior, focus visibility, forms/navigation usability, and no observed keyboard blocker/trap were manually checked and reported acceptable
- `OWNER_REPORTED_KEYBOARD_ACCESSIBILITY_PASS` — readable visual contrast, reduced-motion behavior, approximately 200% zoom usability, and labels/headings/status/error presentation were manually checked and reported acceptable
- `PASS` — owner reported no blocker requiring an application change
- `ACCEPTED_WITH_ADVISORY` — evidence applies to the current approved production baseline; relevant areas may include global navigation, Login, Dashboard, Facilities, Navigate controls, dialogs/drawers, CLARA controls, and Admin navigation/forms, but individual per-screen and per-control PASS results are `NOT SPECIFICALLY_DOCUMENTED`
- `SCREEN_READER_QA_PENDING` — no explicit screen-reader session evidence was provided
- `NOT SPECIFICALLY DOCUMENTED` — screenshots, exact browser/OS, assistive-technology configuration, detailed focus sequence, individual control behavior, authenticated Admin state, and detailed protected-form behavior
- `NOT_CLAIMED` — WCAG conformance, physical tablet/mobile certification, physical QR/camera PASS, representative WebGL-device PASS, and exact browser/OS certification
- `NO CODE CHANGE / NO REDEPLOY` — evidence recording only; existing production equivalence remains unchanged
- `NEXT` — Phase 3-MQA-4 Screen-Reader and Authenticated Admin Manual Acceptance; `READY` under the Definition of Ready, with screen-reader/browser and possible temporary credential execution dependencies

## Phase 3-MQA-4 historical attempt evidence — recovered 19 September 2026

- `READY` — Definition of Ready passed before execution; the MQA-4 goal, contracts, security/privacy boundaries, and evidence requirements were defined
- `PARTIAL / BLOCKED_BY_TOOLING` — historical execution did not complete
- `BLOCKED_BY_TOOLING` — browser failed before production launch with `failed to write kernel assets` (OS error 3)
- `SCREEN_READER_QA_PENDING` — no successful screen-reader environment was launched
- `IMPLEMENTED_UNVERIFIED` — no authenticated browser Admin session was completed; requested graphical/manual Admin checks remain unverified
- `NOT_CLAIMED` — no `SUPER_ADMIN_MANUAL_ADMIN_PASS` or `DEPARTMENT_ADMIN_MANUAL_BROWSER_PASS`
- `NOT TESTED MANUALLY` — AccessDenied, session, and logout behavior were not exercised during the attempt
- `NO FIXTURES / NO DATA MUTATION` — no test fixtures were created and no institutional records were mutated
- `NO CREDENTIAL USE` — no temporary credentials were requested or used; `.env.phase8a.session` was absent, untracked, and ignored
- `NO APPLICATION DEFECT FOUND` — failure was environmental/browser tooling; no code fix was made
- `NO DEPLOYMENT` — no production deployment occurred
- `NOT_CLAIMED` — WCAG conformance, physical-device certification, QR-camera acceptance, representative WebGL-device acceptance, and exact browser/OS certification
- `CURRENT UNFINISHED SUBPHASE` — MQA-4 remains open; historical tooling failure is not successful acceptance
- `NEXT` — complete real screen-reader manual acceptance and real authenticated Admin manual acceptance in a functioning environment

## Phase 3-MQA-4 resumed successful evidence — owner completed 19 September 2026

- `ACCEPTED_WITH_ADVISORY` — this later owner-reported run controls current MQA-4 status while the historical `PARTIAL / BLOCKED_BY_TOOLING` attempt above remains preserved
- `OWNER_REPORTED_SCREEN_READER_PASS` — Windows Narrator in a functioning graphical browser environment; Home, Dashboard, Facilities, Navigate, Login, and CLARA were reported acceptable
- `OWNER_REPORTED_SCREEN_READER_PASS` — navigation elements, buttons and links, heading structure, form labels, and status/error presentation were reported acceptable
- `SUPER_ADMIN_MANUAL_ADMIN_PASS` — the actual authenticated browser role tested was `SUPER_ADMIN`
- `SUPER_ADMIN_MANUAL_ADMIN_PASS` — Admin Overview, Announcements, Events, Facility Advisories, Notifications, Audit, Personnel, Courses, Sections, Class Schedules, Schedule Exceptions, Assignments, Consultation Hours, Check-ins, and Availability Overrides were reported acceptable
- `SUPER_ADMIN_MANUAL_ADMIN_PASS` — authenticated navigation, page/layout readability, tables/cards, form usability, labels, dialogs, validation presentation, no observed clipping/overflow blocker, session behavior, and logout behavior were reported acceptable
- `PASS` — owner reported no application blocker during the screen-reader or authenticated Admin smoke subsets
- `ACCESSDENIED_MANUAL_QA_NOT_TESTED` — no explicit AccessDenied exercise was supplied; it is not inferred from successful `SUPER_ADMIN` use
- `DEPARTMENT_ADMIN_BROWSER_NOT_TESTED` — no separate Department Admin browser session was supplied; SQL/RLS/backend evidence is not converted into manual browser evidence
- `NOT_CLAIMED` — WCAG conformance, full accessibility certification, screen-reader certification, physical-device certification, physical QR/camera acceptance, representative WebGL-device acceptance, and broad browser support
- `DOCUMENTATION ONLY` — no credential value, fixture, institutional-data mutation, environment-file change, application change, test execution, commit, push, or deployment

## Phase 3-MQA-5 physical QR/camera and manual-fallback readiness — 19 September 2026

- `READY` — goal, thesis-core status, contracts, canonical checkpoint relationships, privacy/security boundaries, error/fallback states, and acceptance cases satisfy `72-definition-of-ready.md`
- `READY_WITH_BOUNDARY` — checkpoint installation/label placement remains pending verification; this future smoke subset must not become an institutional installation certification
- `READY` — selected regression route is `QR-3F-LIBRARY → Registrar’s Office`; recognized QR resolution, invalid QR safety, denied/unavailable-camera manual fallback, state coherence, and existing A* routing are the required acceptance cases
- `PENDING_EXECUTION` — a camera-capable physical device, graphical browser in a secure context, and scannable canonical test label/payload are required
- `NOT_STARTED` — no QR/camera test or representative WebGL/device test is started by this documentation update
- `NEXT` — Phase 3-MQA-5 Physical QR/Camera and Manual-Fallback Acceptance
- `LATER GAPS` — representative WebGL-device acceptance and broader physical-device evidence

## Phase 3-MQA-5 successful physical QR/camera evidence — owner completed 19 September 2026

- `ACCEPTED_WITH_ADVISORY` / `MQA5_OWNER_REPORTED_PHYSICAL_QR_CAMERA_PASS` — every prepared physical QR/camera and fallback check was reported passed; no blocker or defect was observed
- `NOT_DOCUMENTED` — exact device model/type and OS/browser names and versions
- `QR_PAYLOAD_CAMERA_ACCEPTANCE` — production HTTPS Navigate page, permission prompt/grant, physical camera feed, rear/environment-camera behavior, valid `QR-3F-LIBRARY` recognition, Library/Third Floor confirmation, and QR-positioning presentation passed
- `PASS` — Registrar’s Office remained selected and the existing A* engine generated the canonical `3F → 4F → 5F` route; QR provided only the origin checkpoint
- `PASS` — invalid/unknown QR was rejected without replacing the valid location or inventing an origin/route; retry/manual fallback remained available
- `PASS` — manual Library/3F fallback remained distinguishable from QR positioning, preserved Registrar’s Office, and generated the same multi-floor A* route
- `PASS` — denied/blocked camera access retained a usable manual fallback and did not trap the user
- `PASS` — camera indicator/feed stopped after detection, exit, or switching to manual location
- `OWNER OBSERVATION ONLY` — no visible recording, upload, or person-identification behavior; no backend/privacy certification
- `PHYSICAL_LABEL_PLACEMENT_PENDING` — QR came from a temporary test medium; no installed campus checkpoint/signage acceptance
- `NOT_CLAIMED` — continuous indoor positioning, AI routing, A*-as-AI, broad device/browser support, iOS/Android certification, installed-label acceptance, or broad physical-device certification
- `DOCUMENTATION ONLY` — no application/source/package/test/QR/routing/data/environment/deployment change

## Phase 3-MQA-6 representative WebGL-capable and WebGL-fallback device readiness — 19 September 2026

- `READY` — thesis-core 3D/fallback goal, controlling contracts, shared spatial/route/state model, error behavior, and acceptance cases satisfy `72-definition-of-ready.md`
- `READY` — selected regression route is `Library 3F → Registrar’s Office 5F`; 2D and 3D must retain the same canonical `3F → 4F → 5F` route/node sequence
- `PENDING_EXECUTION` — requires documented device/OS/browser evidence for a representative WebGL-capable physical device and a real reproducible WebGL-disabled/unsupported/failure environment
- `NOT_STARTED` — no WebGL/device QA is started by this documentation update
- `NEXT` — Phase 3-MQA-6 Representative WebGL-Capable and WebGL-Fallback Device Acceptance
- `LATER GAPS` — broader physical-device evidence and installed QR-label placement verification

## Phase 3-MQA-6 successful representative WebGL-capable and fallback evidence — owner completed 19 September 2026

- `ACCEPTED_WITH_ADVISORY` — both prepared owner-reported behavioral subsets passed with no observed blocker
- `OWNER_REPORTED_REPRESENTATIVE_WEBGL_CAPABLE_PASS` — production HTTPS Navigate loaded in a WebGL-capable browser environment; 3D loaded and rendered campus/floor geometry plus current/destination markers
- `PASS` — Exploded, Stacked, 3F/4F/5F selection, Isolate Floor, Focus Floor, Entire Building, Reset View, orbit, zoom, pan, and applicable facility selection/focus worked; multi-floor transitions remained understandable
- `PASS` — the existing A* route remained `Library 3F → Registrar’s Office 5F` across `3F → 4F → 5F`; 3D remained a presentation of canonical spatial/route state
- `PASS` — 2D → 3D → 2D and return-to-3D switching preserved navigation state; no major clipping, unusable-control blocker, crash, blank scene, infinite loading state, or unrecoverable state was observed
- `OWNER_REPORTED_WEBGL_FALLBACK_PASS` — the prepared isolated Edge profile with WebGL-disabling launch flags provided a reproducible WebGL-disabled/failure environment and showed no fake 3D success
- `PASS` — the disabled session remained in or returned to 2D while retaining current location, Registrar’s Office, the active `3F → 4F → 5F` route, selected-floor/applicable state, textual instructions, and usable 2D route-floor navigation; the user was not trapped
- `NOT_DOCUMENTED` — physical device model/type, Windows edition/version/build, GPU, exact successful-execution browser version, and exact capable/fallback native WebGL probe values
- `EXACT_FALLBACK_WORDING_NOT_DOCUMENTED` — the exact message visually observed during the successful disabled-session run was not supplied
- `ADVISORY_UI_COPY_MISMATCH` — canonical copy is `3D view unavailable; switched to 2D.` while implementation/precheck copy is `3D view is unavailable on this device. CampusNav has switched to 2D.`; safe fallback behavior passed, but exact-copy conformance is not claimed and the mismatch remains for final reconciliation
- `ADVISORY` — the approximately 878 kB lazy 3D chunk remains; successful loading is not performance, universal-smoothness, GPU, broad-device, broad-browser, or universal-WebGL certification
- `NOT_CLAIMED` — A*-as-AI, Three.js/WebGL route intelligence, separate 3D routing, independent 3D spatial truth, broad compatibility, or performance certification
- `DOCUMENTATION ONLY` — no application/source/package/test/route/spatial-data/environment/deployment/production-data/AR/CLARA/PWA change

## Phase 3-MQA-7 final Phase 3 acceptance and evidence reconciliation readiness — 19 September 2026

- `READY` — goal, evidence sources, claims boundaries, gap handling, and reconciliation acceptance checks satisfy `72-definition-of-ready.md`
- `READY` — existing production/deployment, deterministic, and owner-reported MQA-1 through MQA-6 evidence supplies the required inputs; undocumented details remain undocumented
- `READY` — no credential, authenticated role, institutional-data write, new sensor collection, application change, deployment, or external environment is required to start reconciliation
- `NOT_STARTED` — this update records MQA-6 evidence and readiness only; it does not perform final Phase 3 reconciliation
- `NEXT` — Phase 3-MQA-7 Final Phase 3 Acceptance and Evidence Reconciliation
- `RECONCILIATION INPUTS` — fallback-copy mismatch, approximately 878 kB lazy chunk, broader physical-device evidence, installed QR-label placement, Department Admin/AccessDenied browser gaps, missing device/browser/GPU/probe details, and all other retained claims boundaries
- `DEFERRED` — AR Guidance remains `PROPOSED / DEFERRED / NOT_IMPLEMENTED / NOT_READY`

## Phase 3-MQA-7 final acceptance and gate reconciliation — completed 19 September 2026

- `PASS` — exact-revision production/deployment equivalence and deterministic release evidence remain accepted; subsequent MQA work was documentation/evidence recording only
- `PASS AT RECORDED EVIDENCE LEVEL` — MQA-1 through MQA-6 are accepted, covering the six target responsive viewports, keyboard/accessibility smoke, Windows Narrator smoke, authenticated `SUPER_ADMIN` smoke, physical QR/camera/manual fallback, and representative WebGL-capable plus reproducible WebGL-fallback behavior
- `NO PHASE 3 BLOCKER` — no unresolved application defect, unsafe fallback, release-equivalence failure, or defined manual-QA failure is supported by the canonical evidence
- `NONBLOCKING ADVISORY` — broader device/browser evidence, installed QR-label placement, missing device/OS/browser/GPU/native-probe details, exact fallback wording, fallback-copy mismatch, approximately 878 kB lazy 3D chunk, Department Admin/AccessDenied browser gaps, and earlier evidence granularity remain explicit
- `OWNER_OR_INSTITUTIONAL_DEPENDENCY` — complete authorized map/facility/hours/services/schedule/personnel data, public fields/check-in authority, and emergency ownership/coverage/sign-off remain outside Phase 3 release acceptance
- `ADVISER_OR_RESEARCH_DEPENDENCY` — title treatment and evaluation method/instrument/respondents/metrics/thresholds/statistics remain outside software acceptance
- `DEFERRED_OR_OUTSIDE_PHASE_3` — grounded CLARA, PWA/offline, map editor/version rollback, reports/analytics, AR Guidance, GPS/BLE/UWB, and other optional expansion are not accepted or authorized by this gate
- `FINAL SYSTEM DOD INCOMPLETE` — `28-definition-of-done.md` retains explicit `UNSATISFIED` and `DEFERRED` items; Phase 3 closure is not final thesis/demo completion
- `PHASE 3 COMPLETE — ACCEPTED_WITH_ADVISORY` — the accepted-baseline release and manual-QA phase is closed with the listed claims boundaries
- `NEXT / READY FOR DECISION COORDINATION` — Post-Phase-3 Thesis/Defense Scope, Institutional Data, and Evaluation Decision Gate
- `DOWNSTREAM IMPLEMENTATION NOT_READY / BLOCKED` — requires applicable adviser approvals, authorized institutional datasets/sign-offs, final defense-scope choices, and a verified/demo-labeled rehearsal plan before implementation authorization
- `NOT_CLAIMED` — WCAG conformance; broad device/browser/GPU/performance support; installed QR signage; complete institutional or emergency data; adviser approval; final thesis/demo readiness; or completion of deferred features
- `DOCUMENTATION ONLY` — no application/source/package/test/fixture/credential/environment/schema/data/deployment/commit/push change
