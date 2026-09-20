# CampusNav AI — Adviser Confirmation Package

**Package status:** `PREPARED / AWAITING_ADVISER_CONFIRMATION`

**Prepared:** 20 September 2026

**Decision basis:** `DEC-DEFENSE-001 — Proposed final defense scope baseline`

**Software baseline:** Phase 3 `COMPLETE — ACCEPTED_WITH_ADVISORY`

## Purpose and instructions

This package requests academic direction on the remaining CampusNav AI thesis and final-defense decisions. It summarizes the owner-approved proposal so the adviser does not need to review the full canonical documentation pack.

Please select one option in each decision section and add conditions or corrections where needed. Blank or ambiguous sections remain unresolved and do not authorize implementation. Adviser confirmation does not replace institutional or safety-authority approval for official campus data.

## 1. Proposed final defense scope

The owner proposes demonstrating these currently accepted capabilities at their documented evidence levels:

- responsive CampusNav web application for laptop, tablet, and mobile viewports
- GF–5F source-aligned campus spatial foundation and one canonical spatial dataset
- standard A* pathfinding; A* is navigation logic and is **not AI**
- 2D, 3D, same-floor, and multi-floor navigation using the same route result
- QR checkpoint positioning and manual-location fallback
- Facilities directory, facility details, and facility navigation
- centralized Dashboard
- authentication, role-based access control, and Admin CMS
- academic schedule/personnel engine and availability logic
- accepted Supabase Auth, RLS, and Realtime foundation
- strict Emergency Mode using verified/emergency-approved data only
- safe no-route, unavailable-data, and error behavior

### Adviser decision

- [ ] **APPROVE** the proposed defense core.
- [ ] **APPROVE WITH CHANGES.**
- [ ] **REQUIRE ADDITIONAL FEATURE(S).**

Required changes or additional features:

______________________________________________________________________________

______________________________________________________________________________

Reason or academic requirement:

______________________________________________________________________________

## 2. Thesis title treatment

The original thesis framing is tablet-focused. The implemented system is now a responsive web application that operates across laptop, tablet, and mobile viewports. The software should remain responsive; the final academic title requires adviser direction.

### Adviser decision

- [ ] **RETAIN** the current “tablet-based” wording.
- [ ] **REVISE** to responsive web-based wording.
- [ ] **OTHER wording:** ______________________________________________________

Approved title or wording instruction:

______________________________________________________________________________

## 3. Grounded CLARA requirement

Current evidence:

- a conservative local CLARA facility matcher exists
- grounded server-side Groq/LLM integration is **not implemented**
- the current matcher is not grounded production AI, a production-ready LLM integration, or a completed AI assistant
- A* pathfinding must not be presented as the AI contribution

Is grounded CLARA required for the final defense or thesis AI requirements?

- [ ] **YES — GROUNDED CLARA IS REQUIRED.**
- [ ] **NO — GROUNDED CLARA MAY REMAIN DEFERRED.**
- [ ] **CONDITIONAL — required capability specified below.**

Required capability or condition:

______________________________________________________________________________

______________________________________________________________________________

A `YES` or `CONDITIONAL` decision creates a separate future workstream. It does not authorize immediate implementation; the workstream must first satisfy the canonical Definition of Ready.

## 4. PWA/offline emergency support

Current evidence:

- a web manifest exists
- no service worker or versioned offline emergency cache is implemented
- CampusNav must not currently be described as providing offline/PWA emergency support

Is PWA/offline emergency support required for the final defense?

- [ ] **YES — REQUIRED.**
- [ ] **NO — DEFER.**
- [ ] **CONDITIONAL:** ________________________________________________________

A `YES` or `CONDITIONAL` decision requires a separate, Definition-of-Ready-approved workstream before implementation.

## 5. Verified, demo, and unavailable data policy

The owner proposes this final-defense policy:

### A. Verified institutional data

Data may be described as verified or official only when canonical provenance and appropriate institutional authority evidence support that claim.

### B. Demo/sample data

Synthetic or demo values may demonstrate implemented workflows only when clearly and visibly labeled `DEMO`, `SAMPLE`, or equivalent. They must not be described as official, live, current institutional truth, or verified personnel presence.

### C. Unavailable/pending data

Unknown or unapproved institutional information remains unavailable or pending verification. Values must not be invented merely to make a demonstration appear complete.

Emergency routes, official emergency contacts/equipment, personnel presence, accessibility infrastructure, suspensions, and other safety-sensitive institutional facts must never be fabricated.

### Adviser decision

