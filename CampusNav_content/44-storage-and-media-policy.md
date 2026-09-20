# CampusNav AI — Storage and Media Policy

## Potential stored assets
- facility images
- event/announcement attachments
- floor-plan reference images for admin calibration
- approved emergency-plan assets

## Rules
- only authorized roles may upload/manage institutional assets
- validate file type/size before storage
- use safe generated object names; do not trust raw filenames as identifiers
- do not expose private storage buckets publicly by accident
- sanitize or safely render user-supplied filenames/metadata

## Phase 4 facility-media lifecycle
- facility media references an existing canonical facility ID and cannot define facility/spatial truth
- metadata preserves provenance, verification/data status, lifecycle, ordering, useful alternative text, and the authorized uploader where appropriate
- draft/unapproved objects remain unavailable to public clients; only explicitly published/effective media may be served publicly
- replacement, archival, and removal must avoid orphaned public references and must create required trusted audit activity
- an explicit MIME allow-list, maximum size, delivery model, and object-cleanup procedure must pass the later FS-5 Definition of Ready before uploads are implemented
- no official photograph is seeded without authorization and usage rights; missing media retains an accessible placeholder and never blocks navigation

## Floor-plan references
Uploaded floor-plan imagery may be used as a calibration/reference overlay. The image itself does not automatically become navigable geometry; traced/verified geometry remains explicit data.

## Emergency assets
Offline-cached emergency assets must be approved and versioned/verified. Stale data should expose its verification date where required.

## Copyright/branding
Do not redistribute proprietary fonts or copy Apple branding/product imagery. Use approved school/project assets only.
