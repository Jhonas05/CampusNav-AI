import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
const connectivity = read('src/contexts/ConnectivityContext.jsx')
const pwa = read('src/contexts/PwaContext.jsx')
const status = read('src/components/pwa/PwaStatus.jsx')
const facilities = read('src/pages/Facilities.jsx')
const detail = read('src/pages/FacilityDetail.jsx')
const map = read('src/pages/Map.jsx')
const emergency = read('src/pages/Emergency.jsx')
const clara = read('src/components/clara/ClaraContext.jsx')
const supabase = read('src/lib/supabaseClient.js')

assert.match(connectivity, /__campusnav_network_probe/, 'connectivity must use a real network probe')
assert.match(connectivity, /cache:\s*["']no-store["']/, 'connectivity probe must bypass caches')
assert.match(connectivity, /navigator\.onLine === false/, 'browser connectivity events remain an immediate signal')
assert.match(connectivity, /reconnectVersion/, 'reconnection must be observable by data consumers')

assert.match(pwa, /beforeinstallprompt/, 'install prompt must be captured')
assert.match(pwa, /display-mode: standalone/, 'installed mode must be detected')
assert.match(pwa, /applyServiceWorkerUpdate/, 'updates must remain user controlled')
assert.match(status, /Emergency routing are unavailable/, 'offline limits must be visible')
assert.match(status, /Update now/, 'the update prompt must expose an explicit action')

for (const [name, source] of [['directory', facilities], ['detail', detail]]) {
  assert.match(source, /!connectivity\.isOnline/, `${name} operational reads must stop offline`)
  assert.match(source, /connectivity\.reconnectVersion/, `${name} operational reads must refresh after reconnect`)
}
assert.match(map, /Emergency routing is unavailable offline/, 'offline Emergency routing must be blocked')
assert.match(map, /Open standard 2D map/, 'offline Emergency block must preserve standard 2D access')
assert.match(map, /3D was not cached on this device/, 'uncached offline 3D must fall back safely')
assert.match(map, /QR scanning was not cached on this device/, 'uncached offline QR must fall back to manual positioning')
assert.match(emergency, /disabled aria-describedby="offline-emergency-note"/, 'Emergency map action must be disabled offline')
assert.match(clara, /CLARA is unavailable while CampusNav is offline/, 'CLARA must not imply offline answers are live')
assert.match(supabase, /clientPromise = null/, 'a failed offline client import must be retryable after reconnect')

console.log('PWA connectivity, degradation, install, update, and Emergency boundaries: PASS')
