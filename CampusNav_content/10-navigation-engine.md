# CampusNav AI — Navigation Engine Contract

## Purpose
Defines the single routing contract used by 2D, 3D, QR navigation, personnel/facility navigation, and future CLARA.

## Core rule
**There is one routing engine.** Do not create separate algorithms for 2D, 3D, QR, CLARA, or emergency UI.

## Algorithm
- use the existing A* implementation for normal navigation
- Dijkstra is architecturally acceptable, but do not replace proven A* without a reason
- pathfinding itself is **not AI**

## Graph model
Nodes may represent:
- hallway intersections
- room/facility entrances
- stairs
- building entrances
- exits
- QR checkpoints

Edges represent verified walkable connections.

Typical edge metadata:
- distance
- floor
- stairs / stair transition
- accessible (only when verified)
- covered path
- blocked
- restricted
- under construction
- emergency allowed / emergency-only metadata

## Normal route requirements
- route follows graph edges
- route never crosses walls directly
- multi-floor route changes floors only through source-aligned verified stair transitions
- blocked, restricted, closed, non-navigable, and under-construction areas are excluded
- route output should expose node sequence, distance, floor changes, and turn-by-turn-ready geometry

## Same-floor flow
```text
Current node
  → candidate graph paths
  → A*
  → valid node sequence
  → 2D/3D rendering
```

## Multi-floor flow
```text
Start floor graph
  → verified stair node
  → paired stair transition
  → destination floor graph
  → destination entrance node
```

## Route preferences
Only expose a preference when its supporting data is verified. Source architecture allows concepts such as:
- shortest route
- fewer stairs
- accessible route
- covered route
- less crowded route

Do **not** show elevator-preferred routing unless elevator infrastructure is officially confirmed in the campus data.

## Turn-by-turn directions
Directions must be derived from graph geometry and floor transitions, not handwritten fake steps.

Examples of acceptable generated step types:
- Continue straight.
- Turn left / right.
- Enter the stairway.
- Go up/down one floor.
- Continue along the hallway.
- Destination is on the left/right/ahead.

## Current location
Supported core sources:
- QR checkpoint → exact to installed checkpoint
- manual selection → exact to selected facility/checkpoint

Optional providers may later resolve into the same navigation state.

## Recalculation
If a route edge becomes blocked or a legitimate live-position provider indicates the user is off route, recalculate with the same graph. Never mutate geometry to force a route.

## 2D/3D state preservation
Switching 2D ↔ 3D must preserve:
- current location
- destination
- active route
- selected floor
- route progress when applicable

## Arrival
When the final destination node/entrance is reached, show an arrival state and allow:
- View Facility
- Ask CLARA (when available)
- End Navigation

## Tests
At minimum:
- same-floor route
- multi-floor route
- blocked edge avoidance
- construction avoidance
- no wall crossing
- source-aligned stair use
- 2D/3D same node sequence
- invalid/unreachable destination

## Source basis
- CampusNav Project Source Reference — navigation graph, multi-floor routing, turn-by-turn, blocked routes
- CampusNav AI Final Expanded Architecture — one routing engine, 2D/3D shared route, QR/manual positioning
