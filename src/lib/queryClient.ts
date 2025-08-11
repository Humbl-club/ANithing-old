import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.statusCode >= 400 && error?.statusCode < 500) return false;
        if (error?.code === 'FORBIDDEN' || error?.code === 'NOT_FOUND') return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      staleTime: (query) => {
        const key = Array.isArray(query.queryKey) ? query.queryKey.join(':') : '';
        if (key.includes('home')) return 2 * 60 * 1000; // 2m
        if (key.includes('detail')) return 5 * 60 * 1000; // 5m
        return 60 * 1000; // 1m default
      },
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      networkMode: 'online'
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.statusCode >= 400 && error?.statusCode < 500) return false;
        return failureCount < 1;
      },
      retryDelay: 1000
    }
  }
});
// Global error handlers for queries and mutations
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'observerResultsUpdated') {
    const { query } = event;
    const error = query.state.error as any;
    if (error) {
      // Global query error handler
      if (error?.code === 'CONNECTION_ERROR') {
        toast.error('Connection lost. Please check your internet.');
      } else if (error?.code === 'SERVICE_UNAVAILABLE') {
        toast.error('Service temporarily unavailable. Please try again later.');
      } else if (error?.statusCode === 500) {
        toast.error('Server error occurred. Please try again.');
      }
      // Log error for debugging
      console.error('Query error:', {
        queryKey: query.queryKey,
        message: error?.message,
        code: error?.code,
        statusCode: error?.statusCode,
        stack: error?.stack
      });
    }
  }
});
queryClient.getMutationCache().subscribe((event) => {
  if (event.type === 'updated') {
    const { mutation } = event;
    const error = mutation.state.error as any;
    if (error) {
      // Global mutation error handler
      if (error?.code === 'CONFLICT') {
        toast.error('This action conflicts with existing data.');
      } else if (error?.code === 'FORBIDDEN') {
        toast.error('You do not have permission to perform this action.');
      } else if (error?.code === 'VALIDATION_ERROR') {
        toast.error(error?.message || 'Invalid data provided.');
      } else {
        toast.error(error?.message || 'An error occurred while processing your request.');
      }
      // Log mutation error for debugging
      console.error('Mutation error:', {
        mutationKey: mutation.options.mutationKey,
        message: error?.message,
        code: error?.code,
        statusCode: error?.statusCode,
        stack: error?.stack
      });
    } else if (mutation.state.status === 'success') {
      // Log successful mutations for monitoring
    }
  }
});
// Health check for query client
export const checkQueryClientHealth = () => {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();
  const mutations = queryClient.getMutationCache().getAll();
  return {
    queryCount: queries.length,
    mutationCount: mutations.length,
    isHealthy: true,
    timestamp: new Date().toISOString()
  };
};
// Clear all cached data (useful for logout or reset)
export const clearAllCache = () => {
  queryClient.clear();
  toast.success('Cache cleared successfully');
};
// Invalidate queries by pattern
export const invalidateQueriesByPattern = (pattern: string[]) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      return pattern.some(p => 
        query.queryKey.some(key => 
          typeof key === 'string' && key.includes(p)
        )
      );
    }
  });
};