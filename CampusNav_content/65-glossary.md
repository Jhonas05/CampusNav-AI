# CampusNav AI — Canonical Glossary

- **CampusNav AI / CampusNav** — the overall campus navigation and information platform.
- **CLARA** — Campus Learning Alerts & Response Assistant; the intelligent digital concierge inside CampusNav.
- **A*** — standard graph pathfinding used for navigation; not itself the AI component.
- **2D map** — top-down digitized campus floor view driven by canonical spatial data.
- **3D map** — visualization of the same spatial data/routes; not a second routing engine.
- **QR checkpoint** — installed/scannable known-location marker that resolves to a map node/location.
- **Manual positioning** — user-selected current location; core fallback when QR/camera is unavailable.
- **Verified** — confirmed by an approved source/administrator according to the domain workflow.
- **Estimated** — approximate visual/dimensional data not supported as exact architectural measurement.
- **Pending verification** — exists in the system but not yet approved as official truth.
- **Demo data** — synthetic/sample data for development/demo; never official.
- **Scheduled** — approved timetable/assignment; does not prove physical presence.
- **Checked In** — presence supported by an authorized check-in mechanism.
- **Emergency-approved edge** — graph connection explicitly approved for emergency routing.
- **RLS** — PostgreSQL/Supabase Row Level Security; authoritative database authorization layer.
- **Dashboard** — centralized surface for notification-style/time-relevant campus information.
- **Service mapping** — approved mapping from a user need/task to the facility that handles it.
