# CampusNav AI — Architecture

## CLARA conversation and local voice

```text
Typed question ───────────────────────────────┐
On-device recognition → edit → explicit Send ─┴─→ ClaraContext → askClara → verified tools
                                                          ↓
                                      Visible answer and existing facility actions
                                                          ↓
                            Public allowlist + current voice request or Read Aloud
                                                          ↓
                                            Local speech synthesis
```

The result card opens the ordinary Map destination flow. Both preview adapters operate in the browser under DEC-MEDIA-001. See [voice](78-clara-voice-accessibility.md) and [camera](74-ar-assisted-navigation-contract.md).

## Architectural principle
CampusNav separates **source-of-truth data**, **routing/schedule logic**, **presentation**, **positioning providers**, and **CLARA**.

```text
Verified / approved campus data
        ↓
Routing + schedule/availability logic
        ↓
2D UI / 3D UI / Dashboard / Admin
        ↓
CLARA resolves approved questions through the existing tools
```

## Frontend
- React + Vite
- responsive desktop/tablet/mobile UI
- lazy-loaded heavy modules
- 2D and 3D maps share the same spatial/navigation data
- 3D is a visualization layer, not a second navigation engine

## Navigation architecture

```text
Campus spatial data
      │
      ├── facilities / floors / geometry
      ├── map nodes / edges
      ├── stairs / restrictions
      └── QR checkpoints
      │
      ▼
Existing A* pathfinding
      │
      ├── 2D renderer
      ├── 3D renderer
      └── Confirmed ordinary route + selected instruction
                └── Camera Directions Lite + canonical floor mini-map (local preview)
```

## Positioning architecture
Provider interface resolves location to a map node/coordinate plus metadata.

Core:
- QR checkpoint
- manual location selection

Optional/future:
- GPS/browser geolocation outdoors
- BLE indoor approximate positioning
- Wi-Fi fingerprinting
- UWB

A simulated moving marker may be used for demo progress, but it must be labeled as simulated and never presented as live sensor positioning.

## Backend
- Supabase PostgreSQL
- Supabase Auth
- RLS for actual authorization
- Supabase Realtime where appropriate
- local/version-controlled spatial source remains authoritative unless a deliberate migration is approved
- local/provider fallback preserved for resilience and testing where already implemented

## Dashboard provider pattern

```text
Dashboard components
      ↓
dashboardService
      ↓
active provider
      ├── LocalProvider
      └── SupabaseProvider
```

## Admin architecture
- protected React routes for UX
- PostgreSQL RLS remains authoritative
- service modules isolate Supabase CRUD from page components
- data ownership is scoped by office/role
- audit activity records important administrative changes

## Deployment

```text
GitHub main
   ↓
Cloudflare build
   ↓
npm run build
   ↓
dist/
   ↓
Wrangler static assets
   ↓
workers.dev production URL
```

## Planned CLARA architecture

```text
User query
   ↓
CLARA intent/entity/tool selection
   ↓
CampusNav internal services
   ├── facilities/services
   ├── routes
   ├── schedules
   ├── personnel availability
   ├── Dashboard notifications
   └── verified emergency info
   ↓
Verified CampusNav data
   ↓
Server-side response generation
```

CLARA must never invent campus facts that are unavailable from the tool/service layer.

See the domain contracts for exact behavior.
