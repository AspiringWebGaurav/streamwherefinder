import { ScoredMovie, Movie, RecommendationResult } from "@/lib/types";

// ─── Weight Configuration ────────────────────────────────────────────────────

const WEIGHTS = {
    genreSimilarity: 0.35,
    ratingProximity: 0.25,
    popularity: 0.20,
    keywordOverlap: 0.20,
} as const;

// ─── Scoring Helpers ─────────────────────────────────────────────────────────

/** Jaccard similarity for two genre arrays */
function genreJaccard(a: string[], b: string[]): number {
    if (!a.length || !b.length) return 0;
    const setA = new Set(a.map((g) => g.toLowerCase()));
    const setB = new Set(b.map((g) => g.toLowerCase()));
    const intersection = [...setA].filter((g) => setB.has(g)).length;
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : intersection / union;
}

/** Rating proximity: 1 when equal, 0 when ≥ 5 apart */
function ratingProximity(a: number, b: number): number {
    return Math.max(0, 1 - Math.abs(a - b) / 5);
}

/** Normalised popularity score (0–1 relative to dataset max) */
function normalisedPopularity(pop: number, maxPop: number): number {
    if (maxPop === 0) return 0;
    return Math.min(pop / maxPop, 1);
}

/** Word-level overlap between two overview strings */
function keywordOverlap(a: string, b: string): number {
    const words = (s: string) =>
        new Set(s.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? []);
    const wa = words(a);
    const wb = words(b);
    if (!wa.size || !wb.size) return 0;
    const shared = [...wa].filter((w) => wb.has(w)).length;
    return shared / Math.max(wa.size, wb.size);
}

// ─── Core Scoring Function ───────────────────────────────────────────────────

/**
 * Score = (genreSimilarity × 0.35) + (ratingProximity × 0.25)
 *       + (popularity × 0.20)      + (keywordOverlap × 0.20)
 */
function scoreMovie(
    candidate: ScoredMovie,
    reference: Movie,
    maxPop: number
): number {
    const gs = genreJaccard(candidate.genres ?? [], reference.genres);
    const rp = ratingProximity(candidate.rating, reference.rating);
    const pop = normalisedPopularity(candidate.popularity ?? 0, maxPop);
    const ko = keywordOverlap(candidate.overview ?? "", reference.overview ?? "");

    return (
        gs * WEIGHTS.genreSimilarity +
        rp * WEIGHTS.ratingProximity +
        pop * WEIGHTS.popularity +
        ko * WEIGHTS.keywordOverlap
    );
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Score a pool of candidates against a reference movie.
 * Returns candidates sorted by score descending.
 */
export function rankMovies(
    pool: ScoredMovie[],
    reference: Movie,
    limit = 12
): ScoredMovie[] {
    const maxPop = Math.max(...pool.map((m) => m.popularity ?? 0), 1);

    return pool
        .filter((m) => m.id !== reference.id)
        .map((m) => ({ ...m, score: scoreMovie(m, reference, maxPop) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

/**
 * Build all three recommendation sections from a candidate pool.
 */
export function buildRecommendations(
    pool: ScoredMovie[],
    reference: Movie
): RecommendationResult {
    const ranked = rankMovies(pool, reference, 30);

    // "Because you liked this" — top overall scorers
    const becauseYouLiked = ranked.slice(0, 8);

    // "Similar genre picks" — must share at least one genre
    const refGenres = new Set(reference.genres.map((g) => g.toLowerCase()));
    const similarGenre = ranked
        .filter((m) =>
            (m.genres ?? []).some((g) => refGenres.has(g.toLowerCase()))
        )
        .slice(0, 8);

    // "Trending in this category" — genre match, sorted by popularity
    const trendingInCategory = pool
        .filter(
            (m) =>
                m.id !== reference.id &&
                (m.genres ?? []).some((g) => refGenres.has(g.toLowerCase()))
        )
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        .slice(0, 8);

    return { becauseYouLiked, similarGenre, trendingInCategory };
}
