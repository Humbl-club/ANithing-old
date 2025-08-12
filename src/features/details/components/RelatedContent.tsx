import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BaseContent } from '@/types/content.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ArrowRight, Shuffle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface RelatedContentProps {
  content: BaseContent;
  contentType: 'anime' | 'manga';
}

interface RelatedItem extends BaseContent {
  relation_type?: 'sequel' | 'prequel' | 'spin_off' | 'adaptation' | 'similar';
  similarity_score?: number;
}

export function RelatedContent({ content, contentType }: RelatedContentProps) {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('similar');

  // Fetch similar content based on genres
  const { data: similarContent } = useQuery({
    queryKey: ['similar', contentType, content.id],
    queryFn: async () => {
      const genreIds = content.title_genres?.map((tg: any) => tg.genre_id) || [];
      if (genreIds.length === 0) return [];

      const { data } = await supabase
        .from('titles')
        .select('*')
        .eq('content_type', contentType)
        .neq('id', content.id)
        .limit(12);
      
      // Mock similarity scoring based on genre overlap
      return (data || []).map(item => ({
        ...item,
        relation_type: 'similar' as const,
        similarity_score: Math.floor(Math.random() * 30) + 70
      })).sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0));
    },
    enabled: !!content.id
  });

  // Fetch trending content in the same category
  const { data: trendingContent } = useQuery({
    queryKey: ['trending', contentType],
    queryFn: async () => {
      const { data } = await supabase
        .from('titles')
        .select('*')
        .eq('content_type', contentType)
        .neq('id', content.id)
        .order('popularity', { ascending: true })
        .limit(8);
      
      return data || [];
    },
    enabled: !!content.id
  });

  // Mock related content (sequels, prequels, etc.)
  const mockRelatedContent: RelatedItem[] = [
    {
      ...content,
      id: 'mock-1',
      title: `${content.title}: Season 2`,
      relation_type: 'sequel',
      score: 8.7,
      status: 'Completed'
    },
    {
      ...content,
      id: 'mock-2',
      title: `${content.title}: Origins`,
      relation_type: 'prequel',
      score: 8.2,
      status: 'Completed'
    }
  ];

  const ContentCard = ({ item, showRelationType = false }: { 
    item: RelatedItem; 
    showRelationType?: boolean;
  }) => (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={() => navigate(`/${contentType}/${item.id}`)}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
          <img 
            src={item.cover_image || '/placeholder.svg'} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {showRelationType && item.relation_type && (
            <div className="absolute top-2 left-2">
              <Badge 
                variant="secondary" 
                className="bg-black/70 text-white border-0 text-xs capitalize"
              >
                {item.relation_type.replace('_', ' ')}
              </Badge>
            </div>
          )}
          {item.similarity_score && (
            <div className="absolute top-2 right-2">
              <Badge 
                variant="secondary" 
                className="bg-green-600/80 text-white border-0 text-xs"
              >
                {item.similarity_score}% match
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2">
            {item.title}
          </h3>
          
          <div className="flex items-center gap-2 mb-2">
            {item.score && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{item.score.toFixed(1)}</span>
              </div>
            )}
            <Badge variant="outline" className="text-xs">
              {item.status}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-3">
            {item.description?.replace(/<[^>]*>/g, '') || 'No description available.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const SimilarTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Similar {contentType === 'anime' ? 'Anime' : 'Manga'}</h3>
          <p className="text-sm text-muted-foreground">
            Based on genres, themes, and user preferences
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Shuffle className="w-4 h-4 mr-2" />
          Shuffle
        </Button>
      </div>
      
      {similarContent && similarContent.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {similarContent.slice(0, 8).map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
          
          {similarContent.length > 8 && (
            <div className="text-center">
              <Button variant="outline" className="w-full md:w-auto">
                View More Similar Content
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No similar content found.</p>
        </div>
      )}
    </div>
  );

  const RelatedTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Related Series</h3>
        <p className="text-sm text-muted-foreground">
          Sequels, prequels, and spin-offs
        </p>
      </div>
      
      {mockRelatedContent.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockRelatedContent.map((item) => (
            <ContentCard key={item.id} item={item} showRelationType />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No related series found.</p>
        </div>
      )}
    </div>
  );

  const TrendingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-500" />
        <div>
          <h3 className="text-lg font-semibold">Trending Now</h3>
          <p className="text-sm text-muted-foreground">
            Popular {contentType} right now
          </p>
        </div>
      </div>
      
      {trendingContent && trendingContent.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trendingContent.map((item, index) => (
            <div key={item.id} className="relative">
              <ContentCard item={item} />
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No trending content available.</p>
        </div>
      )}
    </div>
  );

  const RecommendedTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Recommended for You</h3>
        <p className="text-sm text-muted-foreground">
          Based on your viewing history and preferences
        </p>
      </div>
      
      {/* Mock personalized recommendations */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {similarContent?.slice(4, 12).map((item) => (
          <ContentCard key={`rec-${item.id}`} item={item} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="similar">Similar</TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="recommended">For You</TabsTrigger>
        </TabsList>

        <TabsContent value="similar">
          <SimilarTab />
        </TabsContent>

        <TabsContent value="related">
          <RelatedTab />
        </TabsContent>

        <TabsContent value="trending">
          <TrendingTab />
        </TabsContent>

        <TabsContent value="recommended">
          <RecommendedTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}