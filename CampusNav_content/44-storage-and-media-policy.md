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

## FS-5 starting envelope — 16 October 2026

`DEC-FAC-004` adopts JPEG/PNG/WebP only, maximum 5 MiB per original, initial `SUPER_ADMIN`, canonical facility linkage, private/unapproved defaults and explicit rights/review gates. Local candidate validation additionally bounds images to 4096 pixels per side / 12 million pixels and rejects unsupported embedded metadata/animation. It is preflight only: no server upload, storage acceptance, sanitization or publication is implemented. A successful browser decode or typed rights reference is not trusted approval. No new media environment variable/dependency is introduced.

`77-facility-media-readiness-and-contract.md` is the detailed current readiness, target private-delivery and recoverable-cleanup record. Remote bucket/policy inventory is unverified; Docker/local PostgreSQL is unavailable. The delivery, cleanup and server-security gates have **not passed**, so uploads/publication remain blocked. Do not infer that a private bucket or a short-lived signed URL alone safely enforces current publication eligibility. No schema/bucket/policy/object was changed, no photograph was seeded, and no metadata-removal claim is made.

## Floor-plan references
Uploaded floor-plan imagery may be used as a calibration/reference overlay. The image itself does not automatically become navigable geometry; traced/verified geometry remains explicit data.

## Emergency assets
Offline-cached emergency assets must be approved and versioned/verified. Stale data should expose its verification date where required.

## Copyright/branding
Do not redistribute proprietary fonts or copy Apple branding/product imagery. Use approved school/project assets only.
