import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  BookOpen, 
  Star, 
  TrendingUp, 
  Trophy, 
  Target,
  Calendar,
  Heart,
  Zap,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserStatsData {
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

interface UserStatsProps {
  data: UserStatsData | null;
  isLoading: boolean;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}> = memo(({ title, value, subtitle, icon, color, trend }) => (
  <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
    <div className={cn("absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity", color)} />
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <Badge variant={trend.isPositive ? "default" : "secondary"} className="text-xs">
                <TrendingUp className={cn("w-3 h-3 mr-1", {
                  "rotate-180": !trend.isPositive
                })} />
                {Math.abs(trend.value)}%
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", color)}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
));

const AchievementBadge: React.FC<{
  achievement: UserStatsData['achievements'][0];
}> = memo(({ achievement }) => {
  const tierColors = {
    bronze: 'bg-orange-100 border-orange-300 text-orange-800',
    silver: 'bg-gray-100 border-gray-300 text-gray-800', 
    gold: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    platinum: 'bg-purple-100 border-purple-300 text-purple-800'
  };

  return (
    <div className={cn(
      "relative p-3 rounded-lg border-2 text-center transition-all duration-300 hover:scale-105",
      tierColors[achievement.tier]
    )}>
      <div className="text-2xl mb-1">{achievement.icon}</div>
      <p className="text-xs font-semibold">{achievement.name}</p>
      <p className="text-xs opacity-75 mt-1">{achievement.description}</p>
    </div>
  );
});

export const UserStats: React.FC<UserStatsProps> = memo(({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No statistics available yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start adding anime and manga to your lists to see your stats!
          </p>
        </CardContent>
      </Card>
    );
  }

  const watchTimeInDays = Math.floor(data.totalWatchTimeHours / 24);
  const readTimeInDays = Math.floor(data.totalReadTimeHours / 24);

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Anime Watched"
          value={data.totalAnimeWatched}
          subtitle={`${data.totalEpisodesWatched} episodes`}
          icon={<BookOpen className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        
        <StatCard
          title="Manga Read"
          value={data.totalMangaRead}
          subtitle={`${data.totalChaptersRead} chapters`}
          icon={<BookOpen className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />

        <StatCard
          title="Watch Time"
          value={`${watchTimeInDays}d`}
          subtitle={`${data.totalWatchTimeHours} hours total`}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />

        <StatCard
          title="Average Score"
          value={data.averageAnimeScore.toFixed(1)}
          subtitle={`${data.totalRatingsGiven} ratings given`}
          icon={<Star className="w-6 h-6 text-white" />}
          color="bg-yellow-500"
        />

        <StatCard
          title="Currently Watching"
          value={data.currentlyWatching}
          subtitle="In progress"
          icon={<Zap className="w-6 h-6 text-white" />}
          color="bg-orange-500"
        />

        <StatCard
          title="Plan to Watch"
          value={data.planToWatch}
          subtitle="In backlog"
          icon={<Target className="w-6 h-6 text-white" />}
          color="bg-indigo-500"
        />

        <StatCard
          title="Followers"
          value={data.followers}
          subtitle={`Following ${data.following}`}
          icon={<Heart className="w-6 h-6 text-white" />}
          color="bg-pink-500"
        />

        <StatCard
          title="Streak"
          value={`${data.streak} days`}
          subtitle="Activity streak"
          icon={<Trophy className="w-6 h-6 text-white" />}
          color="bg-red-500"
        />
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Episodes watched this week</span>
              <span className="font-medium">{data.weeklyProgress} / {data.weeklyGoal}</span>
            </div>
            <Progress 
              value={(data.weeklyProgress / data.weeklyGoal) * 100} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {data.weeklyGoal - data.weeklyProgress > 0 
                ? `${data.weeklyGoal - data.weeklyProgress} episodes to reach your weekly goal`
                : "Weekly goal completed! 🎉"
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {data.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {data.achievements.slice(0, 6).map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </div>
            {data.achievements.length > 6 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                And {data.achievements.length - 6} more achievements...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* List Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>List Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{data.currentlyWatching}</p>
              <p className="text-sm text-green-600">Watching</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{data.totalAnimeWatched}</p>
              <p className="text-sm text-blue-600">Completed</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{data.onHold}</p>
              <p className="text-sm text-yellow-600">On Hold</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{data.planToWatch}</p>
              <p className="text-sm text-purple-600">Plan to Watch</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{data.dropped}</p>
              <p className="text-sm text-red-600">Dropped</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">{data.currentlyReading}</p>
              <p className="text-sm text-indigo-600">Reading</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

UserStats.displayName = 'UserStats';