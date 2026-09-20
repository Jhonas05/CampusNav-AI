begin;

create extension if not exists pgtap with schema extensions;
select plan(58);

select ok(to_regclass('public.facility_operational_profiles') is not null, 'facility_operational_profiles exists');
select ok(to_regclass('public.services') is not null, 'services exists');
select ok(to_regclass('public.service_aliases') is not null, 'service_aliases exists');
select ok(to_regclass('public.facility_service_mappings') is not null, 'facility_service_mappings exists');

select ok((select relrowsecurity from pg_class where oid = 'public.facility_operational_profiles'::regclass), 'facility_operational_profiles has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.services'::regclass), 'services has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.service_aliases'::regclass), 'service_aliases has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.facility_service_mappings'::regclass), 'facility_service_mappings has RLS');

select is((select count(*) from public.facility_operational_profiles), 0::bigint, 'migration seeds no facility operational profiles');
select is((select count(*) from public.services), 0::bigint, 'migration seeds no services');
select is((select count(*) from public.service_aliases), 0::bigint, 'migration seeds no service aliases');
select is((select count(*) from public.facility_service_mappings), 0::bigint, 'migration seeds no facility-service mappings');

select ok((select reloptions @> array['security_invoker=true'] from pg_class where oid = 'public.public_facility_operational_profiles'::regclass), 'public facility profiles view is security-invoker');
select ok((select reloptions @> array['security_invoker=true'] from pg_class where oid = 'public.public_services'::regclass), 'public services view is security-invoker');
select ok((select reloptions @> array['security_invoker=true'] from pg_class where oid = 'public.public_service_aliases'::regclass), 'public aliases view is security-invoker');
select ok((select reloptions @> array['security_invoker=true'] from pg_class where oid = 'public.public_facility_service_mappings'::regclass), 'public mappings view is security-invoker');

