'use client';

import { Film, Github, User } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="w-full bg-white/50 backdrop-blur-md py-8 sm:py-6 border-t border-[var(--cinema-border-light)] shrink-0 mt-auto">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-4 text-sm text-[var(--cinema-text-muted)]">
                {/* Brand Logo */}
                <div className="flex items-center gap-2 font-bold text-[var(--cinema-text-secondary)]">
                    <span className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-sm">
                        <Film className="w-3.5 h-3.5" />
                    </span>
                    <span className="tracking-tight text-[15px]">StreamWhere</span>
                </div>

                {/* Social Links - Touch Optimised */}
                <div className="flex items-center gap-4">
                    <a
                        href="https://gauravpatil.online"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-center p-2.5 rounded-full hover:bg-[var(--cinema-bg)] active:scale-95 transition-all"
                        aria-label="Portfolio"
                    >
                        <User className="w-5 h-5 text-[var(--cinema-text-muted)] group-hover:text-[var(--cinema-accent)] transition-colors relative z-10" />
                    </a>
                    <a
                        href="https://github.com/AspiringWebGaurav"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-center p-2.5 rounded-full hover:bg-[var(--cinema-bg)] active:scale-95 transition-all"
                        aria-label="GitHub"
                    >
                        <Github className="w-5 h-5 text-[var(--cinema-text-muted)] group-hover:text-[var(--cinema-text-primary)] transition-colors relative z-10" />
                    </a>
                </div>

                {/* Legal Links - Visible on Mobile with Touch Padding */}
                <div className="flex items-center justify-center gap-2 sm:gap-5 font-medium text-slate-500 flex-wrap">
                    <Link href="/about" className="p-2 hover:text-[var(--cinema-accent)] active:scale-95 transition-all text-[13px] sm:text-sm">About</Link>
                    <Link href="/privacy" className="p-2 hover:text-[var(--cinema-accent)] active:scale-95 transition-all text-[13px] sm:text-sm">Privacy</Link>
                    <Link href="/terms" className="p-2 hover:text-[var(--cinema-accent)] active:scale-95 transition-all text-[13px] sm:text-sm">Terms</Link>
                </div>
            </div>
        </footer>
    );
}

