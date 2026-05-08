const CACHE="vitacore-v1",ASSETS=["/","index.html","css/main.css","js/storage.js","js/charts.js","js/pages.js","js/exercises.js","js/app.js","manifest.json"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))))});
self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match("index.html"))))});
self.addEventListener("push",e=>{const d=e.data?e.data.json():{title:"VitaCore",body:"Hora do seu treino!"};e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:"/icons/icon-192.png"}))});
