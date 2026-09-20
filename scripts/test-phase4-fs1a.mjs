import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { fileURLToPath, URL } from "node:url"
import { facilities } from "../src/data/facilities.js"

const migrationPath = fileURLToPath(new URL("../supabase/migrations/20260920122741_phase_4_fs1a_facility_operational_foundation.sql", import.meta.url))
const rlsTestPath = fileURLToPath(new URL("../supabase/tests/phase_4_fs1a_facility_operational_test.sql", import.meta.url))
const [migration, rlsTest] = await Promise.all([
  readFile(migrationPath, "utf8"),
  readFile(rlsTestPath, "utf8"),
])
const migrationSql = migration.replace(/^\s*--.*$/gm, "")

const tables = [
  "facility_operational_profiles",
  "services",
  "service_aliases",
  "facility_service_mappings",
]

for (const table of tables) {
  assert.match(migration, new RegExp(`create table public\\.${table}\\s*\\(`, "i"), `${table} exists`)
  assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, "i"), `${table} enables RLS`)
  assert.match(migration, new RegExp(`create policy ${table}_read_published`, "i"), `${table} has a public read policy`)
  assert.match(migration, new RegExp(`create policy ${table}_read_super_admin`, "i"), `${table} has a SUPER_ADMIN read policy`)
  for (const operation of ["insert", "update", "delete"]) {
    assert.match(migration, new RegExp(`create policy ${table}_${operation}_super_admin`, "i"), `${table} has a SUPER_ADMIN ${operation} policy`)
  }
  assert.match(migration, new RegExp(`create trigger ${table}_record_audit`, "i"), `${table} has a trusted audit trigger`)
}

for (const view of [
  "public_facility_operational_profiles",
  "public_services",
  "public_service_aliases",
  "public_facility_service_mappings",
]) {
  assert.match(
    migration,
    new RegExp(`create view public\\.${view}[\\s\\S]*?security_invoker\\s*=\\s*true`, "i"),
    `${view} is security-invoker`,
  )
}

assert.match(migration, /facility_id text not null unique/i)
assert.match(migration, /references public\.facility_operational_profiles\(facility_id\)/i)
assert.match(migration, /facility_operational_profiles_facility_id_format/i)
assert.match(migration, /demo_provenance_check/g)
assert.match(migration, /active_provenance_check/g)
assert.match(migration, /verified_at_check/g)
assert.match(migration, /lifecycle public\.content_lifecycle not null default 'DRAFT'/g)
assert.match(migration, /verification_status public\.verification_status not null default 'PENDING_VERIFICATION'/g)
assert.match(migration, /data_status public\.dashboard_data_status not null default 'PENDING_VERIFICATION'/g)
assert.match(migration, /private\.has_any_role\(array\['SUPER_ADMIN'\]::public\.app_role\[\]\)/i)
assert.match(migration, /create function private\.record_facility_operational_audit\(\)[\s\S]*security definer[\s\S]*set search_path = ''/i)
assert.match(migration, /revoke execute on function private\.record_facility_operational_audit\(\) from public, anon, authenticated/i)
assert.doesNotMatch(migration, /alter publication supabase_realtime/i)

for (const outOfSliceTable of ["facility_hours", "facility_hour_exceptions", "facility_media"]) {
  assert.doesNotMatch(migration, new RegExp(`create table public\\.${outOfSliceTable}`, "i"), `${outOfSliceTable} remains outside FS-1A`)
}

for (const forbiddenSpatialColumn of ["floor_id", "geometry", "map_node", "map_edge", "qr_checkpoint", "route_id"]) {
  assert.doesNotMatch(migrationSql, new RegExp(`\\b${forbiddenSpatialColumn}\\b`, "i"), `${forbiddenSpatialColumn} is not duplicated in the operational overlay`)
}

assert.doesNotMatch(migrationSql, /insert\s+into\s+public\.(facility_operational_profiles|services|service_aliases|facility_service_mappings)/i)
assert.match(rlsTest, /begin;[\s\S]*rollback;/i)
assert.match(rlsTest, /DEVELOPMENT \/ DEMO \/ NOT OFFICIAL/i)
assert.match(rlsTest, /normal authenticated users cannot create facility operational records/i)
assert.match(rlsTest, /anonymous users see the published configured mapping/i)
assert.match(rlsTest, /trusted audit rows/i)

const canonicalIds = facilities.map(({ id }) => id)
assert.equal(new Set(canonicalIds).size, canonicalIds.length, "canonical local facility IDs remain unique")
for (const facilityId of canonicalIds) {
  assert.match(facilityId, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${facilityId} is compatible with the overlay key constraint`)
}

console.log(`Phase 4-FS-1A schema, RLS, provenance, audit, scope, and ${canonicalIds.length} canonical facility-ID compatibility checks: PASS`)
