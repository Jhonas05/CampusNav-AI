# CampusNav AI — Repository Ownership and Module Boundaries

## Why this exists
The documentation defines architectural ownership even if physical folder names evolve.

## Logical ownership
- **navigation/spatial**: floors, facilities geometry, nodes, edges, stairs, restrictions, QR linkage
- **map presentation**: 2D/3D renderers; consume shared spatial/routing state
- **facility domain**: services, hours, advisories, facility status
- **academic/personnel**: class schedules, assignments, check-ins, availability
- **Dashboard/content**: announcements, events, alerts, targeted status surfaces
- **Admin**: authorized CRUD/workflows; never bypass domain validation
- **auth/security**: session, roles, RLS, privileged operations
- **CLARA**: tool orchestration over internal services only
- **tests/scripts**: verification and deployment checks, not production business truth

## Boundary rules
- React pages/components should not embed database policy or pathfinding algorithms.
- 2D/3D components should not own duplicate coordinates.
- Admin UI should call the same domain validation rules as other writers.
- CLARA should not query raw tables in ways that bypass service/security rules.
- emergency logic remains isolated from normal route fallback.

## Physical-path rule
If the actual repository layout differs, do not invent paths in this document. Update this file from the repository only after verifying the real structure.
