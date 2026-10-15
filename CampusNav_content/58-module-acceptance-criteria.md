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

### FS-4 final engineering acceptance — 16 October 2026

`COMPLETE / ACCEPTED_WITH_ADVISORY / OWNER AUTHORIZED` (`DEC-FAC-003`). The requirements above are met at the accepted engineering evidence level: canonical Detail/Directory/Cards, shared eligible service discovery/exact approved aliases, explicit configured recommendations, GlobalSearch Services and Home/Navigate DestinationSearch. Missing media retains the accessible category placeholder; media workflow remains FS-5, not completed here. FS-2 status semantics, public provenance/security, no inferred relationship/location, operational-vs-routing separation, mobile keyboard/focus/touch semantics and network-only/offline degradation remain mandatory and pass retained tests. The exact capability/evidence matrix is in `63` and quality gates in `73`.

This does not waive official institutional coverage, certify physical devices/independent accessibility, implement Personnel GlobalSearch, or complete broader ranking/partial aliases. Their data/advisory/deferred dispositions are explicit in `29`/`30`/`64`; final-system DoD remains incomplete (`28`). No acceptance criterion was removed to force closure.

### FS-5 partial checkpoint — 16 October 2026

`IN_PROGRESS / PARTIALLY VERIFIED`, not accepted complete. Independent local candidate/private-draft validation has deterministic and native-browser evidence (`63`, `77`). Mandatory storage/RLS/authorization/audit, trusted decode/sanitization, rights/review publication, replacement/cleanup, public delivery and populated Admin/gallery gates remain blocked/unimplemented. Existing zero-photo placeholders remain available. Mocked or local input checks do not satisfy these backend acceptance requirements. No criterion above is waived and final-system DoD stays incomplete.

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
