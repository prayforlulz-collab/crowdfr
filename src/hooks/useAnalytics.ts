'use client';

import { useCallback, useEffect, useRef } from 'react';

interface UseAnalyticsOptions {
    organizationId: string;
    releaseId?: string;
}

interface TrackClickOptions {
    linkUrl: string;
    linkType: 'streaming' | 'social' | 'custom' | 'presave';
    linkLabel?: string;
}

interface TrackEventOptions {
    eventType: string;
    eventData?: Record<string, unknown>;
    fanId?: string;
}

export function useAnalytics({ organizationId, releaseId }: UseAnalyticsOptions) {
    const sessionId = useRef<string | undefined>(undefined);
    const pageViewId = useRef<string | undefined>(undefined);
    const pageLoadTime = useRef<number>(Date.now());


    // Generate session ID on mount
    useEffect(() => {
        if (!sessionId.current) {
            sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    }, []);

    // Track page view on mount
    useEffect(() => {
        const trackPageView = async () => {
            try {
                const response = await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'pageview',
                        path: window.location.pathname,
                        organizationId,
                        releaseId,
                        sessionId: sessionId.current,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    pageViewId.current = data.data?.id;
                }
            } catch (error) {
                console.error('Failed to track page view:', error);
            }
        };

        trackPageView();
    }, [organizationId, releaseId]);

    // Track time on page before unmount
    useEffect(() => {
        return () => {
            const timeOnPage = Math.round((Date.now() - pageLoadTime.current) / 1000);

            // Use sendBeacon for reliable tracking on page unload
            if (pageViewId.current && navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify({
                    type: 'pageview',
                    path: window.location.pathname,
                    organizationId,
                    releaseId,
                    sessionId: sessionId.current,
                    timeOnPage,
                })], { type: 'application/json' });

                navigator.sendBeacon('/api/analytics/track', blob);
            }
        };
    }, [organizationId, releaseId]);

    const trackClick = useCallback(async ({ linkUrl, linkType, linkLabel }: TrackClickOptions) => {
        try {
            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'click',
                    linkUrl,
                    linkType,
                    linkLabel,
                    organizationId,
                    releaseId,
                }),
            });
        } catch (error) {
            console.error('Failed to track click:', error);
        }
    }, [organizationId, releaseId]);

    const trackEvent = useCallback(async ({ eventType, eventData, fanId }: TrackEventOptions) => {
        try {
            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'event',
                    eventType,
                    eventData,
                    organizationId,
                    releaseId,
                    fanId,
                }),
            });
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }, [organizationId, releaseId]);

    const trackEmbedPlay = useCallback(async (platform: string, embedUrl: string) => {
        try {
            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'event',
                    eventType: 'embed_play',
                    eventData: { platform, embedUrl },
                    organizationId,
                    releaseId,
                }),
            });
        } catch (error) {
            console.error('Failed to track embed play:', error);
        }
    }, [organizationId, releaseId]);

    return {
        trackClick,
        trackEvent,
        trackEmbedPlay,
    };
}
