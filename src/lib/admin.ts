'use server';

import { getAdminDb } from './firebase-admin';
import { SiteSettings, DEFAULT_SETTINGS, isAdminUser } from './admin-shared';
import { validateAdminSession } from './adminAuth';

/**
 * Get site settings from Firebase Realtime Database
 */
export async function getSiteSettings(): Promise<SiteSettings> {
    try {
        const database = getAdminDb(); // Uses Admin SDK
        const settingsRef = database.ref('siteSettings');
        const snapshot = await settingsRef.get();

        if (snapshot.exists()) {
            return { ...DEFAULT_SETTINGS, ...snapshot.val() };
        }

        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Update site settings in Firebase Realtime Database
 */
export async function updateSiteSettings(
    settings: Partial<SiteSettings>,
    sessionToken: string
): Promise<{ success: boolean; error?: string }> {
    const isValidSession = await validateAdminSession(sessionToken);

    if (!isValidSession) {
        return { success: false, error: 'Unauthorized: Invalid or expired admin session' };
    }

    try {
        const database = getAdminDb(); // Uses Admin SDK
        const settingsRef = database.ref('siteSettings');

        const currentSettings = await getSiteSettings();
        const updatedSettings: SiteSettings = {
            ...currentSettings,
            ...settings,
            lastUpdated: new Date().toISOString(),
            updatedBy: 'System Admin',
        };

        await settingsRef.set(updatedSettings);

        return { success: true };
    } catch (error) {
        console.error('Error updating site settings:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update settings'
        };
    }
}

/**
 * Toggle maintenance mode
 */
export async function toggleMaintenanceMode(
    enabled: boolean,
    sessionToken: string
): Promise<{ success: boolean; error?: string }> {
    return updateSiteSettings({ maintenanceMode: enabled }, sessionToken);
}

/**
 * Toggle suspension mode
 */
export async function toggleSuspensionMode(
    enabled: boolean,
    sessionToken: string
): Promise<{ success: boolean; error?: string }> {
    return updateSiteSettings({ suspensionMode: enabled }, sessionToken);
}
