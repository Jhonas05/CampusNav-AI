# CampusNav AI — Validation and Business Rules

## Cross-domain rules
- referenced facility/node/personnel/schedule IDs must exist
- effective/expiration dates must be logically ordered
- enum/status values must use canonical values
- administrator write access must be role/data-owner scoped

## Navigation
- edge endpoints must exist
- blocked/restricted/construction edges are excluded as configured
- floor transitions must connect verified/source-aligned stair nodes
- emergency route data cannot be auto-derived from normal edges unless explicitly approved as emergency data

## Facilities
- `Open Now` requires verified operating-hour data plus date/time/exception evaluation
- unknown hours must display unavailable, not guessed

## Schedules
- schedule exceptions override base schedules
- an `IN_CLASS` result is schedule-based wording, not presence
- authorized check-in is required for `CHECKED_IN`
- current time uses Asia/Manila unless a documented future change is approved

## Notifications
- published/scheduled lifecycle and audience must be valid
- expired/cancelled items must not appear as current active alerts

## Emergency
Safety-critical records require authorized ownership/approval and verification metadata.
