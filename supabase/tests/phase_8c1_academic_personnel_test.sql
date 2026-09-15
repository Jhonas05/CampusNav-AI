begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

select ok(to_regclass('public.personnel') is not null, 'personnel table exists');
select ok(to_regclass('public.courses') is not null, 'courses table exists');
select ok(to_regclass('public.academic_sections') is not null, 'academic_sections table exists');
select ok(to_regclass('public.class_schedules') is not null, 'class_schedules table exists');
select ok(to_regclass('public.schedule_exceptions') is not null, 'schedule_exceptions table exists');
select ok(to_regclass('public.personnel_facility_assignments') is not null, 'personnel_facility_assignments table exists');
select ok(to_regclass('public.personnel_consultation_hours') is not null, 'personnel_consultation_hours table exists');
select ok(to_regclass('public.personnel_checkins') is not null, 'personnel_checkins table exists');
select ok(to_regclass('public.personnel_availability_overrides') is not null, 'personnel_availability_overrides table exists');
select ok(to_regclass('public.dashboard_refresh_events') is not null, 'safe Dashboard refresh signal table exists');

select ok(
  not exists (
    select 1 from pg_class
    where oid in (
      'public.personnel'::regclass,
      'public.courses'::regclass,
      'public.academic_sections'::regclass,
      'public.class_schedules'::regclass,
      'public.schedule_exceptions'::regclass,
      'public.personnel_facility_assignments'::regclass,
      'public.personnel_consultation_hours'::regclass,
      'public.personnel_checkins'::regclass,
      'public.personnel_availability_overrides'::regclass,
      'public.dashboard_refresh_events'::regclass
    ) and not relrowsecurity
  ),
  'RLS is enabled on every Phase 8C.1 public table'
);

select ok(
  not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'public_personnel' and column_name = 'employee_reference'
  ),
  'public personnel projection omits employee reference'
);
select ok(
  not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name in ('public_class_schedules', 'active_personnel_checkins') and column_name = 'created_by'
  ),
  'public schedule/check-in projections omit auth user identifiers'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000c01', 'authenticated', 'authenticated', 'ordinary@phase8c.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000c02', 'authenticated', 'authenticated', 'faculty@phase8c.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000c03', 'authenticated', 'authenticated', 'department-admin@phase8c.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000c04', 'authenticated', 'authenticated', 'super-admin@phase8c.test', '', now(), '{}', '{}', now(), now());

insert into public.departments (code, name) values
  ('PHASE8C_TEST', 'DEMO / DEVELOPMENT / NOT OFFICIAL'),
  ('PHASE8C_OTHER', 'DEMO / DEVELOPMENT / NOT OFFICIAL — other');

insert into public.user_roles (user_id, role_id, department_id, assigned_by)
select '00000000-0000-0000-0000-000000000c03', roles.id, departments.id, '00000000-0000-0000-0000-000000000c04'
from public.roles cross join public.departments
where roles.code = 'DEPARTMENT_ADMIN' and departments.code = 'PHASE8C_TEST';

insert into public.user_roles (user_id, role_id, assigned_by)
select '00000000-0000-0000-0000-000000000c04', id, '00000000-0000-0000-0000-000000000c04'
from public.roles where code = 'SUPER_ADMIN';

insert into public.user_roles (user_id, role_id, assigned_by)
select '00000000-0000-0000-0000-000000000c02', id, '00000000-0000-0000-0000-000000000c04'
from public.roles where code = 'FACULTY';

insert into public.personnel (employee_reference, first_name, last_name, display_name, department_id, personnel_type, public_visibility, active, verification_status)
select 'DEVELOPMENT-ONLY', 'Development', 'Faculty', 'DEMO / DEVELOPMENT / NOT OFFICIAL', id, 'FACULTY', true, true, 'DEMO_ONLY'
from public.departments where code = 'PHASE8C_TEST';

insert into public.personnel (first_name, last_name, display_name, department_id, personnel_type, public_visibility, active, verification_status)
select 'Hidden', 'Draft', 'Hidden development fixture', id, 'STAFF', false, true, 'PENDING_VERIFICATION'
from public.departments where code = 'PHASE8C_TEST';

insert into private.personnel_auth_links (personnel_id, user_id, linked_by)
select id, '00000000-0000-0000-0000-000000000c02', '00000000-0000-0000-0000-000000000c04'
from public.personnel where employee_reference = 'DEVELOPMENT-ONLY';

insert into public.courses (code, name, department_id, public_visibility, active, verification_status)
select 'DEV8C1', 'DEMO / DEVELOPMENT / NOT OFFICIAL', id, true, true, 'DEMO_ONLY'
from public.departments where code = 'PHASE8C_TEST';

insert into public.academic_sections (program, year_level, section_name, department_id, public_visibility, active, verification_status)
select 'DEV', 1, 'TEST', id, true, true, 'DEMO_ONLY'
from public.departments where code = 'PHASE8C_TEST';

insert into public.class_schedules (
  department_id, course_id, section_id, personnel_id, facility_id, day_of_week,
  start_time, end_time, effective_from, effective_until, status, public_visibility,
  verification_status, source_type, source_id, created_by
)
select d.id, c.id, s.id, p.id, 'library', extract(dow from current_date)::smallint,
  '13:00', '14:30', current_date, current_date + 7, 'ACTIVE', true,
  'DEMO_ONLY', 'DEVELOPMENT_TEST', 'PHASE8C-PGTAP-CLASS', '00000000-0000-0000-0000-000000000c04'
