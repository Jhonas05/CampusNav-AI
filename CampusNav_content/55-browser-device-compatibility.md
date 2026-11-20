# CampusNav AI — Browser and Device Compatibility

## Media capability gates

Camera guidance needs a secure context, native modal support, a working video input and browser permission. Recognition additionally needs a browser that explicitly reports local recognition available for the requested language. Synthesis needs an available local voice. Unsupported cases retain text or 2D. Chromium with synthetic media supplies browser-only evidence. Representative Android/iOS, actual language packs, playback and assistive technologies remain open under [73](73-quality-gates-release-checklist.md).

## Product direction
The current architecture is responsive web-based even though the formal proposal uses tablet-based wording.

## Supported experience targets
- smartphones
- tablets
- laptops/desktops
- large information displays where appropriate

## Responsive acceptance targets
- `1366×768` and `1280×800` are the primary laptop-density review sizes.
- `1440×900` verifies the normal laptop/desktop expansion case.
- `1024×768` verifies compact-laptop behavior.
- `768px` and approximately `390px` verify tablet and mobile reflow.
- `1600px+` may add breathing room but should not stretch long-form prose or abandon useful application density.

Code-level responsive behavior and automated route rendering are necessary evidence, but they are not graphical device certification. Record `MANUAL DEVICE QA PENDING` whenever screenshots or real graphical/browser/device sessions at these sizes were not available.

## 3D behavior
- full interactive 3D where WebGL/device performance supports it
- automatic or user-selectable 2D fallback for low-powered/unsupported environments
- preserve route/current-location state across mode switching

## QR/camera
Camera permission failure or unavailable camera must not block navigation; manual current-location selection remains the fallback.

## PWA/offline evidence
The current production build has local Chrome evidence for manifest installability prerequisites, root service-worker control, supported offline SPA/deep links, offline canonical 2D routing, optional 3D cache-on-use, and safe offline Emergency/Admin boundaries. This is not physical-device or broad-browser certification. Android installation, iPhone/iPad Add to Home Screen and standalone behavior, Safari, Firefox, Edge-specific behavior, physical QR/camera behavior, low-end-device resource use, and storage eviction remain pending until directly tested.

## Accessibility
Keyboard, screen-reader semantics, focus visibility, touch target size, and reduced motion must remain usable across responsive layouts.

## Compatibility claims
Do not claim a browser/device is supported until the actual current build has been tested there. Record concrete QA results in release/testing notes rather than inventing a browser matrix.
