# CampusNav AI — Security and RBAC

## Authentication
- Supabase Auth email/password foundation
- session persistence and sign-out validated live
- auth state centralized through AuthProvider

## Authorization
- React route guards improve UX only.
- PostgreSQL RLS is the real security boundary.
- Frontend publishable/anon key is acceptable only because RLS protects data.
- Never put a service-role key in frontend code.

## Roles
- GUEST
- STUDENT
- PARENT
- FACULTY
- STAFF
- FACILITY_MANAGER
- DEPARTMENT_ADMIN
- SUPER_ADMIN

## Administrative scope
- SUPER_ADMIN: full approved administrative access
- DEPARTMENT_ADMIN: department-scoped access where RLS supports it
- FACILITY_MANAGER: facility-scoped operations when explicitly authorized
- public/normal users: no administrative writes

## Public-data rules
- Public users read only published/effective records allowed by RLS.
- Draft, cancelled, internal, or private records remain protected.
- Detailed staff schedules/notes must be role-scoped.

## Personnel privacy
Do not expose:
- home addresses
- personal contact data not approved for public use
- auth-profile secrets
- private employee notes
- unnecessary schedule details
- live GPS location of staff/faculty

## Presence security
- Schedule does not prove presence.
- Public/student users cannot mark personnel as checked in.
- A user cannot create check-ins for arbitrary personnel unless policy explicitly allows it.
- Check-in actions must be authorized and auditable.

## Input/API security
Implement where appropriate:
- server-side validation
- parameterized/secure queries
- input sanitization
- XSS/CSRF protections appropriate to the stack
- rate limiting for public/server endpoints
- safe error messages

## Secret handling
Never commit or expose:
- `.env.local`
- `.env.phase8a.session`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- test passwords

Frontend-safe variables currently include:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Audit
Audit logs are read-only in Admin UI and record important administrative actions without storing passwords, tokens, secrets, or unnecessary sensitive content.

## CLARA privacy boundary
CLARA may access only the same campus data the requesting user is allowed to see. AI integration must not bypass RLS or role rules.
