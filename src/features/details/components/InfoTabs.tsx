import React, { useState } from 'react';
import { BaseContent, AnimeContent, MangaContent } from '@/types/content.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Star, 
  Users, 
  TrendingUp, 
  Calendar,
  Clock,
  BookOpen,
  Heart,
  MessageCircle,
  ThumbsUp,
  ChevronRight,
  Download,
  ExternalLink,
  Award,
  Trophy,
  CheckCircle,
  Circle,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { AddToListButton } from '@/shared/components/AddToListButton';

interface InfoTabsProps {
  content: BaseContent;
  contentType: 'anime' | 'manga';
  onEpisodeClick?: (episode: number) => void;
}

// Generate episode/chapter data based on content info
const generateEpisodeData = (totalCount: number, contentType: 'anime' | 'manga') => {
  return Array.from({ length: Math.min(totalCount || 12, 100) }, (_, i) => ({
    number: i + 1,
    title: contentType === 'anime' ? `Episode ${i + 1}` : `Chapter ${i + 1}`,
    description: `${contentType === 'anime' ? 'Episode' : 'Chapter'} ${i + 1} description`,
    duration: contentType === 'anime' ? 24 : undefined,
    airDate: new Date(2024, 0, 15 + i * 7).toISOString().split('T')[0],
    thumbnail: '/placeholder.svg',
    watched: Math.random() > 0.7, // Random watched status
    isAvailable: true,
    quality: ['HD', '4K', 'SD'][Math.floor(Math.random() * 3)] as 'HD' | '4K' | 'SD'
  }));
};

const mockCharacters = [
  {
    id: 1,
    name: 'Tanjiro Kamado',
    role: 'Main Character',
    image: '/placeholder.svg',
    voiceActor: 'Natsuki Hanae'
  },
  {
    id: 2,
    name: 'Nezuko Kamado',
    role: 'Main Character',
    image: '/placeholder.svg',
    voiceActor: 'Satomi Sato'
  },
  {
    id: 3,
    name: 'Zenitsu Agatsuma',
    role: 'Supporting',
    image: '/placeholder.svg',
    voiceActor: 'Hiro Shimono'
  },
  {
    id: 4,
    name: 'Inosuke Hashibira',
    role: 'Supporting',
    image: '/placeholder.svg',
    voiceActor: 'Yoshitsugu Matsuoka'
  }
];

const mockReviews = [
  {
    id: 1,
    user: 'AnimeExpert123',
    avatar: '/placeholder.svg',
    rating: 9,
    date: '2024-01-15',
    helpful: 45,
    content: 'This is an absolutely amazing anime! The animation quality is top-notch and the story is captivating from start to finish.'
  },
  {
    id: 2,
    user: 'CasualViewer',
    avatar: '/placeholder.svg',
    rating: 8,
    date: '2024-01-10',
    helpful: 23,
    content: 'Really enjoyed this series. Great character development and beautiful visuals. Highly recommend!'
  }
];

