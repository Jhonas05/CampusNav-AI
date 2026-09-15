# CampusNav AI — Spatial Map Source of Truth

## Purpose
Protects CampusNav from coordinate drift, invented rooms, and a separate 3D map that no longer matches navigation.

## Authoritative spatial basis
The supplied official/approved **Emergency Evacuation floor-plan source** is the initial authoritative reference for GF–5F spatial relationships.

Never randomly invent or relocate:
- rooms
- offices
- hallways
- doors
- stairs
- emergency exits
- emergency equipment

If exact dimensions are not available, geometry may use proportional/estimated visual dimensions while preserving relative layout and marking verification state.

## Floors
- GF — Ground Floor
- 2F — Second Floor
- 3F — Third Floor
- 4F — Fourth Floor
- 5F — Fifth Floor

## Shared coordinate rule
**2D and 3D must not maintain independent room positions.**

Use one spatial dataset and a central 2D→3D transform:

```text
source map x/y + floor elevation
        ↓
central transform
        ↓
2D renderer + 3D world coordinates
```

3D may transform coordinates for world-space rendering, but it must not create a second authoritative coordinate set.

## Spatial object types
### Floor
- id
- name
- level
- width/depth or calibrated bounds
- elevation

### Facility / geometry
- id
- floorId
- room number/name
- x/y (source coordinate)
- width/depth
- rotation
- navigable
- publicAccess
- verification state

### Navigation node
- id
- floorId
- x/y
- type

Typical types:
- HALLWAY
- ROOM_ENTRANCE
- STAIRS
- EXIT
- ENTRANCE
- QR_CHECKPOINT
- INTERSECTION

### Edge
- id
- startNode
- endNode
- distance
- route attributes/restrictions

## Facility ID stability
Facility IDs used by the map must be stable because they are referenced by:
- facility directory/detail
- schedules
- personnel assignments
- events
- Dashboard
- Admin
- future CLARA

Changing an ID requires a migration, not a casual rename.

## Verification states
Spatial records should support:
- VERIFIED
- ESTIMATED
- PENDING_VERIFICATION

Examples:
- room position: VERIFIED
- exact wall dimension: ESTIMATED
- accessibility attribute: PENDING_VERIFICATION

## Construction / restricted areas
Areas marked:
- UNDER_CONSTRUCTION
- BLOCKED
- CLOSED
- RESTRICTED

must not be used for normal navigation unless an authorized admin changes the official state.

## Floor-plan calibration/admin editing
Source architecture expects an admin workflow capable of improving accuracy without editing source code:
1. upload/select official floor-plan reference
2. set scale/origin
3. place/edit rooms/nodes
4. trace walls/hallways
5. connect edges/stairs
6. save a new map version

If this editor is not implemented yet, do not pretend coordinates are admin-editable in production. Track it in roadmap/limitations.

## Version control
Map changes should preserve:
- version
- changed by
- timestamp
- change summary
- rollback/history if implemented

## Source basis
- CampusNav Project Source Reference — authoritative map source, spatial data model, admin calibration, map versioning
- CampusNav AI Final Expanded Architecture — one spatial truth, no duplicate coordinates
