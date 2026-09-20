# CampusNav AI — Thesis Core vs Optional/Future Matrix

## Owner-approved proposed final defense baseline — 19 September 2026

`DEC-DEFENSE-001` records an owner-approved proposal, not adviser or institutional approval.

| Major system area | Proposed final-defense classification | Boundary |
|---|---|---|
| Responsive web experience; GF–5F source-aligned spatial foundation; one spatial dataset; A*; 2D/3D/multi-floor navigation | `CORE_FOR_DEFENSE` | Use currently accepted evidence; A* is pathfinding, not AI |
| QR checkpoint positioning and manual fallback | `CORE_FOR_DEFENSE` | Payload/camera/manual behavior is accepted; installed signage is not certified |
| Facilities directory/navigation and Dashboard | `CORE_FOR_DEFENSE` | Official completeness, hours, services, and mappings remain institution-dependent |
| Auth/RBAC, Admin CMS, and accepted Supabase/Auth/RLS/Realtime foundation | `CORE_FOR_DEFENSE` | Retain accepted advisories and least-privilege claims boundaries |
| Academic schedule/personnel engine and availability logic | `CORE_FOR_DEFENSE` | Official data remains institution-dependent; `SCHEDULED != CHECKED_IN` |
| Strict Emergency Mode and safe no-route behavior | `CORE_FOR_DEFENSE` | Only verified/source-aligned data; no complete coverage or safety sign-off claim |
| Grounded server-side CLARA/Groq | `CONDITIONAL / DEFERRED PENDING ADVISER DIRECTION` | Current local matcher is not grounded production AI or a completed AI assistant |
| PWA/offline emergency caching | `CONDITIONAL / DEFERRED PENDING ADVISER DIRECTION` | Manifest presence is not offline support |
| AR Guidance | `OPTIONAL / DEFERRED / NOT_IMPLEMENTED / NOT_READY` | Planning contract only; not required by the owner proposal |
| Reports/analytics; advanced map editor/version rollback | `OPTIONAL / DEFERRED` | Reopen only if adviser-confirmed scope requires them |
| GPS/BLE/Wi-Fi/UWB; hardware presence; native AR/SLAM/VPS; push/SMS; photorealistic 3D | `OPTIONAL / DEFERRED` | Not required by the owner proposal |

The formal defense scope remains `ADVISER_APPROVAL_REQUIRED`. This matrix does not change implementation status or authorize feature work.

## Core thesis scope
- responsive 2D + 3D campus navigation
- GF–5F verified/source-aligned map data
- same-floor and multi-floor A* routing
- QR checkpoint indoor positioning
- manual current-location fallback
- facility/service information
- Dashboard/status information
- class schedule and personnel/public availability lookup with correct wording
- admin-managed authoritative data under RBAC
- verified emergency information/routing restrictions
- CLARA only when backed by stable verified internal services

## Optional/enhancement
- outdoor GPS location continuity
- BLE indoor approximate positioning
- AR-Assisted Camera Navigation / AR Guidance Mode as a future presentation layer over the existing A* route; planning only, not implemented or ready
- web push
- SMS gateway
- advanced visual floor-plan editor/rollback if not completed in the core build

## Future/non-core or hardware-heavy
- Wi-Fi fingerprinting
- UWB-grade precise indoor positioning
- biometric/presence systems
- Google-level photorealistic 3D

## Claim rule
A feature remains optional/future until the implementation status registry and tests support an implemented claim. Architecture intent is not proof of completion.
