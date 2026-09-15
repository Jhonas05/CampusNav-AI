delete from public.announcements
where source_type = 'DEVELOPMENT_TEST' and source_id = 'PHASE8A-LIVE-RT-ANN';

delete from public.events
where source_type = 'DEVELOPMENT_TEST' and source_id = 'PHASE8A-LIVE-RT-EVENT';

delete from auth.users
where id = '00000000-0000-0000-0000-000000008a11';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000008a11',
  'authenticated',
  'authenticated',
  'phase8a-realtime@development.invalid',
  '',
  now(),
  '{}',
  '{}',
  now(),
  now()
);

insert into public.announcements (
  title, message, lifecycle, is_public, published_at, effective_at,
  source_type, source_id, verification_status, data_status, created_by
) values (
  'Development Realtime Test',
  'DEMO / DEVELOPMENT / NOT OFFICIAL',
  'PUBLISHED',
  true,
  now(),
  now(),
  'DEVELOPMENT_TEST',
  'PHASE8A-LIVE-RT-ANN',
  'DEMO_ONLY',
  'DEMO',
  '00000000-0000-0000-0000-000000008a11'
);

insert into public.events (
  title, description, starts_at, ends_at, lifecycle, is_public,
  published_at, effective_at, source_type, source_id,
  verification_status, data_status, created_by
) values (
  'Development Realtime Event',
  'DEMO / DEVELOPMENT / NOT OFFICIAL',
  now() + interval '1 day',
  now() + interval '1 day 1 hour',
  'PUBLISHED',
  true,
  now(),
  now(),
  'DEVELOPMENT_TEST',
  'PHASE8A-LIVE-RT-EVENT',
  'DEMO_ONLY',
  'DEMO',
  '00000000-0000-0000-0000-000000008a11'
);

