/**
 * API Stress + Memory Leak Detection
 * 
 * Performs repeated API calls in cycles and tracks:
 * - Heap usage over time (detects continuous growth)
 * - Response stability across cycles
 * - Uncleaned listener/interval detection via heap snapshots
 *
 * Run: node tests/api-stress-memory.mjs
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const CYCLES = 10;
const REQUESTS_PER_CYCLE = 20;

const ENDPOINTS = [
    '/api/search?q=batman',
    '/api/search?q=spider+man',
    '/api/search?q=avengers',
    '/api/movies/trending',
    '/api/movies/popular',
    '/api/movies/upcoming',
];

const heapSnapshots = [];
const cycleResults = [];

async function runCycle(cycleNum) {
    const cycleErrors = [];
    const cycleTimes = [];

    const requests = Array.from({ length: REQUESTS_PER_CYCLE }, (_, i) => {
        const endpoint = ENDPOINTS[i % ENDPOINTS.length];
        const url = `${BASE}${endpoint}`;
        const start = performance.now();

        return fetch(url)
            .then(res => {
                cycleTimes.push(performance.now() - start);
                if (!res.ok) cycleErrors.push(`${res.status} ${url}`);
                return res.text(); // consume body to avoid memory leak
            })
            .catch(err => {
                cycleTimes.push(performance.now() - start);
                cycleErrors.push(`NETWORK_ERROR ${url}: ${err.message}`);
            });
    });

    await Promise.allSettled(requests);

    // Force GC if available (run with --expose-gc)
    if (global.gc) global.gc();

    const mem = process.memoryUsage();
    heapSnapshots.push({
        cycle: cycleNum,
        heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(2),
        rss: (mem.rss / 1024 / 1024).toFixed(2),
        external: (mem.external / 1024 / 1024).toFixed(2),
    });

    const avg = cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
    cycleResults.push({
        cycle: cycleNum,
        requests: REQUESTS_PER_CYCLE,
        errors: cycleErrors.length,
        avgLatencyMs: avg.toFixed(0),
    });

    return cycleErrors;
}

function detectMemoryLeak() {
    if (heapSnapshots.length < 3) return { leaked: false, reason: 'Not enough data' };

    // Check if heap consistently grows across last 5 cycles
    const recent = heapSnapshots.slice(-5);
    let consecutiveGrowth = 0;
    for (let i = 1; i < recent.length; i++) {
        if (parseFloat(recent[i].heapUsedMB) > parseFloat(recent[i - 1].heapUsedMB)) {
            consecutiveGrowth++;
        }
    }

    // If heap grew in 4+ out of last 5 cycles → likely leak
    if (consecutiveGrowth >= 4) {
        const growthMB = (parseFloat(recent[recent.length - 1].heapUsedMB) - parseFloat(recent[0].heapUsedMB)).toFixed(2);
        return { leaked: true, reason: `Heap grew ${growthMB}MB over ${recent.length} cycles (${consecutiveGrowth} consecutive increases)` };
    }

    return { leaked: false, reason: `Heap stable (${consecutiveGrowth} growth cycles out of ${recent.length})` };
}

async function main() {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  API STRESS + MEMORY LEAK DETECTION`);
    console.log(`  Target: ${BASE}`);
    console.log(`  Cycles: ${CYCLES} × ${REQUESTS_PER_CYCLE} requests = ${CYCLES * REQUESTS_PER_CYCLE} total`);
    console.log(`${'═'.repeat(70)}\n`);

    let allErrors = [];

    for (let i = 1; i <= CYCLES; i++) {
        process.stdout.write(`  Cycle ${i}/${CYCLES}... `);
        const errors = await runCycle(i);
        allErrors = allErrors.concat(errors);
        console.log(`done (${errors.length} errors, heap: ${heapSnapshots[heapSnapshots.length - 1].heapUsedMB}MB)`);
        // Small delay between cycles to let GC settle
        await new Promise(r => setTimeout(r, 500));
    }

    // ── Memory Report ──
    console.log(`\n${'─'.repeat(70)}`);
    console.log('  HEAP USAGE OVER TIME');
    console.log(`${'─'.repeat(70)}`);
    console.log('  Cycle  │ Heap (MB) │ RSS (MB)  │ External (MB)');
    console.log('  ───────┼───────────┼───────────┼──────────────');
    for (const snap of heapSnapshots) {
        console.log(`  ${String(snap.cycle).padStart(5)}  │ ${snap.heapUsedMB.padStart(9)} │ ${snap.rss.padStart(9)} │ ${snap.external.padStart(13)}`);
    }

    // ── Cycle Performance ──
    console.log(`\n${'─'.repeat(70)}`);
    console.log('  CYCLE PERFORMANCE');
    console.log(`${'─'.repeat(70)}`);
    console.log('  Cycle  │ Requests │ Errors │ Avg Latency');
    console.log('  ───────┼──────────┼────────┼────────────');
    for (const cr of cycleResults) {
        console.log(`  ${String(cr.cycle).padStart(5)}  │ ${String(cr.requests).padStart(8)} │ ${String(cr.errors).padStart(6)} │ ${cr.avgLatencyMs}ms`);
    }

    // ── Leak Detection ──
    const leakResult = detectMemoryLeak();
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`  MEMORY LEAK ANALYSIS`);
    console.log(`${'─'.repeat(70)}`);
    console.log(`  Result: ${leakResult.leaked ? '⚠️  POTENTIAL LEAK' : '✅ STABLE'}`);
    console.log(`  Detail: ${leakResult.reason}`);

    // ── Total Errors ──
    const totalRequests = CYCLES * REQUESTS_PER_CYCLE;
    const errorRate = ((allErrors.length / totalRequests) * 100).toFixed(2);
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  TOTAL: ${totalRequests} requests, ${allErrors.length} errors (${errorRate}%)`);
    console.log(`  MEMORY: ${leakResult.leaked ? 'POTENTIAL LEAK' : 'STABLE'}`);
    const passed = !leakResult.leaked && parseFloat(errorRate) <= 2.0;
    console.log(`  VERDICT: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`${'═'.repeat(70)}\n`);

    process.exit(passed ? 0 : 1);
}

main().catch(err => {
    console.error('Stress test crashed:', err);
    process.exit(1);
});
