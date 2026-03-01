'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
    src?: string | null;
    fallback: React.ReactNode;
    fallbackClassName?: string;
}

const MAX_RETRIES = 4;

export function SafeImage({ src, fallback, fallbackClassName, alt, className, ...props }: SafeImageProps) {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [retries, setRetries] = useState(0);
    const [prevSrc, setPrevSrc] = useState(src);

    // Reset state forcefully when src changes (Derived state pattern)
    if (src !== prevSrc) {
        setPrevSrc(src);
        setError(false);
        setLoaded(false);
        setRetries(0);
    }

    // If there is no src explicitly passed in (e.g. backend returned null pointer)
    if (!src) {
        return (
            <div className={cn("w-full h-full flex items-center justify-center", fallbackClassName)}>
                {fallback}
            </div>
        );
    }

    // Determine if we should show fallback
    const showFallback = error && retries >= MAX_RETRIES;

    return (
        <div className={cn("relative w-full h-full overflow-hidden", className)}>
            <AnimatePresence mode="wait">
                {showFallback ? (
                    <motion.div
                        key="fallback"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn("absolute inset-0 w-full h-full flex items-center justify-center", fallbackClassName)}
                    >
                        {fallback}
                    </motion.div>
                ) : (
                    <Image
                        key={`${src}-attempt-${retries}`} // Force remount on retry
                        {...props}
                        src={retries > 0 && typeof src === 'string' && src.startsWith('http')
                            ? `${src}${src.includes('?') ? '&' : '?'}retry=${retries}`
                            : src}
                        alt={alt || "Image"}
                        className={cn(
                            "object-cover transition-opacity duration-500",
                            loaded ? "opacity-100" : "opacity-0",
                            props.fill ? "absolute inset-0 w-full h-full" : ""
                        )}
                        onLoad={(e) => {
                            setLoaded(true);
                            setError(false);
                            if (props.onLoad) props.onLoad(e);
                        }}
                        onError={() => {
                            if (retries < MAX_RETRIES) {
                                // Exponential backoff: 500ms, 1000ms, 2000ms, 4000ms
                                const delay = Math.min(500 * Math.pow(2, retries), 4000);
                                setTimeout(() => {
                                    setRetries(r => r + 1);
                                }, delay);
                            } else {
                                setError(true);
                            }
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
