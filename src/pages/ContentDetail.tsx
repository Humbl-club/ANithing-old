import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useContentDetail } from '@/hooks/useContentDetail';
import { BaseContent, AnimeContent, MangaContent } from '@/types/content.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

  // Enhanced loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Hero skeleton */}
        <div className="relative h-screen min-h-[600px] overflow-hidden">
          <Skeleton className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
          <div className="absolute bottom-16 left-0 right-0">
            <div className="container">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-end">
                <div className="lg:col-span-1 flex justify-center lg:justify-start">
                  <Skeleton className="w-64 h-96 rounded-xl" />
                </div>
                <div className="lg:col-span-4 space-y-4">
                  <Skeleton className="h-16 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="container py-12">
          <div className="space-y-8">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
              <div className="space-y-4">
                {Array.from({ length: 2 }, (_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="container max-w-md">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error ? 'Failed to load content details.' : 'Content not found.'}
            </AlertDescription>
          </Alert>
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
            <p className="text-muted-foreground">
              We couldn't find the {contentType} you're looking for. It might have been removed or the link might be broken.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={() => navigate(`/${contentType}`)}>
                Browse {contentType === 'anime' ? 'Anime' : 'Manga'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleEpisodeClick = (episode: number) => {
    console.log(`Clicked episode ${episode}`);
    // Add logic to navigate to episode or handle episode selection
  };

  return (
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Trailer - {content.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            <iframe 
              src={trailerUrl}
              className="w-full h-full rounded-lg"
              allowFullScreen
              title={`${content.title} Trailer`}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export convenience components
export const AnimeDetail = () => <ContentDetail contentType="anime" />;
export const MangaDetail = () => <ContentDetail contentType="manga" />;