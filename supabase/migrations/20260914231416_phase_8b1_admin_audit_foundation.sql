-- CampusNav Phase 8B.1 Admin CMS audit foundation.
-- Audit rows are created only by trusted content-table triggers. This migration
-- does not add user management, schedules, personnel, or map administration.

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id bigint not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_action_format check (action ~ '^[a-z][a-z0-9_]*$'),
  constraint audit_logs_entity_type_check check (entity_type in ('announcement', 'event', 'facility_advisory', 'notification')),
  constraint audit_logs_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

create index audit_logs_actor_user_id_idx on public.audit_logs (actor_user_id) where actor_user_id is not null;
create index audit_logs_created_at_id_idx on public.audit_logs (created_at desc, id desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

alter table public.audit_logs enable row level security;

revoke all on table public.audit_logs from anon, authenticated;
revoke all on sequence public.audit_logs_id_seq from anon, authenticated;
grant select on table public.audit_logs to authenticated;

create policy audit_logs_read_super_admin
on public.audit_logs
for select
to authenticated
using ((select private.has_any_role(array['SUPER_ADMIN']::public.app_role[])));

create function private.record_admin_content_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  entity_label text;
  entity_id_value bigint;
  previous_lifecycle text;
  next_lifecycle text;
  action_label text;
  source_type_value text;
  source_id_value text;
begin
  -- Direct database maintenance has no end-user JWT and is intentionally not
  -- attributed to a CampusNav administrator.
  if actor_id is null then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  entity_label := case tg_table_name
    when 'announcements' then 'announcement'
    when 'events' then 'event'
    when 'facility_advisories' then 'facility_advisory'
    when 'notifications' then 'notification'
  end;

  if entity_label is null then
    raise exception 'Unsupported audit entity table';
  end if;

  if tg_op = 'DELETE' then
    entity_id_value := old.id;
    previous_lifecycle := old.lifecycle::text;
    source_type_value := old.source_type;
    source_id_value := old.source_id;
    action_label := entity_label || '_deleted';
  elsif tg_op = 'INSERT' then
    entity_id_value := new.id;
    next_lifecycle := new.lifecycle::text;
    source_type_value := new.source_type;
    source_id_value := new.source_id;
    action_label := entity_label || '_created';
  else
    entity_id_value := new.id;
    previous_lifecycle := old.lifecycle::text;
    next_lifecycle := new.lifecycle::text;
    source_type_value := new.source_type;
    source_id_value := new.source_id;
    action_label := entity_label || case
      when old.lifecycle is distinct from new.lifecycle and new.lifecycle = 'PUBLISHED' then '_published'
      when old.lifecycle is distinct from new.lifecycle and new.lifecycle = 'SCHEDULED' then '_scheduled'
      when old.lifecycle is distinct from new.lifecycle and new.lifecycle = 'CANCELLED' then '_cancelled'
      when old.lifecycle is distinct from new.lifecycle and new.lifecycle = 'EXPIRED' then '_expired'
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
      'from_lifecycle', previous_lifecycle,
      'to_lifecycle', next_lifecycle,
      'source_type', source_type_value,
      'source_id', source_id_value
    ))
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke execute on function private.record_admin_content_audit() from public, anon, authenticated;

create trigger announcements_record_admin_audit
after insert or update or delete on public.announcements
for each row execute function private.record_admin_content_audit();

create trigger events_record_admin_audit
after insert or update or delete on public.events
for each row execute function private.record_admin_content_audit();

create trigger facility_advisories_record_admin_audit
after insert or update or delete on public.facility_advisories
for each row execute function private.record_admin_content_audit();

create trigger notifications_record_admin_audit
after insert or update or delete on public.notifications
for each row execute function private.record_admin_content_audit();
