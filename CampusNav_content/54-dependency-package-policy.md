# CampusNav AI — Dependency and Package Policy

## Rule
Do not add a package when the current stack already solves the problem adequately.

## Before adding a dependency
Check:
- what capability is missing
- bundle/performance impact
- maintenance/activity
- licensing suitability
- browser/device support
- security exposure
- whether it duplicates an existing package

## Sensitive categories
Be especially careful with:
- auth/security libraries
- QR/camera libraries
- 3D/rendering packages
- AI SDKs
- analytics/telemetry SDKs

## Updates
Major dependency upgrades require regression tests for the affected domain. Three.js/React Three Fiber and QR/camera changes can affect performance/device behavior and should not be upgraded casually during thesis stabilization.

## Lockfile
Commit and respect the repository's existing lockfile/package manager; do not introduce a second package manager without an approved decision.
