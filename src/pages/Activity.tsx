import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/layouts/components/Navigation';
import { EmailVerificationBanner } from '@/features/user/components/EmailVerificationBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Activity as ActivityIcon, 
  Users, 
  Film, 
  BookOpen, 
  Heart, 
  Star,
  MessageCircle,
  Share,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock activity data - in real app would come from backend
const mockActivities = [
  {
    id: '1',
    type: 'watched',
    user: { name: 'Alex', avatar: '/avatars/alex.jpg' },
    content: { title: 'Attack on Titan', type: 'anime' },
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    episode: 24
  },
  {
    id: '2',
    type: 'rated',
    user: { name: 'Sarah', avatar: '/avatars/sarah.jpg' },
    content: { title: 'Demon Slayer', type: 'anime' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    rating: 9
  },
  {
    id: '3',
    type: 'added',
    user: { name: 'Mike', avatar: '/avatars/mike.jpg' },
    content: { title: 'One Piece', type: 'manga' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    list: 'Plan to Read'
  },
  {
    id: '4',
    type: 'completed',
    user: { name: 'Emma', avatar: '/avatars/emma.jpg' },
    content: { title: 'Death Note', type: 'anime' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4)
  }
];

const Activity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState(mockActivities);
  const [filter, setFilter] = useState('all'); // all, friends, following

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'watched': return <Film className="h-4 w-4" />;
      case 'read': return <BookOpen className="h-4 w-4" />;
      case 'rated': return <Star className="h-4 w-4" />;
      case 'added': return <Heart className="h-4 w-4" />;
      case 'completed': return <Badge className="h-4 w-4" />;
      case 'reviewed': return <MessageCircle className="h-4 w-4" />;
      case 'shared': return <Share className="h-4 w-4" />;
      default: return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'watched': return 'text-blue-400';
      case 'read': return 'text-green-400';
      case 'rated': return 'text-yellow-400';
      case 'added': return 'text-pink-400';
      case 'completed': return 'text-purple-400';
      case 'reviewed': return 'text-indigo-400';
      case 'shared': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const formatActivityText = (activity: any) => {
    switch (activity.type) {
      case 'watched':
        return `watched episode ${activity.episode} of ${activity.content.title}`;
      case 'rated':
        return `rated ${activity.content.title} ${activity.rating}/10`;
      case 'added':
        return `added ${activity.content.title} to ${activity.list}`;
      case 'completed':
        return `completed ${activity.content.title}`;
      default:
        return `interacted with ${activity.content.title}`;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      <Navigation />
      <EmailVerificationBanner />
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
                <ActivityIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Activity Feed
                </h1>
                <p className="text-muted-foreground">Stay up to date with what your friends are watching</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-4">
              <div className="flex bg-black/40 rounded-lg p-1 border border-pink-500/20">
                {[
                  { id: 'all', label: 'All Activity', icon: ActivityIcon },
                  { id: 'friends', label: 'Friends', icon: Users },
                  { id: 'following', label: 'Following', icon: Heart }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setFilter(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                        filter === tab.id
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                          : "text-pink-200/80 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <Card 
                  key={activity.id}
                  className="bg-black/40 border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <Avatar className="h-10 w-10 border-2 border-pink-400/50">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold">
                          {activity.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className={cn("p-1.5 rounded-md bg-white/10", getActivityColor(activity.type))}>
                            {getActivityIcon(activity.type)}
                          </div>
                          
                          <div className="flex-1">
                            <p className="text-white">
                              <span className="font-semibold">{activity.user.name}</span>{' '}
                              {formatActivityText(activity)}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimestamp(activity.timestamp)}
                              </div>
                              
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "capitalize",
                                  activity.content.type === 'anime' 
                                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                    : "bg-green-500/20 text-green-400 border-green-500/30"
                                )}
                              >
                                {activity.content.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-black/40 border-pink-500/20">
                <CardContent className="p-12 text-center">
                  <ActivityIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Activity Yet</h3>
                  <p className="text-muted-foreground">
                    Follow some users to see their activity here, or start watching something yourself!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Activity;