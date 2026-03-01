'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

const GLOW_PROFILE_KEY = 'sw_glow_profile';
const CURRENT_VERSION = '1.0.0';
const INACTIVITY_RESET_DAYS = 30;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

interface GlowProfile {
    glowProfileVersion: string;
    visitCount: number;
    searchCount: number;
    scrollWithoutSearchCount: number;
    lastInteractionType: 'visit' | 'search' | 'scroll' | 'type_delete' | null;
    lastVisitTimestamp: number;
    behavioralWeight: number; // 0 is neutral, positive means more presence, negative means less
}

const DEFAULT_PROFILE: GlowProfile = {
    glowProfileVersion: CURRENT_VERSION,
    visitCount: 0,
    searchCount: 0,
    scrollWithoutSearchCount: 0,
    lastInteractionType: null,
    lastVisitTimestamp: Date.now(),
    behavioralWeight: 0,
};

interface GlowStyles {
    '--ig-opacity': string;
    '--ig-spread': string;
    '--ig-warmth': string;
    '--ig-clarity': string;
}

export function useIntelligentGlow() {
    const [styles, setStyles] = useState<GlowStyles>({
        '--ig-opacity': '0.15',
        '--ig-spread': '20px',
        '--ig-warmth': '0',
        '--ig-clarity': '1',
    });

    const profileRef = useRef<GlowProfile>(DEFAULT_PROFILE);
    const hasInitialized = useRef(false);
    const microShiftTimer = useRef<NodeJS.Timeout | null>(null);

    // Default basic glow safely incase localStorage fails
    const safeSave = useCallback((newProfile: GlowProfile) => {
        try {
            profileRef.current = newProfile;
            localStorage.setItem(GLOW_PROFILE_KEY, JSON.stringify(newProfile));
        } catch (e) {
            // Fail safely (e.g. incognito mode quota exceeded)
            console.warn('Glow engine could not save memory:', e);
        }
    }, []);

    const safeLoad = useCallback((): GlowProfile => {
        try {
            const data = localStorage.getItem(GLOW_PROFILE_KEY);
            if (!data) return { ...DEFAULT_PROFILE, lastVisitTimestamp: Date.now() };

            const parsed = JSON.parse(data) as Partial<GlowProfile>;

            // Version validation & corruption check
            if (
                parsed.glowProfileVersion !== CURRENT_VERSION ||
                typeof parsed.visitCount !== 'number'
            ) {
                return { ...DEFAULT_PROFILE, lastVisitTimestamp: Date.now() };
            }

            // Inactivity Reset Check
            const now = Date.now();
            const daysInactive = (now - (parsed.lastVisitTimestamp || now)) / MS_PER_DAY;
            if (daysInactive >= INACTIVITY_RESET_DAYS) {
                return { ...DEFAULT_PROFILE, lastVisitTimestamp: now };
            }

            return parsed as GlowProfile;
        } catch (e) {
            return { ...DEFAULT_PROFILE, lastVisitTimestamp: Date.now() };
        }
    }, []);

    // ── Initialization & Decay Logic ─────────────────────────────────────────────
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const profile = safeLoad();

        // Soft Decay: Neutralize weight by 15% each visit
        let newWeight = profile.behavioralWeight * 0.85;

        // Apply context-aware nudges based on previous session's state
        let nextWarmth = '0';
        if (profile.lastInteractionType === 'type_delete') {
            nextWarmth = '1'; // Warmer tone flags for the first 10 seconds
            setTimeout(() => {
                setStyles(prev => ({ ...prev, '--ig-warmth': '0' }));
            }, 10000);
        }

        profile.visitCount += 1;
        profile.behavioralWeight = newWeight;
        profile.lastVisitTimestamp = Date.now();
        profile.lastInteractionType = 'visit';

        safeSave(profile);

        // Calculate initial styles based on memory
        // Repeated visits without search -> slight baseline clarity increase (max 8%)
        let clarityBase = 1.0;
        if (profile.visitCount > 3 && profile.searchCount === 0) {
            clarityBase = Math.min(1.08, 1.0 + (profile.visitCount * 0.01));
        }

        // Frequent searches -> slightly reduce glow presence
        let opacityBase = 0.15;
        if (profile.searchCount > profile.visitCount * 0.5) {
            opacityBase = Math.max(0.08, 0.15 - (profile.searchCount * 0.005));
        }

        setStyles(prev => ({
            ...prev,
            '--ig-opacity': opacityBase.toFixed(3),
            '--ig-clarity': clarityBase.toFixed(3),
            '--ig-warmth': nextWarmth,
        }));

    }, [safeLoad, safeSave]);

    // ── Rare Ambient Swell Layer ─────────────────────────────────────────────────
    useEffect(() => {
        const scheduleNextSwell = () => {
            // Random delay between 2 and 4 minutes (120,000 to 240,000 ms)
            const nextDelay = Math.random() * (240000 - 120000) + 120000;

            microShiftTimer.current = setTimeout(() => {
                // Check if document is visible to pause animations when tab inactive
                if (document.visibilityState === 'visible') {
                    // Trigger a very subtle presence swell
                    setStyles(prev => ({ ...prev, '--ig-swell': '1' }));

                    // The swell peaks slowly and fades out. Let it hold for a few seconds.
                    setTimeout(() => {
                        setStyles(prev => ({ ...prev, '--ig-swell': '0' }));
                    }, 4000);
                }
                scheduleNextSwell();
            }, nextDelay);
        };

        scheduleNextSwell();

        return () => {
            if (microShiftTimer.current) clearTimeout(microShiftTimer.current);
        };
    }, []);

    // ── Event Trackers (Exported to Component) ───────────────────────────────────

    const trackSearch = useCallback(() => {
        const profile = profileRef.current;
        profile.searchCount += 1;
        profile.lastInteractionType = 'search';
        // Searching implies lower need for prominent glow
        profile.behavioralWeight = Math.max(-5, profile.behavioralWeight - 0.5);
        safeSave(profile);
    }, [safeSave]);

    const trackTypeDelete = useCallback(() => {
        const profile = profileRef.current;
        profile.lastInteractionType = 'type_delete';
        safeSave(profile);
    }, [safeSave]);

    const trackScrollPastHero = useCallback(() => {
        const profile = profileRef.current;
        profile.scrollWithoutSearchCount += 1;
        profile.lastInteractionType = 'scroll';
        safeSave(profile);
    }, [safeSave]);

    const triggerScrollBackNudge = useCallback(() => {
        // Slightly sharpen glow for one atmospheric phase
        setStyles(prev => ({ ...prev, '--ig-clarity': '1.15' }));
        setTimeout(() => {
            setStyles(prev => ({ ...prev, '--ig-clarity': '1.0' }));
        }, 15000); // Wait ~15 seconds to revert gradually
    }, []);

    return {
        glowStyles: styles as React.CSSProperties,
        trackSearch,
        trackTypeDelete,
        trackScrollPastHero,
        triggerScrollBackNudge
    };
}
