# CampusNav AI

CampusNav AI is a React application for campus navigation and school information at St. Clare College.

## Local development

Requirements:

- Node.js 20 or newer (Node.js 22 LTS is recommended for current Supabase tooling)
- npm

Install dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Available commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
npm run test:data
npm run test:navigation
npm run test:multi-floor
npm run test:qr
npm run test:emergency
npm run test:3d
npm run test:dashboard
npm run test:theme
npm run test:map-experience
npm run test:phase8a
npm run test:phase8a:cloud
npm run test:phase8a:realtime
npm run test:phase8b
npm run test:phase8c
npm run test:phase8c2
npm run test:phase8c2:cloud
npm run test:phase4-fs1a
npm run test:phase4-fs1b
npm run test:phase4-fs2a
npm run test:phase4-fs2b
npm run test:phase4-fs2c
npm run test:phase4-fs3a
npm run test:phase4-fs3b
npm run test:phase4-fs3c
npm run test:rls
npm run test:render
```

## Project structure

- `src/` contains the React application.
- `src/components/` contains reusable interface and map components.
- `src/components/layout/` holds the frozen UI shell (`DEC-UI-005`): `AppShell`, the left sidebar and mobile drawer, and the phone context bar (inside `/admin/*` an administrator gets the single Admin navigation from `src/components/admin/AdminNavigation.jsx` instead, never both); `src/components/clara/` holds the floating CLARA assistant; `src/lib/theme.js` and `src/contexts/ThemeContext.jsx` implement the Light/Dark/System theme, whose semantic color tokens live in `src/index.css` and `tailwind.config.js` (`npm run test:theme` rejects hex color classes in components).
- `src/data/facilities.js` contains verified facility-to-floor assignments and pending-verification fields.
- `src/data/floors.js` contains editable floor and room geometry.
- `src/data/additionalFloorMaps.js` contains source-aligned GF, 2F, 4F, and 5F polygons, hallways, doors, and stair areas.
- `src/data/additionalFloorGraph.js` generates their room-entrance and hallway graph from that editable geometry.
- `src/data/mapNodes.js` and `src/data/mapEdges.js` define the walkable indoor navigation graph.
- `src/data/stairs.js` defines source-aligned stair continuity and adjacent-floor transition costs.
- `src/data/qrCheckpoints.js` links approved QR checkpoint IDs to facility entrance nodes.
- `src/data/map3dConfig.js` contains schematic 3D heights and floor-spacing configuration; all vertical dimensions remain `ESTIMATED`.
- `src/components/map3d/` lazily renders the existing floor polygons, graph routes, QR positions, and emergency data with React Three Fiber.
- `src/services/dashboardService.js` is the provider-neutral Dashboard boundary for summaries, alerts, schedules, availability, advisories, events, announcements, and navigation notices.
- `src/providers/` contains the local and optional Supabase auth/Dashboard providers.
- `supabase/migrations/` contains reproducible PostgreSQL, RLS, RBAC, and Realtime publication changes.
- `src/lib/campusTime.js` centralizes Dashboard date and time calculations in `Asia/Manila`.
- `vite.config.js` contains the Vite configuration.
- `index.html` contains first-party application metadata.

## Indoor navigation prototype

The functional route demonstration now covers GF through 5F. Route selection uses the existing A* graph search over source-aligned room entrances, hallways, and a source-supported east stair stack. Only adjacent floors are connected. Accessibility remains pending verification and no elevator route is claimed.

All five floors use the supplied St. Clare College Emergency Evacuation plan as their spatial source. The existing calibrated Third Floor data remains intact; GF, 2F, 4F, and 5F use editable source-aligned polygons and a grayscale developer reference overlay. Dimensions remain estimated because the source does not provide a measured architectural scale. Same-floor distances are schematic map units, while cross-floor results are explicitly labeled as schematic route cost and include a configurable stair-transition weight—never verified meters.

The Fifth Floor construction polygons are marked `UNDER_CONSTRUCTION` and `navigable: false`. They have no entrance nodes and graph validation rejects any node or edge that enters them.

Multi-floor routes can be viewed one floor at a time using the route-floor selector. The map renders only the selected floor segment while pathfinding operates on the complete GF–5F graph.

During local development, open `/map?verify=1` to use the developer-only calibration and graph-verification panel. Production builds hide this panel unless `VITE_ENABLE_MAP_VERIFICATION=true` is explicitly set.

## Optional 3D map

One map renderer serves every page: `src/components/map/CampusMapCanvas.jsx` draws the canonical floor maps, facilities, graph, QR checkpoints, and emergency records with `IndoorMap2D` (2D) or the lazily loaded `Campus3D` (3D). Navigate uses it with the full route workflow; Home ("Campus at a glance") and Dashboard ("Campus Overview") use the `CampusMapPreview` variant (floor selector, 2D/3D, zoom, reset, "Open full map"). The Home hero also reuses Navigate's destination search (`DestinationSearch`); choosing a destination opens Navigate with `?facility=`. The 2D map supports drag/pinch pan and wheel, pinch, button, or keyboard zoom; Navigate also offers an immersive fullscreen view that keeps the same mounted map and navigation state (browser Fullscreen API, or a full-viewport overlay where it is unavailable). `npm run test:map-experience` checks the shared-renderer and single-dataset rules.

The Navigate page defaults to the 2D map and offers an optional lazy-loaded 3D view. Exploded and stacked modes use the same floor polygons and the same A* route node sequence as 2D; the central `mapToWorld()` transform maps digital-map `x, y` to Three.js `x, elevation, z`. The 3D renderer supports floor isolation, orbit/pan/zoom controls, facility focus, QR/current and destination markers, multi-floor stair-route visualization, reduced motion, and a one-click return to 2D. Unsupported or failed WebGL initialization returns to 2D without resetting navigation state.

## Dashboard

Open `/dashboard` for the lightweight campus information dashboard. Normal mode does not invent official alerts, schedules, personnel presence, operating hours, or events; unavailable sources use explicit empty and pending-verification states. Existing mapped construction restrictions are surfaced through the same CampusNav facility source.

Use `/dashboard?demo=1` for isolated generic sample records that are visibly marked as non-official demo data. Use `/dashboard?verify=1` to display source IDs, verification states, data status, and lifecycle dates. Demo mode remains isolated from the optional cloud provider. Class schedules and personnel availability intentionally remain unavailable until a later authorized-data phase.

## Supabase backend foundation (Phase 8A)

CampusNav uses a provider boundary, so maps, A* routing, QR positioning, 3D navigation, and Emergency Mode remain local and usable without cloud credentials. The Dashboard reports one of three states:

- **Local Prototype Mode** when the two frontend environment values are absent.
- **Supabase Connected** after published Dashboard records load successfully.
- **Supabase Offline / Fallback** when a configured backend cannot be reached.

Only a confirmed subscription adds the **Realtime** label. The Supabase client is dynamically imported so it remains separate from the initial application chunk.

### Frontend environment

Copy `.env.example` to `.env.local` and provide the frontend-safe project values:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-legacy-anon-key
```

Never add a service-role or secret key to a `VITE_*` variable. Vite values are browser-visible. Real environment files are ignored; `.env.example` is intentionally tracked.

### Database migrations

The repository pins the CLI command examples for reproducibility. A local Supabase stack requires Docker:

```bash
npx --yes supabase@2.79.0 start
npx --yes supabase@2.79.0 db reset
npm run test:rls
```

To apply the same version-controlled migration to a linked development project:

```bash
npx --yes supabase@2.79.0 login
npx --yes supabase@2.79.0 link --project-ref YOUR_PROJECT_REF
npx --yes supabase@2.79.0 db push
```

Review the target project before `db push`. The migration creates no official school announcements, department records, schedules, or personnel records. `supabase/seed.sql` is intentionally empty.

### Authentication and roles

The `/login` route supports Supabase email/password sign-in, persisted sessions, auth-state changes, and sign-out. Public navigation never requires authentication. Create the first development user under **Authentication → Users** in the Supabase Dashboard, then bootstrap the first role from the SQL editor using that user's UUID:

```sql
insert into public.user_roles (user_id, role_id, assigned_by)
select
  'USER_UUID_HERE'::uuid,
  id,
  'USER_UUID_HERE'::uuid
from public.roles
where code = 'SUPER_ADMIN';
```

Available normalized roles are `GUEST`, `STUDENT`, `PARENT`, `FACULTY`, `STAFF`, `FACILITY_MANAGER`, `DEPARTMENT_ADMIN`, and `SUPER_ADMIN`. React role checks only shape the interface. PostgreSQL RLS is the actual authorization boundary. Department admins are department-scoped; facility managers are limited to department-scoped facility advisories; only super admins can manage emergency or suspension notifications.

### Realtime development check

Use an existing development Auth user UUID for `created_by`, then insert a clearly non-official record from the SQL editor while `/dashboard` is open:

```sql
insert into public.announcements (
  title, message, lifecycle, is_public, published_at, effective_at,
  source_type, source_id, verification_status, data_status, created_by
) values (
  'Development Realtime Test',
  'DEMO / DEVELOPMENT / NOT OFFICIAL',
  'PUBLISHED', true, now(), now(),
  'DEVELOPMENT_TEST', 'PHASE8A-REALTIME-TEST', 'DEMO_ONLY', 'DEMO',
  'USER_UUID_HERE'::uuid
);
```

The Dashboard should refresh without a page reload after the Realtime status appears. Update the message to test an update, then remove the fixture:

```sql
delete from public.announcements
where source_type = 'DEVELOPMENT_TEST' and source_id = 'PHASE8A-REALTIME-TEST';
```

Subscriptions cover `announcements`, `notifications`, `facility_advisories`, `events`, and the non-sensitive `dashboard_refresh_events` signal; they are removed on unmount and re-created after auth-provider identity changes.

### Security validation

`npm run test:phase8a` validates client safety, auth/provider contracts, role helpers, fallback behavior, subscription deduplication/cleanup, and migration structure without requiring a database. `npm run test:rls` executes `supabase/tests/phase_8a_rls_test.sql` against a running local Supabase database. The pgTAP suite verifies active published reads, hidden drafts, rejected anonymous/unauthorized writes, unchanged records after unauthorized updates, department-scoped writes, super-admin emergency access, profile creation, and Realtime publication membership. Frontend mocks are not treated as proof that PostgreSQL policies execute correctly.

For a linked cloud development project, run the same transactional pgTAP suite directly against cloud PostgreSQL:

```bash
npx --yes supabase@2.79.0 db query -f supabase/tests/phase_8a_rls_test.sql --linked --output table
npm run test:phase8a:cloud
```

The cloud integration script reads the ignored `.env.local`, verifies live Data API access through the publishable key, exercises the Dashboard Supabase provider without fabricated normal-mode data, and confirms anonymous administrative writes receive PostgreSQL `42501` errors.

To verify the first non-personal development Auth user without saving credentials in the repository, provide the credentials only as temporary process environment variables and run:

```bash
npm run test:phase8a:auth
```

The live Auth check requires `CAMPUSNAV_TEST_EMAIL` and `CAMPUSNAV_TEST_PASSWORD`. It verifies safe invalid-login errors, sign-in, profile and `SUPER_ADMIN` role loading, persisted session restoration, token refresh, authenticated RLS insert/update/delete with a narrowly identified development fixture, cleanup, and sign-out. Do not place these credentials in `.env.local` or another tracked file.

The deterministic Realtime verification uses two terminals. Start the subscriber first, apply only the marked fixtures, update the announcement, then clean up:

```bash
# Terminal 1
npm run test:phase8a:realtime

# Terminal 2, after CAMPUSNAV_REALTIME_READY
npx --yes supabase@2.79.0 db query -f supabase/tests/phase_8a_realtime_setup.sql --linked --output table
npx --yes supabase@2.79.0 db query -f supabase/tests/phase_8a_realtime_update.sql --linked --output table
npx --yes supabase@2.79.0 db query -f supabase/tests/phase_8a_realtime_cleanup.sql --linked --output table
```

The subscriber uses the same four-channel Dashboard service, expects an announcement insert/update and event insert, verifies every channel is removed, and exits. The fixture SQL uses only `DEMO / DEVELOPMENT / NOT OFFICIAL` records and fixed identifiers so cleanup is narrow and repeatable.

## Facility operational foundation (Phase 4-FS-1A)

The FS-1A forward migration adds the Supabase operational overlay for facility profiles, services, approved aliases, and configured facility-service mappings. Every facility reference uses the stable IDs from `src/data/facilities.js`; the migration adds no competing facility, floor, geometry, node, edge, QR, emergency, or routing truth and seeds no institutional records.

All four tables preserve lifecycle, publication windows, verification status, data status, source provenance, freshness, and actor timestamps. Public access is limited to published/effective records through RLS-backed security-invoker views. `SUPER_ADMIN` is the only initial write boundary, and trusted triggers append safe metadata to the existing immutable audit stream. Hours/status, Admin UI, public Facilities/search UI, media, Dashboard/Realtime, and provider-neutral `FacilityService` implementation remain outside FS-1A.

Run the deterministic schema/scope check with:

```bash
npm run test:phase4-fs1a
```

With the local Docker-based Supabase stack available, `npm run test:rls` also runs `supabase/tests/phase_4_fs1a_facility_operational_test.sql`. That transactional pgTAP suite verifies empty-by-default schema creation, RLS/public-draft isolation, unauthorized-write rejection, permitted `SUPER_ADMIN` writes, provenance preservation, trusted audit creation, and exact fixture cleanup using only `DEVELOPMENT / DEMO / NOT OFFICIAL` records.

## Facility hours and exceptions foundation (Phase 4-FS-2A)

The FS-2A forward migration adds recurring weekly facility hours and dated replacement exceptions keyed to accepted operational facility IDs. Campus wall-clock values use `time without time zone`, exception days use `date`, and lifecycle/effectivity/audit instants use `timestamptz`; later status evaluation remains fixed to `Asia/Manila` by the canonical contract.

Active scheduled/published rows use database exclusion constraints to reject duplicate or overlapping intervals and closed-marker conflicts while preserving multiple non-overlapping intervals and overnight intervals whose end time is less than or equal to their start time. Public access uses narrow RLS-backed security-invoker projections. The existing `facility_advisories` table remains the temporary-closure source, and its status projection excludes `SERVICE_INTERRUPTION` from facility-wide closure data.

FS-2A contains no official operating-hour records, status computation, provider read path, Admin/public UI, Realtime change, or spatial/navigation/routing data. Run the deterministic schema/scope check with:

```bash
npm run test:phase4-fs2a
```

When a local Docker-based Supabase stack is available, `npm run test:rls` also discovers `supabase/tests/phase_4_fs2a_facility_hours_exceptions_test.sql`. Its 89 transactional pgTAP assertions use only rollback-scoped `DEVELOPMENT / DEMO / NOT OFFICIAL` fixtures.

## Facility hours aggregate read (Phase 4-FS-2B1)

The provider-neutral `getFacilityHours(facilityId, dateRange?)` service returns the canonical local facility plus currently public/effective weekly hours, dated exceptions, and facility-wide `TEMPORARY_CLOSURE` source advisories. The optional range is `null`/omitted or exactly `{ startDate, endDate }` with inclusive strict `YYYY-MM-DD` campus dates. Exception dates are filtered inclusively, while closure overlap uses explicit half-open `Asia/Manila` day boundaries. Weekly recurrence records remain complete for the later status engine.

Local mode returns empty collections and does not invent operating data. Supabase mode reads only `public_facility_hours`, `public_facility_hour_exceptions`, and `public_facility_status_advisories` through the existing browser-safe client. Every source row preserves independent lifecycle/provenance/demo metadata. FS-2B1 does not expand recurrence, interpret overnight carry, apply exception/closure precedence, or compute open/closed status.

Run the deterministic contract/provider/security regression with:

```bash
npm run test:phase4-fs2b
```

## Pure facility status evaluator (Phase 4-FS-2C1)

`src/services/facilityStatusEvaluator.js` deterministically evaluates already-normalized FS-2B weekly hours, dated exceptions, and temporary-closure advisories in `Asia/Manila`. Callers must supply an explicit absolute RFC3339 `evaluatedAt` string with `Z` or a numeric offset; the evaluator has no global clock, Supabase/provider access, UI dependency, or routing side effect.

The result contains the canonical operational status, normalized evaluation timestamp, timezone, next applicable transition, independently provenanced safe controlling records, and demo flag. Operational `CLOSED` or `TEMPORARILY_UNAVAILABLE` never changes the canonical navigation or emergency graph. The pure evaluator itself has no provider or global-clock dependency.

Run the deterministic evaluator regression with:

```bash
npm run test:phase4-fs2c
```

## Facility status service integration (Phase 4-FS-2C2)

The public asynchronous `getFacilityStatus(facilityId, dateTime?)` method validates canonical local facility identity first. When `dateTime` is omitted it uses the service's injected clock; explicit values must be absolute RFC3339 strings with `Z` or a numeric offset. Malformed explicit values return non-retryable `FACILITY_INVALID_DATE_TIME` without provider access.

Status orchestration requests only the previous/current Manila dates through the accepted `getFacilityHours` method, then passes normalized source records to the pure evaluator. Empty sources return `UNKNOWN` with `UNAVAILABLE`; configured but non-applicable sources return `UNKNOWN` with `CONFIGURED`; provider failures remain retryable `PROVIDER_UNAVAILABLE`. Providers expose no separate status method or query, and the status result cannot modify navigation or Emergency data.

## Facility Admin mutation service foundation (Phase 4-FS-3A)

`src/services/facilityAdminService.js` supplies the browser-safe, RLS-backed mutation boundary for facility operational profiles, services, aliases, mappings, weekly hours, and dated exceptions. It is composed into the existing Admin service but adds no route or editor. Canonical facility IDs remain local, public projection views remain read-only, service and mapping identities are immutable after creation, and actor/audit fields are never accepted from clients.

The service uses strict payload allowlists, conservative draft/pending defaults, explicit publish/expire actions, provenance/effectivity validation, `updated_at` stale-write checks, dependency-aware hard-delete guards, and sanitized domain errors. Existing facility-advisory CRUD is reused unchanged. Database RLS, constraints, foreign keys, and trusted audit triggers remain authoritative; FS-3A adds no migration or official data.

Run the deterministic validation, mocked-mutation, security-boundary, and regression contract suite with:

```bash
npm run test:phase4-fs3a
```

## Facility profile and service catalog Admin UI (Phase 4-FS-3B)

Authenticated `SUPER_ADMIN` users can manage facility operational profiles at `/admin/facilities` and service catalog records at `/admin/services`. The facility list always starts from the canonical local facility registry and shows whether an overlay exists; no spatial identity, floor, geometry, graph, QR, routing, or emergency data is editable. Service codes are required lowercase kebab-case on creation and remain immutable afterward.

Both workflows call the existing `facilityAdminService` through `AdminService`. New records default to draft, non-public, and pending verification. Save never publishes: Publish and Expire are explicit actions, every mutation uses the original `updated_at` stale-write token, hard deletion is confirmed and service-guarded, and UI messages expose only normalized errors. Existing database triggers remain the audit writer.

Run the deterministic UI/service-boundary checks with:

```bash
npm run test:phase4-fs3b
```

Manual QA checklist (prepared, not executed):

- sign in as an authenticated `SUPER_ADMIN`; open both routes and verify Facilities/Services navigation
- verify a signed-in non-superadmin receives Access Denied for both routes
- create and edit a facility profile; confirm facility identity is locked and no spatial fields exist
- publish and expire a profile through separate actions; confirm Save alone leaves a new profile as draft/non-public
- create and edit a service; verify lowercase kebab validation, immutable code, publish, and expire
- provoke stale-record and duplicate-service-code responses; confirm unsaved values remain and no raw backend detail appears
- confirm disposable-record deletion and referenced/non-disposable delete rejection; prefer Expire where directed
- complete both workflows by keyboard only, including editor close and delete confirmation
- verify table/card/editor usability at representative desktop, tablet, and mobile viewport sizes

## Service alias and facility-service mapping Admin UI (Phase 4-FS-3C)

Authenticated `SUPER_ADMIN` users can manage service aliases at `/admin/service-aliases` and configured facility-service pairs at `/admin/facility-service-mappings`. Both workflows reuse the existing Admin mutation service and reference loader. Alias service identity and mapping facility/service identities are selected at creation and remain immutable afterward. Mapping choices use canonical local facilities that already have operational profiles; `recommendation_rank` defaults to 100 and remains stored administrator data, not an algorithm.

Lists support search and responsive table/card layouts. Editors preserve draft/non-public/pending defaults, explicit Publish and Expire actions, source/provenance and demo-state visibility, original `updated_at` stale protection with explicit reload, and confirmed dependency-guarded deletion. Duplicate aliases/mappings and the existing stale, permission, session, network, and backend conditions render normalized user-safe messages. Components perform no direct Supabase or audit writes.

Run the deterministic UI/service-boundary and Vite-render checks with:

```bash
npm run test:phase4-fs3c
```

Live authenticated mutation and official institutional alias/mapping records are not part of local FS-3C evidence. No schema, migration, provider, public Facilities/search/recommendation, spatial/navigation, or FS-4 behavior is added.

## Weekly hours and dated exceptions Admin UI (final unnumbered Phase 4-FS-3 implementation capability)

Authenticated `SUPER_ADMIN` users can manage recurring facility operating hours at `/admin/facility-hours` and campus-date replacement schedules at `/admin/facility-hour-exceptions`. Both routes use only canonical facilities with existing operational profiles and call the accepted hours/exception methods through `AdminService`; components perform no direct Supabase or audit writes.

The schedule editor supports explicit split and overnight intervals, closed-all-day markers, strict Manila `YYYY-MM-DD` exception dates, separate Save/Publish/Expire behavior, full verification/provenance controls, original-`updated_at` stale protection, guarded deletion, and normalized overlap/closed-marker errors. It edits source records only: facility status remains computed by FS-2, and temporary closures remain in the existing Facility Advisories workflow.

Run the targeted deterministic UI/service-boundary and Vite-render checks with:

```bash
npm run test:phase4-fs3-hours
```

No official operating hours are seeded or inferred. Live authenticated Supabase mutation remains outside the local evidence; missing institutional schedules continue to produce unavailable/pending public states.

**Overall Phase 4-FS-3 status:** `COMPLETE — ACCEPTED_WITH_ADVISORY` as of the 6 October 2026 final documentation reconciliation. Acceptance covers the Admin mutation/service foundation, operational profiles, service catalog, aliases, facility-service mappings, weekly hours, dated exceptions, intentional reuse of Facility Advisories, and the single `SUPER_ADMIN` Admin shell. It retains the documented official-data, live-mutation, browser/device, screen-reader, performance, role-delegation, deployment-equivalence, legacy-advisory-concurrency, and dependency advisories.

## Public Facility Detail composition (first Phase 4-FS-4 slice)

`/facilities/:id` now keeps the canonical local facility identity and Navigate handoff while composing the accepted public operational overlay through `getFacilityDetail(facilityId, dateTime?)`. The aggregate returns independently safe profile, configured-service, hours/exception, and FS-2 status sections. One hours-provider read supplies both the visible schedule and the existing pure status evaluator, so Facility Detail does not duplicate the hours request or status logic.

The page labels demo, pending, unavailable, and provider-failure states; missing sections do not erase canonical facility/spatial information or unrelated successful sections. Weekly, split, overnight, closed-all-day, and applicable dated-exception sources are shown without inventing typical hours. Operational `CLOSED` and `TEMPORARILY_UNAVAILABLE` do not alter canonical navigability.

Run the targeted deterministic contract and rendering checks with:

```bash
npm run test:phase4-fs4-detail
```

This first slice is `IMPLEMENTED_VERIFIED / OWNER REVIEW PENDING`; overall FS-4 remains `IN_PROGRESS`. Directory/card enrichment, public search, service/alias resolution, recommendations, GlobalSearch/DestinationSearch, media, Dashboard/Realtime, and later FS-4 work remain unstarted. No schema, migration, remote Supabase mutation, dependency, or official institutional data was added.

## Admin CMS foundation (Phase 8B.1)

The protected `/admin` area is available only to authenticated `SUPER_ADMIN` accounts. It provides live Supabase counts plus content management for announcements, events, facility advisories, and notifications. Each list supports title search, lifecycle and priority filters, sorting, explicit draft/schedule/publish actions, cancellation or expiration, and confirmed deletion. Facility links always use the stable IDs from `src/data/facilities.js`; no second facility namespace is created.

The generic editors store plain text, validate time windows and supported enum values before submitting, and keep an in-progress browser-session draft if authentication is interrupted. Frontend authorization is only a usability layer: the Phase 8A PostgreSQL RLS policies remain the write boundary. Draft, scheduled, cancelled, future-effective, and expired records remain unavailable to public Dashboard reads.

The Phase 8B.1 migration adds a read-only Admin audit view at `/admin/audit`. Content-table triggers create narrowly scoped audit rows; browser clients cannot insert audit history directly, and only `SUPER_ADMIN` can read it. Audit metadata excludes content bodies and credentials.

Run the local structural and regression checks with:

```bash
npm run test:phase8b
npm run test:render
npm run test:dashboard
npm run test:phase8a
npm run test:rls
```

For the live cloud CMS/Realtime check, provide `CAMPUSNAV_TEST_EMAIL` and `CAMPUSNAV_TEST_PASSWORD` only through the process environment or the ignored, temporary `.env.phase8a.session` file, then run:

```bash
npm run test:phase8b:cloud
```

The script creates uniquely identified `DEVELOPMENT / DEMO / NOT OFFICIAL` fixtures, verifies all four CMS CRUD paths, public draft isolation, audience links, the existing Dashboard provider, announcement and event Realtime delivery, trusted audit creation, anonymous write rejection, and channel cleanup. It removes every content fixture in a `finally` cleanup. Delete `.env.phase8a.session` immediately after the live check.

## Academic and personnel data engine (Phase 8C.1)

The Phase 8C.1 migration adds `personnel`, `courses`, `academic_sections`, `class_schedules`, `schedule_exceptions`, `personnel_facility_assignments`, `personnel_consultation_hours`, `personnel_checkins`, and `personnel_availability_overrides`. Facility references use only stable IDs from `src/data/facilities.js`; the database does not introduce a competing facility namespace. The migration contains no official schedule or personnel seed records.

Public clients receive only approved, verified fields through security-invoker views backed by RLS. Raw employee references, availability reasons, source metadata, and creator user IDs are not part of those views. `SUPER_ADMIN` can manage every record; `DEPARTMENT_ADMIN` is constrained to its assigned department. A linked faculty/staff account may submit only its own private, pending availability override and may close its own trusted check-in. It cannot create a check-in or edit class schedules. Account linkage is explicit through the guarded `link_personnel_account` RPC and is never inferred from a profile, display name, or email address.

The central schedule service implements Manila-time recurrence, cancellations, rescheduling, room/professor/time changes, room and professor lookups, and Dashboard Today’s Classes data. The personnel service implements search, current status, merged schedules, next availability, and facility-personnel lookups. Status precedence is fixed as:

```text
UNAVAILABLE > CHECKED_IN > IN_CLASS > CONSULTATION > SCHEDULED > NO_ACTIVE_SCHEDULE
```

A class, consultation, or facility assignment is schedule-derived information only. It never becomes `CHECKED_IN`; only an active trusted `personnel_checkins` record can indicate physical presence. Office operating status is not inferred from an assignment or check-in.

Schedule/personnel table triggers write a minimal `ACADEMIC` or `PERSONNEL` refresh signal to `dashboard_refresh_events`. Realtime clients subscribe to that signal rather than raw check-in or override tables, then reload the authorized public views. This avoids broadcasting sensitive row payloads.

Run the deterministic engine, migration-structure, status-precedence, exception, Manila-time, and overlap regressions with:

```bash
npm run test:phase8c
```

`supabase/tests/phase_8c1_academic_personnel_test.sql` adds transactional pgTAP coverage for the live RLS policies. It runs through `npm run test:rls` when the local Docker-based Supabase stack is available. For the live Data API and Realtime verification, place only the temporary development account credentials in the ignored `.env.phase8a.session` file or process environment, run the test, and immediately delete the file:

```bash
npm run test:phase8c:cloud
```

The cloud test uses uniquely identified `DEMO / DEVELOPMENT / NOT OFFICIAL` records, verifies class Dashboard data, public-field privacy, anonymous write rejection, `SCHEDULED → CHECKED_IN → SCHEDULED`, `UNAVAILABLE` precedence, authenticated Realtime refresh, the 2:30–4:00 PM availability window and its overlapping-assignment counterexample, trusted audits, cleanup, and sign-out. It does not store or print the password.

## Personnel and academic Admin management (Phase 8C.2)

Authorized `SUPER_ADMIN` and department-scoped `DEPARTMENT_ADMIN` accounts can manage the existing Phase 8C.1 records at `/admin/personnel`, `/admin/courses`, `/admin/sections`, `/admin/class-schedules`, `/admin/schedule-exceptions`, `/admin/personnel-assignments`, `/admin/consultation-hours`, `/admin/check-ins`, and `/admin/personnel-availability`. The pages reuse the existing services, role-scoped RLS, audit triggers, stable facility IDs, and the non-sensitive Dashboard Realtime signal.

Class schedule forms detect overlapping room, professor, and section assignments before saving. PostgreSQL exclusion constraints enforce the same rule authoritatively. Records with history are deactivated, cancelled, checked out, or ended instead of being destructively deleted. Consultation hours may omit a facility. Only an active authorized check-in produces `CHECKED_IN`; a class, assignment, or consultation remains schedule-derived information.

Run the deterministic Phase 8C.2 UI/service/migration checks with:

```bash
npm run test:phase8c2
```

The transactional linked-database suite validates the migration, schedule conflicts, role boundaries, audit entries, and Dashboard refresh signals without leaving fixtures:

```bash
npx --yes supabase@2.79.0 db query --linked --file supabase/tests/phase_8c2_admin_management_test.sql --output table
```

With the existing temporary development account credentials supplied only through process environment variables or the ignored `.env.phase8a.session`, `npm run test:phase8c2:cloud` additionally verifies authenticated Data API writes and the Dashboard class insert/edit/cancel and personnel check-in/check-out Realtime transitions. Delete the temporary session file immediately after the run.

## Emergency Mode

Open `/map?mode=emergency` to use the separate emergency overlay. Emergency routing is restricted to edges explicitly marked `emergencyApproved: true` with `VERIFIED` or `SOURCE_ALIGNED` status. It never falls back to the normal navigation graph. If a complete source-approved digital path is unavailable, the interface instructs users to follow posted signage and authorized emergency personnel.

Emergency exits, equipment, approved paths, contacts, and pending items live in separate static modules under `src/data/`. This keeps the reference data deterministic and ready for a future versioned offline cache without introducing a service worker in this phase. The interface labels bundled emergency information as Offline Mode only after the browser reports that it is offline, and it does not claim live status.

The supplied evacuation plan visibly supports emergency exits and equipment on GF and 3F. No plotted exits, equipment, or approved path arrows are claimed for 2F, 4F, or 5F; those floors retain the exact no-verified-route safety fallback pending source or administrator verification. Cross-floor stair transitions are not emergency-approved yet.

Use `/map?mode=emergency&verify=1` during local development to inspect emergency exits, equipment, approved edges, route IDs, verification status, per-floor counts, pending data, disconnected exits, and emergency graph validation.

## QR checkpoint positioning

On `/map`, camera access starts only after the user selects **Scan QR**. Checkpoint frames are processed locally with `@zxing/browser`; they are not recorded, stored, or uploaded. A manual current-location selector remains available when camera access is denied or unavailable.

Checkpoint QR payloads contain only `CAMPUSNAV:CHECKPOINT:<CHECKPOINT_ID>`. The initial Third Floor checkpoints resolve to the Library west entrance, Computer Laboratory west entrance, and Virtual Laboratory entrance nodes. Invalid, unknown, inactive, or incorrectly linked checkpoints do not change the current location.

The scanner UI is component-lazy-loaded, and `@zxing/browser` is dynamically imported only after the scanner opens. Application pages and the QR admin route are route-level code-split so admin and optional page code are not part of the initial shell bundle.

During local development, `/admin/qr-checkpoints` provides the developer-only QR generator and printable label view. The route requires a signed-in `SUPER_ADMIN` (the page states this; it no longer says authentication is pending); it remains disabled in production unless `VITE_ENABLE_MAP_VERIFICATION=true` is explicitly set.

## Production build

```bash
npm run build
```

The static production output is written to `dist/` and can be deployed to any static web host.
