import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
interface Character {
  role: string;
  node: {
    id: number;
    name: {
      full: string;
      native?: string;
    };
    image?: {
      large?: string;
    };
  };
  voiceActors?: Array<{
    id: number;
    name: {
      full: string;
      native?: string;
    };
    image?: {
      large?: string;
    };
  }>;
}
interface CharactersSectionProps {
  characters?: Character[] | any;
}
export const CharactersSection = ({ characters }: CharactersSectionProps) => {
  // Handle both JSONB and array formats
  const charactersList = Array.isArray(characters) ? characters : [];
  if (!charactersList || charactersList.length === 0) {
    return null;
  }
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Characters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {charactersList.map((char: Character, index: number) => (
              <div
                key={char.node?.id || index}
                className="flex-shrink-0 w-32 group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 aspect-[3/4]">
                  {char.node?.image?.large ? (
                    <img
                      src={char.node.image.large}
                      alt={char.node.name?.full}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <Badge 
                    className="absolute top-2 right-2 text-xs"
                    variant={char.role === 'MAIN' ? 'default' : 'secondary'}
                  >
                    {char.role}
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium line-clamp-2">
                    {char.node?.name?.full || 'Unknown'}
                  </p>
                  {char.voiceActors && char.voiceActors[0] && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      VA: {char.voiceActors[0].name?.full}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};