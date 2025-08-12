import React, { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      variant: {
        default: "text-primary",
        glass: "text-primary drop-shadow-glow",
        gradient: "text-transparent bg-gradient-primary bg-clip-text",
        rainbow: "text-transparent bg-gradient-rainbow bg-clip-text",
        glow: "text-primary animate-pulse-glow",
        shimmer: "text-primary relative before:absolute before:inset-0 before:bg-shimmer before:bg-[length:200%_100%] before:animate-shimmer"
      },
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
        xl: "h-16 w-16"
      },
      speed: {
        slow: "animate-spin duration-2000",
        normal: "animate-spin",
        fast: "animate-spin duration-500"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      speed: "normal"
    }
  }
)

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  text?: string;
}

export const LoadingSpinner = React.memo<LoadingSpinnerProps>(({ 
  variant,
  size,
  speed,
  className,
  text
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3" data-testid="loading-spinner">
      <Loader2 
        className={cn(spinnerVariants({ variant, size, speed }), className)} 
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
});

// Enhanced loading states
export const GlassSpinner = React.memo<LoadingSpinnerProps>(({ 
  className,
  ...props 
}) => (
  <LoadingSpinner 
    variant="glass" 
    className={cn("drop-shadow-lg", className)} 
    {...props} 
  />
));

export const GradientSpinner = React.memo<LoadingSpinnerProps>(({ 
  className,
  ...props 
}) => (
  <LoadingSpinner 
    variant="gradient" 
    className={cn("drop-shadow-glow", className)} 
    {...props} 
  />
));

export const RainbowSpinner = React.memo<LoadingSpinnerProps>(({ 
  className,
  ...props 
}) => (
  <LoadingSpinner 
    variant="rainbow" 
    className={cn("drop-shadow-rainbow", className)} 
    {...props} 
  />
));

LoadingSpinner.displayName = "LoadingSpinner";
GlassSpinner.displayName = "GlassSpinner";
GradientSpinner.displayName = "GradientSpinner";
RainbowSpinner.displayName = "RainbowSpinner";
