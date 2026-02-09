'use client';

import Image from 'next/image';
import { ExternalLink, Play, Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WatchProvider } from '@/types/tmdb';
import { trackOutboundClick } from '@/lib/analytics';

interface WatchProvidersProps {
  watchProviders?: {
    link?: string;
    streaming?: WatchProvider[];
    rent?: WatchProvider[];
    buy?: WatchProvider[];
  };
  movieTitle: string;
  movieId: number;
  releaseDate?: string;
  className?: string;
}

// Official streaming platform URLs for India
const PLATFORM_URLS = {
  NETFLIX: 'https://www.netflix.com/in/search?q=',
  AMAZON_PRIME: 'https://www.primevideo.com/region/eu/search/ref=atv_nb_sr?phrase=',
  DISNEY_PLUS: 'https://www.hotstar.com/in/search?q=',
  APPLE_TV: 'https://tv.apple.com/in/search?term=',
  YOUTUBE: 'https://www.youtube.com/results?search_query=',
  GOOGLE_PLAY: 'https://play.google.com/store/search?q=movie%20',
  SONY_LIV: 'https://www.sonyliv.com/search?q=',
  ZEE5: 'https://www.zee5.com/search?q=',
  VOOT: 'https://www.voot.com/search?q=',
  ALT_BALAJI: 'https://www.altbalaji.com/search?q=',
  JIOCINEMA: 'https://www.jiocinema.com/search?q=',
  MX_PLAYER: 'https://www.mxplayer.in/search?q=',
};

const PROVIDER_NAME_MAP: { [key: string]: keyof typeof PLATFORM_URLS } = {
  'Netflix': 'NETFLIX',
  'Amazon Prime Video': 'AMAZON_PRIME',
  'Disney Plus': 'DISNEY_PLUS',
  'Disney+ Hotstar': 'DISNEY_PLUS',
  'Apple TV': 'APPLE_TV',
  'YouTube': 'YOUTUBE',
  'Google Play Movies': 'GOOGLE_PLAY',
  'Google Play Movies & TV': 'GOOGLE_PLAY',
  'SonyLIV': 'SONY_LIV',
  'Zee5': 'ZEE5',
  'Voot': 'VOOT',
  'ALTBalaji': 'ALT_BALAJI',
  'Jio Cinema': 'JIOCINEMA',
  'MX Player': 'MX_PLAYER',
};

