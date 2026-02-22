import { NextRequest, NextResponse } from 'next/server';
import { getTimeSeriesData } from '@/lib/analytics';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');
        const releaseId = searchParams.get('releaseId') || undefined;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!organizationId) {
            return NextResponse.json(
                { error: 'organizationId is required' },
                { status: 400 }
            );
        }

        // Default to last 30 days if no date range provided
        const defaultEndDate = new Date();
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 30);

        const dateRange = {
            startDate: startDate ? new Date(startDate) : defaultStartDate,
            endDate: endDate ? new Date(endDate) : defaultEndDate,
        };

        const series = await getTimeSeriesData(organizationId, releaseId, dateRange);

        return NextResponse.json(series);
    } catch (error) {
        console.error('Error fetching time series data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch time series data' },
            { status: 500 }
        );
    }
}
