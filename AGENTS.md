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
