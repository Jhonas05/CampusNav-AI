# CampusNav AI — Security Threat Model

## Primary assets
- user accounts/sessions
- roles and authorization
- staff/personnel schedule data
- official announcements/suspensions
- emergency data
- map/admin records
- provider secrets

## Key threats and controls
| Threat | Required control |
|---|---|
| Client claims admin role | database/server authorization + RLS |
| Leaked provider/service key | server-only secrets, no client bundle/log exposure |
| Unauthorized schedule/staff access | role-scoped queries and minimal public fields |
| XSS/unsafe content | input validation/safe rendering/sanitization where HTML is allowed |
| IDOR/direct record access | RLS/authorization by entity/role |
| Malicious map/emergency edit | restricted roles, audit/approval/version checks |
| AI prompt asks for hidden/private data | CLARA tools enforce the same authorization/privacy rules |
| QR contains invalid/malicious payload | strict parser/whitelist mapping to known checkpoint IDs |
| Stale session retains admin UI | session lifecycle and permission refresh |

## Safety-critical consequence
Security failures in emergency/map/suspension data can become safety or institutional-trust problems, so these domains require stricter review than ordinary UI content.
