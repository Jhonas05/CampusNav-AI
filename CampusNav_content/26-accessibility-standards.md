# CampusNav AI — Accessibility Standards

## UI accessibility
Follow WCAG-oriented principles:
- keyboard navigation
- screen-reader labels
- visible focus indicators
- high contrast
- large tap targets
- responsive text/layout
- ARIA labels where needed
- do not rely on color alone

## Motion accessibility
- provide reduced-motion behavior
- avoid camera transitions that can cause discomfort
- allow easy reset/focus controls

## 2D fallback
2D navigation is not only a performance fallback; it is also an accessibility-friendly alternative to a complex 3D scene.

## Route accessibility
Only offer accessibility-aware routing when infrastructure data is verified.

Do not invent:
- elevators
- ramps
- accessible entrances
- accessible restrooms

If incomplete, display:
`Accessibility information pending verification.`

## Route preference wording
Do not show “Elevator Preferred” unless verified elevator data exists. “Fewer Stairs” may be used only if route metadata actually supports it.

The `DEC-NAV-002` engine supports `AVOID_STAIRS` only as a hard exclusion of verified stair edges and unknown cross-floor connectors. It must not be described as wheelchair-accessible, step-free, elevator-based, or a guarantee that every same-floor segment meets a person's mobility needs. `STEP_FREE` remains BLOCKED pending institutionally verified infrastructure and route data. The Navigate UI exposes only Standard and Avoid Stairs; Step-free / Wheelchair is informational with the exact pending-verification wording.

The mobile preference dialog uses native labelled radio inputs, focus entry/containment, Escape, focus return, 44px or larger label/button targets, safe-area clearance, and no decorative motion. Route success/recalculation is announced politely; failure is an atomic alert with a user-controlled Standard action. Local Chrome keyboard/resize and deterministic checks passed; physical-device, screen-reader, and independent WCAG certification are not claimed.

## Map states
Color can supplement meaning, but blocked/restricted/emergency/current/destination states must also use:
- icons
- patterns
- labels
- shapes
- line styles

## Touch/mobile
Mobile navigation should use large controls and a true bottom-sheet pattern rather than squeezing desktop panels.

## Source basis
- CampusNav Project Source Reference — Accessibility, 2D fallback, verified infrastructure rule
