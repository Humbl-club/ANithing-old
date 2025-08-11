/**
 * Comprehensive System Monitoring for 10k+ Users
 * Integrates all monitoring components for real-time insights
 */

import { cache } from '../cache/redisCache';
import { rateLimiter, ddosProtection } from '../middleware/rateLimiter';
import { imageOptimization } from '../optimization/imageOptimization';
import { captureError, addBreadcrumb } from '../sentry';
import { getCacheAnalytics } from '../cache/enhancedPWACache';

interface SystemMetrics {
  timestamp: string;
  performance: PerformanceMetrics;
  cache: CacheMetrics;
  rateLimiting: RateLimitingMetrics;
  images: ImageMetrics;
  errors: ErrorMetrics;
  network: NetworkMetrics;
  storage: StorageMetrics;
}

interface PerformanceMetrics {
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  renderTime: number;
  interactionDelay: number;
}

interface CacheMetrics {
  hitRate: number;
  totalEntries: number;
  totalSize: number;
  evictionRate: number;
}

interface RateLimitingMetrics {
  totalRules: number;
  activeClients: number;
  rateLimitedRequests: number;
  blockedIPs: number;
}

interface ImageMetrics {
  optimizedImages: number;
  compressionRatio: number;
  cacheMisses: number;
  totalSavings: number;
}

interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  criticalErrors: number;
  resolvedErrors: number;
}

interface NetworkMetrics {
  bandwidth: number;
  requestCount: number;
  failureRate: number;
  avgResponseTime: number;
}

interface StorageMetrics {
  usedSpace: number;
  availableSpace: number;
  usagePercent: number;
  quotaExceeded: boolean;
}

