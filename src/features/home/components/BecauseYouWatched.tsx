import React, { useEffect, useState } from 'react';
import { ContentCard } from '@/components/generic/ContentCard';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import type { BaseContent } from '@/types/content';

export function BecauseYouWatched() {
  const [recommendations, setRecommendations] = useState<BaseContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_trending_anime', { limit_param: 10 });
      
      if (error) throw error;
      
      const items: BaseContent[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        title_english: item.title_english,
        image_url: item.image_url || item.cover_image,
        cover_image: item.cover_image || item.image_url,
        score: item.score,
        status: item.status,
        content_type: 'anime' as const
      }));
      
      setRecommendations(items);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading recommendations...</div>;
  if (!recommendations.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Because You Watched
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommendations.map((item) => (
            <ContentCard 
              key={item.id}
              content={item}
              onClick={() => console.log('Navigate to', item.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
