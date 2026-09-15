# CampusNav AI — Agent Entrypoint

This is the **single file an `AGENTS.md` should point to first**. It is the gateway to the rest of the CampusNav documentation. An agent must not assume it needs to read every file for every task; it must read the baseline set below, then the task-specific contracts.

## 1. Before touching code
Always read:
1. `00-context-index.md`
2. `01-project-overview.md`
3. `02-system-rules.md`
4. `29-decision-log.md`
5. `30-known-limitations.md`
6. `63-implementation-status-registry.md`

Then read the task-specific files from the map below.

## 2. Task-specific read map
| Task | Required context |
|---|---|
| 2D/3D map, route, QR | `10`, `11`, `25`, `26`, `46`, `58` |
| Emergency | `12`, `20`, `45`, `59`, `68`, `69` |
| Facilities/services/search | `13`, `18`, `32`, `41`, `42` |
| Class schedules/personnel | `14`, `20`, `42`, `49`, `56`, `68` |
| Dashboard/notifications | `15`, `22`, `47`, `49`, `68` |
| Admin CMS | `05`, `16`, `45`, `48`, `68` |
| Supabase/database | `04`, `05`, `19`, `31`, `42`, `48`, `51` |
| CLARA | `17`, `18`, `20`, `41`, `49`, `59`, `60` |
| UI/frontend | `06`, `07`, `21`, `26`, `40`, `55` |
| Deployment/release | `08`, `25`, `31`, `51`, `52`, `62`, `73` |
| Thesis/defense | `27`, `28`, `30`, `36`, `60`, `69`, `70` |

Numbers refer to the numbered Markdown documents in this folder.

## 3. Non-negotiable behavior
- Preserve **one campus dataset + one routing engine**.
- Never create a second pathfinding truth for 3D, CLARA, QR, or emergency.
- Never invent campus geometry, emergency paths, official schedules, office hours, personnel presence, suspension decisions, or accessibility infrastructure.
- A schedule means **scheduled**, not physically present. `CHECKED_IN` requires authorized evidence.
- Emergency routing uses approved emergency data only and never falls back to normal routes.
- CLARA is a conversational/tool layer over verified CampusNav services, not an independent source of facts.
- Never expose secrets or privileged Supabase/service credentials in browser code.
- Never mark a feature “implemented” because a document describes it. Implementation status must be supported by code/tests and recorded in `63-implementation-status-registry.md`.

## 4. Conflict protocol
Do not silently reconcile conflicts.

For **requirements/design intent**:
1. Explicit owner-approved entries in `29-decision-log.md`
2. CampusNav AI Final Expanded Architecture — 14 Sep 2026
3. CampusNav Project Source Reference — 14 Sep 2026
4. Thesis proposal/presentation materials

For **what actually exists now**:
1. Running code + passing tests/live verification
2. `63-implementation-status-registry.md`
3. `09-progress-roadmap.md`

If code and requirements disagree, treat it as implementation drift—not permission to rewrite the requirement. Record the conflict before a structural change.

## 5. Change protocol
Before a substantial change:
- identify affected contracts
- identify database/security/privacy implications
- identify tests and acceptance criteria
- check whether the feature is thesis-core or optional

After a substantial change:
- update implementation status if objectively verified
- update `CHANGELOG.md`
- update `29-decision-log.md` only when a real architectural/product decision changed
- update any contract made inaccurate by the change
- do not change thesis title/scope claims silently

## 6. Definition of safe handoff
A coding agent may consider a task ready to hand back only when:
- the implementation follows the relevant contracts
- required tests/checks pass or failures are explicitly reported
- no source-of-truth duplication was introduced
- no unverified data was presented as official/live
- documentation drift caused by the task has been corrected
