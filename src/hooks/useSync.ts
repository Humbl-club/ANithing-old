import { useState, useCallback } from 'react';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const startSync = useCallback(async () => {
    try {
      setIsSyncing(true);
      // Placeholder for sync logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    isSyncing,
    lastSyncTime,
    startSync
  };
}