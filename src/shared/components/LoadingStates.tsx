import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
/**
 * Centralized loading state components
 * Provides consistent loading UI across the application
*/
// Full page loading
export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
// Section loading
export function SectionLoader({ 
  height = "h-64",
  message 
}: { 
  height?: string;
  message?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center", height)}>
      <div className="text-center space-y-2">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
// Inline loading (for buttons, etc.)
export function InlineLoader({ 
  size = "sm",
  className 
}: { 
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };
  return (
    <Loader2 className={cn("animate-spin", sizes[size], className)} />
  );
}
// Content card skeleton
export function ContentCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[300px] w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
// Content grid skeleton
export function ContentGridSkeleton({ 
  count = 12,
  columns = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
}: { 
  count?: number;
  columns?: string;
}) {
  return (
    <div className={cn("grid gap-4 md:gap-6", columns)}>
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} />
      ))}
    </div>
  );
}
// List skeleton
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
// Table skeleton
export function TableSkeleton({ 
  rows = 5, 
  columns = 4 
}: { 
  rows?: number; 
  columns?: number;
}) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8" />
          ))}
        </div>
      ))}
    </div>
  );
}
// Detail page skeleton
export function DetailPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
// Loading overlay
export function LoadingOverlay({ 
  isLoading,
  children 
}: { 
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
// Refresh indicator
export function RefreshIndicator({ 
  isRefreshing,
  onRefresh 
}: { 
  isRefreshing: boolean;
  onRefresh?: () => void;
}) {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
      {isRefreshing ? "Refreshing..." : "Refresh"}
    </button>
  );
}
// Lazy load wrapper with loading state
export function LazyLoadWrapper({ 
  children,
  fallback = <SectionLoader />
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <React.Suspense fallback={fallback}>
      {children}
    </React.Suspense>
  );
}