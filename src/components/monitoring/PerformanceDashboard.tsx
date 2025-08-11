import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Clock, Zap, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import { getCLS, getFID, getFCP, getLCP, getTTFB, type Metric } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold: { good: number; poor: number };
  unit: string;
  description: string;
}

interface SystemInfo {
  userAgent: string;
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  storage: {
    used: number;
    quota: number;
  } | null;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Web Vitals thresholds (in milliseconds) - memoized to prevent re-renders
  const thresholds = useMemo(() => ({
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 }
  }), []);

  const getRating = useCallback((name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const threshold = thresholds[name as keyof typeof thresholds];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }, [thresholds]);

  const collectWebVitals = useCallback(() => {
    const metricsCollector: PerformanceMetric[] = [];
    
    const updateMetric = (metric: Metric) => {
      const performanceMetric: PerformanceMetric = {
        name: metric.name,
        value: metric.value,
        rating: getRating(metric.name, metric.value),
        threshold: thresholds[metric.name as keyof typeof thresholds],
        unit: metric.name === 'CLS' ? '' : 'ms',
        description: getMetricDescription(metric.name)
      };
      
      setMetrics(prev => {
        const filtered = prev.filter(m => m.name !== metric.name);
        return [...filtered, performanceMetric];
      });
    };

    getCLS(updateMetric);
    getFID(updateMetric);
    getFCP(updateMetric);
    getLCP(updateMetric);
    getTTFB(updateMetric);
  }, [thresholds, getRating]);

  const getMetricDescription = (name: string): string => {
    const descriptions = {
      CLS: 'Measures visual stability - how much content shifts during loading',
      FID: 'Measures interactivity - delay between first user input and response',
      FCP: 'Measures loading - when first content appears on screen',
      LCP: 'Measures loading - when main content finishes loading',
      TTFB: 'Measures server response time - time to first byte from server'
    };
    return descriptions[name as keyof typeof descriptions] || 'Performance metric';
  };

  const collectSystemInfo = useCallback(async () => {
    const info: SystemInfo = {
      userAgent: navigator.userAgent,
      storage: null
    };

    // Network information
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      info.connection = {
        effectiveType: conn?.effectiveType || 'unknown',
        downlink: conn?.downlink || 0,
        rtt: conn?.rtt || 0
      };
    }

    // Memory information
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      info.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }

    // Storage quota
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        info.storage = {
          used: estimate.usage || 0,
          quota: estimate.quota || 0
        };
      } catch (e) {
        // Storage API not supported
      }
    }

    setSystemInfo(info);
  }, []);

  const refreshMetrics = () => {
    setIsLoading(true);
    collectWebVitals();
    collectSystemInfo();
    setTimeout(() => setIsLoading(false), 1000);
  };

  useEffect(() => {
    collectWebVitals();
    collectSystemInfo();
    setIsLoading(false);
  }, [collectWebVitals, collectSystemInfo]);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">Collecting performance metrics...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">Real-time application performance metrics</p>
        </div>
        <Button onClick={refreshMetrics} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="vitals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
          <TabsTrigger value="network">Network & Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <div className="text-2xl">
                    {metric.name === 'CLS' && <Activity />}
                    {metric.name === 'FID' && <Zap />}
                    {(metric.name === 'FCP' || metric.name === 'LCP') && <Clock />}
                    {metric.name === 'TTFB' && <TrendingUp />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {metric.value.toFixed(metric.name === 'CLS' ? 3 : 0)}{metric.unit}
                  </div>
                  <Badge className={getRatingColor(metric.rating)}>
                    {metric.rating.replace('-', ' ')}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    {metric.description}
                  </p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Good: &lt;{metric.threshold.good}{metric.unit}</span>
                      <span>Poor: &gt;{metric.threshold.poor}{metric.unit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          {systemInfo?.memory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used JS Heap Size</span>
                    <span>{formatBytes(systemInfo.memory.usedJSHeapSize)}</span>
                  </div>
                  <Progress 
                    value={(systemInfo.memory.usedJSHeapSize / systemInfo.memory.jsHeapSizeLimit) * 100} 
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Total: {formatBytes(systemInfo.memory.totalJSHeapSize)}</span>
                    <span>Limit: {formatBytes(systemInfo.memory.jsHeapSizeLimit)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Browser Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground break-all">
                {systemInfo?.userAgent}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          {systemInfo?.connection && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Network Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{systemInfo.connection.effectiveType}</p>
                    <p className="text-xs text-muted-foreground">Connection Type</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{systemInfo.connection.downlink} Mbps</p>
                    <p className="text-xs text-muted-foreground">Downlink</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{systemInfo.connection.rtt}ms</p>
                    <p className="text-xs text-muted-foreground">Round Trip Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {systemInfo?.storage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used Storage</span>
                    <span>{formatBytes(systemInfo.storage.used)}</span>
                  </div>
                  <Progress 
                    value={(systemInfo.storage.used / systemInfo.storage.quota) * 100} 
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Available: {formatBytes(systemInfo.storage.quota - systemInfo.storage.used)}</span>
                    <span>Total: {formatBytes(systemInfo.storage.quota)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;