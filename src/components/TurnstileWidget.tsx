'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useCaptcha } from './CaptchaProvider';

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                options: TurnstileRenderParams
            ) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
        onTurnstileLoad?: () => void;
    }
}

interface TurnstileRenderParams {
    sitekey: string;
    callback: (token: string) => void;
    'error-callback'?: () => void;
    'expired-callback'?: () => void;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact' | 'invisible';
    appearance?: 'always' | 'execute' | 'interaction-only';
}

interface TurnstileWidgetProps {
    onSuccess?: () => void;
    onError?: () => void;
}

export function TurnstileWidget({ onSuccess, onError }: TurnstileWidgetProps) {
    const { isVerified, verify, showChallenge, setShowChallenge, isLoading } = useCaptcha();
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const scriptLoadedRef = useRef(false);
    const invisibleAttemptedRef = useRef(false);

    const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

    const handleToken = useCallback(async (token: string) => {
        const success = await verify(token);
        if (success) {
            onSuccess?.();
        } else {
            onError?.();
        }
    }, [verify, onSuccess, onError]);

    const handleError = useCallback(() => {
        console.warn('Turnstile error, showing checkbox challenge');
        setShowChallenge(true);
        onError?.();
    }, [setShowChallenge, onError]);

    // Load Turnstile script
    useEffect(() => {
        if (isVerified || scriptLoadedRef.current) return;
        if (!siteKey) {
            console.warn('Turnstile site key not configured');
            return;
        }

        const existingScript = document.querySelector('script[src*="turnstile"]');
        if (existingScript) {
            scriptLoadedRef.current = true;
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;

        script.onload = () => {
            scriptLoadedRef.current = true;
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup widget on unmount
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch {
                    // Ignore cleanup errors
                }
            }
        };
    }, [isVerified, siteKey]);

    // Render invisible widget first
    useEffect(() => {
        if (isVerified || !siteKey || invisibleAttemptedRef.current) return;

        const attemptInvisible = () => {
            if (!window.turnstile || invisibleAttemptedRef.current) return;

            invisibleAttemptedRef.current = true;

            // Create temporary container for invisible widget
            const tempContainer = document.createElement('div');
            tempContainer.style.display = 'none';
            document.body.appendChild(tempContainer);

            try {
                window.turnstile.render(tempContainer, {
                    sitekey: siteKey,
                    size: 'invisible',
                    callback: handleToken,
                    'error-callback': handleError,
                    'expired-callback': handleError,
                });
            } catch (error) {
                console.warn('Invisible Turnstile failed:', error);
                setShowChallenge(true);
            }
        };

        // Wait for script to load
        const checkInterval = setInterval(() => {
            if (window.turnstile) {
                clearInterval(checkInterval);
                attemptInvisible();
            }
        }, 100);

        // Timeout after 5 seconds
        const timeout = setTimeout(() => {
            clearInterval(checkInterval);
            if (!isVerified && !invisibleAttemptedRef.current) {
                setShowChallenge(true);
            }
        }, 5000);

        return () => {
            clearInterval(checkInterval);
            clearTimeout(timeout);
        };
    }, [isVerified, siteKey, handleToken, handleError, setShowChallenge]);

    // Render visible checkbox when needed
    useEffect(() => {
        if (isVerified || !showChallenge || !containerRef.current || !siteKey) return;

        const renderCheckbox = () => {
            if (!window.turnstile || !containerRef.current) return;

            // Clear previous widget
            if (widgetIdRef.current) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch {
                    // Ignore
                }
            }

            try {
                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    size: 'normal',
                    theme: 'dark',
                    callback: handleToken,
                    'error-callback': handleError,
                    'expired-callback': handleError,
                });
            } catch (error) {
                console.error('Turnstile render error:', error);
            }
        };

        const checkInterval = setInterval(() => {
            if (window.turnstile) {
                clearInterval(checkInterval);
                renderCheckbox();
            }
        }, 100);

        return () => clearInterval(checkInterval);
    }, [isVerified, showChallenge, siteKey, handleToken, handleError]);

    // Don't render anything if verified or no site key
    if (isVerified || !siteKey) return null;

    // Show checkbox challenge
    if (showChallenge) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="glass-cinema-primary rounded-2xl p-8 max-w-md mx-4 text-center">
                    <h2 className="text-xl font-bold text-white mb-4">
                        Security Verification
                    </h2>
                    <p className="text-gray-300 mb-6">
                        Please complete the verification below to continue.
                    </p>
                    <div
                        ref={containerRef}
                        className="flex justify-center min-h-[65px]"
                    />
                    {isLoading && (
                        <p className="text-sm text-gray-400 mt-4">Verifying...</p>
                    )}
                </div>
            </div>
        );
    }

    // Invisible widget renders via JS, no visible UI needed
    return null;
}
