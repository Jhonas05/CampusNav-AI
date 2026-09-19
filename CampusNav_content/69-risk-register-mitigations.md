# CampusNav AI — Risk Register and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| inaccurate map geometry | wrong navigation | source-aligned digitization, verification states, admin edits, route tests |
| duplicate 2D/3D truth | inconsistent routes | one spatial dataset + one A* path |
| unverified emergency route | safety risk | emergency-approved edges only, no normal fallback |
| schedule shown as presence | privacy/trust risk | strict wording + check-in requirement |
| stale facility hours/schedules | misleading status | exceptions/overrides, data ownership, verification dates where useful |
| over-scoped live indoor tracking | feasibility failure | QR/manual core; BLE/GPS clearly optional |
| AR guidance implies exact physical position | unsafe/misleading navigation | derive guidance from the last verified QR/manual origin; label distance/progress appropriately; request re-verification when confidence is insufficient |
| AR creates duplicate routing or spatial truth | inconsistent routes | presentation-only adapter over the existing A* node sequence and canonical IDs; shared-route regression evidence required |
| camera frames expose people or surroundings | privacy/security harm | explicit permission, local-first processing, no recording/upload/persistence or facial/person recognition by default; separate review for any expansion |
| unsupported or interrupted camera removes navigation | loss of core access | progressive enhancement, 2D/text fallback, preserved route/destination, safe camera cleanup and permission/error states |
| AR emergency overlay presents an unapproved path | safety risk | AR-7 remains conditional; consume approved emergency route result only; retain canonical safe no-route state |
| secret exposed in Vite/client | security breach | server-only secrets, env registry, security tests |
| RLS/UI permission mismatch | unauthorized data change | RLS authoritative; direct-access tests |
| 3D performance failure | poor mobile usability | lazy loading, low-poly approach, 2D fallback |
| demo data mistaken as official | thesis credibility risk | explicit DEMO/SAMPLE labels and production separation |
| documentation/code drift | agent mistakes | implementation registry, changelog, decision log, documentation governance |
| title/scope mismatch | defense confusion | track formal title issue and explain responsive compatibility |
