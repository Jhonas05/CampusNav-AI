# CampusNav AI — Schedule and Availability Engine Contract

## Purpose
Defines how class schedules, personnel assignments, consultation hours, check-ins, and overrides become accurate user-facing availability.

## Critical rule
**Schedule is not presence.**

A timetable may say someone is scheduled to teach or assigned to an office. It must not claim the person is physically present unless an authorized check-in/presence mechanism confirms it.

## Status vocabulary
- `UNAVAILABLE`
- `CHECKED_IN`
- `IN_CLASS`
- `CONSULTATION`
- `SCHEDULED`
- `NO_ACTIVE_SCHEDULE`

## Status precedence
```text
UNAVAILABLE
   > CHECKED_IN
   > IN_CLASS
   > CONSULTATION
   > SCHEDULED
   > NO_ACTIVE_SCHEDULE
```

An explicit unavailability override wins because the system must not advertise someone as available during approved leave/closure/override.

## Allowed wording
| Status | Meaning | Public wording example |
|---|---|---|
| SCHEDULED | assigned to approved place/time | “Scheduled at Registrar’s Office until 12:00 PM.” |
| CHECKED_IN | authorized check-in confirms presence | “Currently checked in.” |
| IN_CLASS | timetable assigns teaching in a room | “Scheduled to teach in Room 54, 1:00–2:30 PM.” |
| CONSULTATION | approved consultation window | “Consultation hours until 4:00 PM.” |
| UNAVAILABLE | explicit override/outside availability | “Unavailable.” |
| NO_ACTIVE_SCHEDULE | no current approved schedule | “No active schedule available.” |

Avoid “here now” unless an authorized presence signal supports it.

## Inputs
Availability may use:
- official personnel schedule
- class schedule + room assignment
- office/facility assignment
- consultation hours
- approved leave/unavailable override
- authorized check-in/check-out
- current date/time in Asia/Manila
- academic calendar / holidays
- schedule exceptions

## Room schedule lookup
A room query may return verified:
- current class
- section
- assigned professor
- scheduled start/end
- next class
- next free window

If schedule data is unavailable, say so.

## Personnel lookup
Queries such as:
- Where is Prof. X?
- Is Prof. X available now?
- When is Prof. X free?
- Who is assigned in the Virtual Laboratory?

must be answered from approved schedule/availability data.

If only timetable data exists, return the **scheduled assignment**, not claimed live presence.

## Next-availability calculation
Compute from schedule gaps, consultation windows, exceptions, and overrides. Do not store duplicate “next free” values unless caching is explicitly required.

## Conflict detection
Admin schedule UI should detect at least:
- person assigned to overlapping schedules
- room assigned to overlapping classes
- invalid end-before-start time
- exception referencing missing schedule
- duplicate active check-in if policy disallows it

## Navigation integration
If a personnel query resolves to a current approved destination, use the normal CampusNav route engine. Never create a personnel-specific router.

## Source basis
- CampusNav AI Final Expanded Architecture — Personnel, Office & Laboratory Availability; Class Schedules; Faculty Search; privacy rules
- current content folder — implemented academic/personnel backend and status precedence
