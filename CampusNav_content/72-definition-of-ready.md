# CampusNav AI — Definition of Ready

A feature/task is ready for implementation when the following are sufficiently clear.

## Required
- user/system goal is known
- core vs optional status is known
- relevant source/contract is identified
- authoritative data source is known or the feature explicitly handles unavailable/pending data
- security/role requirements are known
- privacy implications are understood
- expected error/empty states are known
- acceptance/test cases are identified

## Additional for database/admin work
- data owner is known or deliberately generic pending institutional confirmation
- migration/RLS impact is understood
- audit requirements are identified

## Additional for map/emergency work
- spatial source/verification state is known
- affected graph/QR/stair/emergency relationships are identified
- regression routes are selected

## Additional for CLARA
- internal tool/service exists and is stable
- authorization boundary exists
- hallucination/unavailable behavior is defined

If these conditions are not met, move the missing item to `64-open-questions-decision-backlog.md` instead of guessing.
