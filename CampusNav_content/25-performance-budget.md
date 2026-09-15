# CampusNav AI — Performance and Rendering Contract

## Goal
CampusNav should remain usable on ordinary student phones, tablets, and laptops. 3D must enhance navigation, not become a performance requirement.

## Required strategies
- lazy-load 3D and QR/camera-heavy code
- code splitting
- reuse/memoize geometry
- frustum culling where useful
- InstancedMesh where useful
- low-polygon architecture
- minimal/compressed textures
- avoid photorealistic assets unless truly needed
- keep 2D mode available at all times

## 3D behavior
- do not load full 3D unnecessarily on low-powered devices
- preserve 2D fallback after WebGL failure
- avoid duplicated map geometry/data parsing
- central 2D→3D transform

## UI loading
- use skeletons/subtle progress for cloud content
- optional cloud modules must not block basic navigation unnecessarily

## Animation
- subtle camera/floor/route transitions
- no game-like continuous effects
- honor reduced-motion preference

## Network resilience
Navigation-critical static data should not require repeated large downloads when avoidable. Dynamic Dashboard data should be fetched efficiently and subscriptions should be scoped.

## Performance regression checks
- production build succeeds
- route interaction remains responsive
- 3D switch does not lose navigation state
- mobile layout remains usable
- WebGL fallback works
- QR module can be loaded/unloaded safely

## Source basis
- CampusNav Project Source Reference — Performance, Mobile Experience, 3D optimization
- CampusNav AI Final Expanded Architecture — lazy 3D/ZXing chunks and 2D fallback testing
