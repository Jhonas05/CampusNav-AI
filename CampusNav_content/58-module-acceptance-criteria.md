# CampusNav AI — Module Acceptance Criteria

## Navigation
- valid same-floor and multi-floor routes follow graph edges
- no wall crossings
- blocked/construction restrictions are respected
- 2D and 3D show the same canonical path

## QR/manual positioning
- valid checkpoint resolves to the correct node/location
- invalid QR fails safely
- manual fallback works without camera permission

## 3D
- floor isolation/focus works
- current/destination/path render from shared state
- WebGL failure has a usable 2D fallback

## Emergency
- only approved emergency data is used
- normal graph is never used as emergency fallback
- safe no-route message appears when required

## Facilities/search
- verified facility/service results are findable
- unverified hours/status are not guessed
- operational records reference existing canonical facility IDs and do not duplicate spatial/routing truth
- only configured service mappings produce recommendations
- weekly, overnight, dated-exception, temporary-closure, service-interruption, closing-soon, scheduled-to-open, closed, and unknown cases follow `13-facility-service-model.md`
- operational `CLOSED` does not become a routing restriction unless canonical navigation data separately blocks the route
- public results preserve provenance and visibly label `DEMO` data
- missing media has an accessible placeholder; unpublished or unauthorized media is not publicly exposed

## Schedules/personnel
- exceptions and status precedence work
- schedule wording does not claim presence
- check-in is the only source of `CHECKED_IN`

## Dashboard
- audience/priority/lifecycle rules are respected
- expired/cancelled information does not appear as active

## Admin/RBAC
- unauthorized writes fail even if UI gating is bypassed
- important changes create expected audit activity
- permitted facility/service writes remain scope-limited and lifecycle/provenance validated

## CLARA
- tools/services provide the facts
- unavailable facts produce a verified-unavailable response, not a hallucination