function ProviderButton({
  provider,
  type,
  movieTitle,
  movieId,
  onReportIncorrect
}: {
  provider: WatchProvider;
  type: 'streaming' | 'rent' | 'buy';
  movieTitle: string;
  movieId: number;
  onReportIncorrect: (provider: string, type: string) => void;
}) {
  const platformKey = PROVIDER_NAME_MAP[provider.provider_name];
  const baseUrl = platformKey ? PLATFORM_URLS[platformKey] : '#';
  const searchUrl = `${baseUrl}${encodeURIComponent(movieTitle)}`;

  const typeLabels = {
    streaming: 'Stream',
    rent: 'Rent',
    buy: 'Buy'
  };

  const typeColors = {
    streaming: 'bg-green-600 hover:bg-green-700',
    rent: 'bg-blue-600 hover:bg-blue-700',
    buy: 'bg-purple-600 hover:bg-purple-700'
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Track outbound click
    trackOutboundClick(provider.provider_name, movieTitle, type);

    // Open link
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group relative">
      <button
        onClick={handleClick}
        className="w-full flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
      >
        <div className="relative w-12 h-12 mb-2">
          <Image
            src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
            alt={`${provider.provider_name} logo`}
            width={48}
            height={48}
            className="rounded-lg object-contain"
            unoptimized
          />
        </div>

        <div className="text-center">
          <p className="text-xs font-medium text-gray-900 mb-1">
            {provider.provider_name}
          </p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${typeColors[type]}`}>
            <Play className="w-3 h-3 mr-1" />
            {typeLabels[type]}
          </span>
        </div>

        <ExternalLink className="w-3 h-3 text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Report incorrect link */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReportIncorrect(provider.provider_name, type);
        }}
        className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Report incorrect link"
      >
        <Flag className="w-3 h-3" />
      </button>
    </div>
  );
}

export function WatchProviders({ watchProviders, movieTitle, movieId, releaseDate, className }: WatchProvidersProps) {
  const hasProviders = watchProviders && (
    (watchProviders.streaming && watchProviders.streaming.length > 0) ||
    (watchProviders.rent && watchProviders.rent.length > 0) ||
    (watchProviders.buy && watchProviders.buy.length > 0)
  );

  const handleReportIncorrect = (provider: string, type: string) => {
    // For now, just log the report. In production, this would send to an API
    console.log(`Report: ${provider} ${type} link incorrect for ${movieTitle}`);

    // Track the report
    trackOutboundClick(`${provider}_REPORT`, movieTitle, type as any);

    // Show user feedback
    alert(`Thank you for reporting the incorrect link for ${provider}. We'll review it shortly.`);
  };

  const handleFallbackClick = (platform: keyof typeof PLATFORM_URLS, platformName: string) => {
    trackOutboundClick(platformName, movieTitle, 'streaming');
    window.open(`${PLATFORM_URLS[platform]}${encodeURIComponent(movieTitle)}`, '_blank', 'noopener,noreferrer');
  };

  if (!hasProviders) {
    // Check if movie is likely still in theaters (released within last 90 days)
    const isRecentRelease = releaseDate ? (() => {
      const release = new Date(releaseDate);
      const now = new Date();
      const daysSinceRelease = Math.floor((now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceRelease >= 0 && daysSinceRelease <= 90;
    })() : false;

    // Check if movie hasn't released yet
    const isUpcoming = releaseDate ? new Date(releaseDate) > new Date() : false;

    // Estimate OTT release (typically 45-60 days after theatrical)
    const estimatedOTTDate = releaseDate ? (() => {
      const release = new Date(releaseDate);
      release.setDate(release.getDate() + 60);
      return release;
    })() : null;

    const handleExternalClick = (url: string, platform: string) => {
      trackOutboundClick(platform, movieTitle, 'fallback');
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
      <div className={`bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 ${className}`}>
        <div className="text-center mb-6">
          {/* Fun header */}
          <div className="text-4xl mb-3">🎬</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Ohhoo! Not on Streaming Yet
          </h3>

          {/* Status message based on release type */}
          {isUpcoming ? (
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 font-medium">
                🗓️ Coming Soon! Releases on {new Date(releaseDate!).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          ) : isRecentRelease ? (
            <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-800 font-medium">
                🎭 Currently in Theaters!
              </p>
              <p className="text-green-700 text-sm mt-1">
                Expected on OTT around {estimatedOTTDate?.toLocaleDateString('en-IN', {
                  month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          ) : (
            <p className="text-gray-600 mb-4">
              This title isn't available for streaming yet. It may be in theaters, awaiting OTT release, or region-restricted.
            </p>
          )}
        </div>

        {/* BookMyShow Section - For Theater Movies */}
        {(isRecentRelease || isUpcoming) && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Book Theater Tickets
            </h4>
            <div className="flex justify-center">
              <Button
                onClick={() => handleExternalClick(
                  `https://in.bookmyshow.com/explore/movies-${encodeURIComponent(movieTitle.toLowerCase().replace(/\s+/g, '-'))}`,
                  'BookMyShow'
                )}
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                🎟️ Book on BookMyShow
              </Button>
            </div>
          </div>
        )}

        {/* Search on OTT Platforms */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            Search on Popular Platforms
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFallbackClick('NETFLIX', 'Netflix')}
              className="border-red-200 hover:bg-red-50 text-gray-700"
            >
              🎬 Netflix
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFallbackClick('AMAZON_PRIME', 'Amazon Prime Video')}
              className="border-blue-200 hover:bg-blue-50 text-gray-700"
            >
              📺 Prime Video
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFallbackClick('DISNEY_PLUS', 'Disney+ Hotstar')}
              className="border-indigo-200 hover:bg-indigo-50 text-gray-700"
            >
              ⭐ Hotstar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFallbackClick('JIOCINEMA', 'Jio Cinema')}
              className="border-pink-200 hover:bg-pink-50 text-gray-700"
            >
              🎥 JioCinema
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFallbackClick('SONY_LIV', 'SonyLIV')}
              className="border-gray-200 hover:bg-gray-50 text-gray-700"
            >
              📱 SonyLIV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFallbackClick('ZEE5', 'Zee5')}
              className="border-purple-200 hover:bg-purple-50 text-gray-700"
            >
              🎞️ Zee5
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFallbackClick('YOUTUBE', 'YouTube')}
              className="border-red-200 hover:bg-red-50 text-gray-700"
            >
              ▶️ YouTube
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFallbackClick('APPLE_TV', 'Apple TV+')}
              className="border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              🍎 Apple TV+
            </Button>
          </div>
        </div>

        {/* Additional Links Section - Affiliate Ready */}
        <div className="border-t border-amber-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            More Options
          </h4>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(movieTitle + ' OTT release date India')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutboundClick('Google Search', movieTitle, 'fallback')}
              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
            >
              🔍 Check OTT Release Date
            </a>
            <span className="text-gray-300">|</span>
            <a
              href={`https://in.bookmyshow.com/explore/movies`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutboundClick('BookMyShow Browse', movieTitle, 'fallback')}
              className="text-red-600 hover:text-red-800 hover:underline flex items-center"
            >
              🎟️ Browse All Movies
            </a>
            <span className="text-gray-300">|</span>
            <a
              href={`https://www.justwatch.com/in/search?q=${encodeURIComponent(movieTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutboundClick('JustWatch', movieTitle, 'fallback')}
              className="text-yellow-600 hover:text-yellow-800 hover:underline flex items-center"
            >
              📊 JustWatch
            </a>
            <span className="text-gray-300">|</span>
            <a
              href={`https://www.imdb.com/find?q=${encodeURIComponent(movieTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutboundClick('IMDB', movieTitle, 'fallback')}
              className="text-amber-600 hover:text-amber-800 hover:underline flex items-center"
            >
              ⭐ IMDB
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 pt-3 border-t border-amber-100">
          <p className="text-xs text-gray-500 text-center">
            💡 Tip: New movies typically arrive on OTT 45-60 days after theatrical release.
            <br />
            <span className="text-gray-400">Links open official platforms. We may earn from qualifying purchases.</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <Play className="w-6 h-6 text-green-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-900">Where to Watch</h3>
      </div>

      <div className="space-y-6">
        {/* Streaming Options */}
        {watchProviders.streaming && watchProviders.streaming.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Stream Now
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {watchProviders.streaming.map((provider) => (
                <ProviderButton
                  key={provider.provider_id}
                  provider={provider}
                  type="streaming"
                  movieTitle={movieTitle}
                  movieId={movieId}
                  onReportIncorrect={handleReportIncorrect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Rental Options */}
        {watchProviders.rent && watchProviders.rent.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Rent
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {watchProviders.rent.map((provider) => (
                <ProviderButton
                  key={provider.provider_id}
                  provider={provider}
                  type="rent"
                  movieTitle={movieTitle}
                  movieId={movieId}
                  onReportIncorrect={handleReportIncorrect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Purchase Options */}
        {watchProviders.buy && watchProviders.buy.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Buy
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {watchProviders.buy.map((provider) => (
                <ProviderButton
                  key={provider.provider_id}
                  provider={provider}
                  type="buy"
                  movieTitle={movieTitle}
                  movieId={movieId}
                  onReportIncorrect={handleReportIncorrect}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          <span className="inline-flex items-center">
            <ExternalLink className="w-3 h-3 mr-1" />
            We only link to official streaming platforms
          </span>
        </p>
        {watchProviders.link && (
          <p className="text-xs text-gray-400 text-center mt-1">
            <a
              href={watchProviders.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600"
            >
              More options on JustWatch →
            </a>
          </p>
        )}
      </div>
    </div>
  );
}