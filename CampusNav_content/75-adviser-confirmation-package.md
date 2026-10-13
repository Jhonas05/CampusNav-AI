# CampusNav AI — Adviser Confirmation Package

**Package status:** `PREPARED / AWAITING_ADVISER_CONFIRMATION`

**Prepared:** 20 September 2026

**Decision basis:** `DEC-DEFENSE-001 — Proposed final defense scope baseline`

**Software baseline:** Phase 3 `COMPLETE — ACCEPTED_WITH_ADVISORY`

## Purpose and instructions

This package requests academic direction on the remaining CampusNav AI thesis and final-defense decisions. It summarizes the owner-approved proposal so the adviser does not need to review the full canonical documentation pack.

Please select one option in each decision section and add conditions or corrections where needed. Blank or ambiguous sections remain unresolved and do not authorize implementation. Adviser confirmation does not replace institutional or safety-authority approval for official campus data.

## 1. Proposed final defense scope

The owner proposes demonstrating these currently accepted capabilities at their documented evidence levels:

- responsive CampusNav web application for laptop, tablet, and mobile viewports
- GF–5F source-aligned campus spatial foundation and one canonical spatial dataset
- standard A* pathfinding; A* is navigation logic and is **not AI**
- 2D, 3D, same-floor, and multi-floor navigation using the same route result
- QR checkpoint positioning and manual-location fallback
- Facilities directory, facility details, and facility navigation
- centralized Dashboard
- authentication, role-based access control, and Admin CMS
- academic schedule/personnel engine and availability logic
- accepted Supabase Auth, RLS, and Realtime foundation
- strict Emergency Mode using verified/emergency-approved data only
- safe no-route, unavailable-data, and error behavior

### Adviser decision

- [ ] **APPROVE** the proposed defense core.
- [ ] **APPROVE WITH CHANGES.**
- [ ] **REQUIRE ADDITIONAL FEATURE(S).**

Required changes or additional features:

______________________________________________________________________________

______________________________________________________________________________

Reason or academic requirement:

______________________________________________________________________________

## 2. Thesis title treatment

The original thesis framing is tablet-focused. The implemented system is now a responsive web application that operates across laptop, tablet, and mobile viewports. The software should remain responsive; the final academic title requires adviser direction.

### Adviser decision

- [ ] **RETAIN** the current “tablet-based” wording.
- [ ] **REVISE** to responsive web-based wording.
- [ ] **OTHER wording:** ______________________________________________________

Approved title or wording instruction:

______________________________________________________________________________

## 3. Grounded CLARA requirement

Current evidence:

- a conservative local CLARA facility matcher exists
- grounded server-side Groq/LLM integration is **not implemented**
- the current matcher is not grounded production AI, a production-ready LLM integration, or a completed AI assistant
- A* pathfinding must not be presented as the AI contribution

Is grounded CLARA required for the final defense or thesis AI requirements?

- [ ] **YES — GROUNDED CLARA IS REQUIRED.**
- [ ] **NO — GROUNDED CLARA MAY REMAIN DEFERRED.**
- [ ] **CONDITIONAL — required capability specified below.**

Required capability or condition:

______________________________________________________________________________

______________________________________________________________________________

A `YES` or `CONDITIONAL` decision creates a separate future workstream. It does not authorize immediate implementation; the workstream must first satisfy the canonical Definition of Ready.

## 4. PWA installability and offline-navigation proposal

**Proposal status:** `OWNER-AUTHORIZED ENGINEERING COMPLETE — ACCEPTED_WITH_ADVISORY / AWAITING ADVISER DEFENSE CONFIRMATION`

On 14 October 2026, the owner separately authorized this optional cross-cutting engineering workstream under `DEC-PWA-001`. That decision does not select any checkbox below or claim that the adviser requires, accepts, or includes PWA capability in the thesis defense.

Current engineering evidence (this does not answer the adviser decisions below):

