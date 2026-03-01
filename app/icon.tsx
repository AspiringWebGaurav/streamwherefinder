import { ImageResponse } from 'next/og';

export const size = {
    width: 512,
    height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
    const padding = size.width * 0.15;
    const strokeWidth = 2; // Lucide default

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)', // from-blue-500 to-blue-700
                    borderRadius: '20%',
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={size.width - padding * 2}
                    height={size.height - padding * 2}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 3v18" />
                    <path d="M3 7.5h4" />
                    <path d="M3 12h18" />
                    <path d="M3 16.5h4" />
                    <path d="M17 3v18" />
                    <path d="M17 7.5h4" />
                    <path d="M17 16.5h4" />
                </svg>
            </div>
        ),
        { ...size }
    );
}
