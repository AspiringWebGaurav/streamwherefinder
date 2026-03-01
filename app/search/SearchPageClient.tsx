'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { Search, ArrowLeft, AlertCircle } from 'lucide-react';
import { searchMovies } from '@/services/searchWrapper';
import { MovieCard, MovieCardSkeleton } from '@/components/MovieCard';
import { EnterpriseSearchBar } from '@/components/EnterpriseSearchBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { PopularMovie } from '@/lib/types';

interface SearchPageClientProps {
    initialQuery: string;
    initialPage: number;
}

function NoResults({ query, isFallback = false }: { query: string, isFallback?: boolean }) {
    if (isFallback) {
        return (
            <div className="text-center py-20 px-4 bg-white rounded-3xl border border-rose-200 shadow-sm mt-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-rose-400" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Search Gateway <span className="text-rose-600">Timeout</span>
                </h2>
                <p className="text-slate-600 mb-10 max-w-md mx-auto text-lg leading-relaxed">
                    The streaming search engine is currently responding too slowly. Please try again in a few moments.
                </p>
                <Link href="/" className="inline-flex items-center justify-center h-12 px-8 font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm cursor-pointer">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm mt-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                No results for <span className="text-[var(--cinema-accent)]">&quot;{query}&quot;</span>
            </h2>
            <p className="text-slate-600 mb-10 max-w-md mx-auto text-lg leading-relaxed">
                We couldn&apos;t find any exact matches. Try checking your spelling or using broader keywords.
            </p>
            <div className="max-w-xl mx-auto mb-10 transform-gpu hover:scale-[1.02] transition-transform duration-300">
                <EnterpriseSearchBar placeholder="Try a different search..." autoFocus />
            </div>
            <Link href="/" className="inline-flex items-center justify-center h-12 px-8 font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm cursor-pointer">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
            </Link>
        </div>
    );
}

function VirtualizedGrid({ movies, loadingMore, hasMore, loadMore }: { movies: PopularMovie[], loadingMore: boolean, hasMore: boolean, loadMore: () => void }) {
    const [cols, setCols] = useState(5);
    const [scrollY, setScrollY] = useState(0);
    const [windowHeight, setWindowHeight] = useState(800);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const ROW_HEIGHT = 440;
    const OVERSCAN = 3;

    useEffect(() => {
        const updateMeasurements = () => {
            const w = window.innerWidth;
            if (w >= 1280) setCols(7);
            else if (w >= 1024) setCols(6);
            else if (w >= 768) setCols(5);
            else if (w >= 640) setCols(4);
            else if (w >= 475) setCols(3);
            else setCols(2);

            setWindowHeight(window.innerHeight);
        };
        updateMeasurements();
        window.addEventListener('resize', updateMeasurements);
        return () => window.removeEventListener('resize', updateMeasurements);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!hasMore || loadingMore) return;

        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        }, { rootMargin: '400px' });

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [hasMore, loadingMore, loadMore]);

    const startRow = Math.max(0, Math.floor(scrollY / ROW_HEIGHT) - OVERSCAN);
    const visibleRowCount = Math.ceil(windowHeight / ROW_HEIGHT) + OVERSCAN * 2;
    const startIndex = startRow * cols;
    const endIndex = startIndex + (visibleRowCount * cols);
    const totalRows = Math.ceil(movies.length / cols);

    const visibleMovies = movies.slice(startIndex, endIndex);

    const topSpacerHeight = startRow * ROW_HEIGHT;
    const bottomSpacerHeight = Math.max(0, (totalRows - startRow - visibleRowCount)) * ROW_HEIGHT;

    return (
        <div className="w-full relative">
            <div style={{ height: topSpacerHeight }} />
            <div
                className={`grid gap-4`}
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
                }}
            >
                {visibleMovies.map((movie, idx) => (
                    <div key={`${movie.id}-${startIndex + idx}`} style={{ height: ROW_HEIGHT - 16 }}>
                        <MovieCard movie={movie} priority={startIndex + idx < 8} className="h-full" />
                    </div>
                ))}
            </div>
            <div style={{ height: bottomSpacerHeight }} />

            <div ref={loadMoreRef} className="py-8 w-full flex justify-center">
                {loadingMore && (
                    <div className="flex gap-2">
                        {Array.from({ length: cols }).slice(0, Math.min(cols, 4)).map((_, i) => (
                            <div key={`sk-${i}`} className="w-32 opacity-50 transform scale-90">
                                <MovieCardSkeleton />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function SearchResults({ query }: { query: string }) {
    const [movies, setMovies] = useState<PopularMovie[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [didYouMean, setDidYouMean] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isFallback, setIsFallback] = useState(false);

    const fetchPage = useCallback(async (pageNum: number) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            let data;
            if (pageNum === 1) {
                data = await searchMovies(query, 20);
            } else {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${pageNum}&limit=20`);
                if (!res.ok) {
                    data = { movies: [], totalResults: 0, totalPages: 1, fallbackTriggered: true };
                } else {
                    data = await res.json();
                }
            }

            setMovies(prev => pageNum === 1 ? data.movies : [...prev, ...data.movies]);
            setTotalResults(data.totalResults || data.movies.length || 0);
            setTotalPages(data.totalPages || 1);
            if (pageNum === 1) {
                setDidYouMean(data.didYouMean || null);
                setIsFallback(data.fallbackTriggered || false);
            }
            setPage(pageNum);

        } catch (error) {
            console.error('Search error:', error);
            if (pageNum === 1) {
                setMovies([]);
                setTotalResults(0);
                setTotalPages(1);
                setIsFallback(true);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [query]);

    useEffect(() => {
        if (query) {
            fetchPage(1);
        } else {
            setLoading(false);
        }
    }, [query, fetchPage]);

    const handleLoadMore = useCallback(() => {
        if (page < totalPages && !loadingMore) {
            fetchPage(page + 1);
        }
    }, [page, totalPages, loadingMore, fetchPage]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 pt-6">
                {Array.from({ length: 14 }).map((_, i) => (
                    <MovieCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!movies || movies.length === 0) {
        return <NoResults query={query} isFallback={isFallback} />;
    }

    return (
        <div className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Results for &quot;{query}&quot;
                    </h1>
                    <p className="text-sm font-semibold text-slate-500 mt-1.5 flex items-center gap-2">
                        <span>{totalResults.toLocaleString()} verified streams</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-emerald-600">Updated today</span>
                    </p>
                </div>
                {didYouMean && (
                    <div className="flex items-center text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl shadow-sm">
                        <AlertCircle className="w-4 h-4 mr-2 text-amber-600" />
                        Did you mean: <span className="font-bold ml-1.5">{didYouMean}</span>?
                    </div>
                )}
            </div>

            <VirtualizedGrid
                movies={movies}
                loadingMore={loadingMore}
                hasMore={page < totalPages}
                loadMore={handleLoadMore}
            />
        </div>
    );
}

export function SearchPageClient({ initialQuery }: SearchPageClientProps) {

    return (
        <div className="min-h-[100dvh] bg-[var(--cinema-bg)] flex flex-col">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="w-full max-w-2xl mb-8 relative z-50">
                    <EnterpriseSearchBar placeholder="Search globally..." />
                </div>

                <Suspense fallback={
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 pt-6">
                        {Array.from({ length: 14 }).map((_, i) => (
                            <MovieCardSkeleton key={i} />
                        ))}
                    </div>
                }>
                    <SearchResults query={initialQuery} />
                </Suspense>
            </div>

            <Footer />
        </div>
    );
}
