'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// SignInTooltip — Intelligent, probability-weighted sign-in nudge
// • Zero Firebase operations — localStorage + sessionStorage only
// • No polling, no timers, no intervals
// • Probability-based triggers on search activity events
// ═══════════════════════════════════════════════════════════════════════════════

const COOLDOWN_KEY = 'sw_tooltip_cooldown';
const DISMISSED_KEY = 'sw_tooltip_dismissed';
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const AUTO_HIDE_MS = 7000;
const FADE_MS = 300;

// ── Copy variants ────────────────────────────────────────────────────────────

const INCOGNITO_MESSAGES = [
    'Your searches won\u2019t be saved in private mode. Sign in to keep them.',
    'Private session detected \u2014 sign in to save your history.',
    'Searches are temporary here. Sign in to keep them across devices.',
];

const DEFAULT_MESSAGES = [
    'Sign in to save your search history across sessions.',
    'Keep your searches \u2014 sign in to sync across devices.',
    'Your search history will be lost. Sign in to save it.',
];

interface Props {
    searchCount: number;
}

// ── Incognito detection (best-effort, non-blocking) ──────────────────────────

async function detectIncognito(): Promise<boolean> {
    try {
        const est = await navigator.storage?.estimate?.();
        if (est?.quota && est.quota < 200_000_000) return true;
    } catch { /* non-fatal */ }
    return false;
}

// ── Probability engine ───────────────────────────────────────────────────────

function shouldTrigger(searchCount: number, isIncognito: boolean): boolean {
    let probability = 0;

    if (searchCount >= 8) probability = 0.50;
    else if (searchCount >= 5) probability = 0.35;
    else if (searchCount >= 3) probability = 0.20;
    else return false; // Below threshold — never trigger

    if (isIncognito) probability = Math.min(probability + 0.15, 0.85);

    return Math.random() < probability;
}

// ── Cooldown checks ──────────────────────────────────────────────────────────

function isCooldownActive(): boolean {
    try {
        // Session-level suppression
        if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(DISMISSED_KEY)) {
            return true;
        }
        // Cross-session cooldown
        if (typeof localStorage !== 'undefined') {
            const cooldownUntil = localStorage.getItem(COOLDOWN_KEY);
            if (cooldownUntil && Date.now() < parseInt(cooldownUntil, 10)) {
                return true;
            }
        }
    } catch { /* storage unavailable */ }
    return false;
}

function setCooldown(): void {
    try {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(DISMISSED_KEY, '1');
        }
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS));
        }
    } catch { /* storage unavailable */ }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

export function SignInTooltip({ searchCount }: Props) {
    const [visible, setVisible] = useState(false);
    const [fading, setFading] = useState(false);
    const [message, setMessage] = useState('');
    const isIncognitoRef = useRef(false);
    const hasTriggeredRef = useRef(false);
    const autoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prevSearchCountRef = useRef(searchCount);

    // Run incognito detection once on mount
    useEffect(() => {
        detectIncognito().then(result => {
            isIncognitoRef.current = result;
        });
    }, []);

    // Evaluate on searchCount changes (the trigger event)
    useEffect(() => {
        // Skip if: already triggered, already visible, cooldown active, or count didn't change meaningfully
        if (hasTriggeredRef.current || visible) return;
        if (searchCount <= prevSearchCountRef.current && searchCount < 3) return;
        prevSearchCountRef.current = searchCount;

        if (isCooldownActive()) return;
        if (!shouldTrigger(searchCount, isIncognitoRef.current)) return;

        // Trigger!
        hasTriggeredRef.current = true;

        const pool = isIncognitoRef.current ? INCOGNITO_MESSAGES : DEFAULT_MESSAGES;
        setMessage(pool[Math.floor(Math.random() * pool.length)]);
        setVisible(true);
        setFading(false);

        // Auto-hide after 7s
        autoHideTimerRef.current = setTimeout(() => {
            dismiss();
        }, AUTO_HIDE_MS);

        return () => {
            if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchCount]);

    const dismiss = useCallback(() => {
        setFading(true);
        setCooldown();
        setTimeout(() => {
            setVisible(false);
            setFading(false);
        }, FADE_MS);

        if (autoHideTimerRef.current) {
            clearTimeout(autoHideTimerRef.current);
            autoHideTimerRef.current = null;
        }
    }, []);

    // Click outside handler
    useEffect(() => {
        if (!visible || fading) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-signin-tooltip]')) {
                dismiss();
            }
        };

        // Delay to avoid catching the same click that might have triggered something
        const timer = setTimeout(() => {
            document.addEventListener('click', handleClickOutside, true);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [visible, fading, dismiss]);

    if (!visible) return null;

    return (
        <div
            data-signin-tooltip
            className="hidden md:block"
            style={{
                position: 'absolute',
                top: 'calc(100% + 14px)',
                right: 0,
                zIndex: 50,
                pointerEvents: fading ? 'none' : 'auto',
            }}
        >
            {/* Arrow */}
            <div
                style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '24px',
                    width: '12px',
                    height: '12px',
                    background: 'var(--cinema-surface)',
                    border: '1px solid var(--cinema-border)',
                    borderRight: 'none',
                    borderBottom: 'none',
                    transform: 'rotate(45deg)',
                    zIndex: 1,
                    opacity: fading ? 0 : 1,
                    transition: `opacity ${FADE_MS}ms ease-out`,
                }}
            />

            {/* Tooltip body */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 2,
                    background: 'var(--cinema-surface-glass)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid var(--cinema-border)',
                    borderRadius: 'var(--cinema-radius)',
                    boxShadow: 'var(--cinema-shadow-md)',
                    padding: '12px 16px',
                    maxWidth: '300px',
                    width: 'max-content',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    opacity: fading ? 0 : 1,
                    transform: fading ? 'translateY(4px)' : 'translateY(0)',
                    transition: `opacity ${FADE_MS}ms ease-out, transform ${FADE_MS}ms ease-out`,
                    animation: 'tooltipFadeIn 300ms ease-out',
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontSize: 'var(--cinema-text-xs)',
                        lineHeight: 1.5,
                        color: 'var(--cinema-text-secondary)',
                        fontWeight: 500,
                        flex: 1,
                    }}
                >
                    {message}
                </p>
                <button
                    onClick={dismiss}
                    aria-label="Dismiss"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        color: 'var(--cinema-text-muted)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        transition: `color 150ms ease`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cinema-text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cinema-text-muted)')}
                >
                    <X size={14} />
                </button>
            </div>

            {/* Keyframe injection — only once */}
            <style>{`
                @keyframes tooltipFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(6px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