- CampusNav is already a responsive mobile-first React/Vite application deployed over HTTPS through Cloudflare Workers Static Assets
- the manifest has a stable application identity and scope, standalone display, approved monochrome CampusNav raster/SVG icons, a maskable icon, and an Apple touch icon
- a root-scoped Workbox `injectManifest` worker provides a revisioned, bounded public-static precache, supported offline SPA/deep-link fallback, controlled cleanup, and explicit user-controlled updates
- the existing canonical spatial graph, floor data, 2D renderer, A* pathfinding, facility identities, and manual positioning are available for the supported offline navigation routes after a successful initial online load
- local production-build Chromium acceptance verified service-worker control, the canonical 95-facility fallback, offline multi-floor routing, optional 3D reuse after online loading, Emergency blocking, and fail-closed Admin behavior
- operational/provider data remains network-only and presents `UNKNOWN` or unavailable when a real no-cache reachability check fails; Supabase/Auth/API responses and tokens are never runtime-cached
- the initial precache contained 44 revisioned entries totaling 898.57 KiB; optional 3D, QR decoder, Supabase, Admin, Emergency, and social-preview assets were excluded
- physical-device installation/camera, iOS/iPadOS, non-Chromium, screen-reader, low-end-device, and production-equivalence evidence remains pending and must not be inferred
- CampusNav may be described at this evidence level as locally browser-verified for offline canonical 2D navigation, but not as providing offline Emergency routing or universal device/browser PWA support

### 4.1 Purpose and academic scope

The owner proposes a separate cross-cutting PWA enhancement so students can install CampusNav, launch it in a standalone mobile experience, and retain a deliberately limited public navigation capability after a successful online load. The proposal builds on the accepted mobile-first interface and the existing one-campus-dataset/one-routing-engine architecture. It is not part of Phase 4 facility search/recommendation work and does not start FS-5 or FS-6.

The adviser must decide whether this enhancement is required for the thesis defense, optional before defense, or deferred until after defense. Preparing this package does not select that classification.

### 4.2 Owner-proposed first-release scope

The following scope was authorized and implemented by the owner as optional engineering. It remains **not adviser-approved for thesis/defense classification**.

**Installability**

- complete, valid application manifest with stable identity and scope
- approved CampusNav application icons, including raster and maskable variants
- Android/Chromium installation flow
- iPhone/iPad Add to Home Screen guidance
- standalone launch behavior that preserves the accepted mobile-first interface, safe areas, bottom navigation, and accessibility behavior

**Offline canonical navigation**

- versioned public static application shell
- supported SPA reload and deep links
- canonical 2D map assets, floor data, nodes, edges, and existing A* routing
- manual current-location selection
- canonical facility identity and navigation targets without claiming current operational state
- the existing 2D renderer remains the required low-resource and accessibility fallback

**Operational data boundary**

- facility status, hours, exceptions, advisories, personnel presence, announcements, and other time-sensitive institutional data remain network-only in the initial release
- when current provider data cannot be obtained, operational status is `UNKNOWN` or unavailable; cached data must not create `OPEN_NOW`, `CLOSED`, personnel-presence, suspension, or current-advisory claims
- `DEMO`, `PENDING_VERIFICATION`, source, and verification boundaries remain visible
- reconnecting requires a real provider refresh; connectivity indication alone does not prove that current institutional data is available

**Optional, later capability**

- QR decoder and camera bundle cached only after explicit use or approved opt-in; manual positioning remains available when camera access fails
- 3D bundle cached only after explicit use or approved opt-in; 3D is never required for first install or offline navigation

**Excluded from this proposal**

- offline Admin access or mutations
- background mutation queues or replay
- cached authenticated, user-specific, role-sensitive, Supabase API, Auth, Realtime, RPC, or Storage responses
- cached access/refresh tokens or privileged keys
- crowd inference, fabricated live information, or unverified wheelchair/accessibility routing
- offline Emergency routes, emergency-route claims, or substitution of ordinary A* routes for emergency-approved routes

### 4.3 Proposed technical architecture

The audit recommends `vite-plugin-pwa` with Workbox `injectManifest`, subject to dependency approval and lockfile review:

- Vite injects the revisioned build asset manifest into a root-scoped custom service worker
- the custom worker applies an explicit public-static allowlist and API/auth denylist
- cache names carry an application release version; superseded public caches are cleaned during controlled activation
- updates wait and are presented to the user; the application does not silently force a new worker into an active navigation session
- the initial precache excludes Admin chunks, the large lazy 3D bundle, the QR decoder, social-preview media, and dynamic/provider responses
- non-`GET`, authenticated, cross-origin API, Supabase, and mutation requests are always excluded from Cache Storage

