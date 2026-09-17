const CACHE_NAME = "clipflow-shell-v1";
const APP_SHELL = ["/", "/dashboard", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))) ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((response) => response || caches.match("/dashboard"))));
});

self.addEventListener("push", (event) => {
  let data = { title: "ClipFlow", body: "มีการแจ้งเตือนใหม่", url: "/notifications" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (_) {
    if (event.data) data.body = event.data.text();
  }
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icon.svg",
    badge: "/icon.svg",
    data: { url: data.url },
  }));
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "SHOW_NOTIFICATION") return;
  event.waitUntil(
    self.registration.showNotification(event.data.title || "ClipFlow", {
      body: event.data.body || "มีการแจ้งเตือนใหม่",
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: event.data.url || "/notifications" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/notifications"));
});
