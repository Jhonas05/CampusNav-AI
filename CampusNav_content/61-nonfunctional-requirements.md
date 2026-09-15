# CampusNav AI — Non-Functional Requirements

## Reliability
- verified navigation data should produce repeatable routes
- user-facing failures should degrade safely, especially 3D→2D and QR→manual

## Performance
- heavy 3D/QR code should be lazy-loaded where practical
- mobile must remain usable without loading unnecessary 3D detail
- see `25-performance-budget.md`

## Security/privacy
- authentication, authorization/RLS, validation, auditability, data minimization

## Accessibility
- keyboard and screen-reader support
- focus indicators and large touch targets
- never rely on color alone
- reduced-motion support

## Maintainability
- one source of truth per domain
- stable IDs
- migrations/versioned configuration
- admin-manageable content instead of source-code edits for operational data

## Auditability/data truth
The system must distinguish verified, estimated, demo, unavailable, and pending-verification data rather than flattening them into a generic “current” state.
