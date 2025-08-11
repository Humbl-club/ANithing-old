import React, { Suspense, ComponentType, lazy, LazyExoticComponent } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundaryUnified';
import { Loader2 } from 'lucide-react';

// Loading spinner component
const LoadingSpinner = ({ size = 'default', message }: { size?: 'sm' | 'default' | 'lg'; message?: string }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      {message && (
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
};

// Fallback components for different contexts
const PageLoadingFallback = ({ message = 'Loading page...' }) => (
  <LoadingSpinner size="lg" message={message} />
);

const FeatureLoadingFallback = ({ message = 'Loading...' }) => (
  <LoadingSpinner size="default" message={message} />
);

const ComponentLoadingFallback = () => (
  <LoadingSpinner size="sm" />
);

// Enhanced lazy loading with error boundaries and custom fallbacks
interface LazyComponentOptions {
  fallback?: React.ComponentType;
  errorBoundary?: 'default' | 'feature' | 'none';
  featureName?: string;
  loadingMessage?: string;
}

/**
 * Enhanced lazy component loader with error handling and custom fallbacks
*/
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): LazyExoticComponent<T> {
  const {
    fallback: CustomFallback,
    errorBoundary = 'default',
    featureName,
    loadingMessage
  } = options;

  const LazyComponent = lazy(importFn);

  const WrappedComponent = (props: React.ComponentProps<T>) => {
    const FallbackComponent = CustomFallback || (() => 
      <FeatureLoadingFallback message={loadingMessage} />
    );

    const LazyWithSuspense = (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );

    // Wrap with appropriate error boundary
    if (errorBoundary === 'feature' && featureName) {
      return (
        <ErrorBoundary 
          showDetails={process.env.NODE_ENV === 'development'}
        >
          {LazyWithSuspense}
        </ErrorBoundary>
      );
    } else if (errorBoundary === 'default') {
      return (
        <ErrorBoundary>
          {LazyWithSuspense}
        </ErrorBoundary>
      );
    }

    return LazyWithSuspense;
  };

  return WrappedComponent as LazyExoticComponent<T>;
}

/**
 * Create lazy page component with page-specific fallback
*/
export function createLazyPage<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  pageName: string,
  loadingMessage?: string
): LazyExoticComponent<T> {
  return createLazyComponent(importFn, {
    fallback: () => <PageLoadingFallback message={loadingMessage || `Loading ${pageName}...`} />,
    errorBoundary: 'feature',
    featureName: pageName,
    loadingMessage
  });
}

/**
 * Create lazy feature component with feature-specific error boundary
*/
export function createLazyFeature<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  featureName: string,
  loadingMessage?: string
): LazyExoticComponent<T> {
  return createLazyComponent(importFn, {
    errorBoundary: 'feature',
    featureName,
    loadingMessage: loadingMessage || `Loading ${featureName}...`
  });
}

/**
 * Create lazy shared component with minimal fallback
*/
export function createLazyShared<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return createLazyComponent(importFn, {
    fallback: ComponentLoadingFallback,
    errorBoundary: 'none'
  });
}

/**
 * Preload lazy components for better UX
*/
export class ComponentPreloader {
  private static preloadedComponents = new Set<string>();

  static preload(importFn: () => Promise<any>, key: string) {
    if (!this.preloadedComponents.has(key)) {
      this.preloadedComponents.add(key);
      importFn().catch(() => {
        // Remove from preloaded set on failure
        this.preloadedComponents.delete(key);
      });
    }
  }

  static preloadOnHover<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    key: string
  ) {
    return {
      onMouseEnter: () => this.preload(importFn, key),
      onFocus: () => this.preload(importFn, key)
    };
  }

  static preloadOnIdle<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    key: string,
    delay = 2000
  ) {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        setTimeout(() => this.preload(importFn, key), delay);
      });
    } else {
      setTimeout(() => this.preload(importFn, key), delay);
    }
  }
}

/**
 * Hook for intersection-based lazy loading
*/
export function useIntersectionLoader(
  importFn: () => Promise<any>,
  key: string,
  options: IntersectionObserverInit & { once?: boolean } = {}
) {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const [hasTriggered, setHasTriggered] = React.useState(false);
  const { once = true, ...observerOptions } = options;

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element || (once && hasTriggered)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ComponentPreloader.preload(importFn, key);
          setHasTriggered(true);
          
          if (once) {
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1, ...observerOptions }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [importFn, key, once, hasTriggered]);

  return elementRef;
}

// Export default fallback components for reuse
export {
  LoadingSpinner,
  PageLoadingFallback,
  FeatureLoadingFallback,
  ComponentLoadingFallback
};