//I'll be honest here, copied from here: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Offline_Service_workers

//If any files here need updating then you better learn how this properly works because you can NOT just add the files here. I think. That's the thing though, I don't know about any of this.

const cacheName = "yoshmincom-LM2RC-v1";
const appShellFiles = [
	"./index.html",
	"./style.css",
	"./script.js",
	"./Adlib.tff",
	"./img/bronze.png",
	"./img/ghosts.png",
	"./img/Gloomy Manor.png",
	"./img/gold.png",
	"./img/Guard Hall.png",
	"./img/health.png",
	"./img/silver.png",
	"./img/time.png",
	"./img/treasure.png",
	"./logo/16px.png",
	"./logo/32px.png",
	"./logo/96px.png",
	"./logo/144px.png",
	"./logo/192px.png",
	"./logo/384px.png",
	"./logo/512px.png",
	"./logo/maskable-96px.png",
	"./logo/maskable-144px.png",
	"./logo/maskable-192px.png",
	"./logo/maskable-384px.png",
	"./logo/maskable-512px.png",
	"./logo/transparent-96px.png",
	"./logo/transparent-144px.png",
	"./logo/transparent-192px.png",
	"./logo/transparent-384px.png",
	"./logo/transparent-512px.png",
	"./logo/thumbnail.png",
	"./logo/thumbnail-long.png"
]

self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log("[Service Worker] Caching all: app shell and content");
      await cache.addAll(contentToCache);
    })(),
  );
});

self.addEventListener("fetch", (e) => {
	e.respondWith(
		(async () => {
			const r = await caches.match(e.request);
			console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
			if (r) {
				return r;
			}
			const response = await fetch(e.request);
			const cache = await caches.open(cacheName);
			console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
			cache.put(e.request, response.clone());
			return response;
		})(),
	);
});