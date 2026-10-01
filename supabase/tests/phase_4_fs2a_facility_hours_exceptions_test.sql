begin;

create extension if not exists pgtap with schema extensions;
select plan(89);

select ok(to_regclass('public.facility_hours') is not null, 'facility_hours exists');
select ok(to_regclass('public.facility_hour_exceptions') is not null, 'facility_hour_exceptions exists');
select ok((select relrowsecurity from pg_class where oid = 'public.facility_hours'::regclass), 'facility_hours has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.facility_hour_exceptions'::regclass), 'facility_hour_exceptions has RLS');
select ok(to_regclass('public.public_facility_hours') is not null, 'public_facility_hours exists');
select ok(to_regclass('public.public_facility_hour_exceptions') is not null, 'public_facility_hour_exceptions exists');
select ok(to_regclass('public.public_facility_status_advisories') is not null, 'public_facility_status_advisories exists');
select ok((select reloptions @> array['security_invoker=true'] from pg_class where oid = 'public.public_facility_hours'::regclass), 'public facility hours view is security-invoker');
select ok((select reloptions @> array['security_invoker=true'] from pg_class where oid = 'public.public_facility_hour_exceptions'::regclass), 'public facility hour exceptions view is security-invoker');
select ok((select reloptions @> array['security_invoker=true'] from pg_class where oid = 'public.public_facility_status_advisories'::regclass), 'public facility status advisories view is security-invoker');
select ok((select reloptions @> array['security_barrier=true'] from pg_class where oid = 'public.public_facility_hours'::regclass), 'public facility hours view is a security barrier');
select ok((select reloptions @> array['security_barrier=true'] from pg_class where oid = 'public.public_facility_hour_exceptions'::regclass), 'public facility hour exceptions view is a security barrier');
select ok((select reloptions @> array['security_barrier=true'] from pg_class where oid = 'public.public_facility_status_advisories'::regclass), 'public facility status advisories view is a security barrier');
select is((select count(*) from public.facility_hours), 0::bigint, 'migration seeds no facility hours');
select is((select count(*) from public.facility_hour_exceptions), 0::bigint, 'migration seeds no facility hour exceptions');

