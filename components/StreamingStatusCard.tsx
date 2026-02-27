'use client';

import { useMemo } from 'react';
import { Film, Clock, CalendarDays, Info, Hourglass } from 'lucide-react';
import type { StreamingStatus, StreamingStatusCode } from '@/services/availabilityEngine';
import { cn } from '@/lib/utils';

interface StreamingStatusCardProps {
    status: StreamingStatus;
    releaseDate?: string;
}

const STATUS_CONFIG: Record<StreamingStatusCode, {
    label: string;
    icon: typeof Film;
    accent: string;       // icon bg
    accentText: string;   // icon text
    borderTint: string;   // border color
    bgTint: string;       // subtle background base
}> = {
    UPCOMING: {
        label: 'Upcoming',
        icon: CalendarDays,
        accent: 'bg-sky-100',
        accentText: 'text-sky-700',
        borderTint: 'border-sky-200/60',
        bgTint: 'bg-sky-50/50',
    },
    IN_THEATERS: {
        label: 'In Theatres',
        icon: Film,
        accent: 'bg-emerald-100',
        accentText: 'text-emerald-700',
        borderTint: 'border-emerald-200/60',
        bgTint: 'bg-emerald-50/50',
    },
    DIGITAL_PENDING: {
        label: 'Digital Pending',
        icon: Hourglass,
        accent: 'bg-amber-100',
        accentText: 'text-amber-700',
        borderTint: 'border-amber-200/60',
        bgTint: 'bg-amber-50/50',
    },
    UNAVAILABLE: {
        label: 'Not on Streaming',
        icon: Info,
        accent: 'bg-slate-100',
        accentText: 'text-slate-600',
        borderTint: 'border-slate-200/60',
        bgTint: 'bg-slate-50/50',
    },
    AVAILABLE: {
        label: 'Available',
        icon: Clock,
        accent: 'bg-emerald-100',
        accentText: 'text-emerald-700',
        borderTint: 'border-emerald-200/60',
        bgTint: 'bg-emerald-50/50',
    },
};

export function StreamingStatusCard({ status, releaseDate }: StreamingStatusCardProps) {
    const config = useMemo(() => STATUS_CONFIG[status.status], [status.status]);
    const Icon = config.icon;

    const formattedReleaseDate = useMemo(() => {
        if (!releaseDate) return null;
        try {
            return new Date(releaseDate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return null;
        }
    }, [releaseDate]);

    // Don't render for AVAILABLE status — providers UI handles that
    if (status.status === 'AVAILABLE') return null;

    return (
        <div
            className={cn(
                'rounded-2xl border',
                config.borderTint,
                config.bgTint,
                'p-5 sm:p-6 mb-8 transition-all duration-300 shadow-sm'
            )}
            role="status"
            aria-label={`Streaming status: ${config.label}`}
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-black/5', config.accent)}>
                        <Icon className={cn('w-5 h-5', config.accentText)} />
                    </div>
                    <h4 className="text-base font-bold text-[var(--saas-text-primary)] tracking-tight">
                        Streaming Status
                    </h4>
                </div>
                <span className={cn('inline-flex w-fit items-center px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-black/5', config.accent, config.accentText)}>
                    {config.label}
                </span>
            </div>

            {/* Body */}
            <div className="space-y-3 sm:pl-13">
                <p className="text-[15px] text-[var(--saas-text-secondary)] leading-relaxed font-medium">
                    {status.message}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-2">
                    {formattedReleaseDate && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--saas-text-muted)] font-semibold bg-white/60 px-2.5 py-1.5 rounded-md border border-[var(--saas-border-light)]">
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span className="text-[var(--saas-text-secondary)]">Release:</span>{' '}
                            {formattedReleaseDate}
                        </div>
                    )}

                    {status.estimatedWindow && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--saas-text-muted)] font-semibold bg-white/60 px-2.5 py-1.5 rounded-md border border-[var(--saas-border-light)]">
                            <Hourglass className="w-3.5 h-3.5" />
                            <span className="text-[var(--saas-text-secondary)]">OTT Window:</span>{' '}
                            {status.estimatedWindow}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
