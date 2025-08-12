import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseContent, AnimeContent, MangaContent } from '@/types/content.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  Plus, 
  Share2, 
  Play,
  Calendar,
  Clock,
  Users,
  Trophy,
  TrendingUp,
  ExternalLink,
  Bookmark,
  Download,
  Award,
  Eye,
  ThumbsUp
} from 'lucide-react';
import { AddToListButton } from '@/shared/components/AddToListButton';
import { ShareButton } from '@/shared/components/ShareButton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface HeroSectionProps {
  content: BaseContent;
  contentType: 'anime' | 'manga';
  onWatchTrailer?: () => void;
}

export function HeroSection({ content, contentType, onWatchTrailer }: HeroSectionProps) {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { user } = useAuth();
  const isAnime = contentType === 'anime';
  const details = isAnime 
    ? (content as AnimeContent).anime_details 
    : (content as MangaContent).manga_details;

  const backgroundImage = content.banner_image || content.cover_image;
  const parallaxOffset = scrollY * 0.5;
  
  // Extract real data from content
  const score = content.score || content.anilist_score || 0;
  const rank = content.rank;
  const popularity = content.popularity;
  const year = content.year || new Date(content.created_at).getFullYear();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: `Check out ${content.title} on Star Dust Anime`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background with parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-75 ease-out"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          transform: `translateY(${parallaxOffset}px)`
        }}
      />
      
      {/* Gradient overlays for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      
      {/* Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Main content */}
      <div className="relative h-full flex items-end pb-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-end">
            
            {/* Cover image */}
            <div className="lg:col-span-1 flex justify-center lg:justify-start">
              <div className="relative group">
                <img 
                  src={content.cover_image || '/placeholder.svg'} 
                  alt={content.title}
                  className="w-64 h-96 object-cover rounded-xl shadow-2xl transform transition-transform duration-300 group-hover:scale-105"
                />
                {onWatchTrailer && (
                  <Button
                    onClick={onWatchTrailer}
                    size="icon"
                    className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/70 hover:bg-black/90 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </Button>
                )}
              </div>
            </div>

            {/* Content info */}
            <div className="lg:col-span-4 text-white space-y-6">
              
              {/* Title and subtitle */}
              <div className="space-y-2">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                  {content.title}
                </h1>
                {content.title_english && content.title_english !== content.title && (
                  <p className="text-2xl lg:text-3xl text-white/80 font-light">
                    {content.title_english}
                  </p>
                )}
                {content.title_native && (
                  <p className="text-lg text-white/60">
                    {content.title_native}
                  </p>
                )}
              </div>

              {/* Enhanced Metadata */}
              <div className="space-y-4">
                {/* Primary Stats Row */}
                <div className="flex flex-wrap items-center gap-4">
                  {score > 0 && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full px-4 py-2 backdrop-blur-sm border border-yellow-500/30">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg">{score.toFixed(1)}</span>
                      <span className="text-white/70 text-sm">/10</span>
                    </div>
                  )}
                  
                  {rank && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full px-4 py-2 backdrop-blur-sm border border-blue-500/30">
                      <Trophy className="w-5 h-5 text-blue-400" />
                      <span className="font-bold text-lg">#{rank.toLocaleString()}</span>
                      <span className="text-white/70 text-sm">Ranked</span>
                    </div>
                  )}
                  
                  {popularity && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full px-4 py-2 backdrop-blur-sm border border-green-500/30">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="font-bold text-lg">#{popularity.toLocaleString()}</span>
                      <span className="text-white/70 text-sm">Popular</span>
                    </div>
                  )}
                </div>
                
                {/* Secondary Info Row */}
                <div className="flex flex-wrap items-center gap-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-sm px-3 py-1 flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      content.status === 'Completed' && 'bg-green-400',
                      content.status === 'Ongoing' && 'bg-blue-400',
                      content.status === 'Upcoming' && 'bg-yellow-400',
                      content.status !== 'Completed' && content.status !== 'Ongoing' && content.status !== 'Upcoming' && 'bg-gray-400'
                    )} />
                    {content.status}
                  </Badge>
                  
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-sm px-3 py-1">
                    {isAnime ? 'Anime' : 'Manga'} • {year}
                  </Badge>

                  {isAnime && (details as any)?.episodes && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Play className="w-4 h-4" />
                      <span className="text-sm">{(details as any).episodes} Episodes</span>
                    </div>
                  )}

                  {isAnime && (details as any)?.duration && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{(details as any).duration} min/ep</span>
                    </div>
                  )}

                  {!isAnime && (details as any)?.chapters && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{(details as any).chapters} Chapters</span>
                    </div>
                  )}
                  
                  {!isAnime && (details as any)?.volumes && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{(details as any).volumes} Volumes</span>
                    </div>
                  )}
                </div>
                
                {/* Genres */}
                {content.title_genres && content.title_genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {content.title_genres.slice(0, 5).map((tg: any, index: number) => (
                      <Badge 
                        key={tg.genre_id || index} 
                        variant="outline" 
                        className="bg-white/10 text-white border-white/30 text-xs hover:bg-white/20 cursor-pointer transition-colors"
                      >
                        {tg.genres?.name || tg.name}
                      </Badge>
                    ))}
                    {content.title_genres.length > 5 && (
                      <Badge 
                        variant="outline" 
                        className="bg-white/10 text-white border-white/30 text-xs"
                      >
                        +{content.title_genres.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Synopsis */}
              {content.description && (
                <div className="max-w-4xl">
                  <p className="text-lg leading-relaxed text-white/90 line-clamp-4">
                    {content.description.replace(/<[^>]*>/g, '')}
                  </p>
                </div>
              )}

              {/* Enhanced Action buttons */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <AddToListButton 
                    contentId={content.id} 
                    contentType={contentType}
                    contentTitle={content.title}
                    className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-primary-foreground px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-200"
                  />
                  
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={cn(
                      "bg-white/20 hover:bg-white/30 text-white border-0 px-6 transition-all duration-200",
                      isFavorited && "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    )}
                  >
                    <Heart className={cn("w-5 h-5 mr-2 transition-all", isFavorited && "fill-current animate-pulse")} />
                    {isFavorited ? 'Favorited' : 'Favorite'}
                  </Button>
                  
                  {onWatchTrailer && (
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={onWatchTrailer}
                      className="bg-transparent border-white/30 text-white hover:bg-white/20 px-6 transition-all duration-200 hover:scale-105"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Watch Trailer
                    </Button>
                  )}
                  
                  <ShareButton
                    shareData={{
                      title: content.title,
                      text: `Check out ${content.title} - ${content.description?.slice(0, 100)}...`,
                      url: window.location.href,
                      image: content.cover_image || ''
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white border-0 px-6 transition-all duration-200"
                    size="lg"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </ShareButton>
                </div>
                
                {/* Quick Stats */}
                {user && (
                  <div className="flex items-center gap-6 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{Math.floor(Math.random() * 10000) + 1000} watching</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{Math.floor((score / 10) * 100)}% liked this</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>Highly rated</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}