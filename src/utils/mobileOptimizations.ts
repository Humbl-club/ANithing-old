/**
 * Mobile Performance Optimization Utilities
 * Comprehensive mobile-first performance optimizations for 3G networks
 */

// Network detection and adaptation
export interface ConnectionInfo {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export function getConnectionInfo(): ConnectionInfo {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;

  if (!connection) {
    return {
      effectiveType: 'unknown',
      downlink: 1,
      rtt: 100,
      saveData: false
    };
  }

  return {
    effectiveType: connection.effectiveType || '3g',
    downlink: connection.downlink || 1,
    rtt: connection.rtt || 100,
    saveData: connection.saveData || false
  };
}

// Adaptive loading strategies
export function shouldPreload(): boolean {
  const connection = getConnectionInfo();
  
  // Don't preload on slow networks or when user has data saver enabled
  if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    return false;
  }
  
  return true;
}

export function getOptimalImageQuality(): number {
  const connection = getConnectionInfo();
  
  if (connection.saveData) return 30;
  
  switch (connection.effectiveType) {
    case 'slow-2g': return 20;
    case '2g': return 30;
    case '3g': return 60;
    case '4g': return 80;
    default: return 75;
  }
}

export function getOptimalChunkCount(): number {
  const connection = getConnectionInfo();
  
  // Fewer chunks on slower networks to reduce HTTP overhead
  switch (connection.effectiveType) {
    case 'slow-2g':
    case '2g': return 8;
    case '3g': return 12;
    case '4g': return 20;
    default: return 12;
  }
}

// Memory optimization
export function isLowMemoryDevice(): boolean {
  // Chrome's deviceMemory API
  const memory = (navigator as any).deviceMemory;
  if (memory && memory <= 2) return true;
  
  // Fallback detection based on hardware concurrency
  const cores = navigator.hardwareConcurrency;
  if (cores && cores <= 2) return true;
  
  // Check if device is likely mobile based on user agent
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile && !('serviceWorker' in navigator)) return true;
  
  return false;
}

export function getOptimalItemsPerPage(): number {
  const isLowMemory = isLowMemoryDevice();
  const connection = getConnectionInfo();
  
  if (isLowMemory || connection.effectiveType === 'slow-2g') return 10;
  if (connection.effectiveType === '2g') return 15;
  if (connection.effectiveType === '3g') return 20;
  
  return 24; // Default for faster connections
}

// Image optimization
export function generateResponsiveImageSizes(baseWidth: number): string {
  const sizes = [];
  const breakpoints = [320, 640, 768, 1024, 1280, 1920];
  
  for (let i = 0; i < breakpoints.length; i++) {
    const width = Math.min(baseWidth, breakpoints[i]);
    if (i === breakpoints.length - 1) {
      sizes.push(`${width}px`);
    } else {
      sizes.push(`(max-width: ${breakpoints[i]}px) ${width}px`);
    }
  }
  
  return sizes.reverse().join(', ');
}

export function getOptimalImageFormat(): 'webp' | 'avif' | 'jpeg' {
  // Check AVIF support
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  if (canvas.toDataURL('image/avif').indexOf('image/avif') === 5) {
    return 'avif';
  }
  
  // Check WebP support
  if (canvas.toDataURL('image/webp').indexOf('image/webp') === 5) {
    return 'webp';
  }
  
  return 'jpeg';
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  markStart(label: string): void {
    if ('performance' in window && performance.mark) {
      performance.mark(`${label}-start`);
    }
    this.metrics.set(`${label}-start`, Date.now());
  }
  
  markEnd(label: string): number {
    const startTime = this.metrics.get(`${label}-start`);
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    this.metrics.set(label, duration);
    
    if ('performance' in window && performance.mark && performance.measure) {
      try {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);
      } catch (e) {
        // Ignore measurement errors
      }
    }
    
    return duration;
  }
  
  getMetric(label: string): number {
    return this.metrics.get(label) || 0;
  }
  
  getVitals(): {
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
  } {
    const vitals: any = {};
    
    try {
      // First Contentful Paint
      const fcpEntries = performance.getEntriesByName('first-contentful-paint');
      if (fcpEntries.length > 0) {
        vitals.fcp = fcpEntries[0].startTime;
      }
      
      // Largest Contentful Paint (if supported)
      if ('PerformanceObserver' in window) {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            vitals.lcp = entries[entries.length - 1].startTime;
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      }
    } catch (e) {
      // Ignore if performance API is not supported
    }
    
    return vitals;
  }
  
  reportToAnalytics(): void {
    const connection = getConnectionInfo();
    const vitals = this.getVitals();
    const customMetrics = Object.fromEntries(this.metrics);
    
    // Only log in development or send to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Performance Metrics');
      console.log('Connection:', connection);
      console.log('Core Web Vitals:', vitals);
      console.log('Custom Metrics:', customMetrics);
      console.groupEnd();
    }
    
    // TODO: Send to your analytics service
    // analytics.track('performance_metrics', { connection, vitals, customMetrics });
  }
}

