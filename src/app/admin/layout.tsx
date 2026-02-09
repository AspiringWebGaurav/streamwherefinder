import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Admin-specific header could go here if needed, or just let page handle it */}
            <main>{children}</main>
        </div>
    );
}
