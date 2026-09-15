# CampusNav AI — Risk Register and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| inaccurate map geometry | wrong navigation | source-aligned digitization, verification states, admin edits, route tests |
| duplicate 2D/3D truth | inconsistent routes | one spatial dataset + one A* path |
| unverified emergency route | safety risk | emergency-approved edges only, no normal fallback |
| schedule shown as presence | privacy/trust risk | strict wording + check-in requirement |
| stale facility hours/schedules | misleading status | exceptions/overrides, data ownership, verification dates where useful |
| over-scoped live indoor tracking | feasibility failure | QR/manual core; BLE/GPS clearly optional |
| secret exposed in Vite/client | security breach | server-only secrets, env registry, security tests |
| RLS/UI permission mismatch | unauthorized data change | RLS authoritative; direct-access tests |
| 3D performance failure | poor mobile usability | lazy loading, low-poly approach, 2D fallback |
| demo data mistaken as official | thesis credibility risk | explicit DEMO/SAMPLE labels and production separation |
| documentation/code drift | agent mistakes | implementation registry, changelog, decision log, documentation governance |
| title/scope mismatch | defense confusion | track formal title issue and explain responsive compatibility |
