import { useState, useEffect } from 'react';

export function useBackgroundSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const startSync = async () => {
    setIsSyncing(true);
    // Simulate sync
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date());
    }, 2000);
  };

  useEffect(() => {
    // Start periodic sync when online
    if (navigator.onLine) {
      const interval = setInterval(() => {
        if (!isSyncing) {
          startSync();
        }
      }, 300000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [isSyncing]);

  return {
    isSyncing,
    lastSyncTime,
    startSync
  };
}