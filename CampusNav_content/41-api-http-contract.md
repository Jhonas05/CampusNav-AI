# CampusNav AI — API and HTTP Contract

## Scope
CampusNav currently uses internal services/Supabase and may later expose server/edge endpoints for CLARA or privileged integrations. This document defines the contract those endpoints should follow; it does not invent endpoints that do not exist.

## Request rules
- authenticate where required
- authorize every privileged action
- validate input types, IDs, length, and allowed enum values
- never trust role claims from raw client payloads

## Response categories
Use predictable success/error shapes when adding custom endpoints.
Recommended fields:
- success/data for successful calls
- stable error code
- user-safe message
- optional correlation/request ID

## Error classes
- validation error
- unauthenticated
- forbidden
- not found
- conflict/stale update
- rate limited
- dependency unavailable
- internal error

## Security
- no stack traces/secrets/service credentials in client responses
- CLARA server endpoints must enforce CampusNav authorization and source-truth rules
- emergency/status endpoints must not fabricate fallback content when verified data is absent

## Versioning
Breaking API changes require a documented migration/compatibility plan.
