begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

select ok(
  enum_range(null::public.personnel_type)::text[] @> array['FACULTY', 'STAFF', 'LAB_PERSONNEL', 'OFFICE_PERSONNEL', 'ADMINISTRATIVE'],
  'approved Phase 8C.2 personnel types exist'
);
select ok(
  (select is_nullable = 'YES' from information_schema.columns where table_schema = 'public' and table_name = 'personnel_consultation_hours' and column_name = 'facility_id'),
  'consultation facility is optional'
);
select ok(
  (select count(*) = 3 from pg_constraint where conrelid = 'public.class_schedules'::regclass and conname in (
    'class_schedules_room_conflict_exclusion',
    'class_schedules_professor_conflict_exclusion',
    'class_schedules_section_conflict_exclusion'
  )),
  'room, professor, and section conflicts are database-enforced'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000008c21', 'authenticated', 'authenticated', 'ordinary@phase8c2.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000008c22', 'authenticated', 'authenticated', 'admin@phase8c2.test', '', now(), '{}', '{}', now(), now());

insert into public.user_roles (user_id, role_id, assigned_by)
select '00000000-0000-0000-0000-000000008c22', id, '00000000-0000-0000-0000-000000008c22'
from public.roles where code = 'SUPER_ADMIN';

insert into public.departments (code, name) values ('PHASE8C2_TEST', 'DEMO / DEVELOPMENT / NOT OFFICIAL');

insert into public.personnel (first_name, last_name, display_name, department_id, personnel_type, public_visibility, active, verification_status)
select value.first_name, 'Test', value.display_name, d.id, value.personnel_type::public.personnel_type, true, true, 'DEMO_ONLY'
from public.departments d
cross join (values
  ('Faculty', 'DEMO / DEVELOPMENT / NOT OFFICIAL — Faculty', 'FACULTY'),
  ('Lab', 'DEMO / DEVELOPMENT / NOT OFFICIAL — Lab', 'LAB_PERSONNEL')
) value(first_name, display_name, personnel_type)
where d.code = 'PHASE8C2_TEST';

insert into public.courses (code, name, department_id, public_visibility, active, verification_status)
select 'DEV8C2', 'DEMO / DEVELOPMENT / NOT OFFICIAL', id, true, true, 'DEMO_ONLY'
from public.departments where code = 'PHASE8C2_TEST';

insert into public.academic_sections (program, year_level, section_name, department_id, public_visibility, active, verification_status)
select 'DEV', 1, value.section_name, d.id, true, true, 'DEMO_ONLY'
from public.departments d cross join (values ('A'), ('B')) value(section_name)
where d.code = 'PHASE8C2_TEST';

insert into public.class_schedules (
  department_id, course_id, section_id, personnel_id, facility_id, day_of_week,
  start_time, end_time, effective_from, effective_until, status, public_visibility,
  verification_status, source_type, source_id, created_by
)
select d.id, c.id, s.id, p.id, 'library', 1, '09:00', '10:00', current_date, current_date + 30,
  'ACTIVE', true, 'DEMO_ONLY', 'DEVELOPMENT_TEST', 'PHASE8C2-BASE', '00000000-0000-0000-0000-000000008c22'
from public.departments d
join public.courses c on c.department_id = d.id
join public.academic_sections s on s.department_id = d.id and s.section_name = 'A'
join public.personnel p on p.department_id = d.id and p.personnel_type = 'FACULTY'
where d.code = 'PHASE8C2_TEST';

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000008c21', true);
set local role authenticated;
select throws_ok(
  $$update public.class_schedules set start_time = '08:00' where source_id = 'PHASE8C2-BASE'$$,
  '42501',
  'permission denied for table class_schedules',
  'ordinary authenticated users cannot administer schedules'
);
select is((select start_time::text from public.public_class_schedules where id = (select id from public.public_class_schedules limit 1)), '09:00:00', 'ordinary authenticated user cannot change the schedule');
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000008c22', true);
set local role authenticated;
select lives_ok(
  $$insert into public.personnel_consultation_hours (department_id, personnel_id, facility_id, day_of_week, start_time, end_time, effective_from, public_visibility, verification_status, created_by) select department_id, id, null, 1, '13:00', '14:00', current_date, true, 'DEMO_ONLY', '00000000-0000-0000-0000-000000008c22' from public.personnel where display_name like '%Faculty'$$,
  'SUPER_ADMIN can create facility-optional consultation hours'
);
select throws_ok(
  $$insert into public.class_schedules (department_id, course_id, section_id, personnel_id, facility_id, day_of_week, start_time, end_time, effective_from, effective_until, status, public_visibility, verification_status, created_by) select d.id, c.id, s.id, p.id, 'library', 1, '09:30', '10:30', current_date, current_date + 30, 'ACTIVE', true, 'DEMO_ONLY', '00000000-0000-0000-0000-000000008c22' from public.departments d join public.courses c on c.department_id=d.id join public.academic_sections s on s.department_id=d.id and s.section_name='B' join public.personnel p on p.department_id=d.id and p.personnel_type='LAB_PERSONNEL' where d.code='PHASE8C2_TEST'$$,
  '23P01',
  null,
  'same room overlap is rejected'
);
select throws_ok(
  $$insert into public.class_schedules (department_id, course_id, section_id, personnel_id, facility_id, day_of_week, start_time, end_time, effective_from, effective_until, status, public_visibility, verification_status, created_by) select d.id, c.id, s.id, p.id, 'computer-laboratory', 1, '09:30', '10:30', current_date, current_date + 30, 'ACTIVE', true, 'DEMO_ONLY', '00000000-0000-0000-0000-000000008c22' from public.departments d join public.courses c on c.department_id=d.id join public.academic_sections s on s.department_id=d.id and s.section_name='B' join public.personnel p on p.department_id=d.id and p.personnel_type='FACULTY' where d.code='PHASE8C2_TEST'$$,
  '23P01',
  null,
  'same professor overlap is rejected'
);
select throws_ok(
  $$insert into public.class_schedules (department_id, course_id, section_id, personnel_id, facility_id, day_of_week, start_time, end_time, effective_from, effective_until, status, public_visibility, verification_status, created_by) select d.id, c.id, s.id, p.id, 'virtual-laboratory', 1, '09:30', '10:30', current_date, current_date + 30, 'ACTIVE', true, 'DEMO_ONLY', '00000000-0000-0000-0000-000000008c22' from public.departments d join public.courses c on c.department_id=d.id join public.academic_sections s on s.department_id=d.id and s.section_name='A' join public.personnel p on p.department_id=d.id and p.personnel_type='LAB_PERSONNEL' where d.code='PHASE8C2_TEST'$$,
  '23P01',
  null,
  'same section overlap is rejected'
);
select lives_ok(
  $$update public.class_schedules set start_time = '10:00', end_time = '11:00' where id = (select id from public.class_schedules limit 1)$$,
  'SUPER_ADMIN can edit a non-conflicting class schedule'
);
select lives_ok(
  $$update public.class_schedules set status = 'CANCELLED' where id = (select id from public.class_schedules limit 1)$$,
  'SUPER_ADMIN can cancel a class schedule without deleting history'
);
select ok((select count(*) > 0 from public.dashboard_refresh_events where domain = 'ACADEMIC'), 'academic updates emit the existing Realtime Dashboard signal');
select ok((select count(*) > 0 from public.audit_logs where entity_type = 'class_schedule' and action = 'class_schedule_cancelled' and entity_id = (select id from public.class_schedules limit 1)), 'class cancellation uses the existing trusted audit stream');
reset role;

select * from finish();
rollback;
