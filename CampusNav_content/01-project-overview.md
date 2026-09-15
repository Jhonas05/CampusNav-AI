# CampusNav AI — Project Overview

## Project
**CampusNav AI** is a campus navigation and information platform for **St. Clare College of Caloocan**.

The thesis proposal originally frames it as a **tablet-based smart campus navigation and facility recommendation system**. The current implementation architecture is broader: a **responsive web-based system** that works on phones, tablets, laptops, desktops, and large displays. Do not silently change the formal thesis title; treat title wording as a research/adviser decision while the software remains responsive and web-based.

## What the system combines
- GF–5F indoor campus navigation
- 2D and 3D campus maps
- QR checkpoint positioning + manual current-location fallback
- multi-floor A* route planning
- facility directory, services, hours, advisories, and status
- verified emergency information and emergency-only routing
- centralized Dashboard for alerts, schedules, events, advisories, and availability
- Supabase-backed authentication, RBAC, Realtime, and content management
- academic schedule and personnel-availability engine
- future CLARA Intelligent Digital Concierge

## Current implemented capabilities
- GF–5F digitized floor maps
- same-floor and multi-floor A* routing
- 2D and 3D route rendering from the same A* node sequence
- exploded/stacked 3D floors, floor isolation, camera controls
- QR checkpoint positioning and manual-location fallback
- emergency-only routing with safe no-route behavior
- construction/restricted-area avoidance
- Dashboard with alerts/classes/offices/personnel/events/notices sections
- Supabase Auth, profiles, roles, user_roles, RLS, Realtime
- SUPER_ADMIN live-cloud validation
- Admin CMS for announcements, events, facility advisories, notifications, and audit activity
- academic/personnel backend for class schedules, assignments, consultation hours, check-ins, overrides, and next-availability logic
- deployed production site through Cloudflare

## Current navigation showcase routes
- Library 3F → Virtual Laboratory 3F
- Library 3F → Registrar’s Office 5F
- Main Entrance GF → Registrar’s Office 5F
- QR-3F-LIBRARY → Registrar’s Office

## Current thesis-core boundary
Core thesis target:
- 2D + 3D navigation
- verified GF–5F routing
- QR/manual indoor positioning
- Dashboard
- facility/service information
- schedule/personnel lookup
- admin-managed data
- strict emergency rules
- CLARA only after internal APIs are stable

Optional/future:
- outdoor GPS continuity
- BLE indoor positioning
- Wi-Fi fingerprinting
- UWB
- hardware-heavy presence systems
- Google-level photorealistic 3D

## Data-quality rule
Do not invent official room geometry, schedules, personnel presence, office hours, emergency routes, accessibility infrastructure, crowd information, or announcements. Unknown items must remain unavailable, estimated, source-aligned, demo-labeled, or pending verification.
