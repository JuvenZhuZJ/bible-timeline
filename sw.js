/*
 * Keeps the site on the device, so a second visit opens at once and the timeline works offline.
 * ------------------------------------------------------------------
 * The deploy stamps every script, stylesheet and image link with the commit (?v=abc1234), so a
 * stamped file never changes: it is served from the cache, and older stamps of the same file are
 * dropped when a new one arrives. The page itself is always asked for first and only comes from
 * the cache when there is no connection. Google Fonts are served from the cache and refreshed.
 */
const CACHE = "bft-site";
const FONTS = "bft-fonts";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) { e.respondWith(fresh(req, FONTS)); return; }
  if (url.origin !== location.origin) return;
  if (req.mode === "navigate" || !url.searchParams.has("v")) { e.respondWith(network(req)); return; }
  e.respondWith(stamped(req, url));
});

// the page, and unstamped files: the network, else the copy kept last time
async function network(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: req.mode === "navigate" });
    if (hit) return hit;
    throw err;
  }
}

// a stamped file: the cache, else the network (and older stamps of it are dropped)
async function stamped(req, url) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) {
    await cache.put(req, res.clone());
    for (const old of await cache.keys()) {
      const o = new URL(old.url);
      if (o.pathname === url.pathname && o.search !== url.search) cache.delete(old);
    }
  }
  return res;
}

// fonts: the cache at once, refreshed in the background
async function fresh(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  const got = fetch(req).then((res) => { if (res.ok || res.type === "opaque") cache.put(req, res.clone()); return res; });
  if (hit) { got.catch(() => {}); return hit; }
  return got;
}