select is(
  (select count(*) from pg_trigger where tgrelid in (
    'public.facility_operational_profiles'::regclass,
    'public.services'::regclass,
    'public.service_aliases'::regclass,
    'public.facility_service_mappings'::regclass
  ) and tgname like '%record_audit' and not tgisinternal),
  4::bigint,
  'all four operational tables have trusted audit triggers'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000401', 'authenticated', 'authenticated', 'ordinary@phase4fs1a.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000402', 'authenticated', 'authenticated', 'super-admin@phase4fs1a.test', '', now(), '{}', '{}', now(), now());

insert into public.user_roles (user_id, role_id, assigned_by)
select '00000000-0000-0000-0000-000000000402', id, '00000000-0000-0000-0000-000000000402'
from public.roles where code = 'SUPER_ADMIN';

set local role anon;
select is((select count(*) from public.public_facility_operational_profiles), 0::bigint, 'anonymous users initially see no facility operational profiles');
select is((select count(*) from public.public_services), 0::bigint, 'anonymous users initially see no services');
select throws_ok(
  $$insert into public.services (code, name, source_type) values ('blocked-anon', 'Blocked anonymous service', 'DEVELOPMENT_TEST')$$,
  '42501', 'permission denied for table services',
  'anonymous users cannot create services'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000401', true);
set local role authenticated;
select throws_ok(
  $$insert into public.facility_operational_profiles (facility_id, description, source_type) values ('library', 'Blocked ordinary-user record', 'DEVELOPMENT_TEST')$$,
  '42501', 'new row violates row-level security policy for table "facility_operational_profiles"',
  'normal authenticated users cannot create facility operational records'
);
select throws_ok(
  $$insert into public.audit_logs (actor_user_id, action, entity_type, entity_id) values ('00000000-0000-0000-0000-000000000401', 'forged', 'service', 1)$$,
  '42501', 'permission denied for table audit_logs',
  'normal users cannot forge facility operational audit rows'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000402', true);
set local role authenticated;

select lives_ok(
  $$insert into public.facility_operational_profiles (
      facility_id, description, lifecycle, public_visibility,
      verification_status, data_status, source_type, source_id
    ) values (
      'library', 'DEVELOPMENT / DEMO / NOT OFFICIAL', 'DRAFT', false,
      'DEMO_ONLY', 'DEMO', 'DEVELOPMENT_TEST', 'PHASE4-FS1A-PROFILE'
    )$$,
  'SUPER_ADMIN can create a demo facility operational profile'
);
select throws_ok(
  $$insert into public.services (
      code, name, verification_status, data_status, source_type
    ) values (
      'invalid-demo-provenance', 'Invalid demo provenance',
      'PENDING_VERIFICATION', 'DEMO', 'DEVELOPMENT_TEST'
    )$$,
  '23514', 'new row for relation "services" violates check constraint "services_demo_provenance_check"',
  'DEMO data cannot lose its DEMO_ONLY verification label'
);
select throws_ok(
  $$insert into public.services (
      code, name, verification_status, data_status, source_type
    ) values (
      'invalid-verified-freshness', 'Invalid verified freshness',
      'VERIFIED', 'ACTIVE', 'DEVELOPMENT_TEST'
    )$$,
  '23514', 'new row for relation "services" violates check constraint "services_verified_at_check"',
  'VERIFIED data requires a verification timestamp'
);
select lives_ok(
  $$insert into public.services (
      code, name, description, lifecycle, public_visibility,
      verification_status, data_status, source_type, source_id
    ) values (
      'development-record-help', 'DEVELOPMENT / DEMO / NOT OFFICIAL',
      'Synthetic service used only by the transactional FS-1A test.', 'DRAFT', false,
      'DEMO_ONLY', 'DEMO', 'DEVELOPMENT_TEST', 'PHASE4-FS1A-SERVICE'
    )$$,
  'SUPER_ADMIN can create a demo service'
);
select lives_ok(
  $$insert into public.service_aliases (
      service_id, alias, lifecycle, public_visibility,
      verification_status, data_status, source_type, source_id
    ) select
      id, 'DEVELOPMENT DEMO RECORD REQUEST', 'DRAFT', false,
      'DEMO_ONLY', 'DEMO', 'DEVELOPMENT_TEST', 'PHASE4-FS1A-ALIAS'
    from public.services where code = 'development-record-help'$$,
  'SUPER_ADMIN can create an approved-alias candidate'
);
select lives_ok(
  $$insert into public.facility_service_mappings (
      facility_id, service_id, recommendation_rank, public_notes, lifecycle,
      public_visibility, verification_status, data_status, source_type, source_id
    ) select
      'library', id, 10, 'DEVELOPMENT / DEMO / NOT OFFICIAL', 'DRAFT',
      false, 'DEMO_ONLY', 'DEMO', 'DEVELOPMENT_TEST', 'PHASE4-FS1A-MAPPING'
    from public.services where code = 'development-record-help'$$,
  'SUPER_ADMIN can create a configured facility-service mapping'
);

select is((select count(*) from public.audit_logs where entity_type in ('facility_operational_profile', 'service', 'service_alias', 'facility_service_mapping') and action like '%_created'), 4::bigint, 'creation produces four trusted audit rows');
select is((select count(*) from public.public_facility_operational_profiles), 0::bigint, 'draft facility profile remains out of the public view');
select is((select count(*) from public.public_services), 0::bigint, 'draft service remains out of the public view');
select is((select count(*) from public.public_service_aliases), 0::bigint, 'draft alias remains out of the public view');
select is((select count(*) from public.public_facility_service_mappings), 0::bigint, 'draft mapping remains out of the public view');

select lives_ok(
  $$update public.facility_operational_profiles set lifecycle = 'PUBLISHED', public_visibility = true, published_at = now(), effective_at = now() where source_id = 'PHASE4-FS1A-PROFILE'$$,
  'SUPER_ADMIN can publish the demo facility profile'
);
select lives_ok(
  $$update public.services set lifecycle = 'PUBLISHED', public_visibility = true, published_at = now(), effective_at = now() where source_id = 'PHASE4-FS1A-SERVICE'$$,
  'SUPER_ADMIN can publish the demo service'
);
select lives_ok(
  $$update public.service_aliases set lifecycle = 'PUBLISHED', public_visibility = true, published_at = now(), effective_at = now() where source_id = 'PHASE4-FS1A-ALIAS'$$,
  'SUPER_ADMIN can publish the demo alias'
);
select lives_ok(
  $$update public.facility_service_mappings set lifecycle = 'PUBLISHED', public_visibility = true, published_at = now(), effective_at = now() where source_id = 'PHASE4-FS1A-MAPPING'$$,
  'SUPER_ADMIN can publish the demo mapping'
);

select is((select count(*) from public.audit_logs where entity_type in ('facility_operational_profile', 'service', 'service_alias', 'facility_service_mapping') and action like '%_published'), 4::bigint, 'publication produces four trusted audit rows');
select ok((select bool_and(not (metadata ?| array['description', 'public_contact_email', 'public_contact_phone', 'password', 'token', 'access_token', 'refresh_token'])) from public.audit_logs where entity_type in ('facility_operational_profile', 'service', 'service_alias', 'facility_service_mapping')), 'trusted audit rows exclude content bodies, contact data, and credentials');
select ok(not has_function_privilege('authenticated', 'private.record_facility_operational_audit()', 'EXECUTE'), 'authenticated clients cannot execute the trusted audit function');
select ok(not has_function_privilege('anon', 'private.record_facility_operational_audit()', 'EXECUTE'), 'anonymous clients cannot execute the trusted audit function');
select ok(not has_column_privilege('anon', 'public.facility_operational_profiles', 'created_by', 'SELECT'), 'anonymous users cannot read facility profile actor IDs');
select ok(not has_column_privilege('authenticated', 'public.services', 'created_by', 'SELECT'), 'authenticated API clients cannot read service actor IDs directly');
reset role;

set local role anon;
select is((select count(*) from public.public_facility_operational_profiles where facility_id = 'library'), 1::bigint, 'anonymous users see the published demo facility profile');
select is((select count(*) from public.public_services where code = 'development-record-help'), 1::bigint, 'anonymous users see the published demo service');
select is((select count(*) from public.public_service_aliases where service_code = 'development-record-help'), 1::bigint, 'anonymous users see the published approved alias');
select is((select count(*) from public.public_facility_service_mappings where facility_id = 'library' and service_code = 'development-record-help'), 1::bigint, 'anonymous users see the published configured mapping');
select is((select data_status::text from public.public_services where code = 'development-record-help'), 'DEMO', 'public service projection preserves DEMO status');
select is((select verification_status::text from public.public_services where code = 'development-record-help'), 'DEMO_ONLY', 'public service projection preserves verification provenance');
select is((select source_type from public.public_facility_service_mappings where facility_id = 'library'), 'DEVELOPMENT_TEST', 'public mapping projection preserves source provenance');
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000402', true);
set local role authenticated;
select lives_ok($$delete from public.facility_service_mappings where source_id = 'PHASE4-FS1A-MAPPING'$$, 'SUPER_ADMIN can remove the test mapping');
select lives_ok($$delete from public.service_aliases where source_id = 'PHASE4-FS1A-ALIAS'$$, 'SUPER_ADMIN can remove the test alias');
select lives_ok($$delete from public.services where source_id = 'PHASE4-FS1A-SERVICE'$$, 'SUPER_ADMIN can remove the test service');
select lives_ok($$delete from public.facility_operational_profiles where source_id = 'PHASE4-FS1A-PROFILE'$$, 'SUPER_ADMIN can remove the test profile');
select is((select count(*) from public.facility_operational_profiles where source_type = 'DEVELOPMENT_TEST'), 0::bigint, 'facility profile fixture cleanup is exact');
select is((select count(*) from public.services where source_type = 'DEVELOPMENT_TEST'), 0::bigint, 'service fixture cleanup is exact');
select is((select count(*) from public.service_aliases where source_type = 'DEVELOPMENT_TEST'), 0::bigint, 'service alias fixture cleanup is exact');
select is((select count(*) from public.facility_service_mappings where source_type = 'DEVELOPMENT_TEST'), 0::bigint, 'facility-service mapping fixture cleanup is exact');
reset role;

select * from finish();
rollback;
