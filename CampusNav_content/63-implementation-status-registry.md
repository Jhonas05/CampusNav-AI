# CampusNav AI — Implementation Status Registry

## Purpose
Separate **required/design** documentation from what is actually implemented. Update only from code, tests, or live verification. The canonical development roadmap was reset by `DEC-ROADMAP-001`; existing implementation is preserved as baseline evidence and is not automatically complete under the reset roadmap.

## Frozen UI baseline integration onto Phase 4-FS-3B — 3 October 2026 (`DEC-UI-005`)

**Classification:** `UI FROZEN — INTEGRATED — IMPLEMENTED_VERIFIED (automated, headless Chromium) / OWNER VISUAL REVIEW PENDING`. Branch `wip/ui-freeze-integration`, based on `c7037e3`; not merged, deployed, or pushed. Phase 4 status is unchanged.

The owner-approved frozen interface (`DEC-UI-003` shell and floating CLARA, `DEC-UI-004` theme and motion, `DEC-UI-005` freeze) was built on `577610c` and predates FS-2C, FS-3A, and FS-3B. It was integrated as a three-way semantic merge: only `src/App.jsx`, `AdminShell.jsx`, `package.json`, this file, and `CHANGELOG.md` had changed on both sides. On the `wip/map-ui-redesign-v2` branch the frozen work had recorded `IMPLEMENTED_UNVERIFIED` shell/theme passes and an `ACCEPTED_WITH_ADVISORY` freeze pass with headless-Chromium evidence; the evidence below is fresh for the integrated tree.

| Area | Result | Evidence / boundary |
|---|---|---|
| Preserved functionality | `PASS` | Services, data, providers, Supabase files, and the navigation, pathfinding, emergency, QR/checkpoint, 3D, WebGL, authorization, and route-authorization libraries are byte-identical to `c7037e3`; `getFacilityHours`/`getFacilityStatus`/`facilityStatusEvaluator`, `facilityAdminService`, and the FS-3B routes, pages, editor, and `facilityAdminUi` are retained |
| Deterministic regression | `PASS` | `test:data`, `navigation`, `multi-floor`, `qr`, `emergency`, `3d`, `dashboard`, `theme`, `phase8a`, `phase8b`, `phase8c`, `phase8c2`, `phase4-fs1a`, `fs1b`, `fs2a`, `fs2b`, `fs2c` (81 scenarios), `fs3a`, `fs3b`, `render`, ESLint, typecheck, and production build pass under Node 22; the six navigation/QR/emergency/3D/render scripts are unchanged and `test-dashboard.mjs` was strengthened, not weakened |
| Frozen reference parity | `VERIFIED` (pixel comparison) | The frozen snapshot was built and served beside the integrated build with the same fixture, clock, and reduced motion: 10 public routes × 1440/390 × Light/Dark (40 captures) are pixel-identical; Admin captures differ only in the Admin section rail at 1440px (0.37–1.47% of pixels), where the current FS-3B Facilities/Services group is inserted. Measured at integration time; the later approved map upgrade (section above) intentionally replaces the Home and Dashboard visuals with the real map and changes the Navigate map controls and the Facility Detail thumbnail container, so those surfaces now differ from the snapshot by design. Parity of the other pages was not re-measured after the upgrade |
| FS-3B Admin in the frozen visual system | `VERIFIED_WITH_FIXTURE` | `/admin/facilities` and `/admin/services` use semantic tokens in Light and Dark; filter-row overflow fix, visible editor borders, `useModalDialog` (focus entry, Tab containment, Escape, focus return) on editor and delete dialogs; table at `xl`+ with no inner scroll at 1280–1440px, cards below with every action on screen; `SUPER_ADMIN` route guards and RLS unchanged |
| Role guards | `VERIFIED_WITH_FIXTURE` | `DEPARTMENT_ADMIN` denied `/admin`, `/admin/facilities`, `/admin/services` and allowed `/admin/personnel`; sidebar shows one Admin entry for admins and none for guests; guests are redirected to Login with a same-origin `returnTo` |
| Responsive / theme | `VERIFIED` (headless) | 10 public and 18 Admin routes × 1440, 1366, 1280, 1024, 820, 768, 430, 390 × Light and Dark (448 renders): no horizontal overflow, no sidebar/content overlap, correct theme class, no console errors; System follows the OS scheme; reduced motion leaves no hidden content |
| Keyboard / dialogs | `VERIFIED` (automated) | Skip link first in tab order; QR scanner, FS-3B editor and delete dialogs, and mobile drawer move focus in, contain Tab, close on Escape, and return focus to the opener; QR camera viewport is always dark |
| Navigate 2D/3D | `VERIFIED` (automated) | Library 3F → Registrar 5F route; desktop Next Step / End Navigation work; 3D renders the same route with step state preserved; CLARA never intersects map tools, view toggle, 3D controls, legend, or route panels at the eight widths |
| Map semantic colours | `VERIFIED` (2D automated; 3D screenshot) | Route `#15703C`, approved evacuation path and equipment `#B3261E`, exit `#15803D` (2D); legend swatches follow the marks each view draws, including floor-change, stairs, the 3D exit, and emergency-approved edges; dark mode inverts 2D lightness for map and legend alike |
| CLARA | `VERIFIED` (automated; assistant remains `PARTIAL`) | Floating popup and mobile sheet fit the viewport; answers come from the unchanged conservative local matcher with no model, key, or network call |
| Login `returnTo` | `VERIFIED_WITH_FIXTURE` | Through the real sign-in flow: `//host`, `/\host`, absolute, `javascript:`, and control-character paths land on `/dashboard`; plain same-origin paths are honored |
| Frozen-snapshot defects not carried over | `FIXED` | Desktop route step controls had no handlers; the mobile drawer did not return focus; legend swatches for floor change/stairs/3D exit did not match the map; the approved-edge overlay had no legend entry |
| Dependencies | `CLEANED` | 18 packages with zero imports in the integrated tree removed via `npm uninstall`; no version changed; `npm audit --omit=dev` 12 → 8 advisories (`react-router` moderate needing a major upgrade; `braces`/`micromatch`/`chokidar`/`fast-glob` via `tailwindcss`), not force-fixed |
| Bundle | `REVIEWED` | Entry 471.6 kB / 145.2 kB gzip (frozen 470.4 kB), CSS 116.1 kB / 20.8 kB gzip (frozen 115.7 kB); lazy 3D chunk 878.4 kB (existing advisory), QR decoder 415.3 kB, Supabase client 218.6 kB, FS-3B Admin 27.3 kB |
| Firefox / Safari (WebKit) | `NOT VERIFIED` | Not installed in this environment; support must not be claimed |
| Real devices, physical camera | `MANUAL DEVICE QA PENDING` | No physical device or camera was used |
| Live Supabase / real accounts | `NOT VERIFIED` | Signed-in evidence used a QA-only network fixture outside the repository; no request reached the live project |
| Phase 4 | `UNCHANGED` | FS-1/FS-2 accepted with advisory; FS-3A/FS-3B `IMPLEMENTED_VERIFIED`; FS-3C not started; public UI still does not consume `getFacilityStatus` |

## Owner visual refinement — 4 October 2026 (post-freeze refinement under `DEC-UI-005`)

**Classification:** `IMPLEMENTED_VERIFIED (automated, headless Chromium) / OWNER VISUAL REVIEW PENDING`. Presentation only; Phase 4 status unchanged.

| Area | Result | Evidence / boundary |
|---|---|---|
| Home composition | `VERIFIED` (automated) | Top-aligned hero. The real map stretches to the hero band. The hero has the destination search and the coverage strip. "Popular destinations" is visible in the first viewport at 1280, 1366, and 1440. The decorative graph band was removed. Height at 1440: 3208 → 2771 px |
| Home destination search | `VERIFIED` (automated) | Same `DestinationSearch` component as Navigate. The dropdown paints above the strip. Keyboard selection opens `/map?facility=<id>` with the destination preselected at 1440, 1024, and 390 (18/18) |
| Coverage strip | `PASS` | Values derived from `floors` and `facilities`: GF–5F and 94 facilities on the map. `test:map-experience` rejects typed-in figures |
| Dashboard | `VERIFIED` (automated) | Contract section order guarded by `test:dashboard`. No column gap at 1440. Office Availability is a compact list. Height at 1440: 4330 → 2862 px; at 390: 8710 → 6816 px |
| Facilities | `VERIFIED` (automated) | Denser auto-fill grid and phone row cards. Height at 1440: 10315 → 8173 px; at 390: 33080 → 14606 px |
| 3D framing | `VERIFIED` (automated) | Portrait canvases keep the full bounding sphere, so the building is no longer clipped at the sides. Landscape is unchanged |
| Regression | `PASS` | npm matrix 24/24 steps pass (21 suites, ESLint, typecheck, production build). Responsive matrix 448/448 (28 routes × 8 widths × Light/Dark). Interactions 144/144. Map QA 59/59. Layering 4/4 |
| Bundle | `REVIEWED` | Entry 471.7 kB (unchanged), CSS 117.4 kB (+0.4 kB), lazy 3D 879.7 kB and QR decoder 415.3 kB (unchanged), 2D renderer 21.8 kB (unchanged). `DestinationSearch` is now a 4.8 kB chunk shared by Home and Navigate, so the Navigate chunk shrank by about 5 kB |
| Not verified | `PENDING` | Owner visual sign-off; Firefox, Safari/WebKit, and physical devices; live authenticated Admin data |

## Real map reuse and immersive fullscreen navigation — 3 October 2026 (post-freeze change under `DEC-UI-005`)

**Classification:** `IMPLEMENTED_VERIFIED (automated, headless Chromium) / OWNER VISUAL REVIEW PENDING`. Approved new functional requirement (owner request), presentation only; Phase 4 status unchanged.

| Area | Result | Evidence / boundary |
|---|---|---|
| One map, one spatial truth | `PASS` | `CampusMapCanvas` is the only component that mounts `IndoorMap2D` and `Campus3D` and imports the canonical floors, facilities, nodes/edges, QR checkpoints, and emergency records; Navigate, Home, and Dashboard use it; geometry still lives only in `src/data/floors.js` and `src/data/additionalFloorMaps.js` (`test:map-experience`) |
| Home real map | `VERIFIED` (automated) | "Campus at a glance" shows the real 3D building on capable desktops (2D on phones/touch/low capability/no WebGL), floor selection focuses the floor, facility card and "Open full map" use `?floor=`/`?facility=`; the schematic floor stack is retired |
| Dashboard real map | `VERIFIED` (automated) | "Campus Overview" shows the real 2D map (3D on request) beside the real count links; the conceptual orbit graphic is retired; one heavy renderer per page |
| 2D pan/zoom | `VERIFIED` (automated) | Drag pans with a grab cursor; wheel zoom keeps the pointed map point fixed; zoom buttons step ×1.25; limits 0.6×–8× of the fitted scale; fit contains the floor; reset restores the readable Navigate default; keyboard arrows and +/− work; a drag never selects a room while a click does |
| Touch | `VERIFIED_SYNTHETIC` | Chromium touch emulation: one-finger pan and pinch zoom on Navigate; on previews a vertical swipe scrolls the page without moving the map and a pinch zooms. Real touch hardware not exercised |
| 3D orbit/pan/zoom | `VERIFIED` (automated) | Drag orbit, right-drag pan, wheel zoom, zoom in/out, aspect-aware fit, reset, and floor focus change the view; an orbit released over a room no longer selects it; a click still does; WebGL via SwiftShader only |
| Fullscreen | `VERIFIED` (automated) | Native Fullscreen API and the forced overlay fallback (desktop and 390px phone): the map fills the viewport, route state and step survive entry and exit, navigation continues inside, focus is contained and returns to the control, Escape and the visible Exit button work, the 3D canvas resizes to the fullscreen area and after resize/orientation change, CLARA's trigger is hidden while immersive |
| Emergency / QR / routing | `UNCHANGED` | Emergency Mode in fullscreen draws the same approved route with the same safety copy and legend; a QR-confirmed location is "you are here" in fullscreen 2D and 3D; no graph, route, restriction, QR, or emergency data changed; all deterministic suites pass |
| Legend / theme | `VERIFIED` (automated) | Route stroke `#15703C` with matching legend in Light and Dark fullscreen; previews and controls use semantic tokens |
| Responsive / console | `VERIFIED` (headless) | Home, Dashboard, and Navigate at 1440, 1366, 1280, 1024, 820, 768, 430, and 390 in Light and Dark with no horizontal overflow or console errors |
| Bundle | `REVIEWED` | Entry 471.7 kB (+0.1 kB), CSS 117.0 kB (+0.9 kB), lazy 3D 879.7 kB (+1.3 kB, existing advisory), QR decoder 415.3 kB unchanged; the 2D renderer is now a 21.8 kB chunk shared by Navigate, Home, Dashboard, and Facility Detail, plus a 6.8 kB preview chunk; desktop Home now loads the lazy 3D chunk after first render |
| Not verified | `PENDING` | Real phones/tablets and trackpads, iPhone/iPad Safari (overlay path verified only by disabling the API in Chromium), Firefox, device frame rate/memory for the 3D Home preview; 3D rotation has no keyboard equivalent |

## Phase 4 adoption — Core Facility & Service Workflow Completion — 20 September 2026

**Phase classification:** `IN_PROGRESS — FS-1 COMPLETE — ACCEPTED_WITH_ADVISORY; FS-2 COMPLETE — ACCEPTED_WITH_ADVISORY; FS-3 COMPLETE — ACCEPTED_WITH_ADVISORY; FS-4 NOT_STARTED`

**Owner decision:** `DEC-ROADMAP-002`

Phase 4 is the active software-development workstream. The owner decision itself supplies no implementation evidence; the later FS-1A linked acceptance evidence recorded below controls the current foundation status.

| Area | Current status | Phase 4 boundary |
|---|---|---|
| Phase 1 | `COMPLETE` | Historical evidence preserved; not reopened |
| Phase 2 | `COMPLETE — ACCEPTED_WITH_ADVISORY` | Historical evidence preserved; not reopened |
| Phase 3 | `COMPLETE — ACCEPTED_WITH_ADVISORY` | Historical evidence preserved; not reopened |
| Facility directory/detail/navigation foundation | `PARTIAL / IMPLEMENTED_BASELINE` | Existing local stable IDs, spatial truth, navigation links, and pending states remain authoritative |
| Facility operational profiles | `ACCEPTED_WITH_ADVISORY — FS-1B1 READ PATH` | FS-1A linked schema/RLS/audit acceptance is preserved; provider-neutral canonical-local plus optional public-view overlay read behavior passed final FS-1B reconciliation |
| Services, aliases, and facility-service mappings | `ACCEPTED_WITH_ADVISORY — FS-1B2/FS-1B3 READ PATHS` | Provider-neutral catalog/code/alias, facility-mapping, and reverse canonical-facility reads passed final FS-1B reconciliation; no live FS-1B Data API read is claimed |
| Hours and exceptions schema/security foundation | `ACCEPTED — FS-2A` | Linked migration, 89/89 corrected canonical pgTAP, remote structure/security/audit checks, and exact zero-fixture verification pass on the actual CampusNav project |
| Hours, exceptions, and closure source reads | `ACCEPTED_WITH_ADVISORY — FS-2B` | Provider-neutral local/null plus public-view aggregate read, strict Manila date ranges, defensive normalization, ordering, provenance, errors, and full deterministic regressions pass; no live FS-2B Data API read is claimed |
| Facility-status engine | `ACCEPTED_WITH_ADVISORY — FS-2C` | Pure Manila-time evaluator and public FacilityService orchestration pass final reconciliation; no live official-hours/status evidence is claimed |
| Facility Admin workflows beyond advisories | `COMPLETE — ACCEPTED_WITH_ADVISORY` | Dedicated mutation service plus `SUPER_ADMIN` profile/service/alias/mapping/hours/exception routes, lists, schedule-aware editors, explicit lifecycle actions, stale handling, guarded deletion, safe errors, deterministic regressions, owner sign-offs at the recorded level, and fixture-backed browser QA pass; live authenticated Supabase mutation remains unclaimed |
| Facility media lifecycle/storage | `NOT_IMPLEMENTED` | No approved photographs or upload workflow are claimed |
| Public search/recommendation enrichment | `NOT_IMPLEMENTED` | Existing name/kind/floor search is only the baseline |
| Dashboard operational availability | `PARTIAL` | Pending/unknown local states and advisories exist; connected computed office availability is not implemented |
| Adviser package | `PREPARED / AWAITING_ADVISER_CONFIRMATION` | Preserved external-decision material; no adviser approval claimed |

**FS-1 readiness:** `READY_WITH_BOUNDARIES`. The schema/RLS/audit/service foundation is sufficiently defined, uses pending/demo-safe behavior, and requires no official seed data. It may not alter spatial/routing truth or implement FS-2 through FS-7.

**Toolchain result:** FS-1A acceptance and FS-1B final reconciliation used Node 22.22.0. No dependency/package change was authorized or made by acceptance.

