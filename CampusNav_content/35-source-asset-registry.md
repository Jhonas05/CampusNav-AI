# CampusNav AI — Source and Asset Registry

## Authoritative architecture sources
### A. CampusNav AI Final Expanded Architecture Source
- date: 14 September 2026
- role: **latest approved architecture reference**
- governs: 2D/3D shared truth, current phase direction, positioning boundaries, Dashboard, personnel/class schedules, privacy/presence wording, backend roadmap, CLARA boundary, testing, definition of done

### B. CampusNav Project Source Reference
- date: 14 September 2026
- role: **full-system master reference**
- governs: detailed navigation/map requirements, facilities/services, emergency restrictions, Admin CMS, search, reporting, PWA/offline emergency access, database expectations, detailed 3D behavior

## Research/proposal sources
### C. CampusNav thesis proposal
- formal research framing includes the tablet-based title, area of investigation, rationale, beneficiaries, and proposal-level scope
- do not silently rewrite the approved formal title

### D. Proposed-thesis presentation materials
- useful for proposal framing and earlier feature statements
- later architecture sources supersede them for technical implementation where they conflict

## Spatial source rule
The approved emergency/floor-plan material referenced by the master source is the initial physical-layout authority. Exact dimensions not supported by the source are estimates and must remain editable/clearly classified.

## Asset handling
- school imagery/logos: use only approved project assets
- no proprietary font redistribution
- Apple is design inspiration only, not branding/content to copy

## Approved UI/UX reference artifact

| Asset | Identifier | Authority | Allowed use | Prohibited use | Status |
|---|---|---|---|---|---|
| CampusNav Ink all-pages HTML | `CampusNav-Ink-all-pages.html` / supplied alias `CampusNav-Ink-all-pages (1).html`, SHA-256 `C57334D51BB01111162C7FA0999A91124B8BA63162A36E4A3BA98F8A65AD1A82` | Owner-approved visual/UX reference under `DEC-UI-002` | Visual hierarchy, typography direction, spacing, neutral/green/red palette, sharp geometry, technical borders, reusable blueprint motifs, and page-composition cues | Runtime source, bundled scripts, copied inline styles, extracted embedded fonts, institutional data, routing truth, backend/RLS policy, or production evidence | ACCEPTED as reference only |
| St. Clare College seal | `public/branding/scc-logo.jpg`, consumed through `SchoolLogo` | Existing approved project branding asset | Tasteful institutional identification in the global shell, Login, Emergency, and selected institutional surfaces | Repeated decoration, modification that implies a new institutional endorsement, or use as data/routing evidence | ACCEPTED existing asset |
| CampusNav social preview | `public/branding/campusnav-og.png` | Existing owner-directed social-preview asset | Open Graph/Twitter preview for the current CampusNav identity | Replacement by the bundled design artifact or use as application runtime UI | PRESERVED |
| CampusNav favicon | `public/favicon.svg` | Existing application branding asset | Browser/application identity | Institutional-data or routing authority | PRESERVED |

Duplicate filename variants with the same hash represent the same supplied artifact and do not create additional authority. Static controls in the artifact are not evidence that equivalent application behavior exists.

## Source conflict rule
Use `00-agent-entrypoint.md` and `29-decision-log.md`; never choose a source silently when requirements conflict.
