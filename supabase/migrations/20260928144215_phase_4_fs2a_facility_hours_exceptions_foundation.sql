-- CampusNav Phase 4-FS-2A facility hours and dated-exception foundation.
--
-- This forward migration adds only recurring weekly hours, replacement-date
-- exceptions, narrow public projections, RLS/grants, overlap enforcement,
-- provenance, and trusted audit support. All facility references continue to
-- use facility_operational_profiles.facility_id, which is the accepted
-- operational overlay key for the canonical local facility registry. It adds
-- no official schedules, status computation, provider/UI code, spatial data,
-- routing data, Realtime publication, or replacement closure table.

create extension if not exists btree_gist with schema extensions;

create table public.facility_hours (
  id bigint generated always as identity primary key,
  facility_id text not null references public.facility_operational_profiles(facility_id) on delete restrict,
  day_of_week smallint not null,
  closed_all_day boolean not null default false,
  start_time time without time zone,
  end_time time without time zone,
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
  constraint facility_hours_day_of_week_range check (day_of_week between 0 and 6),
  constraint facility_hours_interval_shape check (
    (closed_all_day and start_time is null and end_time is null)
    or (not closed_all_day and start_time is not null and end_time is not null)
  ),
  constraint facility_hours_source_type_length check (char_length(source_type) between 1 and 80),
  constraint facility_hours_source_id_length check (source_id is null or char_length(source_id) between 1 and 160),
  constraint facility_hours_source_label_length check (source_label is null or char_length(source_label) between 1 and 240),
  constraint facility_hours_effective_range check (expires_at is null or effective_at is null or expires_at > effective_at),
  constraint facility_hours_published_at_check check (lifecycle <> 'PUBLISHED' or published_at is not null),
  constraint facility_hours_demo_provenance_check check ((data_status = 'DEMO') = (verification_status = 'DEMO_ONLY')),
  constraint facility_hours_active_provenance_check check (data_status <> 'ACTIVE' or verification_status in ('VERIFIED', 'SOURCE_ALIGNED')),
  constraint facility_hours_verified_at_check check (verification_status not in ('VERIFIED', 'SOURCE_ALIGNED') or last_verified_at is not null),
  constraint facility_hours_active_schedule_exclusion exclude using gist (
    facility_id with =,
    day_of_week with =,
    tstzrange(
      coalesce(effective_at, '-infinity'::timestamptz),
      coalesce(expires_at, 'infinity'::timestamptz),
      '[)'
    ) with &&,
    numrange(
      case when closed_all_day then 0::numeric else extract(epoch from start_time) end,
      case
        when closed_all_day then 172800::numeric
        when end_time <= start_time then extract(epoch from end_time) + 86400::numeric
        else extract(epoch from end_time)
      end,
      '[)'
    ) with &&
  ) where (lifecycle in ('SCHEDULED', 'PUBLISHED'))
);

create table public.facility_hour_exceptions (
  id bigint generated always as identity primary key,
  facility_id text not null references public.facility_operational_profiles(facility_id) on delete restrict,
  exception_date date not null,
  closed_all_day boolean not null default false,
  start_time time without time zone,
  end_time time without time zone,
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
  constraint facility_hour_exceptions_interval_shape check (
    (closed_all_day and start_time is null and end_time is null)
    or (not closed_all_day and start_time is not null and end_time is not null)
  ),
  constraint facility_hour_exceptions_source_type_length check (char_length(source_type) between 1 and 80),
  constraint facility_hour_exceptions_source_id_length check (source_id is null or char_length(source_id) between 1 and 160),
  constraint facility_hour_exceptions_source_label_length check (source_label is null or char_length(source_label) between 1 and 240),
  constraint facility_hour_exceptions_effective_range check (expires_at is null or effective_at is null or expires_at > effective_at),
  constraint facility_hour_exceptions_published_at_check check (lifecycle <> 'PUBLISHED' or published_at is not null),
  constraint facility_hour_exceptions_demo_provenance_check check ((data_status = 'DEMO') = (verification_status = 'DEMO_ONLY')),
  constraint facility_hour_exceptions_active_provenance_check check (data_status <> 'ACTIVE' or verification_status in ('VERIFIED', 'SOURCE_ALIGNED')),
  constraint facility_hour_exceptions_verified_at_check check (verification_status not in ('VERIFIED', 'SOURCE_ALIGNED') or last_verified_at is not null),
  constraint facility_hour_exceptions_active_schedule_exclusion exclude using gist (
    facility_id with =,
    exception_date with =,
    tstzrange(
      coalesce(effective_at, '-infinity'::timestamptz),
      coalesce(expires_at, 'infinity'::timestamptz),
      '[)'
    ) with &&,
    numrange(
      case when closed_all_day then 0::numeric else extract(epoch from start_time) end,
      case
        when closed_all_day then 172800::numeric
        when end_time <= start_time then extract(epoch from end_time) + 86400::numeric
        else extract(epoch from end_time)
      end,
      '[)'
    ) with &&
  ) where (lifecycle in ('SCHEDULED', 'PUBLISHED'))
);

