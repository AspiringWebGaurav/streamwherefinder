import * as fs from 'fs';
import * as path from 'path';

// Let's test the `normalizeQuery`, `normalizeForComparison`, and `computeRelevanceScore` functions.
// We'll read the existing logic from `searchWrapper.ts` to see how it performs on mock datasets.

// Simplified mock functions imported directly from the logic:
export function normalizeForComparison(raw: string): string {
    return raw
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export function normalizeQuery(raw: string): string {
    return raw
        .trim()
        .toLowerCase()
        .replace(/(.)\1{2,}/g, "$1$1") // 3+ same char → 2 (safe)
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

const runTests = () => {
    console.log("--- Normalization Tests ---");
    const testCasesNorm = [
        { input: "Dhooooom", expected: "dhoom" }, // normalizeQuery maps it to 2
        { input: "Krrish", expected: "krrish" },
        { input: "Sholayy", expected: "sholayy" },
        { input: "Avengers: Endgame!", expected: "avengers endgame" },
        // ... Let's check the actual outputs
    ];

    for (const { input } of testCasesNorm) {
        console.log(`Raw: "${input}" | normalizeForComparison: "${normalizeForComparison(input)}" | normalizeQuery: "${normalizeQuery(input)}"`);
    }
}

runTests();
