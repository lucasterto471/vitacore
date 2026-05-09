const CACHE="vitacore-v6",ASSETS=["./","index.html","css/main.css","js/storage.js?v=6","js/charts.js?v=6","js/pages.js?v=6","js/exercises.js?v=6","js/app.js?v=6","manifest.json"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{e.respondWith(fetch(e.request).then(r=>{if(r&&r.status===200){const c=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html"))))});
self.addEventListener("push",e=>{const d=e.data?e.data.json():{title:"VitaCore",body:"Hora do seu treino!"};e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:"/icons/icon-192.png"}))});
