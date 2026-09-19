# CampusNav AI — AR-Assisted Camera Navigation / AR Guidance Mode

## Canonical status

- **Planning status:** `PROPOSED / FUTURE_ENHANCEMENT`
- **Implementation status:** `NOT_IMPLEMENTED`
- **Sequencing status:** `DEFERRED`
- **Definition of Ready:** `NOT_READY`
- **Owner authorization:** approved for canonical planning only on 19 September 2026

This document adopts the AR-assisted guidance concept into canonical planning. It does not authorize implementation, change the active roadmap, or provide implementation evidence. Phase 3 remains controlling, and Phase 3-MQA-4 remains the exact next canonical work.

## Purpose

AR Guidance is an optional camera-based presentation mode for an existing CampusNav route. It may show readable visual maneuver guidance over a live camera view, but it does not calculate routes, establish a second spatial truth, or provide autonomous indoor localization.

## Non-negotiable architecture

```text
Canonical campus/spatial dataset
        ↓
Existing A* navigation engine
        ↓
Canonical route sequence / derived route steps
        ├── 2D Map
        ├── 3D Map
        └── AR-Assisted Camera Guidance
```

- A* remains responsible for normal routing.
- AR Guidance is a presentation/guidance layer only.
- 2D, 3D, and AR Guidance must consume the same route result and stable facility/node IDs.
- AR Guidance must not introduce an independent route algorithm, duplicate coordinates, or a competing campus dataset.
- Navigation/pathfinding must not be described as AI.
- The initial concept is screen-based camera guidance, not proof of world-anchored augmented-reality localization.

## Location and positioning truth

CampusNav does not currently have reliable continuous indoor positioning. AR Guidance must not claim:

- exact continuous real-time indoor tracking
- GPS-like indoor precision
- automatic corridor-level physical presence
- world-space camera alignment or orientation without verified supporting data

Accepted location sources remain:

1. **Primary:** verified QR checkpoint resolved to its canonical spatial node.
2. **Fallback:** explicit manual location confirmation resolved to the selected canonical location.

Between verifications, AR Guidance may present the active route step from the most recently verified origin and route context. It must not imply that the camera has determined the user's exact position. Route progress and distance must be labeled as approximate when they are inferred from route context rather than live verified movement.

When location confidence is insufficient, the feature must request one of:

- `Scan nearest QR checkpoint.`
- `Confirm current location manually.`

Unknown location remains unknown. No position may be invented.

## QR re-verification contract

```text
Scan QR checkpoint
        ↓
Validate checkpoint
        ↓
Resolve canonical spatial node
        ↓
Set verified origin
        ↓
Recalculate with existing A*
        ↓
Update canonical route steps and AR guidance
```

- Reuse the existing QR payload, validation, privacy, and checkpoint-to-node contract.
- Invalid, unknown, inactive, or incorrectly linked QR data must not set a location or route origin.
- Failed QR verification must show a safe error state and retain manual-location fallback.
- Camera use for guidance must not weaken existing QR validation.
- Any design that switches between guidance and QR scanning must preserve destination and route state.

## Conceptual route-step contract

The future route-step adapter may derive presentation-ready steps from the existing A* node sequence and graph geometry. This is a conceptual contract, not a production schema.

Possible fields:

- `maneuver`: `LEFT`, `RIGHT`, `STRAIGHT`, `STAIRS_UP`, `STAIRS_DOWN`, `FLOOR_TRANSITION`, or `ARRIVAL`
- `fromNodeId`
- `toNodeId`
- `floor`
- `approximateDistance`
- `instruction`
- `destinationId`
- `checkpointVerificationRecommended`
- `emergencyApprovedContext`, when applicable

Rules:

- IDs must reference canonical records.
- Instructions must be derived from route geometry and verified floor transitions, not handwritten institutional guesses.
- `approximateDistance` must not be presented as verified metres unless the underlying spatial scale supports that claim.
- `emergencyApprovedContext` is contextual metadata only; it must never independently approve an emergency edge or route.
- Route progress must not be described as live physical movement unless a future approved provider supplies valid evidence.

## Multi-floor behavior

AR Guidance must consume existing multi-floor routes and may present:

- `STAIRS_UP`
- `STAIRS_DOWN`
- `FLOOR_TRANSITION`
- `ARRIVAL`

Example:

```text
Proceed to Stair A
        ↓
Go to 3F
        ↓
Verify at the 3F Stair A QR checkpoint
        ↓
Continue the same canonical route after A* refresh
```

Floor changes must use source-aligned canonical stair transitions. Checkpoint orientation or camera-heading metadata is a possible future enhancement only. No real-facility orientation value may be invented.

## Emergency boundary

Emergency Mode remains governed by `12-emergency-safety-contract.md`.

```text
Emergency-approved graph/filter
        ↓
Existing approved emergency route result
        ↓
Optional AR visual presentation
```

- AR Guidance must never create, infer, optimize, or approve an emergency route.
- Only verified emergency-approved edges may appear.
- Normal-route edges must never be used as fallback when an emergency route is unavailable.
- If no approved route exists, show the canonical safe no-route state and posted-signage/authorized-personnel guidance.
- AR-7 requires explicit canonical and safety-authority approval before implementation.
- Camera presentation must not obscure emergency text, exit identifiers, warnings, or the ability to return to the canonical 2D emergency view.

## Camera and privacy contract

Default intended behavior:

- request camera permission explicitly and only when the user starts Camera Guidance
- prefer the rear/environment camera where the browser and device support it
- process the camera feed locally for visual guidance
- do not record video by default
- do not upload camera frames by default
- do not persist camera images or video by default
- do not perform facial recognition
- do not identify or track people or objects
- stop camera capture when the mode is exited or no longer active
- provide safe denied, dismissed, interrupted, unavailable, and device-switch failure states
- allow the user to exit at any time

Any future recording, upload, computer vision, analytics derived from frames, or persistent storage requires a separate privacy/security decision and Definition-of-Ready review. Camera permission is not consent for unrelated collection.

## Accessibility and fallback

AR Guidance must never be the only navigation method. Always preserve:

- 2D navigation
- 3D navigation where supported
- text-based route instructions
- QR/manual location verification
- readable maneuver, destination, distance, progress, and floor text
- keyboard-accessible controls where applicable
- screen-reader-compatible textual route state
- high-contrast and non-color cues
- reduced-motion behavior

The visual camera overlay and any motion must have equivalent textual information. Screen-reader output must describe the route step rather than the raw camera scene. A future implementation must not imply that a screen reader can interpret unprocessed camera imagery.

Required fallback wording may be equivalent to:

> Camera Guidance is unavailable on this device. Continue with 2D Navigation.

Permission denial, missing camera support, poor performance, or camera interruption must not remove the active destination or canonical route.

## Browser, device, and performance boundary

AR Guidance is progressive enhancement. Future implementation depends on verified support for:

- secure context/HTTPS
- `MediaDevices.getUserMedia`
- explicit camera permission
- environment-facing camera availability where supported
- mobile browser camera behavior and lifecycle
- switching safely between guidance and QR scanning
- orientation changes, backgrounding, interruptions, and camera release
- graceful desktop/no-camera fallback

The feature should be lazy-loaded and must not increase the initial navigation shell cost unnecessarily. It must avoid expensive continuous effects, preserve reduced-motion behavior, and release camera/media resources promptly.

No universal browser/device support, physical-device certification, performance threshold, or exact camera capability is claimed until representative-device testing is completed.

## Initial out of scope

The following are not part of the initial adoption plan:

- ARCore
- ARKit native integration
- BLE beacons
- Wi-Fi fingerprinting
- UWB
- visual positioning systems
- SLAM
- computer-vision hallway detection
- AI object recognition
- continuous indoor GPS-like tracking
- camera-based facial/person recognition
- a new routing algorithm
- hardware presence systems

These items require separate owner approval, evidence, privacy/security review, and Definition of Ready. Their mention here is not roadmap authorization.

## Proposed future stages

None of these stages is implemented or authorized to start.

### AR-0 — Canonical Feasibility and Architecture

- finalize contracts and screen-fixed guidance boundary
- finalize route-step model and approximate-distance semantics
- define permission/privacy behavior
- define representative browser/device matrix and acceptance criteria
- resolve open questions; no production implementation

### AR-1 — Camera Guidance Shell