**Current Phase 4 boundary:** FS-1 and FS-2 are `COMPLETE — ACCEPTED_WITH_ADVISORY`. FS-3A, FS-3B, FS-3C, and the unnumbered final weekly-hours/dated-exception Admin UI capability passed final reconciliation, so Phase 4-FS-3 is `COMPLETE — ACCEPTED_WITH_ADVISORY`. No further FS-3 implementation capability is currently defined. Live authenticated mutation for every FS-3 resource and official institutional data remain outside the evidence. FS-4 is `NOT_STARTED` and requires separate owner authorization/readiness review.

### Phase 4-FS-3 final reconciliation and acceptance — 6 October 2026

**Classification:** `COMPLETE — ACCEPTED_WITH_ADVISORY`

This final record supersedes the prior current-state `IN_PROGRESS` / final-reconciliation-pending classification without rewriting the dated FS-3A, FS-3B, FS-3C, or hours/exceptions implementation evidence below.

| Evidence area | Result | Evidence / advisory |
|---|---|---|
| Accepted scope | `PASS` | One `facilityAdminService` foundation; operational profiles; service catalog; aliases; facility-service mappings; weekly hours; dated exceptions; intentional reuse of facility advisories; single `SUPER_ADMIN` Admin shell; and lifecycle/provenance/stale-write/guarded-delete/RLS/audit boundaries for the new resources |
| FS-3A / FS-3B / FS-3C | `ACCEPTED_WITH_ADVISORY` | Allowlisted provider-neutral mutations, immutable identities, normalized safe errors, profile/service/alias/mapping workflows, optimistic concurrency, guarded deletion, provenance, and the single Admin shell reconcile successfully; no fresh live mutation for every resource is claimed |
| Hours and exceptions | `ACCEPTED_WITH_ADVISORY` | Split/overnight/closed schedules, strict Manila dates, replacement semantics, overlap/closed-marker safety, lifecycle, provenance, stale handling, guarded deletion, and the FS-2 status boundary pass; no official institutional schedule is claimed |
| Reused facility advisories | `ACCEPTED_WITH_ADVISORY` | `TEMPORARY_CLOSURE`, `MAINTENANCE`, `RESTRICTED_ACCESS`, and `SERVICE_INTERRUPTION` remain in the existing accepted Admin workflow. Its confirmed deletion/RLS/audit behavior is retained unchanged; it does not use the newer FS-3 optimistic stale-token pattern |
| Security, RLS, and audit | `PASS` | PostgreSQL RLS remains authoritative, initial facility-operation writes remain `SUPER_ADMIN` only, UI code contains no privileged key or direct audit write, and trusted triggers remain the audit writer; no schema or remote change was required |
| Focused final verification | `PASS_WITH_EXISTING_ADVISORIES` | Fresh FS-3A, FS-3B, FS-3C, hours/exceptions, FS-2C 81/81, route render, ESLint, typecheck, production build, and diff checks pass; the complete earlier deterministic matrix remains accepted evidence |
| Owner sign-offs | `RECORDED_AT_SUPPLIED_LEVEL` | The owner supplied visual/functional sign-off for the frozen UI direction, final single Admin shell, aliases/mappings UI, weekly-hours UI, and dated-exceptions UI. Browser, OS, physical-device, screen-reader, credential, and exact live-mutation details are not inferred. This newer evidence supersedes the earlier current-state caveat that the owner's reviews predated the single shell |
| Browser/accessibility evidence | `ACCEPTED_WITH_ADVISORY` | Headless Chrome fixture evidence covers the recorded responsive widths, themes, schedule workflows, keyboard/dialog behavior, drawer behavior, and zero console errors; Firefox, Safari/WebKit, physical phone/tablet, and current FS-3 manual screen-reader verification remain pending |
| Institutional and deployment boundary | `ADVISORY` | Official operational data remains incomplete; no deployment-equivalence claim exists for this FS-3 revision; unresolved facility/department delegation remains an open institutional decision |
| Performance and dependencies | `ADVISORY` | The lazy Campus3D chunk remains approximately 879.70 kB. On 6 October 2026, full `npm audit` reports 17 advisories (8 moderate, 9 high, 0 critical) and `--omit=dev` reports 11 (5 moderate, 6 high); no dependency was changed or claimed fixed |
| Cross-phase boundary | `PASS` | FS-3 adds no public fuzzy/alias search, recommendation algorithm/consumer, media, Dashboard availability, Realtime integration, spatial/routing editing, or later-phase implementation |
| Final decision | `COMPLETE — ACCEPTED_WITH_ADVISORY` | All currently defined FS-3 implementation scope is accepted with named nonblocking limitations. FS-4 remains `NOT_STARTED` and requires separate owner authorization/readiness review |

### Phase 4-FS-3 unnumbered final capability — weekly operating-hours and dated operating-hour exceptions Admin UI — 4 October 2026

**Classification:** `IMPLEMENTED_VERIFIED — FINAL FS-3 RECONCILIATION PENDING`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Routes and authorization | `PASS` | `/admin/facility-hours` and `/admin/facility-hour-exceptions` are lazy `SUPER_ADMIN` routes in the single Admin shell; all other listed roles remain denied and existing RLS stays authoritative |
| Source-record workflows | `PASS` | List/search/filter/create/edit/publish/expire/guarded-delete use the accepted AdminService methods; no component calls Supabase or audit tables directly |
| Facility references | `PASS` | Choices are canonical local facilities filtered to existing operational profiles; facility identity is immutable after creation |
| Schedule semantics | `PASS` | One or multiple explicit intervals, split schedules, legal overnight intervals, and closed-all-day markers are supported; exception dates remain strict unconverted Manila `YYYY-MM-DD` values |
| Status/advisory boundary | `PASS` | The UI edits source rows only, contains no computed status selector/evaluator, and does not duplicate `/admin/facility-advisories` |
| Lifecycle/provenance | `PASS` | New rows remain draft/non-public/pending; Publish and Expire are explicit; effectivity, expiration, verification/data status, source type/ID/label, and last verification remain visible |
| Stale/delete/error safety | `PASS` | Original `updated_at` protects edits/lifecycle/deletes; stale forms remain open with explicit reload; delete is confirmed and guarded; overlap/closed-marker errors use normalized safe copy |
| Accessibility/responsive | `PASS_WITH_BROADER_DEVICE_ADVISORY` | Labeled interval/date/day controls, modal focus behavior, keyboard access, visible non-color states, table/cards, stacked mobile controls, and 1440/1366/1280/1024/820/768/430/390 widths passed headless Chrome fixture QA with zero console errors |
| Deterministic/regression evidence | `PASS_WITH_EXISTING_BUILD_ADVISORY` | Targeted suite, FS-3A/B/C, FS-1/FS-2 including FS-2C 81/81, the complete deterministic matrix, render, ESLint, typecheck, build, and diff check pass under Node 22; the existing approximately 880 kB lazy 3D warning remains unrelated |
| Data/database/dependency boundary | `PASS` | No official record, schema, migration, RLS, public projection, provider/service, remote database, dependency, public UI, media, Dashboard/Realtime, spatial/navigation, or FS-4 change exists |
| Live evidence | `NOT_CLAIMED` | Browser QA used a development-only fully intercepted network fixture; no request reached Supabase and no real account or remote row was used |
| Current boundary | `IN_PROGRESS` | All currently defined FS-3 implementation capability is implemented and verified; overall FS-3 acceptance requires separate final reconciliation |

### Phase 4-FS-3C Service aliases and facility-service mappings Admin workflow — 4 October 2026

