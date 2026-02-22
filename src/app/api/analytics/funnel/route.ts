import { NextRequest, NextResponse } from 'next/server';
import { getFunnelData } from '@/lib/analytics';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');
        const releaseId = searchParams.get('releaseId') || undefined;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!organizationId) {
            return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
        }

        const dateRange = startDate && endDate ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        } : undefined;

        const data = await getFunnelData(organizationId, releaseId, dateRange);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching funnel data:', error);
        return NextResponse.json({ error: 'Failed to fetch funnel data' }, { status: 500 });
    }
}
