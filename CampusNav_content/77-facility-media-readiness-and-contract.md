# CampusNav AI — Facility Media Readiness and Contract

## Status and authority — 16 October 2026

**FS-5: `IN_PROGRESS / PARTIALLY VERIFIED`.** The owner authorizes sequential FS-5 engineering, not remote database/storage writes or institutional publication. `DEC-FAC-004` adopts the technical starting envelope. This record distinguishes completed independent groundwork from blocked upload/publication work; it does not weaken `44`, `48`, `58`, `68`, or `72`.

Verified baseline: clean synchronized main `accfd69f983fc262384e3e36abc24f72d9b29a91`; task branch `feat/fs5-facility-media-management` in the authoritative worktree. FS-1 through FS-4 remain accepted. FS-6 and FS-7 remain `NOT_STARTED`.

## Existing implementation inventory

- `src/data/facilities.js`: 95 stable canonical identities; no competing media identity/spatial source is permitted.
- `src/services/facilityService.js` and `src/providers/facility/`: accepted public profile/service/hours/status/discovery aggregates; no media method or storage query exists.
- `src/services/facilityAdminService.js`, Admin Facilities/editor: accepted `SUPER_ADMIN` profiles, aliases, mappings, hours/exceptions and lifecycle/stale-write conventions; no media upload/CRUD exists.
- `src/components/campus/FacilityPhoto.jsx`: accessible category placeholder, no guessed image request; conditional approved `photoSrc`, lazy/async decode and error fallback. No facility has an approved photograph.
- `src/pages/FacilityDetail.jsx` and `src/components/facilities/FacilityCard.jsx`: existing canonical actions and placeholders; no dynamic media provider/gallery is integrated.
- Version-controlled migrations contain no facility-media metadata table, media bucket, Storage policy or media audit trigger. Existing trusted audit architecture is reusable, not proof of a new media audit implementation.
- `wrangler.jsonc` configures static assets only; no trusted media upload/eligibility/delivery endpoint is present. No Edge Function implementation exists in this repository.
- `src/service-worker.js` caches approved public-static assets and bounded optional scripts, not dynamic media, API/Auth responses or upload data. Branding approval is separate from facility-photograph rights.
- Remote bucket/policy/table/Edge Function inventory is **UNKNOWN**, not empty: the connected Supabase account denied the read-only inventory request; CLI read-only fallback failed because this worktree is not linked. No linking/configuration or alternate-account mutation was attempted.

## Readiness matrix

| Area | Verdict | Available independent work / blocking dependency |
|---|---|---|
| Metadata/data model | `READY_WITH_BOUNDARIES` | Canonical-ID/private-draft input DTO and constraints can be verified locally. Persistent metadata schema, actors, concurrency and public projection still require a verified backend model. |
| Storage architecture | `BLOCKED` | Private storage plus controlled server delivery is a target, not a verified existing boundary. Actual buckets/policies and trusted server configuration are unavailable for verification. |
| Upload pipeline | `BLOCKED` | Local candidate preflight is independently ready; trusted full decode/sanitization, authoritative `SUPER_ADMIN` authorization, immutable object reservation and Storage/RLS execution evidence are missing. |
| Admin media CRUD | `BLOCKED` | Depends on verified mutation/storage/audit boundary. Existing Admin conventions are reusable; a fake successful upload/editor is prohibited. |
| Publication workflow | `BLOCKED` | Requires server-enforced rights/consent/authorized-review evidence and eligibility; upload or a typed reference cannot confer approval. |
| Public facility gallery | `BLOCKED` | No eligible public media provider or verified delivery endpoint. Existing zero-data placeholder/navigation behavior remains available. |
| Image optimization | `READY_WITH_BOUNDARIES` | Byte/pixel bounds and native decoder/resource cleanup can be tested. Compression, derivatives, thumbnails and trusted metadata removal are not implemented. |
| Privacy/security | `READY_WITH_BOUNDARIES` locally; backend `BLOCKED` | Restricted-container checks and draft input allowlisting are testable. They do not prove rights, consent, safe pixels, authorization, server sanitization or RLS. |
| Test infrastructure | `READY_WITH_BOUNDARIES` | Node 22 and local Chrome available. Docker/PostgreSQL/Storage integration unavailable; `test:rls` connection to `127.0.0.1:54322` refused. |
| Production activation | `BLOCKED` | No remote mutation authorization or verified media backend. Only independently verified non-activated groundwork is eligible for Git integration. |

## Requirements, ownership and acceptance mapping

