-- CampusNav Phase 4-FS-1A facility operational data foundation.
--
-- This migration adds only the operational overlay for facility profiles,
-- services, approved aliases, and configured facility-service mappings. It
-- intentionally contains no official institutional records, facility hours,
-- media, spatial geometry, map nodes/edges, QR data, routing data, or Realtime
-- publication changes. facility_id values remain references to the canonical
-- local registry in src/data/facilities.js; this schema does not create a
-- second facility identity or spatial source of truth.

create table public.facility_operational_profiles (
  id bigint generated always as identity primary key,
  facility_id text not null unique,
  department_id bigint references public.departments(id) on delete set null,
  description text,
  public_contact_name text,
  public_contact_email text,
  public_contact_phone text,
  lifecycle public.content_lifecycle not null default 'DRAFT',
  public_visibility boolean not null default false,
  published_at timestamptz,
  effective_at timestamptz,
  expires_at timestamptz,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  data_status public.dashboard_data_status not null default 'PENDING_VERIFICATION',
  source_type text not null,
  source_id text,
  source_label text,
  last_verified_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint facility_operational_profiles_facility_id_format check (facility_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint facility_operational_profiles_description_length check (description is null or char_length(description) between 1 and 4000),
  constraint facility_operational_profiles_contact_name_length check (public_contact_name is null or char_length(public_contact_name) between 1 and 160),
  constraint facility_operational_profiles_contact_email_length check (public_contact_email is null or char_length(public_contact_email) between 3 and 320),
  constraint facility_operational_profiles_contact_phone_length check (public_contact_phone is null or char_length(public_contact_phone) between 3 and 80),
  constraint facility_operational_profiles_source_type_length check (char_length(source_type) between 1 and 80),
  constraint facility_operational_profiles_source_id_length check (source_id is null or char_length(source_id) between 1 and 160),
  constraint facility_operational_profiles_source_label_length check (source_label is null or char_length(source_label) between 1 and 240),
  constraint facility_operational_profiles_effective_range check (expires_at is null or effective_at is null or expires_at > effective_at),
  constraint facility_operational_profiles_published_at_check check (lifecycle <> 'PUBLISHED' or published_at is not null),
  constraint facility_operational_profiles_demo_provenance_check check ((data_status = 'DEMO') = (verification_status = 'DEMO_ONLY')),
  constraint facility_operational_profiles_active_provenance_check check (data_status <> 'ACTIVE' or verification_status in ('VERIFIED', 'SOURCE_ALIGNED')),
  constraint facility_operational_profiles_verified_at_check check (verification_status not in ('VERIFIED', 'SOURCE_ALIGNED') or last_verified_at is not null)
);

create table public.services (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  description text,
  department_id bigint references public.departments(id) on delete set null,
  lifecycle public.content_lifecycle not null default 'DRAFT',
  public_visibility boolean not null default false,
  published_at timestamptz,
  effective_at timestamptz,
  expires_at timestamptz,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  data_status public.dashboard_data_status not null default 'PENDING_VERIFICATION',
  source_type text not null,
  source_id text,
  source_label text,
  last_verified_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_code_format check (code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint services_name_length check (char_length(name) between 1 and 160),
  constraint services_description_length check (description is null or char_length(description) between 1 and 4000),
  constraint services_source_type_length check (char_length(source_type) between 1 and 80),
  constraint services_source_id_length check (source_id is null or char_length(source_id) between 1 and 160),
  constraint services_source_label_length check (source_label is null or char_length(source_label) between 1 and 240),
  constraint services_effective_range check (expires_at is null or effective_at is null or expires_at > effective_at),
  constraint services_published_at_check check (lifecycle <> 'PUBLISHED' or published_at is not null),
  constraint services_demo_provenance_check check ((data_status = 'DEMO') = (verification_status = 'DEMO_ONLY')),
  constraint services_active_provenance_check check (data_status <> 'ACTIVE' or verification_status in ('VERIFIED', 'SOURCE_ALIGNED')),
  constraint services_verified_at_check check (verification_status not in ('VERIFIED', 'SOURCE_ALIGNED') or last_verified_at is not null)
);

create table public.service_aliases (
  id bigint generated always as identity primary key,
  service_id bigint not null references public.services(id) on delete restrict,
  alias text not null,
  lifecycle public.content_lifecycle not null default 'DRAFT',
  public_visibility boolean not null default false,
  published_at timestamptz,
  effective_at timestamptz,
  expires_at timestamptz,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  data_status public.dashboard_data_status not null default 'PENDING_VERIFICATION',
  source_type text not null,
  source_id text,
  source_label text,
  last_verified_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_aliases_alias_length check (char_length(alias) between 1 and 160),
  constraint service_aliases_source_type_length check (char_length(source_type) between 1 and 80),
  constraint service_aliases_source_id_length check (source_id is null or char_length(source_id) between 1 and 160),
  constraint service_aliases_source_label_length check (source_label is null or char_length(source_label) between 1 and 240),
  constraint service_aliases_effective_range check (expires_at is null or effective_at is null or expires_at > effective_at),
  constraint service_aliases_published_at_check check (lifecycle <> 'PUBLISHED' or published_at is not null),
  constraint service_aliases_demo_provenance_check check ((data_status = 'DEMO') = (verification_status = 'DEMO_ONLY')),
  constraint service_aliases_active_provenance_check check (data_status <> 'ACTIVE' or verification_status in ('VERIFIED', 'SOURCE_ALIGNED')),
  constraint service_aliases_verified_at_check check (verification_status not in ('VERIFIED', 'SOURCE_ALIGNED') or last_verified_at is not null)
);

create table public.facility_service_mappings (
  id bigint generated always as identity primary key,
  facility_id text not null references public.facility_operational_profiles(facility_id) on delete restrict,
  service_id bigint not null references public.services(id) on delete restrict,
  recommendation_rank smallint not null default 100,
  public_notes text,
  lifecycle public.content_lifecycle not null default 'DRAFT',
  public_visibility boolean not null default false,
  published_at timestamptz,
  effective_at timestamptz,
  expires_at timestamptz,
  verification_status public.verification_status not null default 'PENDING_VERIFICATION',
  data_status public.dashboard_data_status not null default 'PENDING_VERIFICATION',
  source_type text not null,
  source_id text,
  source_label text,
  last_verified_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  updated_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint facility_service_mappings_unique unique (facility_id, service_id),
  constraint facility_service_mappings_rank_range check (recommendation_rank between 1 and 1000),
  constraint facility_service_mappings_notes_length check (public_notes is null or char_length(public_notes) between 1 and 2000),
  constraint facility_service_mappings_source_type_length check (char_length(source_type) between 1 and 80),
  constraint facility_service_mappings_source_id_length check (source_id is null or char_length(source_id) between 1 and 160),
  constraint facility_service_mappings_source_label_length check (source_label is null or char_length(source_label) between 1 and 240),
  constraint facility_service_mappings_effective_range check (expires_at is null or effective_at is null or expires_at > effective_at),
  constraint facility_service_mappings_published_at_check check (lifecycle <> 'PUBLISHED' or published_at is not null),
  constraint facility_service_mappings_demo_provenance_check check ((data_status = 'DEMO') = (verification_status = 'DEMO_ONLY')),
  constraint facility_service_mappings_active_provenance_check check (data_status <> 'ACTIVE' or verification_status in ('VERIFIED', 'SOURCE_ALIGNED')),
  constraint facility_service_mappings_verified_at_check check (verification_status not in ('VERIFIED', 'SOURCE_ALIGNED') or last_verified_at is not null)
);

create unique index facility_operational_profiles_source_unique_idx
on public.facility_operational_profiles (source_type, source_id)
where source_id is not null;
create index facility_operational_profiles_department_idx on public.facility_operational_profiles (department_id) where department_id is not null;
create index facility_operational_profiles_public_idx on public.facility_operational_profiles (lifecycle, public_visibility, effective_at, expires_at);
create index facility_operational_profiles_created_by_idx on public.facility_operational_profiles (created_by);
create index facility_operational_profiles_updated_by_idx on public.facility_operational_profiles (updated_by);

create unique index services_source_unique_idx on public.services (source_type, source_id) where source_id is not null;
create index services_department_idx on public.services (department_id) where department_id is not null;
create index services_public_idx on public.services (lifecycle, public_visibility, effective_at, expires_at);
create index services_name_idx on public.services (lower(name));
create index services_created_by_idx on public.services (created_by);
create index services_updated_by_idx on public.services (updated_by);

create unique index service_aliases_service_alias_unique_idx on public.service_aliases (service_id, lower(alias));
create unique index service_aliases_source_unique_idx on public.service_aliases (source_type, source_id) where source_id is not null;
create index service_aliases_public_idx on public.service_aliases (lifecycle, public_visibility, effective_at, expires_at);
create index service_aliases_alias_idx on public.service_aliases (lower(alias));
create index service_aliases_created_by_idx on public.service_aliases (created_by);
create index service_aliases_updated_by_idx on public.service_aliases (updated_by);

create unique index facility_service_mappings_source_unique_idx on public.facility_service_mappings (source_type, source_id) where source_id is not null;
create index facility_service_mappings_service_idx on public.facility_service_mappings (service_id, recommendation_rank);
create index facility_service_mappings_facility_idx on public.facility_service_mappings (facility_id, recommendation_rank);
create index facility_service_mappings_public_idx on public.facility_service_mappings (lifecycle, public_visibility, effective_at, expires_at);
create index facility_service_mappings_created_by_idx on public.facility_service_mappings (created_by);
create index facility_service_mappings_updated_by_idx on public.facility_service_mappings (updated_by);

create function private.touch_facility_operational_record()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
begin
  new.updated_at = now();
  if actor_id is not null then
    new.updated_by = actor_id;
  end if;
  return new;
end;
$$;

revoke execute on function private.touch_facility_operational_record() from public, anon, authenticated;

create trigger facility_operational_profiles_touch_updated_at
before update on public.facility_operational_profiles
for each row execute function private.touch_facility_operational_record();

create trigger services_touch_updated_at
before update on public.services
for each row execute function private.touch_facility_operational_record();

create trigger service_aliases_touch_updated_at
before update on public.service_aliases
for each row execute function private.touch_facility_operational_record();

create trigger facility_service_mappings_touch_updated_at
before update on public.facility_service_mappings
for each row execute function private.touch_facility_operational_record();

alter table public.facility_operational_profiles enable row level security;
alter table public.services enable row level security;
alter table public.service_aliases enable row level security;
alter table public.facility_service_mappings enable row level security;

revoke all on table
  public.facility_operational_profiles,
  public.services,
  public.service_aliases,
  public.facility_service_mappings
from anon, authenticated;

revoke all on sequence
  public.facility_operational_profiles_id_seq,
  public.services_id_seq,
  public.service_aliases_id_seq,
  public.facility_service_mappings_id_seq
from anon, authenticated;

grant select (
  id, facility_id, department_id, description, public_contact_name,
  public_contact_email, public_contact_phone, lifecycle, public_visibility,
  published_at, effective_at, expires_at, verification_status, data_status,
  source_type, source_id, source_label, last_verified_at, created_at, updated_at
) on public.facility_operational_profiles to anon, authenticated;

grant select (
  id, code, name, description, department_id, lifecycle, public_visibility,
  published_at, effective_at, expires_at, verification_status, data_status,
  source_type, source_id, source_label, last_verified_at, created_at, updated_at
) on public.services to anon, authenticated;

grant select (
  id, service_id, alias, lifecycle, public_visibility, published_at,
  effective_at, expires_at, verification_status, data_status, source_type,
  source_id, source_label, last_verified_at, created_at, updated_at
) on public.service_aliases to anon, authenticated;

grant select (
  id, facility_id, service_id, recommendation_rank, public_notes, lifecycle,
  public_visibility, published_at, effective_at, expires_at,
  verification_status, data_status, source_type, source_id, source_label,
  last_verified_at, created_at, updated_at
) on public.facility_service_mappings to anon, authenticated;

grant insert (
  facility_id, department_id, description, public_contact_name,
  public_contact_email, public_contact_phone, lifecycle, public_visibility,
  published_at, effective_at, expires_at, verification_status, data_status,
  source_type, source_id, source_label, last_verified_at
) on public.facility_operational_profiles to authenticated;

grant insert (
  code, name, description, department_id, lifecycle, public_visibility,
  published_at, effective_at, expires_at, verification_status, data_status,
  source_type, source_id, source_label, last_verified_at
) on public.services to authenticated;

grant insert (
  service_id, alias, lifecycle, public_visibility, published_at, effective_at,
  expires_at, verification_status, data_status, source_type, source_id,
  source_label, last_verified_at
) on public.service_aliases to authenticated;

grant insert (
  facility_id, service_id, recommendation_rank, public_notes, lifecycle,
  public_visibility, published_at, effective_at, expires_at,
  verification_status, data_status, source_type, source_id, source_label,
  last_verified_at
) on public.facility_service_mappings to authenticated;

grant update (
  department_id, description, public_contact_name, public_contact_email,
  public_contact_phone, lifecycle, public_visibility, published_at,
  effective_at, expires_at, verification_status, data_status, source_type,
  source_id, source_label, last_verified_at
) on public.facility_operational_profiles to authenticated;

grant update (
  name, description, department_id, lifecycle, public_visibility, published_at,
  effective_at, expires_at, verification_status, data_status, source_type,
  source_id, source_label, last_verified_at
) on public.services to authenticated;

grant update (
  alias, lifecycle, public_visibility, published_at, effective_at, expires_at,
  verification_status, data_status, source_type, source_id, source_label,
  last_verified_at
) on public.service_aliases to authenticated;

grant update (
  recommendation_rank, public_notes, lifecycle, public_visibility,
  published_at, effective_at, expires_at, verification_status, data_status,
  source_type, source_id, source_label, last_verified_at
) on public.facility_service_mappings to authenticated;

grant delete on
  public.facility_operational_profiles,
  public.services,
  public.service_aliases,
  public.facility_service_mappings
to authenticated;

grant usage, select on sequence
  public.facility_operational_profiles_id_seq,
  public.services_id_seq,
  public.service_aliases_id_seq,
  public.facility_service_mappings_id_seq
to authenticated;

create policy facility_operational_profiles_read_published
on public.facility_operational_profiles for select to anon, authenticated
using (
  public_visibility
  and lifecycle = 'PUBLISHED'
  and coalesce(effective_at, published_at, created_at) <= now()
  and (expires_at is null or expires_at > now())
);

create policy facility_operational_profiles_read_super_admin
on public.facility_operational_profiles for select to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));

