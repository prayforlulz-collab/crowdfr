import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

// ============================================================================
// User Agent Parser (lightweight, no deps)
// ============================================================================

export function parseUserAgent(ua?: string | null) {
    if (!ua) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };

    // Device
    let device = 'Desktop';
    if (/Mobile|Android.*Mobile|iPhone|iPod/i.test(ua)) device = 'Mobile';
    else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) device = 'Tablet';

    // Browser
    let browser = 'Other';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

    // OS
    let os = 'Other';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Macintosh|Mac OS/i.test(ua)) os = 'macOS';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Linux/i.test(ua)) os = 'Linux';

    return { device, browser, os };
}

// ============================================================================
// UTM Parser
// ============================================================================

export function parseUtmParams(path: string) {
    try {
        const url = new URL(path, 'http://localhost');
        return {
            utm_source: url.searchParams.get('utm_source'),
            utm_medium: url.searchParams.get('utm_medium'),
            utm_campaign: url.searchParams.get('utm_campaign'),
            utm_term: url.searchParams.get('utm_term'),
            utm_content: url.searchParams.get('utm_content'),
        };
    } catch {
        return { utm_source: null, utm_medium: null, utm_campaign: null, utm_term: null, utm_content: null };
    }
}

// ============================================================================
// Click Tracking
// ============================================================================

export interface TrackClickParams {
    linkUrl: string;
    linkType: 'streaming' | 'social' | 'custom' | 'presave';
    linkLabel?: string;
    releaseId?: string;
    organizationId: string;
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    referrer?: string;
}

export async function trackClick(params: TrackClickParams) {
    return await prisma.clickEvent.create({
        data: {
            linkUrl: params.linkUrl,
            linkType: params.linkType,
            linkLabel: params.linkLabel,
            releaseId: params.releaseId,
            organizationId: params.organizationId,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            country: params.country,
            referrer: params.referrer,
        },
    });
}

// ============================================================================
// Page View Tracking
// ============================================================================

export interface TrackPageViewParams {
    path: string;
    releaseId?: string;
    organizationId: string;
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    referrer?: string;
    sessionId?: string;
    timeOnPage?: number;
}

export async function trackPageView(params: TrackPageViewParams) {
    return await prisma.pageView.create({
        data: {
            path: params.path,
            releaseId: params.releaseId,
            organizationId: params.organizationId,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            country: params.country,
            referrer: params.referrer,
            sessionId: params.sessionId,
            timeOnPage: params.timeOnPage,
        },
    });
}

// ============================================================================
// Custom Event Tracking
// ============================================================================

export interface TrackEventParams {
    eventType: string;
    eventData?: Prisma.InputJsonValue;
    releaseId?: string;
    fanId?: string;
    organizationId: string;
}

export async function trackEvent(params: TrackEventParams) {
    return await prisma.analyticsEvent.create({
        data: {
            eventType: params.eventType,
            eventData: params.eventData ? JSON.stringify(params.eventData) : null,
            releaseId: params.releaseId,
            fanId: params.fanId,
            organizationId: params.organizationId,
        },
    });
}

// ============================================================================
// Analytics Queries
// ============================================================================

export interface AnalyticsDateRange {
    startDate?: Date;
    endDate?: Date;
}

function buildDateWhere(organizationId: string, releaseId?: string, dateRange?: AnalyticsDateRange) {
    return {
        organizationId,
        ...(releaseId && { releaseId }),
        ...(dateRange && {
            createdAt: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            },
        }),
    };
}

// ============================================================================
// Click Stats
// ============================================================================

export interface ClickStats {
    totalClicks: number;
    clicksByType: Record<string, number>;
    topLinks: Array<{
        linkUrl: string;
        linkLabel: string | null;
        linkType: string;
        clicks: number;
    }>;
}

export async function getClickStats(
    organizationId: string,
    releaseId?: string,
    dateRange?: AnalyticsDateRange
): Promise<ClickStats> {
    const where = buildDateWhere(organizationId, releaseId, dateRange);

    const totalClicks = await prisma.clickEvent.count({ where });

    const clicksByTypeData = await prisma.clickEvent.groupBy({
        by: ['linkType'],
        where,
        _count: true,
    });

    const clicksByType = clicksByTypeData.reduce((acc, item) => {
        acc[item.linkType] = item._count;
        return acc;
    }, {} as Record<string, number>);

    const topLinksData = await prisma.clickEvent.groupBy({
        by: ['linkUrl', 'linkLabel', 'linkType'],
        where,
        _count: true,
        orderBy: { _count: { linkUrl: 'desc' } },
        take: 10,
    });

    const topLinks = topLinksData.map((item) => ({
        linkUrl: item.linkUrl,
        linkLabel: item.linkLabel,
        linkType: item.linkType,
        clicks: item._count,
    }));

    return { totalClicks, clicksByType, topLinks };
}

