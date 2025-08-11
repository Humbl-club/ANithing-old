import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
type HealthStatusType = 'ok' | 'degraded' | 'error' | 'unknown';
export function HealthStatus() {
  const [status, setStatus] = useState<HealthStatusType>('unknown');
  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('health', { body: {} });
        if (!mounted) return;
        if (error) throw error;
        const healthStatus = (data?.data?.status as string) || 'degraded';
        setStatus(healthStatus === 'ok' ? 'ok' : 'degraded');
      } catch {
        if (mounted) setStatus('error');
      }
    };
    checkHealth();
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);
  const statusColors = {
    ok: 'bg-green-500',
    degraded: 'bg-yellow-500',
    error: 'bg-red-500',
    unknown: 'bg-gray-500'
  };
  return (
    <div className="fixed bottom-3 right-3 text-xs px-2 py-1 rounded bg-muted/60 backdrop-blur border">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
        <span>Health: {status}</span>
      </div>
    </div>
  );
}