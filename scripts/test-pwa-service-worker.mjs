import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
const config = read('vite.config.js')
const worker = read('src/service-worker.js')
const registration = read('src/pwa/serviceWorkerRegistration.js')
const main = read('src/main.jsx')

assert.match(config, /strategies:\s*['"]injectManifest['"]/, 'PWA must use injectManifest')
assert.match(config, /registerType:\s*['"]prompt['"]/, 'updates must require a user prompt')
assert.match(config, /manifest:\s*false/, 'the canonical public manifest must remain authoritative')
for (const excluded of ['*Admin*.js', 'Login-*.js', 'Emergency-*.js', 'QRCheckpoints-*.js', 'MapVerificationPanel-*.js', 'Campus3D-*.js', 'QRScanner-*.js', 'supabase-client-*.js']) {
  assert.ok(config.includes(excluded), `precache must exclude ${excluded}`)
}
for (const chunk of ['three-renderer', 'qr-decoder', 'supabase-client']) {
  assert.ok(config.includes(chunk), `build must isolate ${chunk}`)
}

assert.match(worker, /precacheAndRoute\(self\.__WB_MANIFEST/, 'worker must use the injected revision manifest')
assert.match(worker, /PUBLIC_OFFLINE_PATHS/, 'worker must allowlist offline navigations')
assert.match(worker, /\/facilities/, 'facilities must be available from the offline shell')
assert.match(worker, /\/map/, 'the canonical map must be available from the offline shell')
assert.doesNotMatch(worker, /NetworkFirst|StaleWhileRevalidate/, 'runtime network data must not be cached')
assert.doesNotMatch(worker, /\/admin|\/login|\/emergency/, 'restricted routes must not receive an offline navigation fallback')
assert.match(worker, /request\.headers\.has\(['"]authorization['"]\)/, 'authorized requests must not enter the optional cache')
assert.match(worker, /SKIP_WAITING/, 'worker must expose explicit update activation')
assert.doesNotMatch(worker, /skipWaiting\(\)[\s\S]*precacheAndRoute/, 'worker must not activate unprompted during installation')

assert.match(registration, /onNeedRefresh/, 'registration must surface an available update')
assert.match(registration, /activateUpdate\(true\)/, 'updates must be activated through an explicit action')
assert.match(main, /registerCampusNavServiceWorker\(\)/, 'the production app must register the worker')

console.log('PWA service worker cache boundaries and update policy: PASS')