export function InfoTabs({ content, contentType, onEpisodeClick }: InfoTabsProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const isAnime = contentType === 'anime';
  const details = isAnime 
    ? (content as AnimeContent).anime_details 
    : (content as MangaContent).manga_details;

  const EpisodesTab = () => {
    const episodeCount = isAnime ? (details as any)?.episodes : (details as any)?.chapters;
    const episodes = generateEpisodeData(episodeCount || 12, contentType);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {isAnime ? 'Episodes' : 'Chapters'}
              {episodeCount && ` (${episodeCount})`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isAnime ? 'Stream episodes' : 'Read chapters'} and track your progress
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Circle className="w-4 h-4 mr-2" />
              Mark All {isAnime ? 'Watched' : 'Read'}
            </Button>
            {isAnime && (
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            )}
          </div>
        </div>
        
        {/* Episode/Chapter Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {episodes.filter(e => e.watched).length}
              </div>
              <div className="text-sm text-muted-foreground">
                {isAnime ? 'Watched' : 'Read'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {episodes.length - episodes.filter(e => e.watched).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Remaining
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((episodes.filter(e => e.watched).length / episodes.length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Progress
              </div>
            </CardContent>
          </Card>
        </div>
        
        <ScrollArea className="h-96">
          <div className="grid gap-3 pr-4">
            {episodes.map((episode) => (
              <Card 
                key={episode.number} 
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
                  episode.watched ? "bg-muted/30 border-l-green-500" : "border-l-blue-500",
                  !episode.isAvailable && "opacity-50"
                )}
                onClick={() => episode.isAvailable && onEpisodeClick?.(episode.number)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={episode.thumbnail} 
                        alt={episode.title}
                        className="w-20 h-12 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      {episode.watched ? (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white fill-current" />
                        </div>
                      ) : episode.isAvailable ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {episode.quality && (
                        <div className="absolute bottom-1 left-1">
                          <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                            {episode.quality}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{episode.title}</h4>
                          {episode.watched && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              {isAnime ? 'Watched' : 'Read'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {isAnime && episode.duration && (
                            <>
                              <Clock className="w-4 h-4" />
                              <span>{episode.duration}m</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {episode.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(episode.airDate).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          {episode.isAvailable ? (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <span className="text-xs text-muted-foreground">Coming Soon</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
        {episodes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No {isAnime ? 'episodes' : 'chapters'} available yet.
            </p>
          </div>
        )}
      </div>
    );
  };

  const CharactersTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Main Characters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockCharacters.map((character) => (
          <Card key={character.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={character.image} alt={character.name} />
                  <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{character.name}</h4>
                  <p className="text-sm text-muted-foreground">{character.role}</p>
                  {character.voiceActor && (
                    <p className="text-xs text-muted-foreground mt-1">
                      VA: {character.voiceActor}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ReviewsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">User Reviews</h3>
        <Button variant="outline" size="sm">
          Write Review
        </Button>
      </div>
      
      <div className="grid gap-4">
        {mockReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={review.avatar} alt={review.user} />
                  <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{review.user}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "w-4 h-4",
                              i < review.rating 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-gray-300"
                            )} 
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">
                          {review.rating}/10
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {review.date}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed mb-3">{review.content}</p>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="h-8">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {review.helpful}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const StatsTab = () => {
    // Calculate realistic stats based on content data
    const totalUsers = content.popularity ? Math.floor(content.popularity * 10) : 50000;
    const scoreDistribution = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(score => {
      // Generate realistic distribution with higher scores being more common for good content
      const baseScore = content.score || 7;
      const distance = Math.abs(score - baseScore);
      const percentage = Math.max(5, 100 - (distance * 15) + (Math.random() * 10));
      return {
        score,
        percentage: Math.min(100, percentage),
        count: Math.floor((totalUsers * percentage) / 1000)
      };
    });
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Statistics & Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Community ratings, popularity metrics, and user engagement data
          </p>
        </div>
        
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold text-yellow-600">
                {(content.score || content.anilist_score || 0).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Average Score</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-600">
                #{content.rank?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">Overall Rank</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">
                #{content.popularity?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">Popularity Rank</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold text-red-600">
                {Math.floor((content.popularity || 1000) / 10).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Favorites</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-5 h-5" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scoreDistribution.map((item) => (
                <div key={item.score} className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="w-4 text-sm font-medium">{item.score}</span>
                  </div>
                  <div className="flex-1">
                    <Progress 
                      value={item.percentage} 
                      className="h-2" 
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-16 text-right">
                    {item.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                User Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { 
                  status: isAnime ? 'Completed' : 'Finished', 
                  count: Math.floor(totalUsers * 0.4), 
                  color: 'bg-green-500',
                  percentage: 40
                },
                { 
                  status: isAnime ? 'Watching' : 'Reading', 
                  count: Math.floor(totalUsers * 0.25), 
                  color: 'bg-blue-500',
                  percentage: 25
                },
                { 
                  status: isAnime ? 'Plan to Watch' : 'Plan to Read', 
                  count: Math.floor(totalUsers * 0.2), 
                  color: 'bg-yellow-500',
                  percentage: 20
                },
                { 
                  status: 'Dropped', 
                  count: Math.floor(totalUsers * 0.1), 
                  color: 'bg-red-500',
                  percentage: 10
                },
                { 
                  status: 'Paused', 
                  count: Math.floor(totalUsers * 0.05), 
                  color: 'bg-gray-500',
                  percentage: 5
                }
              ].map((item) => (
                <div key={item.status} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={cn("w-3 h-3 rounded", item.color)} />
                    <span className="text-sm">{item.status}</span>
                  </div>
                  <div className="flex-1">
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    {item.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Additional Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Community Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {((content.score || 7.5) * 10).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Recommendation Rate</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {Math.floor(Math.random() * 30) + 70}%
                </div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {Math.floor(Math.random() * 20) + 80}%
                </div>
                <div className="text-sm text-muted-foreground">Rewatchability</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Synopsis */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
        <p className="text-muted-foreground leading-relaxed">
          {content.description?.replace(/<[^>]*>/g, '') || 'No description available.'}
        </p>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold">Information</h4>
          <div className="space-y-2 text-sm">
            {isAnime ? (
              <>
                {(details as any)?.episodes && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Episodes</span>
                    <span>{(details as any).episodes}</span>
                  </div>
                )}
                {(details as any)?.duration && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{(details as any).duration} minutes</span>
                  </div>
                )}
                {(details as any)?.season && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Season</span>
                    <span>{(details as any).season} {(details as any).season_year}</span>
                  </div>
                )}
                {(details as any)?.format && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format</span>
                    <span>{(details as any).format}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                {(details as any)?.chapters && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chapters</span>
                    <span>{(details as any).chapters}</span>
                  </div>
                )}
                {(details as any)?.volumes && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volumes</span>
                    <span>{(details as any).volumes}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline" className="text-xs">{content.status}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Genres</h4>
          <div className="flex flex-wrap gap-2">
            {content.title_genres?.map((tg: any) => (
              <Badge key={tg.genre_id} variant="secondary" className="text-xs">
                {tg.genres?.name}
              </Badge>
            ))}
          </div>

          {isAnime && (content as AnimeContent).title_studios && (
            <>
              <h4 className="font-semibold mt-4">Studios</h4>
              <div className="flex flex-wrap gap-2">
                {(content as AnimeContent).title_studios?.map((ts: any) => (
                  <Badge key={ts.studio_id} variant="outline" className="text-xs">
                    {ts.studios?.name}
                  </Badge>
                ))}
              </div>
            </>
          )}

          {!isAnime && (content as MangaContent).title_authors && (
            <>
              <h4 className="font-semibold mt-4">Authors</h4>
              <div className="flex flex-wrap gap-2">
                {(content as MangaContent).title_authors?.map((ta: any) => (
                  <Badge key={ta.author_id} variant="outline" className="text-xs">
                    {ta.authors?.name} ({ta.role})
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const MediaTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Media Gallery</h3>
        <p className="text-sm text-muted-foreground">
          Screenshots, artwork, trailers, and promotional materials
        </p>
      </div>
      
      {/* Media Categories */}
      <Tabs defaultValue="screenshots" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
          <TabsTrigger value="artwork">Artwork</TabsTrigger>
          <TabsTrigger value="trailers">Videos</TabsTrigger>
          <TabsTrigger value="promotional">Promo</TabsTrigger>
        </TabsList>

        <TabsContent value="screenshots" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <Card key={i} className="group cursor-pointer overflow-hidden">
                <div className="aspect-video relative">
                  <img 
                    src={`/placeholder.svg`} 
                    alt={`Screenshot ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ImageIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="artwork" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Card key={i} className="group cursor-pointer overflow-hidden">
                <div className="aspect-[3/4] relative">
                  <img 
                    src={content.cover_image || `/placeholder.svg`} 
                    alt={`Artwork ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ImageIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trailers" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Official Trailer', duration: '2:30', views: '1.2M' },
              { title: 'Character PV', duration: '1:45', views: '856K' },
              { title: 'Opening Theme', duration: '1:30', views: '2.1M' },
              { title: 'Ending Theme', duration: '1:30', views: '1.8M' }
            ].map((video, i) => (
              <Card key={i} className="group cursor-pointer">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src="/placeholder.svg" 
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-1">{video.title}</h4>
                  <p className="text-sm text-muted-foreground">{video.views} views</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="promotional" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="group cursor-pointer overflow-hidden">
                <div className="aspect-[4/3] relative">
                  <img 
                    src={`/placeholder.svg`} 
                    alt={`Promotional ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ExternalLink className="w-8 h-8 text-white" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="w-full">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="episodes">{isAnime ? 'Episodes' : 'Chapters'}</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="episodes" className="mt-6">
          <EpisodesTab />
        </TabsContent>

        <TabsContent value="characters" className="mt-6">
          <CharactersTab />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <ReviewsTab />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <StatsTab />
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <MediaTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}