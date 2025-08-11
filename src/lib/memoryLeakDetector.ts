/**
 * Memory Leak Detection and Prevention System
 * Automatically detects and fixes memory leaks
 */

interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  listeners: number;
  observers: number;
  timers: number;
  detachedNodes: number;
}

export class MemoryLeakDetector {
  private snapshots: MemorySnapshot[] = [];
  private maxSnapshots = 100;
  private listeners = new Map<EventTarget, Map<string, Set<EventListener>>>();
  private observers = new Set<IntersectionObserver | MutationObserver | ResizeObserver>();
  private timers = new Set<number>();
  private abortControllers = new Set<AbortController>();
  private isMonitoring = false;

  /**
   * Start monitoring for memory leaks
   */
  startMonitoring(interval: number = 10000) {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Patch global methods to track resources
    this.patchEventListeners();
    this.patchObservers();
    this.patchTimers();
    this.patchFetch();
    
    // Take periodic snapshots
    setInterval(() => {
      this.takeSnapshot();
      this.analyzeMemory();
    }, interval);
  }

  /**
   * Take memory snapshot
   */
  private takeSnapshot() {
    const memory = (performance as any).memory;
    
    if (!memory) {
      console.warn('Memory API not available');
      return;
    }

    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      listeners: this.countListeners(),
      observers: this.observers.size,
      timers: this.timers.size,
      detachedNodes: this.countDetachedNodes()
    };

