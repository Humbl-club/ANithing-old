import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";

interface MLEngineSelectorProps {
  mlEngine: 'database' | 'hybrid' | 'client';
  setMlEngine: (engine: 'database' | 'hybrid' | 'client') => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const MLEngineSelector = ({ 
  mlEngine, 
  setMlEngine, 
  onRefresh, 
  isLoading 
}: MLEngineSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Tabs value={mlEngine} onValueChange={(value) => setMlEngine(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="database" className="text-xs">Database ML</TabsTrigger>
          <TabsTrigger value="client" className="text-xs">Client ML</TabsTrigger>
          <TabsTrigger value="hybrid" className="text-xs">Hybrid</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};