// ============================================================================
// Page View Stats
// ============================================================================

export interface PageViewStats {
    totalViews: number;
    uniqueVisitors: number;
    averageTimeOnPage: number;
    topReferrers: Array<{ referrer: string | null; views: number }>;
}

export async function getPageViewStats(
    organizationId: string,
    releaseId?: string,
    dateRange?: AnalyticsDateRange
): Promise<PageViewStats> {
    const where = buildDateWhere(organizationId, releaseId, dateRange);

    const totalViews = await prisma.pageView.count({ where });

    const uniqueVisitorsData = await prisma.pageView.groupBy({
        by: ['ipAddress'],
        where: { ...where, ipAddress: { not: null } },
    });
    const uniqueVisitors = uniqueVisitorsData.length;

    const avgTimeData = await prisma.pageView.aggregate({
        where: { ...where, timeOnPage: { not: null } },
        _avg: { timeOnPage: true },
    });
    const averageTimeOnPage = Math.round(avgTimeData._avg.timeOnPage || 0);

    const topReferrersData = await prisma.pageView.groupBy({
        by: ['referrer'],
        where,
        _count: true,
        orderBy: { _count: { referrer: 'desc' } },
        take: 10,
    });

    const topReferrers = topReferrersData.map((item) => ({
        referrer: item.referrer,
        views: item._count,
    }));

    return { totalViews, uniqueVisitors, averageTimeOnPage, topReferrers };
}

// ============================================================================
// Dashboard Stats
// ============================================================================

export interface DashboardStats {
    totalViews: number;
    totalClicks: number;
    conversionRate: number;
    averageTimeOnPage: number;
    totalFans: number;
    newFans: number;
}

export async function getDashboardStats(
    organizationId: string,
    dateRange?: AnalyticsDateRange
): Promise<DashboardStats> {
    const where = buildDateWhere(organizationId, undefined, dateRange);

    const totalViews = await prisma.pageView.count({ where });
    const totalClicks = await prisma.clickEvent.count({ where });

    const fanSignups = await prisma.analyticsEvent.count({
        where: { ...where, eventType: 'fan_signup' },
    });

    const conversionRate = totalViews > 0 ? (fanSignups / totalViews) * 100 : 0;

    const avgTimeData = await prisma.pageView.aggregate({
        where: { ...where, timeOnPage: { not: null } },
        _avg: { timeOnPage: true },
    });
    const averageTimeOnPage = Math.round(avgTimeData._avg.timeOnPage || 0);

    const totalFans = await prisma.fan.count({ where: { organizationId } });
    const newFans = await prisma.fan.count({
        where: {
            organizationId,
            ...(dateRange && {
                createdAt: { gte: dateRange.startDate, lte: dateRange.endDate }
            })
        }
    });

    return {
        totalViews,
        totalClicks,
        conversionRate: Math.round(conversionRate * 10) / 10,
        averageTimeOnPage,
        totalFans,
        newFans,
    };
}

// ============================================================================
// Time Series Data (Views, Clicks, Fan Signups)
// ============================================================================

export interface TimeSeriesData {
    date: string;
    views: number;
    clicks: number;
    signups: number;
}

