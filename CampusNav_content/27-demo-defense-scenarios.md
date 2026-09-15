# CampusNav AI — Demo and Thesis Defense Scenarios

## Purpose
Defines repeatable demonstrations that prove the architecture without overclaiming unsupported capabilities.

## Scenario A — QR to 3D multi-floor route
**Status:** core showcase / implemented according to current context

1. Scan `QR-3F-LIBRARY`.
2. CampusNav sets current location to Library — 3F.
3. Search Registrar’s Office.
4. Existing A* calculates a verified multi-floor route.
5. Show route in 2D.
6. Switch to 3D.
7. The **same node sequence** appears across the relevant floors.

Defense point: 3D is a visualization of the same routing engine, not a separate AI route generator.

## Scenario B — Find a professor
**Status:** backend engine implemented; Admin UI/data completeness may still be in progress

1. Search an approved faculty/personnel name.
2. Evaluate authorized class/office/consultation schedule.
3. Show wording such as: “Scheduled to teach in Room 54 from 1:00–2:30 PM.”
4. If an authorized check-in exists, `CHECKED_IN` may be shown.
5. Tap Navigate to route to the approved scheduled room/office.

Defense point: schedule ≠ physical presence.

## Scenario C — Room schedule
**Status:** backend-capable; depends on approved schedule data

1. Open Room 54.
2. Show current class, section, assigned professor, scheduled end, next class, next free window when data exists.
3. If data does not exist, show “Schedule information unavailable.”

Defense point: CampusNav does not fabricate academic information.

## Scenario D — Dashboard
**Status:** implemented according to current context

Open Dashboard and demonstrate:
- Priority Alerts
- Today’s Classes
- Office Availability
- Personnel Availability
- Facility Advisories
- Events & Calendar
- General Announcements
- Navigation Notices

Defense point: notification-style information is centralized.

## Scenario E — Strict Emergency Mode
**Status:** implemented according to current context

1. Set a verified current location.
2. Enable Emergency Mode.
3. Show only approved emergency data/routes.
4. Demonstrate that an unavailable emergency route does **not** fall back to normal navigation.
5. Show the safe posted-signage guidance.

Defense point: AI and normal A* are not allowed to invent evacuation paths.

## Scenario F — Facility service discovery
**Status:** source-required; verify current implementation

1. Search/ask for a service such as school records.
2. CampusNav resolves the administrator-configured service mapping.
3. Show the corresponding facility, floor, status/hours if verified.
4. Navigate there.

Defense point: users do not need to know the office name first.

## Scenario G — CLARA grounded answer
**Status:** future after services stabilize

1. Ask: “CLARA, where can I request my school records?”
2. CLARA calls the internal service mapping/facility service.
3. It returns verified facility information and Navigate action.
4. Ask a question with unavailable data.
5. CLARA explicitly says verified information is unavailable.

Defense point: CLARA is the intelligent conversational layer; the database/services remain the source of truth.

## Recommended defense statement
CampusNav uses standard graph-based pathfinding for routing, QR/manual selection for reliable thesis-level indoor positioning, and one shared 2D/3D spatial model. Optional GPS/BLE can extend location continuity, but the system does not claim exact continuous indoor tracking without sensors and calibration. Personnel availability is based on approved schedules and authorized check-ins, not assumptions about physical presence.

## Source basis
- CampusNav AI Final Expanded Architecture — demonstration scenarios and defense-ready explanation
- CampusNav Project Source Reference — facility/service and CLARA examples
