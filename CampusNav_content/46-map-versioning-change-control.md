# CampusNav AI — Map Versioning and Change Control

## Goal
Prevent a room/node edit from silently breaking routes, QR codes, schedules, or emergency safety.

## Versioned map changes should record
- map/version identifier
- editor/admin
- timestamp
- affected floor/entities
- change reason
- verification state

## High-risk changes
- moving/deleting nodes used by routes
- changing stair transitions
- moving a facility entrance
- changing QR checkpoint linkage
- blocking/unblocking major corridors
- any emergency exit/edge/equipment change

## Required checks before release
- same-floor routes still work
- multi-floor routes still work
- no wall crossing/regression
- QR checkpoint resolves to the intended node
- construction/restricted zones are respected
- emergency-only tests still pass
- 2D/3D coordinate transformation remains consistent

## Rollback
If map versions/rollback are implemented, rollback must restore all dependent geometry/graph relationships coherently rather than only the visual floor shape.
