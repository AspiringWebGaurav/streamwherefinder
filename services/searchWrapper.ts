import Fuse from "fuse.js";
import { PopularMovie, SearchApiResponse } from "@/lib/types";

// ═══════════════════════════════════════════════════════════════════════════════
// StreamWhere Enterprise Search Engine v2
// Multi-layer ranking · Franchise detection · Regional intelligence
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Query Normalisation (SAFE — preserves meaningful duplicate chars) ────────

/**
 * Light normalisation for display/comparison only.
 * Does NOT collapse duplicate characters (preserves "Dhoom", "Krrish", etc.)
 */
export function normalizeForComparison(raw: string): string {
    return raw
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Legacy normalizeQuery kept for backward-compat but fixed:
 * Only collapses 3+ consecutive identical chars (e.g. "Dhooooom" → "Dhoom")
 * Never collapses doubles like "oo", "rr", "ss" which are real word patterns.
 */
export function normalizeQuery(raw: string): string {
    return raw
        .trim()
        .toLowerCase()
        .replace(/(.)\1{2,}/g, "$1$1") // 3+ same char → 2 (safe)
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

export function getDidYouMean(
    raw: string,
    titles: { title: string; slug: string }[],
    threshold = 3
): { title: string; slug: string } | null {
    const q = normalizeForComparison(raw);
    if (q.length < 3) return null;

    let best: { title: string; slug: string } | null = null;
    let bestDist = Infinity;

    for (const t of titles) {
        const norm = normalizeForComparison(t.title);
        const dist = levenshtein(q, norm);
        if (dist < bestDist && dist <= threshold) {
            bestDist = dist;
            best = t;
        }
    }

    if (best && normalizeForComparison(raw) !== normalizeForComparison(best.title)) {
        return best;
    }
    return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENTERPRISE RANKING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

// Indian language codes that indicate Bollywood/regional Indian cinema
const INDIAN_LANGUAGES = new Set(["hi", "ta", "te", "ml", "kn", "bn", "mr", "pa", "gu"]);

/**
 * Compute a multi-layer relevance score for each movie result.
 *
 * Layers:
 *   A – Exact title match (highest priority)
 *   B – Normalized containment match
 *   C – Franchise boost (sequel detection)
 *   D – Regional weighting (Indian cinema boost)
 *   E – Popularity + vote weight composite
 */
function computeRelevanceScore(movie: PopularMovie, rawQuery: string): number {
    const queryLower = rawQuery.trim().toLowerCase();
    const queryNorm = normalizeForComparison(rawQuery);
    const titleLower = movie.title.toLowerCase();
    const titleNorm = normalizeForComparison(movie.title);

    let score = 0;

    // ── Layer A: Exact Match Boost ────────────────────────────────────────
    if (titleLower === queryLower || titleNorm === queryNorm) {
        score += 100; // Exact match = highest priority
    }

    // ── Layer B: Containment & Starts-With ────────────────────────────────
    if (titleNorm.startsWith(queryNorm)) {
        score += 40; // Title starts with query
    } else if (titleNorm.includes(queryNorm)) {
        score += 20; // Title contains query
    }

    // Penalise if the title doesn't contain the query at all
    if (!titleNorm.includes(queryNorm)) {
        // Check token-level containment
        const queryTokens = queryNorm.split(" ");
        const titleTokens = titleNorm.split(" ");
        let tokenHits = 0;
        for (const qt of queryTokens) {
            if (titleTokens.some(tt => tt.startsWith(qt) || tt === qt)) {
                tokenHits++;
            }
        }
        if (tokenHits === 0) {
            score -= 30; // No token match at all — likely irrelevant
        } else {
            score += tokenHits * 5;
        }
    }

    // ── Layer C: Franchise Boost ──────────────────────────────────────────
    // If query is a franchise base name (e.g. "Dhoom"), boost sequels
    const franchisePattern = new RegExp(
        `^${queryNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*\\d+)?$`
    );
    if (franchisePattern.test(titleNorm)) {
        score += 60; // Strong franchise match (e.g. "dhoom", "dhoom 2", "dhoom 3")
    }

    // ── Layer D: Regional Weighting (India) ──────────────────────────────
    const lang = movie.originalLanguage || "";
    if (INDIAN_LANGUAGES.has(lang)) {
        score += 15; // Boost Indian cinema
    }

    // ── Layer E: Popularity + Vote Weight ────────────────────────────────
    const popularity = movie.popularity || 0;
    const voteCount = movie.voteCount || 0;

    // Logarithmic popularity scaling (prevents runaway scores)
    score += Math.min(20, Math.log10(Math.max(1, popularity)) * 5);

    // Vote count credibility boost
    if (voteCount >= 500) score += 10;
    else if (voteCount >= 100) score += 5;
    else if (voteCount >= 10) score += 2;

    // ── Penalty: Obscure content filter ──────────────────────────────────
    if (voteCount < 5 && popularity < 1) {
        score -= 20; // Severely penalise obscure entries
    }

    // Release year recency bonus (small)
    const year = parseInt(movie.releaseDate?.split("-")[0] || "0");
    if (year >= 2020) score += 3;
    else if (year >= 2000) score += 1;

    return score;
}

/**
 * Rank and filter search results using the enterprise scoring engine.
 */
function rankResults(movies: PopularMovie[], rawQuery: string, limit: number): PopularMovie[] {
    // Score each movie
    const scored = movies.map(movie => ({
        movie,
        score: computeRelevanceScore(movie, rawQuery),
    }));

    // Sort by score descending, then by popularity as tiebreaker
    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.movie.popularity || 0) - (a.movie.popularity || 0);
    });

    return scored.slice(0, limit).map(s => s.movie);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE SEARCH (calls /api/search)
// ═══════════════════════════════════════════════════════════════════════════════

let activeController: AbortController | null = null;

/**
 * Enterprise search wrapper with:
 * - Parallel raw + normalized queries for maximum coverage
 * - Multi-layer ranking engine
 * - Franchise detection & grouping
 * - Regional intelligence
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

    if (!query || query.trim().length < 2) return empty;

    // Cancel previous in-flight request
    if (activeController) {
        activeController.abort();
    }
    activeController = new AbortController();
    const { signal } = activeController;

    const trimmed = query.trim();
    const normalized = normalizeQuery(trimmed);

    try {
        // ── Parallel fetch: raw query + normalized variant ────────────────
        const rawUrl = new URL("/api/search", window.location.origin);
        rawUrl.searchParams.set("q", trimmed);
        rawUrl.searchParams.set("limit", "20"); // Overfetch for ranking

        const fetches: Promise<Response>[] = [
            fetch(rawUrl.toString(), { signal }),
        ];

        // Only send a second query if normalization actually changed something
        const normalizedClean = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
        if (normalized !== normalizedClean) {
            const normUrl = new URL("/api/search", window.location.origin);
            normUrl.searchParams.set("q", normalized);
            normUrl.searchParams.set("limit", "20");
            fetches.push(fetch(normUrl.toString(), { signal }));
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

        // ── Apply enterprise ranking engine ──────────────────────────────
        const ranked = rankResults(allMovies, trimmed, limit);

        return {
            movies: ranked,
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

// ─── Fuzzy Suggestion Engine (Fuse.js) ───────────────────────────────────────

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

// ─── Similarity score ────────────────────────────────────────────────────────

export function similarityScore(a: string, b: string): number {
    const na = normalizeForComparison(a);
    const nb = normalizeForComparison(b);
    if (!na || !nb) return 0;
    const maxLen = Math.max(na.length, nb.length);
    return 1 - levenshtein(na, nb) / maxLen;
}
