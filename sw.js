//I'll be honest here, copied from here: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Offline_Service_workers

//If any files here need updating then you better learn how this properly works because you can NOT just add the files here. I think. That's the thing though, I don't know about any of this.

const cacheName = "yoshmincom-LM2RC-v1";

self.addEventListener("install", (e) => {
	console.log("[Service Worker] Install");
	e.waitUntil(
		(async () => {
			const cache = await caches.open(cacheName);
			console.log("[Service Worker] Caching all: app shell and content");
			//abismal solution but given Chrome's surprising abundance of stupidity in reporting *which* fucking file failed and the fact it works perfectly fine in a localhost, this is more or less the only way to see which file failed to load.
			//oh, and Firefox doesn't even try.
			//fuck all of this.
			await cache.add("./index.html");
			await cache.add("./style.css");
			await cache.add("./script.js");
			await cache.add("./Adlib.ttf");
			await cache.add("./img/bronze.png");
			await cache.add("./img/ghosts.png");
			await cache.add("./img/gloomy_manor.png");
			await cache.add("./img/gold.png");
			//await cache.add("./img/guard_hall.png"); //not actually needed currently
			await cache.add("./img/health.png");
			await cache.add("./img/silver.png");
			await cache.add("./img/time.png");
			await cache.add("./img/treasure.png");
			await cache.add("./logo/16px.png");
			await cache.add("./logo/32px.png");
			await cache.add("./logo/96px.png");
			await cache.add("./logo/144px.png");
			await cache.add("./logo/512px.png");
			await cache.add("./logo/maskable-96px.png");
			await cache.add("./logo/maskable-144px.png");
			await cache.add("./logo/maskable-512px.png");
			await cache.add("./logo/transparent-96px.png");
			await cache.add("./logo/transparent-144px.png");
			await cache.add("./logo/transparent-512px.png");
			await cache.add("./logo/thumbnail.png");
			await cache.add("./logo/thumbnail-long.png");
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