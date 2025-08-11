import React from 'react';
import { useIntersectionLoader, LoadingSpinner } from '@/utils/lazyLoading';

interface LazySectionProps {
  importFn: () => Promise<any>;
  componentKey: string;
  children?: React.ReactNode;
  fallback?: React.ComponentType;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Component that loads its children only when they come into viewport
 * Perfect for below-the-fold content sections
*/
export function LazySection({
  importFn,
  componentKey,
  children,
  fallback: FallbackComponent = LoadingSpinner,
  className = '',
  threshold = 0.1,
  rootMargin = '100px'
}: LazySectionProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const elementRef = useIntersectionLoader(
    importFn,
    componentKey,
    { 
      threshold, 
      rootMargin,
      // Only trigger once
      once: true 
    }
  );

  React.useEffect(() => {
    // Listen for successful preloading
    const checkLoaded = () => {
      if (elementRef.current) {
        setIsLoaded(true);
      }
    };

    // Check immediately and set up interval for lazy check
    checkLoaded();
    const interval = setInterval(checkLoaded, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={elementRef} className={className}>
      {isLoaded ? children : <FallbackComponent />}
    </div>
  );
}

/**
 * Higher-order component for lazy loading entire sections
*/
export function withLazySection<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  importFn: () => Promise<any>,
  componentKey: string
) {
  return function LazyWrappedSection(props: P & { className?: string }) {
    return (
      <LazySection 
        importFn={importFn}
        componentKey={componentKey}
        className={props.className}
      >
        <WrappedComponent {...props} />
      </LazySection>
    );
  };
}