create unique index facility_hours_source_unique_idx
on public.facility_hours (source_type, source_id)
where source_id is not null;
create index facility_hours_facility_day_idx
on public.facility_hours (facility_id, day_of_week, start_time);
create index facility_hours_public_idx
on public.facility_hours (lifecycle, public_visibility, effective_at, expires_at);
create index facility_hours_created_by_idx on public.facility_hours (created_by);
create index facility_hours_updated_by_idx on public.facility_hours (updated_by);

create unique index facility_hour_exceptions_source_unique_idx
on public.facility_hour_exceptions (source_type, source_id)
where source_id is not null;
create index facility_hour_exceptions_facility_date_idx
on public.facility_hour_exceptions (facility_id, exception_date, start_time);
create index facility_hour_exceptions_public_idx
on public.facility_hour_exceptions (lifecycle, public_visibility, effective_at, expires_at);
create index facility_hour_exceptions_created_by_idx on public.facility_hour_exceptions (created_by);
create index facility_hour_exceptions_updated_by_idx on public.facility_hour_exceptions (updated_by);

create trigger facility_hours_touch_updated_at
before update on public.facility_hours
for each row execute function private.touch_facility_operational_record();

create trigger facility_hour_exceptions_touch_updated_at
before update on public.facility_hour_exceptions
for each row execute function private.touch_facility_operational_record();

alter table public.facility_hours enable row level security;
alter table public.facility_hour_exceptions enable row level security;

revoke all on table
  public.facility_hours,
  public.facility_hour_exceptions
from anon, authenticated;

revoke all on sequence
  public.facility_hours_id_seq,
  public.facility_hour_exceptions_id_seq
from anon, authenticated;

grant select (
  id, facility_id, day_of_week, closed_all_day, start_time, end_time,
  lifecycle, public_visibility, published_at, effective_at, expires_at,
  verification_status, data_status, source_type, source_id, source_label,
  last_verified_at, created_at, updated_at
) on public.facility_hours to anon, authenticated;

grant select (
  id, facility_id, exception_date, closed_all_day, start_time, end_time,
  lifecycle, public_visibility, published_at, effective_at, expires_at,
  verification_status, data_status, source_type, source_id, source_label,
  last_verified_at, created_at, updated_at
) on public.facility_hour_exceptions to anon, authenticated;

grant insert (
  facility_id, day_of_week, closed_all_day, start_time, end_time, lifecycle,
  public_visibility, published_at, effective_at, expires_at,
  verification_status, data_status, source_type, source_id, source_label,
  last_verified_at
) on public.facility_hours to authenticated;

grant insert (
  facility_id, exception_date, closed_all_day, start_time, end_time, lifecycle,
  public_visibility, published_at, effective_at, expires_at,
  verification_status, data_status, source_type, source_id, source_label,
  last_verified_at
) on public.facility_hour_exceptions to authenticated;

grant update (
  day_of_week, closed_all_day, start_time, end_time, lifecycle,
  public_visibility, published_at, effective_at, expires_at,
  verification_status, data_status, source_type, source_id, source_label,
  last_verified_at
) on public.facility_hours to authenticated;

grant update (
  exception_date, closed_all_day, start_time, end_time, lifecycle,
  public_visibility, published_at, effective_at, expires_at,
  verification_status, data_status, source_type, source_id, source_label,
  last_verified_at
) on public.facility_hour_exceptions to authenticated;

grant delete on
  public.facility_hours,
  public.facility_hour_exceptions
to authenticated;

grant usage, select on sequence
  public.facility_hours_id_seq,
  public.facility_hour_exceptions_id_seq
to authenticated;

create policy facility_hours_read_published
on public.facility_hours for select to anon, authenticated
using (
  public_visibility
  and lifecycle = 'PUBLISHED'
  and coalesce(effective_at, published_at, created_at) <= now()
  and (expires_at is null or expires_at > now())
  and exists (
    select 1 from public.facility_operational_profiles profile
    where profile.facility_id = facility_hours.facility_id
      and profile.public_visibility
      and profile.lifecycle = 'PUBLISHED'
      and coalesce(profile.effective_at, profile.published_at, profile.created_at) <= now()
      and (profile.expires_at is null or profile.expires_at > now())
  )
);

create policy facility_hours_read_super_admin
on public.facility_hours for select to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));

create policy facility_hours_insert_super_admin
on public.facility_hours for insert to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and (select private.has_any_role(array['SUPER_ADMIN']::public.app_role[]))
);

create policy facility_hours_update_super_admin
on public.facility_hours for update to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])))
with check (
  updated_by = (select auth.uid())
  and (select private.has_any_role(array['SUPER_ADMIN']::public.app_role[]))
);

create policy facility_hours_delete_super_admin
on public.facility_hours for delete to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));

