import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface WebPImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  webpSrc?: string;
  alt: string;
  quality?: number;
  sizes?: string;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
}

/**
 * WebP Image Component with automatic fallback
 * Reduces image size by 30-50% with WebP format
 */
export function WebPImage({
  src,
  fallbackSrc,
  webpSrc,
  alt,
  quality = 85,
  sizes = '100vw',
  className,
  onLoadStart,
  onLoadComplete,
  ...props
}: WebPImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate WebP URL if not provided
  const getWebPUrl = (originalSrc: string) => {
    if (webpSrc) return webpSrc;
    
    // For external images that support WebP
    if (originalSrc.includes('anilist.co')) {
      return originalSrc; // AniList doesn't support WebP conversion
    }
    
    // For Supabase storage, request WebP format
    if (originalSrc.includes('supabase')) {
      const url = new URL(originalSrc);
      url.searchParams.set('format', 'webp');
      url.searchParams.set('quality', quality.toString());
      return url.toString();
    }
    
    // For local images, assume WebP version exists
    if (originalSrc.startsWith('/') && !originalSrc.includes('.webp')) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    return originalSrc;
  };

  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
    };

    if (checkWebPSupport()) {
      const webpUrl = getWebPUrl(src);
      
      // Preload WebP image
      const img = new Image();
      img.onload = () => {
        setCurrentSrc(webpUrl);
        setIsLoading(false);
        onLoadComplete?.();
      };
      img.onerror = () => {
        // Fallback to original format
        setCurrentSrc(src);
        setIsLoading(false);
        onLoadComplete?.();
      };
      
      onLoadStart?.();
      img.src = webpUrl;
    } else {
      setCurrentSrc(src);
      setIsLoading(false);
    }
  }, [src]);

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <picture>
      {/* WebP source */}
      <source
        type="image/webp"
        srcSet={getWebPUrl(src)}
        sizes={sizes}
      />
      
      {/* Original format fallback */}
      <source
        type={src.includes('.png') ? 'image/png' : 'image/jpeg'}
        srcSet={src}
        sizes={sizes}
      />
      
      {/* Actual image element */}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100',
          hasError && 'opacity-50',
          className
        )}
        {...props}
      />
    </picture>
  );
}

/**
 * Responsive WebP image with multiple sizes
 */
export function ResponsiveWebPImage({
  src,
  alt,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className,
  ...props
}: WebPImageProps) {
  const generateSrcSet = (baseSrc: string, format: 'webp' | 'original') => {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    
    return widths
      .map(width => {
        let url = baseSrc;
        
        // Add width parameter for services that support it
        if (baseSrc.includes('supabase')) {
          const urlObj = new URL(baseSrc);
          urlObj.searchParams.set('width', width.toString());
          if (format === 'webp') {
            urlObj.searchParams.set('format', 'webp');
          }
          url = urlObj.toString();
        }
        
        return `${url} ${width}w`;
      })
      .join(', ');
  };

  return (
    <picture>
      <source
        type="image/webp"
        srcSet={generateSrcSet(src, 'webp')}
        sizes={sizes}
      />
      <source
        srcSet={generateSrcSet(src, 'original')}
        sizes={sizes}
      />
      <WebPImage
        src={src}
        alt={alt}
        sizes={sizes}
        className={className}
        {...props}
      />
    </picture>
  );
}

/**
 * Avatar image with WebP optimization
 */
export function WebPAvatar({
  src,
  alt,
  size = 40,
  className
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <WebPImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
      fallbackSrc="/default-avatar.png"
    />
  );
}