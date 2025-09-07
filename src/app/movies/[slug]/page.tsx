import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Suspense } from 'react';
import { Star, Calendar, Clock, Play, ArrowLeft } from 'lucide-react';
import { tmdbClient } from '@/lib/tmdb';
import { WatchProviders } from '@/components/movie/WatchProviders';
import { CompactMovieCarousel } from '@/components/movie/MovieCarousel';
import { Button } from '@/components/ui/Button';
import { 
  formatRuntime, 
  formatReleaseDate, 
  formatRating, 
  truncateText,
  getYouTubeEmbedUrl,
  generateMetaDescription,
  generatePageTitle
} from '@/lib/utils';
import Link from 'next/link';
import type { Metadata } from 'next';

interface MoviePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getMovieData(slug: string) {
  try {
    const movieId = tmdbClient.extractIdFromSlug(slug);
    if (!movieId || isNaN(movieId)) {
      return null;
    }

    const movieDetails = await tmdbClient.getMovieDetails(movieId);
    const transformedMovie = tmdbClient.transformMovie(movieDetails);
    
    return {
      movie: transformedMovie,
      raw: movieDetails,
    };
  } catch (error) {
    console.error('Failed to fetch movie data:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getMovieData(slug);
  
  if (!data) {
    return {
      title: 'Movie Not Found',
      description: 'The movie you are looking for could not be found.',
    };
  }

  const { movie } = data;
  const title = generatePageTitle(movie.title, `${formatReleaseDate(movie.releaseDate)} Movie`);
  const description = generateMetaDescription(movie.title, movie.overview);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.movie',
      images: movie.posterPath ? [
        {
          url: movie.posterPath,
          width: 500,
          height: 750,
          alt: `${movie.title} poster`,
        }
      ] : [],
      releaseDate: movie.releaseDate,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: movie.posterPath ? [movie.posterPath] : [],
    },
  };
}

function TrailerEmbed({ trailerKey, title }: { trailerKey: string; title: string }) {
  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <iframe
        src={getYouTubeEmbedUrl(trailerKey)}
        title={`${title} trailer`}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

function MovieDetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 h-96 lg:h-[480px] bg-gray-300 rounded-lg" />
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-gray-300 rounded w-3/4" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { slug } = await params;
  const data = await getMovieData(slug);
  
  if (!data) {
    notFound();
  }

  const { movie, raw } = data;
  const year = formatReleaseDate(movie.releaseDate);
  const similarMovies = raw.similar?.results?.slice(0, 8).map(m => tmdbClient.transformPopularMovie(m)) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Movie Details - One Screen Layout */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="relative aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden">
                {movie.posterPath ? (
                  <Image
                    src={movie.posterPath}
                    alt={`${movie.title} poster`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 320px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center p-4">
                      <div className="text-lg font-medium">No Image</div>
                      <div className="text-sm mt-2">{movie.title}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Movie Information */}
            <div className="flex-1 space-y-6">
              {/* Title and Metadata */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {movie.title} 
                  {year && <span className="text-gray-600 font-normal"> ({year})</span>}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  {movie.rating > 0 && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{formatRating(movie.rating)}</span>
                      <span className="text-gray-400 ml-1">/10</span>
                    </div>
                  )}
                  
                  {movie.releaseDate && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {year}
                    </div>
                  )}
                  
                  {movie.runtime && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatRuntime(movie.runtime)}
                    </div>
                  )}
                </div>

                {movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Synopsis */}
              {movie.overview && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Synopsis</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {truncateText(movie.overview, 300)}
                  </p>
                </div>
              )}

              {/* Trailer */}
              {movie.trailerKey && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Watch Trailer</h3>
                  </div>
                  <div className="lg:pr-8">
                    <Suspense fallback={
                      <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                        <Play className="w-12 h-12 text-gray-400" />
                      </div>
                    }>
                      <TrailerEmbed trailerKey={movie.trailerKey} title={movie.title} />
                    </Suspense>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Where to Watch Section */}
        <WatchProviders
          watchProviders={movie.watchProviders}
          movieTitle={movie.title}
          movieId={movie.id}
          className="mb-8"
        />

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 mb-8">
            <CompactMovieCarousel
              title="Similar Movies"
              movies={similarMovies}
              maxItems={8}
            />
          </div>
        )}

        {/* Related Collections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Explore More Collections</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Dynamic collection suggestions based on movie properties */}
            {movie.genres.includes('Action') && (
              <Link href="/collections/short-thriller-movies" className="group">
                <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">🎬 Short Thriller Movies</h4>
                  <p className="text-sm text-gray-600 mt-1">Quick thrills under 100 minutes</p>
                </div>
              </Link>
            )}
            
            {year === '2024' && (
              <Link href="/collections/bollywood-2024" className="group">
                <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">🌟 Bollywood 2024</h4>
                  <p className="text-sm text-gray-600 mt-1">Latest Hindi movies this year</p>
                </div>
              </Link>
            )}
            
            {movie.rating >= 7.5 && (
              <Link href="/collections/imdb-top-rated-indian" className="group">
                <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">⭐ Top Rated Indian</h4>
                  <p className="text-sm text-gray-600 mt-1">Highest rated Indian movies</p>
                </div>
              </Link>
            )}
            
            {movie.runtime && movie.runtime < 90 && (
              <Link href="/collections/short-movies-under-90min" className="group">
                <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">⏰ Quick Watch Movies</h4>
                  <p className="text-sm text-gray-600 mt-1">Perfect movies under 90 minutes</p>
                </div>
              </Link>
            )}
            
            {movie.genres.includes('Comedy') && (
              <Link href="/collections/bollywood-comedy-classics" className="group">
                <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">😄 Bollywood Comedy</h4>
                  <p className="text-sm text-gray-600 mt-1">Hilarious Hindi comedies</p>
                </div>
              </Link>
            )}
            
            {movie.genres.includes('Science Fiction') && (
              <Link href="/collections/sci-fi-masterpieces" className="group">
                <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">🚀 Sci-Fi Masterpieces</h4>
                  <p className="text-sm text-gray-600 mt-1">Mind-bending science fiction</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 bg-gray-100 rounded-lg p-4 inline-block">
            <span className="font-medium">Legal Notice:</span> We only link to official streaming platforms. 
            StreamWhereFinder does not host or provide illegal streaming links.
          </p>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Movie",
            "name": movie.title,
            "description": movie.overview,
            "datePublished": movie.releaseDate,
            "duration": movie.runtime ? `PT${movie.runtime}M` : undefined,
            "genre": movie.genres,
            "aggregateRating": movie.rating > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": movie.rating,
              "ratingCount": 1000, // This would come from TMDb in a real app
              "bestRating": 10,
              "worstRating": 0
            } : undefined,
            "image": movie.posterPath,
            "trailer": movie.trailerKey ? {
              "@type": "VideoObject",
              "name": `${movie.title} Trailer`,
              "embedUrl": getYouTubeEmbedUrl(movie.trailerKey),
              "thumbnailUrl": movie.posterPath,
              "uploadDate": movie.releaseDate
            } : undefined,
            "potentialAction": {
              "@type": "WatchAction",
              "target": movie.watchProviders?.streaming?.map(provider => ({
                "@type": "EntryPoint",
                "urlTemplate": `https://example.com/watch?movie=${encodeURIComponent(movie.title)}`,
                "actionPlatform": provider.provider_name
              })) || []
            }
          })
        }}
      />
    </div>
  );
}