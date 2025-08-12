import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useContentDetail } from '@/hooks/useContentDetail';
import { BaseContent, AnimeContent, MangaContent } from '@/types/content.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, Wifi, WifiOff, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  HeroSection,
  InfoTabs,
  RelatedContent,
  StreamingProviders,
  SocialSection
} from '@/features/details/components';

interface ContentDetailProps {
  contentType: 'anime' | 'manga';
}

/**
 * Comprehensive content detail page with modern UI and enhanced features
 * Features: Hero section with parallax, detailed tabs, streaming info, social features
*/
export function ContentDetail({ contentType }: ContentDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: content, loading, error } = useContentDetail(id!, contentType);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('info');

  // Mock trailer URL - replace with real data from AniList API
  const trailerUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

  // Enhanced loading state with better animation and structure
  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading... | Star Dust Anime</title>
          <meta name="description" content="Loading content details..." />
        </Helmet>
        <div className="min-h-screen bg-background">
          {/* Hero skeleton with animated gradients */}
          <div className="relative h-screen min-h-[600px] overflow-hidden">
            <Skeleton className="w-full h-full animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
            <div className="absolute bottom-16 left-0 right-0">
              <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-end">
                  <div className="lg:col-span-1 flex justify-center lg:justify-start">
                    <div className="relative">
                      <Skeleton className="w-64 h-96 rounded-xl" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer rounded-xl" />
                    </div>
                  </div>
                  <div className="lg:col-span-4 space-y-6">
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-4/5 rounded-lg" />
                      <Skeleton className="h-8 w-3/5 rounded-lg" />
                      <Skeleton className="h-6 w-2/5 rounded-lg" />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Skeleton className="h-8 w-24 rounded-full" />
                      <Skeleton className="h-8 w-20 rounded-full" />
                      <Skeleton className="h-8 w-28 rounded-full" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full rounded" />
                      <Skeleton className="h-4 w-4/5 rounded" />
                      <Skeleton className="h-4 w-3/5 rounded" />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="h-12 w-40 rounded-lg" />
                      <Skeleton className="h-12 w-32 rounded-lg" />
                      <Skeleton className="h-12 w-28 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content skeleton with staggered animation */}
          <div className="container py-16">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
              <div className="xl:col-span-3 space-y-16">
                {/* Tabs skeleton */}
                <div className="space-y-6">
                  <div className="flex gap-2">
                    {Array.from({ length: 6 }, (_, i) => (
                      <Skeleton 
                        key={i} 
                        className="h-10 w-20 rounded-lg" 
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                  <div className="space-y-4">
                    {Array.from({ length: 4 }, (_, i) => (
                      <Skeleton 
                        key={i} 
                        className={`h-${16 + (i % 3) * 8} w-full rounded-lg`}
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Related content skeleton */}
                <div className="space-y-6">
                  <Skeleton className="h-8 w-48 rounded-lg" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton 
                          className="aspect-[3/4] w-full rounded-lg" 
                          style={{ animationDelay: `${i * 100}ms` }}
                        />
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-3 w-3/4 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Sidebar skeleton */}
              <div className="xl:col-span-1 space-y-8">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-6 w-32 rounded" />
                    <Skeleton 
                      className="h-64 w-full rounded-lg" 
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Loading indicator */}
          <div className="fixed bottom-8 right-8">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Enhanced error state with better UX and retry functionality
  if (error || !content) {
    const isNetworkError = error?.includes('fetch') || error?.includes('network');
    const isNotFound = error?.includes('not found') || !content;
    
    return (
      <>
        <Helmet>
          <title>{isNotFound ? 'Content Not Found' : 'Error Loading Content'} | Star Dust Anime</title>
          <meta name="description" content={`Error loading ${contentType} details`} />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="container max-w-2xl px-4">
            {/* Error Alert */}
            <Alert className={`mb-8 border-2 ${
              isNetworkError ? 'border-orange-200 bg-orange-50' :
              isNotFound ? 'border-red-200 bg-red-50' :
              'border-yellow-200 bg-yellow-50'
            }`}>
              <div className="flex items-center gap-3">
                {isNetworkError ? (
                  <WifiOff className="h-5 w-5 text-orange-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <h4 className="font-medium mb-1">
                    {isNetworkError ? 'Connection Problem' :
                     isNotFound ? 'Content Not Found' :
                     'Loading Error'}
                  </h4>
                  <AlertDescription className="text-sm">
                    {isNetworkError ? 'Check your internet connection and try again.' :
                     isNotFound ? `This ${contentType} might have been removed or the link is broken.` :
                     error || 'An unexpected error occurred while loading the content.'}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
            
            {/* Error Content */}
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {isNetworkError ? 'Connection Issue' :
                   isNotFound ? 'Content Not Found' :
                   'Something Went Wrong'}
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  {isNetworkError ? 
                    'Unable to connect to our servers. Please check your internet connection.' :
                   isNotFound ?
                    `We couldn't find the ${contentType} you're looking for. It may have been removed or moved.` :
                    'An error occurred while loading the page. This might be temporary.'}
                </p>
              </div>
              
              {/* Suggestions based on error type */}
              {isNotFound && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Suggestions:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
                    <li>• Check if the URL is spelled correctly</li>
                    <li>• Browse our {contentType} collection instead</li>
                    <li>• Search for similar content</li>
                    <li>• Report this if you believe it's an error</li>
                  </ul>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isNetworkError && (
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="flex items-center gap-2"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                )}
                
                <Button 
                  onClick={() => navigate(-1)} 
                  variant={isNetworkError ? "outline" : "default"}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
                
                <Button 
                  onClick={() => navigate(`/${contentType}`)} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Browse {contentType === 'anime' ? 'Anime' : 'Manga'}
                </Button>
              </div>
              
              {/* Additional Help */}
              <div className="pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Still having trouble?{' '}
                  <Button variant="link" className="p-0 h-auto text-sm">
                    Contact Support
                  </Button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleEpisodeClick = (episode: number) => {
    // Handle episode selection
    // Add logic to navigate to episode or handle episode selection
  };

  return (
    <>
      {/* SEO Optimization */}
      <Helmet>
        <title>{content.title} | Star Dust Anime</title>
        <meta name="description" content={
          content.description 
            ? content.description.replace(/<[^>]*>/g, '').slice(0, 160)
            : `Watch ${content.title} and discover more ${contentType} on Star Dust Anime`
        } />
        <meta property="og:title" content={content.title} />
        <meta property="og:description" content={
          content.description 
            ? content.description.replace(/<[^>]*>/g, '').slice(0, 300)
            : `${content.title} - ${contentType} details`
        } />
        <meta property="og:image" content={content.cover_image || content.banner_image} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="video.movie" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={content.title} />
        <meta name="twitter:description" content={
          content.description 
            ? content.description.replace(/<[^>]*>/g, '').slice(0, 200)
            : `${content.title} on Star Dust Anime`
        } />
        <meta name="twitter:image" content={content.cover_image || content.banner_image} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': contentType === 'anime' ? 'TVSeries' : 'Book',
            'name': content.title,
            'description': content.description?.replace(/<[^>]*>/g, ''),
            'image': content.cover_image,
            'aggregateRating': content.score ? {
              '@type': 'AggregateRating',
              'ratingValue': content.score,
              'ratingCount': Math.floor((content.popularity || 1000) / 10),
              'bestRating': 10,
              'worstRating': 1
            } : undefined,
            'genre': content.title_genres?.map((tg: any) => tg.genres?.name || tg.name).join(', '),
            'datePublished': content.year?.toString(),
            ...(contentType === 'anime' && {
              'numberOfEpisodes': (content as AnimeContent).anime_details?.[0]?.episodes
            })
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Hero Section with Parallax */}
        <HeroSection 
          content={content} 
          contentType={contentType} 
          onWatchTrailer={() => setTrailerOpen(true)}
        />

      {/* Main Content */}
      <div className="container py-16">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
          
          {/* Primary Content Area */}
          <div className="xl:col-span-3 space-y-16">
            
            {/* Info Tabs */}
            <section>
              <InfoTabs 
                content={content} 
                contentType={contentType}
                onEpisodeClick={handleEpisodeClick}
              />
            </section>

            {/* Related Content */}
            <section>
              <RelatedContent 
                content={content} 
                contentType={contentType}
              />
            </section>

            {/* Social Section */}
            <section>
              <SocialSection 
                content={content} 
                contentType={contentType}
              />
            </section>
            
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-8">
            
            {/* Streaming Providers */}
            <section className="sticky top-8">
              <StreamingProviders 
                content={content} 
                contentType={contentType}
              />
            </section>
            
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Trailer - {content.title}
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black">
            <iframe 
              src={trailerUrl}
              className="w-full h-full"
              allowFullScreen
              title={`${content.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          <div className="p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Official trailer for {content.title}. Enjoy the preview!
            </p>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}

// Export convenience components
export const AnimeDetail = () => <ContentDetail contentType="anime" />;
export const MangaDetail = () => <ContentDetail contentType="manga" />;