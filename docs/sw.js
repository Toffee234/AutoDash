/**
 * sw.js — AutoDash Service Worker
 * Offline-first: shell cached on install, map tiles cached on demand.
 * Version string triggers re-install when changed.
 */

'use strict';

const VERSION    = 'autodash-v3.0';
const SHELL_CACHE = `${VERSION}-shell`;
const TILE_CACHE  = `${VERSION}-tiles`;

// ── Files to pre-cache on install (app shell) ─────────────────
const SHELL_FILES = [
  '/autodash.html',
  '/manifest.json',
  // Leaflet from CDN — cached if fetch succeeds
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
];

// ── Install: cache shell ──────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => {
      // Use individual fetches so a CDN failure doesn't abort the whole install
      return Promise.allSettled(
        SHELL_FILES.map(url =>
          cache.add(url).catch(() => {
            // CDN might be unreachable during install — skip gracefully
            console.warn(`SW: could not pre-cache ${url}`);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: delete old caches ───────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== SHELL_CACHE && k !== TILE_CACHE)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: strategy depends on URL ───────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Map tiles (OSM, CARTO): Cache-first with network fallback
  if (isMapTile(url)) {
    event.respondWith(tileStrategy(request));
    return;
  }

  // Open-Meteo weather API: Network-first, no cache (always fresh)
  if (url.hostname === 'api.open-meteo.com') {
    event.respondWith(fetch(request).catch(() => new Response('{}', {
      headers: { 'Content-Type': 'application/json' }
    })));
    return;
  }

  // Nominatim / OSRM: Network only (don't pollute cache with geocode results)
  if (url.hostname.includes('nominatim.openstreetmap.org') ||
      url.hostname.includes('router.project-osrm.org')) {
    event.respondWith(fetch(request));
    return;
  }

  // App shell: Cache-first
  event.respondWith(shellStrategy(request));
});

// ── Helpers ───────────────────────────────────────────────────
function isMapTile(url) {
  return (
    url.hostname.endsWith('tile.openstreetmap.org') &&
    url.pathname.match(/\/\d+\/\d+\/\d+\.(png|jpg)$/)
  );
}

async function shellStrategy(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    // Offline fallback: return cached autodash.html for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/autodash.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

async function tileStrategy(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(TILE_CACHE);
      // Limit tile cache size: evict oldest entries after 300 tiles (~15 MB)
      cache.put(request, response.clone());
      trimCache(TILE_CACHE, 300);
    }
    return response;
  } catch (_) {
    // Return a transparent 1×1 PNG as placeholder when offline
    return new Response(
      atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
      { headers: { 'Content-Type': 'image/png' } }
    );
  }
}

async function trimCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys  = await cache.keys();
    if (keys.length > maxEntries) {
      // Delete oldest entries first
      const excess = keys.slice(0, keys.length - maxEntries);
      await Promise.all(excess.map(k => cache.delete(k)));
    }
  } catch (_) {
    // Trim is best-effort
  }
}
