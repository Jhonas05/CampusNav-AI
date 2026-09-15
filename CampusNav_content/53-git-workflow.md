# CampusNav AI — Git Workflow

## Principles
- keep `main` deployable according to the project's current deployment model
- make focused commits with descriptive messages
- do not mix unrelated large refactors with safety-critical map/emergency changes
- never commit secrets or production credentials

## Before pushing
- inspect `git status`
- review the diff, especially generated files/migrations
- run task-appropriate tests/build/lint checks
- ensure documentation changed when architecture/status changed

## High-risk changes
Map graph, RLS, auth, emergency logic, and schedule-presence behavior deserve isolated review/testing.

## Migration commits
Schema migration and dependent code should be coordinated so another developer/agent can reproduce the state.

## Agent rule
Do not force-reset/discard local work merely to obtain a clean tree unless explicitly authorized. Preserve unrelated user changes.
