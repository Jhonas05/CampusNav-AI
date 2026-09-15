-- CampusNav Phase 8A backend foundation.
-- This migration intentionally contains no official school content.

create schema if not exists private;
revoke all on schema private from public;

create type public.app_role as enum (
  'GUEST',
  'STUDENT',
  'PARENT',
  'FACULTY',
  'STAFF',
  'FACILITY_MANAGER',
  'DEPARTMENT_ADMIN',
  'SUPER_ADMIN'
);

create type public.profile_status as enum ('PENDING', 'ACTIVE', 'INACTIVE');
create type public.notification_category as enum ('GENERAL', 'ACADEMIC', 'EVENT', 'FACILITY', 'SCHEDULE', 'EMERGENCY', 'SUSPENSION', 'NAVIGATION');
create type public.notification_priority as enum ('INFORMATIONAL', 'NORMAL', 'IMPORTANT', 'URGENT');
create type public.content_lifecycle as enum ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'EXPIRED', 'CANCELLED');
create type public.audience_type as enum ('EVERYONE', 'STUDENTS', 'PARENTS', 'FACULTY', 'STAFF', 'DEPARTMENT', 'PROGRAM', 'YEAR_SECTION', 'CUSTOM');
create type public.verification_status as enum ('VERIFIED', 'SOURCE_ALIGNED', 'PENDING_VERIFICATION', 'DEMO_ONLY');
create type public.dashboard_data_status as enum ('ACTIVE', 'PENDING_VERIFICATION', 'DEMO');

create table public.departments (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint departments_code_format check (code ~ '^[A-Z0-9][A-Z0-9_-]*$')
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  department_id bigint references public.departments(id) on delete set null,
  status public.profile_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (display_name is null or char_length(display_name) between 1 and 120)
);

