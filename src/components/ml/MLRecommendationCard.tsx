import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { MLRecommendation } from "@/types/ml";

interface MLRecommendationCardProps {
  recommendation: MLRecommendation;
  index: number;
  getTypeIcon: (type: string) => JSX.Element;
  getConfidenceColor: (confidence: number) => string;
}

export const MLRecommendationCard = ({
  recommendation: rec,
  index,
  getTypeIcon,
  getConfidenceColor
}: MLRecommendationCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all cursor-pointer">
      <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
        <OptimizedImage
          src={rec.image_url || ''}
          alt={rec.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge className={`text-xs ${getConfidenceColor(rec.confidence)} text-white`}>
            ML: {rec.ml_score.toFixed(1)}
          </Badge>
          {rec.original_score && (
            <Badge variant="secondary" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              {rec.original_score.toFixed(1)}
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="text-xs bg-black/80 text-white border-white/20">
            {getTypeIcon(rec.recommendation_type)}
            <span className="ml-1 capitalize">{rec.recommendation_type}</span>
          </Badge>
        </div>

        <div className="absolute bottom-2 right-2">
          <div 
            className={`w-3 h-3 rounded-full ${getConfidenceColor(rec.confidence)}`}
            title={`Confidence: ${(rec.confidence * 100).toFixed(0)}%`}
          />
        </div>
      </div>
      
      <CardContent className="p-3">
        <h4 className="font-medium text-sm line-clamp-2 mb-2">
          {rec.title}
        </h4>
        
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {rec.reason}
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <Badge variant="outline" className="text-xs">
            {rec.content_type}
          </Badge>
          <span className="text-muted-foreground">
            #{index + 1}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};