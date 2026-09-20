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

## E. Phase 4 facility operational overlay
Phase 4 may introduce version-controlled concepts such as:
- facility operational profiles keyed by existing canonical local facility IDs
- services
- service aliases
- facility-service mappings
- facility hours
- facility schedule/hour exceptions
- facility media metadata
- the existing facility advisories domain

These records are operational overlays only. They must not contain competing floor/geometry/node/edge/QR/routing truth or establish a second facility identity namespace.

FS-1 scope is limited to operational profiles, services, aliases where approved, mappings, provenance/lifecycle fields, RLS, trusted audit, and the provider-neutral service foundation. Hours/exceptions, Admin UI, public UI, media storage, and Dashboard/Realtime behavior are later Phase 4 subphases.

No migration may seed official institutional facility/service records. Isolated synthetic `DEVELOPMENT` and visibly labeled `DEMO` fixtures must use recognizable identifiers and be removable.

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

Phase 4 should prefer one domain-level refresh signal/provider subscription for meaningful published facility operational changes. Static service catalogs and cards do not each require their own public subscription. Realtime never bypasses RLS and never converts stale or pending data into a live claim.

## Migration discipline
- migrations are version-controlled
- no manual production-only schema drift
- seed/demo data is clearly labeled
- destructive schema changes require rollback/backfill plan

## Source basis
- CampusNav Project Source Reference — normalized PostgreSQL entities
- CampusNav AI Final Expanded Architecture — backend data groups
- current content folder — implemented Supabase domains and spatial-local boundary
