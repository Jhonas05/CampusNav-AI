-- CampusNav Phase 8C.1 academic schedule and personnel data foundation.
--
-- Privacy invariant: a schedule is not evidence of physical presence. Only an
-- active, trusted personnel_checkins row may produce CHECKED_IN. Public clients
-- read deliberately narrow views; raw personnel/schedule tables remain behind
-- role-scoped RLS.

create type public.personnel_type as enum ('FACULTY', 'STAFF', 'ADMINISTRATION');
create type public.schedule_record_status as enum ('ACTIVE', 'INACTIVE', 'CANCELLED');
create type public.schedule_exception_type as enum ('CANCELLED', 'RESCHEDULED', 'ROOM_CHANGED', 'PROFESSOR_CHANGED', 'TIME_CHANGED');
create type public.personnel_checkin_status as enum ('ACTIVE', 'CLOSED');
create type public.personnel_checkin_source as enum ('ADMIN', 'QR_CHECKPOINT', 'STAFF_SELF_SERVICE');
create type public.availability_override_type as enum ('UNAVAILABLE', 'LEAVE', 'SPECIAL_ASSIGNMENT');

create table public.personnel (
  id bigint generated always as identity primary key,
  employee_reference text,
  first_name text not null,
  middle_name text,
  last_name text not null,
  display_name text not null,
  department_id bigint not null references public.departments(id) on delete restrict,
  personnel_type public.personnel_type not null,
  public_visibility boolean not null default false,
  active boolean not null default true,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint personnel_employee_reference_length check (employee_reference is null or char_length(employee_reference) between 1 and 120),
  constraint personnel_first_name_length check (char_length(first_name) between 1 and 120),
  constraint personnel_middle_name_length check (middle_name is null or char_length(middle_name) between 1 and 120),
  constraint personnel_last_name_length check (char_length(last_name) between 1 and 120),
  constraint personnel_display_name_length check (char_length(display_name) between 1 and 240),
  unique (id, department_id)
);

create unique index personnel_employee_reference_unique_idx
on public.personnel (employee_reference)
where employee_reference is not null;
create index personnel_department_active_idx on public.personnel (department_id, active);
create index personnel_public_search_idx on public.personnel (public_visibility, active, display_name);

