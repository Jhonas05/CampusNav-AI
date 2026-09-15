# CampusNav AI — Thesis Traceability Matrix

This document connects research intent to implemented software and evidence. It should be updated before the final defense.

| Research/Thesis Intent | System Capability | Main Data/Logic | Evidence to Show |
|---|---|---|---|
| Help users locate classrooms, offices, departments, and facilities | universal search + 2D/3D map + facility details | facility/spatial data | search result → facility focus |
| Provide indoor/outdoor campus map behavior | GF–5F 2D/3D navigation | shared spatial model | floor isolation + route rendering |
| Recommend suitable routes, not merely draw a line | verified graph-based route engine | A* over nodes/edges/restrictions | same-floor + multi-floor route |
| Support practical indoor positioning | QR checkpoint + manual fallback | checkpoint→node resolution | QR-3F-LIBRARY demo |
| Consider accessibility/convenience where verified | route attributes/preferences | verified stairs/accessibility/blocked data | route preference behavior; pending state when unverified |
| Provide facility/service information | facility directory/service mapping | facility/services/hours/advisories | Registrar/service lookup |
| Provide schedule/personnel information | class and availability engine | approved schedules/exceptions/check-ins | Room 54 / faculty lookup |
| Provide centralized campus information | Dashboard | announcements/events/advisories/targeting | Dashboard scenario |
| Support safety information | strict emergency module | approved emergency graph/data | verified route or safe no-route state |
| Provide intelligent concierge assistance | CLARA after stable tools | intent/tool call → verified internal services | controlled service/navigation question |

## Evaluation objective gap
Proposal-level materials require evaluating efficiency/effectiveness, but the supplied sources do **not** define the final research instrument, sampling method, acceptance threshold, or statistical treatment. Do not invent those as approved methodology. Track them in `70-thesis-evaluation-gap-register.md` until the adviser/research plan confirms them.
