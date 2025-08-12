import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DashboardStats {
  // Watch/Read stats
  totalAnimeWatched: number;
  totalMangaRead: number;
  totalEpisodesWatched: number;
  totalChaptersRead: number;
  totalWatchTimeHours: number;
  totalReadTimeHours: number;

  // List stats
  currentlyWatching: number;
  currentlyReading: number;
  onHold: number;
  dropped: number;
  planToWatch: number;
  planToRead: number;

  // Rating stats
  averageAnimeScore: number;
  averageMangaScore: number;
  totalRatingsGiven: number;
  
  // Social stats
  followers: number;
  following: number;
  listsShared: number;

  // Achievement stats
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    unlockedAt: string;
  }>;

  // Activity stats
  streak: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export interface DashboardActivity {
  id: string;
  user_id: string;
  activity_type: 'started' | 'completed' | 'rated' | 'reviewed' | 'added' | 'updated' | 'achievement' | 'milestone' | 'social';
  title_id?: string;
  metadata: {
    score?: number;
    progress?: number;
    oldStatus?: string;
    newStatus?: string;
    achievement?: string;
    milestone?: string;
    friend?: string;
    listName?: string;
    review?: string;
    episodeNumber?: number;
    chapterNumber?: number;
  };
  created_at: string;
  is_private: boolean;
  profiles?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
  titles?: {
    title: string;
    english_title?: string;
    image_url?: string;
    media_type: 'ANIME' | 'MANGA';
  };
}

export interface DashboardData {
  stats: DashboardStats | null;
  activities: DashboardActivity[];
  recommendations: any[]; // Will be typed based on your recommendation system
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useDashboardData = (): DashboardData => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStats = useCallback(async (): Promise<DashboardStats | null> => {
    if (!user?.id) return null;

    try {
      // Call the dashboard stats RPC function
      const { data, error } = await supabase.rpc('get_user_dashboard_stats', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching user stats:', error);
        return null;
      }

      return data || {
        totalAnimeWatched: 0,
        totalMangaRead: 0,
        totalEpisodesWatched: 0,
        totalChaptersRead: 0,
        totalWatchTimeHours: 0,
        totalReadTimeHours: 0,
        currentlyWatching: 0,
        currentlyReading: 0,
        onHold: 0,
        dropped: 0,
        planToWatch: 0,
        planToRead: 0,
        averageAnimeScore: 0,
        averageMangaScore: 0,
        totalRatingsGiven: 0,
        followers: 0,
        following: 0,
        listsShared: 0,
        achievements: [],
        streak: 0,
        weeklyGoal: 5,
        weeklyProgress: 0
      };
    } catch (err) {
      console.error('Error in fetchUserStats:', err);
      return null;
    }
  }, [user?.id]);

  const fetchUserActivities = useCallback(async (): Promise<DashboardActivity[]> => {
    if (!user?.id) return [];

    try {
      // For now, let's get activities from user_activities table with proper joins
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          id,
          user_id,
          activity_type,
          title_id,
          metadata,
          created_at,
          is_private,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          ),
          titles:title_id (
            title,
            english_title,
            image_url,
            media_type
          )
        `)
        .eq('user_id', user.id)
        .eq('is_private', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in fetchUserActivities:', err);
      return [];
    }
  }, [user?.id]);

  const fetchRecommendations = useCallback(async (): Promise<any[]> => {
    if (!user?.id) return [];

    try {
      // Call the recommendations RPC or endpoint
      const { data, error } = await supabase.rpc('get_user_recommendations', {
        p_user_id: user.id,
        p_limit: 10
      });

      if (error) {
        console.error('Error fetching recommendations:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in fetchRecommendations:', err);
      return [];
    }
  }, [user?.id]);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [statsData, activitiesData, recommendationsData] = await Promise.all([
        fetchUserStats(),
        fetchUserActivities(),
        fetchRecommendations()
      ]);

      setStats(statsData);
      setActivities(activitiesData);
      setRecommendations(recommendationsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, fetchUserStats, fetchUserActivities, fetchRecommendations]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    stats,
    activities,
    recommendations,
    isLoading,
    error,
    refresh
  };
};

// Helper hook for real-time activity updates
export const useRealtimeActivities = (userId?: string) => {
  const [activities, setActivities] = useState<DashboardActivity[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to real-time changes in user_activities
    const subscription = supabase
      .channel('user_activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activities',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          // Fetch the complete activity with joins
          const { data } = await supabase
            .from('user_activities')
            .select(`
              id,
              user_id,
              activity_type,
              title_id,
              metadata,
              created_at,
              is_private,
              profiles:user_id (
                username,
                display_name,
                avatar_url
              ),
              titles:title_id (
                title,
                english_title,
                image_url,
                media_type
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setActivities(prev => [data, ...prev.slice(0, 19)]); // Keep only latest 20
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return activities;
};

// Helper hook for dashboard metrics
export const useDashboardMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    weeklyGoal: 5,
    weeklyProgress: 0,
    streak: 0,
    totalMinutesWatched: 0
  });

  const updateWeeklyProgress = useCallback(async (episodesWatched: number) => {
    if (!user?.id) return;

    // Update weekly progress in user preferences or a separate table
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          weekly_progress: episodesWatched
        });

      if (!error) {
        setMetrics(prev => ({ ...prev, weeklyProgress: episodesWatched }));
      }
    } catch (err) {
      console.error('Error updating weekly progress:', err);
    }
  }, [user?.id]);

  return {
    metrics,
    updateWeeklyProgress
  };
};