**Classification:** `IMPLEMENTED_VERIFIED`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Routes and authorization | `PASS` | `/admin/service-aliases` and `/admin/facility-service-mappings` are lazy routes wrapped by `ProtectedRoute` with `SUPER_ADMIN`; the Admin links are hidden from other roles and PostgreSQL RLS remains authoritative |
| Alias workflow | `PASS` | List/search/create/edit/publish/expire/delete uses the accepted service methods; service selection is required on create and immutable on edit; alias text is trimmed, required, and limited to 160 characters |
| Mapping workflow | `PASS` | List/search/create/edit/publish/expire/delete uses the accepted service methods; only canonical facilities with operational profiles can be selected; facility/service identities are immutable and rank/notes constraints are represented |
| References and recommendation boundary | `PASS` | Existing service/profile/canonical-facility references supply labels and choices; configured rank remains stored Admin data with no ranking algorithm, public search, or recommendation consumer |
| Lifecycle, provenance, stale, and delete | `PASS` | Create remains draft/non-public/pending, Save does not publish, original `updated_at` protects all mutations, stale forms are retained with explicit reload, provenance/demo state is visible, and delete is confirmed and service-guarded |
| Errors, security, and audit | `PASS` | Duplicate alias/mapping plus stale/permission/session/network failures render normalized safe copy; UI contains no direct Supabase or audit mutation, and existing RLS/trusted triggers remain authoritative |
| Accessibility and responsive structure | `PASS_WITH_LIVE_QA_PENDING` | Reused labeled controls, semantic dialogs, modal focus/Escape/return behavior, visible status text, desktop table, and cards below `xl` are structurally covered; live authenticated cross-browser/device QA remains pending |
| Deterministic and regression evidence | `PASS_WITH_EXISTING_BUILD_ADVISORY` | FS-3C, reconciled FS-3A/FS-3B, the complete deterministic matrix including all 81 FS-2C scenarios, render, ESLint, typecheck, build, and diff check pass under Node 22; the existing approximately 880 kB lazy 3D warning remains unrelated |
| Data and scope boundary | `PASS` | No official alias/mapping fixture, schema/migration/RLS/provider/public UI/spatial/status/dependency/remote database change or FS-4 work exists |
| Single Admin navigation shell (owner decision) | `VERIFIED` (automated, headless Chromium) | For a signed-in administrator inside `/admin/*` there is one left navigation panel: the Admin sidebar from 1024px (at the viewport's left edge, with no global sidebar, rail, or gutter beside it) or one Admin menu drawer below that. "Back to CampusNav", theme, notifications, and account/Sign Out are provided once in it. Public pages keep the global navigation and the remembered sidebar choice. Work-area width: 876 → 1112px at 1440, 802 → 1038px at 1366, 719 → 955px at 1280, 475 → 711px at 1024, and 516 → 780px at 820. Admin QA 3351/3351 |
| Admin defects fixed in the cleanup | `FIXED` (each reproduced first) | Double current section on prefix-sharing routes; empty group headings for department administrators; sideways-scrolling section strip with the current section off screen; editor error out of view; save error left on the list after Cancel; identical action names for mappings on one facility; second `main` landmark on access-denied and session-check screens; open drawer locking the page after the window grows past its breakpoint; stale "authentication pending" label on QR Checkpoints |
| Regression after the cleanup | `PASS` | npm matrix 25/25 steps pass (22 deterministic suites including all 81 FS-2C scenarios, ESLint, typecheck, production build); public responsive matrix 448/448; interactions 144/144; map QA 59/59; layering 4/4 |
| Live/official evidence | `NOT_CLAIMED` | No live authenticated browser mutation, official institutional alias/mapping, remote database change, or production deployment is claimed. The owner's live authenticated `SUPER_ADMIN` reviews predate the single Admin navigation shell and have not been repeated on it |
| Current boundary | `IN_PROGRESS` | FS-3C is implemented and verified at its local boundary; full FS-3 is not accepted |

### Phase 4-FS-3B Facility profile and service catalog Admin workflow — 3 October 2026

**Classification:** `IMPLEMENTED_VERIFIED`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Routes and authorization | `PASS` | `/admin/facilities` and `/admin/services` are lazy routes wrapped by `ProtectedRoute` with `SUPER_ADMIN`; other authenticated roles remain denied and RLS remains authoritative |
| Canonical facility workflow | `PASS` | All canonical local facilities are listed with optional overlay state; profile creation/editing never exposes editable canonical identity, name, floor, geometry, graph, QR, routing, or emergency fields |
| Service workflow | `PASS` | Catalog list/create/edit/publish/expire/delete uses the existing service; lowercase kebab code is required at creation and omitted from updates |
| Lifecycle and provenance | `PASS` | Create defaults are draft/non-public/pending; save is separate from publish; content, publication, and verification/provenance groups are distinct; demo/test states are visibly non-official |
| Concurrency, delete, and errors | `PASS` | Original `updated_at` protects every mutation; stale forms are preserved until explicit reload; hard delete is confirmed and service-guarded; only normalized safe errors render |
| Security and audit | `PASS` | UI contains no direct Supabase or audit mutation; existing trusted triggers record successful changes; no privileged key, schema, migration, RLS, or policy change exists |
| Accessibility and responsive structure | `PASS_WITH_MANUAL_QA_PENDING` | Semantic labels/fieldsets, dialog/alertdialog roles, focus entry/restoration, Escape handling, visible text statuses, desktop table, and tablet/mobile cards are implemented; browser/device and keyboard-only QA is prepared but not executed |
| Deterministic and regression evidence | `PASS_WITH_EXISTING_BUILD_ADVISORY` | FS-3B, updated FS-3A, all required FS-1/FS-2/Auth/Admin checks, render, ESLint, typecheck, and build pass under Node 22; the existing lazy 3D chunk warning remains unrelated |
| Live/official evidence | `NOT_CLAIMED` | No live authenticated browser mutation, official institutional profile/service, remote database change, or manual QA completion is claimed |
| Next boundary | `NOT_STARTED` | FS-3C aliases/mappings UI requires separate authorization; full FS-3 is not accepted |

### Phase 4-FS-3A Admin mutation service/API foundation — 3 October 2026

**Classification:** `IMPLEMENTED_VERIFIED`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Dedicated service | `PASS` | `facilityAdminService.js` owns all FS-3A base-table reads/mutations and is composed into the existing Admin service; React components contain no new Supabase mutations |
| Resource scope | `PASS` | Profiles, services, aliases, mappings, weekly hours, and dated exceptions are supported; advisories reuse existing CRUD; public views remain read-only |
| Identity and spatial boundary | `PASS` | Canonical local facility IDs are validated; facility/service/mapping identities are immutable after creation; spatial, routing, QR, emergency, actor, and audit fields are rejected |
| Validation and provenance | `PASS` | Lifecycle/publication, effectivity, verification/data status, source metadata, strict Manila dates, weekday/interval shapes, overnight intervals, aliases, codes, and ranks are deterministically validated |
| Concurrency and deletion | `PASS` | Updates/deletes require matching original `updated_at`; hard deletion is limited to draft/demo/test records and checks profile/service dependencies before deletion |
| Error and security boundary | `PASS` | Stable user-safe conflict, stale, permission, session, network, and backend codes are emitted without enumerable raw causes; no RPC, privileged key, audit mutation, or RLS change exists |
| Deterministic FS-3A suite | `PASS` | Pure validators plus mocked Supabase mutation behavior cover the authorized FS-3A contract without real database mutation |
| Regressions and quality | `PASS_WITH_EXISTING_BUILD_ADVISORY` | Required FS-1/FS-2, Auth, Admin CMS, academic Admin, FS-3A, and route-render checks plus ESLint, typecheck, and production build pass under Node 22; the existing approximately 878 kB lazy 3D warning remains unrelated |
| Live/official evidence | `NOT_CLAIMED` | No authenticated live Data API write, remote database mutation, official institutional record, schema change, or UI workflow acceptance is claimed |
| Next boundary | `NOT_STARTED` | FS-3B profile/service Admin routes and editors require separate authorization; full FS-3 is not accepted |

### Phase 4-FS-2A final acceptance reconciliation — 1 October 2026

**Classification:** `ACCEPTED`

This section supersedes the earlier `IMPLEMENTED_UNVERIFIED` acceptance boundary without rewriting its historical implementation evidence.

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Actual linked target | `PASS` | Repository link is `yiuwvyznteizxxmjqcfn`, matching the actual CampusNav project |
| Migration history | `PASS` | Local and remote history match through `20260928144215`; no corrective migration was needed or applied |
| Corrected canonical pgTAP | `89/89 PASS` | Initial execution was 88/89 with only assertion 29 failing; that assertion was proven to use the wrong table-level privilege inquiry, corrected to the intentional column-scoped contract, and the owner-supplied rerun reached `ok 89` with no reported negative TAP diagnostic or SQL runtime error |
| Remote relations and projections | `PASS` | `facility_hours`, `facility_hour_exceptions`, and all three public views exist; both tables have RLS and every view has `security_invoker=true` plus `security_barrier=true` |
| Policies and grants | `PASS` | All ten expected policies exist; authenticated INSERT/UPDATE remains column-scoped, table-wide INSERT remains absent, DELETE and identity-sequence privileges are present, and SUPER_ADMIN policy predicates remain authoritative |
| Actor/system protection | `PASS` | Authenticated clients have no direct SELECT/INSERT/UPDATE privilege over the tested actor and system-maintained columns |
| Trusted audit/update path | `PASS` | Four expected triggers are enabled and call the private audit/update functions; both functions use an empty search path where configured and neither `anon` nor `authenticated` can execute them directly |
| Fixture cleanup | `PASS` | Exact linked counts are zero for FS-2A hours, exceptions, operational profile, advisories, Auth users, public profiles, role assignments, and audit rows |
| Deterministic/regression evidence | `PASS_WITH_EXISTING_BUILD_ADVISORY` | Deterministic FS-2A and the full requested regression set pass; the pre-existing lazy 3D bundle warning remains unrelated |
| Data and scope boundary | `PASS` | No official hours or persistent fixture was added; no provider read, status engine, Admin/public UI, Dashboard/Realtime, spatial/navigation, routing, QR, Emergency, dependency, or later-slice work is claimed |
| Acceptance decision | `ACCEPTED` | FS-2A is complete at its schema, RLS, provenance, and audit-foundation boundary; FS-2 remains in progress and FS-2B requires separate authorization |

### Phase 4-FS-2B1 provider-neutral facility-hours aggregate read — 1 October 2026

**Classification:** `IMPLEMENTED_VERIFIED`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Public service contract | `PASS` | `getFacilityHours(facilityId, dateRange?)` uses the existing normalized result envelope and returns canonical facility identity plus weekly hours, exceptions, and closure-source advisories without computing status |
| Date-range contract | `PASS` | Only `null`/omitted or exact strict inclusive `{ startDate, endDate }` campus dates are accepted; malformed Gregorian dates, reversed/one-sided/renamed/extra-key ranges, timestamps, and `Date` objects short-circuit before provider access with `FACILITY_INVALID_DATE_RANGE` |
| Provider compatibility | `PASS` | Local/null and Supabase providers expose the same async aggregate surface; local mode returns empty collections and invents no hours, exception, advisory, or provenance data |
| Supabase read boundary | `PASS` | Browser reads use only the three accepted FS-2A public security-invoker views with exact facility filtering and inclusive exception-date filters; no base table, write, RPC, privileged key, or Realtime path exists |
| Normalization and ordering | `PASS` | Explicit whitelists preserve multiple/closed/overnight intervals, dated exceptions, temporary closures, deterministic ordering, and independent provenance while omitting internal, actor, spatial, navigation, QR, emergency, and content fields |
| Manila boundary | `PASS` | Strict date validation is local-timezone independent and advisory overlap uses half-open `Asia/Manila` day bounds; weekly occurrence expansion, overnight carry, exception replacement, closure precedence, and current-status computation remain absent |
| Result/error behavior | `PASS` | Any valid source row is `CONFIGURED` without implying verified; all-empty is `UNAVAILABLE`; invalid facility/range short-circuit; malformed provider data and dependency failures produce the existing sanitized retryable provider-unavailable result |
| Deterministic FS-2B1 suite | `PASS` | Both providers, all three views, date boundaries, interval preservation, closure exclusion/overlap, ordering, provenance, field whitelisting, sanitized failures, security source scans, and all 95 canonical IDs pass under Node 22.22.0 |
| Full regressions | `PASS_WITH_EXISTING_BUILD_ADVISORY` | Data/navigation/multi-floor/QR/Emergency/3D/Dashboard/Phase 8/FS-1A/FS-1B/FS-2A/FS-2B1/render checks, ESLint, typecheck, and build pass; the approximately 878 kB lazy 3D warning is unchanged |
| Scope/data impact | `NONE` | No schema, migration, pgTAP, database row, fixture, official hours, UI, Admin, Dashboard/Realtime, spatial/navigation/routing/QR/Emergency behavior, dependency, remote database, commit, push, deployment, or FS-2C work changed |
| Slice decision | `IMPLEMENTED_VERIFIED` | FS-2B1 is complete at its local deterministic implementation boundary; final FS-2B acceptance/reconciliation and FS-2C require separate authorization |

### Phase 4-FS-2B final reconciliation and acceptance — 1 October 2026

**Classification:** `ACCEPTED_WITH_ADVISORY`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Final public surface | `PASS` | One provider-neutral asynchronous `getFacilityHours(facilityId, dateRange?)` surface returns weekly hours, exceptions, and temporary-closure source advisories; `getFacilityStatus` and status computation remain absent |
| Provider and security boundary | `PASS` | Local/null and Supabase providers are compatible; browser reads use only the three accepted public security-invoker views with no base-table read, write, RPC, privileged key, or Realtime path |
| Canonical identity and normalization | `PASS` | Facility identity resolves locally before provider access; provider rows cannot redefine spatial/navigation truth; weekly, overnight, exception, closure, ordering, and field-whitelist behavior pass while all 95 canonical facilities, nodes, and edges remain unchanged |
| Date/time boundary | `PASS` | Strict exact date ranges, inclusive exception dates, and half-open `Asia/Manila` advisory overlap pass; recurrence expansion, overnight carry evaluation, replacement/closure precedence, current-time status, and the 30-minute threshold remain FS-2C work |
| Provenance and result model | `PASS` | Row provenance remains independent; pending/demo states remain explicit; `CONFIGURED` does not mean verified; the existing `{ ok, availability, data, error }` envelope and sanitized error behavior are reused |
| Deterministic FS-2B suite | `PASS` | Provider, view, range, normalization, ordering, security, error, and canonical-data assertions pass under Node 22.22.0 |
| Full regressions | `PASS_WITH_EXISTING_BUILD_ADVISORY` | The complete requested data/navigation/QR/Emergency/3D/Dashboard/Phase 8/FS-1A/FS-1B/FS-2A/FS-2B/render matrix, ESLint, typecheck, and build pass; the approximately 878 kB lazy 3D warning is unchanged |
| Live Data API boundary | `ACCEPTED_WITH_ADVISORY` | This reconciliation supplies deterministic provider/read-path evidence only and makes no live FS-2B Data API read claim; accepted FS-2A linked database/RLS evidence remains intact |
| Acceptance decision | `ACCEPTED_WITH_ADVISORY` | No FS-2B blocker was found. FS-2B is accepted at its source-read boundary; FS-2C readiness may begin only after separate authorization |

### Phase 4-FS-2C1 pure Manila-time status evaluator — 3 October 2026

**Classification:** `IMPLEMENTED_VERIFIED`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Pure evaluator | `PASS` | `evaluateFacilityStatus({ evaluatedAt, weeklyHours, exceptions, statusAdvisories })` has no Supabase, fetch, provider, global-clock, locale-default, UI, or side-effect dependency |
| Timestamp and timezone | `PASS` | Strict absolute RFC3339 strings with `Z` or numeric offsets normalize to UTC ISO; invalid/date-only/offsetless/object inputs are rejected; all schedule boundaries use explicit `Asia/Manila` / `+08:00` semantics |
| Schedule semantics | `PASS` | Half-open normal/split/closed/absent/overnight schedules, previous-date tails, replacement exceptions, expired fallback, overlap/touch unioning, the exact 30-minute threshold, and next transitions pass |
| Closure and verification | `PASS` | Facility-wide temporary closures outrank hours; service interruption is excluded; trusted, pending, and demo records follow the canonical provenance combinations without synthesizing facility-wide verification |
| Output safety | `PASS` | Results use only the seven canonical statuses and preserve independently provenanced safe controlling records without database IDs, actor IDs, private metadata, or mutation of source records |
| Deterministic suite | `46/46 PASS` | Fixed timestamps cover every required FS-2C1 scenario plus overnight-tail/current-exception ownership, demo-closure labeling, and the pure/provider-neutral import boundary under Node 22.22.0 |
| Full regressions | `PASS_WITH_EXISTING_BUILD_ADVISORY` | All required data/navigation/QR/Emergency/3D/Dashboard/Phase 8/FS-1/FS-2/render suites, ESLint, typecheck, and build pass; the existing approximately 878 kB lazy 3D chunk warning is unchanged |
| Scope/data impact | `NONE` | No schema, migration, RLS, provider query, public FacilityService method, database row, fixture, official hours, UI, spatial/navigation/routing/QR/Emergency behavior, dependency, remote database, commit, push, or deployment changed |
| Slice decision | `IMPLEMENTED_VERIFIED` | FS-2C1 is complete at the pure evaluator boundary; FS-2C2 integration and full FS-2C acceptance require separate authorization |

### Phase 4-FS-2C2 FacilityService status integration — 3 October 2026

**Classification:** `IMPLEMENTED_VERIFIED`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Public contract | `PASS` | Async `getFacilityStatus(facilityId, dateTime?)` is exported through the existing provider-neutral FacilityService and preserves the established result envelope |
| Validation and clock | `PASS` | Canonical facility validation occurs first; omitted/undefined time uses an injected clock; explicit values require strict absolute RFC3339 and normalize to UTC; invalid values return non-retryable `FACILITY_INVALID_DATE_TIME` before provider access |
| FS-2B orchestration | `PASS` | Status reads reuse only `getFacilityHours` with the previous/current Manila date window; no new provider method, direct status query, RPC, write, or future-date request exists |
| Evaluator boundary | `PASS` | FacilityService contains no operational-status literals or duplicated schedule rules; normalized FS-2B records are passed once to the FS-2C1 evaluator, which is not called after provider failure |
| Availability/errors | `PASS` | Empty sources are `UNAVAILABLE` plus `UNKNOWN`; configured non-applicable sources are `CONFIGURED` plus `UNKNOWN`; provider failure remains sanitized retryable `PROVIDER_UNAVAILABLE` |
| Result/provenance | `PASS` | Data contains canonical facility identity, status, evaluated time, timezone, next transition, safe independent controlling records, and demo state without internal/provider/actor fields |
| Deterministic integration | `34/34 PASS` | All required FS-2C2 public method, clock, validation, query-window, error, status, availability, provenance, provider, routing, FS-2C1, and FS-2B cases pass within the 79-scenario combined suite under Node 22.22.0 |
| Full regressions | `PASS_WITH_EXISTING_BUILD_ADVISORY` | All required data/navigation/QR/Emergency/3D/Dashboard/Phase 8/FS-1/FS-2/render suites, ESLint, typecheck, and build pass; the existing approximately 878 kB lazy 3D chunk warning is unchanged |
| Scope/data impact | `NONE` | No schema, migration, RLS, provider query, database row, fixture, official hours, UI, spatial/navigation/routing/QR/Emergency behavior, dependency, remote database, commit, push, or deployment changed |
| Slice decision | `IMPLEMENTED_VERIFIED` | FS-2C2 is complete at the service-integration boundary; full FS-2C acceptance requires separately authorized final reconciliation |

### Phase 4-FS-2C final reconciliation and acceptance — 3 October 2026

**Classification:** `ACCEPTED_WITH_ADVISORY`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Public/evaluator contract | `PASS` | One async provider-neutral `getFacilityStatus(facilityId, dateTime?)` surface validates canonical identity and strict time input, reuses `getFacilityHours`, and delegates all seven-status computation to the pure evaluator |
| Time and schedule semantics | `PASS` | Deterministic Manila time, half-open boundaries, weekly/split/closed schedules, overnight ownership, replacement exceptions, closure precedence, closing-soon boundaries, and next transitions reconcile with the canonical contracts |
| Acceptance defect correction | `PASS` | Mixed pending/trusted exception sets now conservatively return `PENDING_VERIFICATION`; pending current-date exceptions cannot cancel a trusted previous-date overnight tail |
| Result, provenance, and safety | `PASS` | Availability remains separate from status; safe independent provenance/demo state is preserved; no private/provider fields, synthetic verification, routing mutation, or emergency mutation exists |
| Deterministic FS-2C suite | `81/81 PASS` | FS-2C1 and FS-2C2 coverage plus two acceptance-defect regressions pass under Node 22.22.0 |
| Full regressions | `PASS_WITH_EXISTING_BUILD_ADVISORY` | The full requested matrix, route rendering, ESLint, typecheck, production build, and diff check pass; the approximately 878 kB lazy 3D warning is unchanged |
| Provider/database boundary | `PASS` | No provider status method, direct status query, table/view, migration, RLS, RPC, Realtime, write, or remote database change was introduced |
| Live/official-data evidence | `ADVISORY` | No fresh FS-2B live Data API read or official institutional operating-hours/status evidence is claimed; empty production data legitimately yields unknown/unavailable |
| Acceptance decision | `ACCEPTED_WITH_ADVISORY` | No FS-2C blocker remains; full FS-2 final reconciliation/readiness requires separate authorization and FS-3 remains unstarted |

### Phase 4-FS-2 final reconciliation and acceptance — 3 October 2026

**Classification:** `COMPLETE — ACCEPTED_WITH_ADVISORY`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| FS-2A foundation | `ACCEPTED` | Linked schema, RLS, explicit grants, `SUPER_ADMIN` writes, public projections, lifecycle/provenance, trusted audit, corrected 89/89 pgTAP, and zero retained fixtures remain accepted |
| FS-2B source reads | `ACCEPTED_WITH_ADVISORY` | Provider-neutral `getFacilityHours` validates canonical identity and returns normalized weekly hours, exceptions, and temporary closures exclusively through accepted public projections |
| FS-2C status engine | `ACCEPTED_WITH_ADVISORY` | Provider-neutral `getFacilityStatus` applies strict time input, injected clock, deterministic Manila evaluation, canonical statuses, safe provenance, and accepted error/availability semantics |
| Security and privacy | `PASS` | Public reads remain view/RLS controlled; initial writes remain `SUPER_ADMIN` only; no privileged browser secret, actor/private audit field, raw provider data, write, RPC, or Realtime status path exists |
| Spatial and safety boundary | `PASS` | Hours/status remain operational overlays and do not mutate canonical facility identity, nodes, edges, A*, route restrictions, QR positioning, or emergency routes |
| Deterministic FS-2 suites | `PASS` | FS-2A and FS-2B pass; FS-2C passes 81/81 scenarios under Node 22.22.0 |
| Full regressions | `PASS_WITH_EXISTING_BUILD_ADVISORY` | Complete requested matrix, route rendering, ESLint, typecheck, build, and diff check pass; the approximately 878 kB lazy 3D warning is unchanged |
| Institutional/live-data boundary | `ADVISORY` | No official hours were seeded or guessed and no fresh FS-2B live Data API read is claimed; empty production data may legitimately return unknown/unavailable |
| Final decision | `COMPLETE — ACCEPTED_WITH_ADVISORY` | No FS-2 blocker remains; Phase 4-FS-3 readiness may begin only with separate authorization and FS-3 remains `NOT_STARTED` |

### Phase 4-FS-2A implementation — 28 September 2026

**Classification:** `IMPLEMENTED_UNVERIFIED`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Forward migration | `STATIC PASS` | One CLI-generated migration adds only `facility_hours` and `facility_hour_exceptions`; no seed, temporary-closure duplicate, destructive cleanup, spatial/navigation, routing, QR, Emergency, Realtime, provider, UI, or dependency change |
| Canonical identity/time types | `PASS` | Both tables reference `facility_operational_profiles(facility_id)`; all 95 local facility IDs remain compatible; weekday clocks use `time without time zone`, exception days use `date`, and instants use `timestamptz` |
| Schedule constraints | `STATIC PASS` | Weekday range, closed/open row shape, effectivity, publication, provenance, freshness, and concurrent database exclusion constraints cover active duplicate/overlap/closed-marker conflicts while allowing non-overlapping and overnight intervals |
| Public projections | `STATIC PASS` | Three security-invoker/security-barrier views omit actor/private fields; the advisory projection reuses `facility_advisories`, exposes only `TEMPORARY_CLOSURE`, and excludes `SERVICE_INTERRUPTION` plus advisory content/internal metadata |
| RLS/grants | `STATIC PASS` | Both new tables enable RLS, use explicit column/table/sequence grants, published/effective reads, `SUPER_ADMIN` read/write policies, and update `USING` plus `WITH CHECK`; anon and ordinary-authenticated writes are denied by the defined boundary |
| Provenance/audit | `STATIC PASS` | Per-record lifecycle/provenance fields match FS-1; safe audit metadata adds facility/weekday/date/transitions/status/source identifiers without interval payloads or credentials; trusted function remains private with empty search path |
| Deterministic FS-2A suite | `PASS` | Schema, types, constraints, indexes, views, RLS/policies/grants, audit, no-seed/no-status/no-spatial scope, pgTAP plan consistency, and 95 canonical facility IDs pass under Node 22.22.0 |
| Transactional pgTAP | `NOT_EXECUTED` | The 89-assertion rollback-only suite is present, but Docker/PostgreSQL is unavailable; no database execution or remote migration application is claimed |
| Required regressions | `PASS_WITH_EXISTING_BUILD_ADVISORY` | Data, navigation, multi-floor, QR, Emergency, 3D, Dashboard, Phase 8A/8B/8C/8C.2, FS-1A/FS-1B/FS-2A, route rendering, ESLint, typecheck, and build pass; the approximately 878 kB lazy 3D chunk warning is unchanged |
| Data/fixture impact | `NONE` | No official hours or persistent fixture was added; the pgTAP fixtures are visibly labeled development/demo records and are transaction-local with rollback |
| Acceptance decision | `IMPLEMENTED_UNVERIFIED` | Database constraints, RLS, grants, public reads, role writes, audit attribution, forgery rejection, and cleanup still require execution against the migrated PostgreSQL target before FS-2A acceptance |

### Phase 4-FS-1B final reconciliation and acceptance — 28 September 2026

**Classification:** `ACCEPTED_WITH_ADVISORY`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Final public surface | `PASS` | One normalized provider-neutral service exposes the six FS-1B async reads; `searchFacilities` remains outside FS-1B and was not misleadingly added |
| Provider compatibility | `PASS` | Local/null and Supabase providers expose compatible async surfaces; local mode invents no overlay, and dependency failures are sanitized and retryable |
| Browser security | `PASS` | The browser provider uses the existing safe public client and reads only the four accepted public security-invoker views; no base-table read, write, RPC, service-role, or secret-key path exists |
| Canonical identity and spatial truth | `PASS` | Invalid facility IDs short-circuit before provider access; reverse results are rebuilt from the 95-facility local registry; provider spatial/navigation/QR/emergency fields cannot become truth |
| Service identity and mappings | `PASS` | Stable service code is identity; aliases remain metadata; noncanonical facility IDs are omitted; configured rank is ordering metadata only, with stable service-code/facility-ID ties |
| Provenance | `PASS` | Profile, service, alias, and mapping provenance remain independent; `CONFIGURED` does not imply verified; demo derives only from `DEMO` or `DEMO_ONLY` |
| Error/result model | `PASS` | Every method uses the same `{ ok, availability, data, error }` envelope and the established availability/error codes; malformed identifiers use safe domain-specific not-found results, so no second FS-1B model is introduced |
| Deterministic FS-1B test | `PASS` | FS-1B1/FS-1B2/FS-1B3 contract, provider, normalization, security, ordering, provenance, error, and canonical-data assertions pass under Node 22 |
| Full regressions | `PASS_WITH_EXISTING_BUILD_ADVISORY` | All required data/navigation/multi-floor/QR/Emergency/3D/Dashboard/Phase 8/FS-1A/FS-1B/render checks, ESLint, typecheck, and build pass; the approximately 878 kB lazy 3D warning is pre-existing and unrelated |
| Live Data API boundary | `ACCEPTED_WITH_ADVISORY` | No frontend environment was present, so this reconciliation supplies deterministic provider/read-path evidence only and makes no live FS-1B Data API claim; accepted FS-1A linked evidence is not reopened |
| Acceptance decision | `ACCEPTED_WITH_ADVISORY` | No FS-1B blocker was found. The named advisory is the absence of a fresh live FS-1B Data API read; FS-1A plus FS-1B completes FS-1 at the same classification |

### Phase 4-FS-1B1 provider-neutral facility-profile read path — 20 September 2026

**Classification:** `IMPLEMENTED_VERIFIED`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Canonical identity first | `PASS` | `getFacilityById` validates against the existing 95-facility local dataset before any provider call; unknown IDs return safe non-retryable `FACILITY_NOT_FOUND` |
| Provider neutrality | `PASS` | Local/null and Supabase providers expose the same async operational-profile method; missing configuration selects the non-inventing local path |
| Browser-safe Supabase read | `PASS` | The Supabase provider uses the existing public client boundary and reads only `public_facility_operational_profiles`; it has no base-table, RPC, write, or privileged-key path |
| Overlay and provenance | `PASS` | Allowed operational fields and independent provenance are mapped explicitly; `demo` is derived only from `DEMO` or `DEMO_ONLY` |
| Spatial/navigation protection | `PASS` | Unexpected floor, coordinate, map, node, edge, route, QR, and emergency properties cannot replace canonical local truth; source datasets remain unchanged |
| Failure behavior | `PASS` | Missing overlays are `UNAVAILABLE` without error; provider failures retain safe local identity and return sanitized retryable `FACILITY_PROVIDER_UNAVAILABLE` |
| Deterministic FS-1B1 test | `PASS` | Contract, provider, malicious-overlay, sanitization, public-view, immutability, and all-canonical-ID assertions pass under Node 22 |
| Full regressions | `PASS_WITH_EXISTING_BUILD_ADVISORY` | All requested data/navigation/multi-floor/QR/Emergency/3D/Dashboard/Phase 8/FS-1A/FS-1B1/render checks, ESLint, typecheck, and build pass; the existing approximately 878 kB lazy 3D chunk warning remains unrelated |
| Data and product scope | `UNCHANGED` | No schema, database row, fixture, official record, UI, navigation logic, dependency, service catalog, alias, mapping, hours/status, media, Dashboard, or Realtime implementation changed |
| Slice decision | `IMPLEMENTED_VERIFIED` | FS-1B1 is complete at its defined read-path boundary; full FS-1B remains in progress and its next slice requires separate authorization |

### Phase 4-FS-1B2 service catalog, service-code, and alias read contracts — 20 September 2026

**Classification:** `IMPLEMENTED_VERIFIED`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Provider contract | `PASS` | Local/null and Supabase providers expose asynchronous `getServices`, `getServiceByCode`, and `getServiceAliases` methods alongside the unchanged FS-1B1 surface |
| Stable identity and validation | `PASS` | Service code is the only application service identity; invalid codes short-circuit without provider access and numeric database IDs are not selected or returned |
| Catalog reads | `PASS` | `getServices` supports only deterministic exact-code filtering and code ordering; no category/type filter is invented because FS-1A defines neither public field |
| Code and alias reads | `PASS` | Exact service lookup uses `public_services`; aliases use `public_service_aliases`, are filtered by stable service code, ordered by alias, and may validly be empty for an existing service |
| Normalization/provenance | `PASS` | Explicit mapping preserves public name, description, department association, lifecycle, effective/expiry state, verification/data status, source metadata, freshness, and independently derived demo state |
| Missing/error behavior | `PASS` | Local mode is safely unavailable, unknown service codes are non-retryable not-found results, and provider failures use the existing sanitized retryable dependency error without raw details |
| Security and scope | `PASS` | Browser reads use only the two public security-invoker views; no base-table access, actor/private field, write, RPC, privileged credential, search/ranking, recommendation, mapping, UI, or Realtime path was added |
| Deterministic FS-1B test | `PASS` | FS-1B1 and FS-1B2 provider, contract, normalization, provenance, sanitization, boundary, and canonical-data immutability assertions pass under Node 22 |
| Full regressions | `PASS_WITH_EXISTING_BUILD_ADVISORY` | All requested data/navigation/multi-floor/QR/Emergency/3D/Dashboard/Phase 8/FS-1A/FS-1B/render checks, ESLint, typecheck, and build pass; the existing approximately 878 kB lazy 3D chunk warning remains unrelated |
| Slice decision | `IMPLEMENTED_VERIFIED` | FS-1B2 is complete at its catalog/code/alias boundary; FS-1B remains in progress and FS-1B3 requires separate authorization |

### Phase 4-FS-1B3 facility-service mapping and reverse lookup reads — 28 September 2026

**Classification:** `IMPLEMENTED_VERIFIED`

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Provider contract | `PASS` | Local/null and Supabase providers expose asynchronous `getServicesForFacility` and `getFacilitiesByService` methods alongside the unchanged FS-1B1/FS-1B2 surface |
| Public mapping read | `PASS` | Supabase reads only `public_facility_service_mappings` with exact `facility_id` or `service_code` filters; reverse lookup uses the accepted public service-code read only to confirm service existence |
| Canonical facility protection | `PASS` | Input facility IDs validate locally before provider access; every reverse result resolves from the 95-facility canonical registry, and noncanonical provider IDs are omitted |
| Configured ordering | `PASS` | Results order by administrator-configured `recommendation_rank` followed by stable service-code or facility-ID ties; no heuristic, fuzzy search, or recommendation algorithm exists |
| Mapping normalization/provenance | `PASS` | Explicit mapping preserves rank, public notes, lifecycle, effective/expiry state, verification/data status, source metadata, freshness, and independent demo state without exposing numeric/actor/private fields |
| Spatial/navigation isolation | `PASS` | Provider floor, coordinate, map, node, edge, route, QR, and emergency fields are not selected or normalized and cannot replace canonical local truth |
| Missing/error behavior | `PASS` | Invalid facility/code inputs short-circuit safely, unknown services remain not found, empty mappings remain unavailable without invention, and provider failures use the existing sanitized retryable error |
| Deterministic FS-1B test | `PASS` | FS-1B1/FS-1B2/FS-1B3 provider, contract, normalization, ordering, provenance, sanitization, security, and canonical-data immutability assertions pass under Node 22 |
| Full regressions | `PASS_WITH_EXISTING_BUILD_ADVISORY` | All requested data/navigation/multi-floor/QR/Emergency/3D/Dashboard/Phase 8/FS-1A/FS-1B/render checks, ESLint, typecheck, and build pass; the existing approximately 878 kB lazy 3D chunk warning remains unrelated |
| Slice decision | `IMPLEMENTED_VERIFIED` | FS-1B3 is complete at its mapping-read boundary; FS-1B remains in progress and final reconciliation requires separate authorization |

### Phase 4-FS-1A implementation snapshot — 20 September 2026

**Classification:** `IMPLEMENTED_UNVERIFIED`

Evidence added:
- one forward migration for `facility_operational_profiles`, `services`, `service_aliases`, and `facility_service_mappings`
- stable local `facility_id` references with no spatial/floor/geometry/node/edge/QR/routing duplication
- lifecycle, public-visibility, effective-window, verification/data-status, source, and freshness constraints
- RLS-backed security-invoker public projections and `SUPER_ADMIN`-only writes
- trusted triggers that append safe metadata to the existing immutable `audit_logs` stream
- no official seed records, hours, status engine, Admin/public UI, media, Dashboard/Realtime, or unrelated domain expansion
- deterministic schema/scope/canonical-ID test passing for all 95 local facility IDs
- transactional pgTAP coverage for RLS, draft isolation, permitted/denied writes, provenance, audit, and cleanup

The pgTAP suite was not executed in this environment because Docker is unavailable and the pinned Supabase CLI download failed on local certificate verification. SQL/RLS behavior therefore remains unverified against a running database. Phase 4-FS-1 remains in progress because its provider-neutral `FacilityService` foundation and full database verification are not part of this first implementation slice.

### Phase 4-FS-1A acceptance attempt — 20 September 2026

**Classification:** `IMPLEMENTED_UNVERIFIED` retained

| Evidence area | Result | Boundary |
|---|---|---|
| Migration safety | `STATIC REVIEW PASS` | Forward-only FS-1A overlay creation; the existing audit entity-type check is replaced in the same migration; no table/schema/column drop, data mutation, official seed, spatial/navigation, QR, Emergency, schedule/personnel, hours, media, or Realtime change |
| CampusNav remote identity | `CONFIRMED` | The ignored frontend environment points to the CampusNav project; its public Data API is reachable and returns `PGRST205` for the undeployed FS-1A `public_services` view |
| SQL-capable target | `BLOCKED_SAFELY` | The available Supabase connector exposes an unrelated development project, so no CampusNav SQL or migration was executed there; Docker/local PostgreSQL and an authenticated CampusNav CLI link are unavailable |
| Migration / pgTAP | `NOT_EXECUTED` | No migration was remotely applied and none of the 58 transactional pgTAP assertions is promoted to PASS |
| Fixtures / production data | `UNCHANGED` | No FS-1A fixture was created, so cleanup is vacuously zero; no legitimate or production record was modified |
| Deterministic FS-1A test | `PASS` | Schema, RLS/policy/audit structure, scope exclusions, seed absence, and compatibility with all 95 canonical local facility IDs passed under Node 22 |
| Baseline regressions | `PASS` | Data, navigation, multi-floor, QR, Emergency, Dashboard, Phase 8A/8B/8C/8C.2, route rendering, ESLint, typecheck, and production build passed |
| Acceptance decision | `IMPLEMENTED_UNVERIFIED` | Required live migration, RLS, role, public-policy, audit, constraint, and cleanup evidence is still absent; FS-1B is not authorized |

### Phase 4-FS-1A linked acceptance — 20 September 2026

**Classification:** `ACCEPTED_WITH_ADVISORY`

This section supersedes the earlier `IMPLEMENTED_UNVERIFIED` acceptance attempt without rewriting its historical evidence boundary.

| Evidence area | Result | Evidence / boundary |
|---|---|---|
| Actual linked target | `PASS` | Pinned CLI link is `yiuwvyznteizxxmjqcfn`, matching the CampusNav frontend project ref |
| Migration history | `PASS` | Local and remote history match through `20260920122741` |
| Tables and views | `PASS` | Four FS-1A tables exist; four public views have `security_invoker=true` and `security_barrier=true` |
| RLS and policies | `PASS` | RLS is enabled on all four tables; 20 expected published-read, `SUPER_ADMIN` read, insert, update, and delete policies exist |
| Audit structure | `PASS` | Four audit and four updated-at triggers exist; private audit/touch functions use an empty search path; `anon` and `authenticated` cannot execute them directly |
| Transactional pgTAP | `PASS — 58/58` | Fresh linked rollback-only capture returned `ok 1` through `ok 58`; owner SQL Editor evidence independently reached `ok 58` without runtime error |
| Role/public/audit behavior | `PASS` | Anonymous and ordinary-authenticated insert rejection, `SUPER_ADMIN` create/publish/delete, published public reads, trusted audit creation, audit-forgery rejection, safe metadata, actor-column privacy, and provenance preservation passed |
| Supplemental role matrix | `PASS — 4/4` | Anonymous update/delete were rejected and ordinary-authenticated update/delete changed no row |
| Duplicate mapping | `PASS — 1/1` | A second mapping for the same facility/service pair raised the expected unique-constraint error inside a rollback-only transaction |
| Spatial/source boundary | `PASS` | Remote overlay scan found no floor, geometry, map-node, map-edge, QR, or route columns; deterministic test still matches all 95 canonical local facility IDs |
| Fixture cleanup | `PASS` | Zero FS-1A fixture rows across all four tables; zero associated test auth users, role assignments, and audit rows after rollback |
| Local quality gates | `PASS_WITH_EXISTING_BUILD_ADVISORY` | Node 22 FS-1A deterministic test, ESLint, typecheck, and production build pass; the existing approximately 878 kB lazy 3D chunk warning remains unrelated |
| Evidence advisory | `NONBLOCKING` | The owner screenshot directly showed only assertion 58; full 58/58 evidence was obtained independently with an equivalent transaction-local collector because standard CLI output returns only the final result set |
| Acceptance decision | `ACCEPTED_WITH_ADVISORY` | FS-1A is complete at its defined schema/RLS/provenance/audit boundary; FS-1B remains unstarted and requires its own authorization/readiness boundary |

## Owner-approved proposed final defense scope — 19 September 2026

**Decision classification:** `OWNER APPROVED / ADVISER CONFIRMATION REQUIRED`

`DEC-DEFENSE-001` classifies the accepted responsive web, shared GF–5F/A*/2D/3D/multi-floor navigation, QR/manual positioning, Facilities, Dashboard, Auth/RBAC, Admin CMS, academic/personnel engine, accepted Supabase foundation, and strict Emergency/safe-no-route behavior as the owner-proposed `CORE_FOR_DEFENSE`. This classification neither upgrades implementation evidence nor supplies institutional data or approval.

| Area | Defense-scope classification | Implementation/evidence boundary |
|---|---|---|
| Owner-proposed core | `CORE_FOR_DEFENSE` | Existing accepted evidence and advisories continue to control; no new implementation claim |
| Grounded CLARA/Groq | `CONDITIONAL / DEFERRED PENDING ADVISER DIRECTION` | Current conservative/local matcher remains `PARTIAL`; it is not grounded production AI, production-ready LLM integration, or a completed AI assistant |
| PWA/offline emergency cache | `CONDITIONAL / DEFERRED PENDING ADVISER DIRECTION` | Current status remains manifest-only/`MISSING` for actual offline caching |
| AR Guidance | `PROPOSED / OPTIONAL / DEFERRED / NOT_IMPLEMENTED / NOT_READY` | Planning-only; AR-0 through AR-7 remain unauthorized |
| Reports, advanced map editor/version rollback, expanded positioning/delivery/hardware/photorealism | `OPTIONAL / DEFERRED` | No implementation authorization; retain current registry statuses |
| Defense data | `OWNER APPROVED / ADVISER CONFIRMATION REQUIRED` | Verified claims require authority/provenance; demo/sample records require visible labels; unavailable/pending states remain valid; emergency and personnel truth cannot be fabricated |
| Title and research/evaluation | `ADVISER_APPROVAL_REQUIRED` | No adviser decision or academic methodology is supplied by the owner decision |

**Adviser package:** `PREPARED / AWAITING_ADVISER_CONFIRMATION` in `75-adviser-confirmation-package.md`. The form contains no preselected adviser decisions and supplies no approval evidence.

**External adviser action:** `HUMAN ACTION REQUIRED — OBTAIN ADVISER CONFIRMATION`.

**Readiness after preparation:** documentation/request-package preparation is complete. Final thesis/defense approval claims remain `NOT_READY` / `BLOCKED` pending completed adviser evidence. Under `DEC-ROADMAP-002`, that external wait does not block Phase 4's safe owner-controlled engineering sequence.

## Phase 3-MQA-7 final acceptance and evidence reconciliation — completed 19 September 2026

**Phase 3 classification:** `COMPLETE — ACCEPTED_WITH_ADVISORY`

The exact-revision production baseline and MQA-1 through MQA-6 are accepted at their recorded evidence levels. No supported unresolved Phase 3 release blocker remains. Earlier Phase 1/Phase 2 implementation matrices below remain historical evidence snapshots; this final reconciliation controls current Phase 3 status without rewriting those snapshots as if their earlier verification dates had changed.

| Remaining item class | Current classification | Boundary / disposition |
|---|---|---|
| Broader physical-device/browser evidence; installed QR-label placement | `NONBLOCKING_ADVISORY` | Payload/camera/manual behavior and representative WebGL/fallback behavior passed; broad certification and campus installation acceptance are not claimed |
| MQA-5 device/OS/browser metadata; MQA-6 device/OS/GPU/browser/native-probe metadata; exact fallback wording | `NONBLOCKING_ADVISORY` | Undocumented execution details remain undocumented and do not invalidate the observed behavioral subsets |
| 3D fallback copy mismatch; approximately 878 kB lazy 3D chunk | `NONBLOCKING_ADVISORY` | Safe fallback passed; exact-copy conformance and performance certification are not claimed |
| Department Admin and AccessDenied manual-browser coverage | `NONBLOCKING_ADVISORY` | Separate browser evidence is absent; deterministic authorization, linked RLS, and `SUPER_ADMIN` evidence are preserved without converting them into the missing manual passes |
| Institutional map/facility/hours/services/schedule/personnel completeness, public fields/check-in authority, emergency ownership/coverage/sign-off | `OWNER_OR_INSTITUTIONAL_DEPENDENCY` | Pending/unknown data remains unavailable and strict emergency behavior remains safe; these are final thesis/demo inputs, not Phase 3 release blockers |
| Thesis title and evaluation methodology | `ADVISER_OR_RESEARCH_DEPENDENCY` | Requires adviser/research approval and is separate from software acceptance |
| Grounded CLARA, PWA/offline cache, map editor/version rollback, reports/analytics, AR Guidance, GPS/BLE/UWB, and other expansion | `DEFERRED_OR_OUTSIDE_PHASE_3` | Not implemented or accepted by Phase 3; no implementation authorization is implied |

The final-system Definition of Done remains incomplete for its explicitly `UNSATISFIED` and `DEFERRED` items. Phase 3 closure is limited to accepted-baseline release and manual QA and is not a thesis-completion, institutional-data, WCAG, device/browser/GPU/performance, or optional-feature certification.

**Historical next workstream at Phase 3 closure:** Post-Phase-3 Thesis/Defense Scope, Institutional Data, and Evaluation Decision Gate. `DEC-ROADMAP-002` later supersedes this as active software sequencing while preserving the unresolved external decisions.

**Historical Definition of Ready at Phase 3 closure:** `READY` for decision coordination because the questions, evidence boundaries, and required authorities were identified. Downstream implementation was then `NOT_READY` / `BLOCKED`; `DEC-ROADMAP-002` later authorizes the bounded Phase 4 software sequence without supplying any missing external approval or official data.

## AR-Assisted Camera Navigation / AR Guidance Mode — canonical planning adoption 19 September 2026

**Classification:** `PROPOSED / DEFERRED / NOT_IMPLEMENTED / NOT_READY`

| Area | Classification | Evidence / boundary |
|---|---|---|
| Owner authorization | `PLANNING_ONLY` | `DEC-AR-001` authorizes canonical concept documentation, not implementation |
| Routing architecture | `REQUIRED_FUTURE_CONTRACT` | AR Guidance must consume the existing A* route sequence and canonical spatial data; no second routing engine or coordinate truth is permitted |
| Positioning | `REQUIRED_FUTURE_CONTRACT` | QR checkpoint is primary and manual confirmation is fallback; no continuous indoor tracking or autonomous camera localization claim |
| Camera/privacy | `REQUIRED_FUTURE_CONTRACT` | Explicit permission, local use, no recording/upload/persistence by default, and no facial/person recognition |
| Accessibility/fallback | `REQUIRED_FUTURE_CONTRACT` | 2D/3D/text alternatives and QR/manual verification remain available; unsupported camera behavior must fail safely |
| Emergency | `DEFERRED_CONDITIONAL` | AR may only present an already-approved emergency route after separate canonical and safety approval; no normal-route fallback |
| Implementation evidence | `NOT_IMPLEMENTED` | No AR source, route-step adapter, camera-guidance shell, overlay, schema, dependency, test, or deployment is claimed by this documentation task |
| Definition of Ready | `NOT_READY` | Route-step semantics, device matrix, camera/QR lifecycle, privacy/security verification, performance thresholds, accessibility plan, and emergency-stage authority remain unresolved |
| Active sequencing | `DEFERRED` | Phase 3 is `COMPLETE — ACCEPTED_WITH_ADVISORY`; `DEC-DEFENSE-001` excludes AR from the proposed defense core; `DEC-ROADMAP-002` selects Phase 4-FS-1 next; no AR implementation is authorized |

`74-ar-assisted-navigation-contract.md` is a future adoption contract, not implementation proof. Do not start AR-0 or any later AR stage until a future roadmap authorization exists and the Definition of Ready passes.

## Phase 3-MQA-4 screen-reader and authenticated Admin manual acceptance — historical attempt recovered 19 September 2026

**Subset classification:** `PARTIAL` / `BLOCKED_BY_TOOLING`

The original attempt date was not supplied. This section restores previous-laptop evidence whose documentation changes were not pushed; it does not describe a new execution attempt.

| Area | Classification | Historical evidence / boundary |
|---|---|---|
| Definition of Ready | `READY` | Goal, contracts, accessibility boundary, Auth/Admin security context, and required acceptance evidence were defined before execution |
| Execution | `BLOCKED_BY_TOOLING` | The browser failed before production launch with `failed to write kernel assets` (OS error 3) |
| Screen reader | `SCREEN_READER_QA_PENDING` | No successful screen-reader environment was launched; no screen-reader manual acceptance evidence exists |
| Authenticated Admin | `IMPLEMENTED_UNVERIFIED` | No authenticated browser Admin session was completed; requested graphical/manual Admin checks remain unverified |
| Role-specific Admin claims | `NOT_CLAIMED` | No `SUPER_ADMIN_MANUAL_ADMIN_PASS` or `DEPARTMENT_ADMIN_MANUAL_BROWSER_PASS` is claimed |
| Auth/session checks | `NOT_TESTED_MANUALLY` | AccessDenied, session, and logout behavior were not manually tested during this attempt |
| Fixtures and institutional data | `UNCHANGED` | No test fixtures were created and no institutional records were mutated |
| Credentials and session file | `NOT_USED` | No temporary credentials were requested or used; `.env.phase8a.session` was absent, untracked, and ignored |
| Defect outcome | `NO_APPLICATION_DEFECT_FOUND` | Failure was classified as environmental/browser-tooling failure; no code fix was justified or made |
| Deployment | `NOT_PERFORMED` | No production deployment occurred |
| Conformance/device claims | `NOT_CLAIMED` | No WCAG conformance, physical-device certification, QR-camera acceptance, representative WebGL-device acceptance, or exact browser/OS certification is claimed |

This historical result does not close or supersede MQA-4. Phase 3 remains **IN PROGRESS**, and Phase 3-MQA-4 remains the current unfinished subphase. The exact next canonical work is real screen-reader manual acceptance plus real authenticated Admin manual acceptance in a functioning environment.

## Phase 3-MQA-4 screen-reader and authenticated Admin manual acceptance — owner completed 19 September 2026

**Subset classification:** `ACCEPTED_WITH_ADVISORY`

This resumed owner-reported evidence controls the current MQA-4 status without deleting, rewriting, or replacing the historical tooling-blocker record above.

| Area | Classification | Owner-provided evidence / boundary |
|---|---|---|
| Execution environment | `ACCEPTED_WITH_ADVISORY` | Windows, Windows Narrator, and a functioning graphical browser environment were used; browser name/version and formal assistive-technology configuration were not supplied |
| Screen-reader smoke | `OWNER_REPORTED_SCREEN_READER_PASS` | Home, Dashboard, Facilities, Navigate, Login, and CLARA were manually checked and reported acceptable with no blocker |
| Screen-reader semantics | `OWNER_REPORTED_SCREEN_READER_PASS` | Navigation elements, buttons and links, heading structure, form labels, and status/error presentation were manually checked and reported acceptable |
| Authenticated role | `SUPER_ADMIN_MANUAL_ADMIN_PASS` | The actual authenticated browser role tested was `SUPER_ADMIN` |
| Admin screen scope | `SUPER_ADMIN_MANUAL_ADMIN_PASS` | Admin Overview, Announcements, Events, Facility Advisories, Notifications, Audit, Personnel, Courses, Sections, Class Schedules, Schedule Exceptions, Assignments, Consultation Hours, Check-ins, and Availability Overrides passed the owner-reported manual check |
| Admin interaction/presentation | `SUPER_ADMIN_MANUAL_ADMIN_PASS` | Authenticated navigation, page/layout readability, tables/cards, form usability, labels, dialogs, validation presentation, and no observed clipping/overflow blocker were reported acceptable |
| Session and logout | `SUPER_ADMIN_MANUAL_ADMIN_PASS` | Session behavior and logout behavior passed in the tested browser session |
| AccessDenied | `ACCESSDENIED_MANUAL_QA_NOT_TESTED` | No explicit owner evidence states that an AccessDenied path was exercised; successful `SUPER_ADMIN` use is not treated as an AccessDenied pass |
| Department Admin | `DEPARTMENT_ADMIN_BROWSER_NOT_TESTED` | No separate `DEPARTMENT_ADMIN` browser session was reported; SQL/RLS/backend evidence is not converted into manual browser evidence |
| Defect outcome | `NO_APPLICATION_BLOCKER_OBSERVED` | The owner reported no blocker during either manual subset; no application fix is justified by this evidence |
| Safety/scope | `DOCUMENTATION_ONLY` | No credentials are recorded or exposed, and no fixture, institutional-data mutation, environment-file change, application change, or deployment is part of this documentation task |
| Conformance/device claims | `NOT_CLAIMED` | No WCAG conformance, full accessibility certification, screen-reader certification, physical-device certification, QR-camera acceptance, representative WebGL-device acceptance, or broad browser-support claim is added |

MQA-4 is complete at the supplied owner-reported smoke-evidence level. Its advisory boundaries remain explicit. Phase 3 remains **IN PROGRESS**.

## Phase 3-MQA-5 physical QR/camera and manual-fallback acceptance — next authorized subphase

**Readiness:** `READY`

**Execution:** `NOT_STARTED`

| Definition-of-Ready area | Result | Basis / boundary |
|---|---|---|
| Goal and scope | `READY` | Obtain real camera-device evidence for thesis-core QR positioning and manual fallback without changing the build; AR Guidance is excluded |
| Contracts and data | `READY` | QR payload/checkpoint registry, checkpoint-to-node relationships, one A* engine, safe errors, state preservation, local camera processing, and manual fallback are defined in the canonical navigation/map/UI contracts |
| Provenance | `READY_WITH_BOUNDARY` | Canonical checkpoint records and relationships are known, but physical installation/label placement remains pending verification; MQA-5 must not certify institutional installation accuracy |
| Security/privacy | `READY` | No authenticated role or write is required; permission is explicit, camera frames remain local and are not recorded/stored/uploaded, and no fixture or institutional-data mutation is required |
| Error/fallback cases | `READY` | Permission denied, camera unavailable, invalid/unknown/inactive/unlinked QR, unchanged location on failure, and manual current-location fallback are defined |
| Acceptance cases | `READY` | Recognized canonical QR resolves the intended node; invalid QR fails safely; denied/unavailable camera preserves manual fallback; state remains coherent; routing uses the existing A* engine |
| Map relationships and regression route | `READY` | Affected QR/node/graph relationships are identified; `QR-3F-LIBRARY → Registrar’s Office` is the selected regression route |
| Execution dependencies | `PENDING_EXECUTION` | A camera-capable physical device, graphical browser in a secure context, and scannable canonical test label/payload are required when the subphase is started |

MQA-5 is the single exact next Phase 3 subphase. Representative WebGL-device acceptance and broader physical-device evidence remain later gaps; neither is started by this readiness decision.

## Phase 3-MQA-5 physical QR/camera and manual-fallback acceptance — owner completed 19 September 2026

**Subset classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Owner-provided evidence / boundary |
|---|---|---|
| Overall physical result | `MQA5_OWNER_REPORTED_PHYSICAL_QR_CAMERA_PASS` | All prepared physical QR/camera, invalid-QR, manual-fallback, camera-denial, and camera-lifecycle checks were reported passed on the production HTTPS Navigate page; no blocker or defect was observed |
| Device details | `NOT_DOCUMENTED` | A real camera-capable physical device was used, but exact device model/type and OS/browser names and versions were not supplied |
| Camera permission/feed | `QR_PAYLOAD_CAMERA_ACCEPTANCE` | Permission prompt appeared, permission was granted, the scanner feed opened, and rear/environment-camera behavior worked as expected |
| Valid checkpoint/location | `QR_PAYLOAD_CAMERA_ACCEPTANCE` | The canonical QR resolved to `QR-3F-LIBRARY`, Library on the Third Floor, and displayed the QR-confirmed positioning state |
| Route | `ACCEPTED` | Registrar’s Office remained selected and the existing A* engine generated `3F → 4F → 5F`; QR supplied only the origin checkpoint and no second routing engine was introduced |
| Invalid/unknown QR | `ACCEPTED` | The invalid QR was rejected without replacing the valid location, inventing an origin, or inventing a route; retry and manual fallback remained available |
| Manual fallback | `ACCEPTED` | Library on 3F could be set manually, the manual state was distinguishable from QR-confirmed positioning, Registrar’s Office remained selected, and the same multi-floor A* route was generated |
| Camera denial/accessibility | `ACCEPTED` | Denied/blocked camera access produced a usable error/fallback state; Set Location Manually remained usable and the user was not trapped |
| Camera lifecycle | `ACCEPTED` | Camera indicator/feed stopped after successful detection, exit, or switching to manual location |
| Privacy observation | `OWNER_OBSERVED_NO_VISIBLE_RECORDING_UPLOAD_OR_PERSON_IDENTIFICATION` | This is an interface/device observation only and is not backend, privacy, or data-protection certification |
| Label placement | `PHYSICAL_LABEL_PLACEMENT_PENDING` | The QR came from a temporary test medium. `QR_PAYLOAD_CAMERA_ACCEPTANCE` does not establish installed campus checkpoint/signage acceptance |
| Claims boundary | `NOT_CLAIMED` | No continuous indoor positioning, AI routing, A*-as-AI, all-mobile-device support, broad browser support, iOS/Android certification, installed-label acceptance, or broad physical-device certification |
| Change scope | `DOCUMENTATION_ONLY` | No application, source, package, QR, routing, data, environment, deployment, or production change is part of this evidence record |

MQA-5 is complete at the supplied owner-reported physical-evidence level. Its device-detail, label-placement, and certification boundaries remain advisories. Phase 3 remains **IN PROGRESS**.

## Phase 3-MQA-6 representative WebGL-capable and WebGL-fallback device acceptance — next authorized subphase

**Readiness:** `READY`

**Execution:** `NOT_STARTED`

| Definition-of-Ready area | Result | Basis / boundary |
|---|---|---|
| Goal and core scope | `READY` | Obtain representative physical-device evidence for thesis-core 3D navigation and its required usable 2D fallback; no new feature is authorized |
| Contracts/data/state | `READY` | One spatial dataset, central 2D→3D transform, shared A* route, current/destination/path state, floor focus, and fallback contracts are identified |
| Security/privacy | `READY` | No authenticated role, data write, new sensor collection, or private-data handling is required |
| Error/fallback behavior | `READY` | WebGL unavailable/failure must provide a clear 2D fallback while preserving current location, destination, route, selected floor, and applicable progress |
| Acceptance cases | `READY` | Representative WebGL-capable physical-device 3D load/interaction, shared-state rendering, floor focus/isolation, 2D↔3D preservation, and real WebGL-disabled/unsupported/failure fallback are defined |
| Regression route | `READY` | `Library 3F → Registrar’s Office 5F` is selected; 2D and 3D must retain the same canonical `3F → 4F → 5F` route/node sequence |
| Execution dependencies | `PENDING_EXECUTION` | Documented device/OS/browser evidence is required for a representative WebGL-capable device and a real reproducible WebGL-disabled/unsupported/failure environment |

MQA-6 is the single exact next Phase 3 subphase and is not started. Broader physical-device evidence and installed QR-label placement verification remain later gaps.

## Phase 3-MQA-6 representative WebGL-capable and WebGL-fallback device acceptance — owner completed 19 September 2026

**Subset classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Owner-provided evidence / boundary |
|---|---|---|
| WebGL-capable execution | `OWNER_REPORTED_REPRESENTATIVE_WEBGL_CAPABLE_PASS` | Production Navigate loaded over HTTPS in a WebGL-capable browser environment; 3D loaded and rendered campus/floor geometry plus current/destination markers |
| 3D controls/interactions | `ACCEPTED` | Exploded, Stacked, 3F/4F/5F selection, Isolate Floor, Focus Floor, Entire Building, Reset View, orbit, zoom, pan, and applicable facility selection/focus passed; no major clipping or unusable-control blocker was observed |
| Route and state | `ACCEPTED` | `Library 3F → Registrar’s Office 5F` retained the canonical `3F → 4F → 5F` A* route; multi-floor transitions remained understandable and 2D↔3D plus return-to-3D switching preserved navigation state |
| Capable-session failure outcome | `NO_APPLICATION_BLOCKER_OBSERVED` | No crash, blank scene, infinite loading state, or unrecoverable state occurred; the user could return to 2D and continue navigation |
| WebGL-disabled execution | `OWNER_REPORTED_WEBGL_FALLBACK_PASS` | The prepared isolated Edge profile with WebGL-disabling launch flags produced a reproducible failure environment and did not present fake 3D success |
| Fallback continuity | `ACCEPTED` | The app remained in or returned to 2D without crashing, going permanently blank, or loading indefinitely; current location, Registrar’s Office, active `3F → 4F → 5F` route, selected-floor/applicable state, textual instructions, and 2D route-floor navigation remained usable |
| Routing/spatial architecture | `PRESERVED` | 3D remained a presentation layer over the canonical spatial data and existing A* route sequence; no second route engine, independent spatial truth, or AI-routing claim is introduced |
| Execution metadata | `NOT_DOCUMENTED` | Physical device model/type, Windows edition/version/build, GPU, and exact browser version from the successful execution were not supplied; preparation-time browser metadata is not promoted into execution evidence |
| Native WebGL probes | `NOT_DOCUMENTED` | Exact capable-session and fallback-session native WebGL probe values were not supplied; no values are inferred |
| Exact fallback wording | `EXACT_FALLBACK_WORDING_NOT_DOCUMENTED` | The exact message visually observed during the successful disabled-session run was not supplied |
| Copy conformance | `ADVISORY_UI_COPY_MISMATCH` | Canonical copy is `3D view unavailable; switched to 2D.`; implementation/precheck copy is `3D view is unavailable on this device. CampusNav has switched to 2D.` The equivalent safe behavior passed, so this is retained for final reconciliation rather than classified as a behavioral blocker or silently changed |
| Performance/device claims | `NOT_CLAIMED` | The approximately 878 kB lazy 3D chunk advisory remains; no performance, universal-smoothness, GPU, broad-device, broad-browser, or universal-WebGL certification is added |
| Change scope | `DOCUMENTATION_ONLY` | No application, source, package, test, route, spatial data, environment, deployment, production-data, AR, CLARA, or PWA change is part of this evidence record |

MQA-6 is complete at the supplied owner-reported representative-evidence level. Its execution-detail, native-probe, exact-copy, performance, and certification boundaries remain explicit advisories. Phase 3 remains **IN PROGRESS**.

## Phase 3-MQA-7 final Phase 3 acceptance and evidence reconciliation — next authorized subphase

**Readiness:** `READY`

**Execution:** `NOT_STARTED`

| Definition-of-Ready area | Result | Basis / boundary |
|---|---|---|
| Goal and scope | `READY` | Reconcile the accepted production baseline and MQA-1 through MQA-6 evidence, distinguish blockers from advisories, and determine the evidence-aware final Phase 3 status without starting a feature |
| Sources/evidence | `READY` | Current roadmap, Definition of Done, limitations, compatibility/acceptance contracts, status registry, evaluation gaps, quality gates, deployment evidence, deterministic results, and owner-reported MQA records are identified |
| Security/privacy/data | `READY` | Reconciliation requires no credentials, authenticated role, institutional-data write, new sensor collection, fixture, schema change, or private-data handling |
| Error/gap handling | `READY` | Missing details remain `NOT_DOCUMENTED`; unresolved items must be classified as blockers, advisories, deferred work, or decision/data dependencies without inventing evidence |
| Acceptance cases | `READY` | Cross-document consistency; explicit treatment of the fallback-copy mismatch, lazy-chunk advisory, broader physical-device evidence, installed QR-label placement, Department Admin/AccessDenied browser gaps, and all claims boundaries; one final Phase 3 status and next-step decision |
| Execution dependencies | `READY` | Required reconciliation inputs already exist in the canonical evidence record; no external environment is needed to start the review |

MQA-7 is the single exact next Phase 3 subphase and is not started by this update. Broader physical-device evidence and installed QR-label placement verification remain unresolved inputs/gaps; AR Guidance remains `PROPOSED / DEFERRED / NOT_IMPLEMENTED / NOT_READY`.

## Phase 3-MQA-3 keyboard-only and accessibility manual acceptance — owner completed 17 September 2026

**Subset classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Owner-provided evidence / boundary |
|---|---|---|
| Evidence source | `ACCEPTED_WITH_ADVISORY` | The owner reports completing the keyboard-only/accessibility manual check on the current approved production baseline, finding the tested behavior acceptable, and finding no blocker requiring an application change. Detailed per-control, per-screen, browser/OS, screenshot, and assistive-technology evidence was not supplied |
| Keyboard-only operation | `OWNER_REPORTED_KEYBOARD_ACCESSIBILITY_PASS` | Keyboard-only navigation, Tab, Shift+Tab, Enter, Space where appropriate, and no observed keyboard blocker or trap were reported acceptable |
| Focus and navigation | `OWNER_REPORTED_KEYBOARD_ACCESSIBILITY_PASS` | Focus visibility and forms/navigation usability were reported acceptable; exact focus sequence and individual control results are `NOT SPECIFICALLY_DOCUMENTED` |
| Dialogs and forms | `OWNER_REPORTED_KEYBOARD_ACCESSIBILITY_PASS` | Escape/dialog behavior and applicable form use were reported acceptable; no per-dialog or per-form PASS claim is added |
| Visual and motion accessibility | `OWNER_REPORTED_KEYBOARD_ACCESSIBILITY_PASS` | Readable visual contrast, reduced-motion behavior, approximately 200% zoom usability, and labels/headings/status/error presentation were reported acceptable; formal measurements and per-screen findings are `NOT SPECIFICALLY_DOCUMENTED` |
| Application scope | `ACCEPTED_WITH_ADVISORY` | Relevant scope may include global navigation, Login, Dashboard, Facilities, Navigate controls, dialogs/drawers, CLARA controls, and Admin navigation/forms. These are scope references, not individual screen PASS claims |
| Screen reader | `SCREEN_READER_QA_PENDING` | No explicit screen-reader evidence was provided; semantic markup, keyboard behavior, and visual inspection are not substitutes for a screen-reader session |
| Formal conformance/device claims | `NOT_CLAIMED` | No WCAG conformance, physical tablet/mobile certification, QR-camera PASS, representative WebGL-device PASS, or exact browser/OS certification is added |
| Authenticated Admin detail | `IMPLEMENTED_UNVERIFIED` | Admin appeared in prior general owner-reported screen scope, but authenticated state and detailed protected navigation/form behavior remain `NOT SPECIFICALLY_DOCUMENTED` |
| Defect outcome | `ACCEPTED` | Owner reported no blocker requiring application changes; no code fix, test change, service mutation, or redeployment is justified by this evidence |

MQA-3 supersedes earlier pending classifications only for the owner-reported keyboard, focus, dialog/form, contrast, reduced-motion, zoom, and presentation behaviors named above. Phase 3 remains **IN PROGRESS**. The next canonical manual-QA subset is Phase 3-MQA-4 — Screen-Reader and Authenticated Admin Manual Acceptance, classified `READY` under the Definition of Ready with screen-reader/browser and possible temporary credential execution dependencies.

## Phase 3-MQA-2 remaining responsive viewport acceptance — owner completed 17 September 2026

**Subset classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Owner-provided evidence / boundary |
|---|---|---|
| Evidence source | `ACCEPTED_WITH_ADVISORY` | The owner reports completing the remaining responsive viewport review and finding `NO BLOCKER FOUND`. Screenshots, browser/version, operating system, measurements, and detailed findings were not supplied |
| `1440x900` | `OWNER_REPORTED_MANUAL_BROWSER_PASS` | Manually checked and reported acceptable; per-screen and per-control results are `NOT SPECIFICALLY_DOCUMENTED` |
| `1024x768` | `OWNER_REPORTED_MANUAL_BROWSER_PASS` | Manually checked and reported acceptable; per-screen and per-control results are `NOT SPECIFICALLY_DOCUMENTED` |
| 768px tablet viewport | `OWNER_REPORTED_RESPONSIVE_VIEWPORT_PASS` | Responsive viewport result reported acceptable; `PHYSICAL_DEVICE_DETAILS_NOT_DOCUMENTED` |
| Approximately 390px mobile viewport | `OWNER_REPORTED_RESPONSIVE_VIEWPORT_PASS` | Responsive viewport result reported acceptable; `PHYSICAL_DEVICE_DETAILS_NOT_DOCUMENTED` |
| Responsive screen scope | `ACCEPTED_WITH_ADVISORY` | The current responsive application, including where applicable Home, Dashboard, Facilities, Facility Detail, Navigate 2D/3D, Events, Emergency, CLARA, Login, and Admin, was within scope. Individual screen PASS claims are not added because per-screen findings were not provided |
| Accessibility/device claim | `PARTIAL` | MQA-2 adds responsive viewport evidence only. WCAG, screen reader, detailed keyboard-only behavior, physical QR/camera, representative WebGL-device, and exact browser/OS certification remain pending |
| Defect outcome | `ACCEPTED` | Owner reported no blocker requiring an application change; no code fix or redeployment is justified by this evidence |

Together, MQA-1 and MQA-2 provide owner-reported responsive evidence for all six canonical viewport targets. Tablet/mobile physical-device certification is not claimed. Canonical Phase 3 remains **IN PROGRESS** pending dedicated accessibility and physical-device acceptance.

## Phase 3-MQA-1 primary laptop browser acceptance — owner completed 17 September 2026

**Subset classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Owner-provided evidence / boundary |
|---|---|---|
| Evidence source | `ACCEPTED_WITH_ADVISORY` | The owner reports completing the manual laptop browser pass and finding no blocker requiring application changes. Screenshots, browser/version, operating system, and physical device details were not supplied |
| `1366x768` | `OWNER-REPORTED_MANUAL_BROWSER_PASS` | Manually checked by the owner and reported acceptable; detailed layout findings are `NOT SPECIFICALLY_DOCUMENTED` |
| `1280x800` | `OWNER-REPORTED_MANUAL_BROWSER_PASS` | Manually checked by the owner and reported acceptable; detailed layout findings are `NOT SPECIFICALLY_DOCUMENTED` |
| Covered screens | `OWNER-REPORTED_MANUAL_BROWSER_PASS` | Dashboard, Facilities, Navigate 2D, Navigate 3D, CLARA, Login, and Admin were included and reported acceptable; per-screen subcheck results are `NOT SPECIFICALLY_DOCUMENTED` |
| Keyboard smoke | `ACCEPTED_WITH_ADVISORY` | A basic keyboard smoke check was included and reported acceptable. Exact focus order, Tab/Shift+Tab, Enter/Space/Escape, arrow-key behavior, traps, dialog exit behavior, and focus visibility are `NOT SPECIFICALLY_DOCUMENTED` |
| Accessibility claim | `PARTIAL` | MQA-1 adds limited keyboard evidence only. Contrast, touch targets, screen-reader output, reduced motion, detailed semantics, and WCAG conformance remain undocumented/pending |
| 3D/device claim | `ACCEPTED_WITH_ADVISORY` | Navigate 3D was included in the owner laptop pass. Orbit/camera, floor isolation, stacked/exploded mode, route/marker details, Emergency overlay, performance, WebGL failure, and representative physical GPU/device results are `NOT SPECIFICALLY_DOCUMENTED` |
| Defect outcome | `ACCEPTED` | Owner reported no blocker requiring an application change; no code fix or redeployment is justified by this evidence |
| Remaining viewport/device scope | `IMPLEMENTED_UNVERIFIED` | `1440x900`, `1024x768`, 768px tablet, approximately 390px mobile, physical QR/camera, screen reader, and representative WebGL devices remain pending |

This newer owner evidence supersedes the earlier tooling blocker only for the two named laptop viewports and listed screens. It does not rewrite the earlier attempt or convert unreported subchecks into passes. Canonical Phase 3 remains **IN PROGRESS**.

## Phase 3 manual acceptance attempt — 17 September 2026

**Manual-QA subset classification:** `PARTIAL` / `BLOCKED_BY_TOOLING`

| Area | Classification | Evidence / advisory |
|---|---|---|
| Production baseline | `ACCEPTED` | Production remains available and serves `index-D88W5mFD.js`, `index-DVdLsi8t.css`, the canonical SCC PNG, and the canonical OG PNG. `HEAD` and `origin/main` are `bf9cc9b`; their only changes after deployed runtime revision `128ac40` are canonical tracking documents, so no runtime delta or redeployment was introduced |
| Requested viewport matrix | `BLOCKED_BY_TOOLING` | The approved in-app browser runtime failed before page launch with `failed to write kernel assets` (OS error 3). No manual claim is made for 1366x768, 1280x800, 1440x900, 1024x768, 768px tablet, or 390px mobile |
| Public-screen visual QA | `IMPLEMENTED_UNVERIFIED` | Home, Dashboard, Facilities, Facility Detail, Navigate 2D/3D, Events, Emergency, CLARA, and Login remain covered by existing route/static evidence, but no fresh graphical manual inspection was possible |
| Authenticated Admin visual QA | `IMPLEMENTED_UNVERIFIED` | Deterministic Admin CMS and Phase 8C.2 route/form/security checks passed. The graphical browser failed before authentication, so credentials were not requested and no authenticated visual claim is added |
| Responsive implementation | `ACCEPTED_WITH_ADVISORY` | Static review confirms centralized responsive density variables, 1024px desktop transition, responsive grids/rails, mobile navigation, mobile route sheet, overflow handling, and viewport-aware map/Admin heights. This is code evidence, not device certification |
| Keyboard and accessibility | `PARTIAL` | Static review confirms a skip link, semantic page headings/regions, form labels, accessible names, status/error roles, visible-focus utilities, modal semantics, reduced-motion rules, and non-color text/icon cues. Keyboard order/traps, Escape behavior, contrast, touch targets, and screen-reader output remain manually unverified; no WCAG claim is made |
| QR/camera | `ACCEPTED_WITH_ADVISORY` | Fresh QR payload, valid/invalid checkpoint, manual fallback, location preservation, and QR-to-A* regressions passed. `LOGIC VERIFIED / PHYSICAL CAMERA QA PENDING` |
| 3D/WebGL | `ACCEPTED_WITH_ADVISORY` | Fresh shared-route, floor conversion, stairs, construction, emergency eligibility, and WebGL-fallback regression passed. `AUTOMATED WEBGL VERIFIED / REPRESENTATIVE DEVICE QA PENDING` |
| Emergency | `ACCEPTED_WITH_ADVISORY` | Fresh approved-edge-only, normal-edge rejection, blocked/construction handling, inactive/unverified edge, route-cost, and safe no-route regressions passed; graphical readability remains unverified |
| Defects and changes | `ACCEPTED` | No reproducible application defect was found within available automated/static evidence. No application code, dependency, configuration, schema, production data, or deployment was changed |

Canonical Phase 3 remains **IN PROGRESS**. Exact-revision deployment stays accepted, but the remaining manual acceptance scope cannot be closed until real graphical browser/device, keyboard, camera, and representative WebGL evidence is available.

## Phase 3 exact-revision production deployment — 17 September 2026

**Overall classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Evidence / advisory |
|---|---|---|
| Approved release revision | `ACCEPTED` | Clean `main`, fetched `origin/main`, and deployed source all resolved to `128ac403c2fcf57f4f471543ea79b2c4f0ed6369`; `.env.phase8a.session` was absent and `stash@{0}` remained untouched |
| Cloudflare deployment | `ACCEPTED` | Existing `wrangler.jsonc` Workers Static Assets workflow deployed `campusnav-ai` to the canonical workers.dev endpoint as Cloudflare version `3636917e-ddf5-4b98-9737-c44f0478f226` |
| Production equivalence | `ACCEPTED` | Production HTML, `index-D88W5mFD.js`, `index-DVdLsi8t.css`, and `Campus3D-DNMDm-2E.js` matched the local release build byte-for-byte; classification is `PRODUCTION_MATCHES_CURRENT_BASELINE` |
| SPA routes | `ACCEPTED` | `/`, `/dashboard`, `/facilities`, `/map`, `/map?mode=emergency`, `/login`, and `/admin` returned HTTP 200 with the exact release HTML fallback |
| Branding and metadata | `ACCEPTED` | Canonical SCC and OG URLs returned real PNGs with matching hashes; obsolete JPG/v2/v3 paths returned HTML rather than image assets; all required OG/Twitter tags target `campusnav-og.png` |
| Supabase production initialization | `ACCEPTED` | Production-safe URL/publishable configuration is present in the exact bundle; Auth settings and a read-only public announcements query both returned HTTP 200; no secret-key pattern was present in production JavaScript |
| Auth/Admin production boundary | `ACCEPTED_WITH_ADVISORY` | `/login` and `/admin` deliver the exact locally tested protected-route bundle, Supabase Auth initializes, and deterministic Auth/RBAC/Admin/render suites passed. A connected graphical browser was unavailable, so no fresh interactive login/Admin claim is added |
| 3D production boundary | `ACCEPTED_WITH_ADVISORY` | The approximately 878 kB 3D chunk remains a separate matching asset and is absent from initial HTML; deterministic shared-route and WebGL-fallback tests passed, while representative-device graphical QA remains pending |
| Manual device/accessibility QA | `IMPLEMENTED_UNVERIFIED` | **MANUAL DEVICE QA PENDING**; no WCAG, physical camera/QR, screen-reader, keyboard-only, or representative WebGL-device completion claim is made |

The earlier checkpoint rows below remain historical evidence of their pre-deployment state. This dated section controls the current production-equivalence classification.

## Phase 3 canonical asset-cleanup checkpoint — 16 September 2026

**Overall classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Evidence / advisory |
|---|---|---|
| SCC runtime logo | `ACCEPTED` | Under owner-approved `DEC-ASSET-001`, `SchoolLogo` requests only the registered high-resolution transparent `public/branding/scc-logo.png`; the JPG is not an automatic fallback, while accessible text and the non-image monogram fallback remain unchanged |
| Social preview | `ACCEPTED` | Open Graph and Twitter metadata target the registered absolute `/branding/campusnav-og.png` production URL; the production build emits a real 1200×630 PNG |
| Public build inputs | `ACCEPTED` | Historical `scc-logo.jpg`, obsolete `campusnav-og-v2.png`, and unsupported-claims `campusnav-og-v3.png` were removed from runtime `public/`; source/legacy binaries were preserved outside the repository runtime tree for owner review |
| Quality and security gates | `ACCEPTED_WITH_ADVISORY` | The transparent PNG preserves the original 600×600 RGB artwork exactly while changing only exterior alpha. ESLint, typecheck, route rendering, and production build pass; the release build contains only the approved SCC PNG and CampusNav OG PNG under `dist/branding`. Existing dependency, manual-device, and 3D chunk advisories remain |
| Deployment | `IMPLEMENTED_UNVERIFIED` | Cleanup is staged for owner review only. No commit, push, or production deployment/equivalence verification has occurred |

## Phase 3 release-candidate consolidation — Checkpoint A — 16 September 2026

**Overall classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Evidence / advisory |
|---|---|---|
| Canonical readiness | `ACCEPTED` | The owner authorized the release-consolidation subset of the canonical "Accepted Baseline Release and Manual QA" phase. Goal, evidence, security/privacy boundaries, migration impact, and quality gates are defined; no new feature was started |
| Phase 8C.2 implementation | `ACCEPTED_WITH_ADVISORY` | The staged candidate is the same preserved implementation accepted during Phase 2 live-cloud testing. Fresh deterministic suites, route rendering, lint, typecheck, and build pass; authenticated graphical Admin QA remains pending |
| Phase 8C.2 migration | `ACCEPTED` | Migration `20260915052147` is present in local/linked order, adds the three required exclusion constraints and consultation-location optionality, and neither creates replacement tables nor drops tables/columns nor changes RLS policies |
| RLS, RBAC, audit, and Realtime | `ACCEPTED_WITH_ADVISORY` | Exact-code Phase 2 evidence covers linked RLS/RBAC, trusted audit writes, authenticated Realtime, role scope, class lifecycle, and cleanup. This consolidation performed no new cloud mutation; the prior one-time Realtime timeout remains a timing advisory |
| Schedule/personnel invariants | `ACCEPTED` | Deterministic and exact-code Phase 2 evidence preserve `SCHEDULED != CHECKED_IN`, authorized active check-in, conflict enforcement, exception handling, precedence, privacy, and overlap-safe next availability |
| Fixture and credential hygiene | `ACCEPTED_WITH_ADVISORY` | Linked fixture audit returned zero across 14 DEVELOPMENT/DEMO categories; the temporary session file is absent/untracked; source/build scans found no real privileged/provider/database/JWT/private-key credential. Intentional rejected-key test canaries remain. Dependency advisories are unchanged |
| Quality gates | `ACCEPTED_WITH_ADVISORY` | All deterministic data/navigation/QR/Emergency/3D/Dashboard/Auth/Admin/Phase 8 suites, route rendering, ESLint, typecheck, and production build passed. Docker pgTAP and manual device/accessibility QA remain unavailable/pending |
| Deployment equivalence | `CONFLICT` | No deployment was performed. Cloudflare production must not be treated as equivalent to this staged release candidate until the exact approved revision is deployed and asset fingerprints are verified |
| Social preview | `ACCEPTED` | Checkpoint B was committed at `b860cf1`; the canonical 1200×630 `campusnav-og.png` is the active metadata target, and the subsequent asset-cleanup checkpoint excludes obsolete/unapproved public variants |

Checkpoint A is a scoped Git staging boundary, not a release or completion claim. No commit, push, deployment, stash mutation, or Phase 3 feature development was performed.

## CampusNav Ink laptop-space optimization — 16 September 2026

**Overall classification:** `IMPLEMENTED_UNVERIFIED`

| Area | Classification | Evidence / advisory |
|---|---|---|
| Shared density system | `ACCEPTED` | Centralized application width, gutter, page/section spacing, card padding, header height, Admin rail, and map-control-rail tokens are consumed by shared layout primitives |
| Public application surfaces | `ACCEPTED_WITH_ADVISORY` | Home, Dashboard, Facilities, Facility Detail, Events, Emergency, and CLARA use wider shells, compact vertical rhythm, and content-driven laptop grids; route rendering and deterministic regressions pass |
| Navigate 2D/3D shell | `ACCEPTED_WITH_ADVISORY` | Route planning, floor/view controls, summary, and notices occupy a compact laptop rail while the shared 2D/3D map receives the remaining width and viewport-aware height; routing, spatial data, 3D behavior, QR, and Emergency logic are unchanged and their regressions pass |
| Admin density | `ACCEPTED_WITH_ADVISORY` | Admin rail, content gutter, overview grids, filters, table rows, and logically grouped forms are more compact at laptop widths without RBAC/service changes; authenticated graphical workflow was not rerun |
| 1280–1440px visual evidence | `IMPLEMENTED_UNVERIFIED` | Layout rules explicitly target 1280×800, 1366×768, and 1440×900, but no connected graphical browser was available for screenshots or visual inspection |
| Tablet/mobile preservation | `IMPLEMENTED_UNVERIFIED` | Breakpoint fallbacks, mobile navigation, map route sheet, labelled controls, focus styles, and practical control heights remain in code; real tablet/mobile graphical QA was unavailable |
| Behavior preservation | `ACCEPTED` | ESLint, typecheck, production build, route render, and every existing deterministic data/navigation/QR/Emergency/3D/Dashboard/Auth/Admin/Phase 8 suite pass |

**MANUAL DEVICE QA PENDING.** No browser/device support or WCAG conformance claim is added by this refinement.

## CampusNav Ink baseline adoption — 15 September 2026

**Overall classification:** `ACCEPTED_WITH_ADVISORY`

| Area | Classification | Evidence / advisory |
|---|---|---|
| Owner decision and source boundary | `ACCEPTED` | `DEC-UI-002` records the CampusNav Ink / architectural-blueprint baseline; the supplied HTML is registered as visual/UX reference only, not runtime or institutional truth |
| Centralized design system | `ACCEPTED` | `src/index.css` defines neutral, CampusNav green, emergency red, typography, radius, border, shadow, grid, and blueprint tokens; Tailwind brand compatibility tokens point to the approved green/neutral palette |
| Reusable primitives | `ACCEPTED` | Shared button/card/header treatments plus `BlueprintPanel`, `InkKicker`, and `InkSectionLabel` provide maintainable React mappings without copied artifact scripts or inline-style systems |
| Major public surfaces | `ACCEPTED_WITH_ADVISORY` | Home, Dashboard, Facilities, Facility Detail, Navigate shell, Events, Emergency, CLARA, Login, global search, notifications, and profile/account adopt the baseline; automated desktop captures were visually inspected |
| Admin presentation | `ACCEPTED_WITH_ADVISORY` | Shared Admin shell and existing Admin page primitives adopt the centralized tokens without changing RBAC or write behavior; authenticated graphical Admin interaction was not rerun |
| 2D/3D navigation presentation | `ACCEPTED` | Map controls/frame/summary surroundings adopt the blueprint system; navigation, multi-floor, 3D, emergency, and route-render regressions passed; spatial data and routing logic were unchanged |
| Responsive/browser evidence | `IMPLEMENTED_UNVERIFIED` | Existing responsive/mobile navigation code is preserved. Narrow headless screenshots are not treated as device certification. **AUTOMATED RENDER VERIFIED / MANUAL VISUAL QA PENDING.** |
| Accessibility evidence | `PARTIAL` | Existing semantic labels, focus utilities, reduced-motion handling, status text/icons, and 2D fallback remain; no new WCAG claim, screen-reader session, keyboard-only pass, or full contrast audit was completed |
| Performance/lazy-loading | `ACCEPTED_WITH_ADVISORY` | 3D, QR scanner, map verification, emergency panel, and Admin routes remain lazy. Production build passes; the existing approximately 878 kB minified 3D chunk warning remains |
| Behavior preservation | `ACCEPTED` | All deterministic data, A*, same-floor, multi-floor, QR, Emergency, 3D/WebGL, Dashboard, Auth/RBAC, Admin, Phase 8C.1, Phase 8C.2, and route-render suites passed after adoption |
| Deployment equivalence | `IMPLEMENTED_UNVERIFIED` | No deployment was requested or performed; current worktree must not be assumed equivalent to Cloudflare production |

The review of `25-performance-budget.md`, `26-accessibility-standards.md`, `55-browser-device-compatibility.md`, and `60-core-vs-optional-feature-matrix.md` found no requirement that conflicts with `DEC-UI-002`; their performance, fallback, accessibility, and thesis-core boundaries remain in force.

## Phase 2 acceptance snapshot — freshly revalidated 16 September 2026

### Acceptance vocabulary
- `ACCEPTED` — current implementation passed the relevant fresh deterministic and/or live acceptance evidence
- `ACCEPTED_WITH_ADVISORY` — accepted behavior passed, with a named non-blocking limitation or untested environment
- `IMPLEMENTED_UNVERIFIED` — implementation exists but the required evidence was not available
- `PARTIAL` — only part of the canonical contract is implemented
- `BLOCKED` — the check cannot proceed without a missing runtime, institutional input, or approved decision
- `DEFERRED` — intentionally postponed; it is not an implemented claim
- `CONFLICT` — current evidence contradicts the claimed or expected state

### Phase 2 evidence matrix

| Acceptance area | Classification | Fresh Phase 2 evidence / advisory |
|---|---|---|
| Worktree preservation | `ACCEPTED` | Preserved all pre-existing tracked/untracked work and `stash@{0}`; no reset, restore, clean, discard, stash-pop, or application overwrite was performed |
| Phase 8C.2 overall | `ACCEPTED_WITH_ADVISORY` | Deterministic UI/service checks, linked database constraints/RLS, authenticated writes, Realtime refresh, Dashboard refetch, audit, lifecycle, and cleanup passed; real graphical Admin interaction remains `MANUAL DEVICE QA PENDING` |
| Linked Supabase schema | `ACCEPTED` | Linked migration list contains `20260914151900`, `20260914231416`, `20260915002902`, and `20260915052147`; 24/24 public tables have RLS and 9/9 public views use `security_invoker` |
| Auth and RBAC | `ACCEPTED_WITH_ADVISORY` | Real client login, profile and role load, `SUPER_ADMIN`, `hasRole`, persisted session restoration, token refresh, logout state clearing, protected-access removal, and re-login passed under Node 22; no fresh graphical browser login run |
| Live cloud RLS | `ACCEPTED` | Linked transactional suites passed 35 + 21 + 34 + 13 assertions; authenticated allowed writes and anonymous administrative-write rejection also passed through `supabase-js` |
| Realtime | `ACCEPTED_WITH_ADVISORY` | Admin announcement/event INSERT/UPDATE/DELETE and Phase 8C.2 ACADEMIC/PERSONNEL refresh delivery passed under Node 22. The first fresh Auth-suite run timed out after subscription; its cleanup audit was zero, the complete suite passed on the second run, and both independent authenticated Realtime suites passed |
| Schedule/personnel invariants | `ACCEPTED` | Live `SCHEDULED → CHECKED_IN → SCHEDULED`, `UNAVAILABLE` precedence, public projection privacy, and schedule-only-not-presence behavior passed |
| Conflict enforcement | `ACCEPTED` | Client detects room/professor/section conflicts; all three live PostgreSQL exclusion constraints exist and linked conflict assertions passed |
| Next availability | `ACCEPTED` | Live 14:30–16:00 gap and overlapping-assignment counterexample passed in Asia/Manila calculations |
| Admin CMS and audit logging | `ACCEPTED_WITH_ADVISORY` | Live CRUD for announcements, events, advisories, and notifications; draft privacy; audience links; trusted audit creation; read-only audit boundary; and cleanup passed. Graphical Admin QA remains pending |
| Dashboard | `ACCEPTED_WITH_ADVISORY` | Local lifecycle/priority/deduplication tests and live public provider reads passed; class insert/edit/cancel emitted Realtime signals and refreshed Today's Classes. Graphical responsive QA remains pending |
| A*, same-floor, and multi-floor navigation | `ACCEPTED` | Fresh route, wall-crossing, blocked-edge, stair-continuity, construction, and render regressions passed through the single `pathfinding.js` engine |
| 2D and 3D | `ACCEPTED_WITH_ADVISORY` | Shared route/data/coordinate and WebGL-fallback regressions passed; graphical/device QA pending and the 3D chunk remains approximately 878 kB minified |
| QR/manual positioning | `ACCEPTED_WITH_ADVISORY` | Valid/invalid payload, graph origin, manual fallback, privacy, and route tests passed; physical camera and installed-label QA pending |
| Emergency | `ACCEPTED_WITH_ADVISORY` | Approved-edge-only routes, normal-edge rejection, construction/blocked handling, and safe no-route behavior passed; source coverage and safety-authority sign-off remain limited/pending |
| UI registry | `ACCEPTED_WITH_ADVISORY` | All 54 registered page/component paths are present; protected route rendering and responsive code patterns passed static checks. The color-direction question was later resolved by `DEC-UI-002`; manual device QA remains pending |
| Responsive/browser QA | `IMPLEMENTED_UNVERIFIED` | Responsive breakpoints, mobile map sheet, mobile Admin cards, and SPA route responses exist. **MANUAL DEVICE QA PENDING** |
| Accessibility QA | `PARTIAL` | Static labels, dialog roles, focus utilities, reduced-motion handling, and 2D fallback exist; no fresh keyboard-only, screen-reader, touch-target, or full contrast test, so no WCAG conformance claim is made |
| Credential/security audit | `ACCEPTED_WITH_ADVISORY` | Session file deleted and confirmed absent/untracked; no real service-role, provider, PostgreSQL-password URL, JWT, or private-key credential was found in source/build/local environment. The only source matches are intentional rejected-key test canaries; the build contains a role-name literal, not a key. Dependency audit reports 2 low + 3 moderate + 1 high advisory; Vite has a non-major remediation, while Router/Quill paths require deliberate major upgrades |
| Fixture cleanup | `ACCEPTED` | Post-test linked audit returned zero records in all 14 DEVELOPMENT/DEMO categories |
| Build and regression gates | `ACCEPTED_WITH_ADVISORY` | All 12 deterministic suites, route render, linked SQL suites, authenticated cloud suites, ESLint, typecheck, and production build passed. Local `test:rls` is `BLOCKED` only because Docker is unavailable |
| GitHub / deployment equivalence | `CONFLICT` | Local `HEAD` equals `origin/main` at `7496a765bc3a7135a8a1c44aa23224ed5aa843b3`, but preserved tracked/untracked work changes the build. Production entry/CSS asset names differ from the fresh worktree build, production still references `campusnav-og-v2.png`, and `/branding/campusnav-og.png` returns SPA HTML rather than PNG |
| Supabase production connection | `ACCEPTED` | Local environment and deployed production bundle both reference the linked project; live Data API, Auth, PostgreSQL, RLS, and Realtime checks passed |
| PWA/offline | `PARTIAL` | Manifest is valid and served, but no service worker/versioned emergency cache exists. A manifest alone is not offline support |
| CLARA | `PARTIAL` / `DEFERRED` | Current UI is an explicitly local, conservative facility matcher. It is not the final grounded Groq/tool integration, which remains deferred until an approved later phase |

Phase 2 changes only acceptance tracking documents. It does not deploy, refactor, add a feature, or start Phase 3.

## Phase 1 status vocabulary
- `IMPLEMENTED_VERIFIED` — implementation exists and relevant deterministic evidence passed during this audit; this does not imply browser/device or live-cloud verification unless explicitly stated
- `IMPLEMENTED_UNVERIFIED` — implementation exists, but a required external, live, or environment-specific check was not freshly performed
- `PARTIAL` — only part of the canonical contract is implemented
- `MISSING` — no implementation evidence was found
- `DEFERRED` — intentionally postponed by an approved architectural decision
- `BLOCKED` — cannot be completed without approved institutional data or a decision
- `CONFLICT` — implementation or documentation contradicts a controlling rule and requires explicit resolution

## Phase 1 requirement-to-code alignment matrix

| Subsystem | Canonical references | Relevant implementation | Status and evidence | Gap / risk | Recommended future phase |
|---|---|---|---|---|---|
| Project scope | `01`, `02`, `37`, `60` | `src/App.jsx`, `src/pages/` | `IMPLEMENTED_VERIFIED` — route and source audit found campus navigation/information functions and no LMS/ERP implementation | Future work could introduce scope drift | Phase 2 baseline guardrails |
| 2D navigation | `06`, `07`, `10`, `11`, `58` | `src/pages/Map.jsx`, `src/components/map/IndoorMap2D.jsx` | `IMPLEMENTED_VERIFIED` — navigation, multi-floor, render tests passed | Browser interaction was not freshly tested | Phase 2 browser acceptance |
| 3D navigation | `03`, `07`, `10`, `11`, `25`, `58` | `src/components/map3d/`, `src/lib/map3d.js` | `IMPLEMENTED_VERIFIED` — shared coordinate, shared-route, WebGL-fallback tests passed | Device/browser QA not reverified; production chunk is about 878 kB | Phase 2 browser/device/performance QA |
| A* routing | `02`, `10`, `18` | `src/lib/pathfinding.js`, `src/lib/navigation.js` | `IMPLEMENTED_VERIFIED` — same-floor, multi-floor, blocked-edge and wall-crossing tests passed | Distances remain schematic rather than verified metres | Preserve in all future phases |
| GF–5F spatial data | `04`, `11`, `20`, `34` | `src/data/floors.js`, `facilities.js`, `additionalFloorMaps.js`, `mapNodes.js`, `mapEdges.js`, `stairs.js` | `IMPLEMENTED_VERIFIED` — 95 source-supported facility assignments and graph integrity passed | Exact dimensions remain estimated; institutional final verification is pending | Future approved map-verification phase |
| QR positioning | `03`, `10`, `20`, `58` | `src/data/qrCheckpoints.js`, `src/lib/checkpointPositioning.js`, `src/components/map/QRScanner.jsx` | `IMPLEMENTED_VERIFIED` — valid, invalid, payload, privacy and A* origin tests passed | Physical installation/label placement not verified | Future deployment QA |
| Manual positioning | `03`, `10`, `20`, `55`, `58` | `src/lib/checkpointPositioning.js`, `src/pages/Map.jsx` | `IMPLEMENTED_VERIFIED` — manual fallback and state-preservation tests passed | Browser accessibility/interaction not freshly tested | Phase 2 browser acceptance |
| Emergency routing | `02`, `12`, `20`, `42`, `58` | `src/lib/emergencyNavigation.js`, `src/data/emergencyRoutes.js`, `src/components/map/EmergencyModePanel.jsx` | `IMPLEMENTED_VERIFIED` — approved-only routing, rejected normal edges, blocked routes and safe no-route behavior passed | Digital coverage is limited to source-supported routes | Preserve; future safety-authority review |
| Emergency equipment/data | `12`, `20`, `45`, `68` | `src/data/emergencyExits.js`, `emergencyEquipment.js`, `emergencyContacts.js` | `PARTIAL` — static source-aligned modules and emergency tests exist | Verified plotted coverage is incomplete on some floors; no full authorized admin workflow | `BLOCKED` pending safety-authority data |
| Dashboard | `15`, `21`, `22`, `47` | `src/pages/Dashboard.jsx`, `src/components/dashboard/`, `src/services/dashboardService.js`, `src/providers/dashboard/` | `IMPLEMENTED_VERIFIED` locally — lifecycle, priority, deduplication, Manila time, demo isolation and empty states passed | Live content/provider behavior not freshly reverified | Phase 2 live/provider verification |
| Supabase foundation | `03`, `04`, `19`, `31` | `src/lib/supabaseClient.js`, `supabase/migrations/`, `supabase/config.toml` | `IMPLEMENTED_UNVERIFIED` — client/config/migrations exist and deterministic structure tests passed | Linked schema and current provider configuration were not queried in this audit | Phase 2 linked-environment verification |
| Authentication | `05`, `43`, `59` | `src/contexts/AuthContext.jsx`, `src/services/authService.js`, `src/providers/auth/`, `src/pages/Login.jsx` | `IMPLEMENTED_UNVERIFIED` — lifecycle and render tests passed; historical live validation is documented | Live login/refresh/logout not freshly reverified | Phase 2 live auth verification |
| RBAC | `05`, `16`, `43`, `59` | `src/lib/authorization.js`, `src/components/auth/ProtectedRoute.jsx`, `src/App.jsx` | `IMPLEMENTED_UNVERIFIED` — role helpers and route guards passed structural tests | UI guards are not proof of current database authorization | Phase 2 role-boundary verification |
| RLS | `05`, `19`, `42`, `59` | `supabase/migrations/*.sql`, `supabase/tests/*.sql` | `IMPLEMENTED_UNVERIFIED` — policies and transactional tests exist; structural suites passed | Local pgTAP/linked database policies were not executed during Phase 1 | Phase 2 local/linked RLS verification |
| Realtime | `15`, `22`, `47` | `src/services/realtimeService.js`, Dashboard provider, `dashboard_refresh_events` migration/triggers | `IMPLEMENTED_UNVERIFIED` — centralized subscription lifecycle tests passed | Authenticated live delivery and cleanup not freshly reverified | Phase 2 authenticated Realtime verification |
| Admin CMS | `05`, `16`, `45` | `src/pages/admin/AdminOverview.jsx`, `AdminContentPage.jsx`, `src/services/adminService.js` | `IMPLEMENTED_UNVERIFIED` — content validation, route protection, service boundaries and rendering passed | Live CRUD, ownership and RLS were not freshly exercised | Phase 2 live admin acceptance |
| Audit logging | `16`, `48`, `59` | `src/pages/admin/AdminAudit.jsx`, Phase 8B/8C audit triggers and tests | `IMPLEMENTED_UNVERIFIED` — read-only UI and trigger structure tests passed | Current linked audit creation/access was not reverified | Phase 2 audit/RLS verification |
| Personnel | `04`, `14`, `16`, `49` | `src/services/personnelService.js`, Phase 8C.1 schema, Phase 8C.2 WIP UI/service | `PARTIAL` — backend rules and current WIP deterministic tests passed | Official data, approved public fields, live role scope and the WIP lifecycle remain unverified | Phase 2 WIP stabilization; institutional-data phase later |
| Class schedules | `04`, `14`, `16`, `56` | `src/services/scheduleService.js`, Phase 8C.1 schema, Phase 8C.2 WIP | `PARTIAL` — recurrence, exceptions, overlaps and conflict constraints passed deterministic tests | No approved institutional schedule dataset; live database constraints not reverified | Phase 2 WIP/database verification |
| Availability engine | `14`, `20`, `42`, `56` | `src/services/personnelService.js`, `src/services/scheduleService.js` | `IMPLEMENTED_VERIFIED` locally — precedence, exceptions, Manila time and next-availability overlap tests passed | Live public projections and real approved data not reverified | Phase 2 live projection verification |
| Check-in logic | `02`, `05`, `14`, `49` | `personnel_checkins` migration/policies, `personnelService.js`, Phase 8C.2 WIP | `IMPLEMENTED_VERIFIED` locally — only an active check-in produces `CHECKED_IN`; schedule-only cases do not | Role-scoped create/close behavior not freshly tested against linked RLS | Phase 2 live authorization verification |
| Facility information | `13`, `20`, `32` | `src/data/facilities.js`, `src/pages/Facilities.jsx`, `FacilityDetail.jsx` | `PARTIAL` — verified floor assignments, details, search foundation and navigation links exist | Services, public contacts, images and institutional completeness vary | Future approved facility-data phase |
| Operating hours | `13`, `42`, `56` | pending-state handling in facility UI/data | `BLOCKED` — unknown hours are not invented | No authorized hours, exception calendar, or status engine dataset | Institutional-data decision and owner approval |
| Notifications | `15`, `22`, `47` | `notifications` schema/RLS, Dashboard provider, Admin content pages | `IMPLEMENTED_UNVERIFIED` — local lifecycle/provider tests passed | Live audience and permission behavior not freshly reverified; optional push/SMS absent | Phase 2 live in-app verification; delivery channels deferred |
| Events | `15`, `22`, `47` | `events` schema/RLS, `src/pages/Events.jsx`, Dashboard/Admin providers | `IMPLEMENTED_UNVERIFIED` — local lifecycle and rendering evidence passed | Live event CRUD/audience behavior not freshly reverified | Phase 2 live content verification |
| CLARA | `17`, `18`, `20`, `41`, `60` | `src/pages/Clara.jsx` at audit time; since `DEC-UI-003`/`DEC-UI-005` integration, `src/components/clara/*` and `src/services/claraService.js` (global floating assistant; same local matcher) | `PARTIAL` — UI and conservative local facility matcher exist | No server-side model, tool orchestration, role-aware grounding, or provider endpoint; must not be called production AI | `DEFERRED` until internal services and authorization are accepted |
| PWA/offline emergency access | `12`, `24`, `30` | `public/manifest.json` only | `MISSING` — no service worker, cache strategy, or versioned emergency cache was found | Manifest alone can create an unsupported offline claim | Future approved PWA/emergency-cache phase |
| Map administration | `11`, `16`, `45`, `46` | developer verification panel and `src/pages/admin/QRCheckpoints.jsx` | `PARTIAL` — inspection/QR tooling exists | No production floor-plan upload, calibration, geometry editor, map version history or coherent rollback | Future approved map-administration phase |
| Reports/analytics | `23`, `49`, `60` | no dedicated implementation found | `MISSING` | No report workflow, verification queue, privacy model, or analytics dashboard | Future approved reporting phase |
| UI registry compliance | `06`, `07`, `21`, `26`, `55` | registered pages/components under `src/pages/` and `src/components/` | `IMPLEMENTED_VERIFIED` for code structure and automated desktop render under `DEC-UI-002` | Keyboard, screen-reader, contrast, and physical-device matrix remain pending | Approved UI adoption follow-up QA |
| Deployment | `08`, `31`, `52`, `62` | `vite.config.js`, `wrangler.jsonc`, `package.json`, GitHub remotes, Cloudflare production URL | `IMPLEMENTED_UNVERIFIED` — production build passed; configuration exists; production URL returned HTTP 200 during Phase 1 | Current worktree was not deployed; production-browser equivalence was not established; both `origin` and `old-origin` remotes require deliberate release targeting | Phase 2 release verification |
| Testing/QA | `08`, `25`, `55`, `57`, `58`, `73` | `scripts/test-*.mjs`, `supabase/tests/*.sql` | `PARTIAL` — all selected local deterministic non-cloud suites, render, lint, typecheck and build passed in Phase 1 | Local pgTAP, linked-cloud, production browser, responsive and physical-device checks were not run | Phase 2 acceptance baseline |

## Core invariant verification

| Invariant | Status | Phase 1 evidence |
|---|---|---|
| One canonical campus/spatial dataset | `ALIGNED` | 2D and 3D import the same floors, facilities, nodes and edges; shared-transform test passed |
| One A* engine for route consumers | `ALIGNED` | `navigation.js` and `emergencyNavigation.js` call `pathfinding.js`; 2D/3D render the returned route; QR/manual resolve into the same node graph; personnel links enter the normal Map route; CLARA has no independent router |
| Schedule does not mean physical presence | `ALIGNED` | service precedence and UI wording distinguish `SCHEDULED`/`IN_CLASS`/`CONSULTATION`; Phase 8C tests passed |
| Only authorized active check-in may produce `CHECKED_IN` | `ALIGNED_NEEDS_LIVE_AUTHORIZATION_QA` | status engine tests passed; linked RLS authorization was not freshly executed |
| QR/manual are thesis-core indoor positioning | `ALIGNED` | both flows exist and deterministic tests passed; no exact continuous indoor-tracking claim found |
| Emergency uses verified emergency-approved paths only | `ALIGNED` | approved-edge filter, rejected normal edge and no-route tests passed |
| No AI-created evacuation path | `ALIGNED` | no AI emergency generator exists; CLARA links to verified emergency information only |
| Unknown institutional data stays unavailable/pending | `ALIGNED` | normal Dashboard/facility/CLARA states use empty, unavailable or pending wording; demo isolation test passed |
| No generic LMS/ERP expansion | `ALIGNED` | no grades, exams, learning modules, tuition payment, or enrollment subsystem found |
| Future CLARA must use verified internal tools/data | `ALIGNED_AS_DEFERRED` | current code is explicitly a local placeholder; production tool/AI integration remains deferred |

## Phase 8C.2 worktree acceptance

Phase 8C.2 files remain preserved as existing work and received fresh Phase 2 acceptance evidence. Acceptance does not mean the dirty worktree is deployed or that graphical/device QA occurred.

| WIP area | Classification | Evidence / remaining verification |
|---|---|---|
| Personnel management | `ACCEPTED_WITH_ADVISORY` | protected route, editor, list/detail, activation lifecycle, authenticated write, linked RLS, privacy projection, audit, and cleanup passed; approved official fields/data remain pending |
| Courses and sections | `ACCEPTED_WITH_ADVISORY` | CRUD service/forms, department references, authenticated writes, RLS, audit, and cleanup passed; real graphical Admin QA pending |
| Class schedules | `ACCEPTED` | room/professor/section client validation and all three live exclusion constraints passed; live insert/edit/cancel refreshed Dashboard correctly |
| Schedule exceptions | `ACCEPTED_WITH_ADVISORY` | canonical types, linking, live RLS, and audit assertions passed; graphical workflow QA pending |
| Personnel assignments | `ACCEPTED` | stable facility IDs, schedule-derived wording, live status, and next-availability behavior passed |
| Consultation hours | `ACCEPTED_WITH_ADVISORY` | optional facility, recurring windows, linked permissions, and deterministic status-engine checks passed; graphical workflow QA pending |
| Check-in/check-out | `ACCEPTED` | explicit active check-in alone produced `CHECKED_IN`; close restored `SCHEDULED`; RLS, audit, Realtime, and cleanup passed |
| Availability overrides | `ACCEPTED` | `UNAVAILABLE` precedence, role-scoped policies, audit, and safe cleanup passed |
| Audit and Dashboard refresh | `ACCEPTED` | trusted audit triggers and centralized `dashboard_refresh_events` passed live class edit/cancel and personnel check-in transitions |
| Lifecycle and deletion | `ACCEPTED` | UI/services use activation, cancellation, check-out, and end-override actions instead of generic destructive deletion |
| Overall Phase 8C.2 | `ACCEPTED_WITH_ADVISORY` | deterministic, linked PostgreSQL, authenticated Data API, RLS, Realtime, Dashboard, audit, and cleanup evidence passed; files remain uncommitted/not deployment-equivalent and manual device QA is pending |

## Recorded alignment and documentation conflicts

| Document A | Document B | Observed code/evidence | Recommended decision or treatment |
|---|---|---|---|
| `01-project-overview.md`, `09-progress-roadmap.md`, and `28-definition-of-done.md` describe 3D as implemented/completed | Previous version of this registry described 3D as in progress | 3D renderer and shared-data tests pass locally; browser/device QA was not performed | Treat implementation as verified locally and device/browser QA as outstanding; do not merge those claims |
| Original 14 Sep source required strict grayscale | Owner-approved `DEC-UI-002` adopts neutral-dominant CampusNav Ink with controlled green/red/map color | Current UI uses centralized neutral, CampusNav green, emergency red, and controlled category/status colors | Resolved by explicit owner decision; color still cannot be the only signal |
| `17` defines future grounded CLARA integration | `07` registers a current CLARA screen | Current screen is a local facility matcher with no model/tool endpoint | Keep status `PARTIAL`; do not describe the UI as production grounded AI |
| A web manifest and PWA-facing language can imply install/offline capability | `24` and `30` require evidence of a real cache strategy | No service worker or versioned emergency cache exists | Keep offline/PWA status `MISSING` until implemented and tested |
| Previous `09` used historical Phase 1–8C numbering | `DEC-ROADMAP-001` resets active development to canonical alignment Phase 1 | Advanced implementation remains present and must not be discarded | Preserve code as baseline evidence; use the reset roadmap for future work |

## Verification scope for this snapshot

Fresh Phase 1 evidence:
- `test:data`, `test:navigation`, `test:multi-floor`, `test:qr`, `test:emergency`, `test:3d`, `test:dashboard`
- `test:phase8a`, `test:phase8b`, `test:phase8c`, `test:phase8c2`, `test:render`
- `lint`, `typecheck`, and production `build`
- Cloudflare production endpoint HTTP availability (`200`) and local deployment-topology/config inspection

Not freshly verified:
- Docker/local pgTAP `test:rls`
- linked Supabase cloud suites and database advisors
- production login/RLS/Realtime/Admin behavior
- current worktree deployment equivalence
- production-browser, responsive, accessibility, WebGL-device, camera-device and offline behavior

Historical documentation claims are retained as history but are not converted into fresh Phase 1 verification.

## Rule
When this file conflicts with running code, passing tests, or live verification, record the mismatch and apply the authority rules in `00-agent-entrypoint.md`. Never rewrite a safety/business requirement merely to match existing code.
