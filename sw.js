// Math Cloud Tech service worker – bump VERSION on every deploy to push updates
const VERSION='mct-v5',SHELL=['./','./index.html','./firebase-config.js','./manifest.json','./logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  const ours=u.origin===location.origin,lib=u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/');
  if(!ours&&!lib)return;
  if(ours&&/admin/i.test(u.pathname))return; // admin pages are never cached // never touch database/auth traffic
  if(r.mode==='navigate'){ // network first, offline fallback
    e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(VERSION).then(h=>h.put('./index.html',c));return x}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(r).then(h=>{const n=fetch(r).then(x=>{if(x&&(x.ok||x.type==='opaque'))caches.open(VERSION).then(c=>c.put(r,x.clone()));return x}).catch(()=>h);return h||n}));
});