This approach is recommended because CampusNav uses many Vite-hashed lazy chunks and needs a safety-specific caching policy. A handwritten worker without PWA tooling remains possible, but it would require custom build-manifest integration, manual revision handling, cache cleanup, navigation fallback, and additional lifecycle tests. A hand-maintained list of hashed files is not proposed.

The owner-authorized implementation uses this architecture with reviewed lockfile changes. Adviser acceptance of it for thesis/defense claims remains unanswered.

### 4.4 Security, privacy, and update boundaries

- caches contain public static resources only
- service-worker code never reads, copies, logs, or stores authentication tokens
- no offline write queue or background synchronization is authorized
- logout and account switching must not leave user-specific cached data; the proposed initial architecture creates no user-specific caches
- session expiry and role checks remain controlled by the existing Auth/RBAC/RLS boundaries
- cache loss, eviction, corruption, or a partial update must fail safely to online-only/unavailable behavior
- update activation is user-controlled and must preserve route/current-location state where possible

### 4.5 Emergency exclusion

Offline Emergency navigation remains `BLOCKED` and outside the proposed PWA implementation until all of the following exist:

- verified emergency-route coverage for the intended floors
- approved cross-floor emergency transitions
- verified emergency contacts and verification dates
- approved emergency-data versioning and cache invalidation rules
- an authorized safety release/invalidation owner

No ordinary route may substitute for an emergency-approved route. Any future offline Emergency reference or route work requires separate safety/institutional approval and its own Definition-of-Ready review.

### 4.6 Proposed implementation work packages

These are proposed work packages, not automatically new canonical phase numbers:

1. PWA authorization and scope confirmation
2. manifest, approved icons, and installability
3. root-scoped service worker and safe public-static caching
4. offline canonical 2D navigation and supported deep links
5. operational-data degraded states and reconnect refresh
6. mobile install, offline, reconnect, and update experience
7. optional QR and 3D cache-on-use capability
8. cross-browser, physical-device, Cloudflare, accessibility, privacy, and upgrade acceptance

Offline Emergency remains excluded unless separately approved.

### 4.7 Required acceptance evidence

Implementation, if later authorized, must verify:

- manifest identity, approved icons, installation, and standalone launch
- worker registration, first-control behavior, offline reload, and supported offline deep links
- cache allowlist/denylist, no sensitive response storage, cache invalidation, corrupt-cache fallback, and version upgrades
- deterministic equivalence of the existing canonical A* route result online and offline
- truthful `UNKNOWN`/unavailable operational states and refresh after provider recovery
- manual location fallback, QR permission denial, camera unavailable, and cache-on-use behavior
- Android Chrome, current iPhone/iPad Add to Home Screen, desktop Chrome/Edge, and any additional adviser-required targets
- keyboard, focus, touch target, safe-area, reduced-motion, low-resource 2D fallback, and Cloudflare production behavior

Physical-camera, installed-app, iOS/iPadOS, and low-end-device claims require physical-device evidence; emulation alone is insufficient.

### 4.8 Adviser decisions

**A. Defense classification**

- [ ] **REQUIRED FOR FINAL DEFENSE.**
- [ ] **OPTIONAL BEFORE DEFENSE.**
- [ ] **DEFER UNTIL AFTER DEFENSE.**
- [ ] **CONDITIONAL:** ________________________________________________________

**B. Capability scope**

- [ ] **INSTALLABILITY ONLY** — manifest, icons, and standalone launch; no offline-navigation claim.
- [ ] **INSTALLABILITY + OFFLINE CANONICAL 2D NAVIGATION** — approve the owner-proposed first-release boundary above.
- [ ] **OTHER SCOPE:** ________________________________________________________

**C. Application icon**

- [ ] **A — EXISTING OFFICIAL SCC SEAL**, adapted only into approved app-icon sizes without changing its visual content.
- [ ] **B — DEDICATED CAMPUSNAV APP ICON**, separately designed and approved while retaining institutional attribution in the application.
- [ ] **OTHER:** ______________________________________________________________

