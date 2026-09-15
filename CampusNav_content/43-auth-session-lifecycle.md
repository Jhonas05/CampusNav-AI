# CampusNav AI — Authentication and Session Lifecycle

## Public access
Guest/public users may access intentionally public navigation, facility, and emergency information according to product rules.

## Authenticated access
User capabilities are derived from verified account/profile/role records—not from UI visibility alone.

## Authorization layers
1. UI route/component gating for user experience
2. service/domain authorization
3. Supabase PostgreSQL RLS/database authorization as the authoritative data boundary

## Session behavior
- handle signed-in, signed-out, loading, expired-session, and refresh failure states
- clear privileged UI state after sign-out/session loss
- do not persist service-role credentials in browser storage

## Role changes
Role updates should take effect safely after session/permission refresh. Critical role changes require audit logging.

## Private linkage
Personnel↔auth linkage is private and must not become a public staff directory field.

## Principle
A hidden button is not authorization. Every protected data operation must remain protected when called outside the intended UI.
