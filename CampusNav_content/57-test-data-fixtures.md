# CampusNav AI — Test Data and Fixture Strategy

## Goals
Tests should be deterministic and must not depend on mutable production school data.

## Fixture categories
- spatial route fixtures
- QR checkpoint fixtures
- schedule/time-window fixtures
- personnel status precedence fixtures
- notification lifecycle/audience fixtures
- auth/RBAC fixtures
- emergency-approved/no-route fixtures

## Required schedule cases
- active class
- upcoming class
- cancelled exception
- rescheduled/room/professor/time change
- consultation window
- explicit unavailable override
- authorized check-in
- no active schedule

## Route cases
- same floor
- multi-floor
- blocked edge
- construction restriction
- invalid/unlinked checkpoint
- emergency-approved route
- emergency no-route with no normal fallback

## Isolation
Use synthetic IDs/names and reset/clean test state. Never make automated tests rely on a real professor being scheduled at a particular current time.
