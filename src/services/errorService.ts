// Centralized error handling service

import { supabase } from '@/integrations/supabase/client';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  userId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorLogEntry {
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  timestamp: string;
  url: string;
  userAgent: string;
}

class ErrorService {
  private pendingLogs: ErrorLogEntry[] = [];
  private isUploading = false;

  /**
/**
 * Log an error with appropriate severity and context
*/
  async logError(
    error: Error | string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: ErrorContext = {}
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    const logEntry: ErrorLogEntry = {
      message: errorMessage,
      stack,
      severity,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Always log to console in development
    if (process.env.NODE_ENV === 'development') {
      const logMethod = severity === ErrorSeverity.CRITICAL ? 'error' : 
                       severity === ErrorSeverity.HIGH ? 'error' :
                       severity === ErrorSeverity.MEDIUM ? 'warn' : 'log';
      console[logMethod]('[ErrorService]', errorMessage, context);
    }

    // Queue for batch upload
    this.pendingLogs.push(logEntry);
    this.scheduleBatchUpload();
  }

  /**
/**
 * Log network/API errors
*/
  logApiError(error: any, endpoint: string, method: string): void {
    this.logError(error, ErrorSeverity.MEDIUM, {
      component: 'API',
      action: `${method} ${endpoint}`,
      metadata: {
        status: error.status,
        statusText: error.statusText
      }
    });
  }

  /**
/**
 * Log user action errors
*/
  logUserActionError(error: any, component: string, action: string): void {
    this.logError(error, ErrorSeverity.LOW, {
      component,
      action,
      metadata: {
        userTriggered: true
      }
    });
  }

  /**
/**
 * Log critical system errors
*/
  logCriticalError(error: any, context: ErrorContext = {}): void {
    this.logError(error, ErrorSeverity.CRITICAL, {
      ...context,
      metadata: {
        ...context.metadata,
        needsImmedateAttention: true
      }
    });
  }

  /**
/**
 * Schedule batch upload to avoid overwhelming the server
*/
  private scheduleBatchUpload(): void {
    if (this.isUploading || this.pendingLogs.length === 0) return;

    // Upload immediately for critical errors, otherwise batch
    const hasCritical = this.pendingLogs.some(log => log.severity === ErrorSeverity.CRITICAL);
    const delay = hasCritical ? 0 : 5000; // 5 seconds for non-critical

    setTimeout(() => {
      this.uploadPendingLogs();
    }, delay);
  }

  /**
/**
 * Upload pending logs to Supabase
*/
  private async uploadPendingLogs(): Promise<void> {
    if (this.isUploading || this.pendingLogs.length === 0) return;

    this.isUploading = true;
    const logsToUpload = [...this.pendingLogs];
    this.pendingLogs = [];

    try {
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();

      const logsWithUser = logsToUpload.map(log => ({
        error_message: log.message,
        stack: log.stack,
        severity: log.severity,
        context: log.context,
        timestamp: log.timestamp,
        url: log.url,
        user_agent: log.userAgent,
        user_id: user?.id || null
      }));

      const { error } = await supabase
        .from('error_logs')
        .insert(logsWithUser);

      if (error) {
        console.error('Failed to upload error logs:', error);
        // Re-queue failed logs
        this.pendingLogs.unshift(...logsToUpload);
      }
    } catch (uploadError) {
      console.error('Error uploading logs:', uploadError);
      // Re-queue failed logs  
      this.pendingLogs.unshift(...logsToUpload);
    } finally {
      this.isUploading = false;
    }
  }

  /**
/**
 * Setup global error handlers
*/
  setupGlobalErrorHandling(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        event.reason || 'Unhandled Promise Rejection',
        ErrorSeverity.HIGH,
        { component: 'Global', action: 'unhandledrejection' }
      );
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError(
        event.error || event.message,
        ErrorSeverity.HIGH,
        {
          component: 'Global',
          action: 'error',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        }
      );
    });

    // Handle React errors (will be caught by ErrorBoundary)
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if it's a React error
      if (args[0]?.includes?.('React') || args[0]?.includes?.('Warning')) {
        this.logError(
          args.join(' '),
          ErrorSeverity.MEDIUM,
          { component: 'React', action: 'console.error' }
        );
      }
      originalConsoleError.apply(console, args);
    };
  }
}

// Export singleton instance
export const errorService = new ErrorService();