class SystemMonitor {
  private metrics: SystemMetrics[] = [];
  private alertThresholds = {
    memoryUsage: 0.8, // 80%
    errorRate: 0.05, // 5%
    responseTime: 3000, // 3 seconds
    cacheHitRate: 0.7, // 70%
    storageUsage: 0.85 // 85%
  };
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Start system monitoring
   */
  start(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      console.warn('System monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    console.log('📊 System monitoring started');
    addBreadcrumb('System monitoring started', 'monitor', 'info');
  }

  /**
   * Stop system monitoring
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('📊 System monitoring stopped');
  }

  /**
   * Collect comprehensive system metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      
      const [
        performance,
        cacheMetrics,
        rateLimitingMetrics,
        imageMetrics,
        networkMetrics,
        storageMetrics
      ] = await Promise.allSettled([
        this.collectPerformanceMetrics(),
        this.collectCacheMetrics(),
        this.collectRateLimitingMetrics(),
        this.collectImageMetrics(),
        this.collectNetworkMetrics(),
        this.collectStorageMetrics()
      ]);

      const metrics: SystemMetrics = {
        timestamp,
        performance: this.getSettledValue(performance, this.getDefaultPerformanceMetrics()),
        cache: this.getSettledValue(cacheMetrics, this.getDefaultCacheMetrics()),
        rateLimiting: this.getSettledValue(rateLimitingMetrics, this.getDefaultRateLimitingMetrics()),
        images: this.getSettledValue(imageMetrics, this.getDefaultImageMetrics()),
        errors: await this.collectErrorMetrics(),
        network: this.getSettledValue(networkMetrics, this.getDefaultNetworkMetrics()),
        storage: this.getSettledValue(storageMetrics, this.getDefaultStorageMetrics())
      };

      this.metrics.push(metrics);
      this.checkAlerts(metrics);
      this.trimMetricsHistory();

    } catch (error) {
      console.error('Failed to collect system metrics:', error);
      captureError(error as Error, { component: 'SystemMonitor' });
    }
  }

  /**
   * Collect performance metrics
   */
  private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    const memory = (performance as any).memory;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      memoryUsage: memory ? memory.usedJSHeapSize / memory.jsHeapSizeLimit : 0,
      cpuUsage: await this.estimateCPUUsage(),
      networkLatency: navigation ? navigation.responseStart - navigation.requestStart : 0,
      renderTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      interactionDelay: await this.measureInteractionDelay()
    };
  }

  /**
   * Collect cache metrics
   */
  private async collectCacheMetrics(): Promise<CacheMetrics> {
    const cacheStats = cache.getStats();
    const pwaStats = await getCacheAnalytics();
    
    return {
      hitRate: cacheStats.hitRate,
      totalEntries: cacheStats.size + pwaStats.totalEntries,
      totalSize: cacheStats.totalSize + pwaStats.totalSize,
      evictionRate: this.calculateEvictionRate()
    };
  }

  /**
   * Collect rate limiting metrics
   */
  private collectRateLimitingMetrics(): RateLimitingMetrics {
    const stats = rateLimiter.getStats();
    
    return {
      totalRules: stats.totalRules,
      activeClients: stats.activeClients,
      rateLimitedRequests: stats.rateLimitedClients,
      blockedIPs: 0 // Would need DDoS protection integration
    };
  }

  /**
   * Collect image optimization metrics
   */
  private collectImageMetrics(): ImageMetrics {
    const stats = imageOptimization.getCacheStats();
    
    return {
      optimizedImages: stats.totalEntries,
      compressionRatio: 0.7, // Estimated
      cacheMisses: stats.totalEntries * (1 - stats.hitRate),
      totalSavings: stats.totalSize * 0.3 // 30% savings estimate
    };
  }

  /**
   * Collect error metrics
   */
  private async collectErrorMetrics(): Promise<ErrorMetrics> {
    // In a real implementation, this would integrate with error tracking service
    return {
      totalErrors: 0,
      errorRate: 0,
      criticalErrors: 0,
      resolvedErrors: 0
    };
  }

  /**
   * Collect network metrics
   */
  private async collectNetworkMetrics(): Promise<NetworkMetrics> {
    const connection = (navigator as any).connection;
    
    return {
      bandwidth: connection ? connection.downlink || 0 : 0,
      requestCount: this.getRequestCount(),
      failureRate: this.getFailureRate(),
      avgResponseTime: this.getAverageResponseTime()
    };
  }

  /**
   * Collect storage metrics
   */
  private async collectStorageMetrics(): Promise<StorageMetrics> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        
        return {
          usedSpace: usage,
          availableSpace: quota - usage,
          usagePercent: quota > 0 ? usage / quota : 0,
          quotaExceeded: usage / quota > 0.9
        };
      } catch (error) {
        console.warn('Failed to get storage estimate:', error);
      }
    }
    
    return this.getDefaultStorageMetrics();
  }

  /**
   * Check alerts and trigger notifications
   */
  private checkAlerts(metrics: SystemMetrics): void {
    const alerts: string[] = [];

    // Memory usage alert
    if (metrics.performance.memoryUsage > this.alertThresholds.memoryUsage) {
      alerts.push(`High memory usage: ${(metrics.performance.memoryUsage * 100).toFixed(1)}%`);
    }

    // Cache hit rate alert
    if (metrics.cache.hitRate < this.alertThresholds.cacheHitRate) {
      alerts.push(`Low cache hit rate: ${(metrics.cache.hitRate * 100).toFixed(1)}%`);
    }

    // Storage usage alert
    if (metrics.storage.usagePercent > this.alertThresholds.storageUsage) {
      alerts.push(`High storage usage: ${(metrics.storage.usagePercent * 100).toFixed(1)}%`);
    }

    // Response time alert
    if (metrics.performance.renderTime > this.alertThresholds.responseTime) {
      alerts.push(`Slow response time: ${metrics.performance.renderTime}ms`);
    }

    if (alerts.length > 0) {
      console.warn('🚨 System alerts:', alerts);
      for (const alert of alerts) {
        addBreadcrumb(alert, 'alert', 'warning');
      }
    }
  }

  /**
   * Get current system status
   */
  getSystemStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: SystemMetrics | null;
    alerts: string[];
  } {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    
    if (!latestMetrics) {
      return {
        status: 'warning',
        metrics: null,
        alerts: ['No metrics available']
      };
    }

    const alerts: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check critical thresholds
    if (latestMetrics.performance.memoryUsage > 0.9 ||
        latestMetrics.storage.usagePercent > 0.95) {
      status = 'critical';
    } else if (latestMetrics.performance.memoryUsage > this.alertThresholds.memoryUsage ||
               latestMetrics.cache.hitRate < this.alertThresholds.cacheHitRate ||
               latestMetrics.storage.usagePercent > this.alertThresholds.storageUsage) {
      status = 'warning';
    }

    return {
      status,
      metrics: latestMetrics,
      alerts
    };
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(hours: number = 24): SystemMetrics[] {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    return this.metrics.filter(metric => 
      new Date(metric.timestamp) > cutoff
    );
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    summary: string;
    recommendations: string[];
    trends: any;
  } {
    const recent = this.getMetricsHistory(1); // Last hour
    const summary = this.generateSummary(recent);
    const recommendations = this.generateRecommendations(recent);
    const trends = this.analyzeTrends(recent);

    return {
      summary,
      recommendations,
      trends
    };
  }

  // Helper methods for metric collection
  private async estimateCPUUsage(): Promise<number> {
    // Simplified CPU usage estimation
    const start = performance.now();
    let iterations = 0;
    
    while (performance.now() - start < 10) {
      iterations++;
    }
    
    // Normalize to 0-1 range (rough estimate)
    return Math.min(iterations / 100000, 1);
  }

  private async measureInteractionDelay(): Promise<number> {
    return new Promise(resolve => {
      const start = performance.now();
      setTimeout(() => {
        resolve(performance.now() - start);
      }, 0);
    });
  }

  private calculateEvictionRate(): number {
    // Simplified eviction rate calculation
    return 0.1; // 10% estimated
  }

  private getRequestCount(): number {
    // Would integrate with actual request tracking
    return 0;
  }

  private getFailureRate(): number {
    // Would integrate with actual error tracking
    return 0;
  }

  private getAverageResponseTime(): number {
    // Would integrate with actual response time tracking
    return 0;
  }

  private generateSummary(metrics: SystemMetrics[]): string {
    if (metrics.length === 0) {
      return 'No recent metrics available';
    }

    const latest = metrics[metrics.length - 1];
    return `System Status: ${this.getSystemStatus().status.toUpperCase()} | ` +
           `Memory: ${(latest.performance.memoryUsage * 100).toFixed(1)}% | ` +
           `Cache Hit Rate: ${(latest.cache.hitRate * 100).toFixed(1)}% | ` +
           `Storage: ${(latest.storage.usagePercent * 100).toFixed(1)}%`;
  }

  private generateRecommendations(metrics: SystemMetrics[]): string[] {
    const recommendations: string[] = [];
    
    if (metrics.length === 0) {
      return ['Enable monitoring to get recommendations'];
    }

    const latest = metrics[metrics.length - 1];

    if (latest.performance.memoryUsage > 0.8) {
      recommendations.push('Consider reducing memory usage or implementing more aggressive garbage collection');
    }

    if (latest.cache.hitRate < 0.7) {
      recommendations.push('Optimize caching strategies or increase cache size');
    }

    if (latest.storage.usagePercent > 0.8) {
      recommendations.push('Clear old cached data or implement storage cleanup');
    }

    return recommendations;
  }

  private analyzeTrends(metrics: SystemMetrics[]): any {
    // Simplified trend analysis
    return {
      memoryTrend: 'stable',
      cacheTrend: 'improving',
      storageTrend: 'increasing'
    };
  }

  private trimMetricsHistory(): void {
    // Keep only last 24 hours of metrics
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);
    
    this.metrics = this.metrics.filter(metric => 
      new Date(metric.timestamp) > cutoff
    );
  }

  private getSettledValue<T>(result: PromiseSettledResult<T>, defaultValue: T): T {
    return result.status === 'fulfilled' ? result.value : defaultValue;
  }

  // Default metric values
  private getDefaultPerformanceMetrics(): PerformanceMetrics {
    return { memoryUsage: 0, cpuUsage: 0, networkLatency: 0, renderTime: 0, interactionDelay: 0 };
  }

  private getDefaultCacheMetrics(): CacheMetrics {
    return { hitRate: 0, totalEntries: 0, totalSize: 0, evictionRate: 0 };
  }

  private getDefaultRateLimitingMetrics(): RateLimitingMetrics {
    return { totalRules: 0, activeClients: 0, rateLimitedRequests: 0, blockedIPs: 0 };
  }

  private getDefaultImageMetrics(): ImageMetrics {
    return { optimizedImages: 0, compressionRatio: 0, cacheMisses: 0, totalSavings: 0 };
  }

  private getDefaultNetworkMetrics(): NetworkMetrics {
    return { bandwidth: 0, requestCount: 0, failureRate: 0, avgResponseTime: 0 };
  }

  private getDefaultStorageMetrics(): StorageMetrics {
    return { usedSpace: 0, availableSpace: 0, usagePercent: 0, quotaExceeded: false };
  }
}

// Singleton instance
export const systemMonitor = new SystemMonitor();

// Auto-start monitoring in production
if (import.meta.env.PROD) {
  systemMonitor.start(60000); // Every minute in production
}