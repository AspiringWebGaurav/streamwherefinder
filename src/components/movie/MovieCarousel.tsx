'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MovieCard, MovieCardSkeleton } from './MovieCard';
import { PopularMovie, Movie } from '@/types/tmdb';

interface MovieCarouselProps {
  title: string;
  movies: (PopularMovie | Movie)[];
  isLoading?: boolean;
  className?: string;
  cardSize?: 'sm' | 'md' | 'lg';
  showSeeMore?: boolean;
  seeMoreHref?: string;
}

export function MovieCarousel({
  title,
  movies,
  isLoading = false,
  className,
  cardSize = 'md',
  showSeeMore = false,
  seeMoreHref,
}: MovieCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [movies]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Responsive scroll amount based on viewport
    const containerWidth = container.clientWidth;
    const scrollAmount = containerWidth * 0.8; // Scroll 80% of container width

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (isLoading) {
    return (
      <section className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-4 sm:mb-6 px-4 sm:px-0">
          <div className="h-6 sm:h-7 bg-gray-300 rounded w-32 sm:w-48 animate-pulse" />
        </div>
        
        <div className="relative">
          <div className="flex gap-3 sm:gap-4 overflow-hidden px-4 sm:px-0">
            {Array.from({ length: 8 }, (_, i) => (
              <MovieCardSkeleton key={i} size={cardSize} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <section className={cn('w-full', className)}>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">{title}</h2>
        <div className="text-gray-500 text-center py-8 sm:py-12 px-4">
          No movies available
        </div>
      </section>
    );
  }

  return (
    <section className={cn('w-full overflow-hidden', className)}>
      {/* Header - Mobile First */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 px-4 sm:px-0">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">{title}</h2>
        {showSeeMore && seeMoreHref && (
          <a
            href={seeMoreHref}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base whitespace-nowrap"
          >
            See more →
          </a>
        )}
      </div>

      {/* Carousel - Touch Optimized */}
      <div className="relative group">
        {/* Desktop Navigation Arrows - Hidden on Mobile */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={cn(
            'absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden lg:flex',
            'w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg',
            'items-center justify-center transition-all duration-200',
            'opacity-0 group-hover:opacity-100',
            !canScrollLeft && 'opacity-0 cursor-not-allowed'
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden lg:flex',
            'w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg',
            'items-center justify-center transition-all duration-200',
            'opacity-0 group-hover:opacity-100',
            !canScrollRight && 'opacity-0 cursor-not-allowed'
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        {/* Movies Container - Touch Scrolling Optimized */}
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth',
            'px-4 sm:px-0 pb-2',
            // Hide scrollbar but keep functionality
            'scrollbar-hide',
            // Snap scrolling on mobile
            'snap-x snap-mandatory lg:snap-none',
            // Touch optimization
            'touch-pan-x'
          )}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              size={cardSize}
              className={cn(
                'flex-shrink-0',
                // Snap alignment for mobile
                'snap-start lg:snap-align-none'
              )}
              priority={index < 6} // Prioritize first 6 images for better mobile LCP
            />
          ))}
          
          {/* Spacer for last item on mobile */}
          <div className="w-4 flex-shrink-0 lg:hidden" aria-hidden="true" />
        </div>

        {/* Mobile Scroll Indicators - Only on Small Screens */}
        <div className="flex justify-center mt-3 sm:mt-4 gap-1 lg:hidden">
          {Array.from({ length: Math.ceil(movies.length / 4) }, (_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-300 rounded-full"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Simplified version for smaller spaces
export function CompactMovieCarousel({
  title,
  movies,
  maxItems = 5,
  className,
}: {
  title: string;
  movies: (PopularMovie | Movie)[];
  maxItems?: number;
  className?: string;
}) {
  const displayMovies = movies.slice(0, maxItems);

  return (
    <section className={cn('w-full overflow-hidden', className)}>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 px-4 sm:px-0">{title}</h3>
      
      <div className={cn(
        'flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide',
        'px-4 sm:px-0 pb-2',
        'snap-x snap-mandatory touch-pan-x'
      )}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        {displayMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            size="sm"
            className="flex-shrink-0 snap-start"
          />
        ))}
        {/* Spacer for mobile */}
        <div className="w-4 flex-shrink-0 sm:hidden" aria-hidden="true" />
      </div>
    </section>
  );
}