export async function getTimeSeriesData(
    organizationId: string,
    releaseId?: string,
    dateRange?: AnalyticsDateRange
): Promise<TimeSeriesData[]> {
    const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate || new Date();

    const days: TimeSeriesData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);

        const dayWhere = {
            organizationId,
            ...(releaseId && { releaseId }),
            createdAt: { gte: dayStart, lte: dayEnd },
        };

        const [views, clicks, signups] = await Promise.all([
            prisma.pageView.count({ where: dayWhere }),
            prisma.clickEvent.count({ where: dayWhere }),
            prisma.fan.count({
                where: {
                    organizationId,
                    createdAt: { gte: dayStart, lte: dayEnd },
                }
            }),
        ]);

        days.push({
            date: currentDate.toISOString().split('T')[0],
            views,
            clicks,
            signups,
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
}

// ============================================================================
// Geographic Stats
// ============================================================================

export interface GeoStats {
    countries: Array<{ country: string; views: number; clicks: number; fans: number }>;
}

export async function getGeoStats(
    organizationId: string,
    releaseId?: string,
    dateRange?: AnalyticsDateRange
): Promise<GeoStats> {
    const where = buildDateWhere(organizationId, releaseId, dateRange);

    const viewsByCountry = await prisma.pageView.groupBy({
        by: ['country'],
        where: { ...where, country: { not: null } },
        _count: true,
        orderBy: { _count: { country: 'desc' } },
        take: 20,
    });

    const clicksByCountry = await prisma.clickEvent.groupBy({
        by: ['country'],
        where: { ...where, country: { not: null } },
        _count: true,
    });

    const fansByCountry = await prisma.fan.groupBy({
        by: ['country'],
        where: { organizationId, country: { not: null } },
        _count: true,
    });

    const clickMap = new Map(clicksByCountry.map(c => [c.country, c._count]));
    const fanMap = new Map(fansByCountry.map(f => [f.country, f._count]));

    const countries = viewsByCountry.map(v => ({
        country: v.country || 'Unknown',
        views: v._count,
        clicks: clickMap.get(v.country) || 0,
        fans: fanMap.get(v.country) || 0,
    }));

    return { countries };
}

// ============================================================================
// Device / Browser Stats
// ============================================================================

export interface DeviceStats {
    devices: Record<string, number>;
    browsers: Record<string, number>;
    os: Record<string, number>;
}

export async function getDeviceStats(
    organizationId: string,
    releaseId?: string,
    dateRange?: AnalyticsDateRange
): Promise<DeviceStats> {
    const where = buildDateWhere(organizationId, releaseId, dateRange);

    const pageViews = await prisma.pageView.findMany({
        where: { ...where, userAgent: { not: null } },
        select: { userAgent: true },
    });

    const devices: Record<string, number> = {};
    const browsers: Record<string, number> = {};
    const os: Record<string, number> = {};

    for (const pv of pageViews) {
        const parsed = parseUserAgent(pv.userAgent);
        devices[parsed.device] = (devices[parsed.device] || 0) + 1;
        browsers[parsed.browser] = (browsers[parsed.browser] || 0) + 1;
        os[parsed.os] = (os[parsed.os] || 0) + 1;
    }

    return { devices, browsers, os };
}

// ============================================================================
// Funnel Data (Views → Clicks → Signups)
// ============================================================================

export interface FunnelData {
    views: number;
    clicks: number;
    signups: number;
    viewToClickRate: number;
    clickToSignupRate: number;
    overallConversionRate: number;
}

export async function getFunnelData(
    organizationId: string,
    releaseId?: string,
    dateRange?: AnalyticsDateRange
): Promise<FunnelData> {
    const where = buildDateWhere(organizationId, releaseId, dateRange);

    const [views, clicks, signups] = await Promise.all([
        prisma.pageView.count({ where }),
        prisma.clickEvent.count({ where }),
        prisma.fan.count({
            where: {
                organizationId,
                ...(dateRange && { createdAt: { gte: dateRange.startDate, lte: dateRange.endDate } }),
            }
        }),
    ]);

    return {
        views,
        clicks,
        signups,
        viewToClickRate: views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0,
        clickToSignupRate: clicks > 0 ? Math.round((signups / clicks) * 1000) / 10 : 0,
        overallConversionRate: views > 0 ? Math.round((signups / views) * 1000) / 10 : 0,
    };
}

// ============================================================================
// Per-Release Comparison
// ============================================================================

export interface ReleaseComparisonItem {
    id: string;
    title: string;
    artistName: string;
    views: number;
    clicks: number;
    fans: number;
    ctr: number;
    conversionRate: number;
}

export async function getReleaseComparison(
    organizationId: string,
    dateRange?: AnalyticsDateRange
): Promise<ReleaseComparisonItem[]> {
    const releases = await prisma.release.findMany({
        where: { artist: { organizationId }, isDeleted: false },
        include: { artist: { select: { name: true } } },
    });

    const results: ReleaseComparisonItem[] = [];

    for (const release of releases) {
        const dateWhere = dateRange ? { createdAt: { gte: dateRange.startDate, lte: dateRange.endDate } } : {};

        const [views, clicks, fans] = await Promise.all([
            prisma.pageView.count({ where: { releaseId: release.id, organizationId, ...dateWhere } }),
            prisma.clickEvent.count({ where: { releaseId: release.id, organizationId, ...dateWhere } }),
            prisma.fanSubscription.count({ where: { releaseId: release.id, ...dateWhere } }),
        ]);

        results.push({
            id: release.id,
            title: release.title,
            artistName: release.artist.name,
            views,
            clicks,
            fans,
            ctr: views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0,
            conversionRate: views > 0 ? Math.round((fans / views) * 1000) / 10 : 0,
        });
    }

    return results.sort((a, b) => b.views - a.views);
}

// ============================================================================
// Campaign Stats
// ============================================================================

export interface CampaignStatsItem {
    id: string;
    subject: string;
    status: string;
    sentAt: Date | null;
    delivered: number;
    opens: number;
    uniqueOpens: number;
    clicks: number;
    uniqueClicks: number;
    bounces: number;
    unsubscribes: number;
    openRate: number;
    clickRate: number;
}

export async function getCampaignStats(organizationId: string): Promise<CampaignStatsItem[]> {
    const campaigns = await prisma.campaign.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });

    return campaigns.map(c => ({
        id: c.id,
        subject: c.subject,
        status: c.status,
        sentAt: c.sentAt,
        delivered: c.delivered,
        opens: c.opens,
        uniqueOpens: c.uniqueOpens,
        clicks: c.clicks,
        uniqueClicks: c.uniqueClicks,
        bounces: c.bounces,
        unsubscribes: c.unsubscribes,
        openRate: c.delivered > 0 ? Math.round((c.uniqueOpens / c.delivered) * 1000) / 10 : 0,
        clickRate: c.delivered > 0 ? Math.round((c.uniqueClicks / c.delivered) * 1000) / 10 : 0,
    }));
}

