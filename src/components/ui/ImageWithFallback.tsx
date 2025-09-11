'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { imagePerformanceMonitor, imageWebVitalsTracker } from '@/lib/imagePerformance';

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackText?: string;
  title?: string;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: 'poster' | 'backdrop' | 'square' | number;
  shimmerClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

// Hook for intersection observer
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

    // If intersection observer is not supported, load immediately
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
          // Once intersected, we don't need to observe anymore
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, threshold, rootMargin, hasIntersected]);

  return { isIntersecting: isIntersecting || hasIntersected };
}

// Shimmer loading component
function LoadingShimmer({
  className,
  aspectRatio
}: {
  className?: string;
  aspectRatio: number;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-200',
        className
      )}
      style={{ aspectRatio }}
    >
      {/* Base shimmer background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      
      {/* Animated shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent image-loading" />
      
      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    </div>
  );
}

// Fallback display component
function FallbackDisplay({ 
  text, 
  className, 
  aspectRatio 
}: { 
  text?: string; 
  className?: string;
  aspectRatio: number;
}) {
  return (
    <div 
      className={cn(
        'flex items-center justify-center bg-gray-100 text-gray-400 border border-gray-200',
        className
      )}
      style={{ aspectRatio }}
    >
      <div className="text-center p-2">
        <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
          <svg 
            className="w-4 h-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <div className="text-xs font-medium">
          {text || 'No Image'}
        </div>
      </div>
    </div>
  );
}

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackText = 'No Image',
  title,
  priority = false,
  sizes,
  aspectRatio = 'poster',
  shimmerClassName,
  onLoad,
  onError,
}: ImageWithFallbackProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 2;
  const performanceIdRef = useRef<string | null>(null);

  // Calculate aspect ratio
  const aspectRatioValue = 
    typeof aspectRatio === 'number' ? aspectRatio :
    aspectRatio === 'poster' ? 2/3 :
    aspectRatio === 'backdrop' ? 16/9 :
    aspectRatio === 'square' ? 1 :
    width / height;

  // Use intersection observer for lazy loading
  const { isIntersecting } = useIntersectionObserver(
    containerRef,
    0.1,
    priority ? '0px' : '50px'
  );

  // Construct proxy URL for TMDB images
  const getProxyUrl = useCallback((imagePath: string | null, size: string = 'w500') => {
    if (!imagePath) return null;
    
    // Check if imagePath is already a full TMDB URL
    if (imagePath.startsWith('https://image.tmdb.org/t/p/')) {
      // Extract just the filename from the full URL
      const urlParts = imagePath.split('/');
      const filename = urlParts[urlParts.length - 1];
      const cleanPath = `/${filename}`;
      
      const params = new URLSearchParams({
        path: cleanPath,
        size: size,
      });
      
      if (title) {
        params.append('title', title);
      }
      
      return `/api/image?${params.toString()}`;
    }
    
    // Clean path - ensure it starts with /
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    const params = new URLSearchParams({
      path: cleanPath,
      size: size,
    });
    
    if (title) {
      params.append('title', title);
    }
    
    return `/api/image?${params.toString()}`;
  }, [title]);

  // Handle image load success
  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const fromCache = img.complete && img.naturalHeight !== 0;
    
    // Track performance
    if (performanceIdRef.current && src) {
      imagePerformanceMonitor.trackLoadSuccess(
        performanceIdRef.current,
        src,
        fromCache
      );
    }
    
    // Track for web vitals
    imageWebVitalsTracker.trackImageElement(img);
    
    setLoadingState('loaded');
    setHasError(false);
    retryCountRef.current = 0;
    onLoad?.();
  }, [onLoad, src]);

  // Handle image load error with retry logic
  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Image load failed for ${src}, attempt ${retryCountRef.current + 1}`);
    }
    
    // Track performance error
    if (performanceIdRef.current && src) {
      const errorType = event.currentTarget.src ? 'load_failed' : 'src_missing';
      imagePerformanceMonitor.trackLoadError(
        performanceIdRef.current,
        src,
        errorType,
        retryCountRef.current
      );
    }
    
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      // Retry after a short delay
      setTimeout(() => {
        setLoadingState('loading');
        setHasError(false);
        // Start new performance tracking for retry
        if (src) {
          performanceIdRef.current = imagePerformanceMonitor.trackLoadStart(src);
        }
      }, 1000 * retryCountRef.current); // Progressive delay
    } else {
      setLoadingState('error');
      setHasError(true);
      
      // Track fallback usage
      if (src) {
        imagePerformanceMonitor.trackFallback(src, 'max_retries_exceeded');
      }
      
      onError?.();
    }
  }, [src, onError]);

  // Start loading when component becomes visible
  useEffect(() => {
    if (isIntersecting && src && loadingState === 'idle' && !hasError) {
      setLoadingState('loading');
      // Start performance tracking
      performanceIdRef.current = imagePerformanceMonitor.trackLoadStart(src);
    }
  }, [isIntersecting, src, loadingState, hasError]);

  // Reset state when src changes
  useEffect(() => {
    setLoadingState('idle');
    setHasError(false);
    retryCountRef.current = 0;
    performanceIdRef.current = null;
  }, [src]);

  // Handle case where no src is provided
  if (!src) {
    // Track fallback usage for null src
    useEffect(() => {
      imagePerformanceMonitor.trackFallback(null, 'no_src_provided');
    }, []);
    
    return (
      <div ref={containerRef} className={cn('relative', className)}>
        <FallbackDisplay
          text={fallbackText}
          className="w-full h-full"
          aspectRatio={aspectRatioValue}
        />
      </div>
    );
  }

  const proxyUrl = getProxyUrl(src);
  
  if (!proxyUrl) {
    // Track fallback usage for invalid proxy URL
    useEffect(() => {
      imagePerformanceMonitor.trackFallback(src, 'invalid_proxy_url');
    }, [src]);
    
    return (
      <div ref={containerRef} className={cn('relative', className)}>
        <FallbackDisplay
          text={fallbackText}
          className="w-full h-full"
          aspectRatio={aspectRatioValue}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden bg-gray-100', className)}
      style={{ aspectRatio: aspectRatioValue }}
    >
      {/* Always show loading state initially or when loading */}
      {(loadingState === 'idle' || loadingState === 'loading') && (
        <LoadingShimmer
          className={cn('absolute inset-0 z-10', shimmerClassName)}
          aspectRatio={aspectRatioValue}
        />
      )}

      {/* Error fallback */}
      {(loadingState === 'error' || hasError) && (
        <FallbackDisplay
          text={fallbackText}
          className="absolute inset-0 z-20"
          aspectRatio={aspectRatioValue}
        />
      )}

      {/* Actual image - only render when ready to load */}
      {isIntersecting && loadingState !== 'error' && !hasError && (
        <Image
          src={proxyUrl}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            loadingState === 'loaded' ? 'opacity-100 z-30' : 'opacity-0 z-20'
          )}
          priority={priority}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          unoptimized={false} // Use Next.js optimization through our proxy
        />
      )}
    </div>
  );
}

// Specialized components for common use cases
export function PosterImage({ 
  src, 
  alt, 
  title, 
  className, 
  priority = false 
}: {
  src: string | null;
  alt: string;
  title?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      title={title}
      width={500}
      height={750}
      aspectRatio="poster"
      className={cn('rounded-lg', className)}
      fallbackText="No Poster"
      priority={priority}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
    />
  );
}

export function BackdropImage({ 
  src, 
  alt, 
  title, 
  className, 
  priority = false 
}: {
  src: string | null;
  alt: string;
  title?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      title={title}
      width={1280}
      height={720}
      aspectRatio="backdrop"
      className={cn('rounded-lg', className)}
      fallbackText="No Backdrop"
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1280px"
    />
  );
}