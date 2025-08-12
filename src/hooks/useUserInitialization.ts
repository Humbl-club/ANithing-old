import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useInitializationStore } from '@/store/initializationStore';

export const useUserInitialization = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    isInitialized, 
    isLoading, 
    error, 
    setLoading, 
    setError, 
    setInitialized 
  } = useInitializationStore();

  useEffect(() => {
    const initializeUser = async () => {
      if (authLoading) return;
      
      setLoading(true);
      setError(null);

      try {
        // If user is not authenticated, consider it initialized
        if (!user) {
          setInitialized(true);
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
        
        setInitialized(true);
      } catch (error) {
        console.error('User initialization failed:', error);
        setError(error instanceof Error ? error.message : 'Initialization failed');
      } finally {
        setLoading(false);
      }
    };

    if (!isInitialized) {
      initializeUser();
    }
  }, [user, authLoading, isInitialized, setLoading, setError, setInitialized]);

  return {
    isInitialized,
    isLoading,
    error
  };
};