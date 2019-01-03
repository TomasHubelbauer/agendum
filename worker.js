self.addEventListener('install', async event => {
  const cache = await caches.open('agendum');
  cache.addAll(['index.html', 'index.js', 'index.css']);
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request));
});
