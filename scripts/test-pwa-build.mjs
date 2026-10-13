import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const distUrl = new URL('../dist/', import.meta.url)
const readDist = (file) => readFileSync(new URL(file, distUrl), 'utf8')

assert.ok(existsSync(new URL('service-worker.js', distUrl)), 'production service worker must be generated')
assert.ok(existsSync(new URL('manifest.json', distUrl)), 'canonical manifest must be emitted')

const worker = readDist('service-worker.js')
const index = readDist('index.html')
const precacheUrls = [...worker.matchAll(/"url":"([^"]+)"/g)].map((match) => match[1])

for (const required of [
  'index.html',
  'manifest.json',
  'branding/campusnav-app-icon-192.png',
  'branding/campusnav-app-icon-512.png',
  'branding/campusnav-app-icon-maskable-512.png',
  'branding/apple-touch-icon.png',
]) {
  assert.ok(existsSync(new URL(required, distUrl)), `${required} must exist in the production build`)
  assert.ok(precacheUrls.includes(required), `${required} must be precached`)
}

assert.ok(!existsSync(new URL('branding/campusnav-app-icon.svg', distUrl)), 'retired vector icon must not be emitted')

for (const pattern of [/^assets\/index-.*\.js$/, /^assets\/Map-.*\.js$/, /^assets\/IndoorMap2D-.*\.js$/, /^assets\/Facilities-.*\.js$/, /^assets\/FacilityDetail-.*\.js$/]) {
  assert.ok(precacheUrls.some((url) => pattern.test(url)), `${pattern} must be represented in the precache`)
}

const forbidden = /(?:Admin|QRCheckpoints|MapVerificationPanel|Login-|Emergency-|EmergencyModePanel|Campus3D|three-renderer|QRScanner|qr-decoder|supabase-client)/
assert.deepEqual(precacheUrls.filter((url) => forbidden.test(url)), [], 'restricted and opt-in bundles must not be precached')
assert.match(worker, /campusnav-optional-static-/, 'optional 3D and QR cache policy must be built')
assert.match(index, /rel="manifest" href="\/manifest\.json"/, 'production HTML must reference the canonical manifest')
assert.doesNotMatch(index, /(?:three-renderer|qr-decoder|supabase-client)-/, 'the HTML entry must not preload excluded or opt-in bundles')

console.log(`PWA production build boundaries: PASS (${precacheUrls.length} precache entries)`)
