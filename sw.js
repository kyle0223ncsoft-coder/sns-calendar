// SNS 캘린더 Service Worker — 백그라운드 알림 지원
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // 이미 열린 탭이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes('sns-calendar') && 'focus' in client) {
          return client.focus();
        }
      }
      // 없으면 새 탭
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});
