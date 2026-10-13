/// <reference lib="webworker" />

import { clientsClaim, setCacheNameDetails } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'

const CACHE_POLICY_VERSION = 'v1'
const OPTIONAL_STATIC_CACHE = `campusnav-optional-static-${CACHE_POLICY_VERSION}`
const PUBLIC_OFFLINE_PATHS = [
  /^\/$/,
  /^\/dashboard\/?$/,
  /^\/facilities(?:\/[^/]+)?\/?$/,
  /^\/map\/?$/,
]
const OPTIONAL_BUNDLE = /^\/(?:assets\/)?(?:Campus3D|three-renderer|QRScanner|qr-decoder)-[^/]+\.js$/

setCacheNameDetails({ prefix: 'campusnav', suffix: CACHE_POLICY_VERSION })
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST, { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] })

const offlineShell = createHandlerBoundToURL('/index.html')

registerRoute(
  ({ request, url }) => (
    request.mode === 'navigate'
    && url.origin === self.location.origin
    && PUBLIC_OFFLINE_PATHS.some((pattern) => pattern.test(url.pathname))
  ),
  offlineShell,
)

registerRoute(
  ({ request, url }) => (
    request.destination === 'script'
    && request.method === 'GET'
    && url.origin === self.location.origin
    && OPTIONAL_BUNDLE.test(url.pathname)
    && !request.headers.has('authorization')
  ),
  new CacheFirst({
    cacheName: OPTIONAL_STATIC_CACHE,
    plugins: [
      new ExpirationPlugin({ maxEntries: 8, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  }),
)

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

clientsClaim()
