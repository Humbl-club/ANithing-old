import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  target?: React.RefObject<Element>;
  onIntersect?: (entry: IntersectionObserverEntry) => void;
  onLeave?: (entry: IntersectionObserverEntry) => void;
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

/**
 * Custom hook for Intersection Observer API
 * Efficiently tracks element visibility for lazy loading and animations
 */
export function useIntersectionObserver({
  target,
  onIntersect,
  onLeave,
  threshold = 0,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
}: UseIntersectionObserverOptions = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = target?.current;
    if (!element) return;

    // Don't observe if frozen and already been visible
    if (freezeOnceVisible && hasBeenVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        const isIntersecting = entry.isIntersecting;
        
        setIsVisible(isIntersecting);
        
        if (isIntersecting) {
          setHasBeenVisible(true);
          onIntersect?.(entry);
        } else {
          onLeave?.(entry);
        }

        // Freeze observer if element is visible and freezeOnceVisible is true
        if (freezeOnceVisible && isIntersecting) {
          observer.disconnect();
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observerRef.current = observer;
    observer.observe(element);

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [target, threshold, root, rootMargin, onIntersect, onLeave, freezeOnceVisible, hasBeenVisible]);

  return {
    entry,
    isVisible,
    hasBeenVisible,
    observer: observerRef.current,
  };
}

/**
 * Hook specifically for lazy loading with preload distance
 */
export function useLazyLoading({
  target,
  onLoad,
  preloadDistance = '100px',
  once = true,
}: {
  target?: React.RefObject<Element>;
  onLoad?: () => void;
  preloadDistance?: string;
  once?: boolean;
}) {
  const [shouldLoad, setShouldLoad] = useState(false);

  const { isVisible } = useIntersectionObserver({
    target,
    threshold: 0.1,
    rootMargin: preloadDistance,
    freezeOnceVisible: once,
    onIntersect: () => {
      if (!shouldLoad) {
        setShouldLoad(true);
        onLoad?.();
      }
    },
  });

  return {
    shouldLoad: shouldLoad || isVisible,
    isVisible,
  };
}

/**
 * Hook for triggering animations when element comes into view
 */
export function useViewportAnimation({
  target,
  animationClass = 'animate-in',
  threshold = 0.3,
  once = true,
}: {
  target?: React.RefObject<HTMLElement>;
  animationClass?: string;
  threshold?: number;
  once?: boolean;
} = {}) {
  const [hasAnimated, setHasAnimated] = useState(false);

  useIntersectionObserver({
    target,
    threshold,
    freezeOnceVisible: once,
    onIntersect: () => {
      if (!hasAnimated && target?.current) {
        target.current.classList.add(animationClass);
        setHasAnimated(true);
      }
    },
  });

  return {
    hasAnimated,
  };
}

/**
 * Hook for infinite scrolling
 */
export function useInfiniteScroll({
  target,
  onLoadMore,
  threshold = 0.8,
  enabled = true,
}: {
  target?: React.RefObject<Element>;
  onLoadMore?: () => void;
  threshold?: number;
  enabled?: boolean;
}) {
  const [isTriggered, setIsTriggered] = useState(false);

  useIntersectionObserver({
    target,
    threshold,
    onIntersect: () => {
      if (enabled && !isTriggered) {
        setIsTriggered(true);
        onLoadMore?.();
        
        // Reset after a delay to allow for new items to load
        setTimeout(() => setIsTriggered(false), 1000);
      }
    },
  });

  return {
    isTriggered,
  };
}