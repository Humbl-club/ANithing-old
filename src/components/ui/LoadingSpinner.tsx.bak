import React, { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
export const LoadingSpinner = React.memo<LoadingSpinnerProps>(({ 
  size = 'md', 
  className 
}) => {
  // Memoize size classes
  const sizeClasses = useMemo(() => ({
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }), []);
  return (
    <div className="flex items-center justify-center py-8" data-testid="loading-spinner">
      <Loader2 
        className={cn(
          'animate-spin text-primary',
          sizeClasses[size],
          className
        )} 
      />
    </div>
  );
});
