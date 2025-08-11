import React from 'react';
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: 'card' | 'list' | 'hero' | 'mini' | 'text' | 'avatar';
}

/**
 * Enhanced skeleton components for different use cases
 */
export function ContentCardSkeleton({ className, variant = 'card' }: SkeletonProps) {
  if (variant === 'hero') {
    return (
      <div className={cn("relative overflow-hidden rounded-lg", className)}>
        <Skeleton className="aspect-[16/9] w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-6 left-6 space-y-4">
          <Skeleton className="h-8 w-2/3 bg-white/20" />
          <Skeleton className="h-4 w-1/2 bg-white/20" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full bg-white/20" />
            <Skeleton className="h-6 w-20 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("flex gap-4 p-4", className)}>
        <Skeleton className="aspect-[3/4] w-20 h-28 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-full max-w-xs" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    );
  }

  if (variant === 'mini') {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="aspect-[3/4] w-full rounded-lg" />
        <Skeleton className="h-3 w-full" />
      </div>
    );
  }

  // Default card variant
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Navigation skeleton
 */
export function NavigationSkeleton() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex gap-6 md:gap-10">
          <Skeleton className="h-6 w-24" />
          <div className="hidden md:flex gap-6">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </nav>
  );
}

/**
 * Grid skeleton layouts
 */
export function GridSkeleton({ 
  count = 12, 
  variant = 'card',
  columns = { sm: 2, md: 3, lg: 4, xl: 5 }
}: { 
  count?: number; 
  variant?: 'card' | 'mini';
  columns?: { sm: number; md: number; lg: number; xl: number };
}) {
  const gridCols = `grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl}`;
  
  return (
    <div className={cn("grid gap-6", gridCols)}>
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}

/**
 * List skeleton for mobile
 */
export function ListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} variant="list" />
      ))}
    </div>
  );
}

/**
 * Hero section skeleton
 */
export function HeroSkeleton() {
  return (
    <div className="relative h-[600px] overflow-hidden">
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6">
        <div className="text-center space-y-6">
          <Skeleton className="h-16 w-3/4 mx-auto bg-white/20" />
          <Skeleton className="h-6 w-1/2 mx-auto bg-white/20" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-12 w-32 rounded-lg bg-white/20" />
            <Skeleton className="h-12 w-32 rounded-lg bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Profile skeleton
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      </div>
    </div>
  );
}

/**
 * Search results skeleton
 */
export function SearchSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <ContentCardSkeleton key={i} variant="list" />
        ))}
      </div>
    </div>
  );
}

/**
 * Comment skeleton
 */
export function CommentSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}