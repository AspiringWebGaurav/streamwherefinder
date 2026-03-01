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

export function SafeImage({ src, fallback, fallbackClassName, alt, className, ...props }: SafeImageProps) {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // If there is no src explicitly passed in (e.g. backend returned null pointer)
    if (!src) {
        return (
            <div className={cn("w-full h-full flex items-center justify-center", fallbackClassName)}>
                {fallback}
            </div>
        );
    }

    return (
        <div className={cn("relative w-full h-full overflow-hidden", className)}>
            <AnimatePresence mode="wait">
                {error ? (
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
                        {...props}
                        src={src}
                        alt={alt || "Image"}
                        className={cn(
                            "object-cover transition-opacity duration-500",
                            loaded ? "opacity-100" : "opacity-0",
                            props.fill ? "absolute inset-0 w-full h-full" : ""
                        )}
                        onLoad={(e) => {
                            setLoaded(true);
                            if (props.onLoad) props.onLoad(e);
                        }}
                        onError={() => {
                            setError(true);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
