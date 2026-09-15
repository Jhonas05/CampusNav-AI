# CampusNav AI — Dashboard and Notification Contract

## Purpose
Keeps alert-like information centralized instead of scattering multiple competing notification feeds throughout the app.

## Core rule
**Dashboard is the primary campus-status and notification surface.** Feature pages may show task-local status, but the main feed belongs on Dashboard.

## Dashboard sections
1. Priority Alerts
2. Today’s Classes
3. Office Availability
4. Personnel Availability
5. Facility Advisories
6. Events & Calendar
7. General Announcements
8. Navigation Notices

## Notification categories
- GENERAL
- ACADEMIC
- EVENT
- FACILITY
- SCHEDULE
- EMERGENCY
- SUSPENSION
- NAVIGATION

## Priority
- INFORMATIONAL
- NORMAL
- IMPORTANT
- URGENT

## Lifecycle
- DRAFT
- SCHEDULED
- PUBLISHED
- EXPIRED
- CANCELLED

## Audience targeting
Source architecture allows targets such as:
- everyone
- students
- parents
- faculty
- staff
- department
- program
- year/section
- custom group
- education level where relevant

RLS and service filtering must prevent users from seeing non-public/non-targeted data.

## Official-source rule
AI may help summarize or prioritize, but it must **not originate** official emergency or class-suspension decisions.

## Class suspension
The system should support separate suspension scope where applicable (e.g., Basic Education/JHS/SHS/Tertiary) and an official monitoring/status timeline when the school supplies it.

Only authorized school administration can publish the official decision.

## Realtime behavior
Published/updated content may trigger Dashboard refresh through Supabase Realtime or the project’s refresh-event mechanism. See `22-realtime-event-contract.md`.

## Duplicate prevention
A user should not see the same logical alert repeated as independent cards from multiple sources without purpose. Prefer one canonical record linked to detail pages.

## Empty state
If there is no verified content, show an explicit empty state instead of sample content in normal mode.

## Source basis
- CampusNav AI Final Expanded Architecture — centralized Dashboard, notification data model
- CampusNav Project Source Reference — announcements, suspensions, notifications, events/calendar
