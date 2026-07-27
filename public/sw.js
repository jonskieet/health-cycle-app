// Module F7 — PWA cơ bản.
// Service worker tối giản: chỉ cache app shell (trang chủ + icon) để app mở được
// (dù có thể không có dữ liệu mới) khi mất mạng, KHÔNG cache API/Supabase call —
// dữ liệu sức khỏe luôn cần mới nhất, không nên phục vụ từ cache.
const CACHE_NAME = "kvcycle-shell-v1";
const SHELL_URLS = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Không đụng vào API nội bộ hay Supabase — luôn lấy mạng, không fallback cache,
  // để tránh hiển thị dữ liệu sức khỏe cũ mà tưởng là mới.
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase.co")) return;

  // Điều hướng trang (navigation): network-first, fallback về trang chủ đã cache
  // khi mất mạng — cho cảm giác "mở được app" thay vì lỗi trắng trình duyệt.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/").then((r) => r || Response.error()))
    );
    return;
  }

  // Tài nguyên tĩnh (icon, manifest...): cache-first.
  if (SHELL_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});
