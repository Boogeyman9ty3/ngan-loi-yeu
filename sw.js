// Offline cache for the iPhone home-screen app.
const CACHE = "ngan-loi-yeu-v2";
const FILES = [
 "./1FTV-VIP-Monttee.ttf",
 "./1FTVVIPBritishGreen-Italic.ttf",
 "./assets/intro/petal-b.webp",
 "./assets/intro/petal.webp",
 "./assets/orbit/orbit-ring-cosmic-soft-01.svg",
 "./assets/orbit/traitimnew.webp",
 "./assets/rain/heart.obj",
 "./assets/rain/Mali.ttf",
 "./assets/vendor/three-bloom-r128.js",
 "./assets/vendor/three-r128.min.js",
 "./icons/icon-180.png",
 "./icons/icon-192.png",
 "./icons/icon-512.png",
 "./index.html",
 "./intro.js",
 "./media/ad094033-2740-4689-9283-44cd5afc291d.jpg",
 "./media/att.kcjirVb6r-Nhdgvt-o9DC0lCd7GzANIYEKUbBnIslIA.jpg",
 "./media/ea3cafd3-cae8-48ad-8e4b-cf660a9ff567.jpg",
 "./media/IMG_6347_59667e8d-d160-4973-bdea-5eea5133dc93.jpg",
 "./media/IMG_6349_479e83b1-ea5c-43c2-8588-463a69b2d060.jpg",
 "./media/v1c044g50000dbtqtjfog65vda4pqorg-mwm96dqqaw6x.mp3",
 "./orbit.js",
 "./photos/new.jpeg",
 "./photos/picture.jpeg",
 "./rain.js",
 "./script.js",
 "./tim/heart-watercolor-coral.png",
 "./tim/heart-watercolor-pink.png",
 "./tim/heart-watercolor-plum.png",
 "./tim.png",
 "./",
 "./manifest.webmanifest"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// iOS Safari asks for audio with a Range header and refuses a plain 200 reply,
// so slice the cached file into a 206 response.
async function rangeResponse(req, res) {
  const buf = await res.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") || "");
  const size = buf.byteLength;
  let start = m && m[1] ? +m[1] : 0, end = m && m[2] ? +m[2] : size - 1;
  if (m && !m[1] && m[2]) { start = size - +m[2]; end = size - 1; }
  end = Math.min(end, size - 1);
  return new Response(buf.slice(start, end + 1), { status: 206, headers: {
    "Content-Type": res.headers.get("Content-Type") || "audio/mpeg",
    "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes" } });
}

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith((async () => {
    const cached = await caches.match(e.request, { ignoreSearch: true });
    if (cached) return e.request.headers.has("range") ? rangeResponse(e.request, cached) : cached;
    try { return await fetch(e.request); }
    catch (err) { return (await caches.match("./index.html")) || Response.error(); }
  })());
});
