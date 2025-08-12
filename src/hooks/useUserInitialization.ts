import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useInitializationStore } from '@/store/initializationStore';

export const useUserInitialization = () => {
  const { user, loading: authLoading } = useAuth();
  const { isInitialized, setIsInitialized } = useInitializationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      if (authLoading) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // If user is not authenticated, consider it initialized
        if (!user) {
          setIsInitialized(true);
          return;
        }

        // Initialize user-specific data here
        // For example: load user preferences, lists, etc.
        
        // For now, we'll just mark as initialized
        // In a real app, you might:
        // - Load user preferences from database
        // - Initialize user's watchlists
        // - Set up notifications
        // - etc.
        
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async work
        
        setIsInitialized(true);
      } catch (error) {
        console.error('User initialization failed:', error);
        setError(error instanceof Error ? error.message : 'Initialization failed');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitialized) {
      initializeUser();
    }
  }, [user, authLoading, isInitialized, setIsInitialized]);

  return {
    isInitialized,
    isLoading,
    error
  };
};