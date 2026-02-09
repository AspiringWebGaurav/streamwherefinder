import { ArrowLeft, Search, Shield, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/search/SearchBar';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About StreamWhereFinder - Legal Movie Discovery',
  description: 'Learn about StreamWhereFinder, your trusted source for finding where to watch movies legally online. We only link to official streaming platforms.',
  openGraph: {
    title: 'About StreamWhereFinder',
    description: 'Your trusted source for finding where to watch movies legally online.',
    type: 'website',
  },
};

export default function AboutPage() {
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
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About StreamWhereFinder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your trusted companion for discovering movies and finding where to watch them legally online.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            StreamWhereFinder was created to solve a simple but frustrating problem: finding where to watch your favorite movies legally online. With dozens of streaming platforms and constantly changing content libraries, it's become nearly impossible to keep track of where you can actually watch a specific movie.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            We believe in supporting creators and the film industry by only promoting legal streaming options. Every link on our platform directs you to official streaming services, rental platforms, or purchase options.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our goal is to make movie discovery effortless while ensuring you always have access to legal, high-quality viewing experiences.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Typo-Tolerant Search
            </h3>
            <p className="text-gray-600 text-sm">
              Our advanced search algorithm works even when you misspell movie titles. Search for "Avvtarr" and find "Avatar" instantly.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Legal Sources Only
            </h3>
            <p className="text-gray-600 text-sm">
              We exclusively link to official streaming platforms, digital rental services, and authorized purchase options. No piracy, ever.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Real-Time Data
            </h3>
            <p className="text-gray-600 text-sm">
              Our database is updated daily with the latest streaming availability, pricing, and new releases across all major platforms.
            </p>
          </div>
        </div>

        {/* How We Work */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How We Work</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Data Collection</h3>
                <p className="text-gray-600 text-sm">
                  We gather movie information from The Movie Database (TMDb), a comprehensive, community-driven movie database.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Streaming Data</h3>
                <p className="text-gray-600 text-sm">
                  We track availability across major streaming platforms in India, including Netflix, Amazon Prime Video, Disney+ Hotstar, and more.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Smart Matching</h3>
                <p className="text-gray-600 text-sm">
                  Our fuzzy search algorithm helps you find movies even with typos or partial titles, making discovery effortless.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Legal Links Only</h3>
                <p className="text-gray-600 text-sm">
                  We only provide links to official platforms where you can legally stream, rent, or purchase movies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Attribution</h2>
          <p className="text-gray-700 mb-4">
            StreamWhereFinder uses data from <strong>The Movie Database (TMDb)</strong>, a community-built movie and TV database. 
            We are grateful for their comprehensive API that makes our service possible.
          </p>
          <p className="text-sm text-gray-600">
            This product uses the TMDb API but is not endorsed or certified by TMDb. All movie posters, descriptions, 
            and metadata are provided by TMDb under their terms of service.
          </p>
        </div>

        {/* Privacy & Legal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy & Legal</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Anonymous by Design</h3>
              <p className="text-gray-600 text-sm mb-4">
                We don't require accounts, track personal data, or store your search history. Your privacy is our priority.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Legal Compliance</h3>
              <p className="text-gray-600 text-sm mb-4">
                We comply with copyright laws and only link to authorized streaming services and platforms.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">No Piracy</h3>
              <p className="text-gray-600 text-sm">
                We actively avoid and do not promote any illegal streaming sites or piracy-related content.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Content Removal</h3>
              <p className="text-gray-600 text-sm">
                Content owners can request removal of their material by contacting us through our official channels.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Find Your Next Movie?
          </h2>
          <p className="text-gray-600 mb-8">
            Search thousands of movies and discover where to watch them legally.
          </p>
          
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar placeholder="Search for any movie..." />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/">
              <Button size="lg">
                Explore Movies
              </Button>
            </Link>
            <Link href="/random-movie">
              <Button variant="outline" size="lg">
                Spin Tonight
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About StreamWhereFinder",
            "description": "Learn about StreamWhereFinder, your trusted source for finding where to watch movies legally online.",
            "url": `${process.env.NEXT_PUBLIC_SITE_URL}/about`,
            "mainEntity": {
              "@type": "Organization",
              "name": "StreamWhereFinder",
              "description": "Legal movie discovery platform that helps users find where to watch movies online through official streaming services.",
              "url": `${process.env.NEXT_PUBLIC_SITE_URL}`,
              "sameAs": [],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": `${process.env.NEXT_PUBLIC_SITE_URL}/contact`
              }
            }
          })
        }}
      />
    </div>
  );
}