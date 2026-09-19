# CampusNav AI — Thesis Core vs Optional/Future Matrix

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
