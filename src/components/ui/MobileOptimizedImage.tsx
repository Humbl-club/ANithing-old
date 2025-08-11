import React, { useState, useEffect, useRef, useCallback, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

interface MobileOptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  fallback?: string;
  quality?: 'auto' | 'low' | 'medium' | 'high';
  priority?: boolean;
  sizes?: string;
  placeholder?: 'blur' | 'empty' | React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Mobile-optimized image with WebP support, lazy loading, and adaptive quality
 * Features:
 * - Automatic WebP conversion for supported browsers
 * - Connection-aware quality adjustment
 * - Lazy loading with intersection observer
 * - Responsive sizing with srcset
 * - Optimized for 3G networks
 */
export function MobileOptimizedImage({
  src,
  alt,
  fallback = '/placeholder.svg',
  quality = 'auto',
  priority = false,
  sizes = '100vw',
  placeholder = 'blur',
  onLoad,
  onError,
  className,
  ...props
}: MobileOptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(priority ? src : fallback);
  const [isLoading, setIsLoading] = useState(!priority);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection observer for lazy loading
  useIntersectionObserver({
    target: imgRef,
    onIntersect: () => {
      if (!priority && !isVisible) {
        setIsVisible(true);
      }
    },
    threshold: 0.1,
    rootMargin: '50px',
  });

  // Detect connection speed and adjust quality
  const getOptimalQuality = (): number => {
    if (quality !== 'auto') {
      const qualityMap = { low: 30, medium: 60, high: 85 };
      return qualityMap[quality] || 75;
    }

    // Connection-aware quality adjustment
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      
      switch (effectiveType) {
        case 'slow-2g':
        case '2g': return 30;
        case '3g': return 60;
        case '4g': return 75;
        default: return 75;
      }
    }
    
    return 75; // Default quality
  };

  // Check WebP support
  const supportsWebP = (): boolean => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  };

  const generateImageUrls = useCallback((baseSrc: string): { webp?: string; original: string; srcSet: string } => {
    const optimalQuality = getOptimalQuality();
    
    // For external images, return as-is
    if (baseSrc.includes('anilist.co') || baseSrc.includes('kitsu.io') || baseSrc.includes('http')) {
      return {
        original: baseSrc,
        srcSet: baseSrc
      };
    }

    // For Supabase or other controllable sources
    const baseUrl = baseSrc.split('?')[0];
    const webpUrl = supportsWebP() ? `${baseUrl}?format=webp&quality=${optimalQuality}` : undefined;
    const originalUrl = `${baseUrl}?quality=${optimalQuality}`;
    
    // Generate responsive srcSet
    const srcSet = [
      `${baseUrl}?width=400&quality=${Math.max(optimalQuality - 10, 30)} 400w`,
      `${baseUrl}?width=800&quality=${optimalQuality} 800w`,
      `${baseUrl}?width=1200&quality=${Math.min(optimalQuality + 10, 85)} 1200w`
    ].join(', ');

    return {
      webp: webpUrl,
      original: originalUrl,
      srcSet
    };
  }, [getOptimalQuality]);

  // Load image when visible
  useEffect(() => {
    if (!isVisible || priority) return;

    const img = new Image();
    const { webp, original } = generateImageUrls(src);
    
    // Try WebP first, fallback to original
    img.src = webp || original;
    
    img.onload = () => {
      setImageSrc(img.src);
      setIsLoading(false);
      setHasError(false);
      onLoad?.();
    };

    img.onerror = () => {
      // If WebP failed, try original format
      if (webp && img.src === webp) {
        img.src = original;
        return;
      }
      
      // If all failed, use fallback
      setImageSrc(fallback);
      setIsLoading(false);
      setHasError(true);
      onError?.();
    };
  }, [isVisible, src, priority, onLoad, onError, fallback, generateImageUrls]);

  // Render placeholder
  const renderPlaceholder = () => {
    if (placeholder === 'empty') return null;
    
    if (React.isValidElement(placeholder)) {
      return placeholder;
    }
    
    if (placeholder === 'blur') {
      return (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      );
    }
    
    return null;
  };

  const { srcSet } = generateImageUrls(imageSrc);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes}
        srcSet={priority ? srcSet : undefined}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading && 'opacity-0',
          hasError && 'opacity-50'
        )}
        {...props}
      />
      
      {(isLoading || hasError) && renderPlaceholder()}
    </div>
  );
}

/**
 * Picture component with multiple formats for better browser support
 */
export function ResponsivePicture({
  src,
  alt,
  className,
  ...props
}: MobileOptimizedImageProps) {
  const [webpSupported, setWebpSupported] = useState(false);

  useEffect(() => {
    // Check WebP support
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    setWebpSupported(canvas.toDataURL('image/webp').indexOf('image/webp') === 5);
  }, []);

  if (!webpSupported) {
    return <MobileOptimizedImage src={src} alt={alt} className={className} {...props} />;
  }

  const generateSources = () => {
    if (src.includes('http')) {
      // External images - return as-is
      return [{ srcSet: src, type: 'image/jpeg' }];
    }

    const baseUrl = src.split('?')[0];
    return [
      {
        srcSet: `${baseUrl}?format=webp&width=400 400w, ${baseUrl}?format=webp&width=800 800w`,
        type: 'image/webp'
      },
      {
        srcSet: `${baseUrl}?width=400 400w, ${baseUrl}?width=800 800w`,
        type: 'image/jpeg'
      }
    ];
  };

  const sources = generateSources();

  return (
    <picture className={cn('block', className)}>
      {sources.map((source, index) => (
        <source key={index} srcSet={source.srcSet} type={source.type} />
      ))}
      <MobileOptimizedImage
        src={src}
        alt={alt}
        {...props}
      />
    </picture>
  );
}

/**
 * Avatar image with fallback to initials
 */
export function AvatarImage({
  src,
  alt,
  name,
  size = 'md',
  className,
  ...props
}: MobileOptimizedImageProps & {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg'
  };

  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (hasError && name) {
    return (
      <div className={cn(
        'rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium',
        sizeClasses[size],
        className
      )}>
        {getInitials(name)}
      </div>
    );
  }

  return (
    <MobileOptimizedImage
      src={src}
      alt={alt}
      quality="medium"
      onError={() => setHasError(true)}
      className={cn('rounded-full', sizeClasses[size], className)}
      {...props}
    />
  );
}