create table private.personnel_auth_links (
  personnel_id bigint primary key references public.personnel(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  linked_by uuid references auth.users(id) on delete set null,
  linked_at timestamptz not null default now()
);

revoke all on table private.personnel_auth_links from public, anon, authenticated;

create table public.courses (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  department_id bigint not null references public.departments(id) on delete restrict,
  public_visibility boolean not null default false,
  active boolean not null default true,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_code_format check (code ~ '^[A-Za-z0-9][A-Za-z0-9 .&()/_-]{0,39}$'),
  constraint courses_name_length check (char_length(name) between 1 and 240),
  unique (id, department_id)
);

create index courses_department_active_idx on public.courses (department_id, active);

create table public.academic_sections (
  id bigint generated always as identity primary key,
  program text not null,
  year_level smallint not null,
  section_name text not null,
  department_id bigint not null references public.departments(id) on delete restrict,
  public_visibility boolean not null default false,
  active boolean not null default true,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academic_sections_program_length check (char_length(program) between 1 and 120),
  constraint academic_sections_year_level_range check (year_level between 1 and 12),
  constraint academic_sections_name_length check (char_length(section_name) between 1 and 80),
  unique (department_id, program, year_level, section_name),
  unique (id, department_id)
);

create index academic_sections_department_active_idx on public.academic_sections (department_id, active);

create table public.class_schedules (
  id bigint generated always as identity primary key,
  department_id bigint not null references public.departments(id) on delete restrict,
  course_id bigint not null,
  section_id bigint not null,
  personnel_id bigint not null,
  facility_id text not null,
  day_of_week smallint not null,
  start_time time not null,
  end_time time not null,
  effective_from date not null,
  effective_until date,
  status public.schedule_record_status not null default 'ACTIVE',
  public_visibility boolean not null default false,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  source_type text not null default 'SUPABASE',
  source_id text,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_schedules_course_department_fk foreign key (course_id, department_id) references public.courses(id, department_id) on delete restrict,
  constraint class_schedules_section_department_fk foreign key (section_id, department_id) references public.academic_sections(id, department_id) on delete restrict,
  constraint class_schedules_personnel_department_fk foreign key (personnel_id, department_id) references public.personnel(id, department_id) on delete restrict,
  constraint class_schedules_facility_id_format check (facility_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint class_schedules_day_range check (day_of_week between 0 and 6),
  constraint class_schedules_time_order check (end_time > start_time),
  constraint class_schedules_effective_range check (effective_until is null or effective_until >= effective_from),
  constraint class_schedules_source_type_length check (char_length(source_type) between 1 and 80),
  constraint class_schedules_source_id_length check (source_id is null or char_length(source_id) between 1 and 160),
  unique (id, department_id)
);

create unique index class_schedules_source_unique_idx on public.class_schedules (source_type, source_id) where source_id is not null;
create index class_schedules_today_idx on public.class_schedules (day_of_week, effective_from, effective_until) where status = 'ACTIVE';
create index class_schedules_facility_idx on public.class_schedules (facility_id, day_of_week, start_time) where status = 'ACTIVE';
create index class_schedules_personnel_idx on public.class_schedules (personnel_id, day_of_week, start_time) where status = 'ACTIVE';
create index class_schedules_section_idx on public.class_schedules (section_id, day_of_week, start_time) where status = 'ACTIVE';
create index class_schedules_department_idx on public.class_schedules (department_id);

create table public.schedule_exceptions (
  id bigint generated always as identity primary key,
  department_id bigint not null references public.departments(id) on delete restrict,
  class_schedule_id bigint not null,
  exception_date date not null,
  exception_type public.schedule_exception_type not null,
  replacement_facility_id text,
  replacement_personnel_id bigint,
  replacement_start_time time,
  replacement_end_time time,
  reason text,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  source_type text not null default 'SUPABASE',
  source_id text,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_exceptions_schedule_department_fk foreign key (class_schedule_id, department_id) references public.class_schedules(id, department_id) on delete cascade,
  constraint schedule_exceptions_personnel_department_fk foreign key (replacement_personnel_id, department_id) references public.personnel(id, department_id) on delete restrict,
  constraint schedule_exceptions_facility_id_format check (replacement_facility_id is null or replacement_facility_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint schedule_exceptions_time_pair check ((replacement_start_time is null) = (replacement_end_time is null)),
  constraint schedule_exceptions_time_order check (replacement_end_time is null or replacement_end_time > replacement_start_time),
  constraint schedule_exceptions_required_override check (
    exception_type = 'CANCELLED'
    or (exception_type = 'ROOM_CHANGED' and replacement_facility_id is not null)
    or (exception_type = 'PROFESSOR_CHANGED' and replacement_personnel_id is not null)
    or (exception_type = 'TIME_CHANGED' and replacement_start_time is not null)
    or (exception_type = 'RESCHEDULED' and (replacement_facility_id is not null or replacement_personnel_id is not null or replacement_start_time is not null))
  ),
  constraint schedule_exceptions_reason_length check (reason is null or char_length(reason) <= 1000),
  unique (class_schedule_id, exception_date),
  unique (id, department_id)
);

create unique index schedule_exceptions_source_unique_idx on public.schedule_exceptions (source_type, source_id) where source_id is not null;
create index schedule_exceptions_date_idx on public.schedule_exceptions (exception_date, class_schedule_id);
create index schedule_exceptions_department_idx on public.schedule_exceptions (department_id);

create table public.personnel_facility_assignments (
  id bigint generated always as identity primary key,
  department_id bigint not null references public.departments(id) on delete restrict,
  personnel_id bigint not null,
  facility_id text not null,
  role_label text,
  day_of_week smallint not null,
  start_time time not null,
  end_time time not null,
  effective_from date not null,
  effective_until date,
  public_visibility boolean not null default false,
  active boolean not null default true,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  source_type text not null default 'SUPABASE',
  source_id text,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint personnel_facility_assignments_personnel_department_fk foreign key (personnel_id, department_id) references public.personnel(id, department_id) on delete cascade,
  constraint personnel_facility_assignments_facility_id_format check (facility_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint personnel_facility_assignments_day_range check (day_of_week between 0 and 6),
  constraint personnel_facility_assignments_time_order check (end_time > start_time),
  constraint personnel_facility_assignments_effective_range check (effective_until is null or effective_until >= effective_from),
  constraint personnel_facility_assignments_role_length check (role_label is null or char_length(role_label) <= 160),
  unique (id, department_id)
);

create unique index personnel_facility_assignments_source_unique_idx on public.personnel_facility_assignments (source_type, source_id) where source_id is not null;
create index personnel_facility_assignments_personnel_idx on public.personnel_facility_assignments (personnel_id, day_of_week, start_time) where active;
create index personnel_facility_assignments_facility_idx on public.personnel_facility_assignments (facility_id, day_of_week, start_time) where active;
create index personnel_facility_assignments_department_idx on public.personnel_facility_assignments (department_id);

create table public.personnel_consultation_hours (
  id bigint generated always as identity primary key,
  department_id bigint not null references public.departments(id) on delete restrict,
  personnel_id bigint not null,
  facility_id text not null,
  day_of_week smallint not null,
  start_time time not null,
  end_time time not null,
  effective_from date not null,
  effective_until date,
  public_visibility boolean not null default false,
  active boolean not null default true,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  source_type text not null default 'SUPABASE',
  source_id text,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint personnel_consultation_hours_personnel_department_fk foreign key (personnel_id, department_id) references public.personnel(id, department_id) on delete cascade,
  constraint personnel_consultation_hours_facility_id_format check (facility_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint personnel_consultation_hours_day_range check (day_of_week between 0 and 6),
  constraint personnel_consultation_hours_time_order check (end_time > start_time),
  constraint personnel_consultation_hours_effective_range check (effective_until is null or effective_until >= effective_from),
  unique (id, department_id)
);

create unique index personnel_consultation_hours_source_unique_idx on public.personnel_consultation_hours (source_type, source_id) where source_id is not null;
create index personnel_consultation_hours_personnel_idx on public.personnel_consultation_hours (personnel_id, day_of_week, start_time) where active;
create index personnel_consultation_hours_facility_idx on public.personnel_consultation_hours (facility_id, day_of_week, start_time) where active;
create index personnel_consultation_hours_department_idx on public.personnel_consultation_hours (department_id);

create table public.personnel_checkins (
  id bigint generated always as identity primary key,
  department_id bigint not null references public.departments(id) on delete restrict,
  personnel_id bigint not null,
  facility_id text not null,
  checked_in_at timestamptz not null default now(),
  checked_out_at timestamptz,
  status public.personnel_checkin_status not null default 'ACTIVE',
  source public.personnel_checkin_source not null,
  source_reference text,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint personnel_checkins_personnel_department_fk foreign key (personnel_id, department_id) references public.personnel(id, department_id) on delete cascade,
  constraint personnel_checkins_facility_id_format check (facility_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint personnel_checkins_time_order check (checked_out_at is null or checked_out_at > checked_in_at),
  constraint personnel_checkins_status_time_check check ((status = 'ACTIVE' and checked_out_at is null) or (status = 'CLOSED' and checked_out_at is not null)),
  constraint personnel_checkins_source_reference_length check (source_reference is null or char_length(source_reference) <= 160),
  unique (id, department_id)
);

create unique index personnel_checkins_one_active_idx on public.personnel_checkins (personnel_id) where status = 'ACTIVE' and checked_out_at is null;
create index personnel_checkins_facility_active_idx on public.personnel_checkins (facility_id, checked_in_at desc) where status = 'ACTIVE' and checked_out_at is null;
create index personnel_checkins_personnel_history_idx on public.personnel_checkins (personnel_id, checked_in_at desc);
create index personnel_checkins_department_idx on public.personnel_checkins (department_id);

create table public.personnel_availability_overrides (
  id bigint generated always as identity primary key,
  department_id bigint not null references public.departments(id) on delete restrict,
  personnel_id bigint not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  override_type public.availability_override_type not null,
  reason text,
  public_visibility boolean not null default false,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  source_type text not null default 'SUPABASE',
  source_id text,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint personnel_availability_overrides_personnel_department_fk foreign key (personnel_id, department_id) references public.personnel(id, department_id) on delete cascade,
  constraint personnel_availability_overrides_time_order check (ends_at > starts_at),
  constraint personnel_availability_overrides_reason_length check (reason is null or char_length(reason) <= 1000),
  unique (id, department_id)
);

create unique index personnel_availability_overrides_source_unique_idx on public.personnel_availability_overrides (source_type, source_id) where source_id is not null;
create index personnel_availability_overrides_personnel_time_idx on public.personnel_availability_overrides (personnel_id, starts_at, ends_at);
create index personnel_availability_overrides_department_idx on public.personnel_availability_overrides (department_id);

-- Public Realtime listeners subscribe to this non-sensitive signal rather than
-- raw schedule/check-in rows. The signal contains no person, facility, or row ID.
create table public.dashboard_refresh_events (
  id bigint generated always as identity primary key,
  domain text not null,
  occurred_at timestamptz not null default now(),
  constraint dashboard_refresh_events_domain_check check (domain in ('ACADEMIC', 'PERSONNEL'))
);

create index dashboard_refresh_events_occurred_at_idx on public.dashboard_refresh_events (occurred_at desc);

create trigger personnel_touch_updated_at before update on public.personnel for each row execute function private.touch_updated_at();
create trigger courses_touch_updated_at before update on public.courses for each row execute function private.touch_updated_at();
create trigger academic_sections_touch_updated_at before update on public.academic_sections for each row execute function private.touch_updated_at();
create trigger class_schedules_touch_updated_at before update on public.class_schedules for each row execute function private.touch_updated_at();
create trigger schedule_exceptions_touch_updated_at before update on public.schedule_exceptions for each row execute function private.touch_updated_at();
create trigger personnel_facility_assignments_touch_updated_at before update on public.personnel_facility_assignments for each row execute function private.touch_updated_at();
create trigger personnel_consultation_hours_touch_updated_at before update on public.personnel_consultation_hours for each row execute function private.touch_updated_at();
create trigger personnel_checkins_touch_updated_at before update on public.personnel_checkins for each row execute function private.touch_updated_at();
create trigger personnel_availability_overrides_touch_updated_at before update on public.personnel_availability_overrides for each row execute function private.touch_updated_at();

create function private.can_self_manage_personnel(target_personnel_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and private.has_any_role(array['FACULTY', 'STAFF']::public.app_role[])
    and exists (
      select 1
      from private.personnel_auth_links link
      where link.user_id = (select auth.uid())
        and link.personnel_id = target_personnel_id
    );
$$;

revoke execute on function private.can_self_manage_personnel(bigint) from public, anon;
grant execute on function private.can_self_manage_personnel(bigint) to authenticated;

-- Explicit account linkage is a trusted SUPER_ADMIN operation. CampusNav never
-- guesses a personnel record from an email address or profile display name.
create function public.link_personnel_account(target_personnel_id bigint, target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_any_role(array['SUPER_ADMIN']::public.app_role[]) then
    raise exception 'SUPER_ADMIN is required';
  end if;

  if not exists (select 1 from public.personnel p where p.id = target_personnel_id and p.active) then
    raise exception 'Active personnel record not found';
  end if;

  if not exists (select 1 from auth.users u where u.id = target_user_id) then
    raise exception 'Auth user not found';
  end if;

  insert into private.personnel_auth_links (personnel_id, user_id, linked_by)
  values (target_personnel_id, target_user_id, (select auth.uid()))
  on conflict (personnel_id) do update
  set user_id = excluded.user_id,
      linked_by = excluded.linked_by,
      linked_at = now();

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values ((select auth.uid()), 'personnel_account_linked', 'personnel', target_personnel_id, jsonb_build_object('operation', 'link'));
end;
$$;

revoke execute on function public.link_personnel_account(bigint, uuid) from public, anon;
grant execute on function public.link_personnel_account(bigint, uuid) to authenticated;

create function private.enforce_safe_checkin_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Direct trusted database maintenance is outside end-user RLS.
  if (select auth.uid()) is null
    or private.can_manage_content(new.department_id, array['DEPARTMENT_ADMIN']::public.app_role[])
  then
    return new;
  end if;

  if private.can_self_manage_personnel(old.personnel_id)
    and old.status = 'ACTIVE'
    and new.status = 'CLOSED'
    and new.checked_out_at is not null
    and new.checked_out_at between now() - interval '5 minutes' and now() + interval '1 minute'
    and new.personnel_id is not distinct from old.personnel_id
    and new.department_id is not distinct from old.department_id
    and new.facility_id is not distinct from old.facility_id
    and new.checked_in_at is not distinct from old.checked_in_at
    and new.source is not distinct from old.source
    and new.source_reference is not distinct from old.source_reference
    and new.created_by is not distinct from old.created_by
  then
    return new;
  end if;

  raise exception 'Only a trusted manager may change check-in details; linked personnel may only close their own active check-in';
end;
$$;

revoke execute on function private.enforce_safe_checkin_update() from public, anon, authenticated;
create trigger personnel_checkins_enforce_safe_update
before update on public.personnel_checkins
for each row execute function private.enforce_safe_checkin_update();

create function private.emit_dashboard_refresh()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  refresh_domain text;
begin
  refresh_domain := case
    when tg_table_name in ('courses', 'academic_sections', 'class_schedules', 'schedule_exceptions') then 'ACADEMIC'
    else 'PERSONNEL'
  end;

  insert into public.dashboard_refresh_events (domain) values (refresh_domain);

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke execute on function private.emit_dashboard_refresh() from public, anon, authenticated;

create trigger personnel_emit_dashboard_refresh after insert or update or delete on public.personnel for each statement execute function private.emit_dashboard_refresh();
create trigger courses_emit_dashboard_refresh after insert or update or delete on public.courses for each statement execute function private.emit_dashboard_refresh();
create trigger academic_sections_emit_dashboard_refresh after insert or update or delete on public.academic_sections for each statement execute function private.emit_dashboard_refresh();
create trigger class_schedules_emit_dashboard_refresh after insert or update or delete on public.class_schedules for each statement execute function private.emit_dashboard_refresh();
create trigger schedule_exceptions_emit_dashboard_refresh after insert or update or delete on public.schedule_exceptions for each statement execute function private.emit_dashboard_refresh();
create trigger personnel_facility_assignments_emit_dashboard_refresh after insert or update or delete on public.personnel_facility_assignments for each statement execute function private.emit_dashboard_refresh();
create trigger personnel_consultation_hours_emit_dashboard_refresh after insert or update or delete on public.personnel_consultation_hours for each statement execute function private.emit_dashboard_refresh();
create trigger personnel_checkins_emit_dashboard_refresh after insert or update or delete on public.personnel_checkins for each statement execute function private.emit_dashboard_refresh();
create trigger personnel_availability_overrides_emit_dashboard_refresh after insert or update or delete on public.personnel_availability_overrides for each statement execute function private.emit_dashboard_refresh();

alter table public.personnel enable row level security;
alter table public.courses enable row level security;
alter table public.academic_sections enable row level security;
alter table public.class_schedules enable row level security;
alter table public.schedule_exceptions enable row level security;
alter table public.personnel_facility_assignments enable row level security;
alter table public.personnel_consultation_hours enable row level security;
alter table public.personnel_checkins enable row level security;
alter table public.personnel_availability_overrides enable row level security;
alter table public.dashboard_refresh_events enable row level security;

revoke all on table
  public.personnel,
  public.courses,
  public.academic_sections,
  public.class_schedules,
  public.schedule_exceptions,
  public.personnel_facility_assignments,
  public.personnel_consultation_hours,
  public.personnel_checkins,
  public.personnel_availability_overrides,
  public.dashboard_refresh_events
from anon, authenticated;

revoke all on sequence
  public.personnel_id_seq,
  public.courses_id_seq,
  public.academic_sections_id_seq,
  public.class_schedules_id_seq,
  public.schedule_exceptions_id_seq,
  public.personnel_facility_assignments_id_seq,
  public.personnel_consultation_hours_id_seq,
  public.personnel_checkins_id_seq,
  public.personnel_availability_overrides_id_seq,
  public.dashboard_refresh_events_id_seq
from anon, authenticated;

grant insert, update, delete on table
  public.personnel,
  public.courses,
  public.academic_sections,
  public.class_schedules,
  public.schedule_exceptions,
  public.personnel_facility_assignments,
  public.personnel_consultation_hours,
  public.personnel_checkins,
  public.personnel_availability_overrides
to authenticated;

-- Only columns used by the safe public projections are selectable by API
-- roles. Sensitive employee references, reasons, source metadata, creator user
-- IDs, and audit timestamps stay unavailable through direct table reads.
grant select (id, display_name, department_id, personnel_type, public_visibility, active, verification_status)
on public.personnel to anon, authenticated;
grant select (id, code, name, department_id, public_visibility, active, verification_status)
on public.courses to anon, authenticated;
grant select (id, program, year_level, section_name, department_id, public_visibility, active, verification_status)
on public.academic_sections to anon, authenticated;
grant select (id, department_id, course_id, section_id, personnel_id, facility_id, day_of_week, start_time, end_time, effective_from, effective_until, status, public_visibility, verification_status)
on public.class_schedules to anon, authenticated;
grant select (id, department_id, class_schedule_id, exception_date, exception_type, replacement_facility_id, replacement_personnel_id, replacement_start_time, replacement_end_time, verification_status)
on public.schedule_exceptions to anon, authenticated;
grant select (id, department_id, personnel_id, facility_id, role_label, day_of_week, start_time, end_time, effective_from, effective_until, public_visibility, active, verification_status)
on public.personnel_facility_assignments to anon, authenticated;
grant select (id, department_id, personnel_id, facility_id, day_of_week, start_time, end_time, effective_from, effective_until, public_visibility, active, verification_status)
on public.personnel_consultation_hours to anon, authenticated;
grant select (id, department_id, personnel_id, facility_id, checked_in_at, checked_out_at, status, source)
on public.personnel_checkins to anon, authenticated;
grant select (id, department_id, personnel_id, starts_at, ends_at, override_type, public_visibility, verification_status)
on public.personnel_availability_overrides to anon, authenticated;

grant usage, select on sequence
  public.personnel_id_seq,
  public.courses_id_seq,
  public.academic_sections_id_seq,
  public.class_schedules_id_seq,
  public.schedule_exceptions_id_seq,
  public.personnel_facility_assignments_id_seq,
  public.personnel_consultation_hours_id_seq,
  public.personnel_checkins_id_seq,
  public.personnel_availability_overrides_id_seq
to authenticated;

grant select on table public.dashboard_refresh_events to anon, authenticated;

create policy personnel_manage_department on public.personnel for all to authenticated
using ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])))
with check ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));

create policy personnel_read_approved_public on public.personnel for select to anon, authenticated
using (active and public_visibility and verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY'));
create policy courses_read_approved_public on public.courses for select to anon, authenticated
using (active and public_visibility and verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY'));
create policy academic_sections_read_approved_public on public.academic_sections for select to anon, authenticated
using (active and public_visibility and verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY'));
create policy class_schedules_read_approved_public on public.class_schedules for select to anon, authenticated
using (
  status = 'ACTIVE'
  and public_visibility
  and verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
  and exists (select 1 from public.courses c where c.id = course_id and c.active and c.public_visibility and c.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY'))
  and exists (select 1 from public.academic_sections s where s.id = section_id and s.active and s.public_visibility and s.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY'))
  and exists (select 1 from public.personnel p where p.id = personnel_id and p.active and p.public_visibility and p.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY'))
);
create policy schedule_exceptions_read_approved_public on public.schedule_exceptions for select to anon, authenticated
using (
  verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
  and exists (
    select 1 from public.class_schedules cs
    where cs.id = class_schedule_id
      and cs.status = 'ACTIVE'
      and cs.public_visibility
      and cs.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
  )
  and (
    replacement_personnel_id is null
    or exists (
      select 1 from public.personnel p
      where p.id = replacement_personnel_id
        and p.active and p.public_visibility
        and p.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
    )
  )
);
create policy personnel_facility_assignments_read_approved_public on public.personnel_facility_assignments for select to anon, authenticated
using (
  active and public_visibility and verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
  and exists (select 1 from public.personnel p where p.id = personnel_id and p.active and p.public_visibility and p.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY'))
);
create policy personnel_consultation_hours_read_approved_public on public.personnel_consultation_hours for select to anon, authenticated
using (
  active and public_visibility and verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
  and exists (select 1 from public.personnel p where p.id = personnel_id and p.active and p.public_visibility and p.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY'))
);
create policy personnel_checkins_read_active_public on public.personnel_checkins for select to anon, authenticated
using (
  status = 'ACTIVE' and checked_out_at is null and checked_in_at <= now()
  and exists (select 1 from public.personnel p where p.id = personnel_id and p.active and p.public_visibility and p.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY'))
);
create policy personnel_availability_overrides_read_approved_public on public.personnel_availability_overrides for select to anon, authenticated
using (
  public_visibility and verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
  and exists (select 1 from public.personnel p where p.id = personnel_id and p.active and p.public_visibility and p.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY'))
);
create policy courses_manage_department on public.courses for all to authenticated
using ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])))
with check ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));
create policy academic_sections_manage_department on public.academic_sections for all to authenticated
using ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])))
with check ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));
create policy class_schedules_manage_department on public.class_schedules for all to authenticated
using ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])))
with check ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));
create policy schedule_exceptions_manage_department on public.schedule_exceptions for all to authenticated
using ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])))
with check ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));
create policy personnel_facility_assignments_manage_department on public.personnel_facility_assignments for all to authenticated
using ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])))
with check ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));
create policy personnel_consultation_hours_manage_department on public.personnel_consultation_hours for all to authenticated
using ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])))
with check ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));
create policy personnel_checkins_manage_department on public.personnel_checkins for all to authenticated
using ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])))
with check ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));
create policy personnel_availability_overrides_manage_department on public.personnel_availability_overrides for all to authenticated
using ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])))
with check ((select private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));