create policy facility_hour_exceptions_read_published
on public.facility_hour_exceptions for select to anon, authenticated
using (
  public_visibility
  and lifecycle = 'PUBLISHED'
  and coalesce(effective_at, published_at, created_at) <= now()
  and (expires_at is null or expires_at > now())
  and exists (
    select 1 from public.facility_operational_profiles profile
    where profile.facility_id = facility_hour_exceptions.facility_id
      and profile.public_visibility
      and profile.lifecycle = 'PUBLISHED'
      and coalesce(profile.effective_at, profile.published_at, profile.created_at) <= now()
      and (profile.expires_at is null or profile.expires_at > now())
  )
);

create policy facility_hour_exceptions_read_super_admin
on public.facility_hour_exceptions for select to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));

create policy facility_hour_exceptions_insert_super_admin
on public.facility_hour_exceptions for insert to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and (select private.has_any_role(array['SUPER_ADMIN']::public.app_role[]))
);

create policy facility_hour_exceptions_update_super_admin
on public.facility_hour_exceptions for update to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])))
with check (
  updated_by = (select auth.uid())
  and (select private.has_any_role(array['SUPER_ADMIN']::public.app_role[]))
);

create policy facility_hour_exceptions_delete_super_admin
on public.facility_hour_exceptions for delete to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));

create view public.public_facility_hours
with (security_invoker = true, security_barrier = true)
as
select
  hours.facility_id,
  hours.day_of_week,
  hours.closed_all_day,
  hours.start_time,
  hours.end_time,
  hours.lifecycle,
  hours.published_at,
  hours.effective_at,
  hours.expires_at,
  hours.verification_status,
  hours.data_status,
  hours.source_type,
  hours.source_id,
  hours.source_label,
  hours.last_verified_at,
  hours.updated_at
from public.facility_hours hours
where hours.public_visibility
  and hours.lifecycle = 'PUBLISHED'
  and coalesce(hours.effective_at, hours.published_at, hours.created_at) <= now()
  and (hours.expires_at is null or hours.expires_at > now());

create view public.public_facility_hour_exceptions
with (security_invoker = true, security_barrier = true)
as
select
  exception.facility_id,
  exception.exception_date,
  exception.closed_all_day,
  exception.start_time,
  exception.end_time,
  exception.lifecycle,
  exception.published_at,
  exception.effective_at,
  exception.expires_at,
  exception.verification_status,
  exception.data_status,
  exception.source_type,
  exception.source_id,
  exception.source_label,
  exception.last_verified_at,
  exception.updated_at
from public.facility_hour_exceptions exception
where exception.public_visibility
  and exception.lifecycle = 'PUBLISHED'
  and coalesce(exception.effective_at, exception.published_at, exception.created_at) <= now()
  and (exception.expires_at is null or exception.expires_at > now());

-- TEMPORARY_CLOSURE is the existing facility-wide closure vocabulary. This
-- projection deliberately excludes SERVICE_INTERRUPTION and all advisory
-- content/private metadata; status precedence remains a later FS-2 slice.
create view public.public_facility_status_advisories
with (security_invoker = true, security_barrier = true)
as
select
  advisory.related_facility_id as facility_id,
  advisory.advisory_type,
  advisory.lifecycle,
  advisory.published_at,
  advisory.effective_at,
  advisory.expires_at,
  advisory.verification_status,
  advisory.data_status,
  advisory.source_type,
  advisory.source_id,
  advisory.updated_at
from public.facility_advisories advisory
where advisory.is_public
  and advisory.lifecycle = 'PUBLISHED'
  and advisory.advisory_type = 'TEMPORARY_CLOSURE'
  and coalesce(advisory.effective_at, advisory.published_at, advisory.created_at) <= now()
  and (advisory.expires_at is null or advisory.expires_at > now());

revoke all on table
  public.public_facility_hours,
  public.public_facility_hour_exceptions,
  public.public_facility_status_advisories
from anon, authenticated;

grant select on table
  public.public_facility_hours,
  public.public_facility_hour_exceptions,
  public.public_facility_status_advisories
to anon, authenticated;

-- Extend the accepted immutable audit stream without copying interval payloads
-- or private actor fields into metadata.
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
  'facility_service_mapping',
  'facility_hour',
  'facility_hour_exception'
));

create or replace function private.record_facility_operational_audit()
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
    when 'facility_hours' then 'facility_hour'
    when 'facility_hour_exceptions' then 'facility_hour_exception'
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
      'day_of_week', audit_payload ->> 'day_of_week',
      'exception_date', audit_payload ->> 'exception_date',
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

create trigger facility_hours_record_audit
after insert or update or delete on public.facility_hours
for each row execute function private.record_facility_operational_audit();

create trigger facility_hour_exceptions_record_audit
after insert or update or delete on public.facility_hour_exceptions
for each row execute function private.record_facility_operational_audit();
