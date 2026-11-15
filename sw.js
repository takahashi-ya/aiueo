// あいうえお ひょう：オフラインでも動くようにする仕組み
const V = "aiueo-20261115012713";
const FILES = ["./", "manifest.webmanifest", "icon-192.png", "icon-512.png", "maskable-512.png", "icon-180.png", "voices/tsumugi.json", "voices/himari.json", "voices/takehiro.json", "voices/ryusei.json"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  if (r.mode === "navigate") {
    // ページ本体：電波があれば最新、なければ保存したもの
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put("./", c)); return res; })
      .catch(() => caches.match("./")));
    return;
  }
  // 声・アイコン・文字（フォント）：保存したものを使う
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => {
    if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); }
    return res;
  })));
});
