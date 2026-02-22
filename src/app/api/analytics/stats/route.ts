import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/analytics';

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');
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

        const stats = await getDashboardStats(organizationId, dateRange);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}
