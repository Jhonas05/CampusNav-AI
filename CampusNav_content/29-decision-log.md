# CampusNav AI — Decision Log

This file records deliberate project decisions so future coding agents do not revive old assumptions or create conflicting implementations.

## DEC-ARCH-001 — One dataset + one routing engine
**Status:** APPROVED / NON-NEGOTIABLE

2D, 3D, QR, Dashboard-linked navigation, personnel navigation, and future CLARA reuse the same campus records and routing result.

## DEC-NAV-001 — Pathfinding is not AI
**Status:** APPROVED

Normal route computation uses standard graph-based A* (or architecturally equivalent Dijkstra). CLARA is the intelligent component.

## DEC-3D-001 — 3D is a visualization layer
**Status:** APPROVED

3D must consume the same spatial coordinates and route node sequence as 2D. No separate 3D routing engine or independent room-coordinate truth.

## DEC-POS-001 — QR/manual are the reliable thesis-core indoor positioning methods
**Status:** APPROVED

Outdoor GPS is optional. BLE is an optional hardware upgrade. Wi-Fi fingerprinting/UWB are future/non-core.

## DEC-EMR-001 — Emergency graph is strict
**Status:** APPROVED / SAFETY CRITICAL

Emergency mode uses only verified/admin-approved emergency edges. No normal-route fallback.

## DEC-PRES-001 — Schedule does not prove physical presence
**Status:** APPROVED / PRIVACY CRITICAL

Use `SCHEDULED`, `IN_CLASS`, or `CONSULTATION` for timetable-based information. Only authorized check-in may show `CHECKED_IN`.

## DEC-PRIV-001 — No public live employee GPS
**Status:** APPROVED

CampusNav may expose approved schedule/availability, not live staff tracking.

## DEC-DASH-001 — Dashboard centralizes notification-style information
**Status:** APPROVED

Feature pages may show local task status, but the main feed/priority information belongs on Dashboard.

## DEC-AI-001 — CLARA comes after stable internal services
**Status:** APPROVED

CLARA uses authorized tools/internal services and verified campus data. AI provider calls remain server-side.

## DEC-DATA-001 — Preserve proven local spatial data during backend expansion
**Status:** CURRENT IMPLEMENTATION DECISION

Supabase currently owns identity/content/schedule/personnel domains while proven spatial/navigation data remains local/version-controlled unless an explicit migration is approved.

## DEC-UI-001 — Controlled map colors are allowed in the current working UI
**Status:** SUPERSEDED BY DEC-UI-002

The 14 Sep master source originally specified strict grayscale. The current working content folder deliberately allows controlled category colors **inside the map** for readability while keeping the surrounding app calm/minimal.

Rules:
- do not make the entire app arbitrarily colorful
- never rely on color alone
- emergency/restricted states still require icon/pattern/text
- if owner/adviser chooses strict grayscale later, update this decision and both UI documents together

## DEC-UI-002 — CampusNav Ink is the approved application-wide visual baseline
**Status:** OWNER APPROVED — 15 Sep 2026

CampusNav adopts the CampusNav Ink / architectural-blueprint visual direction as the canonical presentation baseline for the existing application.

Rules:
- neutral off-white, charcoal, and grayscale surfaces remain dominant
- CampusNav green (`#15703c`, hover `#0f5a2f`) identifies primary actions and selected states
- emergency red (`#b3261e`) is reserved for urgent, emergency, and destructive meaning
- controlled semantic map/status colors require labels, icons, patterns, shapes, or other non-color cues
- use Archivo for readable interface text and Barlow Condensed for compact architectural headings, delivered through maintainable open-source packages or safe fallbacks
- favor sharp geometry, thin technical borders, restrained shadows, compact uppercase labels, and selective blueprint registration marks
- preserve mobile behavior, accessibility semantics, routing, domain logic, lazy loading, and provider integrations

This decision supersedes DEC-UI-001 only where the earlier decision limited color and architectural visual language to the map canvas or implied a strict grayscale / Apple-only application shell. DEC-UI-001 remains historical evidence for the rule that color is never the only carrier of meaning.

`CampusNav-Ink-all-pages.html` is a visual and interaction-composition reference only. It is not production source, runtime logic, institutional truth, routing data, backend policy, or authorization evidence. Its inline styles, bundled scripts, embedded fonts, and static controls are not canonical implementation assets.

