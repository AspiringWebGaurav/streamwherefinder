export function trackOutboundClick(provider: string, movieTitle: string, type: string) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'click', {
            event_category: 'outbound_link',
            event_label: `${provider} - ${movieTitle} (${type})`,
            transport_type: 'beacon'
        });
    }
}
