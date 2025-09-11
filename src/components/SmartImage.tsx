'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';
import type { SmartImageProps, LoadingState } from '@/types/loader';

/**
 * Hook for IntersectionObserver with viewport detection
 * Only shows loading states when element is actually visible
 */
function useIntersectionObserver(
  elementRef: React.RefObject<HTMLDivElement | null>,
  threshold: number = 0.1,
  rootMargin: string = '50px'
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Fallback for browsers without IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsIntersecting(true);
          setHasIntersected(true);
          // Disconnect once intersected for performance
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, threshold, rootMargin, hasIntersected]);

  return { isIntersecting: isIntersecting || hasIntersected, hasIntersected };
}

/**
 * Loading overlay component for SmartImage
 */
function LoadingOverlay({
  spinner,
  skeleton,
  className,
  isVisible
}: {
  spinner?: boolean;
  skeleton?: boolean;
  className?: string;
  isVisible: boolean;
}) {
  if (!isVisible) return null;

  if (skeleton) {
    return <Skeleton className={cn('absolute inset-0 z-10', className)} />;
  }

  if (spinner !== false) {
    return (
      <div className={cn(
        'absolute inset-0 z-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800',
        className
      )}>
        <Spinner size="md" variant="gray" />
      </div>
    );
  }

  // Even if spinner is disabled, show some loading indication
  return (
    <div className={cn(
      'absolute inset-0 z-10 bg-gray-200 dark:bg-gray-700',
      'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
      className
    )}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent image-loading" />
    </div>
  );
}

/**
 * Error fallback component
 */
