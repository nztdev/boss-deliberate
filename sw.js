const CACHE = 'deliberate-v1';
const SHELL  = [
  './',
  './index.html',
  './manifest.json',
  '../engine/engine.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Never cache API calls — always network
  if (
    url.includes('api.groq.com') ||
    url.includes('generativelanguage.googleapis.com') ||
    url.includes('api-inference.huggingface.co') ||
    url.includes('openai.com') ||
    url.includes('anthropic.com')
  ) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Cache-first for shell assets
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
