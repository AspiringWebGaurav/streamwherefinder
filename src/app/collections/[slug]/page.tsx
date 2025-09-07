import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, TrendingUp, Star, Calendar, Award } from 'lucide-react';
import { tmdbClient, PROVIDER_IDS } from '@/lib/tmdb';
import { MovieCard, MovieCardSkeleton } from '@/components/movie/MovieCard';
import { SearchBar } from '@/components/search/SearchBar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { Metadata } from 'next';

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

// Collection definitions
const COLLECTIONS = {
  // Original Collections
  'trending': {
    title: '🔥 Trending Movies',
    description: 'The hottest movies trending right now in India',
    icon: TrendingUp,
    color: 'bg-red-50 text-red-700',
    fetchData: (page: number) => tmdbClient.getTrendingMovies('week').then(r => ({ ...r, page: 1, total_pages: 1 })),
  },
  'popular': {
    title: '⭐ Popular Movies',
    description: 'Most popular movies loved by audiences worldwide',
    icon: Star,
    color: 'bg-blue-50 text-blue-700',
    fetchData: (page: number) => tmdbClient.getPopularMovies(page),
  },
  'upcoming': {
    title: '🎬 Coming Soon',
    description: 'Upcoming movie releases to watch out for',
    icon: Calendar,
    color: 'bg-green-50 text-green-700',
    fetchData: (page: number) => tmdbClient.getUpcomingMovies(page),
  },
  'best-of-2024': {
    title: '🏆 Best of 2024',
    description: 'Highest rated movies from 2024 that you cannot miss',
    icon: Award,
    color: 'bg-purple-50 text-purple-700',
    fetchData: (page: number) => tmdbClient.getBestOfLastYear().then(r => ({ ...r, page: 1, total_pages: 1 })),
  },

  // Platform-Specific Collections
  'netflix-india': {
    title: 'Netflix India Movies',
    description: 'Best Hindi and regional movies streaming on Netflix India',
    icon: Star,
    color: 'bg-red-50 text-red-700',
    fetchData: (page: number) => tmdbClient.getMoviesByProvider(PROVIDER_IDS.NETFLIX, page),
  },
  'prime-video-hindi': {
    title: 'Prime Video Hindi Movies',
    description: 'Top Bollywood and Hindi movies on Amazon Prime Video',
    icon: Star,
    color: 'bg-blue-50 text-blue-700',
    fetchData: (page: number) => tmdbClient.getMoviesByProvider(PROVIDER_IDS.AMAZON_PRIME, page),
  },
  'hotstar-bollywood': {
    title: 'Disney+ Hotstar Bollywood',
    description: 'Latest Bollywood blockbusters and classics on Disney+ Hotstar',
    icon: Star,
    color: 'bg-purple-50 text-purple-700',
    fetchData: (page: number) => tmdbClient.getMoviesByProvider(PROVIDER_IDS.DISNEY_PLUS, page),
  },

  // Duration-Based Collections
  'short-movies-under-90min': {
    title: 'Quick Watch: Movies Under 90 Minutes',
    description: 'Perfect short movies you can finish in under 90 minutes',
    icon: Calendar,
    color: 'bg-green-50 text-green-700',
    fetchData: (page: number) => tmdbClient.getDiscoverMovies({ 'with_runtime.lte': '90', 'sort_by': 'popularity.desc' }, page),
  },
  'long-movies-over-150min': {
    title: 'Epic Movies Over 2.5 Hours',
    description: 'Epic long movies for your weekend movie marathon',
    icon: Calendar,
    color: 'bg-orange-50 text-orange-700',
    fetchData: (page: number) => tmdbClient.getDiscoverMovies({ 'with_runtime.gte': '150', 'sort_by': 'vote_average.desc' }, page),
  },

  // Genre + Duration Combinations
  'short-thriller-movies': {
    title: 'Thriller Movies Under 100 Minutes',
    description: 'Quick thrills: Edge-of-your-seat movies under 100 minutes',
    icon: Award,
    color: 'bg-gray-50 text-gray-700',
    fetchData: (page: number) => tmdbClient.getDiscoverMovies({
      'with_genres': '53', // Thriller genre ID
      'with_runtime.lte': '100',
      'sort_by': 'popularity.desc'
    }, page),
  },
  'bollywood-comedy-classics': {
    title: 'Bollywood Comedy Classics',
    description: 'Hilarious Hindi comedy movies that will make you laugh out loud',
    icon: Star,
    color: 'bg-yellow-50 text-yellow-700',
    fetchData: (page: number) => tmdbClient.getDiscoverMovies({
      'with_genres': '35', // Comedy genre ID
      'with_original_language': 'hi', // Hindi
      'sort_by': 'vote_average.desc'
    }, page),
  },

  // Regional Collections
  'bollywood-2024': {
    title: 'Bollywood Movies 2024',
    description: 'Latest Hindi movies released in 2024',
    icon: TrendingUp,
    color: 'bg-orange-50 text-orange-700',
    fetchData: (page: number) => tmdbClient.getDiscoverMovies({
      'primary_release_year': '2024',
      'with_original_language': 'hi',
      'sort_by': 'popularity.desc'
    }, page),
  },
  'south-indian-blockbusters': {
    title: 'South Indian Blockbusters',
    description: 'Top-rated Tamil, Telugu, and Malayalam movies',
    icon: Star,
    color: 'bg-indigo-50 text-indigo-700',
    fetchData: (page: number) => tmdbClient.getDiscoverMovies({
      'with_original_language': 'ta|te|ml',
      'sort_by': 'vote_average.desc',
      'vote_count.gte': '100'
    }, page),
  },

  // Year-Based Collections
  'hollywood-2024': {
    title: 'Hollywood Movies 2024',
    description: 'Latest Hollywood releases and blockbusters from 2024',
    icon: Calendar,
    color: 'bg-blue-50 text-blue-700',
    fetchData: (page: number) => tmdbClient.getDiscoverMovies({
      'primary_release_year': '2024',
      'with_original_language': 'en',
      'sort_by': 'popularity.desc'
    }, page),
  },
  '90s-bollywood-classics': {
    title: '90s Bollywood Classics',
    description: 'Nostalgic Hindi movies from the golden era of the 1990s',
    icon: Award,
    color: 'bg-purple-50 text-purple-700',
    fetchData: (page: number) => tmdbClient.getDiscoverMovies({
      'primary_release_date.gte': '1990-01-01',
      'primary_release_date.lte': '1999-12-31',
      'with_original_language': 'hi',
      'sort_by': 'vote_average.desc'
    }, page),
  },

  // High-Rating Collections
  'imdb-top-rated-indian': {
    title: 'Top Rated Indian Movies',
    description: 'Highest rated Indian movies across all languages',
    icon: Award,
    color: 'bg-yellow-50 text-yellow-700',
    fetchData: (page: number) => tmdbClient.getDiscoverMovies({
      'with_origin_country': 'IN',
      'vote_average.gte': '7.0',
      'vote_count.gte': '1000',
      'sort_by': 'vote_average.desc'
    }, page),
  },
  'hidden-gems-under-rated': {
    title: 'Hidden Gems: Underrated Movies',
    description: 'Amazing movies you probably missed with great ratings',
    icon: Star,
    color: 'bg-teal-50 text-teal-700',
    fetchData: (page: number) => tmdbClient.getDiscoverMovies({
      'vote_average.gte': '7.5',
      'vote_count.gte': '100',
      'vote_count.lte': '5000',
      'sort_by': 'vote_average.desc'
    }, page),
  },

  // Genre-Specific Collections
  'sci-fi-masterpieces': {
    title: 'Sci-Fi Masterpieces',
    description: 'Mind-bending science fiction movies that will blow your mind',
    icon: TrendingUp,
    color: 'bg-cyan-50 text-cyan-700',
    fetchData: (page: number) => tmdbClient.getDiscoverMovies({
      'with_genres': '878', // Sci-Fi genre ID
      'vote_average.gte': '6.5',
      'sort_by': 'vote_average.desc'
    }, page),
  },
} as const;

