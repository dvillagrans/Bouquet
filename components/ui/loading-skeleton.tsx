import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Menu Card Skeleton
export const MenuCardSkeleton: React.FC = () => (
  <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
    <Skeleton className="h-48 w-full" />
    <div className="p-6 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-between items-center pt-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  </div>
);

// Category Card Skeleton
export const CategoryCardSkeleton: React.FC = () => (
  <div className="glass-card rounded-2xl p-8 animate-pulse">
    <div className="flex flex-col items-center space-y-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
);

// Cart Item Skeleton
export const CartItemSkeleton: React.FC = () => (
  <div className="glass-card rounded-xl p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

// Navigation Skeleton
export const NavigationSkeleton: React.FC = () => (
  <div className="glass sticky top-0 z-10 border-b border-glass-border">
    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  </div>
);

// Page Header Skeleton
export const PageHeaderSkeleton: React.FC = () => (
  <div className="text-center mb-12 space-y-4 animate-pulse">
    <Skeleton className="h-12 w-64 mx-auto" />
    <Skeleton className="h-4 w-96 mx-auto" />
    <Skeleton className="h-1 w-24 mx-auto" />
  </div>
);

// Grid Skeleton
export const GridSkeleton: React.FC<{ 
  items?: number; 
  columns?: '1' | '2' | '3'; 
  type?: 'menu' | 'category' 
}> = ({ 
  items = 6, 
  columns = '3',
  type = 'menu' 
}) => {
  const gridCols = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };

  const SkeletonComponent = type === 'menu' ? MenuCardSkeleton : CategoryCardSkeleton;

  return (
    <div className={cn("grid gap-8", gridCols[columns])}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <SkeletonComponent />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;

