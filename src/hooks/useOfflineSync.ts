import { useState, useEffect, useCallback } from 'react';
import { useBackgroundSync } from './useBackgroundSync';

interface OfflineSyncState {
  isOffline: boolean;
  syncInProgress: boolean;
  lastSyncTime: Date | null;
  pendingOperations: number;
  errors: string[];
}

export function useOfflineSync() {
  const { syncInProgress } = useBackgroundSync();
  
  const [state, setState] = useState<OfflineSyncState>({
    isOffline: !navigator.onLine,
    syncInProgress: false,
    lastSyncTime: null,
    pendingOperations: 0,
    errors: []
  });

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update sync progress from background sync
  useEffect(() => {
    setState(prev => ({ ...prev, syncInProgress }));
  }, [syncInProgress]);

  const forceSync = useCallback(async () => {
    if (state.isOffline) {
      setState(prev => ({ 
        ...prev, 
        errors: [...prev.errors, 'Cannot sync while offline'] 
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, syncInProgress: true, errors: [] }));
      // Trigger background sync would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate sync
      setState(prev => ({ 
        ...prev, 
        syncInProgress: false, 
        lastSyncTime: new Date(),
        pendingOperations: 0
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        syncInProgress: false,
        errors: [...prev.errors, 'Sync failed: ' + (error as Error).message]
      }));
    }
  }, [state.isOffline]);

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: [] }));
  }, []);

  return {
    ...state,
    forceSync,
    clearErrors
  };
}