'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { MovieCarousel } from '@/components/movie/MovieCarousel';
import { Button } from '@/components/ui/Button';
import { SpinTonightModal } from '@/components/ui/SpinTonightModal';
import { Shuffle, TrendingUp, Star, Calendar, Award, History, User, RefreshCw, Shield } from 'lucide-react';
import { tmdbClient, PROVIDER_IDS } from '@/lib/tmdb';
import { PopularMovie } from '@/types/tmdb';
import Link from 'next/link';

// Server component to fetch data
async function getHomePageData() {
  try {
    const [trending, popular, upcoming, bestOfLastYear] = await Promise.all([
      tmdbClient.getTrendingMovies('week'),
      tmdbClient.getPopularMovies(),
      tmdbClient.getUpcomingMovies(),
      tmdbClient.getBestOfLastYear(),
    ]);

    return {
      trending: trending.results.map(movie => tmdbClient.transformPopularMovie(movie)),
      popular: popular.results.map(movie => tmdbClient.transformPopularMovie(movie)),
      upcoming: upcoming.results.map(movie => tmdbClient.transformPopularMovie(movie)),
      bestOfLastYear: bestOfLastYear.results.map(movie => tmdbClient.transformPopularMovie(movie)),
    };
  } catch (error) {
    console.error('Failed to fetch homepage data:', error);
    return {
      trending: [],
      popular: [],
      upcoming: [],
      bestOfLastYear: [],
    };
  }
}

// Loading component for carousels
function CarouselLoading({ title }: { title: string }) {
  return (
    <MovieCarousel
      title={title}
      movies={[]}
      isLoading={true}
    />
  );
}

// Hero section component
function HeroSection({ onSpinTonight, isSpinTonightLoading }: {
  onSpinTonight: () => void;
  isSpinTonightLoading: boolean;
}) {
  return (
    <section className="relative glass-cinema-primary py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading - Mobile First */}
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight" style={{ color: 'var(--cinema-white)' }}>
            Find Where to
            <span className="block mt-1 sm:mt-0 sm:inline sm:ml-2 lg:block lg:ml-0 lg:mt-2" style={{ color: 'var(--cinema-gold)' }}>Stream Movies</span>
          </h1>

          {/* Subtitle - Responsive Text */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--cinema-cream)' }}>
            Search thousands of movies and discover where to watch them legally.
            <span className="font-medium block mt-2" style={{ color: 'var(--cinema-gold)' }}>
              Works even with typos!
            </span>
          </p>

          {/* Large Search Bar - Responsive */}
          <div className="mb-6 sm:mb-8">
            <SearchBar
              size="lg"
              autoFocus={true}
              placeholder="Try searching 'Avvtarr', 'Dark Knigt', or any movie..."
              className="max-w-2xl"
            />
          </div>

          {/* Spin Tonight Button - Mobile First */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 lg:mb-12">
            <Button
              size="lg"
              className="btn-cinema-gold px-6 sm:px-8 w-full sm:w-auto min-h-[48px]"
              onClick={onSpinTonight}
              disabled={isSpinTonightLoading}
            >
              {isSpinTonightLoading ? (
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
              ) : (
                <Shuffle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              )}
              {isSpinTonightLoading ? 'Opening...' : 'Spin Tonight'}
            </Button>
            <p className="text-xs sm:text-sm text-center px-4" style={{ color: 'var(--cinema-cream)' }}>
              Can't decide? Let us pick something great for you!
            </p>
          </div>

          {/* Trust indicators - Mobile Stacked */}
          <div className="flex flex-col xs:flex-row xs:flex-wrap justify-center items-center gap-4 xs:gap-6 text-sm" style={{ color: 'var(--cinema-cream)' }}>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: 'var(--cinema-gold)' }} />
              <span className="whitespace-nowrap">Legal sources only</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: 'var(--cinema-success)' }} />
              <span className="whitespace-nowrap">Updated daily</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: 'var(--cinema-info)' }} />
              <span className="whitespace-nowrap">Trending worldwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration - Responsive */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 sm:-top-32 lg:-top-40 -right-16 sm:-right-24 lg:-right-32 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 opacity-30 sm:opacity-50" />
        <div className="absolute -bottom-20 sm:-bottom-32 lg:-bottom-40 -left-16 sm:-left-24 lg:-left-32 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 rounded-full bg-gradient-to-tr from-pink-100 to-yellow-100 opacity-30 sm:opacity-50" />
      </div>
    </section>
  );
}

