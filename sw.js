const CACHE_NAME = 'sadaqa-static-v3';
const QURAN_CACHE = 'sadaqa-quran-data';
const AUDIO_CACHE = 'sadaqa-audio-cache';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['/', '/index.html', '/manifest.json']);
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  
  // لو الطلب رايح لـ API الآيات أو ملفات الصوت
  if (url.includes('api.alquran.cloud') || url.includes('mp3quran.net') || url.includes('islamic.network')) {
    e.respondWith(
      caches.match(e.request).then(cachedResponse => {
        // لو متخزن في الموبايل هاته أوفلاين
        if (cachedResponse) return cachedResponse;
        
        return fetch(e.request).then(networkResponse => {
          // بنخزن الآيات بس تلقائي عشان مساحتها صغيرة
          if (url.includes('api.alquran.cloud')) {
              const clonedResponse = networkResponse.clone();
              caches.open(QURAN_CACHE).then(cache => {
                cache.put(e.request, clonedResponse);
              });
          }
          // ملفات الصوت مش بنخزنها تلقائي، بنسيبها لزرار التحميل اللي عملناه
          return networkResponse;
        });
      })
    );
  } else {
    // ملفات التطبيق العادية
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request);
      })
    );
  }
});
