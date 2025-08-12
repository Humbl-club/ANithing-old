import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const skeletonVariants = cva(
  "rounded-md transition-all duration-300",
  {
    variants: {
      variant: {
        default: "animate-pulse bg-muted",
        shimmer: "relative bg-muted overflow-hidden before:absolute before:inset-0 before:bg-shimmer before:bg-[length:200%_100%] before:animate-shimmer",
        glass: "bg-glass/50 backdrop-blur-sm border border-glass-border animate-pulse",
        gradient: "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer",
        glow: "bg-muted animate-pulse shadow-glow-card/30",
        wave: "bg-muted relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/10 before:to-transparent before:animate-slide-in-right"
      },
      size: {
        sm: "h-4",
        default: "h-6",
        lg: "h-8",
        xl: "h-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({
  className,
  variant,
  size,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

// Skeleton presets for common use cases
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("glass-card space-y-4", className)} {...props}>
      <Skeleton variant="shimmer" className="h-48 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton variant="shimmer" className="h-6 w-3/4" />
        <Skeleton variant="shimmer" className="h-4 w-1/2" />
      </div>
      <div className="flex space-x-2">
        <Skeleton variant="shimmer" className="h-8 w-20" />
        <Skeleton variant="shimmer" className="h-8 w-16" />
      </div>
    </div>
  )
}

function SkeletonText({ 
  lines = 3, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="shimmer"
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

function SkeletonAvatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      variant="shimmer"
      className={cn("h-12 w-12 rounded-full", className)}
      {...props}
    />
  )
}

function SkeletonButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      variant="glass"
      className={cn("h-10 w-24 rounded-lg", className)}
      {...props}
    />
  )
}

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton,
  skeletonVariants
}
