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
    <footer className="glass-footer mt-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h3 className="brand-text text-2xl font-bold mb-3">
                StreamWhereFinder
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Discover movies and find where to watch them legally. 
                Search with intelligent typo correction, browse trending content, 
                and get official streaming links.
              </p>
            </div>
            
            {/* Branding */}
            <div className="flex items-center space-x-2 p-4 glass rounded-xl">
              <div className="flex items-center space-x-2 text-white/90">
                <span className="text-sm font-medium">Made in {currentYear} with</span>
                <Heart className="w-4 h-4 text-red-400 animate-pulse" fill="currentColor" />
                <span className="text-sm font-medium">by</span>
                <span className="font-bold gradient-dynamic bg-clip-text text-transparent">
                  Gaurav (Architect)
                </span>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-1 space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              Legal & Support
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {legalLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="btn-glass flex items-center space-x-2 px-4 py-3 rounded-xl glow transition-all duration-300 hover:shadow-lg group"
                >
                  <Icon className="w-4 h-4 text-white/80 group-hover:text-cyan-300 transition-colors duration-200" />
                  <span className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors duration-200">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* TMDb Attribution */}
          <div className="lg:col-span-1 space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              Powered By
            </h4>
            <div className="glass p-6 rounded-xl">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src="/tmdb-logo.svg"
                  alt="The Movie Database"
                  className="h-8 w-auto opacity-90"
                />
                <ExternalLink className="w-4 h-4 text-white/60" />
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                This product uses the TMDb API but is not endorsed or certified by TMDb. 
                All movie data and imagery are provided by The Movie Database.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-sm text-white/70">
                © {currentYear} StreamWhereFinder. We only link to official streaming platforms.
              </p>
            </div>
            
            {/* Legal Compliance */}
            <div className="flex items-center space-x-4">
              <div className="glass px-4 py-2 rounded-lg">
                <span className="text-xs text-white/80 font-medium">
                  🔒 Privacy Protected
                </span>
              </div>
              <div className="glass px-4 py-2 rounded-lg">
                <span className="text-xs text-white/80 font-medium">
                  ✅ Legal Streaming Only
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-1/4 w-96 h-96 gradient-dynamic rounded-full opacity-5 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 gradient-dynamic rounded-full opacity-5 blur-3xl"></div>
        </div>
      </div>
    </footer>
  );
}