# CampusNav AI — Data Model Summary

## 1. Stable spatial/navigation domain
The proven navigation source remains local/version-controlled unless a later migration is explicitly approved:
- buildings / floors
- facilities
- facility geometry
- map nodes
- map edges
- stairs / floor transitions
- route restrictions
- QR checkpoints
- emergency exits/equipment/routes
- map verification/version metadata where implemented

**Stable facility IDs and node IDs must remain compatible across navigation, schedules, Dashboard, Admin, and future CLARA.**

## 2. Supabase identity / RBAC
- `profiles`
- `roles`
- `user_roles`
- `departments`
- audience-related records

Roles:
- GUEST
- STUDENT
- PARENT
- FACULTY
- STAFF
- FACILITY_MANAGER
- DEPARTMENT_ADMIN
- SUPER_ADMIN

## 3. Dashboard/content domain
- `announcements`
- `notifications`
- `facility_advisories`
- `events`
- audience/target link tables
- `audit_logs`
- `dashboard_refresh_events` where used by the current implementation

## 4. Academic/personnel domain
- `personnel`
- `courses`
- `academic_sections`
- `class_schedules`
- `schedule_exceptions`
- `personnel_facility_assignments`
- `personnel_consultation_hours`
- `personnel_checkins`
- `personnel_availability_overrides`
- private `personnel_auth_links`

## 5. Phase 4 facility operational overlay
Phase 4 adds a Supabase-backed **operational overlay** keyed by the stable facility IDs in the local/version-controlled spatial source. The overlay may contain:
- facility operational profiles for descriptions, authorized department/public-contact metadata, lifecycle, and provenance
- services and approved service aliases
- facility-service mappings
- facility operating hours
- facility schedule/hour exceptions
- facility media metadata
- existing facility advisories for temporary closures, maintenance, restricted access, and service interruption

The overlay must not store competing facility geometry, floor truth, map nodes/edges, QR relationships, or routing data. It must not create a second facility identity namespace. A facility operational record without authorized content may be absent or remain pending; unknown values are not filled merely to create a complete-looking row.

FS-1 establishes operational profiles, services, mappings, lifecycle/provenance, RLS, audit, and provider-neutral service contracts. Hours/exceptions, Admin UI, public UI, media storage, and Dashboard/Realtime integration follow in later Phase 4 subphases.

No Phase 4 migration may seed official institutional facility records. Synthetic `DEVELOPMENT` or visibly labeled `DEMO` fixtures are permitted only for isolated implementation/testing and must be removable.

Source architecture also expects or allows outside the initial overlay:
- notification preferences
- saved locations / navigation preferences
- emergency contacts
- campus reports
- CLARA knowledge sources / privacy-limited conversation logs

Do not create duplicate tables merely to satisfy a UI. Compute current availability/status from authoritative records where practical.

## 6. Schedule service functions
- `getTodaysClasses`
- `getRoomSchedule`
- `getCurrentClass`
- `getUpcomingClasses`
- `getProfessorClasses`
- `getSectionSchedule`

## 7. Personnel service functions
- `searchPersonnel`
- `getPersonnelById`
- `getPersonnelCurrentStatus`
- `getPersonnelSchedule`
- `getPersonnelNextAvailability`
- `getFacilityPersonnel`
- `getPersonnelAvailability`

## 8. Schedule exceptions
Supported concepts include:
- CANCELLED
- RESCHEDULED
- ROOM_CHANGED
- PROFESSOR_CHANGED
- TIME_CHANGED

## 9. Presence
Assignments and schedules produce schedule-based statuses only. An authorized active check-in is the only approved source for confirmed `CHECKED_IN` state.

See `19-supabase-schema-registry.md` for developer-level registry and `20-data-provenance-verification.md` for truth states.
