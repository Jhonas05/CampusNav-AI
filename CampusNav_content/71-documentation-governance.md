# CampusNav AI — Documentation Governance

## Traceability for the November media proposals

The original PDFs are registered in [35](35-source-asset-registry.md). DEC-MEDIA-001 records the owner engineering scope. [74](74-ar-assisted-navigation-contract.md) governs Lite and retains the historical full AR plan. [78](78-clara-voice-accessibility.md) extends the existing CLARA contract. Status, release evidence and outstanding decisions belong in 63, 73 and 64 respectively. Historical FS acceptance and institutional approval require their own evidence.

## Goal
This folder should remain useful to both humans and coding agents instead of becoming stale duplicate prose.

## Document types
- **source-derived contract**: must remain consistent with approved CampusNav sources
- **owner decision**: recorded in `29-decision-log.md`
- **implementation status**: recorded in `63-implementation-status-registry.md`
- **engineering convention**: project-maintainability rule added by this content pack; must not contradict source requirements
- **open decision**: recorded in `64-open-questions-decision-backlog.md`

## Update triggers
Update docs when:
- scope/architecture changes
- a planned feature becomes implemented/verified
- a database/API/status contract changes
- a new safety/privacy rule is approved
- a known conflict is resolved

## Do not
- duplicate the same rule with different wording/status in many files without cross-reference
- mark future features complete because the source requested them
- rewrite source history to hide a decision change

## Versioning
`CHANGELOG.md` records documentation-pack changes. `29-decision-log.md` records project decisions. Git history remains the detailed edit history.

## Review cadence
Before a major development phase or thesis milestone, review:
- decision log
- implementation status
- open questions
- definition of done
- traceability matrix
- known limitations
