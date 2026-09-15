# CampusNav AI — Coding and Implementation Standards

These are project engineering conventions added to keep agent-generated code maintainable. They do not replace existing working conventions in the repository.

## General
- prefer small, testable functions and explicit domain services
- avoid magic strings for statuses/roles/priority values
- reuse canonical identifiers and enum values
- avoid duplicated business rules across UI components
- validate external/user input at trust boundaries
- keep security decisions server/database-side where applicable

## React
- components render behavior; domain logic belongs in services/hooks/utilities
- handle loading, empty, error, and permission-denied states
- keep touch targets and keyboard access usable
- lazy-load heavy 3D/QR modules where practical

## Navigation
- no route calculation in visual-only 2D/3D components
- route rendering consumes a canonical node/path result

## Supabase/database
- use migrations for schema changes
- RLS is part of the feature, not an afterthought
- avoid service-role access from the client

## Errors
- fail clearly with user-safe messages
- do not expose secrets, SQL, tokens, or sensitive internal details in user-facing errors

## Comments/documentation
Document why a non-obvious safety/privacy/architecture constraint exists, not obvious syntax.