-- Linked FACULTY/STAFF can inspect and close only their own trusted check-in.
-- There is intentionally no self-service INSERT policy: schedule membership or
-- an ordinary login is not authorization to claim physical presence.
create policy personnel_checkins_read_own on public.personnel_checkins for select to authenticated
using ((select private.can_self_manage_personnel(personnel_id)));
create policy personnel_checkins_close_own on public.personnel_checkins for update to authenticated
using ((select private.can_self_manage_personnel(personnel_id)) and status = 'ACTIVE')
with check ((select private.can_self_manage_personnel(personnel_id)) and status = 'CLOSED' and checked_out_at is not null);

-- Future faculty self-service availability starts private and unverified. A
-- manager must explicitly approve it before it can affect public status.
create policy personnel_availability_overrides_read_own on public.personnel_availability_overrides for select to authenticated
using ((select private.can_self_manage_personnel(personnel_id)));
create policy personnel_availability_overrides_insert_own_pending on public.personnel_availability_overrides for insert to authenticated
with check (
  (select private.can_self_manage_personnel(personnel_id))
  and created_by = (select auth.uid())
  and not public_visibility
  and verification_status = 'PENDING_VERIFICATION'
);
create policy personnel_availability_overrides_update_own_pending on public.personnel_availability_overrides for update to authenticated
using ((select private.can_self_manage_personnel(personnel_id)) and created_by = (select auth.uid()) and not public_visibility and verification_status = 'PENDING_VERIFICATION')
with check ((select private.can_self_manage_personnel(personnel_id)) and created_by = (select auth.uid()) and not public_visibility and verification_status = 'PENDING_VERIFICATION');
create policy personnel_availability_overrides_delete_own_pending on public.personnel_availability_overrides for delete to authenticated
using ((select private.can_self_manage_personnel(personnel_id)) and created_by = (select auth.uid()) and not public_visibility and verification_status = 'PENDING_VERIFICATION');

