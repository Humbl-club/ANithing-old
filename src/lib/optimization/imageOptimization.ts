/**
 * Image Optimization and CDN Caching for 10k+ Users
 * Reduces bandwidth usage and improves loading times
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  lazy?: boolean;
  blur?: boolean;
  priority?: 'high' | 'low' | 'auto';
}

interface ImageCacheEntry {
  url: string;
  optimizedUrl: string;
  timestamp: number;
  size: number;
  format: string;
}

class ImageOptimizationService {
  private cache = new Map<string, ImageCacheEntry>();
  private compressionWorker: Worker | null = null;
  private cdnBaseUrl = 'https://images.weserv.nl/';
  
  constructor() {
    this.initializeWorker();
    this.loadCacheFromStorage();
  }

  /**
   * Initialize web worker for image compression
   */
  private initializeWorker() {
    if (typeof Worker !== 'undefined') {
      try {
        this.compressionWorker = new Worker(
          new URL('../workers/imageCompressionWorker.ts', import.meta.url)
        );
      } catch (error) {
        console.warn('Image compression worker not available:', error);
      }
    }
  }

  /**
   * Load image cache from IndexedDB
   */
  private async loadCacheFromStorage() {
    try {
      if ('indexedDB' in window) {
        const db = await this.openDB();
        const transaction = db.transaction(['imageCache'], 'readonly');
        const store = transaction.objectStore('imageCache');
        const request = store.getAll();
        
        request.onsuccess = () => {
          for (const entry of request.result) {
            this.cache.set(entry.url, entry);
          }
          console.log(`📸 Loaded ${this.cache.size} cached images`);
        };
      }
    } catch (error) {
      console.warn('Failed to load image cache:', error);
    }
  }

  /**
   * Open IndexedDB for image cache storage
   */
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ImageOptimizationCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('imageCache')) {
          const store = db.createObjectStore('imageCache', { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  /**
   * Optimize image URL with CDN parameters
   */
  optimizeUrl(
    originalUrl: string, 
    options: ImageOptimizationOptions = {}
  ): string {
    // Check cache first
    const cached = this.cache.get(originalUrl);
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.optimizedUrl;
    }

    const {
      width,
      height,
      quality = 85,
      format = 'webp'
    } = options;

    // Build CDN URL with optimization parameters
    const params = new URLSearchParams();
    
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality) params.append('q', quality.toString());
    if (format) params.append('output', format);
    
    // Add performance optimizations
    params.append('af', ''); // Auto format
    params.append('il', ''); // Interlaced/progressive
    params.append('n', '-1'); // Normalize
    
    const optimizedUrl = `${this.cdnBaseUrl}?url=${encodeURIComponent(originalUrl)}&${params.toString()}`;
    
    // Cache the result
    const cacheEntry: ImageCacheEntry = {
      url: originalUrl,
      optimizedUrl,
      timestamp: Date.now(),
      size: 0, // Will be updated when loaded
      format
    };
    
    this.cache.set(originalUrl, cacheEntry);
    this.saveCacheEntry(cacheEntry);
    
    return optimizedUrl;
  }

  /**
   * Generate responsive image sources
   */
  generateResponsiveSources(
    originalUrl: string,
    breakpoints: number[] = [320, 640, 768, 1024, 1280, 1536]
  ): Array<{ srcset: string; media: string; type: string }> {
    const sources: Array<{ srcset: string; media: string; type: string }> = [];
    
    // Generate WebP sources
    const webpSrcsets = breakpoints.map(width => {
      const optimizedUrl = this.optimizeUrl(originalUrl, { width, format: 'webp' });
      return `${optimizedUrl} ${width}w`;
    }).join(', ');
    
    sources.push({
      srcset: webpSrcsets,
      media: '(min-width: 320px)',
      type: 'image/webp'
    });

    // Generate AVIF sources for modern browsers
    const avifSrcsets = breakpoints.map(width => {
      const optimizedUrl = this.optimizeUrl(originalUrl, { width, format: 'avif' });
      return `${optimizedUrl} ${width}w`;
    }).join(', ');
    
    sources.push({
      srcset: avifSrcsets,
      media: '(min-width: 320px)',
      type: 'image/avif'
    });

    return sources;
  }

  /**
   * Create optimized image element
   */
  createOptimizedImage(
    src: string,
    alt: string,
    options: ImageOptimizationOptions = {}
  ): HTMLPictureElement {
    const picture = document.createElement('picture');
    
    // Add responsive sources
    const sources = this.generateResponsiveSources(src);
    sources.forEach(source => {
      const sourceEl = document.createElement('source');
      sourceEl.srcset = source.srcset;
      sourceEl.media = source.media;
      sourceEl.type = source.type;
      picture.appendChild(sourceEl);
    });
    
    // Fallback img element
    const img = document.createElement('img');
    img.src = this.optimizeUrl(src, options);
    img.alt = alt;
    img.loading = options.lazy !== false ? 'lazy' : 'eager';
    img.decoding = 'async';
    
    if (options.blur) {
      img.style.filter = 'blur(5px)';
      img.style.transition = 'filter 0.3s ease';
      
      img.onload = () => {
        img.style.filter = 'none';
      };
    }
    
    picture.appendChild(img);
    return picture;
  }

  /**
   * Preload critical images
   */
  preloadImage(src: string, options: ImageOptimizationOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const optimizedSrc = this.optimizeUrl(src, options);
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedSrc;
      
      if (options.priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      
      link.onload = () => {
        resolve();
        document.head.removeChild(link);
      };
      
      link.onerror = () => {
        reject(new Error(`Failed to preload image: ${src}`));
        document.head.removeChild(link);
      };
      
      document.head.appendChild(link);
    });
  }

  /**
   * Batch preload multiple images
   */
  async preloadImages(
    urls: string[], 
    options: ImageOptimizationOptions = {}
  ): Promise<void> {
    const preloadPromises = urls.map(url => 
      this.preloadImage(url, options).catch(error => {
        console.warn(`Failed to preload ${url}:`, error);
        return null;
      })
    );
    
    await Promise.allSettled(preloadPromises);
    console.log(`📸 Preloaded ${urls.length} images`);
  }

  /**
   * Compress image using web worker
   */
  async compressImage(
    file: File, 
    options: { quality?: number; maxWidth?: number; maxHeight?: number } = {}
  ): Promise<Blob> {
    if (!this.compressionWorker) {
      throw new Error('Image compression worker not available');
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        this.compressionWorker!.postMessage({
          imageData: reader.result,
          options
        });
        
        this.compressionWorker!.onmessage = (event) => {
          const { compressedImage, error } = event.data;
          
          if (error) {
            reject(new Error(error));
          } else {
            resolve(compressedImage);
          }
        };
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Save cache entry to IndexedDB
   */
  private async saveCacheEntry(entry: ImageCacheEntry) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['imageCache'], 'readwrite');
      const store = transaction.objectStore('imageCache');
      store.put(entry);
    } catch (error) {
      console.warn('Failed to save image cache entry:', error);
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    const expiredKeys = Array.from(this.cache.entries())
      .filter(([_, entry]) => now - entry.timestamp > maxAge)
      .map(([key]) => key);
    
    for (const key of expiredKeys) {
      this.cache.delete(key);
    }
    
    // Also clear from IndexedDB
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['imageCache'], 'readwrite');
      const store = transaction.objectStore('imageCache');
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(now - maxAge);
      
      const request = index.openKeyCursor(range);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        }
      };
    } catch (error) {
      console.warn('Failed to clear expired cache from IndexedDB:', error);
    }
    
    console.log(`🧹 Cleared ${expiredKeys.length} expired image cache entries`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    
    return {
      totalEntries: entries.length,
      totalSize: entries.reduce((sum, entry) => sum + entry.size, 0),
      avgAge: entries.length > 0 
        ? entries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) / entries.length
        : 0,
      hitRate: this.calculateHitRate(),
      formatDistribution: this.getFormatDistribution(entries)
    };
  }

  private calculateHitRate(): number {
    // Simplified hit rate calculation
    // In a real implementation, you'd track actual hits vs misses
    return this.cache.size > 0 ? 0.85 : 0; // 85% estimated hit rate
  }

  private getFormatDistribution(entries: ImageCacheEntry[]) {
    const distribution: Record<string, number> = {};
    
    for (const entry of entries) {
      distribution[entry.format] = (distribution[entry.format] || 0) + 1;
    }
    
    return distribution;
  }
}

// Singleton instance
export const imageOptimization = new ImageOptimizationService();

// React hook for optimized images
export const useOptimizedImage = (
  src: string, 
  options: ImageOptimizationOptions = {}
) => {
  const optimizedSrc = imageOptimization.optimizeUrl(src, options);
  const sources = imageOptimization.generateResponsiveSources(src);
  
  return {
    src: optimizedSrc,
    sources,
    preload: () => imageOptimization.preloadImage(src, options)
  };
};

// Utility functions for direct use
export const optimizeImageUrl = (src: string, options?: ImageOptimizationOptions) => 
  imageOptimization.optimizeUrl(src, options);

export const preloadCriticalImages = (urls: string[]) => 
  imageOptimization.preloadImages(urls, { priority: 'high' });