create policy facility_operational_profiles_insert_super_admin
on public.facility_operational_profiles for insert to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and (select private.has_any_role(array['SUPER_ADMIN']::public.app_role[]))
);

create policy facility_operational_profiles_update_super_admin
on public.facility_operational_profiles for update to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])))
with check (
  updated_by = (select auth.uid())
  and (select private.has_any_role(array['SUPER_ADMIN']::public.app_role[]))
);

create policy facility_operational_profiles_delete_super_admin
on public.facility_operational_profiles for delete to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));

create policy services_read_published
on public.services for select to anon, authenticated
using (
  public_visibility
  and lifecycle = 'PUBLISHED'
  and coalesce(effective_at, published_at, created_at) <= now()
  and (expires_at is null or expires_at > now())
);

create policy services_read_super_admin
on public.services for select to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));

create policy services_insert_super_admin
on public.services for insert to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and (select private.has_any_role(array['SUPER_ADMIN']::public.app_role[]))
);

create policy services_update_super_admin
on public.services for update to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])))
with check (
  updated_by = (select auth.uid())
  and (select private.has_any_role(array['SUPER_ADMIN']::public.app_role[]))
);

create policy services_delete_super_admin
on public.services for delete to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));

create policy service_aliases_read_published
on public.service_aliases for select to anon, authenticated
using (
  public_visibility
  and lifecycle = 'PUBLISHED'
  and coalesce(effective_at, published_at, created_at) <= now()
  and (expires_at is null or expires_at > now())
  and exists (
    select 1 from public.services service
    where service.id = service_aliases.service_id
      and service.public_visibility
      and service.lifecycle = 'PUBLISHED'
      and coalesce(service.effective_at, service.published_at, service.created_at) <= now()
      and (service.expires_at is null or service.expires_at > now())
  )
);

