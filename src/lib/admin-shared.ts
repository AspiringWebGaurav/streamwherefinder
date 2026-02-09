// Shared admin utilities that can be used in both server and client components

// Admin email - hardcoded for security (not from env on client)
const ADMIN_EMAIL = 'gauravpatil9262@gmail.com';

export interface SiteSettings {
    maintenanceMode: boolean;
    suspensionMode: boolean;
    maintenanceMessage: string;
    suspensionMessage: string;
    lastUpdated?: string;
    updatedBy?: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
    maintenanceMode: false,
    suspensionMode: false,
    maintenanceMessage: "We're currently performing scheduled maintenance. Please check back soon!",
    suspensionMessage: "This site has been temporarily suspended. Please contact support for assistance.",
};

/**
 * Check if an email belongs to an admin user
 * This function is used by both client and server components
 */
export function isAdminUser(email: string | null | undefined): boolean {
    if (!email) return false;
    return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
