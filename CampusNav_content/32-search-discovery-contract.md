# CampusNav AI — Search and Discovery Contract

## Goal
Users should be able to search by **place, room, service, person, event, or official information** without already knowing the exact destination.

## Searchable domains
- facilities/offices/laboratories
- classrooms/room numbers
- services (for example school records or guidance concern)
- approved personnel/public availability
- events
- announcements where appropriate

## Search behavior
- case-insensitive matching
- exact and prefix matches rank above loose aliases
- support approved aliases such as “Virtual Lab” → “Virtual Laboratory”
- group results by domain
- never blend a schedule/personnel result into a facility result without labeling the type
- clicking a navigable facility/personnel assignment may launch normal CampusNav navigation

## Filters
Where useful:
- floor
- department
- facility type
- service
- open/status only when verified hours/status exist

## Service discovery
Users may search by task rather than location. The `service → facility` mapping must be administrator-managed and verified. CLARA and search must reuse the same mapping.

## No-result behavior
Use a clear `No Verified Result`/`Not Found` state. Do not invent a destination because a query “sounds like” an office.

## Implemented Facilities subset — 15 October 2026

The owner authorized public service discovery and approved service-alias matching only at `/facilities`. `FacilityService` owns the network snapshot and deterministic local matcher; GlobalSearch, DestinationSearch, personnel search, and configured recommendations are not integrated by this slice.

- Normalize case and whitespace only; retain punctuation and accents. Canonical names and existing kind/floor substring searches remain available.
- Group unique canonical facilities by matching domain: Facility matches first, then Service matches. Canonical exact → prefix → substring → existing kind/floor matches retain canonical dataset order inside each tier.
- Service names match exact → prefix → substring; an approved service alias matches only its exact normalized term. Ties use stable service code, then canonical facility order. This is a conservative deterministic grouping policy, not an invented relevance score or configured recommendation order.
- Deduplicate facilities across domains and combine service explanations; a facility's canonical name, ID, Details link, and Navigate identity never become its alias.
- A service/alias result requires an eligible published/effective, approved, non-DEMO parent service and explicit public mapping to a canonical facility. Approval means `VERIFIED` or `SOURCE_ALIGNED` with `ACTIVE` data; provenance is not upgraded. Pending/DEMO records are excluded with honest notices. No inferred relationship is permitted.
- Floor/category filters constrain both domains and the announced count counts unique facilities. A matched service without an eligible mapping produces a safe no-destination notice.
- Offline service discovery is unavailable; loaded dynamic matches are removed, while local canonical search remains. Reconnect, retry, and effectivity/expiry boundaries revalidate. If an uncached backend-client module failed during offline reload, an explicit Reload page action recovers without changing the PWA cache boundary.

Broader unified ranking, partial-alias behavior, and later consumers remain separately gated; see `64`. `recommendation_rank` is not a search score. No fuzzy, typo-correction, semantic, embedding, or AI matching is implemented. The earlier discovery slice excluded recommendations; the later owner authorization below controls that separate presentation.

## Configured service recommendations — 15 October 2026

`DEC-FAC-001` authorizes a separate configured-location section on `/facilities`. It consumes the SAME matched service-code references from the accepted search engine, not another matcher. Only approved public/effective service → explicit eligible mapping → canonical facility chains participate. Public views enforce parent service/profile availability; the composition reuses discovery eligibility and independent provenance checks.

Configured order is ascending `recommendation_rank`, then stable canonical facility ID. A memoized recommendation index is separate from the search index; canonical/service/alias relevance and unique search counts are unchanged. Each service has its own ordered list and configured-location count after the existing floor/category filters. Duplicate facilities collapse within a service, not across independent service lists; conflicting duplicate mappings fail closed. CLOSED/temporary-unavailable status and distance never rerank or remove configured locations.

No mapping means no recommendation. Zero projections show `No configured service locations are available yet.` Offline/loading/failed snapshots produce no dynamic list; canonical search remains usable and reconnect/expiry revalidates. No API-response persistence, extra provider request, institutional seed, inferred relationship, AI score, or routing mutation is introduced. `18` defines the opt-in safe snapshot metadata and pure result-envelope API.

## Privacy
Personnel search exposes only approved public fields and schedule/availability wording permitted by the privacy contract.
