import { BookOpen, Code, Key, FileJson, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

export const metadata = {
    title: 'API Documentation - StreamWhere Enterprise',
    description: 'Integrate the StreamWhere enterprise movie intelligence API into your application.',
};

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-[var(--saas-bg)]">
            <Navbar />
            <div className="pt-12 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--saas-accent-light)] text-[var(--saas-accent)] text-sm font-semibold tracking-wide border border-[var(--saas-accent)]/20 shadow-sm mb-6">
                            <BookOpen className="w-4 h-4" />
                            Developer Hub
                        </div>
                        <h1 className="text-4xl font-extrabold text-[var(--saas-text-primary)] tracking-tight mb-4">
                            API Documentation
                        </h1>
                        <p className="text-lg text-[var(--saas-text-secondary)]">
                            Access our high-availability movie intelligence data. Built for scale, with built-in typo tolerance and region-specific streaming availability.
                        </p>
                    </div>

                    {/* Getting Started */}
                    <section className="bg-white rounded-2xl shadow-[var(--saas-shadow-md)] border border-[var(--saas-border)] overflow-hidden mb-12">
                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Key className="w-6 h-6 text-[var(--saas-accent)]" />
                                <h2 className="text-2xl font-bold text-[var(--saas-text-primary)]">Getting Started</h2>
                            </div>
                            <p className="text-[var(--saas-text-secondary)] mb-6">
                                The StreamWhere API is organized around REST. Our API has predictable resource-oriented URLs, returns JSON-encoded responses, and uses standard HTTP response codes.
                            </p>
                            <div className="bg-[var(--saas-bg)] border border-[var(--saas-border-light)] rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-[var(--saas-text-primary)] mb-2 uppercase tracking-wide">Base URL</h3>
                                <code className="text-[var(--saas-accent)] font-mono text-sm bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                    https://yourdomain.com/api
                                </code>
                            </div>
                        </div>
                    </section>

                    {/* Endpoints */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-[var(--saas-text-primary)] pb-2 border-b border-[var(--saas-border-light)]">Endpoints</h2>

                        {/* Search API */}
                        <div className="bg-white rounded-2xl shadow-[var(--saas-shadow-sm)] border border-[var(--saas-border)] overflow-hidden">
                            <div className="bg-[var(--saas-bg)] border-b border-[var(--saas-border-light)] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="bg-green-100 text-green-700 font-mono text-xs font-bold px-2 py-1 rounded">GET</span>
                                    <code className="font-mono text-[var(--saas-text-primary)] font-semibold">/api/search</code>
                                </div>
                                <span className="text-sm text-[var(--saas-text-secondary)]">Intelligent Movie Search</span>
                            </div>
                            <div className="p-6">
                                <p className="text-[var(--saas-text-secondary)] mb-4">
                                    Searches for movies with built-in typo tolerance. Returns exact matches and highly probable matches based on Levenshtein distance.
                                </p>
                                <h4 className="font-semibold text-[var(--saas-text-primary)] mb-2 text-sm">Query Parameters</h4>
                                <div className="overflow-x-auto mb-6">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b border-[var(--saas-border-light)]">
                                                <th className="pb-2 font-medium text-[var(--saas-text-secondary)] w-1/4">Parameter</th>
                                                <th className="pb-2 font-medium text-[var(--saas-text-secondary)] w-1/4">Type</th>
                                                <th className="pb-2 font-medium text-[var(--saas-text-secondary)]">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--saas-border-light)] text-[var(--saas-text-primary)]">
                                            <tr>
                                                <td className="py-3"><code className="text-[var(--saas-accent)]">q</code> <span className="text-red-500 text-xs">*</span></td>
                                                <td className="py-3 font-mono text-xs">string</td>
                                                <td className="py-3 text-[var(--saas-text-secondary)]">The search query (e.g., &quot;Inxeption&quot;). Minimum 2 characters.</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3"><code className="text-[var(--saas-text-primary)]">limit</code></td>
                                                <td className="py-3 font-mono text-xs">integer</td>
                                                <td className="py-3 text-[var(--saas-text-secondary)]">Items per page. Default: 10. Maximum: 20 for standard queries.</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3"><code className="text-[var(--saas-text-primary)]">page</code></td>
                                                <td className="py-3 font-mono text-xs">integer</td>
                                                <td className="py-3 text-[var(--saas-text-secondary)]">Page number for pagination. Default: 1.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <h4 className="font-semibold text-[var(--saas-text-primary)] mb-2 text-sm items-center flex gap-2">
                                    <FileJson className="w-4 h-4 text-[var(--saas-text-muted)]" /> Example Response
                                </h4>
                                <pre className="bg-[#0f172a] text-gray-300 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-[#1e293b]">
                                    {`{
  "query": "Inxeption",
  "totalResults": 142,
  "page": 1,
  "totalPages": 8,
  "movies": [
    {
      "id": 27205,
      "title": "Inception",
      "overview": "Cobb, a skilled thief...",
      "poster_path": "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
      "release_date": "2010-07-15",
      "vote_average": 8.4
    }
  ]
}`}
                                </pre>
                            </div>
                        </div>

                        {/* Movie Details API */}
                        <div className="bg-white rounded-2xl shadow-[var(--saas-shadow-sm)] border border-[var(--saas-border)] overflow-hidden">
                            <div className="bg-[var(--saas-bg)] border-b border-[var(--saas-border-light)] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="bg-green-100 text-green-700 font-mono text-xs font-bold px-2 py-1 rounded">GET</span>
                                    <code className="font-mono text-[var(--saas-text-primary)] font-semibold">/api/movies/[slug]</code>
                                </div>
                                <span className="text-sm text-[var(--saas-text-secondary)]">Content Details & Streaming Providers</span>
                            </div>
                            <div className="p-6">
                                <p className="text-[var(--saas-text-secondary)] mb-4">
                                    Retrieves comprehensive details for a specific movie, including real-time streaming provider availability across different monetization types (flatrate, rent, buy).
                                </p>
                                <div className="overflow-x-auto mb-6">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b border-[var(--saas-border-light)]">
                                                <th className="pb-2 font-medium text-[var(--saas-text-secondary)] w-1/4">Parameter</th>
                                                <th className="pb-2 font-medium text-[var(--saas-text-secondary)] w-1/4">Type</th>
                                                <th className="pb-2 font-medium text-[var(--saas-text-secondary)]">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--saas-border-light)] text-[var(--saas-text-primary)]">
                                            <tr>
                                                <td className="py-3"><code className="text-[var(--saas-accent)]">slug</code> <span className="text-red-500 text-xs">*</span></td>
                                                <td className="py-3 font-mono text-xs">string</td>
                                                <td className="py-3 text-[var(--saas-text-secondary)]">The URL-friendly identifier for the movie.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Discovery Curations API */}
                        <div className="bg-white rounded-2xl shadow-[var(--saas-shadow-sm)] border border-[var(--saas-border)] overflow-hidden">
                            <div className="bg-[var(--saas-bg)] border-b border-[var(--saas-border-light)] px-6 py-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-green-100 text-green-700 font-mono text-xs font-bold px-2 py-1 rounded">GET</span>
                                    <code className="font-mono text-[var(--saas-text-primary)] font-semibold">/api/movies/trending</code>
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-green-100 text-green-700 font-mono text-xs font-bold px-2 py-1 rounded">GET</span>
                                    <code className="font-mono text-[var(--saas-text-primary)] font-semibold">/api/movies/popular</code>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="bg-green-100 text-green-700 font-mono text-xs font-bold px-2 py-1 rounded">GET</span>
                                    <code className="font-mono text-[var(--saas-text-primary)] font-semibold">/api/movies/upcoming</code>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-[var(--saas-text-secondary)]">
                                    Access our highly-cached curation endpoints. These routes are perfect for populating discovery carousels or homepage grids. They share the same standard pagination contract as the search endpoint.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Integration Support */}
                    <div className="mt-12 text-center p-8 bg-[var(--saas-accent-light)]/30 rounded-2xl border border-[var(--saas-accent)]/20">
                        <Code className="w-8 h-8 text-[var(--saas-accent)] mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-[var(--saas-text-primary)] mb-2">Need SDK Support?</h3>
                        <p className="text-[var(--saas-text-secondary)] max-w-xl mx-auto mb-6">
                            We offer native TypeScript/JavaScript clients for enterprise customers to speed up integration.
                        </p>
                        <Link href="/contact" className="btn-primary inline-flex gap-2">
                            Contact Solutions Engineering <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
