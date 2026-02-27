'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfilePictureProps {
    user: {
        photoURL?: string | null;
        displayName?: string | null;
        email?: string | null;
    } | null;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    showFallback?: boolean;
}

const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
};

const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
};

export function ProfilePicture({
    user,
    size = 'md',
    className = '',
    showFallback = true
}: ProfilePictureProps) {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
    };

    const shouldShowImage = user?.photoURL && !imageError;
    const altText = user?.displayName || user?.email || 'User profile picture';

    return (
        <div className={cn(
            'bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-full flex items-center justify-center relative overflow-hidden',
            sizeClasses[size],
            className
        )}>
            {shouldShowImage ? (
                <>
                    <img
                        src={user.photoURL!}
                        alt={altText}
                        className={cn(
                            'w-full h-full rounded-full object-cover transition-opacity duration-300',
                            imageLoading ? 'opacity-0' : 'opacity-100'
                        )}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        loading="lazy"
                    />
                    {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--saas-border)] border-b-[var(--saas-accent)]" />
                        </div>
                    )}
                </>
            ) : showFallback ? (
                <User className={cn('text-[var(--saas-text-muted)]', iconSizes[size])} />
            ) : null}
        </div>
    );
}
