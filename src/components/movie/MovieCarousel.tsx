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

    const cardWidth = cardSize === 'sm' ? 128 : cardSize === 'md' ? 160 : 192;
    const gap = 16; // 1rem gap
    const scrollAmount = (cardWidth + gap) * 3; // Scroll 3 cards at a time

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (isLoading) {
    return (
      <section className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 bg-gray-300 rounded w-48 animate-pulse" />
        </div>
        
        <div className="relative">
          <div className="flex gap-4 overflow-hidden">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="text-gray-500 text-center py-12">
          No movies available
        </div>
      </section>
    );
  }

  return (
    <section className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {showSeeMore && seeMoreHref && (
          <a
            href={seeMoreHref}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            See more →
          </a>
        )}
      </div>

      {/* Carousel */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 z-10',
            'w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg',
            'flex items-center justify-center transition-opacity',
            'opacity-0 group-hover:opacity-100',
            !canScrollLeft && 'opacity-0 cursor-not-allowed'
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 z-10',
            'w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg',
            'flex items-center justify-center transition-opacity',
            'opacity-0 group-hover:opacity-100',
            !canScrollRight && 'opacity-0 cursor-not-allowed'
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        {/* Movies Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              size={cardSize}
              className="flex-shrink-0"
              priority={index < 4} // Prioritize first 4 images
            />
          ))}
        </div>

        {/* Scroll Indicators */}
        <div className="flex justify-center mt-4 gap-1">
          {Array.from({ length: Math.ceil(movies.length / 6) }, (_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-300 rounded-full"
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
    <section className={cn('w-full', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {displayMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            size="sm"
            className="flex-shrink-0"
          />
        ))}
      </div>
    </section>
  );
}