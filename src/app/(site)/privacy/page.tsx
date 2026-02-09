import { ArrowLeft, Shield, Eye, Database, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - StreamWhereFinder',
  description: 'Learn how StreamWhereFinder protects your privacy. We are anonymous by design and do not collect or store personal data.',
  openGraph: {
    title: 'Privacy Policy - StreamWhereFinder',
    description: 'Learn how we protect your privacy while helping you find movies to watch legally.',
    type: 'website',
  },
};

export default function PrivacyPage() {
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
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy matters to us. Learn how we protect your data while providing our movie discovery service.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: December 2024
          </p>
        </div>

        {/* Privacy Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <Eye className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">No Tracking</h3>
            <p className="text-sm text-gray-600">
              We don't track your browsing behavior or store search history.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <Database className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">No Accounts</h3>
            <p className="text-sm text-gray-600">
              No registration required. Use our service completely anonymously.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
            <Cookie className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Minimal Cookies</h3>
            <p className="text-sm text-gray-600">
              Only essential cookies for basic functionality. No advertising cookies.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Information We Collect */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Information We Collect</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">🔄 Updated: Optional User Accounts</h3>
                <p className="text-blue-800 text-sm">
                  We now offer optional user accounts to save your search history. Your privacy remains our priority.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">For Anonymous Users (No Account)</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Zero personal data collected</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Search history stored locally in your browser only</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>No tracking across devices or sessions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Anonymous analytics only (page views, popular content)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">For Signed-In Users (Optional)</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Email address:</strong> For account creation and sign-in</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Display name:</strong> Optional, for personalization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Search history:</strong> Your movie searches and timestamps</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Authentication data:</strong> Managed securely by Firebase</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Session management:</strong> Auto-logout after 5 minutes for security</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Analytics Data (All Users)</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span><strong>Page views:</strong> Which pages are visited (no personal identification)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span><strong>Search queries:</strong> What movies people search for (anonymized)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span><strong>Outbound clicks:</strong> Which streaming links are clicked (for insights)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span><strong>Performance metrics:</strong> Load times and error rates</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span><strong>Device info:</strong> Browser type, screen size (for optimization)</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How We Use Information</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">For Anonymous Users</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>Service optimization:</strong> Improve loading times and fix issues</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>Content relevance:</strong> Show appropriate streaming availability</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>Security:</strong> Protect against abuse and spam</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">For Signed-In Users (Additional)</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Search history:</strong> Save and sync your searches across devices</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Personalization:</strong> Better recommendations based on your interests</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Account security:</strong> Auto-logout and session management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Communication:</strong> Important account-related notifications only</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Analytics & Insights</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span><strong>Popular content:</strong> Understand which movies and features are most used</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span><strong>Streaming insights:</strong> Track which platforms are most popular</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span><strong>Performance monitoring:</strong> Identify and fix technical issues</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span><strong>Feature improvement:</strong> Understand how to make the service better</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Storage and Accounts */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Storage and User Accounts</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Optional User Accounts</h3>
                <p className="text-gray-700 mb-4">
                  We offer optional user accounts through Firebase Authentication to save your search history. Creating an account is entirely voluntary.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Authentication:</strong> Managed securely by Google Firebase</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Search history:</strong> Stored in Firebase Firestore (encrypted)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Auto-logout:</strong> Sessions expire after 5 minutes of inactivity</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Data retention:</strong> Search history limited to 50 most recent searches</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Local Storage (Anonymous Users)</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>Browser storage:</strong> Recent searches stored locally only</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>No server storage:</strong> Data never leaves your device</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>User control:</strong> Clear anytime through browser settings</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Analytics and Tracking */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics and Tracking</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What We Track</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Vercel Analytics:</strong> Page views, performance metrics, and basic usage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Google Analytics:</strong> Aggregated user behavior (anonymous)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Outbound clicks:</strong> Which streaming links are popular</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Search patterns:</strong> Popular movie searches (anonymized)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Error monitoring:</strong> Technical issues and crash reports</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">What We DON'T Track</h4>
                <ul className="space-y-1 text-red-800 text-sm">
                  <li>❌ Personal identification across sessions</li>
                  <li>❌ Advertising or marketing cookies</li>
                  <li>❌ Social media tracking pixels</li>
                  <li>❌ Cross-site behavioral profiling</li>
                  <li>❌ IP addresses or precise location data</li>
                  <li>❌ Device fingerprinting for tracking</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookies We Use</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-900">Cookie Name</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-900">Purpose</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-900">Duration</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-900">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2 text-gray-900">firebase:authUser</td>
                        <td className="px-4 py-2 text-gray-600">Authentication session</td>
                        <td className="px-4 py-2 text-gray-600">5 minutes</td>
                        <td className="px-4 py-2 text-green-600">Essential</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-gray-900">_ga</td>
                        <td className="px-4 py-2 text-gray-600">Google Analytics</td>
                        <td className="px-4 py-2 text-gray-600">2 years</td>
                        <td className="px-4 py-2 text-orange-600">Analytics</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-gray-900">_vercel_analytics</td>
                        <td className="px-4 py-2 text-gray-600">Performance monitoring</td>
                        <td className="px-4 py-2 text-gray-600">Session</td>
                        <td className="px-4 py-2 text-orange-600">Analytics</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Services</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">The Movie Database (TMDb)</h3>
                <p className="text-gray-700 text-sm">
                  We use TMDb's API to fetch movie information. When you search, your query is sent to TMDb's servers. 
                  Please review TMDb's privacy policy for how they handle API requests.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vercel (Hosting)</h3>
                <p className="text-gray-700 text-sm">
                  Our website is hosted on Vercel. They may collect basic analytics data like page views and load times. 
                  No personal data is shared with Vercel beyond what's necessary for hosting.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Streaming Platforms</h3>
                <p className="text-gray-700 text-sm">
                  When you click "Watch" links, you'll be redirected to official streaming platforms. Each platform has 
                  its own privacy policy that governs what happens after you leave our site.
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Rights</h2>
            
            <div className="space-y-4 text-gray-700">
              <p>
                Since we don't collect personal data, most data protection rights don't apply. However:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>No Data to Delete:</strong> We don't store search history or personal information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Clear Cookies:</strong> You can clear cookies anytime in your browser settings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Contact Us:</strong> Questions about privacy? Email us anytime</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this privacy policy occasionally to reflect changes in our practices or for legal reasons. 
              Any changes will be posted on this page with an updated "Last modified" date.
            </p>
            <p className="text-gray-700">
              Continued use of StreamWhereFinder after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about this privacy policy or our data practices, please contact us.
            </p>
            <Link href="/contact">
              <Button>Contact Us</Button>
            </Link>
          </section>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Privacy Policy",
            "description": "StreamWhereFinder privacy policy explaining how we protect user privacy and data.",
            "url": `${process.env.NEXT_PUBLIC_SITE_URL}/privacy`,
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