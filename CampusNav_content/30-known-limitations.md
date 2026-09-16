# CampusNav AI — Known Limitations and Claims Boundary

## Why this file exists
These are not defects to hide. They protect the thesis from overclaiming and keep development feasible.

## Indoor positioning
CampusNav does **not** claim exact continuous indoor tracking from QR/manual positioning.
- QR = exact to the checkpoint when scanned
- manual = exact to the user-selected location
- GPS is weaker indoors
- BLE needs hardware/calibration
- UWB is future/high-cost

## 3D mapping
CampusNav does not need Google-level photorealistic 3D. The thesis target is an interactive, data-driven campus-specific 3D representation tied to verified floor-plan geometry.

## Pathfinding vs AI
A* routing is standard pathfinding, not the AI contribution. CLARA is the intelligent conversational component.

## Emergency
CampusNav does not autonomously invent evacuation routes. If verified emergency data is missing, it must defer to posted plans and authorized personnel.

## Personnel presence
A schedule does not prove that a person is physically in a room. Confirmed presence requires authorized check-in/presence integration.

## Crowd levels
Do not claim real-time crowd information unless an actual verified data source exists.

## Accessibility
Do not invent elevators, ramps, accessible entrances, or accessible restrooms. Unverified infrastructure remains pending/unavailable.

## Operating hours / schedules
Facility hours, class schedules, and staff assignments are only as reliable as the approved school data supplied and maintained.

## Class suspensions
AI does not declare suspensions. Official status must come from authorized school administration.

## CLARA
CLARA should not be considered complete until it is connected to stable internal services, role-aware authorization, and verified source data.

## PWA/offline
The master source requires PWA-capable offline emergency access, but implementation must be verified before claiming it in the thesis demo.

## Advanced map administration
A full visual floor-plan editor/version rollback is source-required/valuable but may remain a scoped roadmap item if not completed by final thesis, provided the implemented navigation remains accurate and maintainable.

## Formal title mismatch risk
Proposal wording is tablet-based, while current architecture is responsive web-based. This should be explained as broader device compatibility, not hidden. Any formal title revision should go through thesis approval.

## CampusNav Ink adoption verification
The owner-approved application-wide visual direction is governed by `DEC-UI-002`, which supersedes the older strict grayscale / Apple-only limitation where it conflicts.

- neutral surfaces remain dominant
- CampusNav green, emergency red, and controlled map/status colors have explicit semantic roles
- color must not be the only signal
- full graphical/device/browser confirmation remains pending until supported by real render evidence

## Source basis
- CampusNav AI Final Expanded Architecture — thesis feasibility/claims boundaries
- CampusNav Project Source Reference — limitations, verification, emergency/accessibility restrictions
