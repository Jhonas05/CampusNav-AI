# CampusNav AI — Demo and Seed Data Policy

## Rule
Demo data must never be mistaken for official St. Clare College data.

## Allowed demo uses
Demo/seed records may be used for:
- local development
- automated tests
- UI demonstrations when official data is not yet supplied
- thesis rehearsals if clearly labeled

## Required labeling
Records not from an approved institutional source must carry a clear state such as:
- `DEMO`
- `SAMPLE`
- `ESTIMATED`
- `PENDING_VERIFICATION`

The UI must not display “official”, “live”, “current”, or “real-time” for such records.

## Never fabricate as official
Especially:
- faculty presence
- class schedules
- office hours
- class suspensions
- emergency paths/contacts
- accessibility infrastructure
- crowd levels

## Production handling
Seed scripts should be idempotent where practical. Production must not receive demo personnel/schedules/announcements by accident. If production demo data is intentionally used during a controlled thesis presentation, it must be visibly labeled and removable.

## Test isolation
Automated fixtures should use recognizable synthetic IDs/names and should not depend on mutable real school records.
