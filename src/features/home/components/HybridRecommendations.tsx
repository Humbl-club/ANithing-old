import React, { useState, useEffect } from 'react';
import { ContentCard } from '@/components/generic/ContentCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Heart, Users } from 'lucide-react';
import { useRecommendationEngine } from '@/hooks/useRecommendationEngine';
import type { BaseContent } from '@/types/content';

interface ExtendedRecommendation extends BaseContent {
  recommendationType?: string;
  confidence?: number;
}

export function HybridRecommendations() {
  const { recommendations, loading, error, refreshRecommendations } = useRecommendationEngine();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['all']);

  const extendedRecommendations: ExtendedRecommendation[] = recommendations.map(item => ({
    ...item,
    recommendationType: item.recommendationType || 'content-based',
    confidence: item.confidence || 75
  }));

  const filteredRecommendations = selectedTypes.includes('all')
    ? extendedRecommendations
    : extendedRecommendations.filter(item => 
        selectedTypes.includes(item.recommendationType || 'content-based')
      );

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'collaborative': return <Users className="h-4 w-4" />;
      case 'content-based': return <Heart className="h-4 w-4" />;
      case 'trending': return <TrendingUp className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'collaborative': return 'bg-blue-500/10 text-blue-500';
      case 'content-based': return 'bg-purple-500/10 text-purple-500';
      case 'trending': return 'bg-green-500/10 text-green-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Hybrid Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4 flex-wrap">
          {['all', 'collaborative', 'content-based', 'trending'].map(type => (
            <Badge
              key={type}
              variant={selectedTypes.includes(type) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => {
                if (type === 'all') {
                  setSelectedTypes(['all']);
                } else {
                  const newTypes = selectedTypes.includes(type)
                    ? selectedTypes.filter(t => t !== type)
                    : [...selectedTypes.filter(t => t !== 'all'), type];
                  setSelectedTypes(newTypes.length ? newTypes : ['all']);
                }
              }}
            >
              {type === 'all' ? 'All' : type.replace('-', ' ')}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRecommendations.map((item) => (
            <div key={item.id} className="relative">
              <ContentCard 
                content={item}
                onClick={() => console.log('Navigate to', item.id)}
              />
              <Badge 
                className={`absolute top-2 right-2 ${getTypeColor(item.recommendationType)}`}
              >
                {getTypeIcon(item.recommendationType)}
              </Badge>
              {item.confidence && item.confidence > 80 && (
                <Badge className="absolute top-2 left-2 bg-yellow-500/10 text-yellow-500">
                  {Math.round(item.confidence)}% match
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
