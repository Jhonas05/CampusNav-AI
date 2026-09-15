# CampusNav AI — System Rules

These rules are non-negotiable unless the project owner explicitly changes them.

## Navigation
- Use the existing A* pathfinding engine.
- Do not create a separate 2D, 3D, QR, personnel, or CLARA routing engine.
- Routes must follow valid graph nodes/edges and never pass through walls.
- Multi-floor routes must use source-aligned stair transitions.
- Under-construction, blocked, restricted, or non-navigable areas must not be traversed.

## Indoor positioning
- Core thesis positioning: QR checkpoint or manual location selection.
- Do not claim GPS-level indoor precision.
- Outdoor GPS may be added later as an optional enhancement.
- BLE indoor positioning remains optional/future hardware work.

## Emergency
- Emergency routing must use emergency-approved edges only.
- Never fall back to normal A* edges for evacuation.
- If no approved route exists, show the safe fallback message and posted-signage guidance.
- Do not invent exits, stairs, fire equipment, or emergency paths.

## Personnel and schedules
- **Schedule does not prove physical presence.**
- `SCHEDULED` / `IN_CLASS` / `CONSULTATION` describe approved schedule data only.
- Only an active authorized check-in may produce `CHECKED_IN` / “Currently checked in”.
- Never say “physically present”, “inside the room”, or “here now” from a schedule alone.

## Personnel status precedence
`UNAVAILABLE > CHECKED_IN > IN_CLASS > CONSULTATION > SCHEDULED > NO_ACTIVE_SCHEDULE`

## Data provenance
- Official/current data must come from approved school data or authorized admin input.
- Demo/development data must be clearly labeled and removed after live tests.
- Unknown information should remain unavailable rather than fabricated.

## AI / CLARA
- CLARA is the conversational layer, not the source of truth.
- CLARA must call internal CampusNav services/tools for facts.
- Groq API key must never be exposed in Vite/browser code.
- Future Groq calls must be server-side/edge only.
