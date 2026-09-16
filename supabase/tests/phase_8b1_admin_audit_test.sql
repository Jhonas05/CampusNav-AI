begin;

create extension if not exists pgtap with schema extensions;
select plan(21);

select ok(to_regclass('public.audit_logs') is not null, 'audit_logs table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.audit_logs'::regclass), 'RLS is enabled on audit_logs');
select is((select count(*) from pg_policies where schemaname = 'public' and tablename = 'audit_logs'), 1::bigint, 'audit_logs has one narrow read policy');
select is((select count(*) from pg_trigger where tgrelid in ('public.announcements'::regclass, 'public.events'::regclass, 'public.facility_advisories'::regclass, 'public.notifications'::regclass) and tgname like '%record_admin_audit' and not tgisinternal), 4::bigint, 'all four content tables have trusted audit triggers');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000201', 'authenticated', 'authenticated', 'ordinary@phase8b.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000202', 'authenticated', 'authenticated', 'super-admin@phase8b.test', '', now(), '{}', '{}', now(), now());

insert into public.user_roles (user_id, role_id, assigned_by)
select '00000000-0000-0000-0000-000000000202', id, '00000000-0000-0000-0000-000000000202'
from public.roles where code = 'SUPER_ADMIN';

set local role anon;
select throws_ok($$select * from public.audit_logs$$, '42501', 'permission denied for table audit_logs', 'anonymous users cannot read audit history');
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
set local role authenticated;
select is((select count(*) from public.audit_logs), 0::bigint, 'normal authenticated users cannot read audit history');
select throws_ok(
  $$insert into public.announcements (title, message, lifecycle) values ('Blocked Phase 8B fixture', 'DEVELOPMENT TEST — NOT OFFICIAL', 'DRAFT')$$,
  '42501', 'new row violates row-level security policy for table "announcements"',
  'normal authenticated users cannot create CMS content'
);
select throws_ok(
  $$insert into public.audit_logs (actor_user_id, action, entity_type, entity_id) values ('00000000-0000-0000-0000-000000000201', 'forged', 'announcement', 1)$$,
  '42501', 'permission denied for table audit_logs',
  'normal users cannot forge audit rows'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000202', true);
set local role authenticated;
select lives_ok(
  $$insert into public.announcements (title, message, category, lifecycle, verification_status, source_type, source_id) values ('DEVELOPMENT DEMO — NOT OFFICIAL', 'Phase 8B test fixture.', 'GENERAL', 'DRAFT', 'DEMO_ONLY', 'DEVELOPMENT_TEST', 'PHASE8B-AUDIT-ANNOUNCEMENT')$$,
  'SUPER_ADMIN can create an announcement through existing RLS'
);
select is((select count(*) from public.audit_logs where action = 'announcement_created' and metadata ->> 'source_id' = 'PHASE8B-AUDIT-ANNOUNCEMENT'), 1::bigint, 'announcement creation is audited');
select lives_ok(
  $$update public.announcements set lifecycle = 'PUBLISHED', is_public = true, published_at = now(), effective_at = now() where source_id = 'PHASE8B-AUDIT-ANNOUNCEMENT'$$,
  'SUPER_ADMIN can publish an announcement through existing RLS'
);
select is((select count(*) from public.audit_logs where action = 'announcement_published' and metadata ->> 'source_id' = 'PHASE8B-AUDIT-ANNOUNCEMENT'), 1::bigint, 'announcement publication is audited');
select lives_ok(
  $$insert into public.events (title, description, starts_at, lifecycle, verification_status, source_type, source_id) values ('DEVELOPMENT DEMO EVENT — NOT OFFICIAL', 'Phase 8B test fixture.', now() + interval '1 day', 'DRAFT', 'DEMO_ONLY', 'DEVELOPMENT_TEST', 'PHASE8B-AUDIT-EVENT')$$,
  'SUPER_ADMIN can create an event through existing RLS'
);
select is((select count(*) from public.audit_logs where action = 'event_created' and metadata ->> 'source_id' = 'PHASE8B-AUDIT-EVENT'), 1::bigint, 'event creation is audited');
select lives_ok($$delete from public.events where source_id = 'PHASE8B-AUDIT-EVENT'$$, 'SUPER_ADMIN can delete an event through existing RLS');
select is((select count(*) from public.audit_logs where action = 'event_deleted' and metadata ->> 'source_id' = 'PHASE8B-AUDIT-EVENT'), 1::bigint, 'event deletion is audited');
select ok((select count(*) >= 4 from public.audit_logs), 'SUPER_ADMIN can read the trusted audit rows');
select ok((select bool_and(not (metadata ?| array['password', 'token', 'access_token', 'refresh_token'])) from public.audit_logs), 'audit metadata contains no credential fields');
select throws_ok(
  $$insert into public.audit_logs (actor_user_id, action, entity_type, entity_id) values ('00000000-0000-0000-0000-000000000202', 'forged', 'announcement', 1)$$,
  '42501', 'permission denied for table audit_logs',
  'SUPER_ADMIN clients cannot bypass trusted audit triggers'
);
reset role;

select ok(not has_function_privilege('authenticated', 'private.record_admin_content_audit()', 'EXECUTE'), 'authenticated clients cannot execute the audit function');
select ok(not has_function_privilege('anon', 'private.record_admin_content_audit()', 'EXECUTE'), 'anonymous clients cannot execute the audit function');

select * from finish();
rollback;
