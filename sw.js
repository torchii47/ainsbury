// Offline support. It always tries the network first, so students get corrections
// straight away, and only uses the saved copy when there's no connection.
// It saves pages and files, not anyone's progress (that stays in localStorage).
//
// Change the version when you change the list below.
const cacheName = 'site-v2';

// The pages come from sitemap.xml, so new pages are included automatically.
// These are the files those pages need.
const files = [
    'index.html', 'css/style.css', 'favicon.svg', 'manifest.webmanifest',
    'js/analytics.js', 'js/site-info.js', 'js/countdown.js', 'js/dates.js', 'js/demos.js',
    'js/question-bank.js', 'js/questions.js', 'js/windows.js',
    'revision/revision.css', 'revision/revision.js', 'revision/debug-challenges.js', 'revision/practice.js',
    'gcse/gcse.css', 'gcse/guide.js', 'gcse/questions.js',
    'pages/report.html', 'pages/search.html'
];

async function saveEverything() {
    const cache = await caches.open(cacheName);
    let pages = [];

    try {
        const sitemap = await (await fetch('sitemap.xml')).text();
        pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
    } catch (error) {
        // Offline pages are a bonus, so a missing sitemap shouldn't stop the rest
    }

    // One failed file shouldn't stop the others being saved
    await Promise.allSettled([...files, ...pages].map(file => cache.add(file)));
}

self.addEventListener('install', event => {
    event.waitUntil(saveEverything().then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names.filter(name => name !== cacheName).map(name => caches.delete(name)));
        await self.clients.claim();
    })());
});

async function respond(request) {
    const cache = await caches.open(cacheName);
    try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
    } catch (error) {
        // Saved files have no ?v= on the end, so ignore that when looking one up
        const saved = await cache.match(request, { ignoreSearch: true });
        if (saved) return saved;
        if (request.mode === 'navigate') {
            return new Response("<!DOCTYPE html><meta charset='utf-8'><title>Offline</title><p>You're offline and this page hasn't been saved yet. Try the <a href='/index.html'>homepage</a>.</p>", {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        }
        throw error;
    }
}

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (event.request.method === 'GET' && url.origin === location.origin) {
        event.respondWith(respond(event.request));
    }
});