create policy service_aliases_read_super_admin
on public.service_aliases for select to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));

create policy service_aliases_insert_super_admin
on public.service_aliases for insert to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and (select private.has_any_role(array['SUPER_ADMIN']::public.app_role[]))
);

create policy service_aliases_update_super_admin
on public.service_aliases for update to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])))
with check (
  updated_by = (select auth.uid())
  and (select private.has_any_role(array['SUPER_ADMIN']::public.app_role[]))
);

create policy service_aliases_delete_super_admin
on public.service_aliases for delete to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));

create policy facility_service_mappings_read_published
on public.facility_service_mappings for select to anon, authenticated
using (
  public_visibility
  and lifecycle = 'PUBLISHED'
  and coalesce(effective_at, published_at, created_at) <= now()
  and (expires_at is null or expires_at > now())
  and exists (
    select 1 from public.facility_operational_profiles profile
    where profile.facility_id = facility_service_mappings.facility_id
      and profile.public_visibility
      and profile.lifecycle = 'PUBLISHED'
      and coalesce(profile.effective_at, profile.published_at, profile.created_at) <= now()
      and (profile.expires_at is null or profile.expires_at > now())
  )
  and exists (
    select 1 from public.services service
    where service.id = facility_service_mappings.service_id
      and service.public_visibility
      and service.lifecycle = 'PUBLISHED'
      and coalesce(service.effective_at, service.published_at, service.created_at) <= now()
      and (service.expires_at is null or service.expires_at > now())
  )
);

