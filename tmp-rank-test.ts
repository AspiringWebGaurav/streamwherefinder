import { normalizeQuery, normalizeForComparison } from './services/searchWrapper';
import { PopularMovie } from './lib/types';

// Let's create a script to test the computeRelevanceScore properly.
// I will copy the function here to test it since it's not exported.

const INDIAN_LANGUAGES = new Set(["hi", "ta", "te", "ml", "kn", "bn", "mr", "pa", "gu"]);

function computeRelevanceScore(movie: PopularMovie, rawQuery: string): number {
    const queryLower = rawQuery.trim().toLowerCase();
    const queryNorm = normalizeForComparison(rawQuery);
    const titleLower = movie.title.toLowerCase();
    const titleNorm = normalizeForComparison(movie.title);

    let score = 0;

    // Layer A: Exact Match Boost
    if (titleLower === queryLower || titleNorm === queryNorm) {
        score += 100;
    }

    // Layer B: Containment & Starts-With
    if (titleNorm.startsWith(queryNorm)) {
        score += 40;
    } else if (titleNorm.includes(queryNorm)) {
        score += 20;
    }

    if (!titleNorm.includes(queryNorm)) {
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

    // Layer C: Franchise Boost
    const franchisePattern = new RegExp(
        `^${queryNorm.replace(/[.*+?^$}{()|[\\]\\\\]/g, '\\\\$&')}(\\s*\\d+)?$`
    );
    if (franchisePattern.test(titleNorm)) {
        score += 60; // Strong franchise match
    }

    // Layer D: Regional Weighting (India)
    const lang = movie.originalLanguage || "";
    if (INDIAN_LANGUAGES.has(lang)) {
        score += 15;
    }

    // Layer E: Popularity + Vote Weight
    const popularity = movie.popularity || 0;
    const voteCount = movie.voteCount || 0;

    score += Math.min(20, Math.log10(Math.max(1, popularity)) * 5);

    if (voteCount >= 500) score += 10;
    else if (voteCount >= 100) score += 5;
    else if (voteCount >= 10) score += 2;

    if (voteCount < 5 && popularity < 1) {
        score -= 20;
    }

    const year = parseInt(movie.releaseDate?.split("-")[0] || "0");
    if (year >= 2020) score += 3;
    else if (year >= 2000) score += 1;

    return score;
}

const mockMovies: PopularMovie[] = [
    { id: 1, title: "Dhoom", slug: "dhoom-1", rating: 7.5, releaseDate: "2004-01-01", popularity: 50, voteCount: 600, originalLanguage: "hi", posterPath: null },
    { id: 2, title: "Dhoom 2", slug: "dhoom-2", rating: 7.8, releaseDate: "2006-01-01", popularity: 60, voteCount: 800, originalLanguage: "hi", posterPath: null },
    { id: 3, title: "Dhoom 3", slug: "dhoom-3", rating: 6.5, releaseDate: "2013-01-01", popularity: 80, voteCount: 1000, originalLanguage: "hi", posterPath: null },
    { id: 4, title: "Dhooma", slug: "dhooma-4", rating: 5.0, releaseDate: "2015-01-01", popularity: 1, voteCount: 2, originalLanguage: "ta", posterPath: null }, // Random similar name
    { id: 5, title: "Avengers", slug: "avengers-5", rating: 8.0, releaseDate: "2012-01-01", popularity: 150, voteCount: 15000, originalLanguage: "en", posterPath: null },
    { id: 6, title: "Avengers: Endgame", slug: "avengers-endgame-6", rating: 8.5, releaseDate: "2019-01-01", popularity: 200, voteCount: 20000, originalLanguage: "en", posterPath: null },
];

console.log("--- Ranking Tests ---");
['Dhoom', 'Dhooom', 'Avenger', 'Avengers'].forEach(q => {
    console.log(`\nQuery: "${q}"`);
    const results = mockMovies.map(m => ({ title: m.title, score: computeRelevanceScore(m, q) }));
    results.sort((a, b) => b.score - a.score);
    results.forEach(r => console.log(`  ${r.title}: ${r.score.toFixed(2)}`));
});
