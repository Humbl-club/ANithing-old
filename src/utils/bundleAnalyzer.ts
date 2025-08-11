/**
 * Bundle analysis utilities for monitoring chunk sizes and performance
*/

export interface ChunkInfo {
  name: string;
  size: number;
  gzipSize?: number;
  imports: string[];
  type: 'vendor' | 'feature' | 'page' | 'shared';
}

export interface BundleAnalysis {
  totalSize: number;
  totalGzipSize: number;
  chunks: ChunkInfo[];
  recommendations: string[];
  score: number; // 0-100
}

/**
 * Client-side bundle analysis (development only)
*/
export class BundleAnalyzer {
  private static readonly CHUNK_SIZE_LIMITS = {
    vendor: 500 * 1024, // 500KB
    feature: 100 * 1024, // 100KB  
    page: 200 * 1024,    // 200KB
    shared: 150 * 1024   // 150KB
  };

  /**
/**
 * Analyze current bundle performance in development
*/
  static async analyzeBundlePerformance(): Promise<BundleAnalysis> {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Bundle analysis only available in development');
    }

    const modules = await this.getLoadedModules();
    const chunks = this.categorizeModules(modules);
    const recommendations = this.generateRecommendations(chunks);
    const score = this.calculatePerformanceScore(chunks);

    return {
      totalSize: chunks.reduce((sum, chunk) => sum + chunk.size, 0),
      totalGzipSize: chunks.reduce((sum, chunk) => sum + (chunk.gzipSize || chunk.size * 0.3), 0),
      chunks,
      recommendations,
      score
    };
  }

  private static async getLoadedModules(): Promise<any[]> {
    // In a real implementation, this would use webpack stats or similar
    // For now, return mock data based on our known chunks
    return [
      { name: 'react-vendor', size: 410 * 1024, type: 'vendor' },
      { name: 'utils-vendor', size: 1978 * 1024, type: 'vendor' }, // This is large!
      { name: 'supabase', size: 124 * 1024, type: 'vendor' },
      { name: 'shared-components', size: 177 * 1024, type: 'shared' },
      { name: 'features-content', size: 7 * 1024, type: 'feature' },
      { name: 'features-social', size: 12 * 1024, type: 'feature' },
      { name: 'features-search', size: 25 * 1024, type: 'feature' },
      { name: 'features-other', size: 62 * 1024, type: 'feature' },
      { name: 'pages-content', size: 56 * 1024, type: 'page' },
      { name: 'pages-home', size: 11 * 1024, type: 'page' },
      { name: 'pages-other', size: 47 * 1024, type: 'page' }
    ];
  }

  private static categorizeModules(modules: any[]): ChunkInfo[] {
    return modules.map(module => ({
      name: module.name,
      size: module.size,
      gzipSize: module.size * 0.3, // Estimated gzip compression
      imports: [], // Would be populated from webpack stats
      type: this.inferChunkType(module.name)
    }));
  }

  private static inferChunkType(name: string): ChunkInfo['type'] {
    if (name.includes('vendor')) return 'vendor';
    if (name.includes('features')) return 'feature';
    if (name.includes('pages')) return 'page';
    return 'shared';
  }

  private static generateRecommendations(chunks: ChunkInfo[]): string[] {
    const recommendations: string[] = [];
    
    chunks.forEach(chunk => {
      const limit = this.CHUNK_SIZE_LIMITS[chunk.type];
      
      if (chunk.size > limit) {
        recommendations.push(
          `${chunk.name} (${chunk.type}) is ${Math.round((chunk.size - limit) / 1024)}KB over limit. Consider splitting further.`
        );
      }
    });

    // Specific recommendations based on our analysis
    const utilsVendor = chunks.find(c => c.name === 'utils-vendor');
    if (utilsVendor && utilsVendor.size > 1000 * 1024) {
      recommendations.push(
        'utils-vendor chunk is very large (1.9MB). Consider tree-shaking unused utilities and splitting into smaller chunks.'
      );
    }

    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    if (totalSize > 3000 * 1024) { // 3MB
      recommendations.push(
        'Total bundle size exceeds 3MB. Consider lazy loading more features and aggressive tree shaking.'
      );
    }

    return recommendations;
  }

  private static calculatePerformanceScore(chunks: ChunkInfo[]): number {
    const score = 100;
    let penalties = 0;

    chunks.forEach(chunk => {
      const limit = this.CHUNK_SIZE_LIMITS[chunk.type];
      
      if (chunk.size > limit) {
        const overagePercent = (chunk.size - limit) / limit;
        penalties += Math.min(20, overagePercent * 10); // Cap penalty at 20 points per chunk
      }
    });

    return Math.max(0, score - penalties);
  }

  /**
/**
 * Log bundle analysis results to console
*/
  static async logBundleAnalysis(): Promise<void> {
    try {
      const analysis = await this.analyzeBundlePerformance();
      
      console.group('📦 Bundle Analysis');
      
      if (analysis.recommendations.length > 0) {
        console.group('🎯 Recommendations');
        analysis.recommendations.forEach(rec => console.warn(rec));
        console.groupEnd();
      }
      
      console.group('📊 Chunk Breakdown');
      analysis.chunks
        .sort((a, b) => b.size - a.size)
        .forEach(chunk => {
          const sizeKB = Math.round(chunk.size / 1024);
          const gzipKB = Math.round((chunk.gzipSize || 0) / 1024);
        });
      console.groupEnd();
      
      console.groupEnd();
    } catch (error) {
      console.error('Bundle analysis failed:', error);
    }
  }
}

/**
 * Performance monitoring utilities
*/
export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();

  static startTiming(label: string): void {
    this.metrics.set(label, performance.now());
  }

  static endTiming(label: string): number {
    const start = this.metrics.get(label);
    if (!start) return 0;
    
    const duration = performance.now() - start;
    this.metrics.delete(label);
    
    if (process.env.NODE_ENV === 'development') {
    }
    
    return duration;
  }

  static measureComponentLoad<T>(
    componentName: string,
    loadFn: () => Promise<T>
  ): Promise<T> {
    this.startTiming(`Load ${componentName}`);
    
    return loadFn().then(result => {
      this.endTiming(`Load ${componentName}`);
      return result;
    });
  }

  /**
/**
 * Monitor Core Web Vitals
*/
  static monitorWebVitals(): void {
    if (typeof window === 'undefined') return;

    // First Contentful Paint (FCP)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// Auto-initialize performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  PerformanceMonitor.monitorWebVitals();
}