// Main homepage component
export default function HomePage() {
  const [isSpinTonightOpen, setIsSpinTonightOpen] = useState(false);
  const [isSpinTonightLoading, setIsSpinTonightLoading] = useState(false);
  const [data, setData] = useState({
    trending: [] as PopularMovie[],
    popular: [] as PopularMovie[],
    upcoming: [] as PopularMovie[],
    bestOfLastYear: [] as PopularMovie[],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        const homeData = await getHomePageData();
        setData(homeData);
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSpinTonight = useCallback(() => {
    if (isSpinTonightLoading || isSpinTonightOpen) return;

    // First set loading state
    setIsSpinTonightLoading(true);

    // Open modal after a brief delay to ensure proper rendering
    setTimeout(() => {
      setIsSpinTonightOpen(true);
      setIsSpinTonightLoading(false);
    }, 150);
  }, [isSpinTonightLoading, isSpinTonightOpen]);

  const handleSpinTonightClose = useCallback(() => {
    // Immediate cleanup
    setIsSpinTonightOpen(false);
    setIsSpinTonightLoading(false);

    // Force body cleanup as fail-safe
    setTimeout(() => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }, 100);
  }, []);

  // Emergency cleanup effect
  useEffect(() => {
    const handleEmergencyCleanup = (e: KeyboardEvent) => {
      // ESC key emergency cleanup
      if (e.key === 'Escape' && (isSpinTonightOpen || isSpinTonightLoading)) {
        handleSpinTonightClose();
      }
    };

    document.addEventListener('keydown', handleEmergencyCleanup);
    return () => document.removeEventListener('keydown', handleEmergencyCleanup);
  }, [isSpinTonightOpen, isSpinTonightLoading, handleSpinTonightClose]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection onSpinTonight={handleSpinTonight} isSpinTonightLoading={isSpinTonightLoading} />

      {/* Movie Carousels - Mobile First Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12 lg:space-y-16">
        {/* Trending Movies */}
        {isLoading ? (
          <CarouselLoading title="Trending in India" />
        ) : (
          <MovieCarousel
            title="🔥 Trending in India"
            movies={data.trending}
            showSeeMore={true}
            seeMoreHref="/collections/trending"
          />
        )}

        {/* Popular Movies */}
        {isLoading ? (
          <CarouselLoading title="Popular This Week" />
        ) : (
          <MovieCarousel
            title="⭐ Popular This Week"
            movies={data.popular}
            showSeeMore={true}
            seeMoreHref="/collections/popular"
          />
        )}

        {/* Platform-specific sections - Mobile First Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="card-cinema p-4 sm:p-6 rounded-xl">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold leading-tight" style={{ color: 'var(--cinema-white)' }}>Popular on Netflix</h3>
            </div>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--cinema-cream)' }}>
              Discover what's trending on Netflix right now
            </p>
            <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[40px]">
              Browse Netflix →
            </Button>
          </div>

          <div className="card-cinema p-4 sm:p-6 rounded-xl">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold leading-tight" style={{ color: 'var(--cinema-white)' }}>Amazon Prime Video</h3>
            </div>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--cinema-cream)' }}>
              Latest releases and Prime exclusives
            </p>
            <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[40px]">
              Browse Prime →
            </Button>
          </div>

          <div className="card-cinema p-4 sm:p-6 rounded-xl sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-white font-bold text-sm">D+</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold leading-tight" style={{ color: 'var(--cinema-white)' }}>Disney+ Hotstar</h3>
            </div>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--cinema-cream)' }}>
              Marvel, Star Wars, and family favorites
            </p>
            <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[40px]">
              Browse Disney+ →
            </Button>
          </div>
        </section>

        {/* Upcoming Movies */}
        {isLoading ? (
          <CarouselLoading title="Coming Soon" />
        ) : (
          <MovieCarousel
            title="🎬 Coming Soon"
            movies={data.upcoming}
            showSeeMore={true}
            seeMoreHref="/collections/upcoming"
          />
        )}

        {/* Best of Last Year */}
        {isLoading ? (
          <CarouselLoading title={`Best of ${new Date().getFullYear() - 1}`} />
        ) : (
          <MovieCarousel
            title={`🏆 Best of ${new Date().getFullYear() - 1}`}
            movies={data.bestOfLastYear}
            showSeeMore={true}
            seeMoreHref={`/collections/best-of-${new Date().getFullYear() - 1}`}
          />
        )}
      </div>

      {/* Search History Benefits Section - Mobile First */}
      <section className="section-cinema-content py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight" style={{ color: 'var(--cinema-white)' }}>
              Never Lose Track of Your Searches Again
            </h2>
            <p className="text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--cinema-cream)' }}>
              Sign in with one click to automatically save your search history across all your devices
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10 lg:mb-12">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <History className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" style={{ color: 'var(--cinema-white)' }} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 leading-tight" style={{ color: 'var(--cinema-white)' }}>Search History</h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--cinema-cream)' }}>
                Keep track of every movie you've searched for and easily find them again
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" style={{ color: 'var(--cinema-white)' }} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 leading-tight" style={{ color: 'var(--cinema-white)' }}>Sync Across Devices</h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--cinema-cream)' }}>
                Access your search history from any device - phone, tablet, or computer
              </p>
            </div>

            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" style={{ color: 'var(--cinema-white)' }} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 leading-tight" style={{ color: 'var(--cinema-white)' }}>Private & Secure</h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--cinema-cream)' }}>
                Your search history is private to you and secured with Google authentication
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/profile">
              <Button
                size="lg"
                className="btn-cinema-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto min-h-[48px]"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Sign In with Google - It's Free!
              </Button>
            </Link>
            <p className="text-xs sm:text-sm mt-3 px-4" style={{ color: 'var(--cinema-indigo)' }}>
              One click sign-in • No passwords • Instant sync
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action - Mobile First */}
      <section className="section-cinema-elevated py-12 sm:py-16">
        <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight" style={{ color: 'var(--cinema-white)' }}>
            Can't Find What You're Looking For?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed" style={{ color: 'var(--cinema-cream)' }}>
            Our search works even with spelling mistakes. Try searching for your favorite movie!
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar placeholder="Search any movie, even with typos..." size="md" />
          </div>
        </div>
      </section>

      {/* Spin Tonight Modal */}
      <SpinTonightModal
        isOpen={isSpinTonightOpen}
        onClose={handleSpinTonightClose}
      />
    </div>
  );
}

// Note: Metadata is now handled in layout.tsx for this client component