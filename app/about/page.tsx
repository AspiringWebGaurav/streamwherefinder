import { Navbar } from '@/components/Navbar';
import { ArrowUpRight, Code2, Film, Github, Heart, Sparkles, Terminal } from 'lucide-react';

export const metadata = { title: "About Us | StreamWhere" };

export default function AboutPage() {
    return (
        <div className="bg-[var(--cinema-bg)] h-[100dvh] w-full flex flex-col overflow-hidden">
            <div className="flex-none">
                <Navbar />
            </div>

            <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 lg:gap-12 overflow-y-auto lg:overflow-hidden relative z-10">

                {/* Left Side: Hero Text */}
                <div className="flex-1 flex flex-col justify-center max-w-2xl pt-4 lg:pt-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 w-max mb-6 border border-blue-100">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-bold tracking-widest uppercase">About This Project</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
                        Built for the <br className="hidden md:block" />
                        <span className="text-gradient transition-all cursor-default">
                            love of cinema.
                        </span>
                    </h1>

                    <p className="text-lg lg:text-xl text-slate-600 leading-relaxed mb-10">
                        StreamWhere is a personal, non-revenue generating portfolio project built by Gaurav to explore modern full-stack web architectures, high-performance UI/UX, and complex data integrations.
                    </p>

                    {/* Footer badges */}
                    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500 mt-auto pt-8 border-t border-slate-200">
                        <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 shadow-sm hover:shadow-md transition-shadow"><Heart className="w-4 h-4 text-rose-500 fill-rose-500/30" /> No Ads</span>
                        <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow"><Terminal className="w-4 h-4 text-emerald-600" /> Open Source</span>
                        <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 shadow-sm hover:shadow-md transition-shadow"><Film className="w-4 h-4 text-blue-600" /> Pure UI</span>
                    </div>
                </div>

                {/* Right Side: Bento Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 h-full content-center pb-8 lg:pb-0 pt-4 lg:pt-0">

                    {/* Motivation Card */}
                    <div className="p-6 lg:p-8 rounded-[2rem] bg-white border border-[var(--cinema-border)] shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300 group flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] border border-orange-100">
                                <Film className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">The Motivation</h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Finding exactly where a movie is streaming shouldn't require jumping through five different apps. This application was built to prototype an aesthetic, deeply responsive, and lightning-fast search experience for movie discoverability.
                            </p>
                        </div>
                    </div>

                    {/* Technology Card */}
                    <div className="p-6 lg:p-8 rounded-[2rem] bg-white border border-[var(--cinema-border)] shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 group flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)] border border-blue-100">
                                <Code2 className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">The Technology</h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Engineered with Next.js, this platform features continuous typo-tolerance searching, instant frontend filtering across TMDB data, and sleek framer-motion micro-interactions ensuring the UI never stutters.
                            </p>
                        </div>
                    </div>

                    {/* Portfolio Card - Span 2 cols */}
                    <div className="sm:col-span-2 p-6 sm:p-8 lg:p-10 rounded-[2rem] bg-gradient-to-br from-white to-slate-50 border border-[var(--cinema-border)] shadow-md relative overflow-hidden group hover:border-blue-200 transition-colors duration-500 flex flex-col justify-center">
                        {/* Subtle background glow */}
                        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100/40 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-200/50 group-hover:scale-110 transition-all duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/30 blur-[80px] rounded-full translate-y-1/3 -translate-x-1/4 group-hover:bg-indigo-200/40 group-hover:scale-110 transition-all duration-700"></div>

                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 h-full">
                            <div className="flex-1">
                                <h3 className="text-2xl lg:text-3xl font-extrabold mb-3 text-slate-900">Developed by Gaurav</h3>
                                <p className="text-slate-600 text-sm max-w-md leading-relaxed font-medium">
                                    This system is a proof-of-concept demonstrating production-grade frontend architecture, clean logic routing, and rigid 100dvh mobile-first design constraints.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <a
                                    href="https://github.com/GauravPatil-code"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[var(--cinema-border)] text-slate-800 font-bold transition-all duration-300 transform hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg group/btn"
                                >
                                    <Github className="w-5 h-5 group-hover/btn:scale-110 transition-transform text-slate-500" />
                                    <span>GitHub</span>
                                </a>
                                <a
                                    href="https://gauravpatil.online"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(37,99,235,0.3)] group/btn relative overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Portfolio <ArrowUpRight className="w-5 h-5 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 z-0"></div>
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
