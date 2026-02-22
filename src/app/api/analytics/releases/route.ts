import { NextRequest, NextResponse } from 'next/server';
import { getReleaseComparison } from '@/lib/analytics';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!organizationId) {
            return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
        }

        const dateRange = startDate && endDate ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        } : undefined;

        const data = await getReleaseComparison(organizationId, dateRange);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching release comparison:', error);
        return NextResponse.json({ error: 'Failed to fetch release comparison' }, { status: 500 });
    }
}
