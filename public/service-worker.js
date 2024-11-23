const CACHE_NAME = 'vue-cache-v1';

const CACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/src/main.js',
  '/js/app.js',
  '/js/chunk-vendors.js',
  '/css/app.css'
];

// Fonction pour vérifier si une URL est valide pour la mise en cache
function isValidUrl(url) {
  const urlObject = new URL(url);
  
  // Exclure les URLs non HTTP/HTTPS
  if (!['http:', 'https:'].includes(urlObject.protocol)) {
    return false;
  }

  // Exclure les extensions Chrome
  if (url.startsWith('chrome-extension://')) {
    return false;
  }

  // Vous pouvez ajouter d'autres conditions selon vos besoins
  return true;
}

// Fonction pour envoyer une notification
function sendNotification(title, options = {}) {
  self.registration.showNotification(title, {
    icon: '/logo.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    ...options
  });
}

// Fonction pour notifier tous les clients
function notifyClients(offline) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'CONNECTIVITY_STATUS',
        offline: offline
      });
    });
  });
}

let wasOffline = false;

// Fonction pour vérifier la connexion
async function checkConnectivity() {
  try {
    const response = await fetch('/ping');
    const isOffline = !response.ok;
    
    if (isOffline !== wasOffline) {
      if (isOffline) {
        sendNotification('Mode hors ligne', {
          body: 'Vous êtes actuellement en mode hors ligne',
          tag: 'connectivity'
        });
      } else {
        sendNotification('Connexion rétablie', {
          body: 'Vous êtes de nouveau connecté à Internet',
          tag: 'connectivity'
        });
      }
      notifyClients(isOffline);
      wasOffline = isOffline;
    }
  } catch (error) {
    if (!wasOffline) {
      sendNotification('Mode hors ligne', {
        body: 'Vous êtes actuellement en mode hors ligne',
        tag: 'connectivity'
      });
      notifyClients(true);
      wasOffline = true;
    }
  }
}

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
      setInterval(checkConnectivity, 10000);
      checkConnectivity();
    })
  );
});

// Stratégie de cache modifiée pour gérer les URLs valides
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non valides
 if (!isValidUrl(event.request.url) || event.request.method !== 'GET') {
    return; // Ignore les requêtes non GET ou invalides
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Ne mettre en cache que les réponses valides
        if (response.ok && isValidUrl(event.request.url)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            // Vérifier à nouveau avant de mettre en cache
            try {
              cache.put(event.request, responseClone);
            } catch (error) {
              console.warn('Échec de mise en cache:', error);
            }
          });
          if (wasOffline) {
            checkConnectivity();
          }
        }
        return response;
      })
      .catch(() => {
        if (!wasOffline) {
          checkConnectivity();
        }
        return caches.match(event.request);
      })
  );
});

// Écoute des messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_CONNECTIVITY') {
    checkConnectivity();
  }
});
