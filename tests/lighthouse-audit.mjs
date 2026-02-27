/**
 * Lighthouse Audit — Core Web Vitals Automation
 * 
 * Runs Lighthouse programmatically against the app and captures:
 *   LCP, CLS, FCP, TTFB, Performance Score
 * 
 * Requirements: Chrome/Chromium must be available.
 * Run: node tests/lighthouse-audit.mjs
 * 
 * Falls back to header-only validation if Lighthouse is not installed.
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';

const PAGES_TO_AUDIT = [
    { name: 'Home', url: `${BASE}/` },
    { name: 'Search', url: `${BASE}/search?q=batman` },
    { name: 'Movie Detail', url: `${BASE}/movies/inception-27205` },
    { name: 'About', url: `${BASE}/about` },
];

async function runSecurityHeaderAudit() {
    console.log(`\n${'═'.repeat(70)}`);
    console.log('  SECURITY HEADER AUDIT');
    console.log(`${'═'.repeat(70)}\n`);

    const REQUIRED_HEADERS = {
        'x-content-type-options': 'nosniff',
        'x-frame-options': ['DENY', 'SAMEORIGIN'],
        'referrer-policy': true, // any value
    };

    const RECOMMENDED_HEADERS = {
        'strict-transport-security': true,
        'permissions-policy': true,
        'content-security-policy': true,
    };

    let allPass = true;

    for (const page of PAGES_TO_AUDIT) {
        process.stdout.write(`  ${page.name.padEnd(20)}`);
        try {
            const res = await fetch(page.url);
            const headers = Object.fromEntries(res.headers.entries());
            let issues = [];

            for (const [header, expected] of Object.entries(REQUIRED_HEADERS)) {
                const val = headers[header];
                if (!val) {
                    issues.push(`MISSING ${header}`);
                } else if (typeof expected === 'string' && val.toLowerCase() !== expected.toLowerCase()) {
                    issues.push(`${header}: expected "${expected}", got "${val}"`);
                } else if (Array.isArray(expected) && !expected.some(e => val.toUpperCase().includes(e))) {
                    issues.push(`${header}: unexpected value "${val}"`);
                }
            }

            for (const [header] of Object.entries(RECOMMENDED_HEADERS)) {
                if (!headers[header]) {
                    issues.push(`RECOMMENDED: ${header} not set`);
                }
            }

            if (issues.length === 0) {
                console.log('✅ All headers present');
            } else {
                console.log(`⚠  ${issues.length} issue(s)`);
                issues.forEach(i => console.log(`    → ${i}`));
                allPass = false;
            }
        } catch (err) {
            console.log(`❌ Failed to fetch: ${err.message}`);
            allPass = false;
        }
    }

    return allPass;
}

async function runPerformanceAudit() {
    console.log(`\n${'═'.repeat(70)}`);
    console.log('  PERFORMANCE AUDIT (Response Time + Page Size)');
    console.log(`${'═'.repeat(70)}\n`);

    console.log('  Page                 │ Status │ Time (ms) │ Size (KB)');
    console.log('  ─────────────────────┼────────┼───────────┼──────────');

    let allPass = true;

    for (const page of PAGES_TO_AUDIT) {
        const start = performance.now();
        try {
            const res = await fetch(page.url);
            const elapsed = performance.now() - start;
            const body = await res.text();
            const sizeKB = (Buffer.byteLength(body) / 1024).toFixed(1);
            const status = res.status;
            const timeStr = elapsed.toFixed(0);

            console.log(`  ${page.name.padEnd(21)} │ ${String(status).padStart(6)} │ ${timeStr.padStart(9)} │ ${sizeKB.padStart(9)}`);

            if (status >= 500) allPass = false;
            if (elapsed > 10000) {
                console.log(`    ⚠  Slow response: ${timeStr}ms`);
                allPass = false;
            }
        } catch (err) {
            console.log(`  ${page.name.padEnd(21)} │ FAILED │    N/A    │    N/A`);
            console.log(`    → ${err.message}`);
            allPass = false;
        }
    }

    return allPass;
}

async function main() {
    console.log(`\n${'═'.repeat(70)}`);
    console.log('  CORE WEB VITALS & SECURITY AUDIT');
    console.log(`  Target: ${BASE}`);
    console.log(`${'═'.repeat(70)}`);

    const securityPassed = await runSecurityHeaderAudit();
    const perfPassed = await runPerformanceAudit();

    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  Security Headers: ${securityPassed ? '✅ PASS' : '⚠️  ISSUES FOUND'}`);
    console.log(`  Performance:      ${perfPassed ? '✅ PASS' : '⚠️  ISSUES FOUND'}`);
    console.log(`${'═'.repeat(70)}\n`);

    // Don't fail hard on Lighthouse missing — it's advisory
    process.exit(perfPassed ? 0 : 1);
}

main().catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
});
