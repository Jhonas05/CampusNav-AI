# CampusNav AI — Supabase / Database Schema Registry

## Purpose
Compact developer registry for cloud-backed domains. It is not a replacement for migrations; actual SQL/migrations remain authoritative.

## A. Identity and access
| Table/domain | Purpose | Visibility/notes |
|---|---|---|
| profiles | app-facing user profile | user/role scoped |
| roles | role catalog | protected/admin-managed |
| user_roles | user↔role mapping | RLS critical |
| departments | department registry | public/admin depending fields |
| audiences | targeting groups where used | admin-managed |

## B. Dashboard/content
| Table/domain | Purpose |
|---|---|
| announcements | official announcements |
| notifications | targeted notification records |
| facility_advisories | closure/maintenance/service notices |
| events | calendar/events |
| audience link tables | target groups for content |
| dashboard_refresh_events | implementation-specific refresh trigger |
| audit_logs | administrative audit trail |

## C. Academic/personnel
| Table | Purpose |
|---|---|
| personnel | approved personnel profile |
| courses | course/subject catalog |
| academic_sections | section catalog |
| class_schedules | scheduled class time/room/professor |
| schedule_exceptions | cancellation/reschedule/room/professor/time changes |
| personnel_facility_assignments | office/lab assignment |
| personnel_consultation_hours | consultation windows |
| personnel_checkins | authorized check-in/out evidence |
| personnel_availability_overrides | explicit available/unavailable override |
| personnel_auth_links | private auth↔personnel linkage |

## D. Spatial/navigation
Current project guidance keeps proven map/navigation data local/version-controlled unless deliberate migration is approved.

Master architecture expects equivalent entities such as:
- buildings
- floors
- facilities
- facility_geometry
- map_nodes
- map_edges
- stairs
- route_restrictions
- qr_checkpoints
- map_versions / change logs

Do not move these merely for architectural neatness if it risks destabilizing working navigation. Any migration needs compatibility tests and stable IDs.

## E. Facility operations / future expansion
Expected concepts:
- facility_hours
- facility_schedule_exceptions
- facility/services mappings
- services
- facility advisories

## F. Emergency
Expected/approved concepts:
- emergency_exits
- emergency_equipment
- emergency_routes
- emergency_contacts

Emergency data requires stricter admin ownership/verification.

## G. User preferences / reporting / CLARA future
Possible source-defined concepts:
- notification_preferences
- saved_locations
- user_navigation_preferences
- campus_reports
- clara_knowledge_sources
- clara_conversation_logs (privacy-limited)
- system_settings

## RLS principles
- public reads only for records intentionally public/effective
- admin writes are role-scoped
- department/facility managers must be scoped where supported
- private auth/personnel linkage is not public
- audit logs are not user-editable
- AI integration never bypasses RLS for convenience

## Realtime
Enable only for domains that benefit from live updates. Avoid broad unnecessary subscriptions.

## Migration discipline
- migrations are version-controlled
- no manual production-only schema drift
- seed/demo data is clearly labeled
- destructive schema changes require rollback/backfill plan

## Source basis
- CampusNav Project Source Reference — normalized PostgreSQL entities
- CampusNav AI Final Expanded Architecture — backend data groups
- current content folder — implemented Supabase domains and spatial-local boundary