create policy facility_service_mappings_read_super_admin
on public.facility_service_mappings for select to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));

create policy facility_service_mappings_insert_super_admin
on public.facility_service_mappings for insert to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and (select private.has_any_role(array['SUPER_ADMIN']::public.app_role[]))
);

create policy facility_service_mappings_update_super_admin
on public.facility_service_mappings for update to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])))
with check (
  updated_by = (select auth.uid())
  and (select private.has_any_role(array['SUPER_ADMIN']::public.app_role[]))
);

create policy facility_service_mappings_delete_super_admin
on public.facility_service_mappings for delete to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));

create view public.public_facility_operational_profiles
with (security_invoker = true, security_barrier = true)
as
select
  profile.id,
  profile.facility_id,
  profile.department_id,
  profile.description,
  profile.public_contact_name,
  profile.public_contact_email,
  profile.public_contact_phone,
  profile.lifecycle,
  profile.published_at,
  profile.effective_at,
  profile.expires_at,
  profile.verification_status,
  profile.data_status,
  profile.source_type,
  profile.source_id,
  profile.source_label,
  profile.last_verified_at,
  profile.updated_at
from public.facility_operational_profiles profile
where profile.public_visibility
  and profile.lifecycle = 'PUBLISHED'
  and coalesce(profile.effective_at, profile.published_at, profile.created_at) <= now()
  and (profile.expires_at is null or profile.expires_at > now());

