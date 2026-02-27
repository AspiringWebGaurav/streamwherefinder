import { Navbar } from '@/components/Navbar';

export const metadata = { title: "Terms of Service | StreamWhere Enterprise" };

export default function TermsPage() {
    return (
        <div className="bg-[var(--saas-bg)] min-h-screen">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
                <header className="mb-12 border-b border-[var(--saas-border)] pb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--saas-text-primary)] tracking-tight mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-[var(--saas-text-secondary)]">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </header>

                <article className="prose prose-slate max-w-none text-[var(--saas-text-primary)] space-y-8">
                    <section>
                        <h2 className="text-xl font-bold mb-3 mt-8">1. Acceptance of Terms</h2>
                        <p className="text-[var(--saas-text-secondary)] leading-relaxed">
                            By accessing and using the StreamWhere Enterprise data layer (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 mt-8">2. Data Usage & Licensing</h2>
                        <p className="text-[var(--saas-text-secondary)] leading-relaxed">
                            Our service aggregates streaming availability data using the TMDB API. You acknowledge that all movie metadata, posters, and availability rights belong to their respective owners. StreamWhere makes no claim of ownership over content accessed via our API endpoints.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 mt-8">3. API Rate Limiting</h2>
                        <p className="text-[var(--saas-text-secondary)] leading-relaxed">
                            To ensure platform stability, enterprise endpoints (`/api/search`, `/api/movies/*`) are subject to rate limiting. Reverse-engineering our underlying search normalisation algorithms is strictly prohibited.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 mt-8">4. Service Availability</h2>
                        <p className="text-[var(--saas-text-secondary)] leading-relaxed">
                            While we strive for 99.9% uptime, the Service is provided &quot;as is&quot; and &quot;as available&quot;. We reserve the right to modify, suspend, or discontinue the Service at any time without notice.
                        </p>
                    </section>
                </article>
            </main>
        </div>
    );
}