from public.departments d
join public.courses c on c.department_id = d.id
join public.academic_sections s on s.department_id = d.id
join public.personnel p on p.department_id = d.id and p.employee_reference = 'DEVELOPMENT-ONLY'
where d.code = 'PHASE8C_TEST';

select set_config('request.jwt.claim.sub', '', true);
set local role anon;
select is((select count(*) from public.public_personnel), 1::bigint, 'anonymous users see only approved public personnel');
select is((select count(*) from public.public_class_schedules), 1::bigint, 'anonymous users see verified public schedules');
select throws_ok($$select * from public.personnel$$, '42501', 'permission denied for table personnel', 'anonymous users cannot read raw personnel rows');
select throws_ok(
  $$insert into public.personnel_checkins (department_id, personnel_id, facility_id, source) values (1, 1, 'library', 'ADMIN')$$,
  '42501', 'permission denied for table personnel_checkins',
  'anonymous users cannot create physical-presence records'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000c01', true);
set local role authenticated;
select throws_ok(
  $$insert into public.personnel_checkins (department_id, personnel_id, facility_id, source) select department_id, id, 'library', 'STAFF_SELF_SERVICE' from public.public_personnel limit 1$$,
  '42501', 'new row violates row-level security policy for table "personnel_checkins"',
  'ordinary authenticated users cannot create check-ins'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000c02', true);
set local role authenticated;
select throws_ok(
  $$insert into public.personnel_checkins (department_id, personnel_id, facility_id, source) select department_id, id, 'library', 'STAFF_SELF_SERVICE' from public.public_personnel limit 1$$,
  '42501', 'new row violates row-level security policy for table "personnel_checkins"',
  'a linked faculty login still cannot self-assert physical presence'
);
select lives_ok(
  $$insert into public.personnel_availability_overrides (department_id, personnel_id, starts_at, ends_at, override_type) select department_id, id, now(), now() + interval '1 hour', 'UNAVAILABLE' from public.public_personnel limit 1$$,
  'linked faculty may create only their own private pending availability override'
);
select is((select count(*) from public.personnel_availability_overrides where public_visibility), 0::bigint, 'faculty self-service override remains private');
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000c03', true);
set local role authenticated;
select lives_ok(
  $$insert into public.personnel_facility_assignments (department_id, personnel_id, facility_id, day_of_week, start_time, end_time, effective_from, source_type, source_id, created_by) select department_id, id, 'library', extract(dow from current_date)::smallint, '08:00', '17:00', current_date, 'DEVELOPMENT_TEST', 'PHASE8C-DEPT-ASSIGNMENT', '00000000-0000-0000-0000-000000000c03' from public.public_personnel where display_name = 'DEMO / DEVELOPMENT / NOT OFFICIAL'$$,
  'department admin can manage own-department assignments'
);
select throws_ok(
  $$insert into public.personnel (first_name, last_name, display_name, department_id, personnel_type) select 'Blocked', 'Cross Department', 'Blocked cross-department fixture', id, 'STAFF' from public.departments where code = 'PHASE8C_OTHER'$$,
  '42501', 'new row violates row-level security policy for table "personnel"',
  'department admin cannot manage another department'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000c04', true);
set local role authenticated;
select lives_ok(
  $$insert into public.personnel_checkins (department_id, personnel_id, facility_id, source, source_reference, created_by) select department_id, id, 'library', 'ADMIN', 'DEVELOPMENT TEST — NOT OFFICIAL', '00000000-0000-0000-0000-000000000c04' from public.public_personnel where display_name = 'DEMO / DEVELOPMENT / NOT OFFICIAL'$$,
  'SUPER_ADMIN can create a trusted active check-in'
);
select is((select count(*) from public.active_personnel_checkins), 1::bigint, 'public safe projection exposes only the active authorized check-in');
select is((
  select count(*)
  from public.audit_logs
  where entity_type = 'personnel_checkin'
    and action = 'personnel_checkin_created'
    and entity_id = (select id from public.personnel_checkins where status = 'ACTIVE' limit 1)
), 1::bigint, 'check-in creation is audited');
select lives_ok(
  $$update public.personnel_checkins set status = 'CLOSED', checked_out_at = clock_timestamp() + interval '1 second' where status = 'ACTIVE'$$,
  'SUPER_ADMIN can close the trusted check-in'
);
select is((select count(*) from public.active_personnel_checkins), 0::bigint, 'closed check-in is removed from public presence projection');
select ok((select count(*) > 0 from public.dashboard_refresh_events), 'schedule/personnel writes emit safe Dashboard refresh events');
reset role;
select ok(
  exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'dashboard_refresh_events'
  ),
  'safe Dashboard refresh events are published to Realtime'
);
select ok(not has_table_privilege('anon', 'public.personnel_checkins', 'INSERT'), 'anonymous role has no check-in INSERT grant');
select ok(not has_table_privilege('anon', 'public.personnel_availability_overrides', 'INSERT'), 'anonymous role has no availability-override INSERT grant');
select ok(not has_function_privilege('authenticated', 'private.record_phase8c_audit()', 'EXECUTE'), 'clients cannot execute the audit trigger directly');
select ok(not has_function_privilege('authenticated', 'private.emit_dashboard_refresh()', 'EXECUTE'), 'clients cannot forge Dashboard refresh events');

select * from finish();
rollback;
