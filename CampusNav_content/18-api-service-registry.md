# CampusNav AI — Internal API / Service Registry

## Purpose
Prevents duplicate business logic. UI and future CLARA should call shared services instead of implementing direct data logic in components.

Names below are the **preferred/known contracts**. Match the actual codebase before adding new functions.

## NavigationService
Responsibilities:
- normal A* route generation
- same-floor and multi-floor routing
- blocked/restricted edge handling

Expected operations:
- `findRoute(currentLocation, destination, options?)`
- route validation / recalculation helpers already present in the project

## FacilityService
Responsibilities:
- search facilities/rooms
- facility detail
- facility status/hours
- service catalog, approved aliases, and facility mappings
- provenance/lifecycle normalization
- local pending-state fallback when the operational provider is absent

Expected operations:
- `searchFacilities(query, filters?)`
- `getFacilityById(facilityId)`
- `getFacilityStatus(facilityId, dateTime)`
- `getFacilitiesByService(serviceIdOrQuery)`
- `getServices(filters?)`
- `getFacilityHours(facilityId, dateRange?)`

`getFacilityHours` is an FS-2B source-record read, not the FS-2C status engine. Its optional range is `null`/omitted or exactly `{ startDate, endDate }`, with inclusive strict `YYYY-MM-DD` campus dates interpreted in `Asia/Manila`. It returns the canonical local facility plus independently provenanced `weeklyHours`, dated `exceptions`, and `TEMPORARY_CLOSURE` `statusAdvisories` through the existing `{ ok, availability, data, error }` envelope. Weekly recurrence rows are not reduced by the date range; exceptions use inclusive dates, and advisories use overlap against half-open Manila day boundaries. Invalid facilities and malformed ranges short-circuit before provider access. Empty sources remain unavailable, provider failures remain sanitized/retryable, and `CONFIGURED` does not imply verified.

FS-2B must not expand weekly occurrences, interpret overnight carry, replace weekly hours with exceptions, apply closure precedence, or compute `OPEN_NOW`, `CLOSED`, `CLOSING_SOON`, `SCHEDULED_TO_OPEN`, `TEMPORARILY_UNAVAILABLE`, `PENDING_VERIFICATION`, or `UNKNOWN`.

`getFacilityStatus(facilityId, dateTime?)` is the FS-2C public orchestration surface. It validates canonical local facility identity first, accepts only an explicit absolute RFC3339 timestamp when `dateTime` is supplied, otherwise uses the service's injected clock, and requests only the previous/current Manila dates through `getFacilityHours`. The pure status evaluator remains the sole implementation of weekly/overnight/exception/closure/verification rules. Successful results use the existing envelope and return canonical facility identity, status, normalized evaluation time, `Asia/Manila`, next transition, independently provenanced controlling records, and demo state. Empty accepted sources produce `UNKNOWN` with `UNAVAILABLE`; configured but non-applicable sources produce `UNKNOWN` with `CONFIGURED`; provider failure remains retryable `PROVIDER_UNAVAILABLE` and is never converted into an operational status. Providers expose no separate status method or query.

Phase 4 rules:
- every result is keyed by an existing canonical local facility ID
- the service combines local spatial identity with the Supabase operational overlay; it does not let the overlay redefine geometry or routing
- structured results preserve verification/data status, lifecycle, effective dates, and demo state so consumers can use accurate wording
- unknown operational data returns explicit unavailable/pending results rather than guessed defaults
- public Facilities, search, Dashboard, Admin adapters, and future CLARA tools reuse this boundary instead of implementing separate matching/status logic
- only configured facility-service mappings may produce a recommendation

## DashboardService
Responsibilities:
- audience-filtered centralized campus information
- priority ordering/lifecycle

Expected operations:
- `getDashboardNotifications(userAudience)`
- section-specific accessors used by current Dashboard provider

## ScheduleService
Known/current operations:
- `getTodaysClasses`
- `getRoomSchedule`
- `getCurrentClass`
- `getUpcomingClasses`
- `getProfessorClasses`
- `getSectionSchedule`

Possible stable alias for CLARA/tool layer:
- `getClassStatus(roomId, dateTime)`

## PersonnelService
Known/current operations:
- `searchPersonnel`
- `getPersonnelById`
- `getPersonnelCurrentStatus`
- `getPersonnelSchedule`
- `getPersonnelNextAvailability`
- `getFacilityPersonnel`
- `getPersonnelAvailability`

## EmergencyService
Responsibilities:
- verified emergency information
- approved-edge emergency route only

Expected operations:
- `getVerifiedEmergencyInformation(floorId?)`
- `findVerifiedEmergencyRoute(currentLocation)`

Must not call normal routing as fallback.

## AuthService / AuthProvider
Responsibilities:
- session/user state
- role lookup
- sign-in/sign-out
- no business-rule authorization bypass

## AdminService modules
Keep CRUD outside page components. Domains may include:
- content/announcements
- events
- facility advisories
- notifications
- schedules/personnel
- emergency data
- map data
- users/roles

## CLARAToolService (future)
Thin authorized wrapper that exposes only safe internal functions to CLARA.

Rules:
- no direct browser database mutation from CLARA
- validate tool arguments
- enforce user authorization
- return structured provenance/status metadata

## Error contract
Service functions should return/throw normalized errors that UI can convert into approved error states. Do not leak raw database details to users.

## Duplication rule
Before adding a service/function:
1. search existing `src/services`, providers, hooks, and utilities
2. reuse if semantically equivalent
3. extend one canonical implementation
4. update this registry if a major public service contract changes

## Source basis
- CampusNav AI Final Expanded Architecture — CLARA internal function examples and schedule/personnel services
- current content folder — known service functions/provider pattern
