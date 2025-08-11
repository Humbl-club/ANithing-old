import {
  Users,
  Target,
  Calendar,
  TrendingUp,
  Shuffle,
  Zap,
  Brain,
  Sparkles
} from "lucide-react";

export const getMLTypeIcon = (type: string) => {
  switch (type) {
    case 'collaborative': return <Users className="w-4 h-4" />;
    case 'content': return <Target className="w-4 h-4" />;
    case 'seasonal': return <Calendar className="w-4 h-4" />;
    case 'trending': return <TrendingUp className="w-4 h-4" />;
    case 'diversity': return <Shuffle className="w-4 h-4" />;
    case 'client_ml': return <Zap className="w-4 h-4" />;
    case 'hybrid': return <Brain className="w-4 h-4" />;
    default: return <Sparkles className="w-4 h-4" />;
  }
};

export const getMLConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return "bg-green-500";
  if (confidence >= 0.6) return "bg-yellow-500"; 
  return "bg-gray-500";
};