self.addEventListener('install', async event => {
  const cache = await caches.open('agendum');
  cache.addAll(['index.html', 'index.js', 'index.css']);
});

self.addEventListener('fetch', async event => {
  event.respondWith(await caches.match(event.request));
});
