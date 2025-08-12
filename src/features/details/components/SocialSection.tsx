import React, { useState } from 'react';
import { BaseContent } from '@/types/content.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Flag,
  Users,
  TrendingUp,
  Heart,
  Share2,
  MoreHorizontal,
  Pin,
  Award,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
    badges: ('premium' | 'moderator' | 'verified')[];
  };
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  replies: Comment[];
  isLiked?: boolean;
  isDisliked?: boolean;
  isPinned?: boolean;
  isEdited?: boolean;
}

interface Discussion {
  id: string;
  title: string;
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  replies: number;
  likes: number;
  category: 'general' | 'episode' | 'theory' | 'recommendation';
  isHot?: boolean;
  isPinned?: boolean;
}

interface SocialSectionProps {
  content: BaseContent;
  contentType: 'anime' | 'manga';
}

// Mock data
const mockComments: Comment[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      username: 'AnimeExpert2024',
      avatar: '/placeholder.svg',
      badges: ['premium', 'verified']
    },
    content: 'This is absolutely one of the best anime series I\'ve ever watched! The character development is incredible and the animation quality is top-notch throughout.',
    timestamp: '2 hours ago',
    likes: 45,
    dislikes: 2,
    replies: [
      {
        id: '2',
        user: {
          id: 'user2',
          username: 'CasualViewer',
          avatar: '/placeholder.svg',
          badges: []
        },
        content: 'I totally agree! The way they handled the character arcs was masterful.',
        timestamp: '1 hour ago',
        likes: 12,
        dislikes: 0,
        replies: []
      }
    ],
    isPinned: true
  },
  {
    id: '3',
    user: {
      id: 'user3',
      username: 'MangaReader',
      avatar: '/placeholder.svg',
      badges: ['moderator']
    },
    content: 'As someone who read the manga first, I was worried about the adaptation, but they did an amazing job staying faithful to the source material while adding their own flair.',
    timestamp: '4 hours ago',
    likes: 28,
    dislikes: 1,
    replies: [],
    isEdited: true
  }
];

const mockDiscussions: Discussion[] = [
  {
    id: '1',
    title: 'Episode 12 Discussion - That ending was incredible!',
    user: {
      id: 'user1',
      username: 'AnimeExpert2024',
      avatar: '/placeholder.svg'
    },
    content: 'Can we talk about how they handled the final battle? The animation and emotional impact were perfect...',
    timestamp: '3 hours ago',
    replies: 127,
    likes: 89,
    category: 'episode',
    isHot: true,
    isPinned: true
  },
  {
    id: '2',
    title: 'Theory: What the opening sequence really means',
    user: {
      id: 'user2',
      username: 'TheoryMaster',
      avatar: '/placeholder.svg'
    },
    content: 'I noticed some interesting symbolism in the opening that might hint at future plot developments...',
    timestamp: '6 hours ago',
    replies: 43,
    likes: 67,
    category: 'theory',
    isHot: true
  },
  {
    id: '3',
    title: 'Similar anime recommendations based on this series',
    user: {
      id: 'user3',
      username: 'RecommendationBot',
      avatar: '/placeholder.svg'
    },
    content: 'If you loved this series, here are some similar anime you might enjoy...',
    timestamp: '1 day ago',
    replies: 76,
    likes: 134,
    category: 'recommendation'
  }
];