- explicit camera permission
- rear/environment camera preference
- exit/release camera
- denied, dismissed, interrupted, and unsupported states
- no routing changes

### AR-2 — Route-Step Adapter

- derive maneuver instructions from the existing A* route sequence
- preserve stable node/facility IDs and route state
- no new routing engine

### AR-3 — Visual Guidance Overlay

- maneuver arrow and instruction
- approximate distance
- floor and destination
- route progress based on verified route context

### AR-4 — QR Re-Verification

- scan and validate checkpoint
- resolve canonical node
- set verified origin
- recalculate with existing A*
- update route steps and presentation

### AR-5 — Multi-Floor Guidance

- stair and floor-transition instructions
- post-transition QR/manual verification
- no invented orientation metadata

### AR-6 — Accessibility / Browser / Device QA

- camera support and fallback
- keyboard/text alternatives
- screen-reader-compatible textual route state
- reduced-motion/high-contrast behavior
- representative physical-device testing

### AR-7 — Emergency Presentation Validation

- conditional stage only
- may present an already-approved emergency route
- requires emergency-contract and safety-authority approval
- must retain safe no-route behavior and 2D emergency fallback

## Proposed user flow

```text
Facility / Search
        ↓
Select destination
        ↓
Navigate
        ↓
Choose or verify starting location
        ↓
Existing A* route calculation
        ↓
Choose presentation: 2D / 3D / AR Guidance
        ↓
Explicit camera permission
        ↓
Route-step visual + textual guidance
        ↓
QR/manual re-verification when required
        ↓
Existing A* route refresh
        ↓
Arrival
```

## Future acceptance boundaries

Before any implementation can be accepted, evidence must show:

- the same canonical route/node sequence feeds 2D, 3D, and AR Guidance
- no second route engine or spatial dataset exists
- QR/manual verification and invalid-QR behavior remain correct
- unsupported/denied/interrupted camera states preserve core navigation
- no camera recording, upload, recognition, or persistence occurs by default
- textual, keyboard, screen-reader, contrast, and reduced-motion alternatives work
- multi-floor steps use canonical verified transitions
- route distance/progress wording does not overclaim live position or verified metres
- representative browser/device behavior and resource cleanup are manually verified
- any emergency presentation consumes approved emergency results only and passes safety review

## Definition-of-Ready gaps

AR implementation remains `NOT_READY`. Before AR-0 or later implementation begins, canonical approval must resolve or explicitly define:

- final initial-scope classification and roadmap authorization after current Phase 3 work
- final route-step adapter rules, maneuver derivation, and approximate-distance semantics
- representative browser/device/camera acceptance matrix
- camera/QR stream-switching and interruption behavior
- privacy/security verification method for local-only, non-recorded camera use
- performance budget and resource-release acceptance thresholds
- accessibility test plan, including screen-reader textual route state
- whether AR-7 is allowed and which safety authority approves it

Unresolved items belong in `64-open-questions-decision-backlog.md`; they must not be guessed in code.

## Safe thesis/defense wording

> CampusNav AR-Assisted Guidance does not determine navigation routes. The canonical A* routing engine calculates routes from verified campus spatial data. AR Guidance is an optional visualization layer that presents route maneuvers over the device camera view. QR checkpoints and manual confirmation provide location verification.

Do not describe A* as AI. Do not claim autonomous AR localization, continuous indoor tracking, world-anchored guidance, or production readiness.

## Related canonical contracts

- `02-system-rules.md`
- `03-architecture.md`
- `10-navigation-engine.md`
- `11-spatial-map-source-of-truth.md`
- `12-emergency-safety-contract.md`
- `20-data-provenance-verification.md`
- `21-error-state-contract.md`
- `25-performance-budget.md`
- `26-accessibility-standards.md`
- `30-known-limitations.md`
- `34-id-naming-conventions.md`
- `49-privacy-data-retention.md`
- `55-browser-device-compatibility.md`
- `58-module-acceptance-criteria.md`
- `60-core-vs-optional-feature-matrix.md`
- `63-implementation-status-registry.md`
- `69-risk-register-mitigations.md`
- `72-definition-of-ready.md`
- `73-quality-gates-release-checklist.md`
