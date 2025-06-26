// TraI Service Worker for PWA functionality and push notifications

const CACHE_NAME = 'trai-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Essential files to cache for offline functionality
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            
            // For navigation requests, return offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // For other requests, return a basic response
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notificationData = {
    title: 'TraI Wellness Reminder',
    body: 'Time for your daily wellness check-in',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'trai-notification',
    requireInteraction: true,
    data: {
      url: '/',
      action: 'mood'
    }
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (e) {
      console.log('[SW] Push data parsing failed, using default notification');
    }
  }

  // Show different notifications based on type
  if (notificationData.type === 'affirmation') {
    notificationData.title = '🌟 Daily Affirmation';
    notificationData.body = notificationData.message || 'Your daily affirmation is ready';
    notificationData.data.action = 'affirmation';
    notificationData.actions = [
      {
        action: 'view',
        title: 'View Affirmation'
      },
      {
        action: 'dismiss',
        title: 'Later'
      }
    ];
  } else if (notificationData.type === 'mood_checkin') {
    notificationData.title = '💙 Mood Check-in';
    notificationData.body = 'How are you feeling today? Share your mood with TraI';
    notificationData.data.action = 'mood';
    notificationData.actions = [
      {
        action: 'mood',
        title: 'Log Mood'
      },
      {
        action: 'dismiss',
        title: 'Skip'
      }
    ];
  } else if (notificationData.type === 'voice_journal') {
    notificationData.title = '🎙️ Voice Journal Reminder';
    notificationData.body = 'Take 30 seconds to share your thoughts';
    notificationData.data.action = 'journal';
    notificationData.actions = [
      {
        action: 'journal',
        title: 'Start Recording'
      },
      {
        action: 'dismiss',
        title: 'Not Now'
      }
    ];
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();

  const action = event.action || 'default';
  const notificationData = event.notification.data || {};
  
  if (action === 'dismiss') {
    return;
  }

  let targetUrl = '/';
  
  if (action === 'mood' || notificationData.action === 'mood') {
    targetUrl = '/?action=mood&notification=true';
  } else if (action === 'journal' || notificationData.action === 'journal') {
    targetUrl = '/?action=journal&notification=true';
  } else if (action === 'view' || notificationData.action === 'affirmation') {
    targetUrl = '/?action=affirmation&notification=true';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            client.postMessage({
              type: 'notification_action',
              action: notificationData.action || action,
              url: targetUrl
            });
            return;
          }
        }
        
        // Open new window if app is not open
        return clients.openWindow(targetUrl);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'mood-sync') {
    event.waitUntil(syncOfflineMoodEntries());
  } else if (event.tag === 'journal-sync') {
    event.waitUntil(syncOfflineJournalEntries());
  }
});

// Sync offline mood entries when connection is restored
async function syncOfflineMoodEntries() {
  try {
    const cache = await caches.open('trai-offline-data');
    const offlineMoods = await cache.match('/offline-moods');
    
    if (offlineMoods) {
      const moodData = await offlineMoods.json();
      
      for (const mood of moodData) {
        try {
          await fetch('/api/mood', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(mood)
          });
        } catch (error) {
          console.log('[SW] Failed to sync mood entry:', error);
        }
      }
      
      // Clear offline cache after successful sync
      await cache.delete('/offline-moods');
      console.log('[SW] Offline mood entries synced successfully');
    }
  } catch (error) {
    console.log('[SW] Mood sync failed:', error);
  }
}

// Sync offline journal entries when connection is restored
async function syncOfflineJournalEntries() {
  try {
    const cache = await caches.open('trai-offline-data');
    const offlineJournals = await cache.match('/offline-journals');
    
    if (offlineJournals) {
      const journalData = await offlineJournals.json();
      
      for (const journal of journalData) {
        try {
          await fetch('/api/journal', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(journal)
          });
        } catch (error) {
          console.log('[SW] Failed to sync journal entry:', error);
        }
      }
      
      // Clear offline cache after successful sync
      await cache.delete('/offline-journals');
      console.log('[SW] Offline journal entries synced successfully');
    }
  } catch (error) {
    console.log('[SW] Journal sync failed:', error);
  }
}

// Periodic background sync for micro-sessions
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);
  
  if (event.tag === 'daily-wellness-reminder') {
    event.waitUntil(scheduleDailyWellnessReminders());
  }
});

// Schedule daily wellness reminders
async function scheduleDailyWellnessReminders() {
  try {
    // Check user preferences for notification timing
    const response = await fetch('/api/user/notification-preferences');
    const preferences = await response.json();
    
    if (preferences.enableReminders) {
      // Schedule affirmation reminder
      if (preferences.affirmationTime) {
        await scheduleNotification('affirmation', preferences.affirmationTime);
      }
      
      // Schedule mood check-in reminder
      if (preferences.moodCheckTime) {
        await scheduleNotification('mood_checkin', preferences.moodCheckTime);
      }
      
      // Schedule voice journal reminder
      if (preferences.journalTime) {
        await scheduleNotification('voice_journal', preferences.journalTime);
      }
    }
  } catch (error) {
    console.log('[SW] Failed to schedule wellness reminders:', error);
  }
}

// Helper function to schedule notifications
async function scheduleNotification(type, timeString) {
  const now = new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  
  // If time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const delay = scheduledTime.getTime() - now.getTime();
  
  setTimeout(() => {
    self.registration.showNotification('TraI Wellness Reminder', {
      body: getNotificationBody(type),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: `trai-${type}-reminder`,
      requireInteraction: true,
      data: {
        type: type,
        action: type === 'voice_journal' ? 'journal' : type === 'affirmation' ? 'affirmation' : 'mood'
      }
    });
  }, delay);
}

// Get notification body text based on type
function getNotificationBody(type) {
  switch (type) {
    case 'affirmation':
      return 'Your daily affirmation is ready to inspire your day 🌟';
    case 'mood_checkin':
      return 'Take a moment to check in with yourself 💙';
    case 'voice_journal':
      return 'Share your thoughts in a quick 30-second voice journal 🎙️';
    default:
      return 'Time for your wellness check-in';
  }
}

// Message handling for communication with main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});