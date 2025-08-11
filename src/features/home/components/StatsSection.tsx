import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useStats } from '@/hooks/useStats';
export function StatsSection() {
  const navigate = useNavigate();
  const { stats, formatCount } = useStats();
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="container mx-auto mobile-safe-padding text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
          Join the Ultimate <span className="text-accent">Ani</span><span className="text-primary">thing</span> Community
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
          <StatCard 
            value={formatCount(stats.animeCount)} 
            label="Anime Series" 
            color="text-primary" 
          />
          <StatCard 
            value={formatCount(stats.mangaCount)} 
            label="Manga Titles" 
            color="text-accent" 
          />
          <StatCard 
            value={formatCount(stats.userCount)} 
            label="Users" 
            color="text-secondary" 
          />
          <StatCard 
            value="24/7" 
            label="Updates" 
            color="text-primary" 
          />
        </div>
        <div className="mt-8 md:mt-12">
          <Button 
            variant="hero" 
            size="lg" 
            className="px-8 md:px-12 py-4 text-base md:text-lg"
            onClick={() => navigate('/auth?tab=signup')}
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </section>
  );
}
interface StatCardProps {
  value: string;
  label: string;
  color: string;
}
function StatCard({ value, label, color }: StatCardProps) {
  return (
    <div className="space-y-2">
      <div className={`text-3xl md:text-4xl font-bold ${color}`}>
        {value}
      </div>
      <div className="text-sm md:text-base text-muted-foreground">
        {label}
      </div>
    </div>
  );
}