# CampusNav AI — Environment and Configuration Registry

## Purpose
Keep configuration explicit so agents do not hard-code secrets, URLs, or environment-specific behavior.

## Configuration classes
### Public/browser-safe
May be exposed to the Vite client only when intentionally public:
- public Supabase project URL
- Supabase anonymous/public key if the architecture uses it with RLS
- public application base URL
- non-secret feature flags

### Server-only secrets
Never place in `VITE_*`, client bundles, committed source, screenshots, or logs:
- service-role database credentials
- Groq/CLARA provider secret
- webhook signing secrets
- privileged SMS/provider credentials
- private admin tokens

## Required registry fields
For every variable document:
- variable name
- purpose
- environment(s)
- browser-safe? yes/no
- required/optional
- owner/service
- fallback behavior

## Environment policy
Recommended environments:
- local/development
- test/CI
- production

Production values must not be copied into demo fixtures or documentation.

## `.env.example`
The repository should maintain an `.env.example` containing variable names and safe placeholders only. Never include working secrets.

## CLARA rule
Any future Groq/LLM request must be made from a server/edge boundary. The browser may call a controlled CampusNav endpoint, but must not receive the provider secret.

## Failure behavior
Missing optional configuration should disable the dependent feature cleanly. Missing required configuration should produce a clear startup/runtime error instead of silently using unsafe defaults.
