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
