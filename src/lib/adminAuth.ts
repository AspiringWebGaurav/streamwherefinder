'use server';

import { createHash } from 'crypto';

// Server-side encrypted admin password
// The actual password is "5737.5737" - stored as SHA-256 hash or in environment
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || createHash('sha256').update('5737.5737').digest('hex');

// Session token storage (in-memory for simplicity, consider Redis in production)
const adminSessions = new Map<string, { expires: number }>();

/**
 * Verify admin password and create session
 */
export async function verifyAdminPassword(password: string): Promise<{
    success: boolean;
    sessionToken?: string;
    error?: string;
}> {
    if (!password) {
        return { success: false, error: 'Password is required' };
    }

    // Hash the provided password
    const passwordHash = createHash('sha256').update(password).digest('hex');

    // Compare with stored hash
    if (passwordHash !== ADMIN_PASSWORD_HASH) {
        // Add delay to prevent brute force
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: false, error: 'Invalid password' };
    }

    // Generate session token
    const sessionToken = createHash('sha256')
        .update(`admin-${Date.now()}-${Math.random()}`)
        .digest('hex');

    // Store session with 24-hour expiry
    const expires = Date.now() + 24 * 60 * 60 * 1000;
    adminSessions.set(sessionToken, { expires });

    // Cleanup expired sessions
    for (const [token, session] of adminSessions.entries()) {
        if (session.expires < Date.now()) {
            adminSessions.delete(token);
        }
    }

    return { success: true, sessionToken };
}

/**
 * Validate an existing admin session
 */
export async function validateAdminSession(sessionToken: string): Promise<boolean> {
    if (!sessionToken) return false;

    const session = adminSessions.get(sessionToken);
    if (!session) return false;

    if (session.expires < Date.now()) {
        adminSessions.delete(sessionToken);
        return false;
    }

    return true;
}

/**
 * Logout admin session
 */
export async function logoutAdminSession(sessionToken: string): Promise<void> {
    adminSessions.delete(sessionToken);
}