create policy dashboard_refresh_events_read_recent on public.dashboard_refresh_events for select to anon, authenticated
using (occurred_at > now() - interval '15 minutes');

-- Narrow public projections. These security-invoker, security-barrier views
-- retain underlying RLS checks; every filter is explicit and every sensitive
-- column is omitted.
create view public.public_personnel
with (security_invoker = true, security_barrier = true)
as
select
  p.id,
  p.display_name,
  p.department_id,
  p.personnel_type,
  p.verification_status
from public.personnel p
where p.active
  and p.public_visibility
  and p.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY');

create view public.public_courses
with (security_invoker = true, security_barrier = true)
as
select c.id, c.code, c.name, c.department_id, c.verification_status
from public.courses c
where c.active
  and c.public_visibility
  and c.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY');

create view public.public_academic_sections
with (security_invoker = true, security_barrier = true)
as
select s.id, s.program, s.year_level, s.section_name, s.department_id, s.verification_status
from public.academic_sections s
where s.active
  and s.public_visibility
  and s.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY');

create view public.public_class_schedules
with (security_invoker = true, security_barrier = true)
as
select
  cs.id,
  cs.department_id,
  cs.course_id,
  c.code as course_code,
  c.name as course_name,
  cs.section_id,
  s.program,
  s.year_level,
  s.section_name,
  cs.personnel_id,
  p.display_name as personnel_display_name,
  cs.facility_id,
  cs.day_of_week,
  cs.start_time,
  cs.end_time,
  cs.effective_from,
  cs.effective_until,
  cs.status,
  cs.verification_status
