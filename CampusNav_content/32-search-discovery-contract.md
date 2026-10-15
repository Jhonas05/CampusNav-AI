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

Broader unified ranking, partial-alias behavior, configured recommendations, and later consumers remain separately gated; see `64`. `recommendation_rank` is not a search score. No fuzzy, typo-correction, semantic, embedding, or AI matching is implemented.

## Privacy
Personnel search exposes only approved public fields and schedule/availability wording permitted by the privacy contract.