## DEC-TITLE-001 — Formal proposal title vs current responsive implementation
**Status:** REQUIRES THESIS/ADVISER ALIGNMENT, NOT A CODE BLOCKER

Proposal materials describe CampusNav AI as tablet-based. The approved technical architecture explicitly says the system should be web-based/responsive and not tablet-only. Keep the software responsive; do not silently rename the formal thesis title without thesis approval.

## DEC-DEPLOY-001 — Current cloud architecture
**Status:** CURRENT

- GitHub main → Cloudflare static deployment
- Supabase for Auth/database/RLS/Realtime
- AI secret stays server-side when CLARA is added

## DEC-ASSET-001 — High-resolution transparent SCC PNG is the canonical runtime logo
**Status:** OWNER APPROVED — 16 Sep 2026

`public/branding/scc-logo.png` is the current canonical SCC institutional logo used by CampusNav. The owner approved this exact higher-resolution visual and superseded the temporary release instruction that kept the older JPG as primary.

Rules:
- runtime UI uses `/branding/scc-logo.png` only; the JPG is not an automatic fallback or active visual
- only the edge-connected exterior background may be made transparent; wording, symbols, colors, proportions, and legitimate internal white/light details must remain unchanged
- CSS controls display size so the source is not unnecessarily downscaled
- the JPG remains historical/legacy evidence outside runtime `public/`
- any future visual-content change requires a new owner/institutional asset decision

## DEC-AR-001 — AR-Assisted Camera Navigation is approved for canonical planning only
**Status:** OWNER APPROVED FOR PLANNING / IMPLEMENTATION NOT AUTHORIZED — 19 Sep 2026

CampusNav may plan an optional AR-Assisted Camera Navigation / AR Guidance Mode under `74-ar-assisted-navigation-contract.md`.

Decision boundaries:
- AR Guidance is a presentation layer over the existing canonical A* route; it is not a routing engine
- QR checkpoints and manual confirmation remain the location-verification truth
- no exact continuous indoor tracking, autonomous localization, or invented orientation is claimed
- emergency presentation may consume only an already-approved emergency route and remains separately gated
- camera use is explicit, local-first, non-recorded/non-uploaded by default, with no facial/person recognition
- 2D, 3D, and textual guidance remain available fallbacks
- the feature is `NOT_IMPLEMENTED`, `DEFERRED`, and `NOT_READY`
- at the time of adoption, Phase 3 and unfinished MQA-4 controlled sequencing; Phase 3 is now complete, and no AR implementation stage is authorized by either decision

## DEC-DEFENSE-001 — Proposed final defense scope baseline
**Status:** OWNER APPROVED / ADVISER CONFIRMATION REQUIRED — 19 Sep 2026

The owner approves the following proposed final defense baseline. This is an owner scope decision only; it is not adviser approval, institutional approval, or implementation authorization.

Proposed `CORE_FOR_DEFENSE` capabilities at their currently accepted evidence levels:
- responsive web-based CampusNav experience
- GF–5F source-aligned spatial foundation, one canonical spatial dataset, A* routing, 2D/3D, and multi-floor navigation
- QR checkpoint positioning and manual-location fallback
- Facilities directory/navigation and Dashboard
- Auth/RBAC, Admin CMS, and accepted Supabase/Auth/RLS/Realtime foundation
- academic schedule/personnel engine and personnel-availability logic with `SCHEDULED != CHECKED_IN`
- strict Emergency Mode using only verified/emergency-approved data, including rejected non-approved edges and safe no-route/error behavior

Scope boundaries:
- A* is navigation/pathfinding logic and is not AI
- grounded server-side CLARA/Groq and PWA/offline emergency caching are `CONDITIONAL / DEFERRED PENDING ADVISER DIRECTION`
- the current conservative/local CLARA matcher may be shown only at its documented evidence level and is not grounded production AI, a production-ready LLM integration, or a completed AI assistant
- AR Guidance remains `PROPOSED / OPTIONAL / DEFERRED / NOT_IMPLEMENTED / NOT_READY` and is not required for the proposed defense baseline
- reports/analytics, advanced map editor/version rollback, GPS/BLE/Wi-Fi/UWB positioning, hardware presence, native AR/SLAM/VPS, push/SMS, photorealistic 3D, and unrelated dependency upgrades remain optional/deferred unless the adviser explicitly requires them

