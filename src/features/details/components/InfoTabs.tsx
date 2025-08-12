import React, { useState } from 'react';
import { BaseContent, AnimeContent, MangaContent } from '@/types/content.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoTabsProps {
  content: BaseContent;
  contentType: 'anime' | 'manga';
  onEpisodeClick?: (episode: number) => void;
}

// Mock data for demonstration - replace with real API calls
const mockEpisodes = Array.from({ length: 24 }, (_, i) => ({
  number: i + 1,
  title: `Episode ${i + 1}`,
  description: `Description for episode ${i + 1}`,
  duration: 24,
  airDate: '2024-01-15',
  thumbnail: '/placeholder.svg',
  watched: i < 12
}));

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

  const EpisodesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {isAnime ? 'Episodes' : 'Chapters'} 
          {isAnime && (details as any)?.episodes && ` (${(details as any).episodes})`}
        </h3>
        <Button variant="outline" size="sm">
          Mark All Watched
        </Button>
      </div>
      
      <div className="grid gap-3">
        {mockEpisodes.slice(0, 12).map((episode) => (
          <Card 
            key={episode.number} 
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              episode.watched && "bg-muted/50"
            )}
            onClick={() => onEpisodeClick?.(episode.number)}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-shrink-0">
                  <img 
                    src={episode.thumbnail} 
                    alt={episode.title}
                    className="w-20 h-12 object-cover rounded"
                  />
                  {!episode.watched && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {episode.watched && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Play className="w-3 h-3 text-white fill-current" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium truncate">{episode.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {episode.duration}m
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {episode.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {episode.airDate}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

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

  const StatsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((score) => (
              <div key={score} className="flex items-center gap-3">
                <span className="w-4 text-sm">{score}</span>
                <div className="flex-1">
                  <Progress 
                    value={Math.random() * 100} 
                    className="h-2" 
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {Math.floor(Math.random() * 1000)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { status: 'Completed', count: 15420, color: 'bg-green-500' },
              { status: 'Watching', count: 8932, color: 'bg-blue-500' },
              { status: 'Plan to Watch', count: 12754, color: 'bg-yellow-500' },
              { status: 'Dropped', count: 2341, color: 'bg-red-500' },
              { status: 'Paused', count: 1567, color: 'bg-gray-500' }
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded", item.color)} />
                  <span className="text-sm">{item.status}</span>
                </div>
                <span className="text-sm font-medium">
                  {item.count.toLocaleString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">
              {content.popularity?.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Popularity Rank</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">
              {content.favorites?.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Favorites</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">
              {Math.floor(Math.random() * 100) + 1}
            </div>
            <div className="text-xs text-muted-foreground">Trending Rank</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">
              {content.score?.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Average Score</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

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

  return (
    <div className="w-full">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="episodes">{isAnime ? 'Episodes' : 'Chapters'}</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
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
      </Tabs>
    </div>
  );
}