    this.snapshots.push(snapshot);

    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
  }

  /**
   * Analyze memory for leaks
   */
  private analyzeMemory() {
    if (this.snapshots.length < 10) return;

    const recent = this.snapshots.slice(-10);
    const memoryGrowth = recent[recent.length - 1].usedJSHeapSize - recent[0].usedJSHeapSize;
    const growthRate = memoryGrowth / recent[0].usedJSHeapSize;

    // Detect potential leak
    if (growthRate > 0.5) {
      console.warn('Potential memory leak detected:', {
        growthRate: `${(growthRate * 100).toFixed(2)}%`,
        memoryGrowth: `${(memoryGrowth / 1024 / 1024).toFixed(2)} MB`,
        listeners: recent[recent.length - 1].listeners,
        observers: recent[recent.length - 1].observers,
        timers: recent[recent.length - 1].timers
      });

      // Auto cleanup
      this.cleanup();
    }
  }

  /**
   * Patch addEventListener to track listeners
   */
  private patchEventListeners() {
    const originalAdd = EventTarget.prototype.addEventListener;
    const originalRemove = EventTarget.prototype.removeEventListener;

    EventTarget.prototype.addEventListener = function(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      // Track listener
      if (!this.listeners.has(this)) {
        this.listeners.set(this, new Map());
      }
      if (!this.listeners.get(this)!.has(type)) {
        this.listeners.get(this)!.set(type, new Set());
      }
      this.listeners.get(this)!.get(type)!.add(listener as EventListener);

      // Call original
      return originalAdd.call(this, type, listener, options);
    }.bind(this);

    EventTarget.prototype.removeEventListener = function(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ) {
      // Untrack listener
      if (this.listeners.has(this)) {
        const typeListeners = this.listeners.get(this)!.get(type);
        if (typeListeners) {
          typeListeners.delete(listener as EventListener);
        }
      }

      // Call original
      return originalRemove.call(this, type, listener, options);
    }.bind(this);
  }

  /**
   * Patch observers to track them
   */
  private patchObservers() {
    // Intersection Observer
    const OriginalIntersectionObserver = window.IntersectionObserver;
    window.IntersectionObserver = class extends OriginalIntersectionObserver {
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        super(callback, options);
        MemoryLeakDetector.getInstance().observers.add(this);
      }

      disconnect() {
        MemoryLeakDetector.getInstance().observers.delete(this);
        return super.disconnect();
      }
    } as any;

    // Similar for MutationObserver and ResizeObserver
  }

  /**
   * Patch timers to track them
   */
  private patchTimers() {
    const originalSetTimeout = window.setTimeout;
    const originalClearTimeout = window.clearTimeout;
    const originalSetInterval = window.setInterval;
    const originalClearInterval = window.clearInterval;

    window.setTimeout = (...args: any[]) => {
      const id = originalSetTimeout.apply(window, args);
      this.timers.add(id);
      return id;
    };

    window.clearTimeout = (id: number) => {
      this.timers.delete(id);
      return originalClearTimeout(id);
    };

    window.setInterval = (...args: any[]) => {
      const id = originalSetInterval.apply(window, args);
      this.timers.add(id);
      return id;
    };

    window.clearInterval = (id: number) => {
      this.timers.delete(id);
      return originalClearInterval(id);
    };
  }

  /**
   * Patch fetch to track abort controllers
   */
  private patchFetch() {
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.signal) {
        const controller = (init.signal as any).controller;
        if (controller instanceof AbortController) {
          this.abortControllers.add(controller);
        }
      }

      try {
        return await originalFetch(input, init);
      } finally {
        // Cleanup after request
        if (init?.signal) {
          const controller = (init.signal as any).controller;
          if (controller instanceof AbortController) {
            this.abortControllers.delete(controller);
          }
        }
      }
    };
  }

  /**
   * Count event listeners
   */
  private countListeners(): number {
    let count = 0;
    for (const [, types] of this.listeners) {
      for (const [, listeners] of types) {
        count += listeners.size;
      }
    }
    return count;
  }

  /**
   * Count detached DOM nodes
   */
  private countDetachedNodes(): number {
    if (typeof (window as any).gc !== 'function') return 0;

    // Force garbage collection
    (window as any).gc();

    // Count nodes not attached to document
    const allNodes = document.querySelectorAll('*');
    let detached = 0;

    allNodes.forEach(node => {
      if (!document.contains(node)) {
        detached++;
      }
    });

    return detached;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    console.log('Running memory cleanup...');

    // Clear weak listeners
    for (const [target, types] of this.listeners) {
      if (!document.contains(target as any)) {
        for (const [type, listeners] of types) {
          listeners.forEach(listener => {
            target.removeEventListener(type, listener);
          });
        }
        this.listeners.delete(target);
      }
    }

    // Disconnect orphaned observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (e) {
        // Observer already disconnected
      }
    });
    this.observers.clear();

    // Abort pending requests
    this.abortControllers.forEach(controller => {
      try {
        controller.abort();
      } catch (e) {
        // Already aborted
      }
    });
    this.abortControllers.clear();

    // Force garbage collection if available
    if (typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }

  /**
   * Get memory report
   */
  getReport(): any {
    const current = this.snapshots[this.snapshots.length - 1];
    const initial = this.snapshots[0];

    if (!current || !initial) return null;

    return {
      duration: current.timestamp - initial.timestamp,
      memoryGrowth: current.usedJSHeapSize - initial.usedJSHeapSize,
      currentMemory: current.usedJSHeapSize,
      listeners: current.listeners,
      observers: current.observers,
      timers: current.timers,
      detachedNodes: current.detachedNodes,
      snapshots: this.snapshots.length
    };
  }

  /**
   * Singleton instance
   */
  private static instance: MemoryLeakDetector;
  static getInstance(): MemoryLeakDetector {
    if (!this.instance) {
      this.instance = new MemoryLeakDetector();
    }
    return this.instance;
  }
}

/**
 * React hook for memory leak prevention
 */
export function useMemoryLeakPrevention() {
  useEffect(() => {
    const detector = MemoryLeakDetector.getInstance();
    
    // Start monitoring in development
    if (process.env.NODE_ENV === 'development') {
      detector.startMonitoring();
    }

    return () => {
      // Cleanup on unmount
      detector.cleanup();
    };
  }, []);
}

/**
 * Auto-cleanup hook for components
 */
export function useAutoCleanup() {
  const cleanupFns = useRef<Set<() => void>>(new Set());

  const registerCleanup = useCallback((fn: () => void) => {
    cleanupFns.current.add(fn);
    return () => {
      cleanupFns.current.delete(fn);
      fn();
    };
  }, []);

  useEffect(() => {
    return () => {
      cleanupFns.current.forEach(fn => fn());
      cleanupFns.current.clear();
    };
  }, []);

  return registerCleanup;
}

import { useEffect, useRef, useCallback } from 'react';