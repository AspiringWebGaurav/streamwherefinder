// Performance monitoring and optimization for image loading system
// Tracks metrics like load times, error rates, cache hits, and web vitals

interface ImageLoadEvent {
  src: string | null;
  timestamp: number;
  duration?: number;
  success: boolean;
  fromCache: boolean;
  errorType?: string;
  retryCount: number;
  imageSize?: { width: number; height: number };
  bytesLoaded?: number;
}

interface PerformanceMetrics {
  totalRequests: number;
  successfulLoads: number;
  failedLoads: number;
  fallbacksUsed: number;
  cacheHits: number;
  averageLoadTime: number;
  errorRate: number;
  cacheHitRate: number;
  fallbackRate: number;
  totalBytesLoaded: number;
  slowLoadThreshold: number;
  slowLoads: number;
  retryAttempts: number;
  uniqueImages: Set<string>;
}

class ImagePerformanceMonitor {
  private events: ImageLoadEvent[] = [];
  private metrics: PerformanceMetrics = {
    totalRequests: 0,
    successfulLoads: 0,
    failedLoads: 0,
    fallbacksUsed: 0,
    cacheHits: 0,
    averageLoadTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
    fallbackRate: 0,
    totalBytesLoaded: 0,
    slowLoadThreshold: 3000, // 3 seconds
    slowLoads: 0,
    retryAttempts: 0,
    uniqueImages: new Set()
  };
  
  private maxEvents = 1000; // Keep only recent events
  private observers = new Set<(metrics: PerformanceMetrics) => void>();

  // Track image load start
  trackLoadStart(src: string | null): string {
    const eventId = `${Date.now()}-${Math.random()}`;
    
    const event: ImageLoadEvent = {
      src,
      timestamp: performance.now(),
      success: false,
      fromCache: false,
      retryCount: 0
    };
    
    this.events.push(event);
    this.updateMetrics();
    
    return eventId;
  }

  // Track successful image load
  trackLoadSuccess(
    eventId: string, 
    src: string | null, 
    fromCache: boolean = false,
    bytesLoaded?: number
  ) {
    const startTime = performance.now();
    const event = this.findEventBySrc(src, startTime - 10000); // Look within 10s
    
    if (event) {
      event.success = true;
      event.fromCache = fromCache;
      event.duration = performance.now() - event.timestamp;
      event.bytesLoaded = bytesLoaded;
    } else {
      // Create new event if not found
      this.events.push({
        src,
        timestamp: startTime - 100, // Approximate start
        duration: 100,
        success: true,
        fromCache,
        retryCount: 0,
        bytesLoaded
      });
    }
    
    this.updateMetrics();
    this.notifyObservers();
  }

  // Track image load failure
  trackLoadError(
    eventId: string,
    src: string | null,
    errorType: string,
    retryCount: number = 0
  ) {
    const startTime = performance.now();
    const event = this.findEventBySrc(src, startTime - 10000);
    
    if (event) {
      event.success = false;
      event.duration = performance.now() - event.timestamp;
      event.errorType = errorType;
      event.retryCount = retryCount;
    } else {
      this.events.push({
        src,
        timestamp: startTime - 100,
        duration: 100,
        success: false,
        fromCache: false,
        errorType,
        retryCount
      });
    }
    
    this.updateMetrics();
    this.notifyObservers();
  }

  // Track fallback usage
  trackFallback(src: string | null, reason: string) {
    const event: ImageLoadEvent = {
      src,
      timestamp: performance.now(),
      duration: 0,
      success: false,
      fromCache: false,
      errorType: `fallback_${reason}`,
      retryCount: 0
    };
    
    this.events.push(event);
    this.metrics.fallbacksUsed++;
    this.updateMetrics();
    this.notifyObservers();
  }

  // Get current performance metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics, uniqueImages: new Set(this.metrics.uniqueImages) };
  }

  // Get detailed events for debugging
  getRecentEvents(count: number = 100): ImageLoadEvent[] {
    return this.events.slice(-count);
  }

  // Subscribe to metric updates
  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  // Clear all data
  reset() {
    this.events = [];
    this.metrics = {
      totalRequests: 0,
      successfulLoads: 0,
      failedLoads: 0,
      fallbacksUsed: 0,
      cacheHits: 0,
      averageLoadTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
      fallbackRate: 0,
      totalBytesLoaded: 0,
      slowLoadThreshold: 3000,
      slowLoads: 0,
      retryAttempts: 0,
      uniqueImages: new Set()
    };
    this.notifyObservers();
  }

  // Export data for analysis
  exportData() {
    return {
      metrics: this.getMetrics(),
      events: this.events,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : null
    };
  }

  // Private methods
  private findEventBySrc(src: string | null, since: number): ImageLoadEvent | undefined {
    return this.events
      .reverse()
      .find(event => event.src === src && event.timestamp > since);
  }

  private updateMetrics() {
    const recentEvents = this.events.slice(-this.maxEvents);
    this.events = recentEvents;

    this.metrics.totalRequests = recentEvents.length;
    this.metrics.successfulLoads = recentEvents.filter(e => e.success).length;
    this.metrics.failedLoads = recentEvents.filter(e => !e.success && !e.errorType?.startsWith('fallback_')).length;
    this.metrics.cacheHits = recentEvents.filter(e => e.fromCache).length;
    this.metrics.retryAttempts = recentEvents.reduce((sum, e) => sum + e.retryCount, 0);
    
    // Calculate rates
    this.metrics.errorRate = this.metrics.totalRequests > 0 
      ? this.metrics.failedLoads / this.metrics.totalRequests 
      : 0;
    
    this.metrics.cacheHitRate = this.metrics.totalRequests > 0 
      ? this.metrics.cacheHits / this.metrics.totalRequests 
      : 0;
    
    this.metrics.fallbackRate = this.metrics.totalRequests > 0 
      ? this.metrics.fallbacksUsed / this.metrics.totalRequests 
      : 0;

    // Calculate average load time
    const successfulEvents = recentEvents.filter(e => e.success && e.duration);
    this.metrics.averageLoadTime = successfulEvents.length > 0
      ? successfulEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / successfulEvents.length
      : 0;

    // Calculate slow loads
    this.metrics.slowLoads = successfulEvents.filter(
      e => (e.duration || 0) > this.metrics.slowLoadThreshold
    ).length;

    // Calculate total bytes loaded
    this.metrics.totalBytesLoaded = recentEvents
      .filter(e => e.bytesLoaded)
      .reduce((sum, e) => sum + (e.bytesLoaded || 0), 0);

    // Track unique images
    this.metrics.uniqueImages.clear();
    recentEvents.forEach(e => {
      if (e.src) {
        this.metrics.uniqueImages.add(e.src);
      }
    });
  }

  private notifyObservers() {
    this.observers.forEach(callback => {
      try {
        callback(this.getMetrics());
      } catch (error) {
        console.error('Image performance observer error:', error);
      }
    });
  }
}

