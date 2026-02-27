'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'hi' | 'mr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    isIndia: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => { },
    isIndia: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');
    const [isIndia, setIsIndia] = useState(false);

    useEffect(() => {
        try {
            // Check if the user is in India via TimeZone
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (timeZone === 'Asia/Calcutta' || timeZone === 'Asia/Kolkata') {
                queueMicrotask(() => setIsIndia(true));
            }
        } catch (e) {
            // fallback quietly
        }
    }, []);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, isIndia }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
