import React, { useEffect, useState } from 'react';
import { ContentCard } from '@/components/generic/ContentCard';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import type { BaseContent } from '@/types/content';

export function TrendingContentSection() {
  const [trendingContent, setTrendingContent] = useState<BaseContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_trending_anime')
        .limit(12);
      
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
      
      setTrendingContent(items);
    } catch (error) {
      console.error('Error fetching trending content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading trending content...</div>;
  if (!trendingContent.length) return null;

  return (
    <Card variant="appleGlass" className="hover:scale-[1.005] transition-all duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <div className="p-2 bg-gradient-to-r from-pink-500/20 to-purple-600/20 rounded-xl backdrop-blur-xl border border-pink-500/30">
            <TrendingUp className="h-5 w-5 text-pink-400" />
          </div>
          <span className="text-gradient-primary">Trending Now</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trendingContent.map((item) => (
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
