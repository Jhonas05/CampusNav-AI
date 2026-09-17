# CampusNav AI — Quality Gates and Release Checklist

## Baseline gates
- production build succeeds
- no secret is committed/exposed in client output
- migrations/configuration are reproducible
- relevant tests pass
- new UI includes loading/empty/error/permission states
- documentation/status is updated where changed

## Navigation/map gate
- same-floor + multi-floor smoke routes pass
- no wall crossing
- blocked/construction behavior passes
- 2D/3D preserve same route/current/destination
- QR/manual fallback passes

## Emergency gate
- approved emergency route test passes where data exists
- no normal-route fallback is possible
- safe no-route state verified

## Auth/admin gate
- unauthorized direct write fails
- role-scoped action succeeds for permitted user
- audit behavior checked for important actions

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