| Requirement / canonical source | Completed or missing capability | Required permissions/data and verification |
|---|---|---|
| Canonical identity (`04`, `13`, `18`, `42`) | Local draft/file validators resolve existing facility IDs; no geometry/status changes | All canonical IDs and invalid/path-like IDs; future database compatibility and immutable facility linkage |
| MIME, size, safe bytes (`44`, `59`, owner envelope) | Local JPEG/PNG/WebP, 5 MiB, signature/container checks and native decode; trusted server validation missing | Spoofing, empty/oversize/malformed/animated files, dimensions, timeout, resource cleanup; repeat independently at server before storage acceptance |
| Metadata/privacy (`20`, `35`, `49`, `68`) | Reject named embedded metadata/unknown containers locally; no sanitization or approval claim | EXIF/XMP/IPTC/comments/ICC/text/animation fixtures; human review of identifiable people/documents/pixels and institutional usage rights |
| Storage names/public boundary (`31`, `44`, `59`) | No production object path, signed URL or external URL is accepted by draft DTO; backend missing | Trusted generated UUID/object reservation, traversal/collision/cross-facility tests, private bucket, draft/raw-object denial and public projection allowlist |
| Authorized lifecycle (`05`, `16`, `45`, `48`) | Private `DRAFT`/pending DTO only; no save/upload/publish/archive API | Server/DB-derived actor and `SUPER_ADMIN`; role bypass, session expiry, stale token, rights/review rejection, trusted audit |
| Replacement/cleanup (`44`, `48`, `51`) | Target process below; no deletion or cleanup job implemented | Immutable replacement identity, previous-version attribution, failed storage/DB transitions, quarantine/reconciliation and exact-target recovery |
| Detail/gallery/cards (`07`, `13`, `26`, `58`) | Existing zero-photo surfaces retained; populated gallery/thumbnails blocked | Eligible delivery, alt/caption, keyboard/touch/Escape/focus, bounded aggregate reads, lazy aspect-ratio rendering, missing-image recovery |
| Performance/offline (`24`, `25`, `55`, `73`) | No runtime integration, provider reads or worker change | Byte-identical build assets, existing placeholder matrix, full safety regressions; future derivative/request/memory/device tests remain required |

## Implemented independent validation contract

`src/services/facilityMediaValidation.js` owns:

- `inspectFacilityMediaBytes(bytes, mimeType)`: structural preflight only, not decoded-pixel proof. JPEG/PNG/WebP only; maximum **5 MiB**; dimensions **1–4096 per side**, maximum **12 million pixels**, before decode. PNG chunk checksums/end/ordering, JPEG segment/scan/end boundaries and WebP RIFF/chunk/frame/padding boundaries are checked. Unsupported embedded metadata, animation and trailing data fail closed.
- `validateFacilityMediaFile(facilityId, file, options?)`: actual Blob bytes plus matching declared MIME, then browser `createImageBitmap`; decoded dimensions must match headers. Five-second timeout; bitmaps close on success/failure/late completion. Decoder injection is for deterministic tests, not an authorization/security assertion. Errors are sanitized and include no filename, bytes, path, token or decoder detail.
- `validateFacilityMediaDraft(input)`: allowlisted canonical facility, required alternative text (240 characters), optional caption (500), display order 0–1,000, source label (160) and opaque source/rights/consent evidence references (160). It rejects actor/role/object path/URL/publication/verified-state/spatial fields, markup/control/bidi injection and inherited/symbol authority. Output is private `DRAFT`, `PENDING_VERIFICATION`; evidence strings remain unverified references. It creates no persistent ID, uploader, approval or timestamp.

Results reuse `{ ok, availability, data, error }`; availability stays `UNAVAILABLE` because no media backend/public asset is configured. File success is explicitly `LOCAL_CANDIDATE_ONLY`. No function uploads, stores, publishes, requests a provider, generates a signed URL, persists a file, or invokes a route/status engine. These modules are not imported by production UI. This is reusable groundwork, not a disabled fake CRUD system.

The candidate profile rejects JPEG APP1–APP15/comments/unknown segments (including ICC), PNG EXIF/text/unknown ancillary chunks and WebP EXIF/XMP/ICC/unknown chunks. It **does not remove metadata**, guarantee safe pixels, detect every possible information-hiding technique or confer institutional approval. Browser canvas encoding can itself emit an ICC profile; tests prove its rejection, then explicitly prepare only synthetic metadata-free fixtures to verify native JPEG/WebP decoding. That external fixture preparation is not shipped as a sanitizer. A future trusted decode/re-encode pipeline still requires review and actual metadata-removal verification.

