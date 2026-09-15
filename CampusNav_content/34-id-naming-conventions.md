# CampusNav AI — Identifier and Naming Conventions

## Purpose
Stable IDs are critical because maps, routes, QR checkpoints, schedules, Dashboard links, Admin, and future CLARA must refer to the same entities.

## Principles
- IDs are stable; display names may change.
- Do not derive database identity from mutable display text.
- Do not create a second ID for the same facility just because another UI needs it.
- Cross-domain references must use the canonical ID.

## Recommended human-readable patterns
These are documentation conventions; preserve existing working IDs if they differ.
- facility: `FAC-3F-VIRTUAL-LAB`
- room: `ROOM-3F-54`
- QR checkpoint: `QR-3F-LIBRARY`
- map node: `NODE-3F-001`
- map edge: `EDGE-3F-001`
- stair transition: `STAIR-A-3F-4F`
- emergency route: `EMR-3F-EXIT-A`

## Code naming
- React components: `PascalCase`
- hooks: `useSomething`
- service functions: `camelCase`
- database columns: follow existing migration convention consistently; do not mix styles within one schema
- enums/statuses: use the existing uppercase canonical values where defined

## Renames
A user-facing rename must not automatically rename the stable ID. If an ID migration is unavoidable, provide compatibility/backfill tests and update QR/map/schedule references together.