select col_type_is('public', 'facility_hours', 'day_of_week', 'smallint', 'weekday uses smallint');
select col_type_is('public', 'facility_hours', 'start_time', 'time without time zone', 'weekly start uses campus wall-clock time');
select col_type_is('public', 'facility_hour_exceptions', 'exception_date', 'date', 'exception date uses date');
select col_type_is('public', 'facility_hour_exceptions', 'effective_at', 'timestamp with time zone', 'publication effectivity uses timestamptz');
select is(
  (select count(*) from pg_constraint where conrelid in ('public.facility_hours'::regclass, 'public.facility_hour_exceptions'::regclass) and conname like '%interval_shape'),
  2::bigint,
  'both tables constrain closed and interval row shapes'
);
select is(
  (select count(*) from pg_constraint where conrelid in ('public.facility_hours'::regclass, 'public.facility_hour_exceptions'::regclass) and contype = 'x'),
  2::bigint,
  'both tables enforce active duplicate and overlap exclusion'
);
select is(
  (select count(*) from pg_indexes where schemaname = 'public' and indexname in (
    'facility_hours_source_unique_idx',
    'facility_hours_facility_day_idx',
    'facility_hours_public_idx',
    'facility_hours_created_by_idx',
    'facility_hours_updated_by_idx',
    'facility_hour_exceptions_source_unique_idx',
    'facility_hour_exceptions_facility_date_idx',
    'facility_hour_exceptions_public_idx',
    'facility_hour_exceptions_created_by_idx',
    'facility_hour_exceptions_updated_by_idx'
  )),
  10::bigint,
  'all justified lookup, lifecycle, source, and actor indexes exist'
);
select is(
  (select count(*) from pg_constraint where conrelid in ('public.facility_hours'::regclass, 'public.facility_hour_exceptions'::regclass) and contype = 'f' and confrelid = 'public.facility_operational_profiles'::regclass),
  2::bigint,
  'both schedule tables reference the accepted operational facility key'
);
select is(
  (select count(*) from pg_policies where schemaname = 'public' and tablename in ('facility_hours', 'facility_hour_exceptions')),
  10::bigint,
  'both tables have published read plus SUPER_ADMIN read and write policies'
);
select is(
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name in ('public_facility_hours', 'public_facility_hour_exceptions', 'public_facility_status_advisories') and column_name in ('created_by', 'updated_by')),
  0::bigint,
  'public projections exclude actor IDs'
);
select is(
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'public_facility_status_advisories' and column_name in ('id', 'title', 'message', 'department_id')),
  0::bigint,
  'status advisory projection excludes internal IDs, content, and department metadata'
);
select ok(not has_table_privilege('anon', 'public.facility_hours', 'INSERT'), 'anonymous users have no facility-hours insert privilege');
select ok(not has_table_privilege('anon', 'public.facility_hour_exceptions', 'UPDATE'), 'anonymous users have no exception update privilege');
select ok(
  has_any_column_privilege('authenticated', 'public.facility_hours', 'INSERT')
    and not has_table_privilege('authenticated', 'public.facility_hours', 'INSERT'),
  'authenticated role has the explicit column-scoped grant evaluated by RLS'
);
select ok(not has_column_privilege('authenticated', 'public.facility_hours', 'created_by', 'SELECT'), 'authenticated API clients cannot read hours actor IDs');
select ok(not has_function_privilege('authenticated', 'private.record_facility_operational_audit()', 'EXECUTE'), 'authenticated clients cannot execute trusted audit directly');
select ok(not has_function_privilege('anon', 'private.record_facility_operational_audit()', 'EXECUTE'), 'anonymous clients cannot execute trusted audit directly');
select is(
  (select count(*) from pg_trigger where tgrelid in ('public.facility_hours'::regclass, 'public.facility_hour_exceptions'::regclass) and tgname like '%record_audit' and not tgisinternal),
  2::bigint,
  'both schedule tables have trusted audit triggers'
);
select is(
  (select count(*) from pg_trigger where tgrelid in ('public.facility_hours'::regclass, 'public.facility_hour_exceptions'::regclass) and tgname like '%touch_updated_at' and not tgisinternal),
  2::bigint,
  'both schedule tables have trusted update-attribution triggers'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000421', 'authenticated', 'authenticated', 'ordinary@phase4fs2a.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000422', 'authenticated', 'authenticated', 'super-admin@phase4fs2a.test', '', now(), '{}', '{}', now(), now());

insert into public.user_roles (user_id, role_id, assigned_by)
select '00000000-0000-0000-0000-000000000422', id, '00000000-0000-0000-0000-000000000422'
from public.roles where code = 'SUPER_ADMIN';

set local role anon;
select is((select count(*) from public.public_facility_hours), 0::bigint, 'anonymous users initially see no facility hours');
select throws_ok(
  $$insert into public.facility_hours (facility_id, day_of_week, start_time, end_time, source_type) values ('library', 1, '09:00', '17:00', 'DEVELOPMENT_TEST')$$,
  '42501', 'permission denied for table facility_hours',
  'anonymous users cannot create facility hours'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000421', true);
set local role authenticated;
select throws_ok(
  $$insert into public.facility_hours (facility_id, day_of_week, start_time, end_time, source_type) values ('library', 1, '09:00', '17:00', 'DEVELOPMENT_TEST')$$,
  '42501', 'new row violates row-level security policy for table "facility_hours"',
  'ordinary authenticated users cannot create facility hours'
);
select throws_ok(
  $$insert into public.audit_logs (actor_user_id, action, entity_type, entity_id) values ('00000000-0000-0000-0000-000000000421', 'forged', 'facility_hour', 1)$$,
  '42501', 'permission denied for table audit_logs',
  'normal users cannot forge facility schedule audit rows'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000422', true);
set local role authenticated;

select lives_ok(
  $$insert into public.facility_operational_profiles (
      facility_id, description, lifecycle, public_visibility, published_at,
      effective_at, verification_status, data_status, source_type, source_id
    ) values (
      'library', 'DEVELOPMENT / DEMO / NOT OFFICIAL', 'PUBLISHED', true, now(),
      now() - interval '1 hour', 'DEMO_ONLY', 'DEMO', 'DEVELOPMENT_TEST', 'PHASE4-FS2A-PROFILE'
    )$$,
  'SUPER_ADMIN can create the canonical-key test profile'
);
select throws_ok(
  $$insert into public.facility_hours (
      facility_id, day_of_week, start_time, end_time, source_type
    ) values ('not-a-canonical-overlay-facility', 1, '09:00', '17:00', 'DEVELOPMENT_TEST')$$,
  '23503', 'insert or update on table "facility_hours" violates foreign key constraint "facility_hours_facility_id_fkey"',
  'hours reject a facility ID absent from the accepted operational foundation'
);
select throws_ok(
  $$insert into public.facility_hours (
      facility_id, day_of_week, start_time, end_time, source_type
    ) values ('library', 7, '09:00', '17:00', 'DEVELOPMENT_TEST')$$,
  '23514', 'new row for relation "facility_hours" violates check constraint "facility_hours_day_of_week_range"',
  'weekday values outside zero through six are rejected'
);
select throws_ok(
  $$insert into public.facility_hours (
      facility_id, day_of_week, closed_all_day, start_time, source_type
    ) values ('library', 1, true, '09:00', 'DEVELOPMENT_TEST')$$,
  '23514', 'new row for relation "facility_hours" violates check constraint "facility_hours_interval_shape"',
  'closed weekly rows cannot carry an interval'
);
select throws_ok(
  $$insert into public.facility_hours (
      facility_id, day_of_week, start_time, source_type
    ) values ('library', 1, '09:00', 'DEVELOPMENT_TEST')$$,
  '23514', 'new row for relation "facility_hours" violates check constraint "facility_hours_interval_shape"',
  'open weekly rows require both interval endpoints'
);
select throws_ok(
  $$insert into public.facility_hours (
      facility_id, day_of_week, start_time, end_time, effective_at, expires_at, source_type
    ) values ('library', 1, '09:00', '17:00', now(), now() - interval '1 hour', 'DEVELOPMENT_TEST')$$,
  '23514', 'new row for relation "facility_hours" violates check constraint "facility_hours_effective_range"',
  'invalid effective and expiration ordering is rejected'
);
select throws_ok(
  $$insert into public.facility_hour_exceptions (
      facility_id, exception_date, closed_all_day, verification_status,
      data_status, source_type
    ) values (
      'library', date '2099-01-01', true, 'PENDING_VERIFICATION',
      'DEMO', 'DEVELOPMENT_TEST'
    )$$,
  '23514', 'new row for relation "facility_hour_exceptions" violates check constraint "facility_hour_exceptions_demo_provenance_check"',
  'DEMO exceptions require DEMO_ONLY verification provenance'
);
select lives_ok(
  $$insert into public.facility_hours (
      facility_id, day_of_week, start_time, end_time, lifecycle,
      public_visibility, published_at, effective_at, verification_status,
      data_status, source_type, source_id
    ) values (
      'library', 2, '22:00', '06:00', 'PUBLISHED', true, now(),
      now() - interval '1 hour', 'DEMO_ONLY', 'DEMO',
      'DEVELOPMENT_TEST', 'PHASE4-FS2A-HOURS-OVERNIGHT'
    )$$,
  'overnight end-before-start weekly intervals remain legal'
);
select lives_ok(
  $$insert into public.facility_hours (
      facility_id, day_of_week, start_time, end_time, lifecycle,
      public_visibility, published_at, effective_at, verification_status,
      data_status, source_type, source_id
    ) values (
      'library', 1, '09:00', '12:00', 'PUBLISHED', true, now(),
      now() - interval '1 hour', 'DEMO_ONLY', 'DEMO',
      'DEVELOPMENT_TEST', 'PHASE4-FS2A-HOURS-ACTIVE-AM'
    )$$,
  'SUPER_ADMIN can insert an active weekly interval'
);
select lives_ok(
  $$insert into public.facility_hours (
      facility_id, day_of_week, start_time, end_time, lifecycle,
      public_visibility, published_at, effective_at, verification_status,
      data_status, source_type, source_id
    ) values (
      'library', 1, '13:00', '17:00', 'PUBLISHED', true, now(),
      now() - interval '1 hour', 'DEMO_ONLY', 'DEMO',
      'DEVELOPMENT_TEST', 'PHASE4-FS2A-HOURS-ACTIVE-PM'
    )$$,
  'multiple non-overlapping intervals per weekday are supported'
);
select throws_ok(
  $$insert into public.facility_hours (
      facility_id, day_of_week, start_time, end_time, lifecycle,
      public_visibility, published_at, effective_at, verification_status,
      data_status, source_type
    ) values (
      'library', 1, '11:00', '14:00', 'PUBLISHED', true, now(),
      now() - interval '1 hour', 'DEMO_ONLY', 'DEMO', 'DEVELOPMENT_TEST'
    )$$,
  '23P01', 'conflicting key value violates exclusion constraint "facility_hours_active_schedule_exclusion"',
  'active overlapping weekly interval is rejected'
);
select throws_ok(
  $$insert into public.facility_hours (
      facility_id, day_of_week, start_time, end_time, lifecycle,
      public_visibility, published_at, effective_at, verification_status,
      data_status, source_type
    ) values (
      'library', 1, '09:00', '12:00', 'PUBLISHED', true, now(),
      now() - interval '1 hour', 'DEMO_ONLY', 'DEMO', 'DEVELOPMENT_TEST'
    )$$,
  '23P01', 'conflicting key value violates exclusion constraint "facility_hours_active_schedule_exclusion"',
  'duplicate active weekly interval is rejected'
);
select throws_ok(
  $$insert into public.facility_hours (
      facility_id, day_of_week, closed_all_day, lifecycle, public_visibility,
      published_at, effective_at, verification_status, data_status, source_type
    ) values (
      'library', 1, true, 'PUBLISHED', true, now(), now() - interval '1 hour',
      'DEMO_ONLY', 'DEMO', 'DEVELOPMENT_TEST'
    )$$,
  '23P01', 'conflicting key value violates exclusion constraint "facility_hours_active_schedule_exclusion"',
  'active closed marker cannot coexist with weekly intervals'
);
select lives_ok(
  $$insert into public.facility_hours (
      facility_id, day_of_week, start_time, end_time, lifecycle,
      verification_status, data_status, source_type, source_id
    ) values (
      'library', 1, '10:00', '11:00', 'DRAFT', 'DEMO_ONLY', 'DEMO',
      'DEVELOPMENT_TEST', 'PHASE4-FS2A-HOURS-DRAFT'
    )$$,
  'draft interval candidates do not displace active schedules'
);
select lives_ok(
  $$insert into public.facility_hours (
      facility_id, day_of_week, start_time, end_time, lifecycle,
      public_visibility, published_at, effective_at, verification_status,
      data_status, source_type, source_id
    ) values (
      'library', 4, '09:00', '17:00', 'PUBLISHED', true, now(),
      now() + interval '1 day', 'DEMO_ONLY', 'DEMO',
      'DEVELOPMENT_TEST', 'PHASE4-FS2A-HOURS-FUTURE'
    )$$,
  'future-effective weekly hours can be stored'
);
select lives_ok(
  $$insert into public.facility_hours (
      facility_id, day_of_week, start_time, end_time, lifecycle,
      public_visibility, published_at, effective_at, expires_at,
      verification_status, data_status, source_type, source_id
    ) values (
      'library', 5, '09:00', '17:00', 'PUBLISHED', true, now() - interval '3 days',
      now() - interval '3 days', now() - interval '1 day', 'DEMO_ONLY', 'DEMO',
      'DEVELOPMENT_TEST', 'PHASE4-FS2A-HOURS-EXPIRED'
    )$$,
  'expired weekly hours can be retained as history'
);
select lives_ok(
  $$insert into public.facility_hour_exceptions (
      facility_id, exception_date, start_time, end_time, lifecycle,
      public_visibility, published_at, effective_at, verification_status,
      data_status, source_type, source_id
    ) values (
      'library', date '2099-01-01', '09:00', '12:00', 'PUBLISHED', true,
      now(), now() - interval '1 hour', 'DEMO_ONLY', 'DEMO',
      'DEVELOPMENT_TEST', 'PHASE4-FS2A-EXCEPTION-AM'
    )$$,
  'SUPER_ADMIN can insert an active replacement exception interval'
);
select lives_ok(
  $$insert into public.facility_hour_exceptions (
      facility_id, exception_date, start_time, end_time, lifecycle,
      public_visibility, published_at, effective_at, verification_status,
      data_status, source_type, source_id
    ) values (
      'library', date '2099-01-01', '13:00', '17:00', 'PUBLISHED', true,
      now(), now() - interval '1 hour', 'DEMO_ONLY', 'DEMO',
      'DEVELOPMENT_TEST', 'PHASE4-FS2A-EXCEPTION-PM'
    )$$,
  'multiple non-overlapping replacement intervals are supported'
);
select throws_ok(
  $$insert into public.facility_hour_exceptions (
      facility_id, exception_date, start_time, end_time, lifecycle,
      public_visibility, published_at, effective_at, verification_status,
      data_status, source_type
    ) values (
      'library', date '2099-01-01', '11:00', '14:00', 'PUBLISHED', true,
      now(), now() - interval '1 hour', 'DEMO_ONLY', 'DEMO', 'DEVELOPMENT_TEST'
    )$$,
  '23P01', 'conflicting key value violates exclusion constraint "facility_hour_exceptions_active_schedule_exclusion"',
  'active overlapping dated exception is rejected'
);
select throws_ok(
  $$insert into public.facility_hour_exceptions (
      facility_id, exception_date, closed_all_day, lifecycle, public_visibility,
      published_at, effective_at, verification_status, data_status, source_type
    ) values (
      'library', date '2099-01-01', true, 'PUBLISHED', true, now(),
      now() - interval '1 hour', 'DEMO_ONLY', 'DEMO', 'DEVELOPMENT_TEST'
    )$$,
  '23P01', 'conflicting key value violates exclusion constraint "facility_hour_exceptions_active_schedule_exclusion"',
  'active closed exception cannot coexist with replacement intervals'
);
select lives_ok(
  $$insert into public.facility_hour_exceptions (
      facility_id, exception_date, closed_all_day, lifecycle,
      verification_status, data_status, source_type, source_id
    ) values (
      'library', date '2099-01-01', true, 'DRAFT', 'DEMO_ONLY', 'DEMO',
      'DEVELOPMENT_TEST', 'PHASE4-FS2A-EXCEPTION-DRAFT'
    )$$,
  'draft replacement candidates may coexist without becoming active'
);
select throws_ok(
  $$insert into public.facility_hour_exceptions (
      facility_id, exception_date, closed_all_day, end_time, source_type
    ) values ('library', date '2099-01-02', true, '17:00', 'DEVELOPMENT_TEST')$$,
  '23514', 'new row for relation "facility_hour_exceptions" violates check constraint "facility_hour_exceptions_interval_shape"',
  'closed exceptions cannot carry an interval'
);

select is(
  (select count(*) from public.audit_logs where entity_type in ('facility_hour', 'facility_hour_exception') and action like '%_created'),
  9::bigint,
  'valid schedule creation produces trusted audit rows only'
);
select ok(
  (select bool_and(actor_user_id = '00000000-0000-0000-0000-000000000422') from public.audit_logs where entity_type in ('facility_hour', 'facility_hour_exception')),
  'trusted actor attribution is preserved'
);
select ok(
  (select bool_and(metadata ? 'facility_id' and metadata ? 'source_type' and metadata ? 'source_id') from public.audit_logs where entity_type in ('facility_hour', 'facility_hour_exception')),
  'trusted audit metadata retains safe identity and provenance fields'
);
select ok(
  (select bool_and(not (metadata ?| array['start_time', 'end_time', 'created_by', 'updated_by', 'password', 'token', 'access_token', 'refresh_token'])) from public.audit_logs where entity_type in ('facility_hour', 'facility_hour_exception')),
  'trusted audit metadata excludes interval payloads, actor columns, and credentials'
);
select lives_ok(
  $$update public.facility_hours set source_label = 'DEVELOPMENT / DEMO / NOT OFFICIAL — UPDATED' where source_id = 'PHASE4-FS2A-HOURS-ACTIVE-AM'$$,
  'SUPER_ADMIN can update facility hours'
);
select lives_ok(
  $$insert into public.facility_advisories (
      title, message, advisory_type, related_facility_id, lifecycle, is_public,
      published_at, effective_at, verification_status, data_status,
      source_type, source_id
    ) values (
      'DEVELOPMENT / DEMO / NOT OFFICIAL', 'Synthetic closure for FS-2A.',
      'TEMPORARY_CLOSURE', 'library', 'PUBLISHED', true, now(),
      now() - interval '1 hour', 'DEMO_ONLY', 'DEMO',
      'DEVELOPMENT_TEST', 'PHASE4-FS2A-CLOSURE'
    )$$,
  'existing facility advisories accept the temporary-closure fixture'
);
select lives_ok(
  $$insert into public.facility_advisories (
      title, message, advisory_type, related_facility_id, lifecycle, is_public,
      published_at, effective_at, verification_status, data_status,
      source_type, source_id
    ) values (
      'DEVELOPMENT / DEMO / NOT OFFICIAL', 'Synthetic service interruption for FS-2A.',
      'SERVICE_INTERRUPTION', 'library', 'PUBLISHED', true, now(),
      now() - interval '1 hour', 'DEMO_ONLY', 'DEMO',
      'DEVELOPMENT_TEST', 'PHASE4-FS2A-SERVICE-INTERRUPTION'
    )$$,
  'existing facility advisories retain service-interruption semantics'
);
reset role;

set local role anon;
select is((select count(*) from public.public_facility_hours where source_id = 'PHASE4-FS2A-HOURS-ACTIVE-AM'), 1::bigint, 'anonymous users see active published weekly hours');
select is((select count(*) from public.public_facility_hours where source_id = 'PHASE4-FS2A-HOURS-DRAFT'), 0::bigint, 'draft weekly hours remain private');
select is((select count(*) from public.public_facility_hours where source_id = 'PHASE4-FS2A-HOURS-FUTURE'), 0::bigint, 'future-effective weekly hours remain private until effective');
select is((select count(*) from public.public_facility_hours where source_id = 'PHASE4-FS2A-HOURS-EXPIRED'), 0::bigint, 'expired weekly hours remain outside public reads');
select is((select count(*) from public.public_facility_hour_exceptions where source_id = 'PHASE4-FS2A-EXCEPTION-AM'), 1::bigint, 'anonymous users see active published replacement exceptions');
select is((select count(*) from public.public_facility_status_advisories where source_id = 'PHASE4-FS2A-CLOSURE'), 1::bigint, 'public status advisory projection exposes active temporary closures');
select is((select count(*) from public.public_facility_status_advisories where source_id = 'PHASE4-FS2A-SERVICE-INTERRUPTION'), 0::bigint, 'public status advisory projection never treats service interruption as closure');
select is((select data_status::text from public.public_facility_hours where source_id = 'PHASE4-FS2A-HOURS-ACTIVE-AM'), 'DEMO', 'public hours preserve DEMO provenance');
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000421', true);
set local role authenticated;
select results_eq(
  $$update public.facility_hours set source_label = 'BLOCKED' where source_id = 'PHASE4-FS2A-HOURS-ACTIVE-AM' returning source_label$$,
  array[]::text[],
  'ordinary authenticated users cannot update published facility hours'
);
select results_eq(
  $$delete from public.facility_hour_exceptions where source_id = 'PHASE4-FS2A-EXCEPTION-AM' returning source_id$$,
  array[]::text[],
  'ordinary authenticated users cannot delete published facility hour exceptions'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000422', true);
set local role authenticated;
select is((select source_label from public.facility_hours where source_id = 'PHASE4-FS2A-HOURS-ACTIVE-AM'), 'DEVELOPMENT / DEMO / NOT OFFICIAL — UPDATED', 'unauthorized update leaves facility hours unchanged');
select lives_ok($$delete from public.facility_hour_exceptions where source_id = 'PHASE4-FS2A-EXCEPTION-AM'$$, 'SUPER_ADMIN can delete a facility hour exception');
select lives_ok($$delete from public.facility_hours where source_id = 'PHASE4-FS2A-HOURS-ACTIVE-AM'$$, 'SUPER_ADMIN can delete facility hours');
select ok((select count(*) >= 2 from public.audit_logs where entity_type in ('facility_hour', 'facility_hour_exception') and action like '%_deleted'), 'SUPER_ADMIN deletions produce trusted audit rows');
select lives_ok($$delete from public.facility_hour_exceptions where source_type = 'DEVELOPMENT_TEST'$$, 'remaining exception fixtures are removed exactly');
select lives_ok($$delete from public.facility_hours where source_type = 'DEVELOPMENT_TEST'$$, 'remaining weekly-hours fixtures are removed exactly');
select lives_ok($$delete from public.facility_advisories where source_id in ('PHASE4-FS2A-CLOSURE', 'PHASE4-FS2A-SERVICE-INTERRUPTION')$$, 'advisory fixtures are removed exactly');
select lives_ok($$delete from public.facility_operational_profiles where source_id = 'PHASE4-FS2A-PROFILE'$$, 'operational profile fixture is removed exactly');
select is((select count(*) from public.facility_hours where source_type = 'DEVELOPMENT_TEST'), 0::bigint, 'facility-hours fixture cleanup is exact');
select is((select count(*) from public.facility_hour_exceptions where source_type = 'DEVELOPMENT_TEST'), 0::bigint, 'facility-hour-exception fixture cleanup is exact');
select is((select count(*) from public.facility_advisories where source_id in ('PHASE4-FS2A-CLOSURE', 'PHASE4-FS2A-SERVICE-INTERRUPTION')), 0::bigint, 'facility-advisory fixture cleanup is exact');
select is((select count(*) from public.facility_operational_profiles where source_id = 'PHASE4-FS2A-PROFILE'), 0::bigint, 'operational-profile fixture cleanup is exact');
reset role;

select * from finish();
rollback;
