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
npm run test:phase8a
npm run test:phase8a:cloud
npm run test:phase8a:realtime
npm run test:phase8b
npm run test:phase8c
npm run test:phase8c2
npm run test:phase8c2:cloud
npm run test:rls
npm run test:render
```

## Project structure

- `src/` contains the React application.
- `src/components/` contains reusable interface and map components.
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

During local development, `/admin/qr-checkpoints` provides the developer-only QR generator and printable label view. The route now also requires `SUPER_ADMIN`; it remains disabled in production unless `VITE_ENABLE_MAP_VERIFICATION=true` is explicitly set.

## Production build

```bash
npm run build
```

The static production output is written to `dist/` and can be deployed to any static web host.
