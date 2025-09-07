import { ArrowLeft, Mail, MessageCircle, Bug, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/search/SearchBar';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - StreamWhereFinder',
  description: 'Get in touch with StreamWhereFinder for support, feedback, or to report issues. We are here to help.',
  openGraph: {
    title: 'Contact StreamWhereFinder',
    description: 'Get support, share feedback, or report issues with our movie discovery service.',
    type: 'website',
  },
};

export default function ContactPage() {
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
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you. Get in touch for support, feedback, or any questions about StreamWhereFinder.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* General Contact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">General Inquiries</h3>
              <p className="text-gray-600 mb-6">
                Questions about our service, partnerships, or general feedback.
              </p>
              <a 
                href="mailto:hello@streamwherefinder.com"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                hello@streamwherefinder.com
              </a>
            </div>
          </div>

          {/* Technical Support */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bug className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Technical Support</h3>
              <p className="text-gray-600 mb-6">
                Report bugs, technical issues, or problems with the website.
              </p>
              <a 
                href="mailto:support@streamwherefinder.com"
                className="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
              >
                support@streamwherefinder.com
              </a>
            </div>
          </div>
        </div>

        {/* Legal and Copyright */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 mb-12">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-orange-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Copyright & Legal Issues</h3>
              <p className="text-gray-700 mb-4">
                If you are a content owner and believe your copyrighted material appears on our site inappropriately, 
                or if you have legal concerns, please contact us immediately.
              </p>
              <a 
                href="mailto:legal@streamwherefinder.com"
                className="inline-flex items-center text-orange-700 hover:text-orange-900 font-medium"
              >
                <Shield className="w-4 h-4 mr-2" />
                legal@streamwherefinder.com
              </a>
              <p className="text-sm text-orange-700 mt-3">
                <strong>Note:</strong> We only link to official streaming platforms and take copyright seriously. 
                We will respond to legitimate takedown requests promptly.
              </p>
            </div>
          </div>
        </div>

        {/* What to Include */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What to Include in Your Message</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">For Technical Issues</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Description of the problem</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>What you were trying to do</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Your device and browser type</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Screenshots if applicable</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">For Copyright Issues</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Your contact information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Proof of copyright ownership</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Specific content in question</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>URL where content appears</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Response Times</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">24-48 hours</div>
              <div className="text-sm text-gray-600">General inquiries and feedback</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">12-24 hours</div>
              <div className="text-sm text-gray-600">Technical support and bug reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">6-12 hours</div>
              <div className="text-sm text-gray-600">Legal and copyright issues</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center mt-6">
            Response times may be longer during weekends and holidays. We appreciate your patience.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Why can't I find a specific movie?
              </h3>
              <p className="text-gray-700">
                Our database includes thousands of movies, but we may not have every title. We're constantly updating 
                our database. If you can't find a movie, try different spellings or contact us with the movie details.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                The streaming information is incorrect. What should I do?
              </h3>
              <p className="text-gray-700">
                Streaming availability changes frequently. If you notice outdated information, please let us know 
                the movie title and current availability so we can update our records.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you have an API or partnerships?
              </h3>
              <p className="text-gray-700">
                We don't currently offer a public API, but we're open to partnerships with legitimate streaming 
                services and entertainment platforms. Contact us to discuss opportunities.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do you make money?
              </h3>
              <p className="text-gray-700">
                Currently, StreamWhereFinder is a free service. We may introduce affiliate partnerships with 
                official streaming platforms in the future, but we will always maintain our legal-only approach.
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Ways to Reach Us */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Still Need Help?</h2>
          
          <div className="text-center">
            <p className="text-gray-600 mb-8">
              Can't find what you're looking for? Try our search or explore popular movies.
            </p>
            
            <div className="max-w-2xl mx-auto mb-6">
              <SearchBar placeholder="Search for movies or help topics..." />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/">
                <Button size="lg">
                  Explore Movies
                </Button>
              </Link>
              
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Info Summary */}
        <div className="mt-12 text-center">
          <div className="bg-gray-100 rounded-lg p-6 inline-block">
            <h3 className="font-semibold text-gray-900 mb-2">Quick Contact</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>General: <a href="mailto:hello@streamwherefinder.com" className="text-blue-600 hover:underline">hello@streamwherefinder.com</a></div>
              <div>Support: <a href="mailto:support@streamwherefinder.com" className="text-blue-600 hover:underline">support@streamwherefinder.com</a></div>
              <div>Legal: <a href="mailto:legal@streamwherefinder.com" className="text-blue-600 hover:underline">legal@streamwherefinder.com</a></div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact StreamWhereFinder",
            "description": "Contact StreamWhereFinder for support, feedback, or questions about our movie discovery service.",
            "url": `${process.env.NEXT_PUBLIC_SITE_URL}/contact`,
            "mainEntity": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "hello@streamwherefinder.com",
              "url": `${process.env.NEXT_PUBLIC_SITE_URL}/contact`
            }
          })
        }}
      />
    </div>
  );
}