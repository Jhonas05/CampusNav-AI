import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { fileURLToPath, URL } from "node:url"
import { facilities } from "../src/data/facilities.js"

const migrationPath = fileURLToPath(new URL(
  "../supabase/migrations/20260928144215_phase_4_fs2a_facility_hours_exceptions_foundation.sql",
  import.meta.url,
))
const rlsTestPath = fileURLToPath(new URL(
  "../supabase/tests/phase_4_fs2a_facility_hours_exceptions_test.sql",
  import.meta.url,
))

const [migration, rlsTest] = await Promise.all([
  readFile(migrationPath, "utf8"),
  readFile(rlsTestPath, "utf8"),
])
const migrationSql = migration.replace(/^\s*--.*$/gm, "")

for (const table of ["facility_hours", "facility_hour_exceptions"]) {
  assert.match(migration, new RegExp(`create table public\\.${table}\\s*\\(`, "i"), `${table} exists`)
  assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, "i"), `${table} enables RLS`)
  assert.match(migration, new RegExp(`create policy ${table}_read_published`, "i"), `${table} has a public read policy`)
  assert.match(migration, new RegExp(`create policy ${table}_read_super_admin`, "i"), `${table} has a SUPER_ADMIN read policy`)
  for (const operation of ["insert", "update", "delete"]) {
    assert.match(migration, new RegExp(`create policy ${table}_${operation}_super_admin`, "i"), `${table} has a SUPER_ADMIN ${operation} policy`)
  }
  assert.match(
    migration,
    new RegExp(`create policy ${table}_update_super_admin[\\s\\S]*?for update[\\s\\S]*?using \\([\\s\\S]*?with check \\(`, "i"),
    `${table} update policy has USING and WITH CHECK`,
  )
  assert.match(migration, new RegExp(`create trigger ${table}_touch_updated_at`, "i"), `${table} has an update-attribution trigger`)
  assert.match(migration, new RegExp(`create trigger ${table}_record_audit`, "i"), `${table} has a trusted audit trigger`)
}

for (const view of [
  "public_facility_hours",
  "public_facility_hour_exceptions",
  "public_facility_status_advisories",
]) {
  assert.match(
    migration,
    new RegExp(`create view public\\.${view}[\\s\\S]*?security_invoker\\s*=\\s*true`, "i"),
    `${view} is security-invoker`,
  )
  assert.match(
    migration,
    new RegExp(`create view public\\.${view}[\\s\\S]*?security_barrier\\s*=\\s*true`, "i"),
    `${view} is a security barrier`,
  )
}

