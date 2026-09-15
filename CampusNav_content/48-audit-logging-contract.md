# CampusNav AI — Audit Logging Contract

## Why audit logs matter
CampusNav contains administrative, schedule, role, map, and emergency data whose changes should be attributable.

## Minimum important actions to log
- role/permission changes
- official announcement publication/update
- suspension status changes
- facility/hours/advisory changes
- personnel assignment/availability changes
- class/schedule changes where admin-managed
- map/node/edge/QR changes
- emergency record changes
- security-sensitive configuration changes where appropriate

## Suggested audit fields
- actor/user ID
- action/type
- affected entity type/ID
- timestamp
- safe summary of before/after or change metadata
- source/context if useful

## Privacy/security
- do not store passwords, tokens, or unnecessary sensitive content in logs
- audit logs must not be editable by ordinary users
- access to detailed logs should be role restricted

## AI/CLARA
If CLARA tool calls are logged for improvement/security, minimize retained sensitive conversation content and keep tool/action auditing distinct from private chat text.