// Adaptive component rendering
export function shouldUseVirtualization(itemCount: number): boolean {
  const isLowMemory = isLowMemoryDevice();
  const connection = getConnectionInfo();
  
  // Use virtualization more aggressively on low-end devices
  if (isLowMemory) return itemCount > 20;
  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    return itemCount > 25;
  }
  
  return itemCount > 50;
}

export function getOptimalThumbnailSize(): { width: number; height: number } {
  const connection = getConnectionInfo();
  const isLowMemory = isLowMemoryDevice();
  
  if (isLowMemory || connection.effectiveType === 'slow-2g') {
    return { width: 150, height: 200 };
  }
  
  if (connection.effectiveType === '2g') {
    return { width: 200, height: 267 };
  }
  
  if (connection.effectiveType === '3g') {
    return { width: 250, height: 333 };
  }
  
  return { width: 300, height: 400 }; // 4G and faster
}

// Resource priority hints
export function addResourceHints(): void {
  const head = document.head;
  
  // DNS prefetch for external domains
  const dnsPrefetchDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    's4.anilist.co',
    'img1.ak.crunchyroll.com'
  ];
  
  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    head.appendChild(link);
  });
  
  // Preconnect to critical domains
  const preconnectDomains = ['axtpbgsjbmhbuqomarcr.supabase.co'];
  
  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = `https://${domain}`;
    link.crossOrigin = 'anonymous';
    head.appendChild(link);
  });
}

// CSS optimization
export function injectCriticalCSS(): void {
  const criticalCSS = `
    /* Critical CSS for above-the-fold content */
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #000;
    }
    
    .skeleton {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
    
    .glass-card {
      backdrop-filter: blur(8px);
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    /* Mobile-first responsive grid */
    .responsive-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    
    @media (min-width: 768px) {
      .responsive-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    @media (min-width: 1024px) {
      .responsive-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    
    @media (min-width: 1280px) {
      .responsive-grid {
        grid-template-columns: repeat(5, 1fr);
      }
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
}

// Initialize all optimizations
export function initializeMobileOptimizations(): void {
  // Add resource hints
  addResourceHints();
  
  // Inject critical CSS
  injectCriticalCSS();
  
  // Start performance monitoring
  const monitor = PerformanceMonitor.getInstance();
  monitor.markStart('app-initialization');
  
  // Report metrics after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      monitor.markEnd('app-initialization');
      monitor.reportToAnalytics();
    }, 100);
  });
  
  // Log connection info in development
  if (process.env.NODE_ENV === 'development') {
    const connection = getConnectionInfo();
    console.log('🌐 Connection Info:', connection);
    console.log('📱 Low Memory Device:', isLowMemoryDevice());
    console.log('🖼️ Optimal Image Format:', getOptimalImageFormat());
    console.log('⚡ Should Preload:', shouldPreload());
  }
}

export default {
  getConnectionInfo,
  shouldPreload,
  getOptimalImageQuality,
  getOptimalChunkCount,
  isLowMemoryDevice,
  getOptimalItemsPerPage,
  generateResponsiveImageSizes,
  getOptimalImageFormat,
  PerformanceMonitor,
  shouldUseVirtualization,
  getOptimalThumbnailSize,
  addResourceHints,
  injectCriticalCSS,
  initializeMobileOptimizations
};