- [ ] **APPROVE** the proposed verified/demo/unavailable policy.
- [ ] **APPROVE WITH CONDITIONS.**
- [ ] **DO NOT ALLOW DEMO DATA** for the defense.

Conditions or restrictions:

______________________________________________________________________________

______________________________________________________________________________

## 6. Research and evaluation methodology

Software QA evidence supports technical acceptance but does not replace thesis research methodology. Please provide or direct the following academic decisions; no field is pre-approved by this package.

**Research/evaluation design:**

______________________________________________________________________________

**Target respondent population:**

______________________________________________________________________________

**Sampling method:**

______________________________________________________________________________

**Sample size:**

______________________________________________________________________________

**Evaluation instrument or framework:**

______________________________________________________________________________

**Required task scenarios:**

______________________________________________________________________________

**Effectiveness metric:**

______________________________________________________________________________

**Efficiency metric:**

______________________________________________________________________________

**Usability/satisfaction metric:**

______________________________________________________________________________

**Acceptance thresholds:**

______________________________________________________________________________

**Statistical treatment:**

______________________________________________________________________________

**Final success criteria:**

______________________________________________________________________________

**Evaluation procedure and other instructions:**

______________________________________________________________________________

______________________________________________________________________________

## 7. Optional and deferred features

The owner proposal treats the following as **deferred unless the adviser requires them**:

- AR-Assisted Camera Navigation
- reports and analytics
- advanced map editor and map-version rollback tooling
- GPS, BLE, Wi-Fi fingerprinting, and UWB positioning
- push notifications and SMS delivery
- hardware-heavy presence or positioning extensions
- native ARCore/ARKit, SLAM, or visual-positioning systems
- photorealistic 3D
- unrelated dependency upgrades

Additional feature required:

______________________________________________________________________________

Reason or thesis requirement:

______________________________________________________________________________

Any newly required feature remains unimplemented until separately authorized and found ready.

## 8. Emergency and schedule/personnel claim boundaries

The defense may demonstrate strict emergency-approved routing, rejection of non-approved edges, safe no-route behavior, and currently verified/source-aligned emergency data. It must not claim complete institutional emergency coverage, final safety-authority approval, or complete official evacuation coverage without institutional evidence.

The accepted schedule/personnel engine may be demonstrated. Official data claims remain institution-dependent. Canonical wording preserves:

`SCHEDULED != CHECKED_IN`

`UNAVAILABLE > CHECKED_IN > IN_CLASS > CONSULTATION > SCHEDULED > NO_ACTIVE_SCHEDULE`

Non-institutional schedule/personnel records must be visibly demo-labeled.

## 9. Institutional approval note

Adviser confirmation does not replace authorized institutional sources or sign-off for:

- official campus map and facility verification
- facility operating hours, services, and service-to-facility mappings
- official class schedules
- approved public personnel fields and availability rules
- personnel presence and check-in authority
- emergency routes, equipment, contacts, verification dates, and safety approval
- privacy and retention policy
- backup and recovery policy

If the final defense makes official claims in these areas, the applicable institutional approval remains mandatory.

## Return and status handling

Return the completed package to the project owner for canonical recording. Until completed adviser evidence is received, this package remains `PREPARED / AWAITING_ADVISER_CONFIRMATION`, all adviser decisions remain unresolved, and no deferred feature implementation is authorized.

---

## Adviser Decision Summary — Final Page

This page records academic direction only. Unselected or unclear items remain unresolved.

### Final defense core

- [ ] **APPROVED**
- [ ] **APPROVED WITH CHANGES**
- [ ] **NOT APPROVED**

### Title

- [ ] **RETAIN**
- [ ] **REVISE**
- [ ] **OTHER**

Approved/required wording: ___________________________________________________

### Grounded CLARA

- [ ] **REQUIRED**
- [ ] **DEFER**
- [ ] **CONDITIONAL**

### PWA/offline

- [ ] **REQUIRED**
- [ ] **DEFER**
- [ ] **CONDITIONAL**

### Demo-data policy

- [ ] **APPROVED**
- [ ] **APPROVED WITH CONDITIONS**
- [ ] **NOT APPROVED**

### Research methodology

- [ ] **PROVIDED**
- [ ] **REQUIRES FOLLOW-UP**

### Additional required features

______________________________________________________________________________

### Additional instructions or conditions

______________________________________________________________________________

______________________________________________________________________________

**Adviser name:** _____________________________________________________________

**Signature, if required:** __________________________________________________

**Date:** ____________________________________________________________________
