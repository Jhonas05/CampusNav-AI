# CampusNav AI — PWA and Offline Emergency Strategy

## Purpose
Defines the source requirement that essential emergency information should remain available after connectivity loss when previously cached.

## Priority
Offline capability is most important for **emergency reference**, not for pretending all dynamic CampusNav features work offline.

## Cache candidates
When PWA/offline support is implemented, cache versioned copies of:
- emergency floor plans / static emergency map assets
- evacuation guidance
- emergency contact numbers
- minimal app shell required to open Emergency

Optional static/navigation data may be cached only if versioning and freshness are handled safely.

## Do not treat stale dynamic data as current
Avoid presenting stale offline copies as current for:
- class suspensions
- announcements
- personnel presence/check-ins
- facility temporary closures
- live/realtime advisories

If shown offline, label as cached and include last-updated/last-verified metadata when possible.

## Offline UI
Display an `Offline Mode` indicator when the browser is offline and the app is using cached content.

## Emergency wording
Offline CampusNav still supplements official posted evacuation signage and emergency personnel instructions.

## Update strategy
- version cached emergency assets
- refresh cache after verified emergency plan changes
- avoid keeping superseded emergency plans indefinitely
- provide safe fallback if cache is missing/corrupt

## Implementation status
The master source requires PWA-capable emergency access. Unless code verification proves it is complete, track it as a **verification/roadmap item**, not as implemented fact.

## Source basis
- CampusNav Project Source Reference — Offline Emergency Access / PWA-capable requirement
