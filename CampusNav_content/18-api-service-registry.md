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
- service mapping

Expected operations:
- `searchFacilities(query, filters?)`
- `getFacilityById(facilityId)`
- `getFacilityStatus(facilityId, dateTime)`
- `getFacilitiesByService(serviceIdOrQuery)`

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
