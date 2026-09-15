# CampusNav AI — Deployment Topology and Runbook

## Current documented topology
```text
GitHub main
   ↓
Cloudflare build/deploy
   ↓
Vite production build (`dist/`)
   ↓
Cloudflare Workers Static Assets / workers.dev

Browser
   ↔ Supabase Auth/PostgreSQL/RLS/Realtime

Future CLARA
Browser → controlled server/edge endpoint → AI provider + CampusNav internal services
```

## Deployment checklist
- dependencies install from lockfile
- production build succeeds
- required public configuration exists
- secrets are configured only in secure provider environment
- migrations are applied in the correct environment
- smoke-test auth/public navigation
- smoke-test key routes and Dashboard
- verify 3D and 2D fallback
- verify no demo/secret leakage

## Database deployment
Schema changes should be migration-driven and reviewed for RLS impact.

## Rollback
Before a risky release identify whether rollback requires:
- code only
- database migration reversal/backfill
- map data rollback
- configuration rollback

Never assume a frontend rollback automatically reverses database changes.
