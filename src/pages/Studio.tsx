import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/layouts/components/Navigation';
import { EmailVerificationBanner } from '@/features/user/components/EmailVerificationBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building2, 
  Film, 
  Calendar, 
  MapPin, 
  ExternalLink,
  Award,
  Star,
  Heart,
  Users,
  ArrowLeft,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock studio data
const mockStudio = {
  id: 'studio-ghibli',
  name: 'Studio Ghibli',
  nameNative: 'スタジオジブリ',
  image: '/studios/ghibli.jpg',
  description: 'Studio Ghibli, Inc. is a Japanese animation film studio headquartered in Koganei, Tokyo. It is best known for its animated feature films, and has also produced several short subjects, television commercials, and one television film.',
  founded: 'June 15, 1985',
  founder: 'Hayao Miyazaki, Isao Takahata, Toshio Suzuki',
  location: 'Koganei, Tokyo, Japan',
  website: 'https://www.ghibli.jp/',
  stats: {
    works: 23,
    averageScore: 8.7,
    followers: 890000,
    awards: 45
  }
};

const mockWorks = [
  {
    id: 1,
    title: 'Spirited Away',
    year: 2001,
    rating: 9.3,
    status: 'Completed',
    episodes: 1,
    image: '/anime/spirited-away.jpg'
  },
  {
    id: 2,
    title: 'My Neighbor Totoro',
    year: 1988,
    rating: 8.9,
    status: 'Completed',
    episodes: 1,
    image: '/anime/totoro.jpg'
  },
  {
    id: 3,
    title: 'Princess Mononoke',
    year: 1997,
    rating: 9.1,
    status: 'Completed',
    episodes: 1,
    image: '/anime/mononoke.jpg'
  },
  {
    id: 4,
    title: 'Howl\'s Moving Castle',
    year: 2004,
    rating: 8.7,
    status: 'Completed',
    episodes: 1,
    image: '/anime/howls.jpg'
  },
  {
    id: 5,
    title: 'Castle in the Sky',
    year: 1986,
    rating: 8.8,
    status: 'Completed',
    episodes: 1,
    image: '/anime/castle-sky.jpg'
  },
  {
    id: 6,
    title: 'Kiki\'s Delivery Service',
    year: 1989,
    rating: 8.5,
    status: 'Completed',
    episodes: 1,
    image: '/anime/kikis.jpg'
  }
];

const Studio = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [studio, setStudio] = useState(mockStudio);
  const [works, setWorks] = useState(mockWorks);
  const [loading, setLoading] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [sortBy, setSortBy] = useState<'year' | 'rating' | 'title'>('year');

  useEffect(() => {
    // In real app, fetch studio data based on slug
    if (slug) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [slug]);

  useEffect(() => {
    // Sort works based on selected criteria
    const sortedWorks = [...works].sort((a, b) => {
      switch (sortBy) {
        case 'year':
          return b.year - a.year;
        case 'rating':
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    setWorks(sortedWorks);
  }, [sortBy]);

  const toggleFollow = () => {
    setFollowed(!followed);
    // In real app, make API call to follow/unfollow
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <EmailVerificationBanner />
        <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading studio...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <EmailVerificationBanner />
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 text-pink-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Studio Header */}
          <Card className="bg-black/40 border-pink-500/20 mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-pink-400/50 rounded-2xl">
                    <AvatarImage src={studio.image} className="rounded-2xl" />
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-3xl font-bold rounded-2xl">
                      <Building2 className="h-16 w-16" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Studio Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {studio.name}
                      </h1>
                      {studio.nameNative && (
                        <p className="text-xl text-pink-300 mb-4">{studio.nameNative}</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={toggleFollow}
                        className={cn(
                          "flex items-center gap-2",
                          followed 
                            ? "bg-pink-600 hover:bg-pink-700 text-white"
                            : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                        )}
                      >
                        <Heart className={cn("h-4 w-4", followed && "fill-current")} />
                        {followed ? 'Following' : 'Follow'}
                      </Button>

                      {studio.website && (
                        <Button variant="outline" asChild>
                          <a href={studio.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-pink-500/20">
                      <div className="text-2xl font-bold text-white">{studio.stats.works}</div>
                      <div className="text-sm text-muted-foreground">Anime</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-pink-500/20">
                      <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-400">
                        <Star className="h-5 w-5" />
                        {studio.stats.averageScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Score</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-pink-500/20">
                      <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-400">
                        <Users className="h-5 w-5" />
                        {(studio.stats.followers / 1000).toFixed(0)}K
                      </div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-pink-500/20">
                      <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-400">
                        <Award className="h-5 w-5" />
                        {studio.stats.awards}
                      </div>
                      <div className="text-sm text-muted-foreground">Awards</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-pink-300">
                      <Calendar className="h-4 w-4" />
                      <span>Founded: {studio.founded}</span>
                    </div>
                    <div className="flex items-center gap-2 text-pink-300">
                      <MapPin className="h-4 w-4" />
                      <span>{studio.location}</span>
                    </div>
                    <div className="flex items-start gap-2 text-pink-300">
                      <Users className="h-4 w-4 mt-0.5" />
                      <span>Founders: {studio.founder}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {studio.description && (
            <Card className="bg-black/40 border-pink-500/20 mb-8">
              <CardHeader>
                <CardTitle className="text-white">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{studio.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Works */}
          <Card className="bg-black/40 border-pink-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Anime Productions</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="bg-black/40 border border-pink-500/20 rounded-md px-3 py-1 text-sm text-white"
                  >
                    <option value="year">Year</option>
                    <option value="rating">Rating</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {works.map((work) => (
                  <Card 
                    key={work.id}
                    className="bg-white/5 border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-pink-500/10"
                    onClick={() => navigate(`/anime/${work.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-[3/4] bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mb-3">
                        <Film className="h-8 w-8 text-pink-300" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold text-white text-sm line-clamp-2">{work.title}</h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="h-3 w-3" />
                            <span className="text-xs">{work.rating}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-xs border-green-500/30 text-green-400"
                          >
                            {work.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {work.year}
                          </div>
                          <div>
                            {work.episodes === 1 ? 'Movie' : `${work.episodes} episodes`}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {works.length === 0 && (
                <div className="text-center py-12">
                  <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Works Found</h3>
                  <p className="text-muted-foreground">
                    This studio hasn't produced any anime yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Studio;