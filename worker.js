self.addEventListener('install', async event => {
  const cache = await caches.open('agendum');
  cache.addAll(['/', '/index.html', '/index.js', '/index.css']);
});

self.addEventListener('fetch', event => {
  // Note that this needs to be called synchronously, so no async/await
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
