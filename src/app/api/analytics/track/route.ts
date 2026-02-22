import { NextRequest, NextResponse } from 'next/server';
import { trackClick, trackPageView, trackEvent } from '@/lib/analytics';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, ...data } = body;

        // Extract metadata from request headers
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            undefined;
        const userAgent = request.headers.get('user-agent') || undefined;
        const referrer = request.headers.get('referer') || undefined;

        // Validate required fields
        if (!data.organizationId) {
            return NextResponse.json(
                { error: 'organizationId is required' },
                { status: 400 }
            );
        }

        let result;

        switch (type) {
            case 'click':
                if (!data.linkUrl || !data.linkType) {
                    return NextResponse.json(
                        { error: 'linkUrl and linkType are required for click events' },
                        { status: 400 }
                    );
                }
                result = await trackClick({
                    ...data,
                    ipAddress,
                    userAgent,
                    referrer,
                });
                break;

            case 'pageview':
                if (!data.path) {
                    return NextResponse.json(
                        { error: 'path is required for pageview events' },
                        { status: 400 }
                    );
                }
                result = await trackPageView({
                    ...data,
                    ipAddress,
                    userAgent,
                    referrer,
                });
                break;

            case 'event':
                if (!data.eventType) {
                    return NextResponse.json(
                        { error: 'eventType is required for custom events' },
                        { status: 400 }
                    );
                }
                result = await trackEvent(data);
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid event type. Must be: click, pageview, or event' },
                    { status: 400 }
                );
        }

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Analytics tracking error:', error);
        return NextResponse.json(
            { error: 'Failed to track event' },
            { status: 500 }
        );
    }
}
