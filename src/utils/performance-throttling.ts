/**
 * Advanced Debouncing and Throttling Utilities
 * Optimized for 10k concurrent users with intelligent batching
 */

// Enhanced debounce with leading/trailing edge options
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
): T & { cancel: () => void; flush: () => void } {
  const { leading = false, trailing = true, maxWait } = options;
  
  let timeoutId: NodeJS.Timeout | null = null;
  let maxTimeoutId: NodeJS.Timeout | null = null;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | undefined;
  let result: ReturnType<T>;

  function invokeFunc(time: number) {
    const args = lastArgs;
    lastArgs = undefined;
    lastInvokeTime = time;
    result = func.apply(null, args);
    return result;
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    
    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= delay ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  }

  function remainingWait(time: number) {
    const timeSinceLastCall = time - lastCallTime;
    const timeWaiting = delay - timeSinceLastCall;
    const shouldUseMaxWait = maxWait !== undefined;
    
    if (shouldUseMaxWait) {
      const timeSinceLastInvoke = time - lastInvokeTime;
      const maxTimeWaiting = maxWait - timeSinceLastInvoke;
      return Math.min(timeWaiting, maxTimeWaiting);
    }
    
    return timeWaiting;
  }

  function trailingEdge(time: number) {
    timeoutId = null;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = undefined;
    return result;
  }

  function cancel() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (maxTimeoutId !== null) {
      clearTimeout(maxTimeoutId);
      maxTimeoutId = null;
    }
    lastInvokeTime = 0;
    lastCallTime = 0;
    lastArgs = undefined;
  }

  function flush() {
    return timeoutId === null ? result : trailingEdge(Date.now());
  }

  const debounced = ((...args: Parameters<T>) => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(time);
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, delay);
        return invokeFunc(time);
      }
    }
    
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, delay);
    }
    
    return result;
  }) as T & { cancel: () => void; flush: () => void };

  function leadingEdge(time: number) {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, delay);
    return leading ? invokeFunc(time) : result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced;
}

// High-performance throttle with precise timing
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
  } = {}
): T & { cancel: () => void; flush: () => void } {
  return debounce(func, delay, { ...options, maxWait: delay });
}

// Intelligent batching debounce for API calls
export function batchDebounce<T extends (...args: any[]) => Promise<any>>(
  func: T,
  delay: number,
  batchSize: number = 10
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) & { 
  cancel: () => void; 
  flush: () => Promise<ReturnType<T>[]>;
} {
  let batch: Array<{
    args: Parameters<T>;
    resolve: (value: ReturnType<T>) => void;
    reject: (error: any) => void;
  }> = [];
  let timeoutId: NodeJS.Timeout | null = null;

  const processBatch = async () => {
    if (batch.length === 0) return;
    
    const currentBatch = batch.splice(0, batchSize);
    const promises = currentBatch.map(({ args }) => func(...args));
    
    try {
      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        const { resolve, reject } = currentBatch[index];
        
        if (result.status === 'fulfilled') {
          resolve(result.value);
        } else {
          reject(result.reason);
        }
      });
    } catch (error) {
      currentBatch.forEach(({ reject }) => reject(error));
    }
    
    // Process remaining batch if any
    if (batch.length > 0) {
      timeoutId = setTimeout(processBatch, delay);
    }
  };

  const scheduleProcessing = () => {
    if (timeoutId) return;
    
    if (batch.length >= batchSize) {
      processBatch();
    } else {
      timeoutId = setTimeout(processBatch, delay);
    }
  };

  const batchedFunc = ((...args: Parameters<T>) => {
    return new Promise<ReturnType<T>>((resolve, reject) => {
      batch.push({ args, resolve, reject });
      scheduleProcessing();
    });
  }) as ((...args: Parameters<T>) => Promise<ReturnType<T>>) & { 
    cancel: () => void; 
    flush: () => Promise<ReturnType<T>[]>;
  };

  batchedFunc.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    batch.forEach(({ reject }) => reject(new Error('Batch cancelled')));
    batch = [];
  };

  batchedFunc.flush = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    const results: ReturnType<T>[] = [];
    while (batch.length > 0) {
      const currentBatch = batch.splice(0, batchSize);
      const promises = currentBatch.map(({ args }) => func(...args));
      
      try {
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
      } catch (error) {
        currentBatch.forEach(({ reject }) => reject(error));
        throw error;
      }
    }
    
    return results;
  };

  return batchedFunc;
}

// React hooks for performance throttling
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());
  
  useEffect(() => {
    if (Date.now() >= lastExecuted.current + delay) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [value, delay]);
  
  return throttledValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay, ...deps]
  ) as T;
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
}

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const callbackRef = useRef(callback);
  const lastExecuted = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now >= lastExecuted.current + delay) {
        lastExecuted.current = now;
        return callbackRef.current(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastExecuted.current = Date.now();
          callbackRef.current(...args);
        }, delay - (now - lastExecuted.current));
      }
    },
    [delay, ...deps]
  ) as T;
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return throttledCallback;
}

// Adaptive throttling based on system performance
export class AdaptiveThrottle {
  private performanceMetrics: number[] = [];
  private baseDelay: number;
  private minDelay: number;
  private maxDelay: number;
  
  constructor(baseDelay: number = 100, minDelay: number = 50, maxDelay: number = 1000) {
    this.baseDelay = baseDelay;
    this.minDelay = minDelay;
    this.maxDelay = maxDelay;
  }
  
  private measurePerformance(): number {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation.loadEventEnd - navigation.loadEventStart;
    }
    return 0;
  }
  
  private calculateAdaptiveDelay(): number {
    if (this.performanceMetrics.length === 0) {
      return this.baseDelay;
    }
    
    const avgPerformance = this.performanceMetrics.reduce((a, b) => a + b, 0) / this.performanceMetrics.length;
    
    // Increase delay if performance is poor
    const performanceMultiplier = Math.max(0.5, Math.min(2.0, avgPerformance / 100));
    const adaptiveDelay = this.baseDelay * performanceMultiplier;
    
    return Math.max(this.minDelay, Math.min(this.maxDelay, adaptiveDelay));
  }
  
  throttle<T extends (...args: any[]) => any>(func: T): T {
    let lastExecution = 0;
    let timeoutId: NodeJS.Timeout | null = null;
    
    return ((...args: Parameters<T>) => {
      const now = Date.now();
      const adaptiveDelay = this.calculateAdaptiveDelay();
      
      // Update performance metrics
      const currentPerformance = this.measurePerformance();
      if (currentPerformance > 0) {
        this.performanceMetrics.push(currentPerformance);
        if (this.performanceMetrics.length > 10) {
          this.performanceMetrics.shift();
        }
      }
      
      if (now >= lastExecution + adaptiveDelay) {
        lastExecution = now;
        return func(...args);
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(() => {
          lastExecution = Date.now();
          func(...args);
        }, adaptiveDelay - (now - lastExecution));
      }
    }) as T;
  }
}

// Export all utilities
export {
  useDebounce as useEnhancedDebounce,
  useThrottle as useEnhancedThrottle,
  useDebouncedCallback,
  useThrottledCallback
};

// Required imports
import { useState, useEffect, useRef, useCallback } from 'react';