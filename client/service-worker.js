// service-worker.js (Minimalversion)

/**
 * Bei einer PWA genügt oft schon ein leerer Service Worker,
 * damit der Browser die Seite als installierbare App erkennt.
 * Du kannst hier später noch Cache-Logik hinzufügen, falls du
 * Assets offline cachen willst.
 */

self.addEventListener('install', (event) => {
  // Direkt aktivieren – wir haben keine spezielle Cache-Logik
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Sofort die Kontrolle übernehmen
  event.waitUntil(self.clients.claim());
});

// (Optional) Fetch-Handler, wenn du später Assets cachen möchtest.
// self.addEventListener('fetch', (event) => { ... });
