// Minimal service worker — satisfies PWA installability requirements.
// No caching or offline behavior; Convex handles real-time data sync.

self.addEventListener('install', () => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});
