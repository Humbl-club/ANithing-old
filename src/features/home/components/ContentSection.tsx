import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimeCard } from '@/shared/components/AnimeCard';
import { ChevronRight, Loader2 } from 'lucide-react';
import type { DomainTitle } from '@/repositories/contentRepository';

interface ContentSectionProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  items: DomainTitle[];
  viewAllPath: string;
  getDisplayName: (content: DomainTitle) => string;
  onItemClick: (content: DomainTitle) => void;
  className?: string;
}
export function ContentSection({
  title,
  subtitle,
  icon: Icon,
  items,
  viewAllPath,
  getDisplayName,
  onItemClick,
  className = ""
}: ContentSectionProps) {
  const navigate = useNavigate();
  return (
    <section className={`py-12 md:py-16 ${className}`}>
      <div className="container mx-auto mobile-safe-padding">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
              <p className="text-sm md:text-base text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="group"
            onClick={() => navigate(viewAllPath)}
          >
            View All
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        <Suspense fallback={<ContentSectionSkeleton />}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {items.map((item) => (
              <div key={item.id} className="group">
                <AnimeCard 
                  content={item} 
                  onClick={() => onItemClick(item)}
                  getDisplayName={getDisplayName}
                />
              </div>
            ))}
          </div>
        </Suspense>
      </div>
    </section>
  );
}
function ContentSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-[400px] bg-muted/20 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}