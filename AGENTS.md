# AGENTS.md

## Project context

CampusNav AI is a user-owned React application for campus navigation and school information. Keep changes focused on the user's request and preserve established project conventions.

Before planning or modifying CampusNav, read `CampusNav_content/00-agent-entrypoint.md` first and follow its baseline reading order and task-specific document map. Treat `CampusNav_content/` as the canonical project specification. Do not invent requirements absent from that documentation, and do not modify canonical documentation unless the task explicitly requires a documentation update. Existing code does not override documented business, privacy, or safety rules. Unknown institutional data must remain unavailable or pending verification.

After the canonical entrypoint, use `README.md` for local setup and build commands.

## Key files

- `src/`: application source.
- `src/components/`: reusable interface and map components.
- `vite.config.js`: Vite configuration.
- `index.html`: application metadata and entry point.

## Development notes

- Use `npm run dev` for local development.
- Preserve the `@/*` source alias and existing Vite/React conventions.
- Keep runtime integrations provider-neutral and document any required environment variables.
- Never commit credentials, tokens, or generated build output.
- Before handing off changes, run the smallest relevant validation (`npm run build`, `npm run lint`, or targeted checks).

## Mandatory Git lifecycle

Follow `CampusNav_content/53-git-workflow.md` for every authorized repository-changing task, including documentation. Use a dedicated `feat/`, `fix/`, `docs/`, `refactor/`, or `test/` branch from clean, fetched, synchronized `main`; never implement directly on `main`. Default to the existing authoritative workspace, not another worktree; use isolation only when genuinely necessary.

After required verification, stage exact intended paths individually (never `git add .`), inspect the complete staged patch and cached whitespace check, commit, verify a clean feature branch, fetch/check for unexpected advancement, fast-forward only onto authoritative `main`, rerun required post-merge checks, push, and confirm clean `HEAD == origin/main`. This owner-authorized completion is automatic unless the task restricts it; required PR review/protection and failed gates must never be bypassed.

Then safely delete only the completed local task branch with `git branch -d`. If a temporary task worktree was necessary, first prove it is fully merged/pushed, clean, disposable including ignored/untracked files, and unused; stop only task-owned processes, remove it from the separate authoritative workspace with `git worktree remove` (no force), prune, and verify. Preserve original/mixed/dirty/reference/recovery worktrees, unrelated branches, unique work, and protected stashes. Legacy cleanup needs separate audit/authorization. Report unsafe cleanup without discarding work; finish on clean synchronized `main` whenever safe. Read-only requests remain read-only.
