// Service Worker para funcionalidade offline
const CACHE_NAME = 'conexao-digital-inclusiva-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/sobre.html',
    '/importancia.html',
    '/tecnologias.html',
    '/ods10.html',
    '/comunidade.html',
    '/feedback.html',
    '/dashboard.html',
    '/admin.html',
    '/styles/main.css',
    '/styles/accessibility.css',
    '/js/main.js',
    '/js/accessibility.js',
    '/js/voice-commands.js',
    '/js/chatbot.js',
    '/js/supabase-config.js'
];

// Instalar o service worker
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Interceptar requisições
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - retorna a resposta
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

// Atualizar o service worker
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});