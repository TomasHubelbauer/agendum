self.addEventListener('install', async event => {
  const cache = await caches.open('agendum');
  cache.addAll(['index.html', 'index.js', 'index.css']);
});

self.addEventListener('fetch', async event => {
  const cache = await caches.open('agendum');
  event.respondWith(cache.match(event.request));
});
