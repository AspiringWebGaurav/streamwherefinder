// Enhanced Service Worker for Image Caching
// Optimized for StreamWhereFinder image proxy system

const CACHE_NAME = 'streamwherefinder-images-v1';
const FALLBACK_CACHE_NAME = 'streamwherefinder-fallbacks-v1';
const MAX_CACHE_SIZE = 50; // Maximum number of cached images
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const STALE_WHILE_REVALIDATE_AGE = 24 * 60 * 60 * 1000; // 1 day in milliseconds

// Development mode detection for logging
const isDevelopment = self.location.hostname === 'localhost' || self.location.hostname.includes('localhost') || self.location.hostname.includes('127.0.0.1');

// Conditional logging helper
const devLog = (message, ...args) => {
  if (isDevelopment) {
    console.log(message, ...args);
  }
};

const devWarn = (message, ...args) => {
  if (isDevelopment) {
    console.warn(message, ...args);
  }
};

const devError = (message, ...args) => {
  console.error(message, ...args); // Always log errors
};

// Install event - initialize caches
self.addEventListener('install', (event) => {
  devLog('Service Worker: Install - Image Cache System');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME),
      caches.open(FALLBACK_CACHE_NAME)
    ]).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  devLog('Service Worker: Activate - Cleaning old caches');
  
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      cleanupOldCaches(),
      limitCacheSize()
    ])
  );
});

// Fetch event - handle image requests with smart caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle our image proxy requests
  if (url.pathname === '/api/image' && request.method === 'GET') {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // Pass through all other requests without caching
  event.respondWith(fetch(request));
});

// Handle image requests with stale-while-revalidate strategy
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    const now = Date.now();
    
    // Check if we have a cached response
    if (cachedResponse) {
      const cachedTime = cachedResponse.headers.get('sw-cached-time');
      const age = now - parseInt(cachedTime || '0');
      
      // If cache is still fresh, return it immediately
      if (age < STALE_WHILE_REVALIDATE_AGE) {
        devLog('Service Worker: Serving fresh cached image');
        return cachedResponse;
      }
      
      // If cache is stale but not too old, return it and update in background
      if (age < MAX_CACHE_AGE) {
        devLog('Service Worker: Serving stale cached image, updating in background');
        
        // Return stale cache immediately
        const staleResponse = cachedResponse.clone();
        
        // Update cache in background (don't await)
        updateImageCache(request, cache).catch(error => {
          devWarn('Service Worker: Background cache update failed:', error);
        });
        
        return staleResponse;
      }
      
      // Cache is too old, delete it and fetch fresh
      devLog('Service Worker: Cache too old, fetching fresh');
      await cache.delete(request);
    }
    
    // No cache or cache too old - fetch fresh
    return await fetchAndCacheImage(request, cache);
    
  } catch (error) {
    devError('Service Worker: Image request failed:', error);
    
    // Try to return any cached version as fallback
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        devLog('Service Worker: Returning stale cache as fallback');
        return cachedResponse;
      }
    } catch (fallbackError) {
      devError('Service Worker: Fallback cache failed:', fallbackError);
    }
    
    // If all else fails, try to return the original fetch error
    throw error;
  }
}

// Fetch image and cache it with metadata
async function fetchAndCacheImage(request, cache) {
  try {
    devLog('Service Worker: Fetching fresh image');
    const response = await fetch(request);
    
    // Only cache successful responses
    if (response.ok) {
      // Clone response for caching
      const responseToCache = response.clone();
      
      // Add timestamp header for cache management
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-time', Date.now().toString());
      headers.set('sw-cache-version', '1');
      
      // Create new response with updated headers
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      // Cache the response
      await cache.put(request, cachedResponse);
      devLog('Service Worker: Image cached successfully');
      
      // Clean up cache periodically
      limitCacheSize().catch(error => {
        devWarn('Service Worker: Cache cleanup failed:', error);
      });
    } else {
      devWarn('Service Worker: Not caching failed response:', response.status);
    }
    
    return response;
    
  } catch (error) {
    devError('Service Worker: Fetch failed:', error);
    throw error;
  }
}