from public.class_schedules cs
join public.courses c on c.id = cs.course_id and c.department_id = cs.department_id
join public.academic_sections s on s.id = cs.section_id and s.department_id = cs.department_id
join public.personnel p on p.id = cs.personnel_id and p.department_id = cs.department_id
where cs.status = 'ACTIVE'
  and cs.public_visibility
  and cs.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
  and c.active and c.public_visibility and c.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
  and s.active and s.public_visibility and s.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
  and p.active and p.public_visibility and p.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY');

create view public.public_schedule_exceptions
with (security_invoker = true, security_barrier = true)
as
select
  se.id,
  se.department_id,
  se.class_schedule_id,
  se.exception_date,
  se.exception_type,
  se.replacement_facility_id,
  se.replacement_personnel_id,
  replacement.display_name as replacement_personnel_display_name,
  se.replacement_start_time,
  se.replacement_end_time,
  se.verification_status
from public.schedule_exceptions se
join public.public_class_schedules published on published.id = se.class_schedule_id
left join public.personnel replacement on replacement.id = se.replacement_personnel_id and replacement.department_id = se.department_id
where se.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
  and (
    se.replacement_personnel_id is null
    or (
      replacement.active
      and replacement.public_visibility
      and replacement.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
    )
  );

create view public.public_personnel_facility_assignments
with (security_invoker = true, security_barrier = true)
as
select
  assignment.id,
  assignment.department_id,
  assignment.personnel_id,
  p.display_name as personnel_display_name,
  p.personnel_type,
  assignment.facility_id,
  assignment.role_label,
  assignment.day_of_week,
  assignment.start_time,
  assignment.end_time,
  assignment.effective_from,
  assignment.effective_until,
  assignment.verification_status
