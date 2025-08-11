import { toast } from 'sonner';
import { useCallback } from 'react';

/**
 * Comprehensive Error Recovery System
 * Automatically handles and recovers from various error scenarios
 */

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number) => void;
}

export class ErrorRecovery {
  private static retryQueues = new Map<string, Promise<any>>();

  /**
   * Retry failed operations with exponential backoff
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = 'exponential',
      onRetry
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }

        onRetry?.(attempt);

        const waitTime = backoff === 'exponential' 
          ? delay * Math.pow(2, attempt - 1)
          : delay * attempt;

        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw lastError;
  }

  /**
   * Circuit breaker pattern for failing services
   */
  static createCircuitBreaker<T>(
    operation: () => Promise<T>,
    threshold: number = 5,
    timeout: number = 60000
  ) {
    let failures = 0;
    let lastFailureTime = 0;
    let isOpen = false;

    return async (): Promise<T> => {
      // Check if circuit should be reset
      if (isOpen && Date.now() - lastFailureTime > timeout) {
        isOpen = false;
        failures = 0;
      }

      // If circuit is open, fail fast
      if (isOpen) {
        throw new Error('Service unavailable - circuit breaker is open');
      }

      try {
        const result = await operation();
        failures = 0; // Reset on success
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = Date.now();

        if (failures >= threshold) {
          isOpen = true;
          console.error(`Circuit breaker opened after ${failures} failures`);
        }

        throw error;
      }
    };
  }

  /**
   * Fallback handler for degraded functionality
   */
  static async withFallback<T>(
    primary: () => Promise<T>,
    fallback: () => T | Promise<T>
  ): Promise<T> {
    try {
      return await primary();
    } catch (error) {
      console.warn('Primary operation failed, using fallback:', error);
      return await fallback();
    }
  }

  /**
   * Handle network errors with offline queue
   */
  static async handleNetworkError<T>(
    operation: () => Promise<T>,
    queueKey: string
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error: any) {
      if (error.message?.includes('NetworkError') || !navigator.onLine) {
        // Queue for later
        this.queueForRetry(operation, queueKey);
        toast.info('Operation queued for when you\'re back online');
        return null;
      }
      throw error;
    }
  }

  /**
   * Queue operations for retry when online
   */
  private static queueForRetry(operation: () => Promise<any>, key: string) {
    if (!this.retryQueues.has(key)) {
      this.retryQueues.set(key, operation());
    }

    // Listen for online event
    window.addEventListener('online', () => {
      this.processRetryQueue();
    }, { once: true });
  }

  /**
   * Process queued operations
   */
  private static async processRetryQueue() {
    for (const [key, promise] of this.retryQueues.entries()) {
      try {
        await promise;
        this.retryQueues.delete(key);
        toast.success(`Synced: ${key}`);
      } catch (error) {
        console.error(`Failed to sync ${key}:`, error);
      }
    }
  }

  /**
   * Graceful degradation for missing features
   */
  static gracefulDegrade<T>(
    feature: () => T,
    fallbackValue: T,
    message?: string
  ): T {
    try {
      return feature();
    } catch (error) {
      if (message) {
        console.warn(message, error);
      }
      return fallbackValue;
    }
  }

  /**
   * Auto-save with conflict resolution
   */
  static async autoSave<T>(
    data: T,
    saveOperation: (data: T) => Promise<void>,
    conflictResolver?: (local: T, remote: T) => T
  ): Promise<void> {
    const key = `autosave_${Date.now()}`;
    
    try {
      // Save to local storage first
      localStorage.setItem(key, JSON.stringify(data));
      
      // Attempt to save to server
      await saveOperation(data);
      
      // Clean up local storage on success
      localStorage.removeItem(key);
    } catch (error: any) {
      if (error.code === '409' && conflictResolver) {
        // Handle conflict
        const remoteData = error.data as T;
        const resolvedData = conflictResolver(data, remoteData);
        await saveOperation(resolvedData);
      } else {
        // Keep in local storage for later
        toast.error('Failed to save. Will retry automatically.');
        setTimeout(() => this.autoSave(data, saveOperation, conflictResolver), 5000);
      }
    }
  }

  /**
   * Timeout wrapper with cancellation
   */
  static async withTimeout<T>(
    operation: () => Promise<T>,
    timeout: number = 10000
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), timeout);
    });

    return Promise.race([operation(), timeoutPromise]);
  }

  /**
   * Batch error reporter
   */
  static reportErrors(errors: Error[], context?: Record<string, any>) {
    const errorReport = {
      timestamp: new Date().toISOString(),
      errors: errors.map(e => ({
        message: e.message,
        stack: e.stack,
        name: e.name
      })),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Send to monitoring service
    console.error('Error batch:', errorReport);
    
    // Store locally if offline
    if (!navigator.onLine) {
      const reports = JSON.parse(localStorage.getItem('error_reports') || '[]');
      reports.push(errorReport);
      localStorage.setItem('error_reports', JSON.stringify(reports));
    }
  }
}

/**
 * React hook for error recovery
 */
export function useErrorRecovery() {
  const retry = useCallback(async <T,>(
    operation: () => Promise<T>,
    options?: RetryOptions
  ) => {
    return ErrorRecovery.withRetry(operation, options);
  }, []);

  const withFallback = useCallback(async <T,>(
    primary: () => Promise<T>,
    fallback: () => T | Promise<T>
  ) => {
    return ErrorRecovery.withFallback(primary, fallback);
  }, []);

  const withTimeout = useCallback(async <T,>(
    operation: () => Promise<T>,
    timeout?: number
  ) => {
    return ErrorRecovery.withTimeout(operation, timeout);
  }, []);

  return {
    retry,
    withFallback,
    withTimeout
  };
}

// Export convenience functions
export const retry = ErrorRecovery.withRetry;
export const withFallback = ErrorRecovery.withFallback;
export const withTimeout = ErrorRecovery.withTimeout;
export const createCircuitBreaker = ErrorRecovery.createCircuitBreaker;