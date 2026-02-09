'use client';

import { useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '@/lib/admin-shared';
import { getSiteSettings, updateSiteSettings } from '@/lib/admin';
import { verifyAdminPassword, validateAdminSession, logoutAdminSession } from '@/lib/adminAuth';
import {
    Shield,
    AlertTriangle,
    Construction,
    RefreshCw,
    Save,
    LogIn,
    LogOut,
    Settings,
    Power,
    PowerOff,
    Lock,
    Eye,
    EyeOff,
    KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const ADMIN_SESSION_KEY = 'admin_session_token';

function ToggleSwitch({
    enabled,
    onChange,
    disabled
}: {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            disabled={disabled}
            className={`
        relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200
        ${enabled ? 'bg-red-500' : 'bg-gray-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
      `}
        >
            <span
                className={`
          inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200
          ${enabled ? 'translate-x-7' : 'translate-x-1'}
        `}
            />
        </button>
    );
}

function PasswordLoginForm({ onSuccess }: { onSuccess: (token: string) => void }) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [attempts, setAttempts] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (attempts >= 5) {
            setError('Too many failed attempts. Please try again later.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await verifyAdminPassword(password);

            if (result.success && result.sessionToken) {
                // Store session token
                localStorage.setItem(ADMIN_SESSION_KEY, result.sessionToken);
                onSuccess(result.sessionToken);
            } else {
                setAttempts(prev => prev + 1);
                setError(result.error || 'Invalid password');
                setPassword('');
            }
        } catch (err) {
            setError('Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <div className="glass-cinema-primary rounded-2xl p-8 max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
                    <p className="text-gray-400 text-sm">
                        Enter your admin password to continue
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <Lock className="w-4 h-4 inline mr-2" />
                            Admin Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                disabled={isLoading || attempts >= 5}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Attempts Warning */}
                    {attempts > 0 && attempts < 5 && (
                        <p className="text-amber-400 text-xs text-center">
                            {5 - attempts} attempt(s) remaining
                        </p>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isLoading || !password || attempts >= 5}
                        className="w-full btn-cinema-primary py-3 text-lg"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                <KeyRound className="w-5 h-5 mr-2" />
                                Access Dashboard
                            </>
                        )}
                    </Button>
                </form>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-700">
                    <Link href="/">
                        <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                            ← Back to Home
                        </Button>
                    </Link>
                </div>

                {/* Security Notice */}
                <p className="mt-4 text-xs text-gray-500 text-center">
                    🔒 Password is encrypted with SHA-256
                </p>
            </div>
        </div>
    );
}

function AdminDashboard({ sessionToken, onLogout }: { sessionToken: string; onLogout: () => void }) {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getSiteSettings();
            setSettings(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            setError('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleToggle = async (key: 'maintenanceMode' | 'suspensionMode', value: boolean) => {
        if (!settings) return;

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Use admin session for authentication
            const result = await updateSiteSettings({ [key]: value }, sessionToken);

            if (result.success) {
                setSettings(prev => prev ? { ...prev, [key]: value } : null);
                setSuccess(`${key === 'maintenanceMode' ? 'Maintenance' : 'Suspension'} mode ${value ? 'enabled' : 'disabled'}`);
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(result.error || 'Failed to update');
            }
        } catch (err) {
            console.error('Update error:', err);
            setError('Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleMessageUpdate = async (key: 'maintenanceMessage' | 'suspensionMessage', value: string) => {
        setSettings(prev => prev ? { ...prev, [key]: value } : null);
    };

    const saveMessages = async () => {
        if (!settings) return;

        setIsSaving(true);
        setError(null);

        try {
            const result = await updateSiteSettings({
                maintenanceMessage: settings.maintenanceMessage,
                suspensionMessage: settings.suspensionMessage,
            }, sessionToken);

            if (result.success) {
                setSuccess('Messages saved successfully');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(result.error || 'Failed to save messages');
            }
        } catch (err) {
            setError('Failed to save messages');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await logoutAdminSession(sessionToken);
        localStorage.removeItem(ADMIN_SESSION_KEY);
        onLogout();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="glass-cinema-primary rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Settings className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                                <p className="text-sm text-gray-400">Site Control Panel</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={fetchSettings}
                                disabled={isSaving}
                                className="btn-cinema-glass"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300">
                        <AlertTriangle className="w-5 h-5 inline mr-2" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-green-300">
                        ✓ {success}
                    </div>
                )}

                {/* Mode Controls */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Maintenance Mode */}
                    <div className="glass-cinema-primary rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${settings?.maintenanceMode ? 'bg-amber-500/20' : 'bg-gray-700'}`}>
                                    <Construction className={`w-6 h-6 ${settings?.maintenanceMode ? 'text-amber-400' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Maintenance Mode</h2>
                                    <p className="text-sm text-gray-400">Show maintenance screen to users</p>
                                </div>
                            </div>
                            <ToggleSwitch
                                enabled={settings?.maintenanceMode || false}
                                onChange={(v) => handleToggle('maintenanceMode', v)}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Custom Message</label>
                            <textarea
                                value={settings?.maintenanceMessage || ''}
                                onChange={(e) => handleMessageUpdate('maintenanceMessage', e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows={3}
                                placeholder="Maintenance message..."
                            />
                        </div>
                    </div>

                    {/* Suspension Mode */}
                    <div className="glass-cinema-primary rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${settings?.suspensionMode ? 'bg-red-500/20' : 'bg-gray-700'}`}>
                                    {settings?.suspensionMode ? (
                                        <PowerOff className="w-6 h-6 text-red-400" />
                                    ) : (
                                        <Power className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Suspension Mode</h2>
                                    <p className="text-sm text-gray-400">Completely suspend site access</p>
                                </div>
                            </div>
                            <ToggleSwitch
                                enabled={settings?.suspensionMode || false}
                                onChange={(v) => handleToggle('suspensionMode', v)}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Custom Message</label>
                            <textarea
                                value={settings?.suspensionMessage || ''}
                                onChange={(e) => handleMessageUpdate('suspensionMessage', e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows={3}
                                placeholder="Suspension message..."
                            />
                        </div>
                    </div>
                </div>

                {/* Save Messages Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={saveMessages}
                        disabled={isSaving}
                        className="btn-cinema-primary"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Messages
                    </Button>
                </div>

                {/* Last Updated Info */}
                {settings?.lastUpdated && (
                    <div className="text-center text-sm text-gray-500">
                        Last updated: {new Date(settings.lastUpdated).toLocaleString()}
                        {settings.updatedBy && ` by ${settings.updatedBy}`}
                    </div>
                )}

                {/* Back to Home */}
                <div className="text-center">
                    <Link href="/">
                        <Button variant="ghost" className="text-gray-400 hover:text-white">
                            ← Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            const storedToken = localStorage.getItem(ADMIN_SESSION_KEY);
            if (storedToken) {
                const isValid = await validateAdminSession(storedToken);
                if (isValid) {
                    setSessionToken(storedToken);
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem(ADMIN_SESSION_KEY);
                }
            }
            setIsChecking(false);
        };
        checkSession();
    }, []);

    const handleLoginSuccess = (token: string) => {
        setSessionToken(token);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setSessionToken(null);
        setIsAuthenticated(false);
    };

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (!isAuthenticated || !sessionToken) {
        return <PasswordLoginForm onSuccess={handleLoginSuccess} />;
    }

    return <AdminDashboard sessionToken={sessionToken} onLogout={handleLogout} />;
}
