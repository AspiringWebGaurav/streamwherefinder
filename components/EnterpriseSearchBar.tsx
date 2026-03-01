'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles, AlertCircle, Film, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SafeImage } from '@/components/SafeImage';
import { cn } from '@/lib/utils';
import { fadeIn, slideDown, fadeInOutBreathing } from '@/lib/motion';
import { searchMovies, getDidYouMean, normalizeQuery } from '@/services/searchWrapper';
import { PopularMovie } from '@/lib/types';
import { saveSearch, getSearchHistory, SearchHistoryItem } from '@/lib/searchHistory';
import { useAuth } from '@/components/FirebaseProvider';
import { Clock, History, User } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { useMotionInterval } from '@/hooks/useMotionInterval';

const INDIAN_BOOST_KEYWORDS = [
    'animal', 'sairat', 'mirzapur', 'sacred games', 'dunki', '12th fail',
    'baipan bhari deva', 'salaar', 'jawan', 'pathaan', 'kgf', 'rrr', 'pushpa',
    'baahubali', 'dangal', 'pk', 'sholay', 'jio', 'hotstar', 'zee'
];

interface Props {
    placeholder?: string;
    autoFocus?: boolean;
    onSearch?: (q: string) => void;
    titleDataset?: { title: string; slug: string }[];
    animatedPlaceholders?: string[];
    externalQuery?: string;
    className?: string;
    isInline?: boolean;
    onQueryChange?: (query: string) => void;
    onSearchSubmit?: () => void;
}

const EMPTY_DATASET: { title: string; slug: string }[] = [];

