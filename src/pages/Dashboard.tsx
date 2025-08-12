import React, { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/layouts/components/Navigation";
import { EmailVerificationBanner } from "@/features/user/components/EmailVerificationBanner";
import { useSimpleGameification } from "@/hooks/useSimpleGameification";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { UserStats } from "@/features/dashboard/components/UserStats";
import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { 
  User, 
  BookOpen, 
  Heart, 
  TrendingUp, 
  Crown, 
  Star,
  RefreshCw,
  Sparkles,
  Calendar,
  BarChart3,
  Users,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Lazy load heavy components
const RecommendedForYou = React.lazy(() => import("@/features/home/components/RecommendedForYou").then(module => ({ default: module.RecommendedForYou })));
const BecauseYouWatched = React.lazy(() => import("@/features/home/components/BecauseYouWatched").then(module => ({ default: module.BecauseYouWatched })));
const AdvancedMLRecommendations = React.lazy(() => import("@/shared/components/AdvancedMLRecommendations").then(module => ({ default: module.AdvancedMLRecommendations })));

const Dashboard = React.memo(() => {
  const { user } = useAuth();
  const { stats: gamificationStats, loading: gamificationLoading } = useSimpleGameification();
  const { stats, activities, isLoading, error, refresh } = useDashboardData();
  const [refreshing, setRefreshing] = useState(false);

  // Memoize tier color calculation
  const getTierColor = useCallback((tier?: string) => {
    switch (tier) {
      case 'GOD': return 'text-yellow-400 border-yellow-400/20';
      case 'LEGENDARY': return 'text-purple-400 border-purple-400/20';
      case 'EPIC': return 'text-pink-400 border-pink-400/20';
      case 'RARE': return 'text-blue-400 border-blue-400/20';
      case 'UNCOMMON': return 'text-green-400 border-green-400/20';
      default: return 'text-muted-foreground border-border/20';
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
      toast.success('Dashboard refreshed!');
    } catch (err) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handleAddContent = useCallback(() => {
    // TODO: Open add content modal
    toast.info('Add content feature coming soon!');
  }, []);

  const handleSearch = useCallback(() => {
    // TODO: Open advanced search modal
    toast.info('Advanced search feature coming soon!');
  }, []);

  const handleImportList = useCallback(() => {
    // TODO: Open import list modal
    toast.info('Import list feature coming soon!');
  }, []);

  const handleExportList = useCallback(() => {
    // TODO: Export user list
    toast.info('Export list feature coming soon!');
  }, []);

  // Memoized loading component
  const loadingComponent = useMemo(() => (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    </div>
  ), []);

  if (isLoading && !stats) {
    return loadingComponent;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <Navigation />
      <EmailVerificationBanner />
      
      {/* Header */}
      <div className="relative pt-24 pb-12 mb-8">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="relative container mx-auto px-4">
          <div className="glass-card p-8 border border-primary/20 glow-primary">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Crown className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gradient-primary">
                  Welcome back, <span className={cn(
                    `username-${gamificationStats?.usernameTier?.toLowerCase() || 'common'}`
                  )}>
                    {gamificationStats?.currentUsername || user?.email?.split('@')[0] || 'User'}
                  </span>
                </h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="ml-4"
                >
                  <RefreshCw className={cn("w-4 h-4", { "animate-spin": refreshing })} />
                </Button>
              </div>
              
              {gamificationStats?.usernameTier && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">Username Tier:</span>
                  <Badge className={cn(
                    "text-lg font-bold capitalize",
                    getTierColor(gamificationStats.usernameTier)
                  )}>
                    <Sparkles className="w-4 h-4 mr-1" />
                    {gamificationStats.usernameTier.toLowerCase()}
                  </Badge>
                </div>
              )}
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
                Your personalized anime and manga hub with <span className="text-gradient-primary font-semibold">Anithing</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mobile-safe-padding py-6 md:py-8 space-y-8">
        {/* Error State */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive">Dashboard Error</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <QuickActions
          onAddContent={handleAddContent}
          onSearch={handleSearch}
          onImportList={handleImportList}
          onExportList={handleExportList}
          recentlyWatchingCount={stats?.currentlyWatching}
          planToWatchCount={stats?.planToWatch}
        />

        {/* User Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Your Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserStats data={stats} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Two Column Layout for Activities and Recommendations */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Activity Feed */}
          <ActivityFeed
            activities={activities}
            isLoading={isLoading}
            userId={user?.id}
            limit={10}
          />

          {/* Quick Stats Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats?.weeklyProgress || 0}</p>
                    <p className="text-sm text-blue-600">Episodes watched</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats?.streak || 0}</p>
                    <p className="text-sm text-green-600">Day streak</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Weekly Goal Progress</span>
                    <span>{stats?.weeklyProgress || 0} / {stats?.weeklyGoal || 5}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, ((stats?.weeklyProgress || 0) / (stats?.weeklyGoal || 5)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Social Stats */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Social
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold">{stats?.followers || 0}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{stats?.following || 0}</p>
                      <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations Section */}
        <div className="space-y-8">
          <React.Suspense fallback={<div className="h-64 animate-pulse bg-muted/20 rounded-lg" />}>
            <AdvancedMLRecommendations />
          </React.Suspense>
          <React.Suspense fallback={<div className="h-64 animate-pulse bg-muted/20 rounded-lg" />}>
            <RecommendedForYou />
          </React.Suspense>
          <React.Suspense fallback={<div className="h-64 animate-pulse bg-muted/20 rounded-lg" />}>
            <BecauseYouWatched limit={5} />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;