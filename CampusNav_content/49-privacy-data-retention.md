# CampusNav AI — Privacy and Data Retention

## Core privacy stance
CampusNav should help users find campus services/personnel without becoming an employee-tracking system.

## Public personnel information
Expose only approved public fields required for service discovery, such as:
- name/title if approved
- department/role if approved
- approved schedule/assignment
- consultation window
- permitted availability wording

## Presence
- schedule ≠ presence
- no public live employee GPS
- `CHECKED_IN` requires an authorized check-in/presence signal

## Data minimization
Do not collect or retain information merely because it might be useful later. Analytics should avoid unnecessary personally identifiable information.

## Retention decisions that still require institutional approval
The supplied sources do not define exact retention periods for:
- CLARA conversation logs
- audit logs
- check-in history
- user reports
- analytics events

Until policy is approved, do not invent a school retention requirement. Prefer minimal retention and document the implemented setting.

The implemented CLARA foundation keeps the conversation only in React memory and does not write it to local/session storage, IndexedDB, Cache Storage, analytics, or a backend. Reset, close, or reload discards it. No external provider receives questions. Future provider monitoring may contain aggregate request/result counts only until a conversation-retention policy is approved.

Unpaid Gemini service terms audited 16 October 2026 state that submitted content and responses may be used to improve Google products and may be reviewed by humans, and direct users not to submit sensitive, confidential, or personal information. This is an additional privacy reason not to enable unpaid Gemini for CampusNav; the under-18 audience restriction independently blocks public activation. See `76`.

## FS-5 media privacy boundary

The independent local validation checkpoint (`77`) reads bounded candidate bytes only in memory, rejects unsupported embedded metadata and creates no object URL, upload, storage entry or conversation/analytics log. It does not remove EXIF/GPS, certify all embedded information, review identifiable people/documents/pixels or confer publication rights. Evidence references in a draft remain unverified private input, not institutional approval. Future trusted sanitization, rights/consent/review, original/quarantine retention, authorized cleanup and public projection minimization remain release gates; no institutional retention period or owner assignment is invented.

## Access control
Detailed schedules, notes, private account links, and admin audit data remain role restricted.
