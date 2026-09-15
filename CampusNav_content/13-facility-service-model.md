# CampusNav AI — Facility and Service Model

## Purpose
Defines how CampusNav represents rooms/offices/facilities and lets users find a destination by **service need**, not only by room name.

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
