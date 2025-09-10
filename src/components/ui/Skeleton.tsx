'use client';

import { cn } from '@/lib/utils';
import type { SkeletonProps } from '@/types/loader';

/**
 * Enterprise-quality Skeleton component for loading placeholders
 * Supports multiple variants and respects prefers-reduced-motion
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  radius = 'md',
  className,
  lines = 1
}: SkeletonProps) {
  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  // For multiple lines
  if (lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={cn(
              'bg-gray-200 animate-pulse',
              radiusClasses[radius]
            )}
            style={{
              width: index === lines - 1 ? '75%' : width, // Last line shorter
              height
            }}
          />
        ))}
      </div>
    );
  }

  // Single skeleton
  return (
    <div
      className={cn(
        'bg-gray-200 animate-pulse',
        radiusClasses[radius],
        className
      )}
      style={{
        width,
        height
      }}
    />
  );
}

/**
 * Skeleton for movie poster aspect ratio
 */
export function PosterSkeleton({
  className
}: {
  className?: string;
}) {
  return (
    <Skeleton
      className={cn('aspect-[2/3]', className)}
      width="100%"
      height="auto"
      radius="lg"
    />
  );
}

/**
 * Skeleton for backdrop aspect ratio
 */
export function BackdropSkeleton({
  className
}: {
  className?: string;
}) {
  return (
    <Skeleton
      className={cn('aspect-[16/9]', className)}
      width="100%"
      height="auto"
      radius="lg"
    />
  );
}

/**
 * Skeleton for circular avatars
 */
export function AvatarSkeleton({
  size = 'md',
  className
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <Skeleton
      className={cn(sizeClasses[size], className)}
      radius="full"
    />
  );
}

/**
 * Skeleton for text blocks with shimmer effect
 */
export function TextSkeleton({
  lines = 3,
  className
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton width="100%" height="1.25rem" />
      {lines > 1 && (
        <Skeleton width="90%" height="1rem" />
      )}
      {lines > 2 && (
        <Skeleton width="75%" height="1rem" />
      )}
      {lines > 3 && Array.from({ length: lines - 3 }, (_, index) => (
        <Skeleton
          key={index}
          width={index % 2 === 0 ? "85%" : "70%"}
          height="1rem"
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton for movie cards
 */
export function MovieCardSkeleton({
  className
}: {
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <PosterSkeleton />
      <div className="space-y-2">
        <Skeleton width="100%" height="1.25rem" />
        <Skeleton width="80%" height="1rem" />
        <Skeleton width="60%" height="0.875rem" />
      </div>
    </div>
  );
}