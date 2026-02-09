import { ArrowLeft, Scale, Shield, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - StreamWhereFinder',
  description: 'Terms of service for StreamWhereFinder. Learn about our legal-first approach and user guidelines.',
  openGraph: {
    title: 'Terms of Service - StreamWhereFinder',
    description: 'Read our terms of service and understand our commitment to legal movie streaming.',
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Clear terms for using StreamWhereFinder responsibly and legally.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: December 2024
          </p>
        </div>

        {/* Key Points */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <Shield className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Legal Sources Only</h3>
            <p className="text-sm text-gray-600">
              We exclusively link to official, authorized streaming platforms and services.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <FileText className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Information Service</h3>
            <p className="text-sm text-gray-600">
              StreamWhereFinder is an information service that helps you find legal streaming options.
            </p>
          </div>
        </div>

        {/* Terms Content */}
        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                By accessing and using StreamWhereFinder ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree to these Terms, please do not use the Service.
              </p>
              <p>
                We may modify these Terms at any time by posting the revised terms on this page. Your continued use of the Service 
                after such posting constitutes your acceptance of the modified Terms.
              </p>
            </div>
          </section>

          {/* Description of Service */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Description of Service</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                StreamWhereFinder is a movie discovery platform that helps users find where to watch movies legally online. 
                Our service includes:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Movie search and discovery tools</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Information about legal streaming availability</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Links to official streaming platforms and services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Movie recommendations and collections</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Acceptable Use</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>You agree to use the Service only for lawful purposes and in accordance with these Terms.</strong></p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">✅ Permitted Uses</h4>
                <ul className="space-y-1 text-green-800 text-sm">
                  <li>• Searching for movies and legal streaming information</li>
                  <li>• Using our recommendations to discover new content</li>
                  <li>• Sharing links to our service with others</li>
                  <li>• Accessing content through official platform links</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">❌ Prohibited Uses</h4>
                <ul className="space-y-1 text-red-800 text-sm">
                  <li>• Using the service to find or access pirated content</li>
                  <li>• Attempting to scrape or download our data without permission</li>
                  <li>• Using automated tools to overwhelm our servers</li>
                  <li>• Violating any applicable laws or regulations</li>
                  <li>• Interfering with other users' access to the service</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Legal Compliance */}
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-8">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Legal Compliance</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>StreamWhereFinder is committed to supporting the film industry and respecting copyright.</strong>
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>We only link to official, authorized streaming services</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>We do not host, store, or provide access to copyrighted content</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>We comply with DMCA and other applicable copyright laws</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Content owners may request removal through our contact form</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* DMCA and Takedown Process */}
          <section className="bg-orange-50 border border-orange-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. DMCA Takedown Process</h2>
            
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-900 font-semibold mb-2">⚡ 72-Hour Response Commitment</h3>
                <p className="text-red-800 text-sm">
                  We commit to reviewing and responding to all legitimate takedown requests within 72 hours of receipt.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Discovery Service Only</h3>
                <p className="text-gray-700 mb-4">
                  <strong>Important:</strong> StreamWhereFinder is a discovery service only. We do not host, stream, or provide access to movies or copyrighted content.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span>We provide information about where to find legal streaming options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span>All movie data is sourced from The Movie Database (TMDb)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span>We only link to official streaming platforms and services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span>No movie files or streams are hosted on our servers</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What Can Be Requested for Removal</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span>Movie information and metadata</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span>Poster images and promotional materials</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span>Plot summaries and descriptions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span>Trailer links and promotional content</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Submit a Takedown Request</h3>
                <div className="bg-white border border-orange-200 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <p className="font-medium text-gray-900">📧 legal@streamwherefinder.com</p>
                    <p className="text-sm text-gray-600">Response guaranteed within 72 hours</p>
                  </div>
                  
                  <div className="text-left">
                    <p className="font-medium text-gray-900 mb-3">Required Information:</p>
                    <ol className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start">
                        <span className="text-orange-600 mr-2 font-medium">1.</span>
                        <span>Your contact information and authority to act on behalf of the copyright owner</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-orange-600 mr-2 font-medium">2.</span>
                        <span>Identification of the copyrighted work claimed to be infringed</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-orange-600 mr-2 font-medium">3.</span>
                        <span>Specific URL(s) where the allegedly infringing content appears</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-orange-600 mr-2 font-medium">4.</span>
                        <span>Statement of good faith belief that the use is not authorized</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-orange-600 mr-2 font-medium">5.</span>
                        <span>Statement under penalty of perjury that the information is accurate</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-orange-600 mr-2 font-medium">6.</span>
                        <span>Your electronic or physical signature</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Response Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-orange-600 font-bold text-sm">6h</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Acknowledgment</span>
                      <p className="text-gray-600 text-sm">We confirm receipt of your request</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-orange-600 font-bold text-sm">24h</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Initial Review</span>
                      <p className="text-gray-600 text-sm">We evaluate the claim for legitimacy and completeness</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-orange-600 font-bold text-sm">72h</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Final Resolution</span>
                      <p className="text-gray-600 text-sm">Content removal or explanation if request cannot be fulfilled</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">🛡️ Anti-Abuse Protection</h4>
                <p className="text-gray-700 text-sm">
                  False or bad faith takedown requests may result in legal action. We reserve the right to 
                  forward fraudulent DMCA notices to appropriate authorities and affected parties.
                </p>
              </div>
            </div>
          </section>

          {/* Third-Party Links */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Third-Party Links and Services</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Our Service contains links to third-party websites and services (streaming platforms, rental services, etc.).
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>We are not responsible for the content or practices of third-party sites</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Each platform has its own terms of service and privacy policy</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Streaming availability and pricing are determined by third parties</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>We make no warranties about third-party services</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Disclaimer of Warranties</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We make no guarantees about:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Accuracy of streaming availability information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Uninterrupted or error-free service</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Current pricing or availability on third-party platforms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Completeness of movie database information</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, StreamWhereFinder SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Any indirect, incidental, or consequential damages</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Loss of data, profits, or business opportunities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Issues arising from third-party streaming services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Inaccurate or outdated information</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Termination */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Termination</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We reserve the right to terminate or suspend access to the Service at any time, without notice, 
                for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
              <p>
                You may stop using the Service at any time. Since we don't require accounts, simply stop accessing the website.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Governing Law</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, 
                without regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising under these Terms shall be subject to the exclusive jurisdiction 
                of the courts in India.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About These Terms?</h2>
            <p className="text-gray-600 mb-6">
              If you have questions about these Terms of Service, please contact us.
            </p>
            <Link href="/contact">
              <Button>Contact Us</Button>
            </Link>
          </section>
        </div>

        {/* Last Updated Notice */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            These terms were last updated on December 1, 2024. We may update them periodically to reflect changes in our service or applicable laws.
          </p>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Terms of Service",
            "description": "Terms of service for StreamWhereFinder movie discovery platform.",
            "url": `${process.env.NEXT_PUBLIC_SITE_URL}/terms`,
            "dateModified": "2024-12-01",
            "publisher": {
              "@type": "Organization",
              "name": "StreamWhereFinder"
            }
          })
        }}
      />
    </div>
  );
}