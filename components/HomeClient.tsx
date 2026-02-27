'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Github, User } from 'lucide-react';
import Link from 'next/link';
import { PopularMovie } from '@/lib/types';
import { EnterpriseSearchBar } from '@/components/EnterpriseSearchBar';
import { fadeUp, staggerContainer } from '@/lib/motion';
import { useLanguage } from '@/components/LanguageProvider';

interface Props {
    trending: PopularMovie[];
    popular: PopularMovie[];
    upcoming: PopularMovie[];
}

export function HomeClient({ trending, popular, upcoming }: Props) {
    const [trendingQuery, setTrendingQuery] = useState('');
    const { language, isIndia } = useLanguage();

    const allTitles = [...trending, ...popular].map((m) => ({
        title: m.title,
        slug: m.slug,
    }));

    // ── Dynamic Data Generation from Live TMDB Payload ──
    const indianBoostKeywords = ['animal', 'sairat', 'mirzapur', 'sacred games', 'dunki', '12th fail', 'baipan', 'salaar', 'jawan', 'pathaan', 'kgf', 'rrr', 'pushpa', 'baahubali', 'dangal', 'sholay', 'jio', 'hotstar', 'zee'];

    // Extract top 6 real trending global titles instantly
    const globalTrending = trending.slice(0, 6).map(m => m.title);

    // Intersect popular/trending feed with Indian relevance to surface actual live Indian titles
    const liveIndianTrending = [...trending, ...popular]
        .filter(m => indianBoostKeywords.some(k => m.title.toLowerCase().includes(k)))
        .map(m => m.title);

    // Combine unique titles, prioritizing Indian hits for India view
    const allTrendingIndia = Array.from(new Set([...liveIndianTrending, ...globalTrending])).slice(0, 6);

    const trendingTags = isIndia ? allTrendingIndia : globalTrending;

    const placeholders = {
        india: {
            en: trendingTags.map(tag => `Try "${tag}"`),
            hi: trendingTags.map(tag => `"${tag}" खोजें`),
            mr: trendingTags.map(tag => `"${tag}" शोधा`)
        },
        global: {
            en: globalTrending.map(tag => `Try "${tag}"`),
            hi: globalTrending.map(tag => `"${tag}" खोजें`),
            mr: globalTrending.map(tag => `"${tag}" शोधा`)
        }
    };

    const currentPlaceholders = isIndia ? placeholders.india[language] : placeholders.global[language];

    // Dynamic OTT Platforms
    const OTT_PLATFORMS = isIndia
        ? ['Netflix', 'Amazon Prime', 'Disney+ Hotstar', 'JioCinema', 'Zee5', 'Sony LIV']
        : ['Netflix', 'Amazon Prime', 'Disney+', 'Max', 'Hulu', 'Apple TV+'];

    const translations = {
        en: {
            headlineParts: ['Find where any movie or series is', 'streaming'],
            subtext: "Search any title and instantly see where it’s available to stream legally.",
            trendingIndia: "Trending in India:",
            trendingGlobal: "Trending:",
            showingLocation: "📍 Showing streaming availability in India",
        },
        hi: {
            headlineParts: ['खोजें कि कोई भी फिल्म या सीरीज़ कहां', 'स्ट्रीम हो रही है'],
            subtext: "किसी भी टाइटल को खोजें और तुरंत देखें कि वह कानूनी रूप से कहां उपलब्ध है।",
            trendingIndia: "भारत में ट्रेंडिंग:",
            trendingGlobal: "ट्रेंडिंग:",
            showingLocation: "📍 भारत में स्ट्रीमिंग उपलब्धता दिखा रहा है",
        },
        mr: {
            headlineParts: ['कोणताही चित्रपट किंवा सिरीज कुठे', 'स्ट्रीम होत आहे ते पहा'],
            subtext: "कोणतेही शीर्षक शोधा आणि ते कायदेशीररित्या कुठे पाहता येईल ते त्वरित पहा.",
            trendingIndia: "भारतात ट्रेंडिंग:",
            trendingGlobal: "ट्रेंडिंग:",
            showingLocation: "📍 भारतातील स्ट्रीमिंग उपलब्धता दाखवत आहे",
        }
    };

    const t = translations[language] || translations.en;

    return (
        <div className="flex-1 flex flex-col w-full relative">
            <main className="flex-1 flex flex-col items-center justify-center relative w-full pt-12 sm:pt-16 pb-8 px-4 sm:px-6 lg:px-8">
                {/* Minimal Background Grid */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div
                        className="absolute inset-0 opacity-[0.02]"
                        style={{ backgroundImage: 'radial-gradient(var(--saas-text-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/95" />
                </div>

                <div className="w-full max-w-4xl mx-auto relative z-10 text-center -mt-8 sm:-mt-16">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                    >
                        <div className="space-y-3 sm:space-y-4">
                            <motion.h1
                                variants={fadeUp}
                                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--saas-text-primary)] leading-[1.1] tracking-tight"
                            >
                                {t.headlineParts[0]} <span className="text-[var(--saas-accent)]">{t.headlineParts[1]}</span>
                            </motion.h1>

                            <motion.p
                                variants={fadeUp}
                                className="text-lg sm:text-xl text-[var(--saas-text-secondary)] leading-relaxed max-w-2xl mx-auto"
                            >
                                {t.subtext}
                            </motion.p>

                            {!isIndia && (
                                <motion.div variants={fadeUp} className="inline-block mt-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-medium rounded-full">
                                    {t.showingLocation}
                                </motion.div>
                            )}
                        </div>

                        {/* Search Focus */}
                        <motion.div variants={fadeUp} className="pt-4 sm:pt-6 max-w-2xl mx-auto w-full relative z-[60]">
                            <div className="p-1 sm:p-1.5 bg-white rounded-2xl sm:rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] border border-[var(--saas-border)] focus-within:ring-4 focus-within:ring-[var(--saas-accent)]/15 focus-within:border-[var(--saas-accent)]/40 transition-all duration-300 transform-gpu focus-within:scale-[1.02] relative z-[60]">
                                <EnterpriseSearchBar
                                    autoFocus
                                    titleDataset={allTitles}
                                    animatedPlaceholders={currentPlaceholders}
                                    externalQuery={trendingQuery}
                                    isInline={true}
                                />
                            </div>

                            {/* Trending Tags */}
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 relative z-10">
                                <span className="text-xs sm:text-sm font-semibold text-[var(--saas-text-muted)] mr-1">
                                    {isIndia ? t.trendingIndia : t.trendingGlobal}
                                </span>
                                {trendingTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => setTrendingQuery(tag)}
                                        className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-[var(--saas-text-secondary)] bg-[var(--saas-bg)] border border-[var(--saas-border-light)] hover:border-[var(--saas-border)] hover:bg-[var(--saas-accent-light)] hover:text-[var(--saas-accent)] hover:shadow-sm rounded-full transition-all"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            {/* Top OTT Platforms Row */}
                            <div className="mt-10 flex flex-col items-center gap-2.5 opacity-80 transition-opacity hover:opacity-100 relative z-10">
                                <span className="text-[10px] sm:text-xs font-bold text-[var(--saas-text-muted)] uppercase tracking-widest">
                                    {isIndia ? 'Top Platforms in India' : 'Top Streaming Platforms'}
                                </span>
                                <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold text-[var(--saas-text-secondary)]">
                                    {OTT_PLATFORMS.map((platform, idx) => (
                                        <div key={platform} className="flex items-center gap-3 sm:gap-4">
                                            <span>{platform}</span>
                                            {idx < OTT_PLATFORMS.length - 1 && (
                                                <span className="w-1 h-1 rounded-full bg-[var(--saas-border-dark)]" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </main>

            {/* ── Minimal Footer ───────────────────────────────────────────── */}
            <footer className="w-full bg-transparent py-6 border-t border-[var(--saas-border-light)]" >
                <div className="w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 items-center text-xs sm:text-sm text-[var(--saas-text-muted)]">

                    {/* Left: Logo */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 font-medium text-[var(--saas-text-secondary)]">
                        <span className="w-5 h-5 rounded bg-[var(--saas-accent)] flex items-center justify-center text-white">
                            <Film className="w-3 h-3" />
                        </span>
                        StreamWhere
                    </div>

                    {/* Center: Neon Social Icons */}
                    <div className="flex items-center justify-center gap-6">
                        <a
                            href="https://gauravpatil.online"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center justify-center p-1"
                            aria-label="Portfolio"
                        >
                            <div className="absolute inset-0 bg-[var(--saas-accent)] opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300 rounded-full" />
                            <User className="w-4 h-4 text-[var(--saas-text-muted)] group-hover:text-[var(--saas-accent)] transition-colors duration-300 relative z-10" />
                        </a>
                        <a
                            href="https://github.com/AspiringWebGaurav"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center justify-center p-1"
                            aria-label="GitHub"
                        >
                            <div className="absolute inset-0 bg-[#333] opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300 rounded-full" />
                            <Github className="w-4 h-4 text-[var(--saas-text-muted)] group-hover:text-[var(--saas-text-primary)] transition-colors duration-300 relative z-10" />
                        </a>
                    </div>

                    {/* Right: Text Links */}
                    <div className="flex items-center justify-center sm:justify-end gap-5 font-medium">
                        <Link href="/search" className="hover:text-[var(--saas-accent)] transition-colors">Search</Link>
                        <Link href="/about" className="hover:text-[var(--saas-accent)] transition-colors">About</Link>
                        <Link href="/privacy" className="hover:text-[var(--saas-accent)] transition-colors hidden sm:block">Privacy</Link>
                        <Link href="/terms" className="hover:text-[var(--saas-accent)] transition-colors hidden sm:block">Terms</Link>
                    </div>

                </div>
            </footer >
        </div >
    );
}
