select source_table, fixture_count
from (
  select 'departments'::text source_table, count(*)::bigint fixture_count from public.departments where name ilike '%DEMO / DEVELOPMENT / NOT OFFICIAL%'
  union all select 'personnel', count(*) from public.personnel where verification_status = 'DEMO_ONLY' or display_name ilike '%DEMO / DEVELOPMENT / NOT OFFICIAL%'
  union all select 'courses', count(*) from public.courses where verification_status = 'DEMO_ONLY' or name ilike '%DEMO / DEVELOPMENT / NOT OFFICIAL%'
  union all select 'academic_sections', count(*) from public.academic_sections where verification_status = 'DEMO_ONLY'
  union all select 'class_schedules', count(*) from public.class_schedules where verification_status = 'DEMO_ONLY' or source_type = 'DEVELOPMENT_TEST'
  union all select 'schedule_exceptions', count(*) from public.schedule_exceptions where verification_status = 'DEMO_ONLY' or source_type = 'DEVELOPMENT_TEST'
  union all select 'personnel_facility_assignments', count(*) from public.personnel_facility_assignments where verification_status = 'DEMO_ONLY' or source_type = 'DEVELOPMENT_TEST'
  union all select 'personnel_consultation_hours', count(*) from public.personnel_consultation_hours where verification_status = 'DEMO_ONLY' or source_type = 'DEVELOPMENT_TEST'
  union all select 'personnel_checkins', count(*) from public.personnel_checkins where source_reference ilike '%DEMO / DEVELOPMENT / NOT OFFICIAL%'
  union all select 'personnel_availability_overrides', count(*) from public.personnel_availability_overrides where verification_status = 'DEMO_ONLY' or source_type = 'DEVELOPMENT_TEST'
  union all select 'announcements', count(*) from public.announcements where verification_status = 'DEMO_ONLY' or source_type = 'DEVELOPMENT_TEST'
  union all select 'events', count(*) from public.events where verification_status = 'DEMO_ONLY' or source_type = 'DEVELOPMENT_TEST'
  union all select 'facility_advisories', count(*) from public.facility_advisories where verification_status = 'DEMO_ONLY' or source_type = 'DEVELOPMENT_TEST'
  union all select 'notifications', count(*) from public.notifications where verification_status = 'DEMO_ONLY' or source_type = 'DEVELOPMENT_TEST'
) fixture_audit
order by source_table;
