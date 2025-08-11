import type { User } from '@sentry/react';

// Performance and error tracking configuration
const SENTRY_CONFIG = {
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
  tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_SAMPLE_RATE) || 0.1,
  profilesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [] as any[],
  beforeSend(event: any, hint: any) {
    // Filter out non-critical errors and PII
    if (event.exception) {
      const error = hint.originalException as Error;
      
      // Skip expected network errors
      if (error?.message?.includes('Failed to fetch') ||
          error?.message?.includes('NetworkError') ||
          error?.message?.includes('ERR_NETWORK')) {
        return null;
      }
      
      // Skip quota exceeded errors (browser storage)
      if (error?.message?.includes('QuotaExceededError')) {
        return null;
      }
      
      // Skip non-critical UI errors
      if (error?.message?.includes('ResizeObserver') ||
          error?.message?.includes('Non-Error promise rejection')) {
        return null;
      }
    }
    
    // Remove sensitive data
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
    }
    
    return event;
  },
};

// Initialize Sentry with comprehensive monitoring
export const initSentry = async () => {
  // Only initialize in production or when explicitly enabled
  if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_DSN) {
    const Sentry = await import('@sentry/react');
    
    // Add browser integrations
    SENTRY_CONFIG.integrations = [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.browserProfilingIntegration(),
      Sentry.httpClientIntegration(),
    ];
    
    Sentry.init(SENTRY_CONFIG);
    
    // Set up performance monitoring
    setupPerformanceMonitoring();
    
    console.log('🔍 Sentry monitoring initialized');
  }
};

// Enhanced error capture with context
export const captureError = async (error: Error, context?: Record<string, any>) => {
  console.error('Error captured:', error, context);
  
  if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_DSN) {
    const Sentry = await import('@sentry/react');
    Sentry.captureException(error, {
      extra: context,
      tags: {
        component: context?.component,
        feature: context?.feature,
        severity: context?.severity || 'error'
      }
    });
  }
};

// Set user context for better error tracking
export const setSentryUser = async (user: { id: string; email?: string; username?: string }) => {
  if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_DSN) {
    const Sentry = await import('@sentry/react');
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username
    } as User);
  }
};

// Custom transaction monitoring
export const startTransaction = async (name: string, op?: string) => {
  if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_DSN) {
    const Sentry = await import('@sentry/react');
    return Sentry.startTransaction({ name, op: op || 'navigation' });
  }
  return null;
};

// Add breadcrumb for debugging
export const addBreadcrumb = async (message: string, category: string = 'custom', level: 'info' | 'warning' | 'error' = 'info') => {
  if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_DSN) {
    const Sentry = await import('@sentry/react');
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      timestamp: Date.now() / 1000,
    });
  }
};

// Performance timing helper
export const measurePerformance = async (name: string, fn: () => Promise<any> | any) => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    if (duration > 1000) {
      console.warn(`Slow operation: ${name} took ${duration}ms`);
      addBreadcrumb(`Slow operation: ${name} (${duration}ms)`, 'performance', 'warning');
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    captureError(error as Error, { operation: name, duration });
    throw error;
  }
};

// Monitor API calls and responses
export const monitorApiCall = async (url: string, options: RequestInit = {}) => {
  const start = performance.now();
  const transaction = await startTransaction(`API ${options.method || 'GET'} ${url}`, 'http.client');
  
  try {
    const response = await fetch(url, options);
    const duration = performance.now() - start;
    
    // Log slow API calls
    if (duration > 3000) {
      addBreadcrumb(`Slow API call: ${url} (${duration}ms)`, 'api', 'warning');
    }
    
    // Track API errors
    if (!response.ok) {
      captureError(new Error(`API Error: ${response.status} ${response.statusText}`), {
        url,
        status: response.status,
        method: options.method || 'GET',
        duration
      });
    }
    
    transaction?.finish();
    return response;
  } catch (error) {
    const duration = performance.now() - start;
    captureError(error as Error, { url, method: options.method || 'GET', duration });
    transaction?.finish();
    throw error;
  }
};

// Performance monitoring setup
const setupPerformanceMonitoring = () => {
  // Monitor Core Web Vitals
  if ('web-vitals' in window || typeof window !== 'undefined') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    }).catch(() => {}); // Silent fail
  }
  
  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry.duration + 'ms');
            captureError(new Error('Long task detected'), {
              duration: entry.duration,
              name: entry.name,
              component: 'performance-monitor'
            });
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // PerformanceObserver not supported
    }
  }
};