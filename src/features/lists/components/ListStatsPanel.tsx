import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3,
  TrendingUp,
  Clock,
  Star,
  Calendar,
  Target,
  Award,
  Zap
} from 'lucide-react';
import type { ListStats, ListStatus, EnhancedUserTitleListEntry } from '@/types/userLists';

interface ListStatsPanelProps {
  stats: ListStats;
  listItems: EnhancedUserTitleListEntry[];
  listStatuses: ListStatus[];
  contentType: 'anime' | 'manga' | 'both';
  compact?: boolean;
}

export function ListStatsPanel({ 
  stats, 
  listItems, 
  listStatuses, 
  contentType,
  compact = false 
}: ListStatsPanelProps) {
  
  // Calculate additional stats
  const completedItems = listItems.filter(item => {
    const status = listStatuses.find(s => s.id === item.status_id);
    return status?.name === 'completed';
  }).length;
  
  const watchingReadingItems = listItems.filter(item => {
    const status = listStatuses.find(s => s.id === item.status_id);
    return status?.name === 'watching' || status?.name === 'reading';
  }).length;
  
  const plannedItems = listItems.filter(item => {
    const status = listStatuses.find(s => s.id === item.status_id);
    return status?.name === 'plan_to_watch' || status?.name === 'plan_to_read';
  }).length;
  
  const ratedItems = listItems.filter(item => item.score && item.score > 0).length;
  const averageScore = ratedItems > 0 
    ? listItems.reduce((sum, item) => sum + (item.score || 0), 0) / ratedItems
    : 0;
    
  const totalEpisodes = contentType === 'anime' || contentType === 'both'
    ? listItems.reduce((sum, item) => {
        if (item.media_type === 'anime' && item.episodes_watched) {
          return sum + item.episodes_watched;
        }
        return sum;
      }, 0)
    : 0;
    
  const totalChapters = contentType === 'manga' || contentType === 'both'
    ? listItems.reduce((sum, item) => {
        if (item.media_type === 'manga' && item.chapters_read) {
          return sum + item.chapters_read;
        }
        return sum;
      }, 0)
    : 0;
    
  const recentActivity = listItems
    .filter(item => {
      const lastActivity = new Date(item.updated_at || item.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastActivity > weekAgo;
    }).length;
    
  // Calculate time-based stats
  const averageEpisodeLength = 24; // minutes
  const totalWatchTime = Math.round((totalEpisodes * averageEpisodeLength) / 60); // hours
  
  const completionRate = stats.total > 0 ? (completedItems / stats.total) * 100 : 0;
  
  // Format time
  const formatTime = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };
  
  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{completedItems}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{recentActivity}</div>
                <div className="text-sm text-muted-foreground">This week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="grid gap-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  {averageScore.toFixed(1)}
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Average Rating ({ratedItems} rated)
                </div>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{recentActivity}</div>
                <div className="text-sm text-muted-foreground">Active This Week</div>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listStatuses.map(status => {
              const count = stats.statusCounts[status.id] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              
              if (count === 0) return null;
              
              return (
                <div key={status.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-sm">
                      {status.label}
                    </Badge>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground text-right">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Content-specific Stats */}
      {(contentType === 'anime' || contentType === 'both') && totalEpisodes > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Anime Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{totalEpisodes}</div>
                <div className="text-sm text-muted-foreground">Episodes Watched</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{formatTime(totalWatchTime)}</div>
                <div className="text-sm text-muted-foreground">Total Watch Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {totalEpisodes > 0 ? (totalEpisodes / Math.max(completedItems, 1)).toFixed(1) : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Avg Episodes/Series</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {(contentType === 'manga' || contentType === 'both') && totalChapters > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Manga Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{totalChapters}</div>
                <div className="text-sm text-muted-foreground">Chapters Read</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {totalChapters > 0 ? (totalChapters / Math.max(completedItems, 1)).toFixed(1) : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Avg Chapters/Series</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {listItems
              .filter(item => {
                const lastActivity = new Date(item.updated_at || item.created_at);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return lastActivity > weekAgo;
              })
              .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
              .slice(0, 5)
              .map(item => {
                const status = listStatuses.find(s => s.id === item.status_id);
                const lastActivity = new Date(item.updated_at || item.created_at);
                const timeAgo = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60));
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {(item.title as any)?.title || 'Unknown Title'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {status?.label} • {item.media_type}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {timeAgo < 1 ? 'Just now' : timeAgo < 24 ? `${timeAgo}h ago` : `${Math.floor(timeAgo / 24)}d ago`}
                    </div>
                  </div>
                );
              })}
              
            {recentActivity === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity this week
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}