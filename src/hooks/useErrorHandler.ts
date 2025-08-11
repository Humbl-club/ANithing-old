import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { errorService, ErrorSeverity, ErrorContext } from '@/services/errorService';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  severity?: ErrorSeverity;
  fallbackMessage?: string;
}

interface ErrorState {
  error: Error | null;
  isError: boolean;
  retry: () => void;
  clearError: () => void;
}

/**
 * Hook for handling errors in React components with consistent UX
*/
export function useErrorHandler(
  componentName: string,
  options: ErrorHandlerOptions = {}
): {
  handleError: (error: any, context?: Partial<ErrorContext>) => void;
  handleAsyncError: <T>(
    asyncFn: () => Promise<T>,
    context?: Partial<ErrorContext>
  ) => Promise<T | null>;
  errorState: ErrorState;
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: Partial<ErrorContext>
  ) => (...args: T) => Promise<R | null>;
} {
  const {
    showToast = true,
    logError = true,
    severity = ErrorSeverity.MEDIUM,
    fallbackMessage = 'Something went wrong'
  } = options;

  const [error, setError] = useState<Error | null>(null);
  const [originalFunction, setOriginalFunction] = useState<(() => Promise<any>) | null>(null);

  const handleError = useCallback((
    error: any,
    context: Partial<ErrorContext> = {}
  ) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    setError(errorObj);

    // Show user-friendly toast
    if (showToast) {
      const message = errorObj.message || fallbackMessage;
      toast.error(message);
    }

    // Log error for monitoring
    if (logError) {
      errorService.logError(errorObj, severity, {
        component: componentName,
        ...context
      });
    }
  }, [componentName, showToast, logError, severity, fallbackMessage]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context: Partial<ErrorContext> = {}
  ): Promise<T | null> => {
    try {
      setError(null);
      setOriginalFunction(() => asyncFn);
      return await asyncFn();
    } catch (error) {
      handleError(error, {
        action: 'async_operation',
        ...context
      });
      return null;
    }
  }, [handleError]);

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: Partial<ErrorContext> = {}
  ) => {
    return async (...args: T): Promise<R | null> => {
      return handleAsyncError(() => fn(...args), {
        action: fn.name || 'wrapped_function',
        ...context
      });
    };
  }, [handleAsyncError]);

  const retry = useCallback(async () => {
    if (originalFunction) {
      setError(null);
      try {
        await originalFunction();
      } catch (error) {
        handleError(error, { action: 'retry' });
      }
    }
  }, [originalFunction, handleError]);

  const clearError = useCallback(() => {
    setError(null);
    setOriginalFunction(null);
  }, []);

  const errorState: ErrorState = {
    error,
    isError: error !== null,
    retry,
    clearError
  };

  return {
    handleError,
    handleAsyncError,
    withErrorHandling,
    errorState
  };
}

/**
 * Higher-order component for wrapping components with error handling
*/
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function ErrorWrappedComponent(props: P) {
    const { handleError } = useErrorHandler(componentName);

    // Wrap any async props with error handling
    const wrappedProps = Object.keys(props).reduce((acc, key) => {
      const value = (props as any)[key];
      
      if (typeof value === 'function' && value.constructor.name === 'AsyncFunction') {
        acc[key] = async (...args: any[]) => {
          try {
            return await value(...args);
          } catch (error) {
            handleError(error, { action: key });
            throw error; // Re-throw to allow component to handle
          }
        };
      } else {
        acc[key] = value;
      }
      
      return acc;
    }, {} as any);

    return <WrappedComponent {...wrappedProps} />;
  };
}