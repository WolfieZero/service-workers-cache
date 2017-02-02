/**
 * Name of the cache.
 *
 * @type {string}
 */
const CACHE_NAME = 'zero';

/**
 * Version of the cache running.
 *
 * @type {string}
 */
const CACHE_VERSION = 'v1.0.0';

/**
 * Reference creted from `CACHE_NAME` and `CACHE_VERSION`.
 *
 * @type {string}
 */
const CACHE_REF = CACHE_NAME + '::' + CACHE_VERSION;

/**
 * Service worker will be installed when all these are cached.
 *
 * @type {string[]}
 */
const CACHE_FILES_PRIORITY = [
    '/',
    'app.js',
    'app.css',
    'index.html',
    'offline.html',
];

/**
 * Added to the cache in their own time.
 *
 * @type {string[]}
 */
const CACHE_FILES_BACKGROUND = [
    'images/animated.gif'
];


/**
 * Update the cache with the files specified in `CACHE_FILES_PRIORITY`
 * and `CACHE_FILES_BACKGROUND` constants.
 *
 * @return {Promise}
 */
const updateCache = () => {
    return caches.open(CACHE_REF)
        .then((cache) => {
            cache.addAll(CACHE_FILES_BACKGROUND);
            return cache.addAll(CACHE_FILES_PRIORITY)
        });
};


/**
 * Any request that comes through we will be serving it from the cache.
 * If a request isn't in the cache, we serve `offline.html` instead.
 *
 * @return {Promise}
 */
const requestFromCache = (request) => {

    return caches.match(request)
        .then(response => {
            console.log(request);

            if (request.method !== 'GET') {
                return fetch(request);
            }

            if (request.headers.get('Accept').indexOf('text/html') !== -1) {
                // If a HTML request then we want to return the file from cache
                // OR the `offline.html` file if `undefined`
                return response || caches.match('/offline.html')
            }

            // All other responses we can check if it's in the cache and return
            // OR if `undefined` then return the request in hopes
            // we get something
            return response || fetch(request);
        })
        .catch(error => {
            // If the `fetch()` function didn't work then we can deal with
            // requests we cannot resolve.
            if (request.headers.get('Accept').indexOf('image') !== -1) {
                // If an image then we should return a placeholder.
                // Using an SVG like this means we aren't relying on any
                // external resource and provide feedback to the view.
                return new Response(
                    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><text style="text-anchor: middle; font-family: sans-serif;" fill-opacity="0.25" x="50%" y="50%">image unavaliable offline</text></svg>',
                    {headers: {'Content-Type': 'image/svg+xml'}}
                );
            }
            return new Response();
        });
};


/**
 * Clears the cache if the key is different to the one specfied
 * in `CACHE_REF`.
 *
 * @return {Promise}
 */
const clearCache = () => {
    return caches.keys()
        .then(keys => {
            return Promise.all(keys.map((key, i) => {
                if (key !== CACHE_REF){
                    return caches.delete(keys[i]);
                }
            }))
        });
};


self.addEventListener('install', event => {
    event.waitUntil(updateCache());
});


self.addEventListener('fetch', event => {
    event.respondWith(requestFromCache(event.request));
});


self.addEventListener('activate', event => {
    event.waitUntil(clearCache());
});

