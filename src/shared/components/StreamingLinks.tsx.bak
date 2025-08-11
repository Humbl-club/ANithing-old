import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Tv } from "lucide-react";
interface StreamingLink {
  url: string;
  site: string;
  type: string;
}
interface StreamingLinksProps {
  links?: StreamingLink[] | any;
}
const STREAMING_ICONS: Record<string, string> = {
  'Crunchyroll': '🍊',
  'Netflix': '🎬',
  'Hulu': '💚',
  'Funimation': '🎭',
  'Amazon Prime Video': '🛒',
  'Disney Plus': '🏰',
  'HIDIVE': '🌊',
  'VRV': '🎮',
  'YouTube': '📺',
  'Bilibili': '🎯',
  'AnimeLab': '🧪',
};
export const StreamingLinks = ({ links }: StreamingLinksProps) => {
  // Handle both JSONB and array formats
  const linksList = Array.isArray(links) ? links : [];
  // Filter for streaming links only
  const streamingLinks = linksList.filter(
    (link: StreamingLink) => link.type === 'STREAMING'
  );
  if (!streamingLinks || streamingLinks.length === 0) {
    return null;
  }
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tv className="w-5 h-5" />
          Watch Now
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {streamingLinks.map((link: StreamingLink, index: number) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start gap-2 hover:bg-primary/10"
              asChild
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <span className="text-lg">
                  {STREAMING_ICONS[link.site] || <Play className="w-4 h-4" />}
                </span>
                <span className="flex-1 text-left">{link.site}</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};