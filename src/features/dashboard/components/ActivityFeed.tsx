import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle, 
  Star, 
  Plus, 
  BookOpen, 
  Play,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Users,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Use a simpler time formatting to avoid date-fns bundle size
const simpleTimeAgo = (date: string) => {
  const now = new Date().getTime();
  const time = new Date(date).getTime();
  const diff = now - time;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);
  
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

interface ActivityItem {
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

interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading: boolean;
  userId?: string; // If provided, shows activities for specific user
  showSocial?: boolean; // Whether to show social activities (follows, etc.)
  limit?: number;
  className?: string;
}

const ActivityIcon: React.FC<{ type: string; className?: string }> = memo(({ type, className = "w-4 h-4" }) => {
  switch (type) {
    case 'started':
      return <Play className={className} />;
    case 'completed':
      return <CheckCircle className={className} />;
    case 'added':
      return <Plus className={className} />;
    case 'updated':
      return <TrendingUp className={className} />;
    case 'rated':
      return <Star className={className} />;
    case 'reviewed':
      return <MessageCircle className={className} />;
    case 'achievement':
      return <Award className={className} />;
    case 'milestone':
      return <TrendingUp className={className} />;
    case 'social':
      return <Users className={className} />;
    default:
      return <BookOpen className={className} />;
  }
});

const ActivityTypeColors = {
  started: 'text-green-500 bg-green-50 dark:bg-green-950',
  completed: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
  added: 'text-purple-500 bg-purple-50 dark:bg-purple-950',
  updated: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
  rated: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950',
  reviewed: 'text-pink-500 bg-pink-50 dark:bg-pink-950',
  achievement: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950',
  milestone: 'text-red-500 bg-red-50 dark:bg-red-950',
  social: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950'
};

const ActivityText: React.FC<{ activity: ActivityItem }> = memo(({ activity }) => {
  const username = activity.profiles?.display_name || activity.profiles?.username || 'Someone';
  const titleName = activity.titles?.english_title || activity.titles?.title || 'a title';
  const metadata = activity.metadata;

  switch (activity.activity_type) {
    case 'started':
      const mediaType = activity.titles?.media_type?.toLowerCase() || 'title';
      return (
        <span>
          <strong>{username}</strong> started {mediaType === 'anime' ? 'watching' : 'reading'}{' '}
          <span className="font-medium text-foreground">{titleName}</span>
        </span>
      );

    case 'completed':
      return (
        <span>
          <strong>{username}</strong> completed{' '}
          <span className="font-medium text-foreground">{titleName}</span>
          {metadata.episodeNumber && (
            <span className="text-muted-foreground"> (Episode {metadata.episodeNumber})</span>
          )}
          {metadata.chapterNumber && (
            <span className="text-muted-foreground"> (Chapter {metadata.chapterNumber})</span>
          )}
        </span>
      );

    case 'added':
      return (
        <span>
          <strong>{username}</strong> added{' '}
          <span className="font-medium text-foreground">{titleName}</span> to their{' '}
          {metadata.listName || 'list'}
        </span>
      );

    case 'updated':
      return (
        <span>
          <strong>{username}</strong> updated their progress on{' '}
          <span className="font-medium text-foreground">{titleName}</span>
          {metadata.progress && (
            <span className="text-muted-foreground"> ({metadata.progress})</span>
          )}
        </span>
      );

    case 'rated':
      return (
        <span>
          <strong>{username}</strong> rated{' '}
          <span className="font-medium text-foreground">{titleName}</span>
          {metadata.score && (
            <Badge variant="secondary" className="ml-2">
              <Star className="w-3 h-3 mr-1" />
              {metadata.score}/10
            </Badge>
          )}
        </span>
      );

    case 'reviewed':
      return (
        <span>
          <strong>{username}</strong> wrote a review for{' '}
          <span className="font-medium text-foreground">{titleName}</span>
        </span>
      );

    case 'achievement':
      return (
        <span>
          <strong>{username}</strong> unlocked the achievement{' '}
          <span className="font-medium text-foreground">"{metadata.achievement}"</span>
        </span>
      );

    case 'milestone':
      return (
        <span>
          <strong>{username}</strong> reached a milestone:{' '}
          <span className="font-medium text-foreground">{metadata.milestone}</span>
        </span>
      );

    case 'social':
      return (
        <span>
          <strong>{username}</strong> started following{' '}
          <span className="font-medium text-foreground">{metadata.friend}</span>
        </span>
      );

    default:
      return (
        <span>
          <strong>{username}</strong> performed an action on{' '}
          <span className="font-medium text-foreground">{titleName}</span>
        </span>
      );
  }
});

const ActivityItemComponent: React.FC<{ activity: ActivityItem }> = memo(({ activity }) => {
  const colorClasses = ActivityTypeColors[activity.activity_type] || ActivityTypeColors.added;

  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-accent/50 rounded-lg transition-colors group">
      {/* User Avatar */}
      <Avatar className="w-10 h-10 ring-2 ring-background">
        <AvatarImage src={activity.profiles?.avatar_url || ''} />
        <AvatarFallback className="text-xs">
          {(activity.profiles?.username || activity.profiles?.display_name || '?')[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 space-y-2">
        {/* Activity Header */}
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-full", colorClasses)}>
            <ActivityIcon type={activity.activity_type} className="w-3 h-3" />
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {simpleTimeAgo(activity.created_at)}
          </span>
          {activity.is_private && (
            <Badge variant="outline" className="text-xs">Private</Badge>
          )}
        </div>

        {/* Activity Text */}
        <div className="text-sm">
          <ActivityText activity={activity} />
        </div>

        {/* Review Preview */}
        {activity.activity_type === 'reviewed' && activity.metadata.review && (
          <div className="bg-muted/50 p-3 rounded-md mt-2">
            <p className="text-xs text-muted-foreground line-clamp-2">
              "{activity.metadata.review}"
            </p>
          </div>
        )}

        {/* Title Image for Content Activities */}
        {activity.titles?.image_url && (
          <div className="flex items-center gap-3 mt-2">
            <img
              src={activity.titles.image_url}
              alt={activity.titles.title}
              className="w-12 h-16 object-cover rounded border shadow-sm"
            />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium">{activity.titles.english_title || activity.titles.title}</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {activity.titles.media_type}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Heart className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MessageCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

export const ActivityFeed: React.FC<ActivityFeedProps> = memo(({ 
  activities, 
  isLoading, 
  userId, 
  showSocial = true,
  limit,
  className 
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter activities based on settings
  const filteredActivities = activities
    .filter(activity => showSocial || activity.activity_type !== 'social')
    .slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {userId ? 'User Activities' : 'Recent Activity'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              {userId ? 'No activities yet' : 'No recent activity'}
            </p>
            <p className="text-sm text-muted-foreground">
              {userId 
                ? 'Start watching anime or reading manga to see activities here!' 
                : 'Follow some users to see their activities here!'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredActivities.map((activity) => (
              <ActivityItemComponent key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {filteredActivities.length > 0 && activities.length > (limit || 20) && (
          <div className="p-4 text-center border-t">
            <Button variant="outline" size="sm">
              Load More Activities
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ActivityFeed.displayName = 'ActivityFeed';