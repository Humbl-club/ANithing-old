import { memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/lazy-image";
import { Star, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddToListButton } from "@/shared/components/AddToListButton";

// Generic content interface that works for both anime and manga
interface BaseContent {
  id: string | number;
  title: string;
  title_english?: string;
  image_url?: string;
  cover_image?: string;
  score?: number;
  status?: string;
  content_type: 'anime' | 'manga';
  // Add other common fields
}

interface ContentCardProps<T extends BaseContent> {
  content: T;
  onClick?: () => void;
  getDisplayName?: (content: T) => string;
  // Type-specific render props for custom sections
  renderTypeSpecific?: (content: T) => React.ReactNode;
}

/**
 * Generic ContentCard that replaces AnimeCard and MangaCard
 * Saves ~200 lines by eliminating duplication
*/
export const ContentCard = memo(<T extends BaseContent>({ 
  content,
  onClick,
  getDisplayName,
  renderTypeSpecific
}: ContentCardProps<T>) => {
  const displayName = getDisplayName ? getDisplayName(content) : content.title;
  const imageUrl = content.image_url || content.cover_image;
  
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dropdown-trigger')) {
      return;
    }
    onClick?.();
  }, [onClick]);

  // Type-specific colors
  const typeColor = content.content_type === 'anime' ? 'text-purple-500' : 'text-orange-500';
  const typeBadge = content.content_type === 'anime' ? '📺' : '📚';

  return (
    <Card 
      className="content-card cursor-pointer group relative h-[400px] hover-scale"
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
      
      {/* Image */}
      <div className="relative h-full overflow-hidden">
        <LazyImage
          src={imageUrl || ''}
          alt={displayName || ''}
          className="w-full h-full"
          placeholderClassName="bg-gradient-to-br from-primary/20 to-accent/20"
        />
        
        {/* Status Badge */}
        {content.status && (
          <Badge className="absolute top-3 right-3 z-20 glass-card">
            {content.status}
          </Badge>
        )}
        
        {/* Score */}
        {content.score && (
          <div className="absolute top-3 left-3 z-20 p-2 glass-card rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-semibold">{content.score}</span>
          </div>
        )}

        {/* Actions Menu */}
        <div className="absolute top-12 right-3 z-20 dropdown-trigger">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem>Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content Info */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={typeColor}>{typeBadge}</span>
          <h3 className="font-semibold text-white truncate flex-1">
            {displayName}
          </h3>
        </div>
        
        {/* Type-specific content if provided */}
        {renderTypeSpecific && renderTypeSpecific(content)}
        
        {/* Add to List Button - Fixed prop name */}
        <AddToListButton
          item={content as any}
          type={content.content_type}
        />
      </div>
    </Card>
  );
});

ContentCard.displayName = 'ContentCard';

// Export convenience wrappers for backwards compatibility
export const AnimeCard = (props: any) => (
  <ContentCard {...props} content={{ ...props.anime, content_type: 'anime' }} />
);

export const MangaCard = (props: any) => (
  <ContentCard {...props} content={{ ...props.manga, content_type: 'manga' }} />
);