create table public.roles (
  id bigint generated always as identity primary key,
  code public.app_role not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

insert into public.roles (code, description) values
  ('GUEST', 'Authenticated account with no campus administrative access.'),
  ('STUDENT', 'Student account foundation.'),
  ('PARENT', 'Parent or guardian account foundation.'),
  ('FACULTY', 'Faculty account foundation.'),
  ('STAFF', 'Staff account foundation.'),
  ('FACILITY_MANAGER', 'Department-scoped facility data manager.'),
  ('DEPARTMENT_ADMIN', 'Department-scoped administrative manager.'),
  ('SUPER_ADMIN', 'System-wide administrative manager.');

create table public.user_roles (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id bigint not null references public.roles(id) on delete restrict,
  department_id bigint references public.departments(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index user_roles_global_unique_idx on public.user_roles (user_id, role_id) where department_id is null;
create unique index user_roles_department_unique_idx on public.user_roles (user_id, role_id, department_id) where department_id is not null;
create index profiles_department_id_idx on public.profiles (department_id);
create index user_roles_user_id_idx on public.user_roles (user_id);
create index user_roles_role_id_idx on public.user_roles (role_id);
create index user_roles_department_id_idx on public.user_roles (department_id) where department_id is not null;
create index user_roles_assigned_by_idx on public.user_roles (assigned_by) where assigned_by is not null;

create table public.audiences (
  id bigint generated always as identity primary key,
  audience_type public.audience_type not null,
  department_id bigint references public.departments(id) on delete cascade,
  reference_id text,
  label text,
  created_at timestamptz not null default now(),
  constraint audiences_scope_check check (
    (audience_type = 'DEPARTMENT' and department_id is not null)
    or (audience_type <> 'DEPARTMENT')
  )
);

create index audiences_department_id_idx on public.audiences (department_id) where department_id is not null;

create table public.notifications (
  id bigint generated always as identity primary key,
  title text not null,
  message text not null,
  category public.notification_category not null,
  priority public.notification_priority not null default 'NORMAL',
  lifecycle public.content_lifecycle not null default 'DRAFT',
  is_public boolean not null default false,
  published_at timestamptz,
  effective_at timestamptz,
  expires_at timestamptz,
  source_type text not null default 'SUPABASE',
  source_id text,
  related_facility_id text,
  department_id bigint references public.departments(id) on delete set null,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  data_status public.dashboard_data_status not null default 'PENDING_VERIFICATION',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notifications_title_length check (char_length(title) between 1 and 180),
  constraint notifications_message_length check (char_length(message) between 1 and 5000),
  constraint notifications_publication_check check (lifecycle <> 'PUBLISHED' or published_at is not null),
  constraint notifications_time_window check (expires_at is null or effective_at is null or expires_at > effective_at),
  constraint notifications_facility_id_format check (related_facility_id is null or related_facility_id ~ '^[a-z0-9][a-z0-9-]*$')
);

create table public.announcements (
  id bigint generated always as identity primary key,
  title text not null,
  message text not null,
  category public.notification_category not null default 'GENERAL',
  priority public.notification_priority not null default 'NORMAL',
  lifecycle public.content_lifecycle not null default 'DRAFT',
  is_public boolean not null default false,
  published_at timestamptz,
  effective_at timestamptz,
  expires_at timestamptz,
  source_type text not null default 'SUPABASE',
  source_id text,
  related_facility_id text,
  department_id bigint references public.departments(id) on delete set null,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  data_status public.dashboard_data_status not null default 'PENDING_VERIFICATION',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_title_length check (char_length(title) between 1 and 180),
  constraint announcements_message_length check (char_length(message) between 1 and 10000),
  constraint announcements_publication_check check (lifecycle <> 'PUBLISHED' or published_at is not null),
  constraint announcements_time_window check (expires_at is null or effective_at is null or expires_at > effective_at),
  constraint announcements_facility_id_format check (related_facility_id is null or related_facility_id ~ '^[a-z0-9][a-z0-9-]*$')
);

create table public.events (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  location text,
  organizer text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  priority public.notification_priority not null default 'NORMAL',
  lifecycle public.content_lifecycle not null default 'DRAFT',
  is_public boolean not null default false,
  published_at timestamptz,
  effective_at timestamptz,
  expires_at timestamptz,
  source_type text not null default 'SUPABASE',
  source_id text,
  related_facility_id text,
  department_id bigint references public.departments(id) on delete set null,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  data_status public.dashboard_data_status not null default 'PENDING_VERIFICATION',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_title_length check (char_length(title) between 1 and 180),
  constraint events_description_length check (char_length(description) between 1 and 10000),
  constraint events_duration_check check (ends_at is null or ends_at > starts_at),
  constraint events_publication_check check (lifecycle <> 'PUBLISHED' or published_at is not null),
  constraint events_time_window check (expires_at is null or effective_at is null or expires_at > effective_at),
  constraint events_facility_id_format check (related_facility_id is null or related_facility_id ~ '^[a-z0-9][a-z0-9-]*$')
);

create table public.facility_advisories (
  id bigint generated always as identity primary key,
  title text not null,
  message text not null,
  advisory_type text not null,
  related_facility_id text not null,
  priority public.notification_priority not null default 'NORMAL',
  lifecycle public.content_lifecycle not null default 'DRAFT',
  is_public boolean not null default false,
  published_at timestamptz,
  effective_at timestamptz,
  expires_at timestamptz,
  source_type text not null default 'SUPABASE',
  source_id text,
  department_id bigint references public.departments(id) on delete set null,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  data_status public.dashboard_data_status not null default 'PENDING_VERIFICATION',
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint facility_advisories_title_length check (char_length(title) between 1 and 180),
  constraint facility_advisories_message_length check (char_length(message) between 1 and 5000),
  constraint facility_advisories_type_check check (advisory_type in ('TEMPORARY_CLOSURE', 'MAINTENANCE', 'RESTRICTED_ACCESS', 'SERVICE_INTERRUPTION')),
  constraint facility_advisories_publication_check check (lifecycle <> 'PUBLISHED' or published_at is not null),
  constraint facility_advisories_time_window check (expires_at is null or effective_at is null or expires_at > effective_at),
  constraint facility_advisories_facility_id_format check (related_facility_id ~ '^[a-z0-9][a-z0-9-]*$')
);

create index notifications_department_id_idx on public.notifications (department_id) where department_id is not null;
create index notifications_created_by_idx on public.notifications (created_by);
create index notifications_public_feed_idx on public.notifications (priority, effective_at desc, published_at desc) where lifecycle = 'PUBLISHED' and is_public;
create unique index notifications_source_unique_idx on public.notifications (source_type, source_id) where source_id is not null;
create index announcements_department_id_idx on public.announcements (department_id) where department_id is not null;
create index announcements_created_by_idx on public.announcements (created_by);
create index announcements_public_feed_idx on public.announcements (effective_at desc, published_at desc) where lifecycle = 'PUBLISHED' and is_public;
create unique index announcements_source_unique_idx on public.announcements (source_type, source_id) where source_id is not null;
create index events_department_id_idx on public.events (department_id) where department_id is not null;
create index events_created_by_idx on public.events (created_by);
create index events_public_feed_idx on public.events (starts_at) where lifecycle = 'PUBLISHED' and is_public;
create unique index events_source_unique_idx on public.events (source_type, source_id) where source_id is not null;
create index facility_advisories_department_id_idx on public.facility_advisories (department_id) where department_id is not null;
create index facility_advisories_created_by_idx on public.facility_advisories (created_by);
create index facility_advisories_public_feed_idx on public.facility_advisories (priority, effective_at desc) where lifecycle = 'PUBLISHED' and is_public;
create unique index facility_advisories_source_unique_idx on public.facility_advisories (source_type, source_id) where source_id is not null;

create table public.notification_audiences (
  notification_id bigint not null references public.notifications(id) on delete cascade,
  audience_id bigint not null references public.audiences(id) on delete cascade,
  primary key (notification_id, audience_id)
);

create table public.announcement_audiences (
  announcement_id bigint not null references public.announcements(id) on delete cascade,
  audience_id bigint not null references public.audiences(id) on delete cascade,
  primary key (announcement_id, audience_id)
);

create table public.event_audiences (
  event_id bigint not null references public.events(id) on delete cascade,
  audience_id bigint not null references public.audiences(id) on delete cascade,
  primary key (event_id, audience_id)
);

create table public.facility_advisory_audiences (
  facility_advisory_id bigint not null references public.facility_advisories(id) on delete cascade,
  audience_id bigint not null references public.audiences(id) on delete cascade,
  primary key (facility_advisory_id, audience_id)
);

create index notification_audiences_audience_id_idx on public.notification_audiences (audience_id);
create index announcement_audiences_audience_id_idx on public.announcement_audiences (audience_id);
create index event_audiences_audience_id_idx on public.event_audiences (audience_id);
create index facility_advisory_audiences_audience_id_idx on public.facility_advisory_audiences (audience_id);

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function private.touch_updated_at() from public, anon, authenticated;

create trigger departments_touch_updated_at before update on public.departments for each row execute function private.touch_updated_at();
create trigger profiles_touch_updated_at before update on public.profiles for each row execute function private.touch_updated_at();
create trigger notifications_touch_updated_at before update on public.notifications for each row execute function private.touch_updated_at();
create trigger announcements_touch_updated_at before update on public.announcements for each row execute function private.touch_updated_at();
create trigger events_touch_updated_at before update on public.events for each row execute function private.touch_updated_at();
create trigger facility_advisories_touch_updated_at before update on public.facility_advisories for each row execute function private.touch_updated_at();

create function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function private.handle_new_auth_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_auth_user();

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

create function private.has_any_role(required_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.code = any(required_roles)
  );
$$;

create function private.can_manage_content(target_department_id bigint, allowed_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and (
    private.has_any_role(array['SUPER_ADMIN']::public.app_role[])
    or (
      target_department_id is not null
      and exists (
        select 1
        from public.user_roles ur
        join public.roles r on r.id = ur.role_id
        where ur.user_id = (select auth.uid())
          and ur.department_id = target_department_id
          and r.code = any(allowed_roles)
      )
    )
  );
$$;

revoke execute on function private.has_any_role(public.app_role[]) from public, anon;
revoke execute on function private.can_manage_content(bigint, public.app_role[]) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.has_any_role(public.app_role[]) to authenticated;
grant execute on function private.can_manage_content(bigint, public.app_role[]) to authenticated;

alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audiences enable row level security;
alter table public.notifications enable row level security;
alter table public.announcements enable row level security;
alter table public.events enable row level security;
alter table public.facility_advisories enable row level security;
alter table public.notification_audiences enable row level security;
alter table public.announcement_audiences enable row level security;
alter table public.event_audiences enable row level security;
alter table public.facility_advisory_audiences enable row level security;

revoke all on table
  public.departments,
  public.profiles,
  public.roles,
  public.user_roles,
  public.audiences,
  public.notifications,
  public.announcements,
  public.events,
  public.facility_advisories,
  public.notification_audiences,
  public.announcement_audiences,
  public.event_audiences,
  public.facility_advisory_audiences
from anon, authenticated;
revoke all on sequence
  public.departments_id_seq,
  public.roles_id_seq,
  public.user_roles_id_seq,
  public.audiences_id_seq,
  public.notifications_id_seq,
  public.announcements_id_seq,
  public.events_id_seq,
  public.facility_advisories_id_seq
from anon, authenticated;

grant select on public.notifications, public.announcements, public.events, public.facility_advisories to anon, authenticated;
grant select on public.departments, public.profiles, public.roles, public.user_roles, public.audiences to authenticated;
grant select on public.notification_audiences, public.announcement_audiences, public.event_audiences, public.facility_advisory_audiences to authenticated;
grant insert, delete on public.notifications, public.announcements, public.events, public.facility_advisories to authenticated;
grant update (title, message, category, priority, lifecycle, is_public, published_at, effective_at, expires_at, source_type, source_id, related_facility_id, department_id, verification_status, data_status) on public.notifications to authenticated;
grant update (title, message, category, priority, lifecycle, is_public, published_at, effective_at, expires_at, source_type, source_id, related_facility_id, department_id, verification_status, data_status) on public.announcements to authenticated;
grant update (title, description, location, organizer, starts_at, ends_at, priority, lifecycle, is_public, published_at, effective_at, expires_at, source_type, source_id, related_facility_id, department_id, verification_status, data_status) on public.events to authenticated;
grant update (title, message, advisory_type, related_facility_id, priority, lifecycle, is_public, published_at, effective_at, expires_at, source_type, source_id, department_id, verification_status, data_status) on public.facility_advisories to authenticated;
grant insert, update, delete on public.departments, public.roles, public.user_roles, public.audiences to authenticated;
grant insert, update, delete on public.notification_audiences, public.announcement_audiences, public.event_audiences, public.facility_advisory_audiences to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant usage, select on sequence public.departments_id_seq, public.roles_id_seq, public.user_roles_id_seq, public.audiences_id_seq, public.notifications_id_seq, public.announcements_id_seq, public.events_id_seq, public.facility_advisories_id_seq to authenticated;

create policy departments_read_authenticated on public.departments for select to authenticated using (true);
create policy departments_insert_super_admin on public.departments for insert to authenticated with check (private.has_any_role(array['SUPER_ADMIN']::public.app_role[]));
create policy departments_update_super_admin on public.departments for update to authenticated using (private.has_any_role(array['SUPER_ADMIN']::public.app_role[])) with check (private.has_any_role(array['SUPER_ADMIN']::public.app_role[]));
create policy departments_delete_super_admin on public.departments for delete to authenticated using (private.has_any_role(array['SUPER_ADMIN']::public.app_role[]));

create policy profiles_read_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_read_super_admin on public.profiles for select to authenticated using (private.has_any_role(array['SUPER_ADMIN']::public.app_role[]));
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy roles_read_authenticated on public.roles for select to authenticated using (true);
create policy roles_insert_super_admin on public.roles for insert to authenticated with check (private.has_any_role(array['SUPER_ADMIN']::public.app_role[]));
create policy roles_update_super_admin on public.roles for update to authenticated using (private.has_any_role(array['SUPER_ADMIN']::public.app_role[])) with check (private.has_any_role(array['SUPER_ADMIN']::public.app_role[]));
create policy roles_delete_super_admin on public.roles for delete to authenticated using (private.has_any_role(array['SUPER_ADMIN']::public.app_role[]));

create policy user_roles_read_own on public.user_roles for select to authenticated using ((select auth.uid()) = user_id);
create policy user_roles_read_super_admin on public.user_roles for select to authenticated using (private.has_any_role(array['SUPER_ADMIN']::public.app_role[]));
create policy user_roles_insert_super_admin on public.user_roles for insert to authenticated with check (private.has_any_role(array['SUPER_ADMIN']::public.app_role[]));
create policy user_roles_update_super_admin on public.user_roles for update to authenticated using (private.has_any_role(array['SUPER_ADMIN']::public.app_role[])) with check (private.has_any_role(array['SUPER_ADMIN']::public.app_role[]));
create policy user_roles_delete_super_admin on public.user_roles for delete to authenticated using (private.has_any_role(array['SUPER_ADMIN']::public.app_role[]));

create policy audiences_read_authenticated on public.audiences for select to authenticated using (true);
create policy audiences_insert_super_admin on public.audiences for insert to authenticated with check (private.has_any_role(array['SUPER_ADMIN']::public.app_role[]));
create policy audiences_update_super_admin on public.audiences for update to authenticated using (private.has_any_role(array['SUPER_ADMIN']::public.app_role[])) with check (private.has_any_role(array['SUPER_ADMIN']::public.app_role[]));
create policy audiences_delete_super_admin on public.audiences for delete to authenticated using (private.has_any_role(array['SUPER_ADMIN']::public.app_role[]));

create policy notifications_read_public_active on public.notifications for select to anon, authenticated
using (is_public and lifecycle = 'PUBLISHED' and coalesce(effective_at, published_at, created_at) <= now() and (expires_at is null or expires_at > now()));
create policy notifications_read_managers on public.notifications for select to authenticated
using (private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]));
create policy notifications_insert_managers on public.notifications for insert to authenticated
with check (created_by = (select auth.uid()) and private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]) and (category not in ('EMERGENCY', 'SUSPENSION') or private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));
create policy notifications_update_managers on public.notifications for update to authenticated
using (private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]))
with check (private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]) and (category not in ('EMERGENCY', 'SUSPENSION') or private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));
create policy notifications_delete_managers on public.notifications for delete to authenticated
using (private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]));

