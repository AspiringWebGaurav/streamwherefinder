import { ArrowLeft, Mail, MessageCircle, Bug, Shield, AlertTriangle } from 'lucide-react';
import { EnterpriseSearchBar } from '@/components/EnterpriseSearchBar';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us - StreamWhere',
    description: 'Get in touch with StreamWhere for support, feedback, or to report issues. We are here to help.',
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[var(--saas-bg)]">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-blue-50/50 border border-blue-100/50 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-[var(--saas-text-primary)] mb-4 tracking-tight">
                        Contact Us
                    </h1>
                    <p className="text-lg text-[var(--saas-text-secondary)] max-w-2xl mx-auto">
                        We'd love to hear from you. Get in touch for support, feedback, or any questions about StreamWhere.
                    </p>
                </div>

                {/* Contact Options */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* General Contact */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[var(--saas-border-light)] p-8 hover:border-[var(--saas-border)] transition-colors">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                                <MessageCircle className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--saas-text-primary)] mb-2">General Inquiries</h3>
                            <p className="text-sm text-[var(--saas-text-secondary)] mb-6">
                                Questions about our service, partnerships, or general feedback.
                            </p>
                            <a
                                href="mailto:hello@streamwhere.com"
                                className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"
                            >
                                hello@streamwhere.com
                            </a>
                        </div>
                    </div>

                    {/* Technical Support */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[var(--saas-border-light)] p-8 hover:border-[var(--saas-border)] transition-colors">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                                <Bug className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--saas-text-primary)] mb-2">Technical Support</h3>
                            <p className="text-sm text-[var(--saas-text-secondary)] mb-6">
                                Report bugs, technical issues, or problems with the website.
                            </p>
                            <a
                                href="mailto:support@streamwhere.com"
                                className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-800"
                            >
                                support@streamwhere.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* Legal and Copyright */}
                <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-8 mb-12 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                        <div className="p-3 bg-amber-100 rounded-xl flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-amber-700" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-amber-900 mb-2">Copyright & Legal Issues</h3>
                            <p className="text-sm font-medium text-amber-800/80 mb-4 leading-relaxed">
                                If you are a content owner and believe your copyrighted material appears on our site inappropriately,
                                or if you have legal concerns, please <Link href="/takedown" className="underline decoration-amber-500/30 underline-offset-4 hover:decoration-amber-500 transition-colors cursor-pointer text-amber-900 font-bold">submit a DMCA Takedown Request.</Link>
                            </p>
                            <a
                                href="mailto:legal@streamwherefinder.com"
                                className="inline-flex items-center text-sm font-bold text-amber-900 hover:text-amber-700 transition-colors"
                            >
                                <Shield className="w-4 h-4 mr-2 opacity-80" />
                                legal@streamwherefinder.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* Response Time */}
                <div className="bg-white rounded-2xl shadow-sm border border-[var(--saas-border-light)] p-8 mb-12">
                    <h2 className="text-xl font-bold text-[var(--saas-text-primary)] mb-6 border-b border-[var(--saas-border-light)] pb-4">Response Times</h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        <div className="bg-[var(--saas-bg)] border border-[var(--saas-border)] p-4 rounded-xl">
                            <div className="text-lg font-extrabold text-blue-600 mb-1">24-48 hours</div>
                            <div className="text-sm font-medium text-[var(--saas-text-secondary)]">General inquiries and feedback</div>
                        </div>
                        <div className="bg-[var(--saas-bg)] border border-[var(--saas-border)] p-4 rounded-xl">
                            <div className="text-lg font-extrabold text-emerald-600 mb-1">12-24 hours</div>
                            <div className="text-sm font-medium text-[var(--saas-text-secondary)]">Technical support and bug reports</div>
                        </div>
                        <div className="bg-[var(--saas-bg)] border border-[var(--saas-border)] p-4 rounded-xl">
                            <div className="text-lg font-extrabold text-amber-600 mb-1">6-12 hours</div>
                            <div className="text-sm font-medium text-[var(--saas-text-secondary)]">Legal and copyright issues</div>
                        </div>
                    </div>
                </div>

                {/* Alternative Ways to Reach Us */}
                <div className="bg-white rounded-2xl shadow-sm border border-[var(--saas-border-light)] p-8">
                    <h2 className="text-xl font-bold text-[var(--saas-text-primary)] mb-4 text-center">Still Need Help?</h2>

                    <div className="text-center">
                        <p className="text-[var(--saas-text-secondary)] mb-8 font-medium">
                            Can't find what you're looking for? Try searching for a movie.
                        </p>

                        <div className="max-w-xl mx-auto mb-8 relative z-50">
                            <EnterpriseSearchBar placeholder="Type a movie name..." />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <Link href="/" className="btn-primary">
                                Explore Movies
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