from public.personnel_facility_assignments assignment
join public.personnel p on p.id = assignment.personnel_id and p.department_id = assignment.department_id
where assignment.active
  and assignment.public_visibility
  and assignment.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
  and p.active and p.public_visibility and p.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY');

create view public.public_personnel_consultation_hours
with (security_invoker = true, security_barrier = true)
as
select
  consultation.id,
  consultation.department_id,
  consultation.personnel_id,
  p.display_name as personnel_display_name,
  consultation.facility_id,
  consultation.day_of_week,
  consultation.start_time,
  consultation.end_time,
  consultation.effective_from,
  consultation.effective_until,
  consultation.verification_status
from public.personnel_consultation_hours consultation
join public.personnel p on p.id = consultation.personnel_id and p.department_id = consultation.department_id
where consultation.active
  and consultation.public_visibility
  and consultation.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
  and p.active and p.public_visibility and p.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY');

create view public.active_personnel_checkins
with (security_invoker = true, security_barrier = true)
as
select
  checkin.id,
  checkin.department_id,
  checkin.personnel_id,
  p.display_name as personnel_display_name,
  checkin.facility_id,
  checkin.checked_in_at,
  checkin.status,
  checkin.source
from public.personnel_checkins checkin
join public.personnel p on p.id = checkin.personnel_id and p.department_id = checkin.department_id
where checkin.status = 'ACTIVE'
  and checkin.checked_out_at is null
  and checkin.checked_in_at <= now()
  and p.active
  and p.public_visibility
  and p.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY');