// Update image cache in background
async function updateImageCache(request, cache) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('sw-cached-time', Date.now().toString());
      headers.set('sw-cache-version', '1');
      
      const cachedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      });
      
      await cache.put(request, cachedResponse);
      devLog('Service Worker: Background cache update successful');
    }
  } catch (error) {
    devWarn('Service Worker: Background update failed:', error);
  }
}

// Clean up old and invalid cache entries
async function cleanupOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const oldCacheNames = cacheNames.filter(name =>
      name.startsWith('streamwherefinder-') &&
      name !== CACHE_NAME &&
      name !== FALLBACK_CACHE_NAME
    );
    
    await Promise.all(
      oldCacheNames.map(cacheName => {
        devLog('Service Worker: Deleting old cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
    
    // Clean up expired entries in current cache
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    const now = Date.now();
    
    const expiredKeys = [];
    
    for (const request of keys) {
      try {
        const response = await cache.match(request);
        if (response) {
          const cachedTime = response.headers.get('sw-cached-time');
          const age = now - parseInt(cachedTime || '0');
          
          if (age > MAX_CACHE_AGE) {
            expiredKeys.push(request);
          }
        }
      } catch (error) {
        devWarn('Service Worker: Error checking cache entry:', error);
        expiredKeys.push(request);
      }
    }
    
    await Promise.all(
      expiredKeys.map(request => {
        devLog('Service Worker: Deleting expired cache entry');
        return cache.delete(request);
      })
    );
    
    devLog(`Service Worker: Cleaned up ${expiredKeys.length} expired entries`);
    
  } catch (error) {
    devError('Service Worker: Cache cleanup failed:', error);
  }
}

// Limit cache size to prevent storage bloat
async function limitCacheSize() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    if (keys.length <= MAX_CACHE_SIZE) {
      return;
    }
    
    devLog(`Service Worker: Cache size ${keys.length} exceeds limit ${MAX_CACHE_SIZE}`);
    
    // Sort by cache time (oldest first)
    const sortedEntries = [];
    
    for (const request of keys) {
      try {
        const response = await cache.match(request);
        if (response) {
          const cachedTime = parseInt(response.headers.get('sw-cached-time') || '0');
          sortedEntries.push({ request, cachedTime });
        }
      } catch (error) {
        // If we can't read the entry, mark it for deletion
        sortedEntries.push({ request, cachedTime: 0 });
      }
    }
    
    sortedEntries.sort((a, b) => a.cachedTime - b.cachedTime);
    
    // Delete oldest entries
    const entriesToDelete = sortedEntries.slice(0, sortedEntries.length - MAX_CACHE_SIZE);
    
    await Promise.all(
      entriesToDelete.map(entry => {
        devLog('Service Worker: Deleting old cache entry to free space');
        return cache.delete(entry.request);
      })
    );
    
    devLog(`Service Worker: Deleted ${entriesToDelete.length} entries to maintain cache size`);
    
  } catch (error) {
    devError('Service Worker: Cache size limiting failed:', error);
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'CLEAR_IMAGE_CACHE':
      clearImageCache().then(() => {
        event.ports[0]?.postMessage({ success: true });
      }).catch(error => {
        event.ports[0]?.postMessage({ success: false, error: error.message });
      });
      break;
      
    case 'GET_CACHE_INFO':
      getCacheInfo().then(info => {
        event.ports[0]?.postMessage({ success: true, data: info });
      }).catch(error => {
        event.ports[0]?.postMessage({ success: false, error: error.message });
      });
      break;
      
    default:
      devWarn('Service Worker: Unknown message type:', type);
  }
});

// Clear all image cache
async function clearImageCache() {
  try {
    await caches.delete(CACHE_NAME);
    await caches.open(CACHE_NAME);
    devLog('Service Worker: Image cache cleared');
  } catch (error) {
    devError('Service Worker: Failed to clear cache:', error);
    throw error;
  }
}

// Get cache information
async function getCacheInfo() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    return {
      totalEntries: keys.length,
      maxSize: MAX_CACHE_SIZE,
      maxAge: MAX_CACHE_AGE,
      staleAge: STALE_WHILE_REVALIDATE_AGE,
      cacheVersion: CACHE_NAME
    };
  } catch (error) {
    devError('Service Worker: Failed to get cache info:', error);
    throw error;
  }
}

devLog('Service Worker: Enhanced image caching system loaded');