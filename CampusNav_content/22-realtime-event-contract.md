# CampusNav AI — Realtime Event Contract

## Purpose
Defines where Supabase Realtime is useful and prevents every component from creating independent subscriptions.

## Principle
Realtime is for **meaningful time-sensitive state**, not a requirement for every table.

## Good candidates
- published announcements/notifications
- facility advisories / closure updates
- events/status changes when relevant
- class schedule/admin corrections
- personnel check-in/check-out
- availability overrides
- Dashboard refresh event signal

## Usually not needed as a broad public subscription
- static spatial geometry
- historical audit logs
- rarely changing reference catalogs
- private data a user is not authorized to see

## Subscription architecture
Prefer centralized providers/services:

```text
Supabase Realtime
      ↓
provider / service subscription
      ↓
normalized domain update
      ↓
Dashboard / affected view refresh
```

Avoid one subscription per card/component when one domain-level subscription can serve the page.

## Authorization
Realtime does not replace RLS. Users must only receive records they are permitted to read.

## Deduplication
Handle:
- reconnects
- repeated events
- optimistic update + server echo
- record lifecycle changes

The UI should not duplicate the same notification because multiple refresh mechanisms fired.

## Schedule/personnel refresh
Changes to schedules, exceptions, assignments, check-ins, or overrides should cause the availability service to recompute status. Do not trust stale computed labels in UI state.

## Failure behavior
If Realtime disconnects:
- app remains usable with last successfully fetched data where safe
- show retry/stale status only when materially useful
- do not falsely claim data is live

## Source basis
- CampusNav AI Final Expanded Architecture — Realtime where appropriate, Dashboard time-relevant state
- current content folder — validated Realtime/provider pattern and `dashboard_refresh_events`
