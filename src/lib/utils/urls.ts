
export function getArtistUrl(slug: string) {
    if (typeof window === 'undefined') return `/a/${slug}`;

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const baseDomain = "crowdfr.com";

    // In development or if not on the main domain
    if (hostname.includes('localhost')) {
        return `${protocol}//${slug}.localhost:3000`;
    }

    if (hostname.includes(baseDomain)) {
        // If we are on www.crowdfr.com or crowdfr.com
        return `${protocol}//${slug}.${baseDomain}`;
    }

    // Fallback to internal route if something is weird
    return `/a/${slug}`;
}

export function getReleaseUrl(artistSlug: string, releaseSlug: string) {
    const artistUrl = getArtistUrl(artistSlug);

    // If it's a relative URL (fallback)
    if (artistUrl.startsWith('/')) {
        return `/r/${releaseSlug}`;
    }

    // If it's a full URL (subdomain)
    return `${artistUrl}/r/${releaseSlug}`;
}
