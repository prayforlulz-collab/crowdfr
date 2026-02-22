import { NextRequest, NextResponse } from 'next/server';
import { getCampaignStats } from '@/lib/analytics';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');

        if (!organizationId) {
            return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
        }

        const data = await getCampaignStats(organizationId);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching campaign stats:', error);
        return NextResponse.json({ error: 'Failed to fetch campaign statistics' }, { status: 500 });
    }
}
