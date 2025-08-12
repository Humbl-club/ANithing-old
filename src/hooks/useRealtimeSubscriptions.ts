import { useEffect, useRef, useCallback } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface SubscriptionOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  filter?: string;
}

interface UseRealtimeSubscriptionsProps {
  subscriptions: SubscriptionOptions[];
  onDataChange?: (payload: RealtimePostgresChangesPayload<any>) => void;
  enabled?: boolean;
}

/**
 * Hook for managing real-time subscriptions to database changes
 * Automatically handles cleanup and re-subscription
 */
export function useRealtimeSubscriptions({
  subscriptions,
  onDataChange,
  enabled = true
}: UseRealtimeSubscriptionsProps) {
  const { user } = useAuth();
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const callbackRef = useRef(onDataChange);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = onDataChange;
  }, [onDataChange]);

  const cleanup = useCallback(() => {
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];
  }, []);

  const setupSubscriptions = useCallback(() => {
    if (!enabled || !user) return;

    cleanup();

    subscriptions.forEach((subscription) => {
      const {
        table,
        event = '*',
        schema = 'public',
        filter
      } = subscription;

      let channel = supabase.channel(`${table}_changes_${Math.random()}`);

      // Add postgres changes listener
      channel = channel.on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          filter: filter || `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log(`Real-time change in ${table}:`, payload);
          
          // Show toast notification for significant changes
          if (payload.eventType === 'INSERT') {
            switch (table) {
              case 'user_lists':
                toast.success('Added to your list');
                break;
              case 'user_ratings':
                toast.success('Rating saved');
                break;
              case 'user_activities':
                // Don't show toast for activities to avoid spam
                break;
              default:
                toast.success('Data updated');
            }
          } else if (payload.eventType === 'UPDATE') {
            switch (table) {
              case 'user_lists':
                toast.success('List updated');
                break;
              case 'user_preferences':
                toast.success('Preferences saved');
                break;
              case 'profiles':
                toast.success('Profile updated');
                break;
            }
          }

          // Call the provided callback
          callbackRef.current?.(payload);
        }
      );

      // Subscribe to the channel
      channel.subscribe((status) => {
        console.log(`Subscription status for ${table}:`, status);
        
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Successfully subscribed to ${table} changes`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Failed to subscribe to ${table} changes`);
          toast.error(`Connection issue with ${table} updates`);
        }
      });

      channelsRef.current.push(channel);
    });
  }, [subscriptions, enabled, user, cleanup]);

  // Setup subscriptions when dependencies change
  useEffect(() => {
    setupSubscriptions();
    
    return cleanup;
  }, [setupSubscriptions, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isConnected: channelsRef.current.length > 0,
    reconnect: setupSubscriptions,
    disconnect: cleanup
  };
}

/**
 * Hook specifically for user list changes
 */
export function useUserListSubscription(onListChange?: (payload: any) => void) {
  return useRealtimeSubscriptions({
    subscriptions: [
      { table: 'user_lists', event: '*' },
      { table: 'user_ratings', event: '*' }
    ],
    onDataChange: onListChange,
    enabled: true
  });
}

/**
 * Hook specifically for user profile and preferences changes
 */
export function useUserProfileSubscription(onProfileChange?: (payload: any) => void) {
  return useRealtimeSubscriptions({
    subscriptions: [
      { table: 'profiles', event: 'UPDATE' },
      { table: 'user_preferences', event: '*' }
    ],
    onDataChange: onProfileChange,
    enabled: true
  });
}

/**
 * Hook for activity feed real-time updates
 */
export function useActivityFeedSubscription(onActivityChange?: (payload: any) => void) {
  const { user } = useAuth();
  
  return useRealtimeSubscriptions({
    subscriptions: [
      { 
        table: 'user_activities',
        event: 'INSERT',
        filter: `user_id=eq.${user?.id}`
      },
      {
        table: 'user_follows',
        event: '*',
        filter: `follower_id=eq.${user?.id}`
      }
    ],
    onDataChange: onActivityChange,
    enabled: !!user
  });
}

/**
 * Hook for social features (follows, shared lists)
 */
export function useSocialSubscription(onSocialChange?: (payload: any) => void) {
  const { user } = useAuth();
  
  return useRealtimeSubscriptions({
    subscriptions: [
      {
        table: 'user_follows',
        event: '*',
        filter: `following_id=eq.${user?.id}` // When someone follows/unfollows this user
      },
      {
        table: 'shared_lists',
        event: '*'
      }
    ],
    onDataChange: onSocialChange,
    enabled: !!user
  });
}

/**
 * Hook for admin/global content updates
 */
export function useContentUpdatesSubscription(onContentChange?: (payload: any) => void) {
  return useRealtimeSubscriptions({
    subscriptions: [
      {
        table: 'titles',
        event: '*',
        filter: '' // No filter - listen to all title changes
      }
    ],
    onDataChange: onContentChange,
    enabled: true
  });
}