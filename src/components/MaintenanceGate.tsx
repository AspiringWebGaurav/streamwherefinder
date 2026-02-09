'use client';

import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { MaintenanceScreen } from './MaintenanceScreen';
import { SiteSettings, isAdminUser } from '@/lib/admin-shared';
import { useAuth } from '@/app/providers/FirebaseProvider';

interface MaintenanceGateProps {
    children: React.ReactNode;
    initialSettings?: SiteSettings | null;
}

const DEFAULT_SETTINGS: SiteSettings = {
    maintenanceMode: false,
    suspensionMode: false,
    maintenanceMessage: "We're currently performing scheduled maintenance. Please check back soon!",
    suspensionMessage: "This site has been temporarily suspended. Please contact support for assistance.",
};

import { usePathname } from 'next/navigation';

export function MaintenanceGate({ children, initialSettings }: MaintenanceGateProps) {
    const [settings, setSettings] = useState<SiteSettings>(initialSettings || DEFAULT_SETTINGS);
    const { user } = useAuth();
    const pathname = usePathname();

    // Admin can bypass maintenance/suspension
    // Also allow access to admin login page regardless of maintenance status
    const isAdmin = isAdminUser(user?.email);
    const isAdminRoute = pathname?.startsWith('/admin');

    // Real-time listener for settings changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const databaseUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
            if (!databaseUrl) return;

            // Dynamic import to avoid SSR issues
            const setupListener = async () => {
                const { getDatabase, ref, onValue } = await import('firebase/database');
                const firebaseModule = await import('@/lib/firebase');
                const app = firebaseModule.default as import('firebase/app').FirebaseApp | null;

                if (!app) return;

                const database = getDatabase(app);
                const settingsRef = ref(database, 'siteSettings');

                const unsubscribe = onValue(settingsRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setSettings({ ...DEFAULT_SETTINGS, ...snapshot.val() });
                    }
                }, (error) => {
                    console.error('Failed to listen to settings:', error);
                });

                return unsubscribe;
            };

            let cleanup: (() => void) | undefined;
            setupListener().then(unsub => {
                cleanup = unsub;
            });

            return () => {
                if (cleanup) cleanup();
            };
        } catch (error) {
            console.error('MaintenanceGate setup error:', error);
        }
    }, []);

    // Admin bypasses maintenance/suspension
    if (isAdmin || isAdminRoute) {
        return <>{children}</>;
    }

    // Show suspension screen (higher priority)
    if (settings.suspensionMode) {
        return <MaintenanceScreen settings={settings} />;
    }

    // Show maintenance screen
    if (settings.maintenanceMode) {
        return <MaintenanceScreen settings={settings} />;
    }

    return <>{children}</>;
}
