import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMLRecommendations } from "@/hooks/useMLRecommendations";
import { toast } from "sonner";
import type { MLRecommendation } from "@/types/ml";
import { getMLTypeIcon, getMLConfidenceColor } from "@/utils/ml-icons";
import { MLRecommendationCard } from "./MLRecommendationCard";
import { MLEngineSelector } from "./MLEngineSelector";
import { MLUserAnalytics } from "./MLUserAnalytics";
import { MLEngineInfo } from "./MLEngineInfo";

export const AdvancedMLRecommendations = () => {
  const [recommendations, setRecommendations] = useState<MLRecommendation[]>([]);
  const [mlEngine, setMlEngine] = useState<'database' | 'hybrid' | 'client'>('hybrid');
  const { user } = useAuth();
  
  const {
    isLoading,
    setIsLoading,
    userAnalytics,
    processClientSideML,
    processServerSideML,
    processHybridML
  } = useMLRecommendations();

  const generateRecommendations = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      let results: MLRecommendation[] = [];

      switch (mlEngine) {
        case 'database':
          results = await processServerSideML(user.id);
          break;
        case 'client':
          results = await processClientSideML(user.id);
          break;
        case 'hybrid':
        default:
          results = await processHybridML(user.id);
      }

      setRecommendations(results);
      
      if (results.length > 0) {
        toast.success(`Generated ${results.length} ML-powered recommendations!`);
      } else {
        toast.info("Add more ratings to get better ML recommendations");
      }

    } catch (error) {
      console.error('ML recommendation error:', error);
      toast.error('Failed to generate ML recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [user, mlEngine, processServerSideML, processClientSideML, processHybridML, setIsLoading]);

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user, mlEngine, generateRecommendations]);

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Brain className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Sign in to get AI-powered recommendations!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI-Powered Recommendations
              <Badge variant="secondary" className="text-xs">
                100% FREE ML
              </Badge>
            </CardTitle>
            
            <MLEngineSelector
              mlEngine={mlEngine}
              setMlEngine={setMlEngine}
              onRefresh={generateRecommendations}
              isLoading={isLoading}
            />
          </div>
          
          {userAnalytics && <MLUserAnalytics userAnalytics={userAnalytics} />}
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <MLLoadingSkeleton />
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recommendations.map((rec, index) => (
                <MLRecommendationCard
                  key={rec.title_id}
                  recommendation={rec}
                  index={index}
                  getTypeIcon={getMLTypeIcon}
                  getConfidenceColor={getMLConfidenceColor}
                />
              ))}
            </div>
          ) : (
            <MLEmptyState />
          )}
        </CardContent>
      </Card>

      <MLEngineInfo mlEngine={mlEngine} />
    </div>
  );
};

const MLLoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
        <div className="space-y-1">
          <div className="h-4 bg-muted animate-pulse rounded" />
          <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

const MLEmptyState = () => (
  <div className="text-center py-8">
    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
    <p className="text-muted-foreground mb-4">
      No ML recommendations available yet
    </p>
    <p className="text-sm text-muted-foreground">
      Rate at least 5 titles to get accurate ML predictions
    </p>
  </div>
);