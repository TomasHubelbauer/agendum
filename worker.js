self.addEventListener('install', async event => {
  const cache = await caches.open('agendum');
  cache.addAll(['/', '/index.html', '/index.js', '/index.css']);
});

self.addEventListener('fetch', async event => {
  const response = await caches.match(event.request);
  event.respondWith(response || fetch(event.request));
});
