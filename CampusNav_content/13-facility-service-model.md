# CampusNav AI — Facility and Service Model

## Purpose
Defines how CampusNav represents rooms/offices/facilities and lets users find a destination by **service need**, not only by room name.

## Phase 4 operational-overlay boundary
Phase 4 — Core Facility & Service Workflow Completion builds operational software workflows without replacing the proven local spatial source. Supabase operational profiles, services, aliases, mappings, hours, exceptions, advisories, and media metadata must reference the existing canonical facility IDs.

The overlay must not redefine facility identity, floor assignment, geometry, nodes/edges, QR checkpoints, emergency approval, or route logic. Existing A*, QR/manual positioning, strict emergency routing, and schedule/personnel truth rules remain unchanged.

## Facility information
A facility record/card may include verified values for:
- name
- department
- floor
- room number
- description
- services offered
- operating hours
- computed open/closed status
- temporary closure/advisory
- public contact information
- accessibility information
- approved personnel assignment/schedule
- current advisories
- images
- Navigate action
- Ask CLARA action

Unknown data must remain unavailable/pending rather than invented.

## Operating status
When official hours exist, status may be calculated from:
- current date/time
- timezone: Asia/Manila
- official operating hours
- holiday/schedule exceptions
- temporary closure overrides

Supported vocabulary:
- OPEN_NOW
- CLOSED
- CLOSING_SOON
- TEMPORARILY_UNAVAILABLE
- SCHEDULED_TO_OPEN
- PENDING_VERIFICATION / UNKNOWN

### Phase 4 status-evaluation rules
- All evaluation uses `Asia/Manila`; stored timestamps retain an unambiguous timezone/offset.
- Weekly schedules use local weekday/start/end values. An interval whose end time is less than or equal to its start time is an overnight interval continuing into the following campus date.
- A dated exception replaces the weekly schedule for its stated campus date. It may close the facility for the day or provide replacement intervals. An overnight interval remains governed by the schedule/exception for its start date until its end time.
- An active, authorized facility-wide `TEMPORARY_CLOSURE` advisory has highest operational precedence and produces `TEMPORARILY_UNAVAILABLE` for its effective window.
- A `SERVICE_INTERRUPTION` advisory affects only its configured service mapping unless it is explicitly authorized as facility-wide; it must not silently close an otherwise open facility.
- If no applicable verified hours exist, return `PENDING_VERIFICATION` or `UNKNOWN`; do not infer status from personnel assignments, check-ins, typical office hours, or UI defaults.
- After exceptions and closures, an active interval returns `CLOSING_SOON` when its verified closing time is within **30 minutes**, otherwise `OPEN_NOW`.
- A later verified interval on the same campus date returns `SCHEDULED_TO_OPEN`; otherwise verified out-of-window time returns `CLOSED`.
- A computed result inherits its source provenance. A result derived from `DEMO` hours must remain visibly demo-labeled and must not be called official, live, or verified institutional status.

Operational `CLOSED`, `CLOSING_SOON`, `SCHEDULED_TO_OPEN`, or `TEMPORARILY_UNAVAILABLE` states do **not** automatically mean `ROUTING_BLOCKED`. Operational availability and navigation-edge restrictions are separate truths. Only the canonical navigation/restriction data may block a route.

Do not call status “real-time” unless it actually comes from current system data.

## Service-to-facility mapping
Users should be able to ask for a **task/service** even if they do not know the office.

Examples from the source architecture include concepts such as:
- School Records → Registrar’s Office
- Guidance Concern → Guidance Office
- Health Concern → clinic/health facility
- Student Concern → appropriate student-services office

These are examples. The actual mapping must be administrator-configured and verified by the school.

Recommended model:

```text
SERVICE
  id
  name
  description
      ↓ many-to-many or configured mapping
FACILITY
```

A service lookup should return:
- recommended facility
- location
- operating hours/status if verified
- service information
- Navigate
- Ask CLARA

## Facility directory
Filters may include:
- floor
- department
- facility type
- service
- open now

## Facility photos
Images are optional supportive content. Missing imagery must not block navigation.

Phase 4 media records require provenance, lifecycle, safe metadata, useful alternative text, and authorized publication. Placeholder imagery remains valid when no approved photograph exists.

## Personnel wording inside facility detail
A facility may show:
- Scheduled personnel
- Checked In only with authorized check-in
- Current class schedule if approved

Schedule does not prove physical presence.

## Advisories
Facility advisories may represent:
- temporary closure
- maintenance
- blocked path
- service interruption
- room availability notice

They should feed the centralized Dashboard where appropriate.

## Source basis
- CampusNav Project Source Reference — facility information system, service recommendation, one-stop campus service feature, facility dashboard
- CampusNav AI Final Expanded Architecture — personnel/office/lab availability and Dashboard integration
