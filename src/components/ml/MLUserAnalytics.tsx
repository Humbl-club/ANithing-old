interface MLUserAnalyticsProps {
  userAnalytics: {
    averageRating: number;
    recentTrend: 'up' | 'down' | 'stable';
    ratingVariance: number;
  };
}

export const MLUserAnalytics = ({ userAnalytics }: MLUserAnalyticsProps) => {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <span>Avg Rating: {userAnalytics.averageRating.toFixed(1)}★</span>
      <span>
        Trend: {userAnalytics.recentTrend === 'up' ? '📈' : userAnalytics.recentTrend === 'down' ? '📉' : '➡️'}
      </span>
      <span>Pattern: {userAnalytics.ratingVariance < 1 ? 'Consistent' : 'Varied'} taste</span>
    </div>
  );
};