create view public.public_services
with (security_invoker = true, security_barrier = true)
as
select
  service.id,
  service.code,
  service.name,
  service.description,
  service.department_id,
  service.lifecycle,
  service.published_at,
  service.effective_at,
  service.expires_at,
  service.verification_status,
  service.data_status,
  service.source_type,
  service.source_id,
  service.source_label,
  service.last_verified_at,
  service.updated_at
from public.services service
where service.public_visibility
  and service.lifecycle = 'PUBLISHED'
  and coalesce(service.effective_at, service.published_at, service.created_at) <= now()
  and (service.expires_at is null or service.expires_at > now());

create view public.public_service_aliases
with (security_invoker = true, security_barrier = true)
as
select
  service_alias.id,
  service_alias.service_id,
  service.code as service_code,
  service_alias.alias,
  service_alias.lifecycle,
  service_alias.published_at,
  service_alias.effective_at,
  service_alias.expires_at,
  service_alias.verification_status,
  service_alias.data_status,
  service_alias.source_type,
  service_alias.source_id,
  service_alias.source_label,
  service_alias.last_verified_at,
  service_alias.updated_at
from public.service_aliases service_alias
join public.services service on service.id = service_alias.service_id
where service_alias.public_visibility
  and service_alias.lifecycle = 'PUBLISHED'
  and coalesce(service_alias.effective_at, service_alias.published_at, service_alias.created_at) <= now()
  and (service_alias.expires_at is null or service_alias.expires_at > now())
  and service.public_visibility
  and service.lifecycle = 'PUBLISHED'
  and coalesce(service.effective_at, service.published_at, service.created_at) <= now()
  and (service.expires_at is null or service.expires_at > now());

create view public.public_facility_service_mappings
with (security_invoker = true, security_barrier = true)
as
select
  mapping.id,
  mapping.facility_id,
  mapping.service_id,
  service.code as service_code,
  service.name as service_name,
  mapping.recommendation_rank,
  mapping.public_notes,
  mapping.lifecycle,
  mapping.published_at,
  mapping.effective_at,
  mapping.expires_at,
  mapping.verification_status,
  mapping.data_status,
  mapping.source_type,
  mapping.source_id,
  mapping.source_label,
  mapping.last_verified_at,
  mapping.updated_at
