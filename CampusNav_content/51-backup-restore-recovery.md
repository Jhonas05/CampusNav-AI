# CampusNav AI — Backup, Restore, and Recovery Policy

## What must be recoverable
- version-controlled application code/docs
- database schema/migrations
- authoritative admin-managed records
- map/spatial source files and versions
- approved emergency data/assets

## Principles
- database schema must be reproducible from migrations
- important content should not exist only in an administrator's browser/local state
- map changes should have version/change history where implemented
- backups do not replace audit logs, and audit logs do not replace backups

## Recovery checks
A recovery plan should verify:
- authentication/RLS still works
- map/facility IDs remain stable
- QR checkpoints still resolve
- schedules/personnel links remain valid
- emergency data/version is restored correctly

## Hosting/provider note
Actual automated backup schedules/retention depend on the selected Supabase/hosting plan and institutional policy. The provided sources do not define a mandatory numeric retention period; document the real provider settings once chosen.
