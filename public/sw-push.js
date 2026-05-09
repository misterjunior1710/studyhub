/* StudyHub web push handler — loaded via importScripts in workbox SW */
/* eslint-disable no-restricted-globals */

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: "StudyHub", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "StudyHub";
  const options = {
    body: data.body || "",
    icon: data.icon || "/pwa-192x192.png",
    badge: data.badge || "/pwa-192x192.png",
    tag: data.tag || "studyhub-push",
    renotify: !!data.renotify,
    data: { url: data.url || "/", ...data.data },
    requireInteraction: !!data.requireInteraction,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of allClients) {
        try {
          const url = new URL(client.url);
          if (url.origin === self.location.origin) {
            await client.focus();
            client.postMessage({ type: "PUSH_NAVIGATE", url: targetUrl });
            return;
          }
        } catch (_) { /* ignore */ }
      }
      await self.clients.openWindow(targetUrl);
    })()
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  // Browser may rotate the subscription; client will refresh on next page load.
  event.waitUntil(Promise.resolve());
});
