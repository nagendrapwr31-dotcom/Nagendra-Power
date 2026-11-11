/**
 * Nexora 15M Sniper Background Service Worker
 * Keeps trading session alive, handles background sync and persistent offline state.
 */

const CACHE_NAME = 'nexora-sniper-v2-purge';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
  console.log('[SW] Service Worker cache purged.');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      }),
    ])
  );
  console.log('[SW] Nexora Background Service Worker activated.');
});

// Background Sync Event: Keeps session alive even if tab closed
self.addEventListener('sync', (event) => {
  if (event.tag === 'nexora-trade-sync' || event.tag === 'nexora-15m-slot') {
    console.log('[SW] Background trade sync triggered:', event.tag);
    event.waitUntil(handleBackgroundSync());
  }
});

// Periodic Background Sync (if supported by browser)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'nexora-periodic-slot') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({
      type: 'SW_SYNC_PULSE',
      timestamp: Date.now(),
    });
  }
}

// Message handler to receive state from main thread
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'KEEP_ALIVE') {
    if (event.source) {
      event.source.postMessage({
        type: 'SW_KEEP_ALIVE_ACK',
        timestamp: Date.now(),
      });
    }
  }
});
