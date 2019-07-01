const CACHE = 'v1-010';

self.addEventListener('install', event => {
  console.log('Installing version: ', CACHE);

  event.waitUntil(precache());
});

self.addEventListener('activate', event => {
  console.log(`${CACHE} now ready to handle fetches!`);

});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin == location.origin) {
    event.respondWith(getResponse(event.request));
    event.waitUntil(update(event.request).then(refresh));
  }
});

function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll([
      './index.html',
      './assets/css/main.css',
      './assets/images/logo.png',
      './assets/images/logo.svg',
      './assets/module/index.js',
    ]);
  });
}

async function getResponse(request) {
  const cacheResponse = await fromCache(request);
  if (cacheResponse) {
    return cacheResponse;
  }

  const fetchResponse = await fetch(request);
  return fetchResponse;
}

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request);
  });
};

async function update(request) {
  const cache = await caches.open(CACHE);
  const old = await cache.match(request);
  const oldETag = old && old.headers.get('ETag');

  const response  = await fetch(request);
  const newETag = response.headers.get('ETag');
  await cache.put(request, response.clone());

  return {
    isNewETag: oldETag && oldETag !== newETag,
    response,
  }
}

function refresh({ isNewETag = false, response = {} }) {
  return self.clients.matchAll()
    .then(function (clients) {
      clients.forEach(function (client) {
        if (isNewETag) {
          const message = {
            type: 'refresh',
            url: response.url,
          };

          client.postMessage(JSON.stringify(message));
        }
      });
    })
};
