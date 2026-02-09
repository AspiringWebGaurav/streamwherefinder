'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

interface CaptchaContextType {
    isVerified: boolean;
    isLoading: boolean;
    error: string | null;
    verify: (token: string) => Promise<boolean>;
    showChallenge: boolean;
    setShowChallenge: (show: boolean) => void;
}

const CaptchaContext = createContext<CaptchaContextType | undefined>(undefined);

const CAPTCHA_VERIFIED_KEY = 'captcha_verified';
const CAPTCHA_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function CaptchaProvider({ children }: { children: React.ReactNode }) {
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showChallenge, setShowChallenge] = useState(false);
    const verificationAttempted = useRef(false);

    // Check for existing verification on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem(CAPTCHA_VERIFIED_KEY);
            if (stored) {
                const { timestamp } = JSON.parse(stored);
                if (Date.now() - timestamp < CAPTCHA_EXPIRY_MS) {
                    setIsVerified(true);
                    setIsLoading(false);
                    return;
                }
                localStorage.removeItem(CAPTCHA_VERIFIED_KEY);
            }
        } catch {
            // Ignore localStorage errors
        }

        setIsLoading(false);
    }, []);

    const verify = useCallback(async (token: string): Promise<boolean> => {
        if (isVerified) return true;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/captcha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const result = await response.json();

            if (result.success) {
                setIsVerified(true);
                setShowChallenge(false);

                // Store verification in localStorage
                try {
                    localStorage.setItem(
                        CAPTCHA_VERIFIED_KEY,
                        JSON.stringify({ timestamp: Date.now() })
                    );
                } catch {
                    // Ignore localStorage errors
                }

                return true;
            } else {
                setError(result.error || 'Verification failed');
                // Show checkbox challenge on failure
                if (!verificationAttempted.current) {
                    verificationAttempted.current = true;
                    setShowChallenge(true);
                }
                return false;
            }
        } catch (err) {
            console.error('CAPTCHA verification error:', err);
            setError('Network error during verification');
            setShowChallenge(true);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isVerified]);

    const value: CaptchaContextType = {
        isVerified,
        isLoading,
        error,
        verify,
        showChallenge,
        setShowChallenge,
    };

    return (
        <CaptchaContext.Provider value={value}>
            {children}
        </CaptchaContext.Provider>
    );
}

export function useCaptcha() {
    const context = useContext(CaptchaContext);
    if (context === undefined) {
        throw new Error('useCaptcha must be used within a CaptchaProvider');
    }
    return context;
}