assert.match(migration, /day_of_week smallint not null/i)
assert.match(migration, /exception_date date not null/i)
assert.equal((migration.match(/start_time time without time zone/g) ?? []).length, 2, "both start_time columns use campus wall-clock time")
assert.equal((migration.match(/end_time time without time zone/g) ?? []).length, 2, "both end_time columns use campus wall-clock time")
assert.match(migration, /published_at timestamptz/g)
assert.match(migration, /effective_at timestamptz/g)
assert.match(migration, /expires_at timestamptz/g)
assert.match(migration, /facility_hours_day_of_week_range check \(day_of_week between 0 and 6\)/i)
assert.equal((migration.match(/interval_shape check/g) ?? []).length, 2, "closed/open row shapes are constrained")
assert.equal((migration.match(/active_schedule_exclusion exclude using gist/g) ?? []).length, 2, "active duplicates and overlaps use database exclusion constraints")
assert.match(migration, /when end_time <= start_time then extract\(epoch from end_time\) \+ 86400/i)
assert.doesNotMatch(migration, /check\s*\(\s*end_time\s*>\s*start_time/i, "overnight intervals remain legal")
assert.match(migration, /references public\.facility_operational_profiles\(facility_id\)/gi)

for (const suffix of [
  "effective_range",
  "published_at_check",
  "demo_provenance_check",
  "active_provenance_check",
  "verified_at_check",
]) {
  assert.equal((migration.match(new RegExp(suffix, "g")) ?? []).length, 2, `${suffix} exists for both tables`)
}

for (const index of [
  "facility_hours_source_unique_idx",
  "facility_hours_facility_day_idx",
  "facility_hours_public_idx",
  "facility_hours_created_by_idx",
  "facility_hours_updated_by_idx",
  "facility_hour_exceptions_source_unique_idx",
  "facility_hour_exceptions_facility_date_idx",
  "facility_hour_exceptions_public_idx",
  "facility_hour_exceptions_created_by_idx",
  "facility_hour_exceptions_updated_by_idx",
]) {
  assert.match(migration, new RegExp(`create (?:unique )?index ${index}`, "i"), `${index} exists`)
}

assert.match(migration, /grant select \([\s\S]*?\) on public\.facility_hours to anon, authenticated/i)
assert.match(migration, /grant select \([\s\S]*?\) on public\.facility_hour_exceptions to anon, authenticated/i)
assert.match(migration, /grant insert \([\s\S]*?\) on public\.facility_hours to authenticated/i)
assert.match(migration, /grant update \([\s\S]*?\) on public\.facility_hour_exceptions to authenticated/i)
assert.match(migration, /grant delete on[\s\S]*?public\.facility_hours,[\s\S]*?public\.facility_hour_exceptions[\s\S]*?to authenticated/i)
assert.match(migration, /grant usage, select on sequence[\s\S]*?public\.facility_hours_id_seq,[\s\S]*?public\.facility_hour_exceptions_id_seq[\s\S]*?to authenticated/i)
assert.match(migration, /private\.has_any_role\(array\['SUPER_ADMIN'\]::public\.app_role\[\]\)/i)

assert.match(migration, /create or replace function private\.record_facility_operational_audit\(\)[\s\S]*security definer[\s\S]*set search_path = ''/i)
assert.match(migration, /when 'facility_hours' then 'facility_hour'/i)
assert.match(migration, /when 'facility_hour_exceptions' then 'facility_hour_exception'/i)
assert.match(migration, /'day_of_week', audit_payload ->> 'day_of_week'/i)
assert.match(migration, /'exception_date', audit_payload ->> 'exception_date'/i)
assert.doesNotMatch(migration, /'start_time', audit_payload/i)
assert.doesNotMatch(migration, /'end_time', audit_payload/i)
assert.match(migration, /revoke execute on function private\.record_facility_operational_audit\(\) from public, anon, authenticated/i)

const publicViewsSql = migration.slice(migration.indexOf("create view public.public_facility_hours"), migration.indexOf("-- Extend the accepted immutable audit stream"))
for (const privateField of ["created_by", "updated_by"]) {
  assert.doesNotMatch(publicViewsSql, new RegExp(`\\b${privateField}\\b`, "i"), `${privateField} is absent from public projections`)
}
assert.match(migration, /from public\.facility_advisories advisory/i)
assert.match(migration, /advisory\.advisory_type = 'TEMPORARY_CLOSURE'/i)
assert.doesNotMatch(publicViewsSql, /advisory\.title|advisory\.message|advisory\.department_id/i)
assert.doesNotMatch(migrationSql, /create table public\.(?:facility_temporary_closures|temporary_closures)/i)
assert.doesNotMatch(migrationSql, /alter publication supabase_realtime/i)

for (const forbiddenSpatialColumn of ["floor_id", "geometry", "map_node", "map_edge", "qr_checkpoint", "route_id"]) {
  assert.doesNotMatch(migrationSql, new RegExp(`\\b${forbiddenSpatialColumn}\\b`, "i"), `${forbiddenSpatialColumn} is not duplicated`)
}
assert.doesNotMatch(migrationSql, /insert\s+into\s+public\.(facility_hours|facility_hour_exceptions)/i, "migration contains no schedule seeds")
assert.doesNotMatch(migrationSql, /getFacilityHours|getFacilityStatus|OPEN_NOW|CLOSING_SOON|SCHEDULED_TO_OPEN/i, "runtime status work remains outside FS-2A")

assert.match(rlsTest, /begin;[\s\S]*rollback;/i)
assert.match(rlsTest, /DEVELOPMENT \/ DEMO \/ NOT OFFICIAL/i)
assert.match(rlsTest, /ordinary authenticated users cannot create facility hours/i)
assert.match(rlsTest, /has_any_column_privilege\('authenticated', 'public\.facility_hours', 'INSERT'\)[\s\S]*?not has_table_privilege\('authenticated', 'public\.facility_hours', 'INSERT'\)/i)
assert.match(rlsTest, /SUPER_ADMIN can delete a facility hour exception/i)
assert.match(rlsTest, /active overlapping weekly interval is rejected/i)
assert.match(rlsTest, /trusted actor attribution is preserved/i)
assert.match(rlsTest, /normal users cannot forge facility schedule audit rows/i)
const plannedAssertions = Number(rlsTest.match(/select plan\((\d+)\)/i)?.[1])
const definedAssertions = (rlsTest.match(/^select\s+(?:ok|is|col_type_is|throws_ok|lives_ok|results_eq)\s*\(/gim) ?? []).length
assert.equal(plannedAssertions, definedAssertions, "pgTAP plan matches the transactional assertion count")

const canonicalIds = facilities.map(({ id }) => id)
assert.equal(new Set(canonicalIds).size, canonicalIds.length, "canonical local facility IDs remain unique")
for (const facilityId of canonicalIds) {
  assert.match(facilityId, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${facilityId} remains compatible with the operational facility key`)
}

console.log(`Phase 4-FS-2A schema, constraints, RLS, projections, audit, scope, and ${canonicalIds.length} canonical facility-ID compatibility checks: PASS`)
