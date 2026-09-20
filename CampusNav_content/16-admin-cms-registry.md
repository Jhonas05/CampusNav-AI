# CampusNav AI — Admin CMS Registry and Data Ownership

## Purpose
Defines what administrators may manage and which office should own each type of truth.

## Core principle
The system must be maintainable **without editing source code**, but different offices should only control data they are authorized to maintain.

## Admin areas
| Area | Responsibilities |
|---|---|
| Overview | system status / counts / recent administrative activity |
| Map Management | floors, facility geometry, nodes, edges, stairs, QR checkpoints, restrictions |
| Facilities | names, services, hours, advisories, public contacts, images |
| Personnel | approved public profile, department, facility assignment |
| Schedules | class schedules, room assignments, personnel schedules, consultation hours, exceptions |
| Announcements / Notifications | official content, audiences, lifecycle |
| Events | calendar items, venues, target groups |
| Suspensions | official scope/status/timeline where implemented |
| Emergency | verified exits/equipment/routes/contacts; strict approval workflow |
| Users / Roles | authentication linkage and permissions |
| Reports | user-submitted issues and analytics as permitted |
| Audit Logs | read-only review of important admin changes |
| Settings | safe system configuration |
| CLARA Knowledge | verified campus knowledge sources after CLARA phase |

## Current known Admin implementation
Current content folder indicates:
- SUPER_ADMIN validated live
- content CMS for announcements/events/facility advisories/notifications
- audit activity
- QR checkpoint admin surface

Phase 8C.2 should add academic/personnel admin surfaces.

## Phase 4 facility/service administration
Phase 4 adds maintainable workflows for operational facility profiles, services, approved aliases, facility-service mappings, weekly hours, dated exceptions, operational advisories/status, and media metadata/lifecycle.

Admin records must reference the existing canonical facility IDs and must not edit or duplicate spatial geometry, map nodes/edges, QR relationships, emergency approval, or route logic. `SUPER_ADMIN` is the safe initial administrative boundary. Department/facility-manager access may be enabled only when its generic scope and RLS relationship are explicit; no institutional office assignment is inferred.

FS-1 supplies schema, RLS, trusted-audit, provenance/lifecycle, and service foundations only. It does not add the Phase 4 Admin UI or seed official records. Phase 4-FS-3 owns the Admin workflows after the foundation is accepted.

## Suggested data owners
From the approved architecture:
- **Facilities/map:** designated campus/facility administrator
- **Class schedules:** Academic Affairs / authorized academic scheduling office
- **Personnel public availability:** department heads or authorized HR/academic office depending on school policy
- **Emergency:** authorized safety/security/facilities office
- **Official announcements/suspensions:** authorized school administration only

## Academic/personnel admin requirements
- personnel
- courses
- sections
- class schedules
- schedule exceptions
- facility/office assignments
- consultation hours
- check-in/check-out authorization
- availability overrides
- conflict validation

## Safer record lifecycle
Prefer:
- deactivate
- cancel
- expire
- end assignment
- archive

over destructive deletion when history/audit matters.

## Map admin
Master source expects a future-capable map editor with floor-plan reference/calibration, node/edge editing, and map version history. If not yet implemented, keep it in roadmap rather than faking it.

## Audit actions
Important examples:
- announcement published
- facility updated
- facility service or alias changed
- facility-service mapping changed
- hours changed
- facility media published, archived, or removed
- personnel assignment changed
- schedule/exception changed
- suspension status changed
- emergency record changed
- user role changed
- map data changed

## Source basis
- CampusNav Project Source Reference — Admin Dashboard, Map Administration, User Reporting, Audit Logging
- CampusNav AI Final Expanded Architecture — Admin CMS and suggested data owners
