'use client';

import { Suspense, useState, useEffect } from 'react';
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
function HeroSection({ onSpinTonight }: { onSpinTonight: () => void }) {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Find Where to
            <span className="text-blue-600 block">Stream Movies</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Search thousands of movies and discover where to watch them legally.
            <span className="text-blue-600 font-medium block mt-2">
              Works even with typos!
            </span>
          </p>
          
          {/* Large Search Bar */}
          <div className="mb-8">
            <SearchBar 
              size="xl" 
              autoFocus={true}
              placeholder="Try searching 'Avvtarr', 'Dark Knigt', or any movie..."
            />
          </div>
          
          {/* Spin Tonight Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
              onClick={onSpinTonight}
            >
              <Shuffle className="w-5 h-5 mr-2" />
              Spin Tonight
            </Button>
            <p className="text-sm text-gray-500">
              Can't decide? Let us pick something great for you!
            </p>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Legal sources only
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2 text-green-500" />
              Updated daily
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
              Trending worldwide
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 opacity-50" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-pink-100 to-yellow-100 opacity-50" />
      </div>
    </section>
  );
}

// Main homepage component
export default function HomePage() {
  const [isSpinTonightOpen, setIsSpinTonightOpen] = useState(false);
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

  const handleSpinTonight = () => {
    setIsSpinTonightOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection onSpinTonight={handleSpinTonight} />
      
      {/* Movie Carousels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
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
        
        {/* Platform-specific sections */}
        <section className="grid md:grid-cols-3 gap-8">
          <div className="bg-red-50 p-6 rounded-xl border border-red-100">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Popular on Netflix</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Discover what's trending on Netflix right now
            </p>
            <Button variant="outline" size="sm">
              Browse Netflix →
            </Button>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Amazon Prime Video</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Latest releases and Prime exclusives
            </p>
            <Button variant="outline" size="sm">
              Browse Prime →
            </Button>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">D+</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Disney+ Hotstar</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Marvel, Star Wars, and family favorites
            </p>
            <Button variant="outline" size="sm">
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
          <CarouselLoading title="Best of 2023" />
        ) : (
          <MovieCarousel
            title="🏆 Best of 2023"
            movies={data.bestOfLastYear}
            showSeeMore={true}
            seeMoreHref="/collections/best-of-2023"
          />
        )}
      </div>

      {/* Search History Benefits Section */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Never Lose Track of Your Searches Again
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Sign in with one click to automatically save your search history across all your devices
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Search History</h3>
              <p className="text-gray-600">
                Keep track of every movie you've searched for and easily find them again
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sync Across Devices</h3>
              <p className="text-gray-600">
                Access your search history from any device - phone, tablet, or computer
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Private & Secure</h3>
              <p className="text-gray-600">
                Your search history is private to you and secured with Google authentication
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/profile">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg"
              >
                <User className="w-5 h-5 mr-2" />
                Sign In with Google - It's Free!
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              One click sign-in • No passwords • Instant sync
            </p>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Our search works even with spelling mistakes. Try searching for your favorite movie!
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar placeholder="Search any movie, even with typos..." />
          </div>
        </div>
      </section>

      {/* Spin Tonight Modal */}
      <SpinTonightModal
        isOpen={isSpinTonightOpen}
        onClose={() => setIsSpinTonightOpen(false)}
      />
    </div>
  );
}

// Note: Metadata is now handled in layout.tsx for this client component