create policy announcements_read_public_active on public.announcements for select to anon, authenticated
using (is_public and lifecycle = 'PUBLISHED' and coalesce(effective_at, published_at, created_at) <= now() and (expires_at is null or expires_at > now()));
create policy announcements_read_managers on public.announcements for select to authenticated
using (private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]));
create policy announcements_insert_managers on public.announcements for insert to authenticated
with check (created_by = (select auth.uid()) and private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]));
create policy announcements_update_managers on public.announcements for update to authenticated
using (private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]))
with check (private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]));
create policy announcements_delete_managers on public.announcements for delete to authenticated
using (private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]));

create policy events_read_public_active on public.events for select to anon, authenticated
using (is_public and lifecycle = 'PUBLISHED' and coalesce(effective_at, published_at, created_at) <= now() and (expires_at is null or expires_at > now()));
create policy events_read_managers on public.events for select to authenticated
using (private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]));
create policy events_insert_managers on public.events for insert to authenticated
with check (created_by = (select auth.uid()) and private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]));
create policy events_update_managers on public.events for update to authenticated
using (private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]))
with check (private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]));
create policy events_delete_managers on public.events for delete to authenticated
using (private.can_manage_content(department_id, array['DEPARTMENT_ADMIN']::public.app_role[]));

create policy facility_advisories_read_public_active on public.facility_advisories for select to anon, authenticated
using (is_public and lifecycle = 'PUBLISHED' and coalesce(effective_at, published_at, created_at) <= now() and (expires_at is null or expires_at > now()));
create policy facility_advisories_read_managers on public.facility_advisories for select to authenticated
using (private.can_manage_content(department_id, array['FACILITY_MANAGER', 'DEPARTMENT_ADMIN']::public.app_role[]));
create policy facility_advisories_insert_managers on public.facility_advisories for insert to authenticated
with check (created_by = (select auth.uid()) and private.can_manage_content(department_id, array['FACILITY_MANAGER', 'DEPARTMENT_ADMIN']::public.app_role[]));
create policy facility_advisories_update_managers on public.facility_advisories for update to authenticated
using (private.can_manage_content(department_id, array['FACILITY_MANAGER', 'DEPARTMENT_ADMIN']::public.app_role[]))
with check (private.can_manage_content(department_id, array['FACILITY_MANAGER', 'DEPARTMENT_ADMIN']::public.app_role[]));
create policy facility_advisories_delete_managers on public.facility_advisories for delete to authenticated
using (private.can_manage_content(department_id, array['FACILITY_MANAGER', 'DEPARTMENT_ADMIN']::public.app_role[]));

