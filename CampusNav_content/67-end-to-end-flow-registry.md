# CampusNav AI — End-to-End Flow Registry

## Flow A — QR to destination
1. Scan known QR checkpoint.
2. Resolve canonical current node/location.
3. Select/search destination.
4. A* computes verified path.
5. 2D/3D render the same route.
6. Show step/navigation information.

## Flow B — Service discovery
1. User searches “school records” or asks CLARA.
2. System resolves approved service mapping.
3. Show Registrar’s Office (if that mapping is configured/verified).
4. Show verified facility info/status.
5. Navigate through normal route engine.

## Flow C — Personnel lookup
1. Search approved personnel.
2. Availability engine evaluates schedules, exceptions, consultation, overrides, check-in.
3. Show accurate status wording.
4. If a current approved destination exists, allow navigation.

## Flow D — Dashboard item
1. Fetch audience-appropriate active items.
2. Prioritize/order.
3. User opens item.
4. Deep-link to event/facility/navigation/detail when applicable.

## Flow E — Emergency
1. Determine current known location if available.
2. Query verified emergency data only.
3. If approved route exists, display it.
4. Otherwise show posted-plan/authorized-personnel guidance; no normal-route fallback.

## Flow F — Admin correction
1. Admin receives/verifies issue.
2. Update authorized source data.
3. Audit/version record is created as required.
4. Regression/validation checks run for affected domain.
5. Public system reads the updated canonical data.
