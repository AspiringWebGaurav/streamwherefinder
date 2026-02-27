'use client';

import Image from 'next/image';
import { ExternalLink, Play, Flag } from 'lucide-react';
import { WatchProvider } from '@/lib/types';
import { trackOutboundClick } from '@/lib/analytics';
import { toast } from 'sonner';
import { getStreamingStatus } from '@/services/availabilityEngine';
import { StreamingStatusCard } from '@/components/StreamingStatusCard';

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
} as const;

const PROVIDER_NAME_MAP: Record<string, keyof typeof PLATFORM_URLS> = {
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

    const typeLabels = { streaming: 'Stream', rent: 'Rent', buy: 'Buy' };
    const typeColors = {
        streaming: 'bg-emerald-600 hover:bg-emerald-700',
        rent: 'bg-blue-600 hover:bg-blue-700',
        buy: 'bg-amber-600 hover:bg-amber-700'
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        trackOutboundClick(provider.provider_name, movieTitle, type);
        window.open(searchUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="group relative">
            <button
                onClick={handleClick}
                className="w-full flex flex-col items-center p-3 sm:p-4 bg-white border border-[var(--saas-border-light)] rounded-xl hover:border-[var(--saas-border)] hover:shadow-sm transition-all h-full"
            >
                <div className="relative w-12 h-12 mb-2 sm:mb-3">
                    <Image
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt={`${provider.provider_name} logo`}
                        width={48}
                        height={48}
                        className="rounded-lg object-contain bg-white shadow-sm ring-1 ring-slate-100"
                        unoptimized
                    />
                </div>
                <div className="text-center w-full">
                    <p className="text-[11px] sm:text-xs font-semibold text-[var(--saas-text-primary)] mb-1.5 truncate leading-tight w-full px-1">
                        {provider.provider_name}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${typeColors[type]}`}>
                        <Play className="w-2.5 h-2.5 mr-1" />
                        {typeLabels[type]}
                    </span>
                </div>
                <ExternalLink className="absolute top-2 right-2 w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onReportIncorrect(provider.provider_name, type);
                }}
                className="absolute top-1 left-1 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Report incorrect link"
            >
                <Flag className="w-3 h-3" />
            </button>
        </div>
    );
}

export function WatchProviders({ watchProviders, movieTitle, movieId, releaseDate, className }: WatchProvidersProps) {
    const hasProviders = watchProviders && (
        (watchProviders.streaming?.length || 0) > 0 ||
        (watchProviders.rent?.length || 0) > 0 ||
        (watchProviders.buy?.length || 0) > 0
    );

    const handleReportIncorrect = (provider: string, type: string) => {
        console.log(`Report: ${provider} ${type} link incorrect for ${movieTitle}`);
        trackOutboundClick(`${provider}_REPORT`, movieTitle, type);
        toast.success(`Report received for ${provider}`, {
            description: "Thank you! We'll review the tracking link shortly.",
            duration: 4000
        });
    };

    const handleFallbackClick = (platform: keyof typeof PLATFORM_URLS, platformName: string) => {
        trackOutboundClick(platformName, movieTitle, 'streaming');
        window.open(`${PLATFORM_URLS[platform]}${encodeURIComponent(movieTitle)}`, '_blank', 'noopener,noreferrer');
    };

    if (!hasProviders) {
        // Compute streaming status via availability engine
        const streamingStatus = getStreamingStatus(
            { releaseDate },
            watchProviders
        );

        const showBookMyShow = streamingStatus.status === 'IN_THEATERS';

        return (
            <div className={`bg-[var(--saas-bg)] border border-[var(--saas-border-light)] rounded-xl p-6 sm:p-8 ${className}`}>
                {/* Streaming Status Card — powered by availability engine */}
                <StreamingStatusCard
                    status={streamingStatus}
                    releaseDate={releaseDate}
                />

                <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--saas-text-primary)] mb-2">
                        Try Searching on These Platforms
                    </h3>
                    <p className="text-sm text-[var(--saas-text-muted)]">
                        The title may be available in your region on one of these services.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
                    <button onClick={() => handleFallbackClick('NETFLIX', 'Netflix')} className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-[var(--saas-border-light)] rounded-xl hover:border-rose-200 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-black text-sm group-hover:bg-rose-100 group-hover:scale-110 transition-all">N</span>
                        <span className="text-[13px] sm:text-sm font-bold text-[var(--saas-text-primary)]">Netflix</span>
                    </button>
                    <button onClick={() => handleFallbackClick('AMAZON_PRIME', 'Prime Video')} className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-[var(--saas-border-light)] rounded-xl hover:border-sky-200 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center font-black text-sm group-hover:bg-sky-100 group-hover:scale-110 transition-all">P</span>
                        <span className="text-[13px] sm:text-sm font-bold text-[var(--saas-text-primary)]">Prime Video</span>
                    </button>
                    <button onClick={() => handleFallbackClick('DISNEY_PLUS', 'Hotstar')} className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-[var(--saas-border-light)] rounded-xl hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm group-hover:bg-indigo-100 group-hover:scale-110 transition-all">H</span>
                        <span className="text-[13px] sm:text-sm font-bold text-[var(--saas-text-primary)]">Hotstar</span>
                    </button>
                    <button onClick={() => handleFallbackClick('APPLE_TV', 'Apple TV+')} className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-[var(--saas-border-light)] rounded-xl hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm group-hover:bg-slate-200 group-hover:scale-110 transition-all">A</span>
                        <span className="text-[13px] sm:text-sm font-bold text-[var(--saas-text-primary)]">Apple TV+</span>
                    </button>
                </div>

                {showBookMyShow && (
                    <div className="mt-8 flex justify-center">
                        <a
                            href={`https://in.bookmyshow.com/explore/movies-${encodeURIComponent(movieTitle.toLowerCase().replace(/\s+/g, '-'))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
                        >
                            <ExternalLink className="w-4 h-4 mr-2 opacity-80" />
                            Book My Show Tickets
                        </a>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`bg-white border border-[var(--saas-border-light)] rounded-xl p-6 sm:p-8 ${className}`}>
            <div className="flex items-center gap-2.5 border-b border-[var(--saas-border-light)] pb-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-[var(--saas-accent)]/10 flex items-center justify-center">
                    <Play className="w-4 h-4 text-[var(--saas-accent)] ml-0.5" />
                </div>
                <h3 className="text-lg font-bold text-[var(--saas-text-primary)]">Where to Watch</h3>
            </div>

            <div className="space-y-8">
                {watchProviders?.streaming && watchProviders.streaming.length > 0 && (
                    <div>
                        <h4 className="flex items-center text-sm font-semibold text-[var(--saas-text-primary)] mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2.5 ring-4 ring-emerald-500/20"></span>
                            Stream Now
                        </h4>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
                            {watchProviders.streaming.map((p) => (
                                <ProviderButton key={p.provider_id} provider={p} type="streaming" movieTitle={movieTitle} movieId={movieId} onReportIncorrect={handleReportIncorrect} />
                            ))}
                        </div>
                    </div>
                )}

                {watchProviders?.rent && watchProviders.rent.length > 0 && (
                    <div>
                        <h4 className="flex items-center text-sm font-semibold text-[var(--saas-text-primary)] mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2.5 ring-4 ring-blue-500/20"></span>
                            Rent
                        </h4>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
                            {watchProviders.rent.map((p) => (
                                <ProviderButton key={p.provider_id} provider={p} type="rent" movieTitle={movieTitle} movieId={movieId} onReportIncorrect={handleReportIncorrect} />
                            ))}
                        </div>
                    </div>
                )}

                {watchProviders?.buy && watchProviders.buy.length > 0 && (
                    <div>
                        <h4 className="flex items-center text-sm font-semibold text-[var(--saas-text-primary)] mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2.5 ring-4 ring-amber-500/20"></span>
                            Buy
                        </h4>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
                            {watchProviders.buy.map((p) => (
                                <ProviderButton key={p.provider_id} provider={p} type="buy" movieTitle={movieTitle} movieId={movieId} onReportIncorrect={handleReportIncorrect} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-4 border-t border-[var(--saas-border-light)] text-center">
                <p className="text-xs text-[var(--saas-text-muted)] flex items-center justify-center">
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    We route directly to official platforms.
                </p>
            </div>
        </div>
    );
}
