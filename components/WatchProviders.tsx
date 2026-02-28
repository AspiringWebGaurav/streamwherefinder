'use client';

import Image from 'next/image';
import { ExternalLink, Play, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WatchProvider } from '@/lib/tmdb';
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

    const typeTextColors = {
        streaming: 'text-green-600',
        rent: 'text-blue-600',
        buy: 'text-purple-600'
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
                className="flex items-center gap-2.5 p-1.5 pr-4 bg-white border border-[var(--saas-border)] rounded-xl hover:border-[var(--saas-border-light)] hover:shadow-sm transition-all text-left min-w-[140px]"
            >
                <div className="relative w-9 h-9 shrink-0">
                    <Image
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt={`${provider.provider_name} logo`}
                        fill
                        className="rounded-lg object-contain"
                        unoptimized
                    />
                </div>

                <div className="flex flex-col py-0.5">
                    <p className="text-[11px] font-bold text-[var(--saas-text-primary)] leading-tight line-clamp-1">
                        {provider.provider_name}
                    </p>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider mt-0.5 ${typeTextColors[type]}`}>
                        {typeLabels[type]}
                    </span>
                </div>
            </button>

            {/* Report incorrect link */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onReportIncorrect(provider.provider_name, type);
                }}
                className="absolute top-1 right-1 p-1 text-[var(--saas-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
            <div className={`bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl shadow-sm p-6 lg:p-8 ${className}`}>
                <div className="text-center mb-8">
                    {/* Fun header */}
                    <div className="text-4xl mb-4">🎬</div>
                    <h3 className="text-2xl font-extrabold text-amber-950 mb-3 tracking-tight">
                        Ohhoo! Not on Streaming Yet
                    </h3>

                    {/* Status message based on release type */}
                    {isUpcoming ? (
                        <div className="bg-blue-100/50 border border-blue-200/60 rounded-xl p-4 mb-4 max-w-md mx-auto">
                            <p className="text-blue-900 font-bold">
                                🗓️ Coming Soon! Releases on {new Date(releaseDate!).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </p>
                        </div>
                    ) : isRecentRelease ? (
                        <div className="bg-green-100/50 border border-green-200/60 rounded-xl p-4 mb-4 max-w-md mx-auto">
                            <p className="text-green-900 font-bold text-lg">
                                🎭 Currently in Theaters!
                            </p>
                            <p className="text-green-800 font-medium text-sm mt-1">
                                Expected on OTT around {estimatedOTTDate?.toLocaleDateString('en-IN', {
                                    month: 'long', year: 'numeric'
                                })}
                            </p>
                        </div>
                    ) : (
                        <p className="text-amber-800/80 font-medium mb-4 max-w-lg mx-auto">
                            This title isn't available for streaming yet. It may be in theaters, awaiting OTT release, or region-restricted.
                        </p>
                    )}
                </div>

                {/* BookMyShow Section - For Theater Movies */}
                {(isRecentRelease || isUpcoming) && (
                    <div className="mb-8">
                        <h4 className="text-sm font-bold text-amber-900/70 uppercase tracking-wider mb-4 flex items-center justify-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 shadow-sm"></span>
                            Book Theater Tickets
                        </h4>
                        <div className="flex justify-center">
                            <Button
                                onClick={() => handleExternalClick(
                                    `https://in.bookmyshow.com/explore/movies-${encodeURIComponent(movieTitle.toLowerCase().replace(/\s+/g, '-'))}`,
                                    'BookMyShow'
                                )}
                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-xl text-base font-bold shadow-sm transition-all shadow-red-500/20"
                            >
                                🎟️ Book on BookMyShow
                            </Button>
                        </div>
                    </div>
                )}

                {/* Search on OTT Platforms */}
                <div className="mb-8">
                    <h4 className="text-sm font-bold text-amber-900/70 uppercase tracking-wider mb-4 flex items-center justify-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 shadow-sm"></span>
                        Search on Popular Platforms
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFallbackClick('NETFLIX', 'Netflix')}
                            className="border-red-200/60 bg-white/60 hover:bg-white hover:border-red-300 text-gray-800 font-semibold h-11 rounded-xl shadow-sm"
                        >
                            🎬 Netflix
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFallbackClick('AMAZON_PRIME', 'Amazon Prime Video')}
                            className="border-blue-200/60 bg-white/60 hover:bg-white hover:border-blue-300 text-gray-800 font-semibold h-11 rounded-xl shadow-sm"
                        >
                            📺 Prime Video
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFallbackClick('DISNEY_PLUS', 'Disney+ Hotstar')}
                            className="border-indigo-200/60 bg-white/60 hover:bg-white hover:border-indigo-300 text-gray-800 font-semibold h-11 rounded-xl shadow-sm"
                        >
                            ⭐ Hotstar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFallbackClick('JIOCINEMA', 'Jio Cinema')}
                            className="border-pink-200/60 bg-white/60 hover:bg-white hover:border-pink-300 text-gray-800 font-semibold h-11 rounded-xl shadow-sm"
                        >
                            🎥 JioCinema
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFallbackClick('SONY_LIV', 'SonyLIV')}
                            className="border-gray-200/60 bg-white/60 hover:bg-white hover:border-gray-300 text-gray-800 font-semibold h-11 rounded-xl shadow-sm"
                        >
                            📱 SonyLIV
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFallbackClick('ZEE5', 'Zee5')}
                            className="border-purple-200/60 bg-white/60 hover:bg-white hover:border-purple-300 text-gray-800 font-semibold h-11 rounded-xl shadow-sm"
                        >
                            🎞️ Zee5
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFallbackClick('YOUTUBE', 'YouTube')}
                            className="border-red-200/60 bg-white/60 hover:bg-white hover:border-red-300 text-gray-800 font-semibold h-11 rounded-xl shadow-sm"
                        >
                            ▶️ YouTube
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFallbackClick('APPLE_TV', 'Apple TV+')}
                            className="border-gray-300/60 bg-white/60 hover:bg-white hover:border-gray-400 text-gray-800 font-semibold h-11 rounded-xl shadow-sm"
                        >
                            🍎 Apple TV+
                        </Button>
                    </div>
                </div>

                {/* Additional Links Section - Affiliate Ready */}
                <div className="border-t border-amber-200/60 pt-6">
                    <h4 className="text-sm font-bold text-amber-900/70 uppercase tracking-wider mb-4 flex items-center justify-center">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 shadow-sm"></span>
                        More Options
                    </h4>
                    <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold max-w-2xl mx-auto">
                        <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(movieTitle + ' OTT release date India')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackOutboundClick('Google Search', movieTitle, 'fallback')}
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center bg-white/40 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-200 transition-all"
                        >
                            🔍 Check OTT Release Date
                        </a>
                        <a
                            href={`https://in.bookmyshow.com/explore/movies`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackOutboundClick('BookMyShow Browse', movieTitle, 'fallback')}
                            className="text-red-600 hover:text-red-800 hover:underline flex items-center bg-white/40 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-200 transition-all"
                        >
                            🎟️ Browse All Movies
                        </a>
                        <a
                            href={`https://www.justwatch.com/in/search?q=${encodeURIComponent(movieTitle)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackOutboundClick('JustWatch', movieTitle, 'fallback')}
                            className="text-yellow-600 hover:text-yellow-800 hover:underline flex items-center bg-white/40 px-3 py-1.5 rounded-lg border border-transparent hover:border-yellow-200 transition-all"
                        >
                            📊 JustWatch
                        </a>
                        <a
                            href={`https://www.imdb.com/find?q=${encodeURIComponent(movieTitle)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackOutboundClick('IMDB', movieTitle, 'fallback')}
                            className="text-amber-700 hover:text-amber-900 hover:underline flex items-center bg-white/40 px-3 py-1.5 rounded-lg border border-transparent hover:border-amber-300 transition-all"
                        >
                            ⭐ IMDB
                        </a>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-6 pt-4 border-t border-amber-200/30">
                    <p className="text-xs font-medium text-amber-900/50 text-center space-y-1">
                        <span className="block">💡 Tip: New movies typically arrive on OTT 45-60 days after theatrical release.</span>
                        <span className="block">Links open official platforms. We may earn from qualifying purchases.</span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={className || "bg-white border border-[var(--saas-border-light)] rounded-2xl p-6 lg:p-8 shadow-sm"}>
            <div className="flex items-center mb-4 pb-2 inline-flex">
                <Play className="w-5 h-5 text-[var(--saas-accent)] mr-2" />
                <h3 className="text-xl font-extrabold text-[var(--saas-text-primary)]">Where to Watch</h3>
            </div>

            <div className="space-y-5">
                {/* Streaming Options */}
                {watchProviders.streaming && watchProviders.streaming.length > 0 && (
                    <div>
                        <h4 className="text-[11px] font-bold text-[var(--saas-text-secondary)] uppercase tracking-wider mb-2.5 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-sm"></span>
                            Stream Now
                        </h4>
                        <div className="flex flex-wrap gap-2 lg:gap-3">
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
                        <h4 className="text-[11px] font-bold text-[var(--saas-text-secondary)] uppercase tracking-wider mb-2.5 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 shadow-sm"></span>
                            Rent
                        </h4>
                        <div className="flex flex-wrap gap-2 lg:gap-3">
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
                        <h4 className="text-[11px] font-bold text-[var(--saas-text-secondary)] uppercase tracking-wider mb-2.5 flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 shadow-sm"></span>
                            Buy
                        </h4>
                        <div className="flex flex-wrap gap-2 lg:gap-3">
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
            <div className="mt-6 pt-3 border-t border-[var(--saas-border-light)]/50">
                <p className="text-[10px] font-medium text-[var(--saas-text-muted)] flex flex-wrap items-center gap-1.5">
                    <ExternalLink className="w-3 h-3" />
                    <span>Official platforms only.</span>
                    {watchProviders.link && (
                        <a
                            href={watchProviders.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--saas-text-secondary)] hover:text-[var(--saas-accent)] transition-colors underline underline-offset-2 ml-1"
                        >
                            More options on JustWatch
                        </a>
                    )}
                </p>
            </div>
        </div>
    );
}
