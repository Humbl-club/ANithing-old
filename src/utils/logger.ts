export const logger = {
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      // Debug logging disabled in production
    }
  },
  error: (...args: any[]) => {
    // Error logging handled by error boundary
  },
  warn: (...args: any[]) => {
    // Warning logging handled silently
  }
};