Format/API references inspected: [W3C PNG](https://www.w3.org/TR/png-3/), [WebP container](https://developers.google.com/speed/webp/docs/riff_container), [native image decoding](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap) and [canvas encoding](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob). These references define formats/APIs, not an institutional-content or server-security approval.

## Target backend design — NOT IMPLEMENTED / NOT RELEASE-READY

Prefer one private Supabase media bucket with no anonymous raw-object read or browser signing permission. Serve only reviewed derivatives through an opaque-media-ID server endpoint which rechecks current publication/effectivity/rights/review eligibility on every request, selects an allowlisted immutable object, and responds with non-cacheable delivery headers. No service secret, private object path or signed credential may reach the browser. A private bucket alone does not establish this boundary.

Do not substitute direct public-bucket URLs: public retrieval bypasses object-read RLS. Do not assume short signed-link expiry provides immediate revocation: token lifetime and CDN cache lifetime are distinct. Current official [bucket access](https://supabase.com/docs/guides/storage/buckets/fundamentals), [private delivery](https://supabase.com/docs/guides/storage/serving/downloads) and [signed-URL CDN](https://supabase.com/docs/guides/storage/cdn/smart-cdn) documentation was inspected. This tradeoff is a design constraint, not deployment evidence or new provider authorization.

Before any schema implementation, verify actual remote inventory and an authorized isolated test backend. Reuse accepted facility profiles/IDs, lifecycle vocabulary and trusted-audit pattern. A prospective metadata row needs stable ID, immutable facility/object references, MIME/bytes/dimensions, alt/caption/order, existing provenance/lifecycle/effectivity, private rights/consent/review references, server-derived actor/approval/publication attribution, stale-write token and archival/replacement linkage. Publish only a minimal eligible projection; private references/actors/object keys stay private. This is a requirements model, **not a created table or migration**.

Originals must not be publicly delivered. Trusted ingestion must fully decode and prepare bounded reviewed derivatives, verify sanitization rather than trusting browser MIME/metadata, and reserve immutable server-generated objects without upsert overwrite. Any server decoder/dependency and secret configuration need the normal security/dependency review. The static host currently provides none of this.

## Target lifecycle and cleanup — NOT IMPLEMENTED

Use existing `DRAFT → explicit reviewed publication → PUBLISHED → EXPIRED/CANCELLED` vocabulary; do not silently add an incompatible `ARCHIVED` enum. Archival/replacement attribution may be separate metadata after backend design review. Uploading and entering rights evidence are not verification or publication.

Reserve private immutable object/version identity, validate trusted content, then finalize private metadata with trusted audit. Publication is a separate authorized transaction after rights/consent/review checks. Replacement creates a new private version for the **same immutable facility**, validates it independently, and switches eligible metadata only after readiness; old versions become unavailable through the delivery gate. Never overwrite an object currently referenced by public metadata.

Storage and database operations are not assumed atomic. Failed/interrupted work must remain private/quarantined with an attributable pending-cleanup record; a bounded authorized reconciliation must verify exact object/version ownership, no active references and stale tokens before any separately authorized removal. Cleanup failures are retryable/recoverable, not silent recursive deletion. Historical audit stays intact. Institutional retention periods, recovery ownership and approved removal/rights rules remain unresolved; no numeric school policy is invented.

## Evidence and acceptance boundary

Focused deterministic suite: `node scripts/test-phase4-fs5-validation.mjs`. Real browser decoding and existing zero-photo responsive checks are separate from Node injected-decoder fixtures. Full required regression/build/PWA/documentation results belong in `63`/`73` only after execution. QA fixtures, screenshots and measurements stay outside Git at `C:/Users/St.Clare/Documents/CampusNav-AI-fs5-qa/2026-10-16`.

Executed checkpoint: 103 focused checks, all 38 distinct deterministic suites, lint/typecheck/build/PWA artifacts-after-build/whitespace, dedicated module checks, 40 local Chrome checks and six built-worker offline preservation scenarios passed. Default emitted runtime assets are byte-identical to the accepted baseline. The initial offline harness used an unconfigured local build and failed its populated-fixture prerequisite; a separate external synthetic-configured build with intercepted reads corrected test setup only. No production configuration or accepted test was changed. These results do not turn blocked backend tests into passes.

Backend unauthorized upload/update/archive, cross-facility modification, draft/raw-object denial, signed-link bypass, public projection privacy, stale concurrent edits, replacement/orphan failure and trusted audit tests are **BLOCKED / NOT EXECUTED**, not passed through mocks. Populated Admin/gallery, upload/publication, compression/thumbnails and production activation are not implemented. Physical devices, screen readers/WCAG and low-end performance are not certified.

## Exact resumption gate

Provide an authorized isolated PostgreSQL + Supabase Storage/test-server environment and readable existing project inventory; establish a verifiable trusted decoder, private delivery/cleanup model and necessary server configuration without production mutation. Then implement the minimal forward-only schema/storage/RLS/audit foundation and execute direct role/storage/privacy/concurrency/cleanup tests before provider/Admin/public integration. Production deployment requires separate backend mutation/configuration authorization and institutionally approved assets/rights/review evidence. FS-6/FS-7 remain outside scope.
