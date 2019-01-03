self.addEventListener('install', async event => {
  const cache = await caches.open('agendum');
  cache.addAll(['index.html', 'index.js', 'index.css']);
});

self.addEventListener('fetch', event => {
  const match = caches.match(event.request);
  console.log('match', match);
  event.respondWith(match);
});