type CollectionSlug = keyof typeof COLLECTIONS;

// Generate metadata for SEO
export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = COLLECTIONS[slug as CollectionSlug];
  
  if (!collection) {
    return {
      title: 'Collection Not Found',
      description: 'The movie collection you are looking for could not be found.',
    };
  }

  return {
    title: `${collection.title} | StreamWhereFinder`,
    description: `${collection.description}. Find where to watch these movies online legally.`,
    openGraph: {
      title: collection.title,
      description: collection.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: collection.title,
      description: collection.description,
    },
  };
}

// Loading component
function CollectionLoading() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 20 }, (_, i) => (
        <MovieCardSkeleton key={i} size="sm" />
      ))}
    </div>
  );
}

// Pagination component
function Pagination({ 
  currentPage, 
  totalPages, 
  slug 
}: { 
  currentPage: number; 
  totalPages: number; 
  slug: string; 
}) {
  if (totalPages <= 1) return null;

  const showPages = 5;
  const startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  const endPage = Math.min(totalPages, startPage + showPages - 1);
  
  return (
    <div className="flex justify-center items-center space-x-2 mt-12">
      {/* Previous button */}
      {currentPage > 1 && (
        <Link
          href={`/collections/${slug}?page=${currentPage - 1}`}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Previous
        </Link>
      )}
      
      {/* Page numbers */}
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
        const pageNum = startPage + i;
        return (
          <Link
            key={pageNum}
            href={`/collections/${slug}?page=${pageNum}`}
            className={`px-4 py-2 rounded-lg transition-colors ${
              pageNum === currentPage
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </Link>
        );
      })}
      
      {/* Next button */}
      {currentPage < totalPages && (
        <Link
          href={`/collections/${slug}?page=${currentPage + 1}`}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Next
        </Link>
      )}
    </div>
  );
}

// Collection content component
async function CollectionContent({ slug, page }: { slug: CollectionSlug; page: number }) {
  const collection = COLLECTIONS[slug];
  
  try {
    const response = await collection.fetchData(page);
    const movies = response.results.map(movie => tmdbClient.transformPopularMovie(movie));
    
    if (movies.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <collection.icon className="w-12 h-12 text-gray-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No movies found
          </h2>
          
          <p className="text-gray-600 mb-8">
            We couldn't find any movies for this collection right now.
          </p>

          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <>
        {/* Movies grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              size="sm"
              priority={index < 12}
            />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={response.page}
          totalPages={response.total_pages}
          slug={slug}
        />
      </>
    );
    
  } catch (error) {
    console.error('Failed to fetch collection data:', error);
    
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <collection.icon className="w-12 h-12 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Failed to load movies
        </h2>
        
        <p className="text-gray-600 mb-8">
          We're having trouble loading this collection. Please try again later.
        </p>

        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => window.location.reload()}
            variant="primary"
          >
            Try Again
          </Button>
          
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const collection = COLLECTIONS[slug as CollectionSlug];

  if (!collection) {
    notFound();
  }

  const IconComponent = collection.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Link 
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
          
          <div className="flex items-center mb-4">
            <div className={`p-3 rounded-xl ${collection.color} mr-4`}>
              <IconComponent className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {collection.title}
              </h1>
              <p className="text-gray-600 mt-1">
                {collection.description}
              </p>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="max-w-2xl">
            <SearchBar 
              placeholder="Search within this collection..."
              size="md"
              showSuggestions={false}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Collection Content */}
        <Suspense fallback={<CollectionLoading />}>
          <CollectionContent slug={slug as CollectionSlug} page={page} />
        </Suspense>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": collection.title,
            "description": collection.description,
            "url": `${process.env.NEXT_PUBLIC_SITE_URL}/collections/${slug}`,
            "mainEntity": {
              "@type": "ItemList",
              "name": collection.title,
              "description": collection.description,
              "itemListElement": [] // This would be populated with actual movie data in production
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": `${process.env.NEXT_PUBLIC_SITE_URL}/`
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Collections",
                  "item": `${process.env.NEXT_PUBLIC_SITE_URL}/collections`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": collection.title,
                  "item": `${process.env.NEXT_PUBLIC_SITE_URL}/collections/${slug}`
                }
              ]
            }
          })
        }}
      />
    </div>
  );
}

// Generate static params for known collection slugs
export function generateStaticParams() {
  return Object.keys(COLLECTIONS).map((slug) => ({
    slug,
  }));
}