// Singleton instance
export const imagePerformanceMonitor = new ImagePerformanceMonitor();

// Web Vitals integration for images
export class ImageWebVitalsTracker {
  private clsObserver?: PerformanceObserver;
  private lcpObserver?: PerformanceObserver;
  private imageElements = new WeakSet<HTMLImageElement>();

  constructor() {
    this.initCLSObserver();
    this.initLCPObserver();
  }

  // Track an image element for CLS monitoring
  trackImageElement(img: HTMLImageElement) {
    this.imageElements.add(img);
  }

  // Initialize Cumulative Layout Shift observer
  private initCLSObserver() {
    try {
      this.clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            const clsEntry = entry as any; // LayoutShift entry type
            if (process.env.NODE_ENV === 'development') {
              console.log('CLS detected:', clsEntry.value);
              // Log significant layout shifts
              if (clsEntry.value > 0.1) {
                console.warn('Significant CLS detected:', clsEntry.value);
              }
            }
          }
        }
      });
      
      this.clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS observer not supported:', error);
    }
  }

  // Initialize Largest Contentful Paint observer
  private initLCPObserver() {
    try {
      this.lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry) {
          const lcpEntry = lastEntry as any; // LargestContentfulPaint entry type
          if (process.env.NODE_ENV === 'development') {
            console.log('LCP:', lcpEntry.startTime, lcpEntry.element);
            
            // Check if LCP element is one of our tracked images
            if (lcpEntry.element && this.imageElements.has(lcpEntry.element as HTMLImageElement)) {
              console.log('LCP is a tracked image element');
            }
          }
        }
      });
      
      this.lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP observer not supported:', error);
    }
  }

  disconnect() {
    this.clsObserver?.disconnect();
    this.lcpObserver?.disconnect();
  }
}

// Bandwidth optimization utilities
export const ImageBandwidthOptimizer = {
  // Get optimal image size based on connection
  getOptimalSize(baseWidth: number, baseHeight: number): { width: number; height: number } {
    const connection = (navigator as any).connection;
    
    if (!connection) {
      return { width: baseWidth, height: baseHeight };
    }

    const effectiveType = connection.effectiveType;
    let scaleFactor = 1;

    switch (effectiveType) {
      case 'slow-2g':
        scaleFactor = 0.5;
        break;
      case '2g':
        scaleFactor = 0.7;
        break;
      case '3g':
        scaleFactor = 0.85;
        break;
      case '4g':
      default:
        scaleFactor = 1;
        break;
    }

    return {
      width: Math.round(baseWidth * scaleFactor),
      height: Math.round(baseHeight * scaleFactor)
    };
  },

  // Check if connection is slow
  isSlowConnection(): boolean {
    const connection = (navigator as any).connection;
    if (!connection) return false;
    
    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g' ||
           connection.saveData === true;
  },

  // Get recommended image format based on browser support
  getOptimalFormat(): 'webp' | 'avif' | 'jpeg' {
    // Check for AVIF support
    const avifSupport = document.createElement('canvas')
      .toDataURL('image/avif').indexOf('data:image/avif') === 0;
    
    if (avifSupport) return 'avif';
    
    // Check for WebP support
    const webpSupport = document.createElement('canvas')
      .toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    if (webpSupport) return 'webp';
    
    return 'jpeg';
  }
};

// Export the web vitals tracker instance
export const imageWebVitalsTracker = new ImageWebVitalsTracker();

// Development helper for debugging
export const ImageDebugger = {
  logMetrics() {
    console.table(imagePerformanceMonitor.getMetrics());
  },

  logRecentEvents(count = 20) {
    console.table(imagePerformanceMonitor.getRecentEvents(count));
  },

  exportToClipboard() {
    const data = imagePerformanceMonitor.exportData();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      .then(() => console.log('Performance data exported to clipboard'))
      .catch(err => console.error('Failed to export data:', err));
  }
};

// Make debugging available globally in development (browser only)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).imageDebugger = ImageDebugger;
  (window as any).imagePerformanceMonitor = imagePerformanceMonitor;
}