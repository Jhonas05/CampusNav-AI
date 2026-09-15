# CampusNav AI — Emergency Safety Contract

## Purpose
Emergency behavior is safety-critical and has stricter rules than normal navigation.

## Non-negotiable rule
**Emergency routes must never be invented by AI or improvised from normal navigation edges.**

## Allowed emergency data sources
Only use:
- approved evacuation maps
- verified emergency exits
- verified stairs/equipment
- administrator-approved emergency route edges
- official emergency contacts and guidance

## Emergency routing
Emergency mode must use a dedicated approved-emergency graph or approved-edge filter.

```text
current verified location
      ↓
emergency-approved graph only
      ↓
verified exit / approved path
```

### Forbidden behavior
- no fallback to normal A* graph when emergency route is unavailable
- no shortest-path guess through unapproved hallways
- no invented exit
- no AI-generated evacuation instruction

## No-route safety message
If no verified digital evacuation route exists, show a message equivalent to:

> No verified digital evacuation route is available from this location. Follow the posted evacuation signage and instructions from authorized emergency personnel.

Also make clear that CampusNav supplements, not replaces, posted plans and authorized instructions.

## Emergency page / overlay
May display verified:
- floor plans
- exits
- stairs
- fire alarm locations
- fire extinguisher locations
- approved evacuation paths
- emergency contacts
- general evacuation guidance from the official plan

## Emergency UI
Even if the map uses category colors, emergency meaning must never depend on color alone. Use icon, pattern, line style, label, and hierarchy.

## Offline requirement
Essential emergency information should remain available offline **if previously loaded/cached** when PWA/offline support is implemented:
- emergency floor plans
- evacuation guidance
- emergency contacts

See `24-pwa-offline-strategy.md`.

## Data ownership
Emergency records may only be changed by the authorized safety/security/facilities authority or SUPER_ADMIN acting under approved policy.

Admin UI should show verification metadata such as:
- last verified date
- verification status
- source/reference

## Emergency contact rule
Do not hardcode stale numbers forever. Seed only from approved source, make them admin-editable, and display verification date when available.

## Testing
- approved route succeeds
- unapproved edge is rejected
- normal graph is never used as fallback
- missing route shows safety message
- blocked emergency edge behaves safely
- 2D/3D emergency overlays show the same approved path

## Source basis
- CampusNav Project Source Reference — Emergency Module, Emergency Navigation Safety Rule, Emergency 3D Overlay, offline emergency access
- CampusNav AI Final Expanded Architecture — strict emergency-only routing and no normal fallback