Defense-data policy:
- only data supported by canonical provenance and authority evidence may be called verified institutional data
- clearly labeled `DEMO`, `SAMPLE`, or equivalent data may demonstrate supported workflows
- unknown data may remain unavailable or pending verification and must not be invented
- demo data is not official/live/current institutional truth, verified personnel presence, or verified emergency truth
- emergency demonstration is limited to strict routing behavior and currently verified/source-aligned data; complete institutional coverage, safety-authority approval, and complete official evacuation coverage are not claimed
- schedule/personnel demonstrations preserve canonical status precedence and require clear demo labeling where records are not institutional truth

The formal tablet-based versus responsive-web title, final adviser scope confirmation, grounded CLARA/PWA requirement, defense-data-policy acceptance, and research/evaluation methodology remain `ADVISER_APPROVAL_REQUIRED`.

## DEC-ROADMAP-002 — Phase 4 product-completion reprioritization
**Status:** OWNER APPROVED — 20 Sep 2026

The owner reprioritizes active software development toward building a more complete functional CampusNav system. The next canonical implementation phase is **Phase 4 — Core Facility & Service Workflow Completion**.

Decision boundaries:
- software/product completion is the active development priority; waiting for adviser confirmation is no longer the active software-development workstream
- `75-adviser-confirmation-package.md` remains `PREPARED / AWAITING_ADVISER_CONFIRMATION` as preserved external-decision material and is not adviser-approved
- adviser waiting does not block safe owner-controlled engineering that preserves pending/unavailable states and clearly labeled `DEMO` / `DEVELOPMENT` fixtures
- official facility hours, services, mappings, contacts, photographs, department ownership, personnel facts, and emergency facts must not be fabricated
- Phase 1 remains `COMPLETE`; Phase 2 and Phase 3 remain `COMPLETE — ACCEPTED_WITH_ADVISORY`; their historical evidence is not reopened or rewritten
- Phase 4 Supabase facility data is an **operational overlay** keyed by existing canonical local facility IDs; it is not a second facility identity system, spatial dataset, navigation truth, or routing system
- existing geometry, nodes/edges, A*, QR/manual positioning, emergency-approved-only routing, and schedule/personnel truth rules remain controlling
- grounded CLARA, PWA/offline, AR Guidance, reports/analytics, advanced map editing, GPS/BLE/UWB, push/SMS, the Claude redesign, and dependency upgrades remain outside Phase 4

Only **Phase 4-FS-1 — Facility Operational Data and Service Foundation** is the exact next implementation subphase. This decision adopts and sequences the phase; it does not implement FS-1 or claim adviser, institutional, safety-authority, or academic approval.

## How to add a decision
Use:
- ID
- date if known
- status
- decision
- reason
- supersedes/affected files if relevant

## DEC-DOC-001 — One documentation gateway for coding agents
**Status:** APPROVED DOCUMENTATION CONVENTION — 15 Sep 2026

Repository `AGENTS.md` should point to `CampusNav_content/00-agent-entrypoint.md`. The agent entrypoint then selects baseline + task-specific contracts. This prevents copying a large, drifting architecture block into multiple agent files.

## DEC-DOC-002 — Separate requirement truth from implementation truth
**Status:** APPROVED DOCUMENTATION CONVENTION — 15 Sep 2026

Architecture/source documents define required behavior. Running code/tests plus `63-implementation-status-registry.md` define what is actually implemented. A requirement does not prove completion, and an implementation gap does not silently delete a requirement.

## DEC-DOC-003 — Unknown institutional/research policy remains unresolved, not guessed
**Status:** APPROVED DOCUMENTATION CONVENTION — 15 Sep 2026

When the supplied sources do not define a final data owner, retention period, research evaluation instrument, or other institutional policy, document the gap in `64`/`70` instead of presenting a common practice as an approved school requirement.

## DEC-ROADMAP-001 — Canonical development roadmap reset
**Status:** OWNER APPROVED — 15 Sep 2026

The active development roadmap restarts at **Phase 1 — Canonical Documentation Alignment and Repository Baseline**. This is a process and phase-numbering reset only, not a code reset. Existing navigation, 3D, QR, Emergency, Dashboard, Supabase, Admin, and academic/personnel work must be preserved and mapped to the canonical contracts before further implementation.

Phase 8C.2 work already present in the worktree remains preserved as existing implementation evidence, but it is not considered complete under the reset roadmap until a future approved phase performs the required database, live-cloud, browser/device, and acceptance verification. Phase 2 must be explicitly approved before implementation begins.