export function SocialSection({ content, contentType }: SocialSectionProps) {
  const [selectedTab, setSelectedTab] = useState('comments');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('popular');

  const UserBadges = ({ badges }: { badges: string[] }) => (
    <div className="flex gap-1">
      {badges.map(badge => (
        <div key={badge} className="inline-flex">
          {badge === 'premium' && (
            <Award className="w-3 h-3 text-yellow-500" title="Premium Member" />
          )}
          {badge === 'moderator' && (
            <Pin className="w-3 h-3 text-blue-500" title="Moderator" />
          )}
          {badge === 'verified' && (
            <Badge variant="secondary" className="text-xs px-1 py-0">✓</Badge>
          )}
        </div>
      ))}
    </div>
  );

  const CommentCard = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <Card className={cn("", isReply && "ml-8 border-l-2 border-primary/20")}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.user.avatar} alt={comment.user.username} />
            <AvatarFallback>{comment.user.username.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.user.username}</span>
              <UserBadges badges={comment.user.badges} />
              {comment.isPinned && (
                <Pin className="w-3 h-3 text-blue-500" />
              )}
              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
              {comment.isEdited && (
                <Badge variant="outline" className="text-xs">Edited</Badge>
              )}
            </div>
            
            <p className="text-sm leading-relaxed mb-3">{comment.content}</p>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-7 px-2", comment.isLiked && "text-blue-600")}
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                {comment.likes}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-7 px-2", comment.isDisliked && "text-red-600")}
              >
                <ThumbsDown className="w-3 h-3 mr-1" />
                {comment.dislikes}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              >
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </Button>
              
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <Flag className="w-3 h-3" />
              </Button>
              
              <Button variant="ghost" size="sm" className="h-7 px-1 ml-auto">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            
            {replyingTo === comment.id && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <Textarea 
                  placeholder="Write a reply..." 
                  className="mb-2 resize-none" 
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm">Post Reply</Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {comment.replies.length > 0 && (
              <div className="mt-4 space-y-3">
                {comment.replies.map(reply => (
                  <CommentCard key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DiscussionCard = ({ discussion }: { discussion: Discussion }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={discussion.user.avatar} alt={discussion.user.username} />
            <AvatarFallback>{discussion.user.username.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {discussion.isPinned && <Pin className="w-4 h-4 text-blue-500" />}
              {discussion.isHot && <TrendingUp className="w-4 h-4 text-red-500" />}
              <h3 className="font-medium text-sm truncate">{discussion.title}</h3>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {discussion.content}
            </p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>by {discussion.user.username}</span>
                <span>{discussion.timestamp}</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {discussion.category}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {discussion.replies}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {discussion.likes}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CommentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Comments ({mockComments.length})</h3>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-background border border-input rounded-md px-3 py-1 text-sm"
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
      
      {/* New comment form */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea 
                placeholder={`Share your thoughts about this ${contentType}...`}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3 resize-none"
                rows={3}
              />
              <div className="flex justify-between">
                <div className="text-xs text-muted-foreground">
                  Be respectful and constructive in your comments
                </div>
                <Button size="sm" disabled={!newComment.trim()}>
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Comments list */}
      <div className="space-y-4">
        {mockComments.map(comment => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );

  const DiscussionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Discussions</h3>
        <Button size="sm">Start Discussion</Button>
      </div>
      
      <div className="space-y-3">
        {mockDiscussions.map(discussion => (
          <DiscussionCard key={discussion.id} discussion={discussion} />
        ))}
      </div>
    </div>
  );

  const ActivityTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Recent Activity</h3>
      
      <div className="space-y-4">
        {[
          {
            user: 'AnimeExpert2024',
            action: 'rated this anime',
            rating: '9/10',
            timestamp: '2 minutes ago'
          },
          {
            user: 'CasualViewer',
            action: 'added to their watchlist',
            timestamp: '15 minutes ago'
          },
          {
            user: 'MangaReader',
            action: 'marked episode 12 as watched',
            timestamp: '1 hour ago'
          },
          {
            user: 'TheoryMaster',
            action: 'started a discussion',
            title: 'Theory: What the opening sequence really means',
            timestamp: '2 hours ago'
          }
        ].map((activity, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">{activity.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action}
                    {activity.rating && (
                      <Badge variant="secondary" className="ml-2">{activity.rating}</Badge>
                    )}
                  </p>
                  {activity.title && (
                    <p className="text-xs text-muted-foreground mt-1">{activity.title}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Community
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="mt-6">
              <CommentsTab />
            </TabsContent>

            <TabsContent value="discussions" className="mt-6">
              <DiscussionsTab />
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <ActivityTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}