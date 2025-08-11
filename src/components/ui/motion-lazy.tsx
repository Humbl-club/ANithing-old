"use client"

import * as React from "react"
import { LoadingSpinner } from "@/utils/lazyLoading"

// Lazy load framer-motion components
const LazyMotionDiv = React.lazy(() => 
  import('framer-motion').then(module => ({ default: module.motion.div }))
);

const LazyMotionSpan = React.lazy(() => 
  import('framer-motion').then(module => ({ default: module.motion.span }))
);

const LazyMotionButton = React.lazy(() => 
  import('framer-motion').then(module => ({ default: module.motion.button }))
);

const LazyAnimatePresence = React.lazy(() => 
  import('framer-motion').then(module => ({ default: module.AnimatePresence }))
);

const LazyLayoutGroup = React.lazy(() => 
  import('framer-motion').then(module => ({ default: module.LayoutGroup }))
);

// Wrapper components that handle loading states
const MotionDiv = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    layout?: boolean;
    layoutId?: string;
  }
>((props, ref) => {
  return (
    <React.Suspense fallback={<div ref={ref} {...(props as any)} />}>
      <LazyMotionDiv ref={ref} {...props} />
    </React.Suspense>
  );
});

const MotionSpan = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    layout?: boolean;
    layoutId?: string;
  }
>((props, ref) => {
  return (
    <React.Suspense fallback={<span ref={ref} {...(props as any)} />}>
      <LazyMotionSpan ref={ref} {...props} />
    </React.Suspense>
  );
});

const MotionButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    layout?: boolean;
    layoutId?: string;
  }
>((props, ref) => {
  return (
    <React.Suspense fallback={<button ref={ref} {...(props as any)} />}>
      <LazyMotionButton ref={ref} {...props} />
    </React.Suspense>
  );
});

const AnimatePresence = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => {
  return (
    <React.Suspense fallback={<>{children}</>}>
      <LazyAnimatePresence {...props}>
        {children}
      </LazyAnimatePresence>
    </React.Suspense>
  );
};

const LayoutGroup = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => {
  return (
    <React.Suspense fallback={<>{children}</>}>
      <LazyLayoutGroup {...props}>
        {children}
      </LazyLayoutGroup>
    </React.Suspense>
  );
};

// Hook for lazy loading useAnimation
const useAnimation = () => {
  const [controls, setControls] = React.useState<any>(null);
  
  React.useEffect(() => {
    import('framer-motion').then(module => {
      setControls(module.useAnimation());
    });
  }, []);
  
  return controls;
};

// Hook for lazy loading useInView
const useInView = (options?: any) => {
  const [inView, setInView] = React.useState(false);
  const [ref, setRef] = React.useState<any>(null);
  
  React.useEffect(() => {
    import('framer-motion').then(module => {
      const result = module.useInView(ref, options);
      setInView(result);
    });
  }, [ref, options]);
  
  return { ref: setRef, inView };
};

MotionDiv.displayName = "MotionDiv";
MotionSpan.displayName = "MotionSpan";
MotionButton.displayName = "MotionButton";

export {
  MotionDiv,
  MotionSpan,
  MotionButton,
  AnimatePresence,
  LayoutGroup,
  useAnimation,
  useInView
};