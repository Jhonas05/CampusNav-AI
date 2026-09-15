# CampusNav AI — UI/UX Guidelines

## Visual direction
- modern, user-friendly, branded, thesis-ready
- clean system-font feel
- generous spacing and clear hierarchy
- avoid generic LMS/admin-template appearance
- map/navigation remains the visual centerpiece

## Branding
- use St. Clare College logo tastefully in navbar/login/home/admin shell where appropriate
- support office/lab/classroom/facility photos and galleries
- use polished placeholders when an image is unavailable

## Color decision
The original 14 Sep master source specified a strict black/white/grayscale interface. The current working content/UI registry intentionally allows **controlled map category colors for readability**, while keeping the surrounding application calm and restrained.

Treat this as a **current project UI override**, not permission to make the whole app colorful. See `29-decision-log.md` (`DEC-UI-001`). If the thesis owner/adviser later requires strict grayscale, update the decision log and both UI documents together.

Even when colors are used:
- never rely on color alone
- restricted/construction/emergency states need icon/pattern/text treatment
- contrast and accessibility must remain strong

## Navigation UI
Must support:
- current location
- destination search
- floor selector
- Scan QR
- Start Navigation
- 2D / 3D switch
- Navigate / Emergency Mode switch
- route summary
- step-by-step directions

## 3D labels
- full building: floor labels only
- selected floor: major facility labels
- close zoom: room labels
- avoid floating-label clutter

## Dashboard
Primary centralized information surface for:
- priority alerts
- today’s classes
- office availability
- personnel availability
- facility advisories
- events
- announcements
- navigation notices

## Personnel wording
Visually distinguish:
- Scheduled
- In Class (Scheduled)
- Consultation
- Checked In
- Unavailable
- No Active Schedule

Never visually imply physical presence from schedule data alone.

## Motion
- use subtle route/camera/floor transitions
- support reduced motion
- avoid game-like or excessive animation

## Responsive behavior
Design for desktop, laptop, tablet, and mobile. Mobile map/navigation should use a true bottom-sheet experience rather than a shrunken desktop layout.

## 2D fallback
If WebGL fails or device performance is insufficient, the user must still be able to navigate in 2D with the same current location, destination, and route state.