create view public.public_personnel_availability_overrides
with (security_invoker = true, security_barrier = true)
as
select
  override.id,
  override.department_id,
  override.personnel_id,
  p.display_name as personnel_display_name,
  override.starts_at,
  override.ends_at,
  override.override_type,
  override.verification_status
from public.personnel_availability_overrides override
join public.personnel p on p.id = override.personnel_id and p.department_id = override.department_id
where override.public_visibility
  and override.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY')
  and p.active
  and p.public_visibility
  and p.verification_status in ('VERIFIED', 'SOURCE_ALIGNED', 'DEMO_ONLY');

revoke all on table
  public.public_personnel,
  public.public_courses,
  public.public_academic_sections,
  public.public_class_schedules,
  public.public_schedule_exceptions,
  public.public_personnel_facility_assignments,
  public.public_personnel_consultation_hours,
  public.active_personnel_checkins,
  public.public_personnel_availability_overrides
from public, anon, authenticated;

grant select on table
  public.public_personnel,
  public.public_courses,
  public.public_academic_sections,
  public.public_class_schedules,
  public.public_schedule_exceptions,
  public.public_personnel_facility_assignments,
  public.public_personnel_consultation_hours,
  public.active_personnel_checkins,
  public.public_personnel_availability_overrides
to anon, authenticated;

