# CampusNav AI — Coding Agent Operating Contract

## Purpose
Prevent autonomous coding agents from causing architectural drift while still allowing productive implementation.

## The agent may
- implement requirements already supported by the relevant contracts
- refactor locally when behavior/source truth remains equivalent
- add tests, validation, error states, accessibility, and documentation required by an existing contract
- propose a decision when a requirement is unresolved

## The agent may not silently
- change thesis scope/title
- create new roles or permissions
- replace A* with a second routing architecture
- create independent 3D coordinates
- weaken emergency restrictions
- treat schedule as presence
- expose private staff data
- invent unverified school facts
- migrate proven spatial data merely for architectural neatness
- add a third-party dependency/service without documenting why

## Before implementation
State internally/within work notes:
- affected module
- source documents/contracts
- data/security impact
- acceptance tests
- whether core or optional

## After implementation
Update only what is true:
- `63-implementation-status-registry.md`
- `CHANGELOG.md`
- related contract if behavior legitimately changed
- `29-decision-log.md` only for a real approved decision

## Unknowns
When required information is missing, prefer a clear TODO/decision backlog item over a guessed institutional fact.
