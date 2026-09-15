# CampusNav AI — State Management Contract

## Shared navigation state
2D and 3D views must preserve the same:
- current location
- positioning method
- selected destination
- active route/node sequence
- selected/focused floor
- route progress where applicable
- navigation preferences/restrictions

Switching 2D ↔ 3D must not recompute from an unrelated source or reset the route unless explicitly requested.

## Position metadata
Where available track:
- `positioningMethod`: QR / MANUAL / GPS / BLE
- resolved node/location
- floor
- coordinates if provider supports them
- confidence/verification metadata
- timestamp

## Server state vs UI state
- database-backed records should be treated as server state
- transient modal/camera/filter state is UI state
- do not persist sensitive auth/personnel information in insecure browser storage

## Dashboard/Realtime
Realtime events should invalidate/refetch or update canonical server data. They should not become a second long-term truth store in the client.

## Demo progress
An animated route marker without a real sensor feed is simulated state and must be labeled as such.