The technical recommendation is **B**, because a distinct, deliberately maskable CampusNav mark is more legible at small launcher sizes and distinguishes the application from the institution itself. No icon is created or replaced by this package. The social-sharing image must not be automatically cropped into an app icon.

**D. Approved initial cache scope**

- [ ] **PUBLIC APP SHELL + CANONICAL 2D NAVIGATION ONLY.**
- [ ] **INSTALLABILITY ONLY / NO OFFLINE CACHE.**
- [ ] **APPROVE WITH CHANGES:** ______________________________________________

**E. First-release browser/device acceptance targets**

- [ ] **APPROVE** Android Chrome, current iPhone/iPad Add to Home Screen, and desktop Chrome/Edge, with physical-device evidence where required.
- [ ] **APPROVE WITH CHANGES:** ______________________________________________
- [ ] **DEFER PHYSICAL-DEVICE CERTIFICATION UNTIL AFTER DEFENSE.**

**F. Development dependency**

- [ ] **APPROVE REVIEW AND USE OF `vite-plugin-pwa` + WORKBOX `injectManifest`.**
- [ ] **REQUIRE A HANDWRITTEN SERVICE WORKER WITH NO NEW PACKAGE.**
- [ ] **REQUIRE ANOTHER OPTION:** _____________________________________________

**G. Separate workstream permission**

- [ ] **AUTHORIZE A SEPARATE CROSS-CUTTING PWA WORKSTREAM** after owner records the completed adviser decision and confirms the first implementation slice.
- [ ] **DO NOT AUTHORIZE IMPLEMENTATION YET.**
- [ ] **AUTHORIZE WITH CONDITIONS:** _________________________________________

**H. Features explicitly deferred until after defense**

______________________________________________________________________________

______________________________________________________________________________

Blank, conflicting, or ambiguous choices remain `PENDING` and do not authorize implementation. A `REQUIRED`, `OPTIONAL BEFORE DEFENSE`, or conditional decision still requires the owner to record the returned adviser evidence and authorize an exact implementation slice.

## 5. Verified, demo, and unavailable data policy

The owner proposes this final-defense policy:

### A. Verified institutional data

Data may be described as verified or official only when canonical provenance and appropriate institutional authority evidence support that claim.

### B. Demo/sample data

Synthetic or demo values may demonstrate implemented workflows only when clearly and visibly labeled `DEMO`, `SAMPLE`, or equivalent. They must not be described as official, live, current institutional truth, or verified personnel presence.

### C. Unavailable/pending data

Unknown or unapproved institutional information remains unavailable or pending verification. Values must not be invented merely to make a demonstration appear complete.

Emergency routes, official emergency contacts/equipment, personnel presence, accessibility infrastructure, suspensions, and other safety-sensitive institutional facts must never be fabricated.

### Adviser decision

- [ ] **APPROVE** the proposed verified/demo/unavailable policy.
- [ ] **APPROVE WITH CONDITIONS.**
- [ ] **DO NOT ALLOW DEMO DATA** for the defense.

Conditions or restrictions:

______________________________________________________________________________

______________________________________________________________________________

## 6. Research and evaluation methodology

Software QA evidence supports technical acceptance but does not replace thesis research methodology. Please provide or direct the following academic decisions; no field is pre-approved by this package.

**Research/evaluation design:**

______________________________________________________________________________

**Target respondent population:**

______________________________________________________________________________

**Sampling method:**

______________________________________________________________________________

**Sample size:**

______________________________________________________________________________

**Evaluation instrument or framework:**

______________________________________________________________________________

**Required task scenarios:**

______________________________________________________________________________

**Effectiveness metric:**

______________________________________________________________________________

**Efficiency metric:**

______________________________________________________________________________

**Usability/satisfaction metric:**

______________________________________________________________________________

**Acceptance thresholds:**

______________________________________________________________________________

**Statistical treatment:**

______________________________________________________________________________

**Final success criteria:**

______________________________________________________________________________

**Evaluation procedure and other instructions:**

______________________________________________________________________________

______________________________________________________________________________

## 7. Optional and deferred features

The owner proposal treats the following as **deferred unless the adviser requires them**:

- AR-Assisted Camera Navigation
- reports and analytics
- advanced map editor and map-version rollback tooling
- GPS, BLE, Wi-Fi fingerprinting, and UWB positioning
- push notifications and SMS delivery
- hardware-heavy presence or positioning extensions
- native ARCore/ARKit, SLAM, or visual-positioning systems
- photorealistic 3D
- unrelated dependency upgrades

