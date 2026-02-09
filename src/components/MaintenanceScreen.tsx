'use client';

import { SiteSettings } from '@/lib/admin-shared';
import { RefreshCw, Construction, AlertTriangle } from 'lucide-react';

interface MaintenanceScreenProps {
    settings: SiteSettings;
}

export function MaintenanceScreen({ settings }: MaintenanceScreenProps) {
    const isSuspended = settings.suspensionMode;
    const message = isSuspended ? settings.suspensionMessage : settings.maintenanceMessage;

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-gradient-to-br from-cinema-midnight via-cinema-deep to-cinema-slate">
            <div className="glass-cinema-primary rounded-2xl p-8 sm:p-12 max-w-lg mx-4 text-center">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                    {isSuspended ? (
                        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-red-400" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse">
                            <Construction className="w-10 h-10 text-amber-400" />
                        </div>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    {isSuspended ? 'Site Suspended' : 'Under Maintenance'}
                </h1>

                {/* Message */}
                <p className="text-gray-300 text-base sm:text-lg mb-8 leading-relaxed">
                    {message}
                </p>

                {/* Status indicator */}
                {!isSuspended && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>We'll be back shortly</span>
                    </div>
                )}

                {/* Branding */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                    <p className="text-sm text-gray-500">
                        StreamWhereFinder
                    </p>
                </div>
            </div>
        </div>
    );
}
