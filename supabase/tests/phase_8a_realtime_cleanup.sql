delete from public.announcements
where source_type = 'DEVELOPMENT_TEST' and source_id = 'PHASE8A-LIVE-RT-ANN';

delete from public.events
where source_type = 'DEVELOPMENT_TEST' and source_id = 'PHASE8A-LIVE-RT-EVENT';

delete from auth.users
where id = '00000000-0000-0000-0000-000000008a11';
