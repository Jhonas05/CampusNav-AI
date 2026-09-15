# CampusNav AI — Observability and Debugging Contract

## Goals
Detect failures without leaking secrets or turning logs into a second datastore.

## Useful observability categories
- application errors
- route-generation failures/no-path reasons
- QR scan/parse failures
- Supabase/auth connectivity failures
- Realtime subscription failures
- 3D/WebGL fallback events
- server/CLARA provider failures when implemented

## Logging rules
- include enough context to reproduce the issue (module, safe entity ID, timestamp)
- never log passwords, tokens, service-role keys, private raw auth payloads, or unnecessary personal data
- distinguish expected user states (`not found`, `no verified route`) from actual software errors

## Correlation
Custom server endpoints should support a request/correlation ID when useful for debugging.

## Production debugging
Do not enable verbose sensitive debugging in production. A visible user error should have a safe message and a technical trace only in controlled logs.
