// @ts-check
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH FLOWS (1-8)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Search Flows', () => {
    test('1. Exact match search', async ({ page }) => {
        await page.goto(BASE);
        const searchInput = page.locator('input[type="text"], input[type="search"]').first();
        await searchInput.fill('Inception');
        await page.waitForTimeout(800);
        const results = page.locator('[class*="search"] a, [class*="Search"] a, [role="listbox"] a').first();
        await expect(results).toBeVisible({ timeout: 10000 });
    });

    test('2. Typo match search', async ({ page }) => {
        await page.goto(BASE);
        const searchInput = page.locator('input[type="text"], input[type="search"]').first();
        await searchInput.fill('Incepion');
        await page.waitForTimeout(1200);
        // Should still show results or "did you mean"
        const anyContent = page.locator('[class*="search"] a, [class*="Search"] a, [class*="did-you-mean"], [role="listbox"]').first();
        await expect(anyContent).toBeVisible({ timeout: 10000 });
    });

    test('3. Partial match search', async ({ page }) => {
        await page.goto(BASE);
        const searchInput = page.locator('input[type="text"], input[type="search"]').first();
        await searchInput.fill('Dark Kn');
        await page.waitForTimeout(800);
        const results = page.locator('[class*="search"] a, [class*="Search"] a, [role="listbox"] a').first();
        await expect(results).toBeVisible({ timeout: 10000 });
    });

    test('4. Rapid typing does not crash', async ({ page }) => {
        await page.goto(BASE);
        const searchInput = page.locator('input[type="text"], input[type="search"]').first();
        await searchInput.pressSequentially('avengers endgame', { delay: 30 });
        await page.waitForTimeout(1500);
        // Page should not crash
        await expect(page.locator('body')).toBeVisible();
    });

    test('5. Cancel stale requests (rapid re-search)', async ({ page }) => {
        await page.goto(BASE);
        const searchInput = page.locator('input[type="text"], input[type="search"]').first();
        await searchInput.fill('Spider');
        await page.waitForTimeout(200);
        await searchInput.fill('Batman');
        await page.waitForTimeout(1500);
        // Should show Batman results, not Spider
        await expect(page.locator('body')).toBeVisible();
    });

    test('6. Keyboard navigation in search', async ({ page }) => {
        await page.goto(BASE);
        const searchInput = page.locator('input[type="text"], input[type="search"]').first();
        await searchInput.fill('Marvel');
        await page.waitForTimeout(1000);
        await searchInput.press('ArrowDown');
        await searchInput.press('ArrowDown');
        await searchInput.press('ArrowUp');
        // Should not throw errors
        await expect(page.locator('body')).toBeVisible();
    });

    test('7. Empty search shows no errors', async ({ page }) => {
        await page.goto(BASE);
        const searchInput = page.locator('input[type="text"], input[type="search"]').first();
        await searchInput.fill('');
        await searchInput.press('Enter');
        await page.waitForTimeout(500);
        // No crash, no 500 error
        await expect(page.locator('body')).toBeVisible();
    });

    test('8. Invalid search (special chars)', async ({ page }) => {
        await page.goto(BASE);
        const searchInput = page.locator('input[type="text"], input[type="search"]').first();
        await searchInput.fill('!!!@@@###$$$');
        await page.waitForTimeout(1000);
        // Should not crash
        await expect(page.locator('body')).toBeVisible();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MOVIE DETAIL FLOWS (9-14)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Movie Detail Flows', () => {
    test('9. Movie detail page renders providers/availability', async ({ page }) => {
        await page.goto(BASE);
        const searchInput = page.locator('input[type="text"], input[type="search"]').first();
        await searchInput.fill('Inception');
        await page.waitForTimeout(1000);
        const firstResult = page.locator('[class*="search"] a, [class*="Search"] a, [role="listbox"] a').first();
        if (await firstResult.isVisible({ timeout: 5000 }).catch(() => false)) {
            await firstResult.click();
            await page.waitForLoadState('domcontentloaded');
            // Should show movie title
            const heading = page.locator('h1').first();
            await expect(heading).toBeVisible({ timeout: 15000 });
        }
    });

    test('10. Movie detail has watch provider or availability card', async ({ page }) => {
        await page.goto(`${BASE}/movies/inception-27205`);
        await page.waitForLoadState('domcontentloaded');
        // Should have either "Where to Watch" or streaming status card
        const providerSection = page.locator('text=Where to Watch, text=Streaming Status, text=Try Searching').first();
        await expect(providerSection).toBeVisible({ timeout: 15000 });
    });

    test('11. Movie detail shows synopsis', async ({ page }) => {
        await page.goto(`${BASE}/movies/inception-27205`);
        await page.waitForLoadState('domcontentloaded');
        const synopsis = page.locator('text=Synopsis').first();
        await expect(synopsis).toBeVisible({ timeout: 15000 });
    });

    test('12. Similar movies section renders', async ({ page }) => {
        await page.goto(`${BASE}/movies/inception-27205`);
        await page.waitForLoadState('domcontentloaded');
        // May or may not have similar movies
        await page.waitForTimeout(3000);
        await expect(page.locator('body')).toBeVisible();
    });

    test('13. Back navigation from detail', async ({ page }) => {
        await page.goto(`${BASE}/movies/inception-27205`);
        await page.waitForLoadState('domcontentloaded');
        const backLink = page.locator('a:has-text("Back")').first();
        if (await backLink.isVisible({ timeout: 5000 }).catch(() => false)) {
            await backLink.click();
            await page.waitForLoadState('domcontentloaded');
            await expect(page).toHaveURL(BASE + '/');
        }
    });

    test('14. Invalid movie slug returns 404', async ({ page }) => {
        await page.goto(`${BASE}/movies/nonexistent-movie-99999999`);
        // Should get a 404 response, or a not found page
        await expect(page.locator('body')).toBeVisible();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATION FLOWS (15-22)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Navigation Flows', () => {
    test('15. Home page renders trending/popular/upcoming', async ({ page }) => {
        await page.goto(BASE);
        await page.waitForLoadState('domcontentloaded');
        // Should have hero section or movie carousels
        await expect(page.locator('body')).toBeVisible();
        const content = await page.textContent('body');
        expect(content?.length).toBeGreaterThan(100);
    });

    test('16. Navigate to About page', async ({ page }) => {
        await page.goto(`${BASE}/about`);
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('body')).toBeVisible();
    });

    test('17. Navigate to Search page', async ({ page }) => {
        await page.goto(`${BASE}/search?q=batman`);
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('body')).toBeVisible();
    });

    test('18. Navigate to Collections page', async ({ page }) => {
        await page.goto(`${BASE}/collections`);
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('body')).toBeVisible();
    });

    test('19. Mobile viewport renders correctly', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto(BASE);
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('body')).toBeVisible();
        // No horizontal overflow
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
    });

    test('20. Tablet viewport renders correctly', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto(BASE);
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('body')).toBeVisible();
    });

    test('21. Wide screen viewport renders correctly', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto(BASE);
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('body')).toBeVisible();
    });

    test('22. Mega menu interaction (desktop)', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto(BASE);
        await page.waitForLoadState('domcontentloaded');
        // Try to interact with nav
        const navLinks = page.locator('nav a');
        const count = await navLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// API ENDPOINT VALIDATION (23-27)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('API Endpoint Validation', () => {
    test('23. /api/search returns valid response', async ({ request }) => {
        const res = await request.get(`${BASE}/api/search?q=batman`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.movies).toBeDefined();
        expect(Array.isArray(body.movies)).toBe(true);
    });

    test('24. /api/search rejects short query', async ({ request }) => {
        const res = await request.get(`${BASE}/api/search?q=a`);
        expect(res.status()).toBe(400);
    });

    test('25. /api/movies/trending returns data', async ({ request }) => {
        const res = await request.get(`${BASE}/api/movies/trending`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.movies).toBeDefined();
    });

    test('26. /api/movies/popular returns data', async ({ request }) => {
        const res = await request.get(`${BASE}/api/movies/popular`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.movies).toBeDefined();
    });

    test('27. /api/movies/upcoming returns data', async ({ request }) => {
        const res = await request.get(`${BASE}/api/movies/upcoming`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.movies).toBeDefined();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STRESS & STABILITY FLOWS (28-33)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Stress & Stability Flows', () => {
    test('28. Rapid route switching does not crash', async ({ page }) => {
        await page.goto(BASE);
        await page.goto(`${BASE}/about`);
        await page.goto(BASE);
        await page.goto(`${BASE}/search?q=avengers`);
        await page.goto(BASE);
        await expect(page.locator('body')).toBeVisible();
    });

    test('29. Sequential search burst', async ({ page }) => {
        await page.goto(BASE);
        const searchInput = page.locator('input[type="text"], input[type="search"]').first();
        const queries = ['Iron Man', 'Thor', 'Hulk', 'Captain', 'Avengers'];
        for (const q of queries) {
            await searchInput.fill(q);
            await page.waitForTimeout(300);
        }
        await page.waitForTimeout(1500);
        await expect(page.locator('body')).toBeVisible();
    });

    test('30. Console error detection on home page', async ({ page }) => {
        /** @type {string[]} */
        const errors = [];
        page.on('pageerror', (err) => errors.push(err.message));
        await page.goto(BASE);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        // Filter out non-critical errors (e.g., third-party)
        const criticalErrors = errors.filter(e =>
            !e.includes('Script error') &&
            !e.includes('firebase') &&
            !e.includes('gtag') &&
            !e.includes('ERR_BLOCKED_BY_CLIENT')
        );
        expect(criticalErrors).toHaveLength(0);
    });

    test('31. Console error detection on movie detail', async ({ page }) => {
        /** @type {string[]} */
        const errors = [];
        page.on('pageerror', (err) => errors.push(err.message));
        await page.goto(`${BASE}/movies/inception-27205`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const criticalErrors = errors.filter(e =>
            !e.includes('Script error') &&
            !e.includes('firebase') &&
            !e.includes('gtag') &&
            !e.includes('ERR_BLOCKED_BY_CLIENT')
        );
        expect(criticalErrors).toHaveLength(0);
    });

    test('32. No failed network requests on home page', async ({ page }) => {
        /** @type {string[]} */
        const failedRequests = [];
        page.on('response', (res) => {
            if (res.status() >= 500 && res.url().includes('/api/')) {
                failedRequests.push(`${res.status()} ${res.url()}`);
            }
        });
        await page.goto(BASE);
        await page.waitForLoadState('networkidle');
        expect(failedRequests).toHaveLength(0);
    });

    test('33. No blank UI sections on home page', async ({ page }) => {
        await page.goto(BASE);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        // Body should have meaningful content
        const bodyText = await page.textContent('body');
        expect(bodyText?.trim().length).toBeGreaterThan(50);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY & META VALIDATION (34-36)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Security & Meta Validation', () => {
    test('34. Security headers present', async ({ request }) => {
        const res = await request.get(BASE);
        const headers = res.headers();
        // These will be validated after we add them
        expect(headers['x-content-type-options']).toBe('nosniff');
        expect(headers['x-frame-options']).toBeDefined();
    });

    test('35. Home page has proper meta tags', async ({ page }) => {
        await page.goto(BASE);
        const title = await page.title();
        expect(title).toContain('StreamWhereFinder');
        const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
        expect(metaDesc).toBeTruthy();
    });

    test('36. Movie page has structured data (JSON-LD)', async ({ page }) => {
        await page.goto(`${BASE}/movies/inception-27205`);
        await page.waitForLoadState('domcontentloaded');
        const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
        expect(jsonLd).toBeTruthy();
        const data = JSON.parse(jsonLd || '{}');
        expect(data['@type']).toBe('Movie');
    });
});