export function EnterpriseSearchBar({
    placeholder = 'Search movies, genres...',
    onSearch,
    titleDataset = EMPTY_DATASET,
    animatedPlaceholders,
    externalQuery,
    className,
    isInline = false,
    onQueryChange,
    onSearchSubmit,
}: Props) {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PopularMovie[]>([]);
    const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [didYouMean, setDidYouMean] = useState<{ title: string; slug: string } | null>(null);
    const [selectedIdx, setSelectedIdx] = useState(-1);
    const [previewMovie, setPreviewMovie] = useState<PopularMovie | null>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { language, isIndia } = useLanguage();

    const translations = {
        en: {
            placeholder: placeholder,
            search: "Search",
            noResults: "No results found",
            tryDifferent: "Try a different spelling or movie name",
            recentSearches: "Recent Searches",
            signInSync: "Sign in to save your history",
            signIn: "Sign In",
            viewAll: "View all results for",
            didYouMean: "Did you mean:",
        },
        hi: {
            placeholder: placeholder === 'Search globally...' ? 'विश्व स्तर पर खोजें...' : 'अभिनेता, निर्देशक या शीर्षक खोजें...',
            search: "खोजें",
            noResults: "कोई परिणाम नहीं मिला",
            tryDifferent: "कोई अन्य स्पेलिंग या फिल्म का नाम आज़माएं",
            recentSearches: "हाल की खोजें",
            signInSync: "अपना इतिहास सहेजने के लिए साइन इन करें",
            signIn: "साइन इन करें",
            viewAll: "इसके सभी परिणाम देखें",
            didYouMean: "क्या आपका मतलब था:",
        },
        mr: {
            placeholder: placeholder === 'Search globally...' ? 'जागतिक स्तरावर शोधा...' : 'अभिनेता, दिग्दर्शक किंवा शीर्षक शोधा...',
            search: "शोधा",
            noResults: "कोणतेही परिणाम आढळले नाहीत",
            tryDifferent: "वेगळे स्पेलिंग किंवा चित्रपटाचे नाव वापरून पहा",
            recentSearches: "अलीकडील शोध",
            signInSync: "तुमचा इतिहास सेव्ह करण्यासाठी साइन इन करा",
            signIn: "साइन इन करा",
            viewAll: "यासाठी सर्व परिणाम पहा",
            didYouMean: "तुम्हाला म्हणायचे होते का:",
        }
    };
    const t = translations[language] || translations.en;

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── External Query Sync ───────────────────────────────────────────────────
    useEffect(() => {
        if (externalQuery) {
            setQuery(externalQuery);
            setShowDropdown(true);
            inputRef.current?.focus();
        }
    }, [externalQuery]);

    // ── Animated Placeholder Logic ────────────────────────────────────────────
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const hasPlaceholders = animatedPlaceholders && animatedPlaceholders.length > 0;

    useMotionInterval(() => {
        if (hasPlaceholders) {
            setPlaceholderIdx((prev) => (prev + 1) % animatedPlaceholders.length);
        }
    }, hasPlaceholders ? 2700 : null);

    // ── Search Effect ─────────────────────────────────────────────────────────
    useEffect(() => {
        async function loadHistory() {
            try {
                const history = await getSearchHistory(user);
                setSearchHistory(history.slice(0, 5));
            } catch (err) {
                console.error('Failed to load search history:', err);
            }
        }
        if (showDropdown && (!query || query.length < 2)) {
            loadHistory();
        }
    }, [user, showDropdown, query]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!query || query.length < 2) {
            if (results.length > 0) setResults([]);
            if (didYouMean !== null) setDidYouMean(null);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await searchMovies(query, 6);
                let sortedMovies = res.movies;

                if (isIndia && query.length < 5) {
                    // Only apply a gentle client-side boost for very short / vague queries
                    // The server (searchWrapper) already handles detailed relevance and regional boosts.
                    sortedMovies = [...res.movies].sort((a, b) => {
                        const aTitle = a.title.toLowerCase();
                        const bTitle = b.title.toLowerCase();
                        const aBoost = INDIAN_BOOST_KEYWORDS.some(k => aTitle.includes(k)) ? 1 : 0;
                        const bBoost = INDIAN_BOOST_KEYWORDS.some(k => bTitle.includes(k)) ? 1 : 0;

                        // We only override the default sort if there's a clear winner in the boost bucket
                        // AND their original popularity/rating is comparable, otherwise trust the server.
                        if (aBoost > bBoost && (b.popularity || 0) < 500) return -1;
                        if (bBoost > aBoost && (a.popularity || 0) < 500) return 1;
                        return 0; // retain original order
                    });
                }

                setResults(sortedMovies);
                setShowDropdown(true);
                setDidYouMean(getDidYouMean(query, titleDataset));
            } catch {
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 250);

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, titleDataset]);

    // ── Outside Click ─────────────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                dropdownRef.current?.contains(e.target as Node) ||
                inputRef.current?.contains(e.target as Node)
            ) return;
            setShowDropdown(false);
            setSelectedIdx(-1);
            setPreviewMovie(null);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Global Keyboard Shortcut (Focus on '/') ──────────────────────────────
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Ignore if the user is already inside an input or textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            if (e.key === '/') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;
        setShowDropdown(false);

        // Save history in the background asynchronously
        saveSearch(user, query.trim()).catch(console.error);

        if (onSearchSubmit) onSearchSubmit();

        if (onSearch) {
            onSearch(query.trim());
        } else {
            window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, onSearch, user]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (query.length >= 2 && selectedIdx >= 0 && results[selectedIdx]) {
                saveSearch(user, query.trim()).catch(console.error);
                if (onSearchSubmit) onSearchSubmit();
                window.location.href = `/movies/${results[selectedIdx].slug}`;
            } else {
                handleSearch();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!showDropdown) {
                setShowDropdown(true);
            } else {
                setSelectedIdx((p) => Math.min(p + 1, results.length - 1));
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIdx((p) => Math.max(p - 1, -1));
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
            setPreviewMovie(null);
            inputRef.current?.blur();
        }
    };

    return (
        <div className={cn('relative w-full', className)}>
            <div className="relative group">
                {/* Left icon / Loader */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none z-20">
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-[var(--saas-border)] border-t-[var(--saas-accent)] rounded-full animate-spin" />
                    ) : (
                        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-all duration-300" />
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setSelectedIdx(-1);
                        setShowDropdown(true);
                        if (onQueryChange) onQueryChange(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    onClick={() => setShowDropdown(true)}
                    placeholder={!animatedPlaceholders || animatedPlaceholders.length === 0 ? t.placeholder : ''}
                    className="w-full h-14 sm:h-16 pl-14 pr-32 bg-transparent text-[16px] sm:text-lg font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all relative z-10 touch-manipulation"
                    aria-label="Search movies"
                    aria-autocomplete="list"
                />

                {/* Animated Placeholder Overlay */}
                {!query && animatedPlaceholders && animatedPlaceholders.length > 0 && (
                    <div className="absolute inset-y-0 left-14 right-32 flex items-center pointer-events-none overflow-hidden z-0">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={placeholderIdx}
                                variants={fadeInOutBreathing}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="text-[16px] sm:text-base font-medium text-[var(--saas-text-muted)] truncate block w-full"
                            >
                                {animatedPlaceholders[placeholderIdx]}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                )}

                {/* Right actions */}
                <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2 z-20">
                    <AnimatePresence>
                        {query && (
                            <motion.button
                                key="clear"
                                {...fadeIn}
                                onClick={() => { setQuery(''); setResults([]); setShowDropdown(false); inputRef.current?.focus(); }}
                                className="p-1.5 rounded-md text-[var(--saas-text-muted)] hover:text-[var(--saas-text-primary)] hover:bg-[var(--saas-bg)] transition-colors"
                                aria-label="Clear search"
                            >
                                <X className="w-4 h-4" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={handleSearch}
                        disabled={!query.trim()}
                        className="btn-primary py-2.5 px-6 text-sm font-semibold h-auto disabled:opacity-50 disabled:cursor-not-allowed hidden sm:flex active:scale-95 transition-all shadow-sm hover:shadow-md"
                        aria-label="Search"
                    >
                        {t.search}
                    </button>
                </div>
            </div>

            {/* Did You Mean */}
            <AnimatePresence>
                {didYouMean && (
                    <motion.div
                        key="dym"
                        variants={slideDown}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="mt-2.5 flex items-center gap-2 px-1"
                    >
                        <span className="text-[13px] text-[var(--saas-text-muted)] flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {t.didYouMean}
                        </span>
                        <Link href={`/movies/${didYouMean.slug}`} className="dym-pill font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            {didYouMean.title}
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dropdown */}
            <AnimatePresence>
                {showDropdown && (query.length >= 2 || searchHistory.length > 0) && (
                    <motion.div
                        ref={dropdownRef}
                        key="dropdown"
                        variants={slideDown}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(
                            "w-full mt-3 bg-white/95 backdrop-blur-xl rounded-2xl border border-[var(--saas-border)] shadow-2xl shadow-[var(--saas-accent)]/10 overflow-hidden",
                            isInline ? "relative z-30" : "absolute z-50 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--saas-border)] scrollbar-track-transparent"
                        )}
                        style={isInline ? undefined : { top: '100%' }}
                    >
                        {query.length >= 2 ? (
                            isLoading ? (
                                <div className="py-4 px-4 space-y-4">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex gap-4 animate-pulse">
                                            <div className="w-10 h-14 bg-[var(--saas-border-light)] rounded-lg flex-shrink-0" />
                                            <div className="flex-1 space-y-2 py-1.5">
                                                <div className="h-3.5 bg-[var(--saas-border-light)] rounded w-2/3" />
                                                <div className="h-2.5 bg-[var(--saas-border-light)] rounded w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : results.length > 0 ? (
                                <div className="py-2">
                                    {results.map((movie, idx) => {
                                        const isPrimary = idx === 0 && results.length > 1;

                                        return (
                                            <Link
                                                key={movie.id}
                                                href={`/movies/${movie.slug}`}
                                                className={cn(
                                                    'flex items-center gap-4 px-4 transition-colors duration-200 relative touch-manipulation',
                                                    isPrimary ? 'py-4 from-[var(--saas-accent)]/5 to-transparent bg-gradient-to-r lg:hover:from-[var(--saas-accent)]/10 active:from-[var(--saas-accent)]/15' : 'py-3 max-md:py-3.5 lg:hover:bg-[var(--saas-bg)] active:bg-[var(--saas-bg)]',
                                                    selectedIdx === idx ? 'bg-[var(--saas-accent)]/5 shadow-inner' : ''
                                                )}
                                                onClick={() => {
                                                    saveSearch(user, query.trim()).catch(console.error);
                                                    setShowDropdown(false);
                                                    setPreviewMovie(null);
                                                }}
                                                onMouseEnter={() => {
                                                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                                                    hoverTimeoutRef.current = setTimeout(() => {
                                                        setPreviewMovie(movie);
                                                    }, 150);
                                                }}
                                                onMouseLeave={() => {
                                                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                                                    hoverTimeoutRef.current = setTimeout(() => {
                                                        setPreviewMovie(null);
                                                    }, 150);
                                                }}
                                            >
                                                <div className={cn(
                                                    "rounded-lg flex-shrink-0 bg-[var(--saas-border-light)] border border-[var(--saas-border)] overflow-hidden relative shadow-sm transition-all duration-300",
                                                    isPrimary ? "w-14 h-20 shadow-md" : "w-10 h-14"
                                                )}>
                                                    <SafeImage
                                                        src={movie.posterPath}
                                                        alt={movie.title}
                                                        fill
                                                        sizes={isPrimary ? "56px" : "40px"}
                                                        className="object-cover"
                                                        unoptimized
                                                        fallbackClassName="bg-gray-50"
                                                        fallback={<Film className="w-4 h-4 text-[var(--saas-text-muted)]" />}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <p
                                                        className={cn(
                                                            "font-bold text-[var(--saas-text-primary)] truncate transition-all duration-300",
                                                            isPrimary ? "text-[17px] sm:text-[18px] mb-0.5 tracking-tight" : "text-[15px]"
                                                        )}
                                                        dangerouslySetInnerHTML={{ __html: highlightMatch(movie.title, query) }}
                                                    />
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn(
                                                            "bg-[var(--saas-border-light)] text-[var(--saas-text-secondary)] rounded uppercase font-bold tracking-wider",
                                                            isPrimary ? "px-2 py-0.5 text-[11px]" : "px-1.5 py-0.5 text-[10px]"
                                                        )}>
                                                            {movie.releaseDate?.slice(0, 4) || 'TBA'}
                                                        </span>
                                                        <span className={cn(
                                                            "flex items-center gap-1 text-amber-500 font-bold",
                                                            isPrimary ? "text-[12px]" : "text-[11px]"
                                                        )}>
                                                            <Sparkles className="w-3 h-3" /> {movie.rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center bg-gray-50/50">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-[var(--saas-border-light)]">
                                        <Film className="w-5 h-5 text-[var(--saas-text-muted)] opacity-60" />
                                    </div>
                                    <p className="text-sm font-bold text-[var(--saas-text-primary)]">{t.noResults}</p>
                                    <p className="text-xs text-[var(--saas-text-muted)] mt-1">{t.tryDifferent}</p>
                                </div>
                            )
                        ) : searchHistory.length > 0 ? (
                            <div>
                                <div className="px-4 py-2 border-b border-[var(--saas-border-light)] bg-slate-50/50 flex items-center justify-between">
                                    <div className="flex items-center text-[11px] font-bold text-[var(--saas-text-muted)] uppercase tracking-wider">
                                        <History className="w-3.5 h-3.5 mr-1.5" />
                                        {t.recentSearches}
                                    </div>
                                </div>
                                <div className="py-1">
                                    {searchHistory.map((item, idx) => (
                                        <button
                                            key={`${item.query}-${idx}`}
                                            onClick={() => {
                                                setQuery(item.query);
                                                handleSearch();
                                            }}
                                            className="w-full text-left px-4 py-3 max-md:py-3.5 lg:hover:bg-[var(--saas-bg)] active:bg-[var(--saas-bg)] flex items-center gap-3 transition-colors touch-manipulation"
                                        >
                                            <Clock className="w-4 h-4 text-[var(--saas-text-muted)]" />
                                            <span className="text-sm font-semibold text-[var(--saas-text-primary)]">{item.query}</span>
                                        </button>
                                    ))}
                                </div>
                                {!user && (
                                    <div className="bg-blue-50/30 border-t border-[var(--saas-border-light)] p-3 flex items-center justify-between">
                                        <div className="text-xs font-semibold text-[var(--saas-text-secondary)]">
                                            {t.signInSync}
                                        </div>
                                        <Link href="/login" className="btn-secondary h-8 px-3 text-xs flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            {t.signIn}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {query.length >= 2 && (
                            <div className="bg-gray-50/80 backdrop-blur-md border-t border-[var(--saas-border-light)] p-2">
                                <button
                                    onClick={handleSearch}
                                    className="w-full px-4 py-2.5 text-sm font-bold text-[var(--saas-accent)] hover:text-white hover:bg-[var(--saas-accent)] rounded-xl transition-all duration-300 text-center flex items-center justify-center gap-2 group"
                                >
                                    {t.viewAll} &quot;{query}&quot;
                                    <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop-Only Floating Poster Preview */}
            <AnimatePresence>
                {showDropdown && previewMovie && (
                    <motion.div
                        key="desktop-hover-preview"
                        initial={{ opacity: 0, scale: 0.96, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.98, x: -5 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="hidden lg:block absolute top-[110%] mt-2 left-[102%] w-[220px] 
                                   aspect-[2/3] z-50 rounded-2xl overflow-hidden border border-[var(--saas-border)] 
                                   shadow-2xl shadow-black/20 bg-[var(--saas-bg)] pointer-events-none"
                    >
                        <SafeImage
                            src={previewMovie.posterPath}
                            alt={previewMovie.title}
                            fill
                            sizes="220px"
                            className="object-cover"
                            unoptimized
                            fallbackClassName="bg-gray-50"
                            fallback={<Film className="w-10 h-10 text-[var(--saas-text-muted)] opacity-50" />}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-white font-bold text-sm tracking-tight line-clamp-2 drop-shadow-md">
                                {previewMovie.title}
                            </p>
                            <p className="text-white/80 text-[11px] font-semibold mt-0.5 flex items-center gap-2">
                                <span>{previewMovie.releaseDate?.slice(0, 4) || 'TBA'}</span>
                                <span className="flex items-center gap-1 text-amber-400">
                                    <Sparkles className="w-3 h-3" /> {previewMovie.rating.toFixed(1)}
                                </span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Highlight matching substring
function highlightMatch(title: string, query: string): string {
    const norm = normalizeQuery(query);
    const idx = title.toLowerCase().indexOf(norm);
    if (idx < 0) return title;
    return (
        title.slice(0, idx) +
        `<strong class="text-[var(--saas-accent)] bg-[var(--saas-accent)]/10 px-0.5 rounded-sm font-bold">${title.slice(idx, idx + norm.length)}</strong>` +
        title.slice(idx + norm.length)
    );
}