create policy notification_audiences_read_managers on public.notification_audiences for select to authenticated
using (exists (select 1 from public.notifications n where n.id = notification_id and private.can_manage_content(n.department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));
create policy notification_audiences_write_managers on public.notification_audiences for all to authenticated
using (exists (select 1 from public.notifications n where n.id = notification_id and private.can_manage_content(n.department_id, array['DEPARTMENT_ADMIN']::public.app_role[])))
with check (exists (select 1 from public.notifications n where n.id = notification_id and private.can_manage_content(n.department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));
create policy announcement_audiences_read_managers on public.announcement_audiences for select to authenticated
using (exists (select 1 from public.announcements a where a.id = announcement_id and private.can_manage_content(a.department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));
create policy announcement_audiences_write_managers on public.announcement_audiences for all to authenticated
using (exists (select 1 from public.announcements a where a.id = announcement_id and private.can_manage_content(a.department_id, array['DEPARTMENT_ADMIN']::public.app_role[])))
with check (exists (select 1 from public.announcements a where a.id = announcement_id and private.can_manage_content(a.department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));
create policy event_audiences_read_managers on public.event_audiences for select to authenticated
using (exists (select 1 from public.events e where e.id = event_id and private.can_manage_content(e.department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));
create policy event_audiences_write_managers on public.event_audiences for all to authenticated
using (exists (select 1 from public.events e where e.id = event_id and private.can_manage_content(e.department_id, array['DEPARTMENT_ADMIN']::public.app_role[])))
with check (exists (select 1 from public.events e where e.id = event_id and private.can_manage_content(e.department_id, array['DEPARTMENT_ADMIN']::public.app_role[])));
create policy facility_advisory_audiences_read_managers on public.facility_advisory_audiences for select to authenticated
using (exists (select 1 from public.facility_advisories f where f.id = facility_advisory_id and private.can_manage_content(f.department_id, array['FACILITY_MANAGER', 'DEPARTMENT_ADMIN']::public.app_role[])));
create policy facility_advisory_audiences_write_managers on public.facility_advisory_audiences for all to authenticated
using (exists (select 1 from public.facility_advisories f where f.id = facility_advisory_id and private.can_manage_content(f.department_id, array['FACILITY_MANAGER', 'DEPARTMENT_ADMIN']::public.app_role[])))
with check (exists (select 1 from public.facility_advisories f where f.id = facility_advisory_id and private.can_manage_content(f.department_id, array['FACILITY_MANAGER', 'DEPARTMENT_ADMIN']::public.app_role[])));

do $$
declare
  table_name text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach table_name in array array['notifications', 'announcements', 'events', 'facility_advisories'] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name
      ) then
        execute format('alter publication supabase_realtime add table public.%I', table_name);
      end if;
    end loop;
  end if;
end;
$$;
