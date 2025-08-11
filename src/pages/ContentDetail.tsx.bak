import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContentDetail } from '@/hooks/useContentDetail';
import { BaseContent, AnimeContent, MangaContent } from '@/types/content.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Star, Heart, Plus, Share2 } from 'lucide-react';
import { AddToListButton } from '@/shared/components/AddToListButton';
import { ContentList } from '@/components/generic/ContentList';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ContentDetailProps {
  contentType: 'anime' | 'manga';
}

/**
 * Generic content detail page - replaces AnimeDetail and MangaDetail pages
 * Saves ~600 lines of duplicate code
*/
export function ContentDetail({ contentType }: ContentDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: content, loading, error } = useContentDetail(id!, contentType);

  // Fetch related content
  const { data: related } = useQuery({
    queryKey: ['related', contentType, id],
    queryFn: async () => {
      if (!content) return [];
      
      const genreIds = content.title_genres?.map((tg: any) => tg.genre_id) || [];
      if (genreIds.length === 0) return [];

      const { data } = await supabase
        .from('titles')
        .select('*')
        .eq('content_type', contentType)
        .contains('genre_ids', genreIds)
        .neq('id', id)
        .limit(8);
      
      return data || [];
    },
    enabled: !!content
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="container py-8">
        <Button onClick={() => navigate(-1)} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Content not found</p>
        </div>
      </div>
    );
  }

  const isAnime = contentType === 'anime';
  const details = isAnime 
    ? (content as AnimeContent).anime_details 
    : (content as MangaContent).manga_details;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative h-[400px] bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9)), url(${content.banner_image || content.cover_image})` 
        }}
      >
        <div className="container relative h-full flex items-end pb-8">
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost" 
            className="absolute top-4 left-4 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-6">
            <img 
              src={content.cover_image || '/placeholder.svg'} 
              alt={content.title}
              className="w-48 h-72 object-cover rounded-lg shadow-xl"
            />
            <div className="flex-1 text-white">
              <h1 className="text-4xl font-bold mb-2">{content.title}</h1>
              {content.title_english && (
                <p className="text-xl text-gray-300 mb-4">{content.title_english}</p>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                {content.score && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{content.score.toFixed(1)}</span>
                  </div>
                )}
                <Badge variant="secondary">{content.status}</Badge>
                <Badge variant="secondary">
                  {isAnime ? 'Anime' : 'Manga'}
                </Badge>
              </div>

              <div className="flex gap-2">
                <AddToListButton 
                  contentId={content.id} 
                  contentType={contentType}
                  contentTitle={content.title}
                />
                <Button variant="secondary" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="characters">Characters</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="related">Related</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-3">Synopsis</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {content.description || 'No description available.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.title_genres?.map((tg: any) => (
                      <Badge key={tg.genre_id} variant="outline">
                        {tg.genres?.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {isAnime && (content as AnimeContent).title_studios && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Studios</h3>
                    <div className="flex flex-wrap gap-2">
                      {(content as AnimeContent).title_studios?.map((ts: any) => (
                        <Badge key={ts.studio_id} variant="outline">
                          {ts.studios?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {!isAnime && (content as MangaContent).title_authors && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Authors</h3>
                    <div className="flex flex-wrap gap-2">
                      {(content as MangaContent).title_authors?.map((ta: any) => (
                        <Badge key={ta.author_id} variant="outline">
                          {ta.authors?.name} ({ta.role})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="characters">
                <p className="text-muted-foreground">Character information coming soon...</p>
              </TabsContent>

              <TabsContent value="reviews">
                <p className="text-muted-foreground">Reviews coming soon...</p>
              </TabsContent>

              <TabsContent value="related">
                {related && related.length > 0 ? (
                  <ContentList 
                    items={related}
                    columns={4}
                    onItemClick={(item) => navigate(`/${contentType}/${item.id}`)}
                  />
                ) : (
                  <p className="text-muted-foreground">No related content found.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">Information</h3>
              
              {isAnime ? (
                <>
                  {details?.episodes && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Episodes</span>
                      <span>{details.episodes}</span>
                    </div>
                  )}
                  {details?.duration && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{details.duration} min</span>
                    </div>
                  )}
                  {details?.season && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Season</span>
                      <span>{details.season} {details.season_year}</span>
                    </div>
                  )}
                  {details?.format && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format</span>
                      <span>{details.format}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {details?.chapters && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chapters</span>
                      <span>{details.chapters}</span>
                    </div>
                  )}
                  {details?.volumes && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volumes</span>
                      <span>{details.volumes}</span>
                    </div>
                  )}
                </>
              )}

              {content.popularity && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Popularity</span>
                  <span>#{content.popularity.toLocaleString()}</span>
                </div>
              )}

              {content.favorites && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Favorites</span>
                  <span>{content.favorites.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Actions</h3>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add to List
                </Button>
                <Button className="w-full" variant="outline">
                  Write Review
                </Button>
                <Button className="w-full" variant="outline">
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export convenience components
export const AnimeDetail = () => <ContentDetail contentType="anime" />;
export const MangaDetail = () => <ContentDetail contentType="manga" />;