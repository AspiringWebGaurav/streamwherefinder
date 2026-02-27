import Fuse from "fuse.js";
import { PopularMovie, SearchApiResponse } from "@/lib/types";

// ─── Query Normalisation ─────────────────────────────────────────────────────

/**
 * Normalises a raw query:
 * - Trim + lowercase
 * - Collapse duplicate consecutive characters (Krrish → Krish, Avvtar → Avtar)
 * - Remove non-alphanumeric except spaces
 */
export function normalizeQuery(raw: string): string {
    return raw
        .trim()
        .toLowerCase()
        .replace(/(.)\1+/g, "$1") // collapse duplicate chars
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// ─── Levenshtein Distance ────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] =
                a[i - 1] === b[j - 1]
                    ? dp[i - 1][j - 1]
                    : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

// ─── "Did you mean?" ─────────────────────────────────────────────────────────

/**
 * Returns the closest title match if edit distance ≤ threshold.
 * Uses normalised query vs normalised titles.
 */
export function getDidYouMean(
    raw: string,
    titles: { title: string; slug: string }[],
    threshold = 3
): { title: string; slug: string } | null {
    const q = normalizeQuery(raw);
    if (q.length < 3) return null;

    let best: { title: string; slug: string } | null = null;
    let bestDist = Infinity;

    for (const t of titles) {
        const norm = normalizeQuery(t.title);
        const dist = levenshtein(q, norm);
        if (dist < bestDist && dist <= threshold) {
            bestDist = dist;
            best = t;
        }
    }

    // Only suggest if the query is NOT already close (avoid suggesting same word)
    if (best && normalizeQuery(raw) !== normalizeQuery(best.title)) {
        return best;
    }
    return null;
}

// ─── Live Client-Side Search (calls native /api/search) ────────────────

let activeController: AbortController | null = null;

/**
 * Debounce-safe search wrapper.
 * Cancels any in-flight request before firing a new one.
 */
export async function searchMovies(
    query: string,
    limit = 8
): Promise<SearchApiResponse> {
    const empty: SearchApiResponse = {
        movies: [],
        isClientSide: false,
        totalResults: 0,
        query,
    };

    if (!query || query.length < 2) return empty;

    // Cancel previous request
    if (activeController) {
        activeController.abort();
    }
    activeController = new AbortController();
    const { signal } = activeController;

    const trimmed = query.trim();
    const normalized = normalizeQuery(trimmed);

    try {
        // Always search with the normalized query for better fuzzy matching
        const primaryUrl = new URL("/api/search", window.location.origin);
        primaryUrl.searchParams.set("q", normalized);
        primaryUrl.searchParams.set("limit", limit.toString());

        // If normalization changed the query, also search with the raw query
        // and merge results (deduped) for maximum coverage
        const hasVariant = normalized !== trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

        const fetches: Promise<Response>[] = [
            fetch(primaryUrl.toString(), { signal }),
        ];

        if (hasVariant) {
            const secondaryUrl = new URL("/api/search", window.location.origin);
            secondaryUrl.searchParams.set("q", trimmed);
            secondaryUrl.searchParams.set("limit", limit.toString());
            fetches.push(fetch(secondaryUrl.toString(), { signal }));
        }

        const responses = await Promise.allSettled(fetches);
        const allMovies: PopularMovie[] = [];
        const seenIds = new Set<number>();

        for (const settled of responses) {
            if (settled.status === "fulfilled" && settled.value.ok) {
                const data: SearchApiResponse = await settled.value.json();
                for (const movie of data.movies) {
                    if (!seenIds.has(movie.id)) {
                        seenIds.add(movie.id);
                        allMovies.push(movie);
                    }
                }
            }
        }

        // Sort: higher rated and more popular movies first
        allMovies.sort((a, b) => (b.rating * 10 + b.id) - (a.rating * 10 + a.id));

        return {
            movies: allMovies.slice(0, limit),
            isClientSide: false,
            totalResults: allMovies.length,
            query: trimmed,
        };
    } catch (err) {
        if ((err as Error).name === "AbortError") {
            return empty;
        }
        console.error("[searchWrapper] fetch failed:", err);
        return empty;
    } finally {
        activeController = null;
    }
}

// ─── Fuzzy Suggestion Engine (client-side Fuse.js over cached results) ───────

let fuseInstance: Fuse<PopularMovie> | null = null;

export function initFuse(movies: PopularMovie[]) {
    fuseInstance = new Fuse(movies, {
        keys: ["title"],
        threshold: 0.4,
        distance: 100,
        includeScore: true,
        minMatchCharLength: 2,
        ignoreLocation: true,
    });
}

export function fuseSearch(query: string, limit = 5): PopularMovie[] {
    if (!fuseInstance || !query || query.length < 2) return [];
    return fuseInstance
        .search(query, { limit })
        .map((r) => r.item);
}

// ─── Similarity score (0-1) between two strings ──────────────────────────────

export function similarityScore(a: string, b: string): number {
    const na = normalizeQuery(a);
    const nb = normalizeQuery(b);
    if (!na || !nb) return 0;
    const maxLen = Math.max(na.length, nb.length);
    return 1 - levenshtein(na, nb) / maxLen;
}
