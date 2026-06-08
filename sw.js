const CACHE_NAME = 'sadaqa-static-v2';
const QURAN_CACHE = 'sadaqa-quran-data';

// وقت التسطيب: بنحفظ الملفات الأساسية (HTML و CSS و JS)
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['/', '/index.html', '/manifest.json']);
    })
  );
});

// وقت تفعيل الـ Service Worker
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

// وقت طلب أي داتا (Fetch)
self.addEventListener('fetch', e => {
  // لو الطلب رايح لسيرفر الآيات
  if (e.request.url.includes('api.alquran.cloud')) {
    e.respondWith(
      caches.match(e.request).then(cachedResponse => {
        // لو الداتا موجودة في الموبايل (Cache)، هاتها من غير نت
        if (cachedResponse) return cachedResponse;
        
        // لو مش موجودة، روح هاتها من النت واحفظها للمرات الجاية
        return fetch(e.request).then(networkResponse => {
          return caches.open(QURAN_CACHE).then(cache => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // لو الطلب لملفات عادية (صور، ستايل، الخ)
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request);
      })
    );
  }
});
