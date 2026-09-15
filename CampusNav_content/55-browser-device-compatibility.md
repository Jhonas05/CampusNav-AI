# CampusNav AI — Browser and Device Compatibility

## Product direction
The current architecture is responsive web-based even though the formal proposal uses tablet-based wording.

## Supported experience targets
- smartphones
- tablets
- laptops/desktops
- large information displays where appropriate

## 3D behavior
- full interactive 3D where WebGL/device performance supports it
- automatic or user-selectable 2D fallback for low-powered/unsupported environments
- preserve route/current-location state across mode switching

## QR/camera
Camera permission failure or unavailable camera must not block navigation; manual current-location selection remains the fallback.

## Accessibility
Keyboard, screen-reader semantics, focus visibility, touch target size, and reduced motion must remain usable across responsive layouts.

## Compatibility claims
Do not claim a browser/device is supported until the actual current build has been tested there. Record concrete QA results in release/testing notes rather than inventing a browser matrix.