-- Extend the existing immutable audit stream without introducing a second
-- audit namespace.
alter table public.audit_logs drop constraint audit_logs_entity_type_check;
alter table public.audit_logs add constraint audit_logs_entity_type_check check (entity_type in (
  'announcement',
  'event',
  'facility_advisory',
  'notification',
  'personnel',
  'course',
  'academic_section',
  'class_schedule',
  'schedule_exception',
  'personnel_facility_assignment',
  'personnel_consultation_hour',
  'personnel_checkin',
  'personnel_availability_override'
));

create function private.record_phase8c_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  entity_label text;
  action_label text;
  entity_id_value bigint;
  previous_payload jsonb;
  next_payload jsonb;
  audit_payload jsonb;
begin
  if actor_id is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  entity_label := case tg_table_name
    when 'personnel' then 'personnel'
    when 'courses' then 'course'
    when 'academic_sections' then 'academic_section'
    when 'class_schedules' then 'class_schedule'
    when 'schedule_exceptions' then 'schedule_exception'
    when 'personnel_facility_assignments' then 'personnel_facility_assignment'
    when 'personnel_consultation_hours' then 'personnel_consultation_hour'
    when 'personnel_checkins' then 'personnel_checkin'
    when 'personnel_availability_overrides' then 'personnel_availability_override'
  end;

  if entity_label is null then
    raise exception 'Unsupported Phase 8C.1 audit entity table';
  end if;

  if tg_op = 'DELETE' then
    previous_payload := to_jsonb(old);
    audit_payload := previous_payload;
    entity_id_value := old.id;
    action_label := entity_label || '_deleted';
  elsif tg_op = 'INSERT' then
    next_payload := to_jsonb(new);
    audit_payload := next_payload;
    entity_id_value := new.id;
    action_label := entity_label || '_created';
  else
    previous_payload := to_jsonb(old);
    next_payload := to_jsonb(new);
    audit_payload := next_payload;
    entity_id_value := new.id;
    action_label := entity_label || case
      when tg_table_name = 'personnel_checkins' and next_payload ->> 'status' = 'CLOSED' then '_closed'
      when tg_table_name = 'class_schedules' and next_payload ->> 'status' = 'CANCELLED' then '_cancelled'
      when tg_table_name = 'schedule_exceptions' and next_payload ->> 'exception_type' = 'CANCELLED' then '_cancelled'
      else '_updated'
    end;
  end if;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    actor_id,
    action_label,
    entity_label,
    entity_id_value,
    jsonb_strip_nulls(jsonb_build_object(
      'operation', lower(tg_op),
      'from_status', previous_payload ->> 'status',
      'to_status', next_payload ->> 'status',
      'exception_type', audit_payload ->> 'exception_type',
      'facility_id', audit_payload ->> 'facility_id',
      'source_type', audit_payload ->> 'source_type',
      'source_id', audit_payload ->> 'source_id',
      'verification_status', audit_payload ->> 'verification_status'
    ))
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke execute on function private.record_phase8c_audit() from public, anon, authenticated;

create trigger personnel_record_audit after insert or update or delete on public.personnel for each row execute function private.record_phase8c_audit();
create trigger courses_record_audit after insert or update or delete on public.courses for each row execute function private.record_phase8c_audit();
create trigger academic_sections_record_audit after insert or update or delete on public.academic_sections for each row execute function private.record_phase8c_audit();
create trigger class_schedules_record_audit after insert or update or delete on public.class_schedules for each row execute function private.record_phase8c_audit();
create trigger schedule_exceptions_record_audit after insert or update or delete on public.schedule_exceptions for each row execute function private.record_phase8c_audit();
create trigger personnel_facility_assignments_record_audit after insert or update or delete on public.personnel_facility_assignments for each row execute function private.record_phase8c_audit();
create trigger personnel_consultation_hours_record_audit after insert or update or delete on public.personnel_consultation_hours for each row execute function private.record_phase8c_audit();
create trigger personnel_checkins_record_audit after insert or update or delete on public.personnel_checkins for each row execute function private.record_phase8c_audit();
create trigger personnel_availability_overrides_record_audit after insert or update or delete on public.personnel_availability_overrides for each row execute function private.record_phase8c_audit();

-- Realtime publishes only the non-sensitive signal table. Trigger activity on
-- all Phase 8C.1 source tables produces an INSERT here and the client reloads
-- authorized public views under its existing JWT/RLS context.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'dashboard_refresh_events'
    )
  then
    alter publication supabase_realtime add table public.dashboard_refresh_events;
  end if;
end;
$$;
