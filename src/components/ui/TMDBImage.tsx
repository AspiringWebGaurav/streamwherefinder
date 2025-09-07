'use client';

import { useState } from 'react';
import Image from 'next/image';

interface TMDBImageProps {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackText?: string;
}

export function TMDBImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackText = 'No Image'
}: TMDBImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!src || imageError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center text-gray-400 text-xs ${className}`}>
        {fallbackText}
      </div>
    );
  }

  return (
    <>
      {!imageLoaded && (
        <div className={`bg-gray-200 animate-pulse ${className}`} />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${imageLoaded ? '' : 'hidden'}`}
        unoptimized
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
    </>
  );
}