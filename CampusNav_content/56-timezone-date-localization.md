# CampusNav AI — Timezone, Date, and Localization Rules

## Canonical timezone
Campus schedule/status calculations use **Asia/Manila** unless the project owner approves a change.

## Applies to
- facility open/closed status
- current/next class
- personnel availability
- consultation hours
- announcement/effective/expiration dates
- events
- scheduled notifications
- audit/display timestamps where appropriate

## Rules
- do not compare schedule records using an accidental server/UTC local time without conversion
- date-only academic records should not shift dates because of timezone serialization
- schedule exceptions/holidays must be evaluated before showing current status

## Language
The system may display English/Taglish conversational responses where intentionally designed, but canonical database statuses/identifiers should remain consistent and not depend on translated display text.
