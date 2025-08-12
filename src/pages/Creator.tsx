import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/layouts/components/Navigation';
import { EmailVerificationBanner } from '@/features/user/components/EmailVerificationBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Film, 
  BookOpen, 
  Calendar, 
  MapPin, 
  ExternalLink,
  Award,
  Star,
  Heart,
  Users,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock creator data
const mockCreator = {
  id: 'hayao-miyazaki',
  name: 'Hayao Miyazaki',
  nameNative: '宮崎駿',
  image: '/creators/miyazaki.jpg',
  description: 'Hayao Miyazaki is a Japanese animator, director, producer, screenwriter, author, and manga artist. A co-founder of Studio Ghibli, he has attained international acclaim as a masterful storyteller and creator of Japanese animated feature films, and is widely regarded as one of the most accomplished filmmakers in the history of animation.',
  birthDate: 'January 5, 1941',
  birthPlace: 'Tokyo, Japan',
  yearsActive: '1963 – present',
  occupation: ['Director', 'Producer', 'Screenwriter', 'Animator'],
  genres: ['Fantasy', 'Adventure', 'Family', 'Drama'],
  website: 'https://www.ghibli.jp/',
  stats: {
    works: 23,
    averageScore: 8.9,
    followers: 125000
  }
};

const mockWorks = [
  {
    id: 1,
    title: 'Spirited Away',
    type: 'anime',
    year: 2001,
    role: 'Director, Writer',
    rating: 9.3,
    image: '/anime/spirited-away.jpg'
  },
  {
    id: 2,
    title: 'My Neighbor Totoro',
    type: 'anime',
    year: 1988,
    role: 'Director, Writer',
    rating: 8.9,
    image: '/anime/totoro.jpg'
  },
  {
    id: 3,
    title: 'Princess Mononoke',
    type: 'anime',
    year: 1997,
    role: 'Director, Writer',
    rating: 9.1,
    image: '/anime/mononoke.jpg'
  },
  {
    id: 4,
    title: 'Howl\'s Moving Castle',
    type: 'anime',
    year: 2004,
    role: 'Director, Writer',
    rating: 8.7,
    image: '/anime/howls.jpg'
  }
];

const Creator = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [creator, setCreator] = useState(mockCreator);
  const [works, setWorks] = useState(mockWorks);
  const [loading, setLoading] = useState(false);
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    // In real app, fetch creator data based on slug
    if (slug) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [slug]);

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
            <p className="text-muted-foreground">Loading creator...</p>
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

          {/* Creator Header */}
          <Card className="bg-black/40 border-pink-500/20 mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-pink-400/50">
                    <AvatarImage src={creator.image} />
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-3xl font-bold">
                      {creator.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Creator Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {creator.name}
                      </h1>
                      {creator.nameNative && (
                        <p className="text-xl text-pink-300 mb-4">{creator.nameNative}</p>
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

                      {creator.website && (
                        <Button variant="outline" asChild>
                          <a href={creator.website} target="_blank" rel="noopener noreferrer">
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
                      <div className="text-2xl font-bold text-white">{creator.stats.works}</div>
                      <div className="text-sm text-muted-foreground">Works</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-pink-500/20">
                      <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-400">
                        <Star className="h-5 w-5" />
                        {creator.stats.averageScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Score</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-pink-500/20">
                      <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-400">
                        <Users className="h-5 w-5" />
                        {(creator.stats.followers / 1000).toFixed(0)}K
                      </div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-pink-500/20">
                      <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-400">
                        <Award className="h-5 w-5" />
                        15
                      </div>
                      <div className="text-sm text-muted-foreground">Awards</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-pink-300">
                        <Calendar className="h-4 w-4" />
                        <span>Born: {creator.birthDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-pink-300">
                        <MapPin className="h-4 w-4" />
                        <span>{creator.birthPlace}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-pink-300">
                        <User className="h-4 w-4" />
                        <span>Active: {creator.yearsActive}</span>
                      </div>
                    </div>
                  </div>

                  {/* Occupations */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {creator.occupation.map((job) => (
                      <Badge 
                        key={job}
                        variant="secondary" 
                        className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                      >
                        {job}
                      </Badge>
                    ))}
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {creator.genres.map((genre) => (
                      <Badge 
                        key={genre}
                        variant="outline" 
                        className="border-pink-500/30 text-pink-300"
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {creator.description && (
            <Card className="bg-black/40 border-pink-500/20 mb-8">
              <CardHeader>
                <CardTitle className="text-white">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{creator.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Works */}
          <Card className="bg-black/40 border-pink-500/20">
            <CardHeader>
              <CardTitle className="text-white">Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {works.map((work) => (
                  <Card 
                    key={work.id}
                    className="bg-white/5 border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-pink-500/10"
                    onClick={() => navigate(`/${work.type}/${work.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-[3/4] bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mb-3">
                        {work.type === 'anime' ? (
                          <Film className="h-8 w-8 text-pink-300" />
                        ) : (
                          <BookOpen className="h-8 w-8 text-pink-300" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold text-white text-sm line-clamp-2">{work.title}</h3>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs capitalize",
                              work.type === 'anime' 
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-green-500/20 text-green-400 border-green-500/30"
                            )}
                          >
                            {work.type}
                          </Badge>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="h-3 w-3" />
                            <span className="text-xs">{work.rating}</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {work.year}
                          </div>
                          <div className="mt-1">{work.role}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Creator;