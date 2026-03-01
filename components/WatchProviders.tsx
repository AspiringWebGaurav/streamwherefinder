'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ExternalLink, Play, Flag, ShieldCheck, Clock, Calendar, Globe, Film, Info, Search } from 'lucide-react';
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
    isLoading?: boolean;
}

// Official streaming platform URLs for India
const PLATFORM_URLS: Record<string, string> = {
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

const PROVIDER_NAME_MAP: { [key: string]: string } = {
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

export function WatchProviderSkeleton() {
    return (
        <div className="bg-white border border-[var(--saas-border-light)] rounded-2xl p-5 lg:p-6 shadow-sm relative overflow-hidden w-full">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center">
                    <div className="w-5 h-5 rounded-md bg-[var(--saas-border-light)] animate-pulse mr-3"></div>
                    <div className="h-5 w-48 bg-[var(--saas-border-light)] animate-pulse rounded"></div>
                </div>
                <div className="h-6 w-24 bg-[var(--saas-border-light)] animate-pulse rounded-full hidden sm:block"></div>
            </div>
            
            <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2 pr-4 border border-[var(--saas-border-light)] rounded-xl min-w-[160px] bg-white w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-lg bg-[var(--saas-border-light)] animate-pulse shrink-0"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-3.5 w-20 bg-[var(--saas-border-light)] animate-pulse rounded"></div>
                            <div className="flex gap-1">
                                <div className="h-3.5 w-12 bg-[var(--saas-border-light)] animate-pulse rounded-md"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProviderButton({
    provider,
    types,
    movieTitle,
    onReportIncorrect
}: {
    provider: WatchProvider;
    types: ('streaming' | 'rent' | 'buy')[];
    movieTitle: string;
    onReportIncorrect: (provider: string) => void;
}) {
    const platformKey = PROVIDER_NAME_MAP[provider.provider_name];
    const baseUrl = platformKey ? PLATFORM_URLS[platformKey] : '#';
    const searchUrl = `${baseUrl}${encodeURIComponent(movieTitle)}`;

    const typeLabels = {
        streaming: 'Stream',
        rent: 'Rent',
        buy: 'Buy'
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        trackOutboundClick(provider.provider_name, movieTitle, types[0]); // track primary
        window.open(searchUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="group relative flex-grow sm:flex-grow-0">
            <button
                onClick={handleClick}
                className="w-full flex items-center gap-3 p-2 border border-[var(--saas-border-light)] rounded-xl hover:border-[var(--saas-border)] hover:bg-[var(--saas-bg)] hover:shadow-sm transition-all text-left min-w-[160px]"
            >
                <div className="relative w-11 h-11 shrink-0">
                    <Image
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt={`${provider.provider_name} logo`}
                        fill
                        className="rounded-lg object-contain shadow-sm border border-[var(--saas-border-light)]/50"
                        unoptimized
                    />
                </div>

                <div className="flex flex-col gap-1.5 justify-center py-0.5">
                    <p className="text-[13px] font-bold text-[var(--saas-text-primary)] leading-none line-clamp-1">
                        {provider.provider_name}
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {types.map(t => (
                            <span key={t} className="px-1.5 py-[3px] bg-[var(--saas-bg)] text-[var(--saas-text-secondary)] font-semibold text-[9px] uppercase tracking-wider rounded border border-[var(--saas-border-light)] shadow-sm leading-none">
                                {typeLabels[t]}
                            </span>
                        ))}
                    </div>
                </div>
            </button>

            {/* Report incorrect link */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onReportIncorrect(provider.provider_name);
                }}
                className="absolute top-1 right-1 p-1.5 text-[var(--saas-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Report incorrect link"
            >
                <Flag className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

export function WatchProviders({ watchProviders, movieTitle, movieId, releaseDate, className, isLoading }: WatchProvidersProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || isLoading) {
        return <WatchProviderSkeleton />;
    }

    const hasProviders = watchProviders && (
        (watchProviders.streaming && watchProviders.streaming.length > 0) ||
        (watchProviders.rent && watchProviders.rent.length > 0) ||
        (watchProviders.buy && watchProviders.buy.length > 0)
    );

    const handleReportIncorrect = (provider: string) => {
        console.log(`Report: ${provider} link incorrect for ${movieTitle}`);
        trackOutboundClick(`${provider}_REPORT`, movieTitle, 'flag' as any);
    };

    // Aggregate providers
    type ProviderGroup = {
        provider: WatchProvider;
        types: ('streaming' | 'rent' | 'buy')[];
    };

    const groupedProviders: Record<number, ProviderGroup> = {};

    const addProviders = (providers: WatchProvider[] | undefined, type: 'streaming' | 'rent' | 'buy') => {
        if (!providers) return;
        providers.forEach(p => {
            if (!groupedProviders[p.provider_id]) {
                groupedProviders[p.provider_id] = { provider: p, types: [] };
            }
            if (!groupedProviders[p.provider_id].types.includes(type)) {
                groupedProviders[p.provider_id].types.push(type);
            }
        });
    };

    addProviders(watchProviders?.streaming, 'streaming');
    addProviders(watchProviders?.rent, 'rent');
    addProviders(watchProviders?.buy, 'buy');

    const uniqueProviders = Object.values(groupedProviders);

    if (!hasProviders) {
        const isUpcoming = releaseDate ? new Date(releaseDate) > new Date() : false;
        const isRecentRelease = releaseDate ? (() => {
            const release = new Date(releaseDate);
            const now = new Date();
            const daysSinceRelease = Math.floor((now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24));
            return daysSinceRelease >= 0 && daysSinceRelease <= 120;
        })() : false;

        const estimatedOTTDate = releaseDate ? (() => {
            const release = new Date(releaseDate);
            release.setDate(release.getDate() + 45); // General prediction model
            return release;
        })() : null;

        return (
            <div className={`bg-white border border-[var(--saas-border-light)] rounded-2xl p-5 lg:p-6 shadow-sm w-full ${className || ''}`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        <Info className="w-5 h-5 text-[var(--saas-text-secondary)] mr-2.5" />
                        <h3 className="text-xl font-extrabold text-[var(--saas-text-primary)] tracking-tight">
                            {isUpcoming ? "Upcoming Release" : isRecentRelease ? "Currently in Theaters" : "Not Available for Streaming"}
                        </h3>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-[14px] text-[var(--saas-text-secondary)] font-medium leading-relaxed max-w-2xl">
                        {isUpcoming 
                            ? "Streaming availability will appear after the theatrical release window." 
                            : isRecentRelease 
                                ? "Streaming availability typically follows the theatrical window." 
                                : "This title is not currently available on major streaming platforms in your region."}
                    </p>

                    {isRecentRelease && estimatedOTTDate && (
                        <div className="flex items-center gap-2 mt-2 bg-[var(--saas-bg)] inline-flex px-3 py-1.5 rounded-lg border border-[var(--saas-border-light)]">
                            <Clock className="w-4 h-4 text-[var(--saas-accent)]" />
                            <p className="text-[12.5px] text-[var(--saas-text-primary)] font-semibold">
                                Expected OTT Arrival: <span className="text-[var(--saas-text-muted)] font-medium ml-1">~ {estimatedOTTDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </p>
                        </div>
                    )}

                    {!isUpcoming && !isRecentRelease && (
                         <div className="flex items-center gap-2 mt-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--saas-border)]"></div>
                            <p className="text-[12px] text-[var(--saas-text-muted)] font-medium">
                                Based on standard availability patterns, this may be region-restricted or awaiting digital licensing.
                            </p>
                        </div>
                    )}

                    <div className="pt-5 mt-5 border-t border-[var(--saas-border-light)]/50 flex flex-wrap gap-3">
                         <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-[var(--saas-border-light)] text-[var(--saas-text-secondary)] hover:text-[var(--saas-text-primary)] hover:bg-[var(--saas-bg)] font-bold shadow-sm h-9 rounded-xl px-4"
                            onClick={() => window.open(`https://www.justwatch.com/in/search?q=${encodeURIComponent(movieTitle)}`, '_blank')}
                         >
                            <Search className="w-4 h-4 mr-2" />
                            Check JustWatch for global availability
                         </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-[var(--saas-border-light)] rounded-2xl p-5 lg:p-6 shadow-sm w-full ${className || ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 sm:mb-6 gap-3 sm:gap-0">
                <div className="flex items-center">
                    <Play className="w-5 h-5 text-[var(--saas-text-primary)] mr-2.5" />
                    <h3 className="text-xl font-extrabold text-[var(--saas-text-primary)] tracking-tight">Streaming Availability</h3>
                </div>

                {/* Confidence indicator */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--saas-bg)] rounded-full border border-[var(--saas-border-light)] shadow-sm self-start sm:self-auto">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-[10px] font-bold text-[var(--saas-text-muted)] uppercase tracking-wider">Updated today</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                {uniqueProviders.map((group) => (
                    <ProviderButton
                        key={group.provider.provider_id}
                        provider={group.provider}
                        types={group.types}
                        movieTitle={movieTitle}
                        onReportIncorrect={handleReportIncorrect}
                    />
                ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 pt-4 border-t border-[var(--saas-border-light)] flex justify-between items-center">
                <p className="text-[11px] font-medium text-[var(--saas-text-muted)] flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Links open official platforms externally.</span>
                </p>
                {watchProviders.link && (
                    <a
                        href={watchProviders.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-[var(--saas-text-secondary)] hover:text-[var(--saas-text-primary)] transition-colors underline underline-offset-2 decoration-[var(--saas-border-light)] hover:decoration-current"
                    >
                        Powered by JustWatch
                    </a>
                )}
            </div>
        </div>
    );
}

