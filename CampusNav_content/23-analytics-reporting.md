# CampusNav AI — Analytics, Reporting, and User Issue Workflow

## Admin analytics
Source architecture proposes privacy-conscious analytics such as:
- most searched facilities
- most navigated destinations
- most used QR checkpoints
- common CLARA questions (after CLARA exists)
- navigation error reports
- facility information reports

Avoid tracking unnecessary personally identifiable information.

## User reporting categories
Users may report:
- Blocked Path
- Incorrect Facility Information
- Facility Closed
- QR Code Problem
- Map Error
- Other Campus Navigation Issue

## Verification workflow
```text
User Report
   ↓
Pending Verification
   ↓
Admin Review
   ↓
Approved / Rejected
   ↓
Official Update (if approved)
```

A user report must **never automatically modify official campus data**.

## Recommended report fields
- category
- optional facility/floor/checkpoint
- description
- submitted timestamp
- reporter identity only when needed/allowed
- verification status
- reviewer
- admin notes (protected)
- linked official change if approved

## Privacy
- collect minimum necessary user data
- do not expose reporter details publicly
- avoid storing sensitive free-form content unnecessarily

## Thesis value
Reports and analytics can demonstrate maintainability and system usefulness without turning CampusNav into surveillance software.

## Implementation status
Treat analytics/reporting as **required-by-source / verify-or-roadmap** unless current code confirms each function is implemented.

## Source basis
- CampusNav Project Source Reference — User Reporting; Reports and Analytics