from public.facility_service_mappings mapping
join public.facility_operational_profiles profile on profile.facility_id = mapping.facility_id
join public.services service on service.id = mapping.service_id
where mapping.public_visibility
  and mapping.lifecycle = 'PUBLISHED'
  and coalesce(mapping.effective_at, mapping.published_at, mapping.created_at) <= now()
  and (mapping.expires_at is null or mapping.expires_at > now())
  and profile.public_visibility
  and profile.lifecycle = 'PUBLISHED'
  and coalesce(profile.effective_at, profile.published_at, profile.created_at) <= now()
  and (profile.expires_at is null or profile.expires_at > now())
  and service.public_visibility
  and service.lifecycle = 'PUBLISHED'
  and coalesce(service.effective_at, service.published_at, service.created_at) <= now()
  and (service.expires_at is null or service.expires_at > now());

revoke all on table
  public.public_facility_operational_profiles,
  public.public_services,
  public.public_service_aliases,
  public.public_facility_service_mappings
from anon, authenticated;

grant select on table
  public.public_facility_operational_profiles,
  public.public_services,
  public.public_service_aliases,
  public.public_facility_service_mappings
to anon, authenticated;

-- Extend the existing immutable audit stream. The entity IDs remain the
-- overlay tables' bigint primary keys; canonical facility_id is retained only
-- as safe metadata and remains the cross-system facility reference.
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
  'personnel_availability_override',
  'facility_operational_profile',
  'service',
  'service_alias',
  'facility_service_mapping'
));

create function private.record_facility_operational_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  entity_label text;
  entity_id_value bigint;
  previous_payload jsonb;
  next_payload jsonb;
  audit_payload jsonb;
  previous_lifecycle text;
  next_lifecycle text;
  action_label text;
begin
  -- Direct database maintenance has no end-user JWT and is intentionally not
  -- attributed to a CampusNav administrator.
  if actor_id is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  entity_label := case tg_table_name
    when 'facility_operational_profiles' then 'facility_operational_profile'
    when 'services' then 'service'
    when 'service_aliases' then 'service_alias'
    when 'facility_service_mappings' then 'facility_service_mapping'
  end;

  if entity_label is null then
    raise exception 'Unsupported facility operational audit entity table';
  end if;

  if tg_op = 'DELETE' then
    previous_payload := to_jsonb(old);
    audit_payload := previous_payload;
    entity_id_value := old.id;
    previous_lifecycle := previous_payload ->> 'lifecycle';
    action_label := entity_label || '_deleted';
  elsif tg_op = 'INSERT' then
    next_payload := to_jsonb(new);
    audit_payload := next_payload;
    entity_id_value := new.id;
    next_lifecycle := next_payload ->> 'lifecycle';
    action_label := entity_label || '_created';
  else
    previous_payload := to_jsonb(old);
    next_payload := to_jsonb(new);
    audit_payload := next_payload;
    entity_id_value := new.id;
    previous_lifecycle := previous_payload ->> 'lifecycle';
    next_lifecycle := next_payload ->> 'lifecycle';
    action_label := entity_label || case
      when previous_lifecycle is distinct from next_lifecycle and next_lifecycle = 'PUBLISHED' then '_published'
      when previous_lifecycle is distinct from next_lifecycle and next_lifecycle = 'SCHEDULED' then '_scheduled'
      when previous_lifecycle is distinct from next_lifecycle and next_lifecycle = 'CANCELLED' then '_cancelled'
      when previous_lifecycle is distinct from next_lifecycle and next_lifecycle = 'EXPIRED' then '_expired'
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
      'facility_id', audit_payload ->> 'facility_id',
      'service_id', audit_payload ->> 'service_id',
      'service_code', audit_payload ->> 'code',
      'from_lifecycle', previous_lifecycle,
      'to_lifecycle', next_lifecycle,
      'source_type', audit_payload ->> 'source_type',
      'source_id', audit_payload ->> 'source_id',
      'verification_status', audit_payload ->> 'verification_status',
      'data_status', audit_payload ->> 'data_status'
    ))
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke execute on function private.record_facility_operational_audit() from public, anon, authenticated;

create trigger facility_operational_profiles_record_audit
after insert or update or delete on public.facility_operational_profiles
for each row execute function private.record_facility_operational_audit();

create trigger services_record_audit
after insert or update or delete on public.services
for each row execute function private.record_facility_operational_audit();

create trigger service_aliases_record_audit
after insert or update or delete on public.service_aliases
for each row execute function private.record_facility_operational_audit();

create trigger facility_service_mappings_record_audit
after insert or update or delete on public.facility_service_mappings
for each row execute function private.record_facility_operational_audit();
