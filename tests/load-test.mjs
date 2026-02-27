/**
 * Load Test — 100 Concurrent User Simulation
 * 
 * Simulates 100 virtual users performing:
 *   1. Search a random movie
 *   2. Open movie detail page
 *   3. Navigate back
 * 
 * Measures: response times, error rate, memory growth
 * 
 * Run: node tests/load-test.mjs
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENT_USERS = 100;
const SEARCH_QUERIES = [
    'Batman', 'Spider', 'Avengers', 'Iron Man', 'Thor',
    'Superman', 'Joker', 'Matrix', 'Star Wars', 'Inception',
    'Interstellar', 'Dark Knight', 'Titanic', 'Avatar', 'Frozen',
    'Shrek', 'Toy Story', 'Finding Nemo', 'Lion King', 'Gladiator',
];

const results = {
    totalRequests: 0,
    successCount: 0,
    errorCount: 0,
    responseTimes: [],
    apiLatencies: { search: [], detail: [], trending: [] },
    errors: [],
    startMemory: null,
    endMemory: null,
};

async function timedFetch(url, label) {
    const start = performance.now();
    try {
        const res = await fetch(url);
        const elapsed = performance.now() - start;
        results.totalRequests++;
        results.responseTimes.push(elapsed);

        if (label && results.apiLatencies[label]) {
            results.apiLatencies[label].push(elapsed);
        }

        if (res.ok) {
            results.successCount++;
            return { ok: true, status: res.status, elapsed };
        } else {
            results.errorCount++;
            results.errors.push(`${res.status} ${url}`);
            return { ok: false, status: res.status, elapsed };
        }
    } catch (err) {
        const elapsed = performance.now() - start;
        results.totalRequests++;
        results.errorCount++;
        results.errors.push(`NETWORK_ERROR ${url}: ${err.message}`);
        return { ok: false, status: 0, elapsed };
    }
}

async function simulateUser(userId) {
    const query = SEARCH_QUERIES[userId % SEARCH_QUERIES.length];

    // Step 1: Search
    const searchResult = await timedFetch(
        `${BASE}/api/search?q=${encodeURIComponent(query)}&limit=5`,
        'search'
    );

    // Step 2: Open a movie detail (use trending as fallback)
    if (searchResult.ok) {
        try {
            const searchRes = await fetch(`${BASE}/api/search?q=${encodeURIComponent(query)}&limit=1`);
            const data = await searchRes.json();
            if (data.movies?.[0]?.slug) {
                await timedFetch(`${BASE}/movies/${data.movies[0].slug}`, 'detail');
            }
        } catch { /* ignore */ }
    }

    // Step 3: Hit trending endpoint
    await timedFetch(`${BASE}/api/movies/trending`, 'trending');
}

function percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
}

function avg(arr) {
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

async function main() {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  LOAD TEST — ${CONCURRENT_USERS} Concurrent Users`);
    console.log(`  Target: ${BASE}`);
    console.log(`${'═'.repeat(70)}\n`);

    results.startMemory = process.memoryUsage();
    const startTime = performance.now();

    // Launch all users concurrently
    const users = Array.from({ length: CONCURRENT_USERS }, (_, i) => simulateUser(i));
    await Promise.allSettled(users);

    const totalTime = performance.now() - startTime;
    results.endMemory = process.memoryUsage();

    // ── Report ──
    const errorRate = ((results.errorCount / results.totalRequests) * 100).toFixed(2);
    const memGrowthMB = ((results.endMemory.heapUsed - results.startMemory.heapUsed) / 1024 / 1024).toFixed(2);

    console.log(`\n${'─'.repeat(70)}`);
    console.log('  RESULTS');
    console.log(`${'─'.repeat(70)}`);
    console.log(`  Total requests:      ${results.totalRequests}`);
    console.log(`  Successful:          ${results.successCount}`);
    console.log(`  Failed:              ${results.errorCount}`);
    console.log(`  Error rate:          ${errorRate}%`);
    console.log(`  Total duration:      ${(totalTime / 1000).toFixed(2)}s`);
    console.log('');
    console.log(`  Response Times:`);
    console.log(`    Average:           ${avg(results.responseTimes).toFixed(0)}ms`);
    console.log(`    P50:               ${percentile(results.responseTimes, 50).toFixed(0)}ms`);
    console.log(`    P95:               ${percentile(results.responseTimes, 95).toFixed(0)}ms`);
    console.log(`    P99:               ${percentile(results.responseTimes, 99).toFixed(0)}ms`);
    console.log('');
    console.log(`  API Latencies:`);
    for (const [key, times] of Object.entries(results.apiLatencies)) {
        if (times.length > 0) {
            console.log(`    ${key.padEnd(15)} avg=${avg(times).toFixed(0)}ms  p95=${percentile(times, 95).toFixed(0)}ms  (${times.length} calls)`);
        }
    }
    console.log('');
    console.log(`  Memory:`);
    console.log(`    Start heap:        ${(results.startMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`    End heap:          ${(results.endMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`    Growth:            ${memGrowthMB} MB`);

    if (results.errors.length > 0) {
        console.log(`\n  Errors (first 10):`);
        results.errors.slice(0, 10).forEach(e => console.log(`    ⚠  ${e}`));
    }

    // ── Pass/Fail ──
    console.log(`\n${'═'.repeat(70)}`);
    const passed = parseFloat(errorRate) <= 1.0;
    console.log(`  VERDICT: ${passed ? '✅ PASS' : '❌ FAIL'} (error rate ${errorRate}%, threshold 1%)`);
    console.log(`${'═'.repeat(70)}\n`);

    process.exit(passed ? 0 : 1);
}

main().catch(err => {
    console.error('Load test crashed:', err);
    process.exit(1);
});