// ============================================================================
// Peak Hours Heatmap
// ============================================================================

export interface PeakHoursData {
    hours: Array<{ hour: number; views: number; clicks: number }>;
    days: Array<{ day: number; views: number; clicks: number }>;
}

export async function getPeakHoursData(
    organizationId: string,
    releaseId?: string,
    dateRange?: AnalyticsDateRange
): Promise<PeakHoursData> {
    const where = buildDateWhere(organizationId, releaseId, dateRange);

    const pageViews = await prisma.pageView.findMany({
        where,
        select: { createdAt: true },
    });

    const clicks = await prisma.clickEvent.findMany({
        where,
        select: { createdAt: true },
    });

    const hourViews: number[] = new Array(24).fill(0);
    const hourClicks: number[] = new Array(24).fill(0);
    const dayViews: number[] = new Array(7).fill(0);
    const dayClicks: number[] = new Array(7).fill(0);

    for (const pv of pageViews) {
        hourViews[pv.createdAt.getHours()]++;
        dayViews[pv.createdAt.getDay()]++;
    }
    for (const c of clicks) {
        hourClicks[c.createdAt.getHours()]++;
        dayClicks[c.createdAt.getDay()]++;
    }

    return {
        hours: hourViews.map((views, hour) => ({
            hour,
            views,
            clicks: hourClicks[hour],
        })),
        days: dayViews.map((views, day) => ({
            day,
            views,
            clicks: dayClicks[day],
        })),
    };
}

// ============================================================================
// UTM Stats
// ============================================================================

export interface UtmStats {
    sources: Array<{ source: string; views: number }>;
    mediums: Array<{ medium: string; views: number }>;
    campaigns: Array<{ campaign: string; views: number }>;
}

export async function getUtmStats(
    organizationId: string,
    releaseId?: string,
    dateRange?: AnalyticsDateRange
): Promise<UtmStats> {
    const where = buildDateWhere(organizationId, releaseId, dateRange);

    const pageViews = await prisma.pageView.findMany({
        where,
        select: { path: true },
    });

    const sourceMap = new Map<string, number>();
    const mediumMap = new Map<string, number>();
    const campaignMap = new Map<string, number>();

    for (const pv of pageViews) {
        const utms = parseUtmParams(pv.path);
        if (utms.utm_source) sourceMap.set(utms.utm_source, (sourceMap.get(utms.utm_source) || 0) + 1);
        if (utms.utm_medium) mediumMap.set(utms.utm_medium, (mediumMap.get(utms.utm_medium) || 0) + 1);
        if (utms.utm_campaign) campaignMap.set(utms.utm_campaign, (campaignMap.get(utms.utm_campaign) || 0) + 1);
    }

    const toSorted = (map: Map<string, number>, key: string) =>
        Array.from(map.entries())
            .map(([name, views]) => ({ [key]: name, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10) as any[];

    return {
        sources: toSorted(sourceMap, 'source'),
        mediums: toSorted(mediumMap, 'medium'),
        campaigns: toSorted(campaignMap, 'campaign'),
    };
}
