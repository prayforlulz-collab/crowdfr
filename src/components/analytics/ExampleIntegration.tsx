// Example: How to integrate analytics tracking into a release page component
// This file demonstrates the pattern - integrate into actual release page components

'use client';

import { useAnalytics } from '@/hooks/useAnalytics';

interface ExampleReleasePage {
    organizationId: string;
    releaseId: string;
}

export default function ExampleReleasePage({ organizationId, releaseId }: ExampleReleasePage) {
    // Initialize analytics tracking - automatically tracks page views
    const { trackClick, trackEvent } = useAnalytics({ organizationId, releaseId });

    // Example: Track streaming link click
    const handleStreamingClick = (platform: string, url: string) => {
        trackClick({
            linkUrl: url,
            linkType: 'streaming',
            linkLabel: platform,
        });
        // Then open the link
        window.open(url, '_blank');
    };

    // Example: Track social media link click
    const handleSocialClick = (platform: string, url: string) => {
        trackClick({
            linkUrl: url,
            linkType: 'social',
            linkLabel: platform,
        });
        window.open(url, '_blank');
    };

    // Example: Track custom link click
    const handleCustomLinkClick = (label: string, url: string) => {
        trackClick({
            linkUrl: url,
            linkType: 'custom',
            linkLabel: label,
        });
        window.open(url, '_blank');
    };

    // Example: Track presave button click
    const handlePresaveClick = (url: string) => {
        trackClick({
            linkUrl: url,
            linkType: 'presave',
            linkLabel: 'Pre-save',
        });
        window.open(url, '_blank');
    };

    // Example: Track fan signup event
    const handleFanSignup = async (fanId: string) => {
        await trackEvent({
            eventType: 'fan_signup',
            eventData: { source: 'release_page' },
            fanId,
        });
    };

    return (
        <div>
            {/* Example streaming links */}
            <button onClick={() => handleStreamingClick('Spotify', 'https://spotify.com/...')}>
                Listen on Spotify
            </button>

            <button onClick={() => handleStreamingClick('Apple Music', 'https://music.apple.com/...')}>
                Listen on Apple Music
            </button>

            {/* Example social links */}
            <button onClick={() => handleSocialClick('Instagram', 'https://instagram.com/...')}>
                Follow on Instagram
            </button>

            {/* Example custom link */}
            <button onClick={() => handleCustomLinkClick('Merch Store', 'https://merch.example.com')}>
                Shop Merch
            </button>

            {/* Example presave button */}
            <button onClick={() => handlePresaveClick('https://presave.example.com')}>
                Pre-save Album
            </button>
        </div>
    );
}

/*
 * INTEGRATION GUIDE:
 * 
 * 1. Add to existing release page components:
 *    - Import useAnalytics hook
 *    - Call useAnalytics({ organizationId, releaseId }) at component top
 *    - This automatically tracks page views and time on page
 * 
 * 2. Track link clicks:
 *    - Wrap link click handlers with trackClick()
 *    - Specify linkType: 'streaming' | 'social' | 'custom' | 'presave'
 *    - Include linkLabel for better analytics
 * 
 * 3. Track custom events:
 *    - Use trackEvent() for fan signups, shares, etc.
 *    - Include relevant eventData for context
 * 
 * 4. Files to update:
 *    - src/components/sections/HeroSection.tsx
 *    - src/components/sections/SectionRenderer.tsx
 *    - Any other components with clickable links
 */
