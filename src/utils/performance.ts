// Performance utilities for React optimization

import { useCallback, useRef, useEffect, useState } from 'react';
import React from 'react';

/**
 * Debounced callback hook for expensive operations
*/
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;
}

/**
 * Throttled callback hook for frequent operations
*/
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);
  const lastRunRef = useRef(0);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastRunRef.current >= delay) {
      callbackRef.current(...args);
      lastRunRef.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        lastRunRef.current = Date.now();
      }, delay - (now - lastRunRef.current));
    }
  }, [delay]) as T;
}

/**
 * Performance monitor hook for tracking render performance
*/
export function usePerformanceMonitor(componentName: string, threshold = 16) {
  const renderStartRef = useRef<number>();
  
  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      if (renderTime > threshold) {
        console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    }
  });
}

/**
 * Intersection Observer hook for lazy loading
*/
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, options.threshold, options.rootMargin]);

  return isIntersecting;
}

/**
 * Memory usage tracker
*/
export function logMemoryUsage(label: string) {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log(`Memory Usage (${label}):`, {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
    });
  }
}

/**
 * Component performance profiler
*/
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    usePerformanceMonitor(componentName);
    return React.createElement(WrappedComponent, props);
  };
}