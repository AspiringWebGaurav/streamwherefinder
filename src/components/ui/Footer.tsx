'use client';

import Link from 'next/link';
import { Heart, ExternalLink, Shield, FileText, Mail, Info } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { href: '/about', label: 'About', icon: Info },
    { href: '/privacy', label: 'Privacy', icon: Shield },
    { href: '/terms', label: 'Terms', icon: FileText },
    { href: '/contact', label: 'Contact', icon: Mail },
  ];

  return (
    <footer className="glass-footer mt-8 sm:mt-12 lg:mt-16 border-t border-white/10 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Main Footer Content - Mobile First Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          
          {/* Brand Section - Full Width on Mobile */}
          <div className="md:col-span-2 xl:col-span-1 space-y-4 sm:space-y-6">
            <div>
              <h3 className="brand-text text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                StreamWhereFinder
              </h3>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                Discover movies and find where to watch them legally.
                Search with intelligent typo correction, browse trending content,
                and get official streaming links.
              </p>
            </div>
            
            {/* Branding - Responsive Layout */}
            <div className="glass p-3 sm:p-4 rounded-xl">
              <div className="flex flex-wrap items-center gap-2 text-white/90">
                <span className="text-xs sm:text-sm font-medium">Made in {currentYear} with</span>
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 animate-pulse" fill="currentColor" />
                <span className="text-xs sm:text-sm font-medium">by</span>
                <span className="font-bold gradient-dynamic bg-clip-text text-transparent text-xs sm:text-sm">
                  Gaurav (Architect)
                </span>
              </div>
            </div>
          </div>

          {/* Legal Links - Responsive Grid */}
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-base sm:text-lg font-semibold text-white">
              Legal & Support
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-2 sm:gap-3">
              {legalLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="btn-glass flex items-center justify-center sm:justify-start space-x-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl glow transition-all duration-300 hover:shadow-lg group min-h-[44px]"
                >
                  <Icon className="w-4 h-4 text-white/80 group-hover:text-cyan-300 transition-colors duration-200 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-white group-hover:text-cyan-300 transition-colors duration-200 truncate">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* TMDb Attribution - Full Width on Small Screens */}
          <div className="md:col-span-2 xl:col-span-1 space-y-4 sm:space-y-6">
            <h4 className="text-base sm:text-lg font-semibold text-white">
              Powered By
            </h4>
            <div className="glass p-4 sm:p-6 rounded-xl">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                <img
                  src="/tmdb-logo.svg"
                  alt="The Movie Database"
                  className="h-6 sm:h-8 w-auto opacity-90"
                />
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
              </div>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                This product uses the TMDb API but is not endorsed or certified by TMDb.
                All movie data and imagery are provided by The Movie Database.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Mobile First */}
        <div className="mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 border-t border-white/10">
          <div className="flex flex-col space-y-4 sm:space-y-6 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
            
            {/* Copyright - Center on Mobile */}
            <div className="text-center lg:text-left">
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                © {currentYear} StreamWhereFinder. We only link to official streaming platforms.
              </p>
            </div>
            
            {/* Legal Compliance - Stack on Mobile */}
            <div className="flex flex-col xs:flex-row items-center justify-center lg:justify-end gap-3 xs:gap-4">
              <div className="glass px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg">
                <span className="text-xs text-white/80 font-medium whitespace-nowrap">
                  🔒 Privacy Protected
                </span>
              </div>
              <div className="glass px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg">
                <span className="text-xs text-white/80 font-medium whitespace-nowrap">
                  ✅ Legal Streaming Only
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements - Hidden on Small Screens */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="hidden lg:block absolute bottom-0 left-1/4 w-64 xl:w-96 h-64 xl:h-96 gradient-dynamic rounded-full opacity-5 blur-3xl"></div>
          <div className="hidden lg:block absolute bottom-0 right-1/4 w-64 xl:w-96 h-64 xl:h-96 gradient-dynamic rounded-full opacity-5 blur-3xl"></div>
        </div>
      </div>
    </footer>
  );
}