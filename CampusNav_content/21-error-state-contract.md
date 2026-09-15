# CampusNav AI — Error and Empty-State Contract

## Purpose
CampusNav should fail safely and truthfully instead of filling missing information with fake content.

## Navigation
- `No verified route available.`
- `Destination is temporarily unavailable.`
- `Current location is required. Scan a QR checkpoint or choose your location.`
- `This route is blocked. Recalculating…` (only when recalculation is actually occurring)

## Emergency
- `No verified digital evacuation route is available from this location. Follow the posted evacuation signage and instructions from emergency personnel.`

Never replace this with a guessed normal route.

## Facility
- `Facility not found.`
- `Operating hours unavailable.`
- `Accessibility information pending verification.`
- `Facility information is temporarily unavailable.`

## Personnel / schedule
- `Schedule information unavailable.`
- `No active schedule available.`
- `Personnel availability information is not available.`

Do not substitute “available” or “present” when data is missing.

## Dashboard/content
- `No priority alerts.`
- `No current facility advisories.`
- `No upcoming events.`
- `No official announcement available.`

## QR / camera
- `Camera permission required.`
- `QR checkpoint not recognized.`
- offer manual current-location fallback

## 3D
- `3D view unavailable; switched to 2D.`
- preserve route/current location/destination when falling back

## Network
- `Campus data temporarily unavailable.`
- `Offline Mode` when appropriate and offline cache exists

## CLARA
If verified data cannot answer the request:
- explain that verified information was not found
- direct user to the appropriate official office when known
- do not hallucinate

## Error presentation
- sanitize backend errors
- show actionable retry/fallback where possible
- log technical details only where safe
- never show service-role secrets, SQL details, tokens, or sensitive stack traces to normal users

## Source basis
- CampusNav Project Source Reference — professional empty/error states
- current UI registry — known empty/loading/error vocabulary
