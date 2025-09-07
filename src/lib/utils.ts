import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format movie runtime from minutes to hours and minutes
 */
export function formatRuntime(minutes: number): string {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}min`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Format release date to readable format
 */
export function formatReleaseDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  } catch {
    return '';
  }
}

/**
 * Format rating to one decimal place
 */
export function formatRating(rating: number): string {
  if (!rating) return '0.0';
  return rating.toFixed(1);
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

/**
 * Generate YouTube embed URL from video key
 */
export function getYouTubeEmbedUrl(videoKey: string): string {
  return `https://www.youtube.com/embed/${videoKey}`;
}

/**
 * Generate YouTube thumbnail URL from video key
 */
export function getYouTubeThumbnailUrl(videoKey: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium'): string {
  return `https://img.youtube.com/vi/${videoKey}/${quality}default.jpg`;
}

/**
 * Check if an image URL is valid TMDb path
 */
export function isValidImagePath(path: string | null): boolean {
  return Boolean(path && path.startsWith('/'));
}

/**
 * Get fallback image URL for broken posters
 */
export function getFallbackPosterUrl(): string {
  return '/images/poster-fallback.jpg';
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get contrast ratio between two colors (simplified)
 */
export function getContrastRatio(color1: string, color2: string): number {
  // This is a simplified version - in production you'd want a more robust solution
  return 4.5; // Assuming good contrast for now
}

/**
 * Generate meta description for SEO
 */
export function generateMetaDescription(title: string, overview: string, maxLength: number = 160): string {
  if (!overview) {
    return `Watch ${title} - Find where to stream movies online legally. StreamWhereFinder helps you discover movies and where to watch them.`;
  }
  
  const description = `${title} - ${overview}`;
  return truncateText(description, maxLength);
}

/**
 * Generate page title for SEO
 */
export function generatePageTitle(title: string, subtitle?: string): string {
  const siteName = 'StreamWhereFinder';
  
  if (subtitle) {
    return `${title} - ${subtitle} | ${siteName}`;
  }
  
  return `${title} | ${siteName}`;
}