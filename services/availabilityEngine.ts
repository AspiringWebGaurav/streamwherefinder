/**
 * Streaming Availability Engine
 * Deterministic rule-based classification using existing TMDB movie data.
 * No external API calls — pure local computation.
 */

export type StreamingStatusCode =
    | 'AVAILABLE'
    | 'IN_THEATERS'
    | 'DIGITAL_PENDING'
    | 'UNAVAILABLE'
    | 'UPCOMING';

export interface StreamingStatus {
    status: StreamingStatusCode;
    message: string;
    estimatedWindow?: string;
}

interface ProviderData {
    streaming?: unknown[];
    rent?: unknown[];
    buy?: unknown[];
}

interface MovieData {
    releaseDate?: string;
    release_date?: string;
}

/**
 * Compute streaming availability status from movie metadata and provider data.
 *
 * @param movie   — object with `releaseDate` or `release_date`
 * @param providers — watch/providers object (streaming/rent/buy arrays)
 * @returns StreamingStatus with status code, message, and optional estimated window
 */
export function getStreamingStatus(
    movie: MovieData | null | undefined,
    providers: ProviderData | null | undefined
): StreamingStatus {
    // ── CASE 1: Providers exist ──────────────────────────────────────────
    const hasProviders =
        providers &&
        (
            (Array.isArray(providers.streaming) && providers.streaming.length > 0) ||
            (Array.isArray(providers.rent) && providers.rent.length > 0) ||
            (Array.isArray(providers.buy) && providers.buy.length > 0)
        );

    if (hasProviders) {
        return {
            status: 'AVAILABLE',
            message: 'Available to stream now.',
        };
    }

    // ── Determine release date delta ─────────────────────────────────────
    const releaseDateStr = movie?.releaseDate || movie?.release_date;

    if (!releaseDateStr) {
        return {
            status: 'UNAVAILABLE',
            message: 'Streaming availability not confirmed.',
            estimatedWindow: 'Release date unknown.',
        };
    }

    const releaseDate = new Date(releaseDateStr);
    const now = new Date();
    const daysSinceRelease = Math.floor(
        (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // ── CASE 5: Future release date ──────────────────────────────────────
    if (daysSinceRelease < 0) {
        return {
            status: 'UPCOMING',
            message: 'Upcoming release. Streaming details will be available after theatrical run.',
        };
    }

    // ── CASE 2: Released < 45 days ago ───────────────────────────────────
    if (daysSinceRelease < 45) {
        return {
            status: 'IN_THEATERS',
            message: 'Currently in theatres. OTT release expected soon.',
            estimatedWindow: 'Usually within 45–90 days after theatrical release.',
        };
    }

    // ── CASE 3: Released 45–120 days ago ─────────────────────────────────
    if (daysSinceRelease <= 120) {
        return {
            status: 'DIGITAL_PENDING',
            message: 'Digital streaming release not yet announced.',
            estimatedWindow: 'Typically 2–4 months after release.',
        };
    }

    // ── CASE 4: Released > 120 days ago ──────────────────────────────────
    return {
        status: 'UNAVAILABLE',
        message: 'Streaming availability not confirmed.',
        estimatedWindow: 'Check back later.',
    };
}
