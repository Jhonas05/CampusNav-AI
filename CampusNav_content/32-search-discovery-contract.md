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

## Privacy
Personnel search exposes only approved public fields and schedule/availability wording permitted by the privacy contract.
