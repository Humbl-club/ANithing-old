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
      console.log('🔄 initializeUser called', { authLoading, user: !!user, isInitialized });
      
      if (authLoading) {
        console.log('⏳ Auth still loading, skipping initialization');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      console.log('🚀 Starting user initialization...');

      try {
        // If user is not authenticated, consider it initialized
        if (!user) {
          console.log('👤 No user - marking as initialized');
          setIsInitialized(true);
          return;
        }

        console.log('👤 User found - initializing user data');
        
        // Initialize user-specific data here
        // For example: load user preferences, lists, etc.
        
        // For now, we'll just mark as initialized
        // In a real app, you might:
        // - Load user preferences from database
        // - Initialize user's watchlists
        // - Set up notifications
        // - etc.
        
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async work
        
        console.log('✅ User initialization complete');
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ User initialization failed:', error);
        setError(error instanceof Error ? error.message : 'Initialization failed');
      } finally {
        console.log('🏁 User initialization finished');
        setIsLoading(false);
      }
    };

    console.log('🔍 useEffect triggered', { isInitialized, authLoading, user: !!user });
    
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