import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface GameificationStats {
  level: number;
  exp: number;
  expToNext: number;
  totalAnime: number;
  totalManga: number;
  completedAnime: number;
  completedManga: number;
  totalScore: number;
  achievements: string[];
}

export function useSimpleGameification() {
  const { user } = useAuth();
  const [stats, setStats] = useState<GameificationStats>({
    level: 1,
    exp: 0,
    expToNext: 100,
    totalAnime: 0,
    totalManga: 0,
    completedAnime: 0,
    completedManga: 0,
    totalScore: 0,
    achievements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Mock data for now - in a real app this would fetch from database
      setStats({
        level: 5,
        exp: 250,
        expToNext: 500,
        totalAnime: 15,
        totalManga: 8,
        completedAnime: 10,
        completedManga: 5,
        totalScore: 4200,
        achievements: ['First Watch', 'Binge Watcher', 'Manga Reader']
      });

      setLoading(false);
    };

    loadStats();
  }, [user]);

  return { stats, loading };
}