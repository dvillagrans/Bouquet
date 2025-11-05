import React, { memo, useMemo, useCallback, lazy, Suspense } from 'react';
import { GridSkeleton } from './loading-skeleton';

// Lazy loading wrapper
export const LazyWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = <GridSkeleton items={3} columns="3" /> }) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// Memoized component wrapper
export const MemoizedComponent = memo<{
  children: React.ReactNode;
  className?: string;
}>(({ children, className }) => (
  <div className={className}>
    {children}
  </div>
));

// Virtual scrolling hook for large lists
export const useVirtualScroll = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);

  const totalHeight = items.length * itemHeight;
  const offsetY = scrollTop;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
};

// Debounced search hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Image lazy loading component
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export const LazyImage: React.FC<LazyImageProps> = memo(({
  src,
  alt,
  className,
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+"
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className={className} ref={imgRef}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {!isLoaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
});

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderStart = React.useRef<number>(0);

  React.useEffect(() => {
    renderStart.current = performance.now();
  });

  React.useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
    }
  });
};

// Optimized list component
interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  className?: string;
  itemHeight?: number;
  containerHeight?: number;
  useVirtualScroll?: boolean;
}

export const OptimizedList = <T,>({
  items,
  renderItem,
  keyExtractor,
  className,
  itemHeight = 200,
  containerHeight = 600,
  useVirtualScroll = false
}: OptimizedListProps<T>) => {
  const { visibleItems, totalHeight, offsetY } = useVirtualScroll(
    items,
    itemHeight,
    containerHeight
  );

  const memoizedItems = useMemo(() => {
    return useVirtualScroll ? visibleItems : items;
  }, [useVirtualScroll, visibleItems, items]);

  if (useVirtualScroll) {
    return (
      <div className={className} style={{ height: containerHeight, overflow: 'auto' }}>
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {memoizedItems.map((item, index) => (
              <div
                key={keyExtractor(item, index)}
                style={{ height: itemHeight }}
              >
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {memoizedItems.map((item, index) => (
        <div key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

// Memoized callback hook
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

// Intersection observer hook for animations
export const useIntersectionObserver = (
  threshold = 0.1,
  rootMargin = '0px'
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isIntersecting };
};

// Preload component for critical resources
export const Preloader: React.FC<{
  resources: string[];
  onComplete?: () => void;
}> = ({ resources, onComplete }) => {
  const [loadedCount, setLoadedCount] = React.useState(0);

  React.useEffect(() => {
    const loadResource = (src: string) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => resolve(src);
        img.src = src;
      });
    };

    const loadAllResources = async () => {
      await Promise.all(resources.map(loadResource));
      setLoadedCount(resources.length);
      onComplete?.();
    };

    loadAllResources();
  }, [resources, onComplete]);

  return null;
};

