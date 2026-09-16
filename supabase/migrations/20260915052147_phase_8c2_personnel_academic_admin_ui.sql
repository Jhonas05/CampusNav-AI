-- CampusNav Phase 8C.2 personnel and academic schedule Admin UI support.
--
-- This migration does not broaden the Phase 8C.1 role model. It adds the
-- approved personnel categories, permits an optional consultation facility,
-- exposes the approved name fields to authenticated managers under the
-- existing row policies, and makes schedule conflict validation authoritative
-- at the database layer.

alter type public.personnel_type add value if not exists 'LAB_PERSONNEL';
alter type public.personnel_type add value if not exists 'OFFICE_PERSONNEL';
alter type public.personnel_type add value if not exists 'ADMINISTRATIVE';

alter table public.personnel_consultation_hours
  alter column facility_id drop not null;

grant select (first_name, middle_name, last_name)
on public.personnel to authenticated;

create extension if not exists btree_gist with schema extensions;

alter table public.class_schedules
  add constraint class_schedules_room_conflict_exclusion
  exclude using gist (
    facility_id with =,
    day_of_week with =,
    daterange(effective_from, coalesce(effective_until, 'infinity'::date), '[]') with &&,
    tsrange(date '2000-01-01' + start_time, date '2000-01-01' + end_time, '[)') with &&
  ) where (status = 'ACTIVE'),
  add constraint class_schedules_professor_conflict_exclusion
  exclude using gist (
    personnel_id with =,
    day_of_week with =,
    daterange(effective_from, coalesce(effective_until, 'infinity'::date), '[]') with &&,
    tsrange(date '2000-01-01' + start_time, date '2000-01-01' + end_time, '[)') with &&
  ) where (status = 'ACTIVE'),
  add constraint class_schedules_section_conflict_exclusion
  exclude using gist (
    section_id with =,
    day_of_week with =,
    daterange(effective_from, coalesce(effective_until, 'infinity'::date), '[]') with &&,
    tsrange(date '2000-01-01' + start_time, date '2000-01-01' + end_time, '[)') with &&
  ) where (status = 'ACTIVE');

comment on constraint class_schedules_room_conflict_exclusion on public.class_schedules
  is 'Prevents overlapping active weekly schedules in the same CampusNav facility.';
comment on constraint class_schedules_professor_conflict_exclusion on public.class_schedules
  is 'Prevents a personnel record from being assigned to overlapping active classes.';
comment on constraint class_schedules_section_conflict_exclusion on public.class_schedules
  is 'Prevents an academic section from receiving overlapping active classes.';
