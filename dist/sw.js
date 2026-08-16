// Service Worker for Pomodoro Notification Actions
// Handles background notification click events and relays actions back to open client tabs.

self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification immediately

  const action = event.action;

  // Search for open windows (tabs) of our app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Find an active window client, or fallback to the first one
      const client = clientList.find(c => c.visibilityState === 'visible') || clientList[0];

      if (client) {
        // Post message to the app tab containing the chosen action
        client.postMessage({ action });
        // Focus/bring tab to foreground
        return client.focus();
      } else {
        // If no tabs are open, open a new one
        return clients.openWindow('/');
      }
    })
  );
});
