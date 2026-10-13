# CampusNav AI — PWA and Offline Emergency Strategy

## Purpose
Defines the source requirement that essential emergency information should remain available after connectivity loss when previously cached.

## Current authorized boundary
The implemented first release provides installability and offline canonical 2D navigation. Offline Emergency navigation is explicitly excluded by `DEC-PWA-001`; an offline session must direct users to posted campus instructions and authorized personnel instead of presenting an ordinary A* route as safety guidance.

## Installed-app branding
`DEC-PWA-002` records the owner-approved installed-app artwork. The 192×192 and 512×512 standard icons and the 180×180 Apple touch icon use only the approved rounded-square campus illustration. The separate 512×512 maskable asset places that illustration inside a conservative safe-zone inset on an opaque white background. The manifest and HTML use the PNG assets directly; no approximate traced SVG is used.

These icon files are versioned public-static assets and receive normal build-revision cache invalidation. An existing installed launcher may retain an older icon until the browser/operating system accepts the application update or the user reinstalls it; CampusNav does not force service-worker activation to accelerate an icon change. The social-preview image and SCC seal remain separate assets.

## Future Emergency cache candidates — not authorized in the current release
Only after separate safety/institutional approval, a future Emergency-offline workstream may consider versioned copies of:
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
Display an `Offline Mode` indicator when the connectivity probe cannot reach the application origin. Browser `navigator.onLine` alone is not proof that current provider data is available.

## Emergency wording
Offline CampusNav still supplements official posted evacuation signage and emergency personnel instructions.

## Future Emergency update strategy
- version cached emergency assets
- refresh cache after verified emergency plan changes
- avoid keeping superseded emergency plans indefinitely
- provide safe fallback if cache is missing/corrupt

## Implementation status
`COMPLETE — ACCEPTED_WITH_ADVISORY` for the owner-authorized installability and offline canonical 2D boundary. A Workbox `injectManifest` worker uses a revisioned public-static precache and narrow same-origin cache-on-use rules for optional QR/3D scripts. Operational/provider data, authenticated responses, Admin, and Emergency routes are not cached. Offline Emergency remains `BLOCKED` pending the separate safety prerequisites in `DEC-PWA-001`; physical-device, iOS/iPadOS, non-Chromium, and screen-reader evidence remains pending.

## Source basis
- CampusNav Project Source Reference — Offline Emergency Access / PWA-capable requirement
