'use client';

import { useState } from 'react';
import { Shield, CheckCircle, AlertCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

interface TakedownFormData {
    name: string;
    email: string;
    organization: string;
    copyrightedWork: string;
    contentUrl: string;
    description: string;
    goodFaith: boolean;
    perjuryStatement: boolean;
    signature: string;
}

export default function TakedownPage() {
    const [formData, setFormData] = useState<TakedownFormData>({
        name: '',
        email: '',
        organization: '',
        copyrightedWork: '',
        contentUrl: '',
        description: '',
        goodFaith: false,
        perjuryStatement: false,
        signature: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const requiredFields = [
            'name', 'email', 'organization', 'copyrightedWork',
            'contentUrl', 'description', 'signature'
        ];

        const missing = requiredFields.filter(field => !formData[field as keyof TakedownFormData]);

        if (missing.length > 0) {
            setError(`Please fill in all required fields.`);
            setIsSubmitting(false);
            return;
        }

        if (!formData.goodFaith || !formData.perjuryStatement) {
            setError('You must agree to both required statements');
            setIsSubmitting(false);
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSubmitted(true);
        } catch {
            setError('Failed to submit takedown request. Please try again or contact us directly.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateFormData = (field: keyof TakedownFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[var(--saas-bg)] flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-sm border border-[var(--saas-border-light)] p-8 text-center">
                        <div className="w-16 h-16 bg-emerald-50 border border-emerald-100/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-[var(--saas-text-primary)] mb-3">
                            Takedown Request Submitted
                        </h1>

                        <p className="text-sm font-medium text-[var(--saas-text-secondary)] mb-6">
                            Your DMCA takedown request has been received and will be reviewed by our legal team within 72 hours.
                        </p>

                        <div className="bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-xl p-4 mb-8 text-left">
                            <p className="text-[var(--saas-text-primary)] text-sm font-semibold mb-1">What happens next?</p>
                            <p className="text-[var(--saas-text-secondary)] text-sm">
                                We&apos;ll acknowledge receipt within 6 hours and provide a final resolution within 72 hours.
                                You&apos;ll receive updates at: <span className="font-semibold text-[var(--saas-text-primary)]">{formData.email}</span>
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link href="/" className="btn-primary w-full justify-center">Return to Home</Link>
                            <Link href="/contact" className="btn-secondary w-full justify-center">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--saas-bg)] pb-16">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-rose-50 border border-rose-100/50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                        <Shield className="w-8 h-8 text-rose-600" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                        DMCA Takedown Request
                    </h1>
                    <p className="text-lg text-gray-600">
                        Submit a formal request to remove copyrighted content from StreamWhere.
                    </p>
                </div>

                {/* Important Notice */}                        <div className="rounded-xl bg-amber-50 p-6 border border-amber-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800">Important Notice Before You File</h3>
                            <div className="mt-2 text-sm text-amber-700 space-y-2">
                                <p>
                                    StreamWhere is a discovery service only. We do not host, stream, or provide access to movies or copyrighted content.
                                </p>
                                <p>
                                    We only provide information about where to find legal streaming options.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 72 Hour Commitment */}
                {/* 72 Hour Commitment */}
                <div className="bg-rose-50/50 border border-rose-200/50 rounded-2xl p-6 mb-8 shadow-sm">
                    <p className="text-rose-900 text-sm font-semibold">
                        72-Hour Commitment: We will review and respond to your request within 72 hours of receipt.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-[var(--saas-border-light)] p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-[var(--saas-text-primary)] border-b border-[var(--saas-border-light)] pb-2">Contact Information</h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-bold text-[var(--saas-text-primary)] mb-1.5">
                                        Full Name *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => updateFormData('name', e.target.value)}
                                        className="w-full h-11 px-4 bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--saas-accent)] focus:border-transparent transition-all outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-[var(--saas-text-primary)] mb-1.5">
                                        Email Address *
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => updateFormData('email', e.target.value)}
                                        className="w-full h-11 px-4 bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--saas-accent)] focus:border-transparent transition-all outline-none"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="organization" className="block text-sm font-bold text-[var(--saas-text-primary)] mb-1.5">
                                    Organization/Company *
                                </label>
                                <input
                                    id="organization"
                                    type="text"
                                    required
                                    value={formData.organization}
                                    onChange={(e) => updateFormData('organization', e.target.value)}
                                    className="w-full h-11 px-4 bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--saas-accent)] focus:border-transparent transition-all outline-none"
                                    placeholder="Copyright owner or authorized representative"
                                />
                            </div>
                        </div>

                        {/* Copyright Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-[var(--saas-text-primary)] border-b border-[var(--saas-border-light)] pb-2">Copyright Information</h3>

                            <div>
                                <label htmlFor="copyrightedWork" className="block text-sm font-bold text-[var(--saas-text-primary)] mb-1.5">
                                    Copyrighted Work *
                                </label>
                                <input
                                    id="copyrightedWork"
                                    type="text"
                                    required
                                    value={formData.copyrightedWork}
                                    onChange={(e) => updateFormData('copyrightedWork', e.target.value)}
                                    className="w-full h-11 px-4 bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--saas-accent)] focus:border-transparent transition-all outline-none"
                                    placeholder="e.g., Movie Title (Year), Poster Image, etc."
                                />
                            </div>

                            <div>
                                <label htmlFor="contentUrl" className="block text-sm font-bold text-[var(--saas-text-primary)] mb-1.5">
                                    URL of Infringing Content *
                                </label>
                                <input
                                    id="contentUrl"
                                    type="url"
                                    required
                                    value={formData.contentUrl}
                                    onChange={(e) => updateFormData('contentUrl', e.target.value)}
                                    className="w-full h-11 px-4 bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--saas-accent)] focus:border-transparent transition-all outline-none"
                                    placeholder="https://streamwherefinder.com/movies/..."
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-bold text-[var(--saas-text-primary)] mb-1.5">
                                    Detailed Description *
                                </label>
                                <textarea
                                    id="urls"
                                    name="urls"
                                    rows={4}
                                    className="w-full p-4 bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--saas-accent)] focus:border-transparent transition-all outline-none resize-none"
                                    placeholder="https://streamwhere.com/movies/..."
                                />
                            </div>
                        </div>

                        {/* Legal Statements */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-[var(--saas-text-primary)] border-b border-[var(--saas-border-light)] pb-2">Required Legal Statements</h3>

                            <div className="space-y-4 bg-[var(--saas-bg)] p-4 rounded-xl border border-[var(--saas-border)]">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <div className="relative flex items-center mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={formData.goodFaith}
                                            onChange={(e) => updateFormData('goodFaith', e.target.checked)}
                                            className="peer w-5 h-5 cursor-pointer appearance-none rounded-md border-2 border-[var(--saas-border)] checked:border-[var(--saas-accent)] checked:bg-[var(--saas-accent)] transition-all"
                                            required
                                        />
                                        <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" viewBox="0 0 14 10" fill="none">
                                            <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-[var(--saas-text-primary)] leading-normal">
                                        I have a good faith belief that the use of the copyrighted material is not authorized by the
                                        copyright owner, its agent, or the law.
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <div className="relative flex items-center mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={formData.perjuryStatement}
                                            onChange={(e) => updateFormData('perjuryStatement', e.target.checked)}
                                            className="peer w-5 h-5 cursor-pointer appearance-none rounded-md border-2 border-[var(--saas-border)] checked:border-[var(--saas-accent)] checked:bg-[var(--saas-accent)] transition-all"
                                            required
                                        />
                                        <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" viewBox="0 0 14 10" fill="none">
                                            <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-[var(--saas-text-primary)] leading-normal">
                                        I swear, under penalty of perjury, that the information in this notice is accurate and
                                        that I am the copyright owner or am authorized to act on behalf of the copyright owner.
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Electronic Signature */}
                        <div>
                            <label htmlFor="signature" className="block text-sm font-bold text-[var(--saas-text-primary)] mb-1.5">
                                Electronic Signature *
                            </label>
                            <input
                                id="signature"
                                type="text"
                                required
                                value={formData.signature}
                                onChange={(e) => updateFormData('signature', e.target.value)}
                                className="w-full h-11 px-4 bg-[var(--saas-bg)] border border-[var(--saas-border)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--saas-accent)] focus:border-transparent transition-all outline-none bg-yellow-50/30"
                                placeholder="Type your full name as electronic signature"
                            />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-red-800 text-sm font-bold">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="w-5 h-5 mr-2 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                {isSubmitting ? 'Submitting Request...' : 'Submit Takedown Request'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
