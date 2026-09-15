# CampusNav AI — Testing and Deployment

## Required regression areas
- Auth / RBAC / RLS
- Dashboard
- Admin CMS
- Realtime
- same-floor A*
- multi-floor A*
- wall/construction restrictions
- route preference behavior where implemented
- 2D map
- 3D map / WebGL fallback
- QR positioning + invalid QR handling
- Emergency approved-edge-only routing
- safe no-route emergency state
- facility status calculation / schedule exceptions when available
- academic/personnel schedule engine
- schedule-vs-presence wording
- CLARA tool grounding when CLARA is added
- responsive mobile/tablet/desktop layouts

## Source-critical checks
### Navigation
- 2D and 3D show the same route
- no direct wall crossing
- only source-aligned stairs connect floors
- blocked/restricted/construction edges are avoided

### Emergency
- no fallback to normal graph
- no invented route if no approved emergency path exists
- safe posted-signage guidance is shown

### Personnel
- schedule alone never produces `CHECKED_IN`
- authorized check-in can produce `CHECKED_IN`
- role visibility is enforced

### Dashboard
- audience targeting
- priority ordering
- expiry/lifecycle handling
- duplicate prevention
- Realtime update behavior

## Live-cloud validation already established
- Supabase Auth login/session/logout
- SUPER_ADMIN role lookup
- public reads
- anonymous write rejection
- authenticated RLS
- Realtime subscriptions
- Admin content CRUD
- class/personnel Realtime transitions
- schedule vs check-in distinction
- next-availability logic

## Test-data rule
Live tests may use only clearly marked DEVELOPMENT/DEMO fixtures and must remove them afterward.

## Git workflow
- keep repo private during thesis development
- do not commit environment secrets
- commit verified phase checkpoints
- push to GitHub main
- Cloudflare auto-deploys from GitHub

## Cloudflare
Production URL:
`https://campusnav-ai.jhonasangelocanotal-scc.workers.dev/`

Deployment:
- build: `npm run build`
- deploy: `npx wrangler deploy --config wrangler.jsonc`
- static assets directory: `dist`
- SPA fallback enabled

Build variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Supabase production auth
Production Site URL / redirect configuration must include the Cloudflare production domain while preserving localhost development URLs.

## Social preview
Open Graph metadata must be in raw `index.html` and OG image must be a public static asset, not a React-only runtime tag.

See `28-definition-of-done.md` for final acceptance criteria.
