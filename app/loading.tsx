export default function GlobalLoading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--saas-bg)]">
            <div className="relative flex flex-col items-center">
                {/* Glowing rotating outer ring */}
                <div className="absolute inset-[-1rem] rounded-full border-[3px] border-transparent border-t-[var(--saas-accent)] border-r-[var(--saas-accent)]/50 animate-[spin_1.5s_linear_infinite] opacity-80" />
                
                {/* Inner pulsing logo container */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg border border-[var(--saas-border-light)] flex items-center justify-center animate-pulse">
                    <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--saas-accent)] ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                
                {/* Text prompt */}
                <div className="mt-8 flex flex-col items-center">
                    <span className="text-sm font-bold text-[var(--saas-text-primary)] tracking-wider uppercase mb-1">
                        StreamWhere
                    </span>
                    <span className="text-xs font-semibold text-[var(--saas-text-muted)] animate-pulse">
                        Loading experience...
                    </span>
                </div>
            </div>
        </div>
    );
}
