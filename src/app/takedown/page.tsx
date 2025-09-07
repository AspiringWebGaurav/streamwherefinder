'use client';

import { useState } from 'react';
import { ArrowLeft, Shield, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
// Note: Metadata is now handled at the layout level for this client component

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

    // Validate required fields
    const requiredFields = [
      'name', 'email', 'organization', 'copyrightedWork', 
      'contentUrl', 'description', 'signature'
    ];
    
    const missing = requiredFields.filter(field => !formData[field as keyof TakedownFormData]);
    
    if (missing.length > 0) {
      setError(`Please fill in all required fields: ${missing.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    if (!formData.goodFaith || !formData.perjuryStatement) {
      setError('You must agree to both required statements');
      setIsSubmitting(false);
      return;
    }

    try {
      // For now, just log the takedown request. In production, this would send to an API
      console.log('DMCA Takedown Request:', {
        ...formData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
    } catch (err) {
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Takedown Request Submitted
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your DMCA takedown request has been received and will be reviewed by our legal team within 72 hours.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900 text-sm">
                <strong>What happens next?</strong><br />
                We'll acknowledge receipt within 6 hours and provide a final resolution within 72 hours.
                You'll receive updates at: {formData.email}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/">
                <Button>Return to Home</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">Contact Us</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/terms"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Terms
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            DMCA Takedown Request
          </h1>
          <p className="text-gray-600">
            Submit a formal request to remove copyrighted content from StreamWhereFinder.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-red-900 mb-2">Important Legal Notice</h2>
              <p className="text-red-800 text-sm mb-3">
                StreamWhereFinder is a discovery service only. We do not host, stream, or provide access to movies or copyrighted content.
                We only provide information about where to find legal streaming options.
              </p>
              <p className="text-red-800 text-sm">
                <strong>72-Hour Commitment:</strong> We will review and respond to your request within 72 hours of receipt.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization/Company *
                </label>
                <input
                  id="organization"
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => updateFormData('organization', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  placeholder="Copyright owner or authorized representative"
                />
              </div>
            </div>

            {/* Copyright Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Copyright Information</h3>
              
              <div>
                <label htmlFor="copyrightedWork" className="block text-sm font-medium text-gray-700 mb-1">
                  Copyrighted Work *
                </label>
                <input
                  id="copyrightedWork"
                  type="text"
                  required
                  value={formData.copyrightedWork}
                  onChange={(e) => updateFormData('copyrightedWork', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  placeholder="e.g., Movie Title (Year), Poster Image, etc."
                />
              </div>
              
              <div>
                <label htmlFor="contentUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  URL of Infringing Content *
                </label>
                <input
                  id="contentUrl"
                  type="url"
                  required
                  value={formData.contentUrl}
                  onChange={(e) => updateFormData('contentUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  placeholder="https://streamwherefinder.com/movies/..."
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  placeholder="Describe the copyrighted work and how it appears on our site..."
                />
              </div>
            </div>

            {/* Legal Statements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Required Legal Statements</h3>
              
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.goodFaith}
                    onChange={(e) => updateFormData('goodFaith', e.target.checked)}
                    className="mt-1 mr-3"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I have a good faith belief that the use of the copyrighted material is not authorized by the 
                    copyright owner, its agent, or the law.
                  </span>
                </label>
                
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.perjuryStatement}
                    onChange={(e) => updateFormData('perjuryStatement', e.target.checked)}
                    className="mt-1 mr-3"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I swear, under penalty of perjury, that the information in this notice is accurate and 
                    that I am the copyright owner or am authorized to act on behalf of the copyright owner.
                  </span>
                </label>
              </div>
            </div>

            {/* Electronic Signature */}
            <div>
              <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-1">
                Electronic Signature *
              </label>
              <input
                id="signature"
                type="text"
                required
                value={formData.signature}
                onChange={(e) => updateFormData('signature', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                placeholder="Type your full name as electronic signature"
              />
              <p className="text-xs text-gray-500 mt-1">
                By typing your name, you are providing a legal electronic signature
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting Request...' : 'Submit Takedown Request'}
              </Button>
            </div>
          </form>
        </div>

        {/* Legal Notice */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600">
            <strong>Legal Notice:</strong> This form is for legitimate copyright takedown requests only. 
            False or bad faith requests may result in legal action. For other issues, please{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}