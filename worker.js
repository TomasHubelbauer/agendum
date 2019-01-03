self.addEventListener('install', async event => {
  const cache = await caches.open('agendum');
  console.log('Service worker has been installed.', cache);
});
