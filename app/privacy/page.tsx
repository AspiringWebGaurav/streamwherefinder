import { Navbar } from '@/components/Navbar';

export const metadata = { title: "Privacy Policy | StreamWhere Enterprise" };

export default function PrivacyPage() {
    return (
        <div className="bg-[var(--saas-bg)] min-h-screen">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
                <header className="mb-12 border-b border-[var(--saas-border)] pb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--saas-text-primary)] tracking-tight mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-[var(--saas-text-secondary)]">Effective date: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </header>

                <article className="prose prose-slate max-w-none text-[var(--saas-text-primary)] space-y-8">
                    <section>
                        <h2 className="text-xl font-bold mb-3 mt-8">Introduction</h2>
                        <p className="text-[var(--saas-text-secondary)] leading-relaxed">
                            At StreamWhere Enterprise, we take your privacy seriously. This document outlines the types of information we collect and how we use it to provide our streaming intelligence services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 mt-8">Information We Collect</h2>
                        <p className="text-[var(--saas-text-secondary)] leading-relaxed mb-4">
                            We collect minimal information necessary to provide the Service:
                        </p>
                        <ul className="list-disc pl-5 text-[var(--saas-text-secondary)] space-y-2">
                            <li><strong>Search Queries:</strong> Anonymized search terms are temporarily logged to improve our Levenshtein typo-tolerance algorithms.</li>
                            <li><strong>Usage Data:</strong> Basic clickstream analytics to optimize performance and server routing.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 mt-8">Data Security</h2>
                        <p className="text-[var(--saas-text-secondary)] leading-relaxed">
                            All data interactions with our backend systems are secured via HTTPS. We do not store persistent personal data against unauthenticated sessions, nor do we require mandatory authentication to access the core catalog.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 mt-8">Third-Party Services</h2>
                        <p className="text-[var(--saas-text-secondary)] leading-relaxed">
                            We use The Movie Database (TMDB) API as our primary data source. Please refer to their privacy policy regarding the collection of data when images and rich media are served from their domains.
                        </p>
                    </section>
                </article>
            </main>
        </div>
    );
}