function ErrorFallback({
  fallbackSrc,
  alt,
  className,
  onRetry
}: {
  fallbackSrc?: string;
  alt: string;
  className?: string;
  onRetry?: () => void;
}) {
  if (fallbackSrc) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        fill
        className={cn('object-cover', className)}
        unoptimized
      />
    );
  }

  return (
    <div className={cn(
      'absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500',
      className
    )}>
      <div className="text-center p-4">
        {/* Image icon */}
        <svg
          className="w-8 h-8 mx-auto mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        
        <p className="text-xs font-medium mb-2">Image unavailable</p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
            type="button"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Enterprise SmartImage component
 * 
 * Features:
 * - IntersectionObserver for viewport-based loading
 * - Configurable spinner/skeleton loading states
 * - Error handling with fallback images
 * - Performance optimized with minimal re-renders
 * - Full accessibility support
 * - Integrates with existing Next.js Image optimization
 */
export function SmartImage({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  spinner = true,
  skeleton = false,
  fallbackSrc,
  onLoadComplete,
  onLoadError,
  priority = false,
  ...nextImageProps
}: SmartImageProps) {
  // State management
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const maxRetries = 2;
  
  // IntersectionObserver hook
  const { isIntersecting, hasIntersected } = useIntersectionObserver(
    containerRef,
    0.1,
    priority ? '0px' : '50px'
  );

  // Handle successful image load
  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    
    setLoadingState('loaded');
    setHasError(false);
    setRetryCount(0);
    
    // Call external callback
    onLoadComplete?.();
    
    // Enhanced debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🖼️ [SmartImage] Loaded successfully`, {
        src,
        width: img.naturalWidth,
        height: img.naturalHeight,
        retryCount,
        timestamp: new Date().toISOString()
      });
    }
  }, [src, onLoadComplete]);

  // Handle image load error with retry logic
  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`❌ [SmartImage] Error loading image`, {
      src,
      attempt: retryCount + 1,
      maxRetries: maxRetries + 1,
      timestamp: new Date().toISOString()
    });
    
    if (retryCount < maxRetries) {
      // Retry with progressive delay
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setLoadingState('loading');
        setHasError(false);
      }, 1000 * (retryCount + 1));
    } else {
      setLoadingState('error');
      setHasError(true);
      
      // Call external error callback
      onLoadError?.(new Error(`Failed to load image after ${maxRetries + 1} attempts`));
    }
  }, [src, retryCount, maxRetries, onLoadError]);

  // Manual retry function
  const handleRetry = useCallback(() => {
    setLoadingState('loading');
    setHasError(false);
    setRetryCount(0);
  }, []);

  // Start loading when element becomes visible
  useEffect(() => {
    if (isIntersecting && src && loadingState === 'idle' && !hasError) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 [SmartImage] Starting to load`, {
          src,
          isIntersecting,
          loadingState,
          hasError,
          timestamp: new Date().toISOString()
        });
      }
      setLoadingState('loading');
    }
  }, [isIntersecting, src, loadingState, hasError]);

  // Reset state when src changes
  useEffect(() => {
    setLoadingState('idle');
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  // Handle case where no src is provided
  if (!src) {
    return (
      <div
        ref={containerRef}
        className={cn('relative overflow-hidden bg-gray-100 dark:bg-gray-800', containerClassName)}
        style={{ width, height }}
      >
        <ErrorFallback alt={alt} className={className} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden bg-gray-100 dark:bg-gray-800', containerClassName)}
      style={{ width, height }}
    >
      {/* Always show loading overlay initially or when loading */}
      <LoadingOverlay
        spinner={spinner}
        skeleton={skeleton}
        className={className}
        isVisible={loadingState === 'idle' || loadingState === 'loading'}
      />

      {/* Error fallback */}
      {(loadingState === 'error' || hasError) && (
        <ErrorFallback
          fallbackSrc={fallbackSrc}
          alt={alt}
          className={cn('z-20', className)}
          onRetry={handleRetry}
        />
      )}

      {/* Actual Next.js Image - only render when ready to load */}
      {isIntersecting && loadingState !== 'error' && !hasError && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            loadingState === 'loaded' ? 'opacity-100 z-30' : 'opacity-0 z-20',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          {...nextImageProps}
        />
      )}
      
      {/* Accessibility enhancement */}
      {loadingState === 'loading' && (
        <div className="sr-only" role="status" aria-live="polite">
          Loading image: {alt}
        </div>
      )}
    </div>
  );
}

/**
 * Specialized SmartImage variants for common use cases
 */

export function SmartPosterImage({
  src,
  alt,
  title,
  className,
  containerClassName,
  priority = false,
  ...props
}: Omit<SmartImageProps, 'width' | 'height'> & { title?: string }) {
  return (
    <div className={cn('aspect-[2/3]', containerClassName)}>
      <SmartImage
        src={src}
        alt={alt}
        width={500}
        height={750}
        className={cn('w-full h-full object-cover rounded-lg', className)}
        priority={priority}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        {...props}
      />
    </div>
  );
}

export function SmartBackdropImage({
  src,
  alt,
  title,
  className,
  containerClassName,
  priority = false,
  ...props
}: Omit<SmartImageProps, 'width' | 'height'> & { title?: string }) {
  return (
    <div className={cn('aspect-[16/9]', containerClassName)}>
      <SmartImage
        src={src}
        alt={alt}
        width={1280}
        height={720}
        className={cn('w-full h-full object-cover rounded-lg', className)}
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1280px"
        {...props}
      />
    </div>
  );
}

export function SmartThumbnailImage({
  src,
  alt,
  size = 'md',
  className,
  containerClassName,
  ...props
}: Omit<SmartImageProps, 'width' | 'height'> & {
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeMap = {
    sm: { width: 48, height: 48, className: 'w-12 h-12' },
    md: { width: 80, height: 80, className: 'w-20 h-20' },
    lg: { width: 120, height: 120, className: 'w-30 h-30' }
  };

  const { width, height, className: sizeClassName } = sizeMap[size];

  return (
    <div className={cn(sizeClassName, 'aspect-square', containerClassName)}>
      <SmartImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn('w-full h-full object-cover rounded', className)}
        sizes={`${width}px`}
        {...props}
      />
    </div>
  );
}

export default SmartImage;