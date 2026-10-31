const C='fb-v33',A=['./','index.html','manifest.webmanifest','privacy.html','icons/icon-192.png','icons/icon-512.png','icons/favicon-32.png','favicon.ico'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
// only clean up this game's own old caches (the origin is shared with Face-Action)
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('fb-')&&x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
// network-first for the page itself so updates show up; cache-first for everything else
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
  const save=res=>{if(res.ok&&(u.href.includes('mediapipe')||u.origin===self.location.origin)){const cl=res.clone();caches.open(C).then(c=>c.put(e.request,cl))}return res};
  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(save).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(save)))});
