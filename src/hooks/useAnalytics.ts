import { useState, useEffect } from 'react';

interface AnalyticsData {
  pageViews: number;
  uniqueUsers: number;
  topContent: Array<{ title: string; views: number }>;
  userActivity: Array<{ date: string; activity: number }>;
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock analytics data
    setTimeout(() => {
      setData({
        pageViews: 12543,
        uniqueUsers: 3421,
        topContent: [
          { title: 'Attack on Titan', views: 1234 },
          { title: 'Demon Slayer', views: 987 },
          { title: 'One Piece', views: 856 }
        ],
        userActivity: [
          { date: '2024-01-01', activity: 45 },
          { date: '2024-01-02', activity: 67 },
          { date: '2024-01-03', activity: 89 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  return { data, loading, error };
}
