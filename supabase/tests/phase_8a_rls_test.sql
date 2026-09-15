begin;

create extension if not exists pgtap with schema extensions;
select plan(35);

select ok(to_regclass('public.profiles') is not null, 'profiles table exists');
select ok(to_regclass('public.roles') is not null, 'roles table exists');
select ok(to_regclass('public.user_roles') is not null, 'user_roles table exists');
select ok(to_regclass('public.departments') is not null, 'departments table exists');
select ok(to_regclass('public.notifications') is not null, 'notifications table exists');
select ok(to_regclass('public.announcements') is not null, 'announcements table exists');
select ok(to_regclass('public.events') is not null, 'events table exists');
select ok(to_regclass('public.facility_advisories') is not null, 'facility_advisories table exists');

select ok(
  not exists (
    select 1
    from pg_class
    where oid in (
      'public.profiles'::regclass,
      'public.user_roles'::regclass,
      'public.notifications'::regclass,
      'public.announcements'::regclass,
      'public.events'::regclass,
      'public.facility_advisories'::regclass
    ) and not relrowsecurity
  ),
  'RLS is enabled on every user-sensitive and dashboard table'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000101', 'authenticated', 'authenticated', 'ordinary@phase8a.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000102', 'authenticated', 'authenticated', 'department-admin@phase8a.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000103', 'authenticated', 'authenticated', 'super-admin@phase8a.test', '', now(), '{}', '{}', now(), now());

select is(
  (select count(*) from public.profiles where id in ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000103')),
  3::bigint,
  'new Supabase Auth users receive private profile rows'
);

insert into public.departments (code, name) values ('PHASE8A_TEST', 'Phase 8A test department');

insert into public.user_roles (user_id, role_id, department_id, assigned_by)
select
  '00000000-0000-0000-0000-000000000102',
  roles.id,
  departments.id,
  '00000000-0000-0000-0000-000000000103'
from public.roles
cross join public.departments
where roles.code = 'DEPARTMENT_ADMIN' and departments.code = 'PHASE8A_TEST';

insert into public.user_roles (user_id, role_id, assigned_by)
select
  '00000000-0000-0000-0000-000000000103',
  roles.id,
  '00000000-0000-0000-0000-000000000103'
from public.roles
where roles.code = 'SUPER_ADMIN';

insert into public.announcements (
  title, message, lifecycle, is_public, published_at, effective_at,
  created_by, source_type, source_id
) values
  ('Phase 8A published fixture', 'Development test only.', 'PUBLISHED', true, now() - interval '1 hour', now() - interval '1 hour', '00000000-0000-0000-0000-000000000103', 'DEVELOPMENT_TEST', 'PHASE8A-PUBLISHED'),
  ('Phase 8A draft fixture', 'Development test only.', 'DRAFT', true, null, null, '00000000-0000-0000-0000-000000000103', 'DEVELOPMENT_TEST', 'PHASE8A-DRAFT'),
  ('Phase 8A cancelled fixture', 'Development test only.', 'CANCELLED', true, now() - interval '2 hours', now() - interval '2 hours', '00000000-0000-0000-0000-000000000103', 'DEVELOPMENT_TEST', 'PHASE8A-CANCELLED'),
  ('Phase 8A expired fixture', 'Development test only.', 'PUBLISHED', true, now() - interval '2 hours', now() - interval '2 hours', '00000000-0000-0000-0000-000000000103', 'DEVELOPMENT_TEST', 'PHASE8A-EXPIRED'),
  ('Phase 8A future fixture', 'Development test only.', 'PUBLISHED', true, now(), now() + interval '1 hour', '00000000-0000-0000-0000-000000000103', 'DEVELOPMENT_TEST', 'PHASE8A-FUTURE');

update public.announcements
set expires_at = now() - interval '1 hour'
where source_id = 'PHASE8A-EXPIRED';

set local role anon;
select is((select count(*) from public.announcements), 1::bigint, 'anonymous users can read active published records');
select is((select count(*) from public.announcements where lifecycle = 'DRAFT'), 0::bigint, 'anonymous users cannot read drafts');
select is((select count(*) from public.announcements where lifecycle = 'CANCELLED'), 0::bigint, 'anonymous users cannot read cancelled records');
select is((select count(*) from public.announcements where source_id = 'PHASE8A-EXPIRED'), 0::bigint, 'anonymous users cannot read expired records');
select is((select count(*) from public.announcements where source_id = 'PHASE8A-FUTURE'), 0::bigint, 'anonymous users cannot read future-effective records');
select throws_ok(
  $$insert into public.announcements (title, message, lifecycle, is_public, published_at) values ('Blocked anonymous write', 'Development test only.', 'PUBLISHED', true, now())$$,
  '42501',
  'permission denied for table announcements',
  'anonymous inserts are rejected'
);
select throws_ok(
  $$update public.announcements set title = 'Blocked anonymous update' where source_id = 'PHASE8A-PUBLISHED'$$,
  '42501',
  'permission denied for table announcements',
  'anonymous announcement updates are rejected'
);
select throws_ok(
  $$delete from public.announcements where source_id = 'PHASE8A-PUBLISHED'$$,
  '42501',
  'permission denied for table announcements',
  'anonymous announcement deletes are rejected'
);
select throws_ok(
  $$insert into public.events (title, description, starts_at, lifecycle) values ('Blocked anonymous event', 'Development test only.', now(), 'DRAFT')$$,
  '42501',
  'permission denied for table events',
  'anonymous event creation is rejected'
);
select throws_ok(
  $$update public.facility_advisories set title = 'Blocked anonymous advisory update' where false$$,
  '42501',
  'permission denied for table facility_advisories',
  'anonymous advisory modification is rejected'
);
select throws_ok(
  $$update public.notifications set title = 'Blocked anonymous notification update' where false$$,
  '42501',
  'permission denied for table notifications',
  'anonymous notification modification is rejected'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
set local role authenticated;
select is((select count(*) from public.profiles), 1::bigint, 'a normal authenticated user can read only their own profile');
select lives_ok(
  $$update public.profiles set display_name = 'Ordinary development user' where id = '00000000-0000-0000-0000-000000000101'$$,
  'a user can update their own approved profile field'
);
select lives_ok(
  $$update public.profiles set display_name = 'Blocked cross-profile update' where id = '00000000-0000-0000-0000-000000000102'$$,
  'a cross-profile update is safely filtered by RLS'
);
select throws_ok(
  $$insert into public.announcements (title, message, lifecycle, is_public, published_at) values ('Blocked ordinary write', 'Development test only.', 'PUBLISHED', true, now())$$,
  '42501',
  'new row violates row-level security policy for table "announcements"',
  'authenticated users without an administrative role cannot insert official records'
);
select throws_ok(
  $$insert into public.events (title, description, starts_at, lifecycle, department_id) select 'Blocked ordinary event', 'Development test only.', now(), 'DRAFT', id from public.departments where code = 'PHASE8A_TEST'$$,
  '42501',
  'new row violates row-level security policy for table "events"',
  'a normal authenticated user cannot create official events'
);
select throws_ok(
  $$insert into public.facility_advisories (title, message, advisory_type, related_facility_id, lifecycle, department_id) select 'Blocked ordinary advisory', 'Development test only.', 'MAINTENANCE', 'library', 'DRAFT', id from public.departments where code = 'PHASE8A_TEST'$$,
  '42501',
  'new row violates row-level security policy for table "facility_advisories"',
  'a normal authenticated user cannot create facility advisories'
);
select throws_ok(
  $$insert into public.notifications (title, message, category, lifecycle, department_id) select 'Blocked ordinary notification', 'Development test only.', 'GENERAL', 'DRAFT', id from public.departments where code = 'PHASE8A_TEST'$$,
  '42501',
  'new row violates row-level security policy for table "notifications"',
  'a normal authenticated user cannot create notification records'
);
select lives_ok(
  $$update public.announcements set title = 'Unauthorized update' where source_id = 'PHASE8A-PUBLISHED'$$,
  'an unauthorized update is safely filtered by RLS'
);
reset role;
select is(
  (select display_name from public.profiles where id = '00000000-0000-0000-0000-000000000102'),
  null,
  'a user cannot modify another user profile'
);
select is(
  (select title from public.announcements where source_id = 'PHASE8A-PUBLISHED'),
  'Phase 8A published fixture',
  'unauthorized updates cannot change protected records'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
set local role authenticated;
select lives_ok(
  $$insert into public.announcements (title, message, lifecycle, department_id) select 'Department draft', 'Development test only.', 'DRAFT', id from public.departments where code = 'PHASE8A_TEST'$$,
  'a department admin can write department-scoped announcement data'
);
select throws_ok(
  $$insert into public.notifications (title, message, category, lifecycle, department_id) select 'Blocked emergency fixture', 'Development test only.', 'EMERGENCY', 'DRAFT', id from public.departments where code = 'PHASE8A_TEST'$$,
  '42501',
  'new row violates row-level security policy for table "notifications"',
  'a department admin cannot manage emergency notification data'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000103', true);
set local role authenticated;
select lives_ok(
  $$insert into public.notifications (title, message, category, lifecycle) values ('Super admin emergency fixture', 'Development test only.', 'EMERGENCY', 'DRAFT')$$,
  'a super admin can manage system-wide emergency notification data'
);
reset role;

select ok(
  (select count(*) = 4 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename in ('announcements', 'notifications', 'facility_advisories', 'events')),
  'only the four Phase 8A Dashboard tables are registered by this migration for Realtime'
);

select * from finish();
rollback;
