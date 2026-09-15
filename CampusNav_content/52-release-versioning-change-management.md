# CampusNav AI — Release, Versioning, and Change Management

## Release principle
A deployed build is not “done” merely because it compiles. It must satisfy relevant quality gates and preserve thesis-critical rules.

## Suggested release labels
Use a consistent repository convention (for example semantic versioning or dated thesis milestones). Preserve the repository's existing practice if already established.

## Every meaningful release should identify
- features/fixes included
- migrations required
- configuration changes
- known limitations
- rollback concern
- documentation updated

## Breaking changes
Require explicit handling for:
- canonical IDs
- database/RLS changes
- route/spatial model changes
- QR payload format
- public API contracts
- role permissions

## Documentation
`CHANGELOG.md` should summarize actual changes. `29-decision-log.md` records decisions, not every commit.
