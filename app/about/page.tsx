import { Navbar } from '@/components/Navbar';
import { ArrowRight } from 'lucide-react';

export const metadata = { title: "About Us | StreamWhere Enterprise" };

export default function AboutPage() {
    return (
        <div className="bg-[var(--saas-bg)] min-h-screen">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
                <header className="mb-16">
                    <p className="text-[var(--saas-accent)] font-bold text-sm tracking-widest uppercase mb-3">Our Mission</p>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--saas-text-primary)] tracking-tight mb-6">
                        Organizing global streaming data.
                    </h1>
                    <p className="text-xl text-[var(--saas-text-secondary)] leading-relaxed">
                        We are building the enterprise intelligence layer for the entertainment industry. StreamWhere answers a simple question: &quot;Where can I watch this legally?&quot; but we do it with industrial-grade reliability.
                    </p>
                </header>

                <article className="prose prose-slate max-w-none text-[var(--saas-text-secondary)] space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--saas-text-primary)] mb-4">The Problem</h2>
                        <p>
                            The streaming landscape is fragmented. Content licenses change weekly across 200+ global regions.
                            Consumers and businesses alike suffer from terrible search experiences, inaccurate availability states, and poor performance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--saas-text-primary)] mb-4">Our Technology</h2>
                        <p>
                            We&apos;ve engineered a high-availability wrapper around tmdb data that features native typo-tolerance, continuous duplicate-character normalisation, and a weighted similarity engine that serves suggestions in under 250ms.
                        </p>
                    </section>

                    <div className="mt-16 p-8 bg-white border border-[var(--saas-border)] rounded-2xl shadow-[var(--saas-shadow-sm)]">
                        <h3 className="text-lg font-bold text-[var(--saas-text-primary)] mb-2">Designed by Gaurav</h3>
                        <p className="text-sm text-[var(--saas-text-muted)] mb-6">
                            This system is part of an enterprise UI portfolio showcasing complex frontend architecture wrapped around frozen, production-grade logic.
                        </p>
                        <a
                            href="https://gauravpatil.online"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--saas-accent)] hover:text-[var(--saas-accent-hover)] transition-colors"
                        >
                            View Full Portfolio <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </article>
            </main>
        </div>
    );
}
