import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatRuntime(minutes: number): string {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes}min`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}min`;
}

export function formatReleaseDate(dateString: string): string {
    if (!dateString) return '';
    try {
        return new Date(dateString).getFullYear().toString();
    } catch {
        return '';
    }
}

export function formatRating(rating: number): string {
    if (!rating) return '0.0';
    return rating.toFixed(1);
}

export function truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
}

export function getYouTubeEmbedUrl(videoKey: string): string {
    return `https://www.youtube.com/embed/${videoKey}`;
}

export function generateMetaDescription(title: string, overview: string, maxLength = 160): string {
    if (!overview) {
        return `Watch ${title} - Find where to stream movies online legally. StreamWhereFinder helps you discover movies and where to watch them.`;
    }
    return truncateText(`${title} - ${overview}`, maxLength);
}

export function generatePageTitle(title: string, subtitle?: string): string {
    const siteName = 'StreamWhereFinder';
    return subtitle ? `${title} - ${subtitle} | ${siteName}` : `${title} | ${siteName}`;
}
