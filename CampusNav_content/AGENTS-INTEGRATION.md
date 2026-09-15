# CampusNav AI — AGENTS.md Integration

Use the following as the **minimal bridge** from the repository's `AGENTS.md` to this documentation pack.

```md
## CampusNav project context
Before planning or modifying CampusNav code, read:
`CampusNav_content/00-agent-entrypoint.md`

Treat that file as the documentation gateway. Follow its baseline read list and task-specific read map before editing.

Non-negotiable: preserve the single campus spatial/source-of-truth model and single routing engine; do not invent official campus facts; do not weaken emergency/privacy/RBAC rules; do not treat schedules as physical presence; and do not mark planned features implemented without code/test verification.

When requirements conflict, follow the conflict protocol in `CampusNav_content/00-agent-entrypoint.md` and record unresolved decisions instead of silently choosing.
```

## Recommended repository placement
Keep this documentation folder at the repository root as:

```text
CampusNav AI/
├── AGENTS.md
├── CampusNav_content/
│   ├── 00-agent-entrypoint.md
│   ├── 00-context-index.md
│   └── ...
├── src/
├── scripts/
└── ...
```

The `AGENTS.md` should not duplicate the whole architecture. It should point here so one maintained source governs future agents.