Additional feature required:

______________________________________________________________________________

Reason or thesis requirement:

______________________________________________________________________________

Any newly required feature remains unimplemented until separately authorized and found ready.

## 8. Emergency and schedule/personnel claim boundaries

The defense may demonstrate strict emergency-approved routing, rejection of non-approved edges, safe no-route behavior, and currently verified/source-aligned emergency data. It must not claim complete institutional emergency coverage, final safety-authority approval, or complete official evacuation coverage without institutional evidence.

The accepted schedule/personnel engine may be demonstrated. Official data claims remain institution-dependent. Canonical wording preserves:

`SCHEDULED != CHECKED_IN`

`UNAVAILABLE > CHECKED_IN > IN_CLASS > CONSULTATION > SCHEDULED > NO_ACTIVE_SCHEDULE`

Non-institutional schedule/personnel records must be visibly demo-labeled.

## 9. Institutional approval note

Adviser confirmation does not replace authorized institutional sources or sign-off for:

- official campus map and facility verification
- facility operating hours, services, and service-to-facility mappings
- official class schedules
- approved public personnel fields and availability rules
- personnel presence and check-in authority
- emergency routes, equipment, contacts, verification dates, and safety approval
- privacy and retention policy
- backup and recovery policy

If the final defense makes official claims in these areas, the applicable institutional approval remains mandatory.

## Return and status handling

Return the completed package to the project owner for canonical recording. Until completed adviser evidence is received, this package remains `PREPARED / AWAITING_ADVISER_CONFIRMATION`, all adviser decisions remain unresolved, and no deferred feature implementation is authorized.

---

## Adviser Decision Summary — Final Page

This page records academic direction only. Unselected or unclear items remain unresolved.

### Final defense core

- [ ] **APPROVED**
- [ ] **APPROVED WITH CHANGES**
- [ ] **NOT APPROVED**

### Title

- [ ] **RETAIN**
- [ ] **REVISE**
- [ ] **OTHER**

Approved/required wording: ___________________________________________________

### Grounded CLARA

- [ ] **REQUIRED**
- [ ] **DEFER**
- [ ] **CONDITIONAL**

### PWA/offline

- [ ] **REQUIRED**
- [ ] **OPTIONAL BEFORE DEFENSE**
- [ ] **DEFER UNTIL AFTER DEFENSE**
- [ ] **CONDITIONAL**

Approved capability:

- [ ] **INSTALLABILITY ONLY**
- [ ] **INSTALLABILITY + OFFLINE CANONICAL 2D NAVIGATION**
- [ ] **OTHER:** ______________________________________________________________

App icon:

- [ ] **OFFICIAL SCC SEAL**
- [ ] **DEDICATED CAMPUSNAV APP ICON**
- [ ] **OTHER**

Cache scope:

- [ ] **PUBLIC APP SHELL + CANONICAL 2D NAVIGATION ONLY**
- [ ] **NO OFFLINE CACHE**
- [ ] **OTHER**

Architecture/dependency:

- [ ] **APPROVE `vite-plugin-pwa` + WORKBOX `injectManifest` REVIEW**
- [ ] **REQUIRE HANDWRITTEN WORKER**
- [ ] **OTHER**

Separate cross-cutting PWA implementation after recorded confirmation:

- [ ] **AUTHORIZED**
- [ ] **NOT AUTHORIZED**
- [ ] **AUTHORIZED WITH CONDITIONS**

Conditions, browser/device targets, or post-defense deferrals:

______________________________________________________________________________

______________________________________________________________________________

### Demo-data policy

- [ ] **APPROVED**
- [ ] **APPROVED WITH CONDITIONS**
- [ ] **NOT APPROVED**

### Research methodology

- [ ] **PROVIDED**
- [ ] **REQUIRES FOLLOW-UP**

### Additional required features

______________________________________________________________________________

### Additional instructions or conditions

______________________________________________________________________________

______________________________________________________________________________

**Adviser name:** _____________________________________________________________

**Signature, if required:** __________________________________________________

**Date:** ____________________________________________________________________
