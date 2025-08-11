import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";

interface MLEngineInfoProps {
  mlEngine: 'database' | 'hybrid' | 'client';
}

export const MLEngineInfo = ({ mlEngine }: MLEngineInfoProps) => {
  const getEngineDescription = (engine: string) => {
    switch (engine) {
      case 'database':
        return 'Using PostgreSQL-based collaborative filtering and content analysis';
      case 'client':
        return 'Using browser-based machine learning with cosine similarity';
      case 'hybrid':
        return 'Combining database ML with client-side algorithms for best accuracy';
      default:
        return 'Unknown ML engine configuration';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">Free ML Engine Active</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {getEngineDescription(mlEngine)}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>✅ Zero API costs</span>
              <span>✅ Privacy-friendly</span>
              <span>✅ Real-time learning</span>
              <span>✅ Scales with users</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};