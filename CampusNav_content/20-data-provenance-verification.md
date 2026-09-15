# CampusNav AI — Data Provenance and Verification Contract

## Purpose
Prevents demo data, estimates, assumptions, or stale information from being presented as official campus truth.

## Verification states
Use explicit metadata/status where useful:
- `VERIFIED`
- `ESTIMATED`
- `PENDING_VERIFICATION`
- `DEMO`
- `UNAVAILABLE`

Not every UI needs to show these labels, but the data/service layer should preserve enough provenance to make accurate wording possible.

## What must not be fabricated
- room/facility location
- hallway/stair connections
- emergency exits/routes/equipment
- operating hours
- class schedules
- staff/faculty presence
- suspension decisions
- events/announcements
- accessibility infrastructure
- crowd level
- exact architectural measurements

## Approved owners / sources
### Facilities/map
- official floor-plan/emergency reference
- designated campus/facility administrator

### Class schedules
- Academic Affairs / authorized academic scheduling office

### Personnel assignments/availability
- department head or authorized HR/academic office
- authorized check-in system for confirmed presence

### Emergency
- official evacuation plan
- authorized safety/security/facilities office

### Announcements/suspensions
- authorized school administration only

## Demo data
Demo records must:
- be clearly labeled DEVELOPMENT/DEMO
- never masquerade as official data
- be excluded from normal production views where possible
- be removed after live test when temporary

## Timestamp / freshness
Time-sensitive records should expose enough metadata for the service/UI to determine freshness, e.g.:
- effective date/time
- expiration date/time
- updated_at
- last verified date

Do not claim “live” or “real-time” unless the information source actually updates in real time.

## Presence provenance
- timetable → SCHEDULED / IN_CLASS, not physical presence
- consultation record → CONSULTATION
- explicit override → UNAVAILABLE or approved state
- authorized check-in → CHECKED_IN

## Location provenance
- QR → exact to installed checkpoint
- manual selection → exact to selected record
- GPS → device/environment dependent
- BLE → approximate, hardware/calibration dependent
- demo route animation → simulated, never “live”

## Accessibility provenance
If elevator/ramp/accessible restroom/route data is not verified, display pending/unavailable wording and do not route users through assumed infrastructure.

## Source basis
- both 14 Sep CampusNav source references — verified-over-fabricated principle, data accuracy states, presence/location limits
