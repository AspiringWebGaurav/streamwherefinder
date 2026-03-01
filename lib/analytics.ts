export function trackOutboundClick(provider: string, movieTitle: string, type: string) {
    if (typeof window !== 'undefined' && 'gtag' in window) {
        const win = window as { gtag?: (...args: unknown[]) => void };
        if (win.gtag) {
            win.gtag('event', 'click', {
                event_category: 'outbound_link',
                event_label: `${provider} - ${movieTitle} (${type})`,
                transport_type: 'beacon'
            });
        }
    }
}
