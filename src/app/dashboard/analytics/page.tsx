'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// ============================================================================
// Types
// ============================================================================

interface DashboardStats {
    totalViews: number;
    totalClicks: number;
    conversionRate: number;
    averageTimeOnPage: number;
    totalFans: number;
    newFans: number;
}

interface TimeSeriesData { date: string; views: number; clicks: number; signups: number }

interface ClickStats {
    totalClicks: number;
    clicksByType: Record<string, number>;
    topLinks: Array<{ linkUrl: string; linkLabel: string | null; linkType: string; clicks: number }>;
}

interface PageViewStats {
    totalViews: number;
    uniqueVisitors: number;
    averageTimeOnPage: number;
    topReferrers: Array<{ referrer: string | null; views: number }>;
}

interface GeoStats { countries: Array<{ country: string; views: number; clicks: number; fans: number }> }
interface DeviceStats { devices: Record<string, number>; browsers: Record<string, number>; os: Record<string, number> }
interface FunnelData { views: number; clicks: number; signups: number; viewToClickRate: number; clickToSignupRate: number; overallConversionRate: number }

interface ReleaseComparisonItem {
    id: string; title: string; artistName: string; views: number; clicks: number; fans: number; ctr: number; conversionRate: number
}

interface CampaignStatsItem {
    id: string; subject: string; status: string; sentAt: string | null;
    delivered: number; opens: number; uniqueOpens: number; clicks: number;
    uniqueClicks: number; bounces: number; unsubscribes: number; openRate: number; clickRate: number
}

interface PeakHoursData {
    hours: Array<{ hour: number; views: number; clicks: number }>;
    days: Array<{ day: number; views: number; clicks: number }>;
}

interface UtmStats {
    sources: Array<{ source: string; views: number }>;
    mediums: Array<{ medium: string; views: number }>;
    campaigns: Array<{ campaign: string; views: number }>;
}

interface Artist { id: string; name: string }
interface Release { id: string; title: string; artist: Artist }

// ============================================================================
// Constants
// ============================================================================

const COLORS = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DATE_RANGES = [
    { label: '7d', days: 7 },
    { label: '30d', days: 30 },
    { label: '90d', days: 90 },
    { label: 'All', days: 0 },
];

// ============================================================================
// Component
// ============================================================================

export default function AnalyticsPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
    const [clickStats, setClickStats] = useState<ClickStats | null>(null);
    const [pageViewStats, setPageViewStats] = useState<PageViewStats | null>(null);
    const [geoStats, setGeoStats] = useState<GeoStats | null>(null);
    const [deviceStats, setDeviceStats] = useState<DeviceStats | null>(null);
    const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
    const [releaseComparison, setReleaseComparison] = useState<ReleaseComparisonItem[]>([]);
    const [campaignStats, setCampaignStats] = useState<CampaignStatsItem[]>([]);
    const [peakHours, setPeakHours] = useState<PeakHoursData | null>(null);
    const [utmStats, setUtmStats] = useState<UtmStats | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [releases, setReleases] = useState<Release[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<{ type: 'all' | 'artist' | 'release', id?: string }>({ type: 'all' });
    const [dateRange, setDateRange] = useState(30);
    const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'audience' | 'campaigns'>('overview');

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const [orgsRes, artistsRes, releasesRes] = await Promise.all([
                    fetch('/api/organizations'),
                    fetch('/api/artists'),
                    fetch('/api/releases')
                ]);

                if (orgsRes.ok) {
                    const orgs = await orgsRes.json();
                    if (orgs.length > 0) setOrganizationId(orgs[0].id);
                }
                if (artistsRes.ok) setArtists(await artistsRes.json());
                if (releasesRes.ok) setReleases(await releasesRes.json());
            } catch (err) {
                console.error('Failed to fetch initial data:', err);
            }
        }
        fetchInitialData();
    }, []);

    const fetchAllData = useCallback(async () => {
        if (!organizationId) { setLoading(false); return; }

        try {
            setLoading(true);
            setError(null);

            let releaseId: string | undefined;
            if (selectedFilter.type === 'release' && selectedFilter.id) {
                releaseId = selectedFilter.id;
            }

            const params = new URLSearchParams({ organizationId });
            if (releaseId) params.append('releaseId', releaseId);

            if (dateRange > 0) {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - dateRange);
                params.append('startDate', start.toISOString());
                params.append('endDate', end.toISOString());
            }

            const q = params.toString();

            const [
                statsRes, seriesRes, clicksRes, viewsRes,
                geoRes, devicesRes, funnelRes, releasesRes,
                campaignsRes, peakRes, utmRes,
            ] = await Promise.all([
                fetch(`/api/analytics/stats?${q}`),
                fetch(`/api/analytics/series?${q}`),
                fetch(`/api/analytics/clicks?${q}`),
                fetch(`/api/analytics/views?${q}`),
                fetch(`/api/analytics/geo?${q}`),
                fetch(`/api/analytics/devices?${q}`),
                fetch(`/api/analytics/funnel?${q}`),
                fetch(`/api/analytics/releases?${q}`),
                fetch(`/api/analytics/campaigns?${q}`),
                fetch(`/api/analytics/peak-hours?${q}`),
                fetch(`/api/analytics/utm?${q}`),
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (seriesRes.ok) setTimeSeries(await seriesRes.json());
            if (clicksRes.ok) setClickStats(await clicksRes.json());
            if (viewsRes.ok) setPageViewStats(await viewsRes.json());
            if (geoRes.ok) setGeoStats(await geoRes.json());
            if (devicesRes.ok) setDeviceStats(await devicesRes.json());
            if (funnelRes.ok) setFunnelData(await funnelRes.json());
            if (releasesRes.ok) setReleaseComparison(await releasesRes.json());
            if (campaignsRes.ok) setCampaignStats(await campaignsRes.json());
            if (peakRes.ok) setPeakHours(await peakRes.json());
            if (utmRes.ok) setUtmStats(await utmRes.json());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    }, [organizationId, selectedFilter, dateRange]);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ============================================================================
    // Render helpers
    // ============================================================================

    const pieData = (record: Record<string, number>) =>
        Object.entries(record).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
        <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all ${className}`}>
            {children}
        </div>
    );

    const SectionTitle = ({ children }: { children: React.ReactNode }) => (
        <h2 className="text-lg font-bold text-white mb-4">{children}</h2>
    );

    // ============================================================================
    // No org state
    // ============================================================================

    if (!organizationId && !loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">Analytics</h1>
                <Card>
                    <div className="text-center py-12">
                        <div className="text-6xl mb-6">📊</div>
                        <h2 className="text-2xl font-bold mb-4">Create Your First Artist</h2>
                        <p className="text-zinc-500">Start tracking analytics by creating an artist profile and your first release.</p>
                    </div>
                </Card>
            </div>
        );
    }

    const statCards = stats ? [
        { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: "👁️", color: "from-blue-500 to-cyan-500" },
        { label: "Link Clicks", value: stats.totalClicks.toLocaleString(), icon: "🖱️", color: "from-purple-500 to-pink-500" },
        { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: "🎯", color: "from-green-500 to-emerald-500" },
        { label: "Avg. Time on Page", value: formatTime(stats.averageTimeOnPage), icon: "⏱️", color: "from-orange-500 to-red-500" },
        { label: "Total Fans", value: stats.totalFans.toLocaleString(), icon: "❤️", color: "from-pink-500 to-rose-500" },
        { label: "New Fans", value: stats.newFans.toLocaleString(), icon: "🆕", color: "from-emerald-500 to-teal-500" },
    ] : [];

    const tabs = [
        { id: 'overview' as const, label: 'Overview' },
        { id: 'engagement' as const, label: 'Engagement' },
        { id: 'audience' as const, label: 'Audience' },
        { id: 'campaigns' as const, label: 'Campaigns' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                            Analytics
                        </h1>
                        <p className="text-zinc-500 mt-1">Track your performance and fan engagement.</p>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        {/* Date Range */}
                        <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                            {DATE_RANGES.map(r => (
                                <button
                                    key={r.label}
                                    onClick={() => setDateRange(r.days)}
                                    className={`px-4 py-2 text-xs font-bold transition-all ${dateRange === r.days ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>

                        {/* Filter */}
                        <select
                            value={selectedFilter.type === 'all' ? 'all' : `${selectedFilter.type}:${selectedFilter.id}`}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === 'all') setSelectedFilter({ type: 'all' });
                                else {
                                    const [type, id] = value.split(':');
                                    setSelectedFilter({ type: type as 'artist' | 'release', id });
                                }
                            }}
                            className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-medium text-sm"
                        >
                            <option value="all">All Data</option>
                            {artists.length > 0 && <optgroup label="Artists">
                                {artists.map(a => <option key={a.id} value={`artist:${a.id}`}>{a.name}</option>)}
                            </optgroup>}
                            {releases.length > 0 && <optgroup label="Releases">
                                {releases.map(r => <option key={r.id} value={`release:${r.id}`}>{r.title} - {r.artist.name}</option>)}
                            </optgroup>}
                        </select>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-6 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-zinc-400 hover:text-white'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-pulse">
                            <div className="h-4 bg-zinc-800 rounded w-20 mb-2" />
                            <div className="h-8 bg-zinc-800 rounded w-14" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <Card><p className="text-red-400">⚠️ {error}</p></Card>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        {statCards.map((stat, i) => (
                            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                                        <span className="text-lg">{stat.icon}</span>
                                    </div>
                                    <p className="text-2xl font-black">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ============== OVERVIEW TAB ============== */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Time Series */}
                            <Card>
                                <SectionTitle>Views, Clicks &amp; Fan Signups Over Time</SectionTitle>
                                {timeSeries.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={timeSeries}>
                                            <defs>
                                                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gSignups" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                            <XAxis dataKey="date" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                                            <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '0.75rem' }} labelStyle={{ color: '#a1a1aa' }} />
                                            <Legend />
                                            <Area type="monotone" dataKey="views" stroke="#a855f7" fill="url(#gViews)" strokeWidth={2} name="Views" />
                                            <Area type="monotone" dataKey="clicks" stroke="#ec4899" fill="url(#gClicks)" strokeWidth={2} name="Clicks" />
                                            <Area type="monotone" dataKey="signups" stroke="#10b981" fill="url(#gSignups)" strokeWidth={2} name="Signups" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center py-12 text-zinc-500">No data available yet</div>
                                )}
                            </Card>

                            {/* Funnel */}
                            {funnelData && (
                                <Card>
                                    <SectionTitle>Conversion Funnel</SectionTitle>
                                    <div className="flex items-end gap-4 justify-center py-6">
                                        {[
                                            { label: 'Views', value: funnelData.views, color: 'bg-purple-500', rate: null },
                                            { label: 'Clicks', value: funnelData.clicks, color: 'bg-pink-500', rate: funnelData.viewToClickRate },
                                            { label: 'Signups', value: funnelData.signups, color: 'bg-emerald-500', rate: funnelData.clickToSignupRate },
                                        ].map((step, i) => {
                                            const maxVal = Math.max(funnelData.views, 1);
                                            const height = Math.max((step.value / maxVal) * 200, 20);
                                            return (
                                                <div key={i} className="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
                                                    {step.rate !== null && (
                                                        <div className="text-xs text-zinc-400 font-bold">{step.rate}% →</div>
                                                    )}
                                                    <div className={`${step.color} rounded-xl w-full transition-all duration-500`} style={{ height: `${height}px`, opacity: 0.8 }} />
                                                    <p className="text-2xl font-black text-white">{step.value.toLocaleString()}</p>
                                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{step.label}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="text-center mt-2">
                                        <span className="text-sm font-bold text-emerald-400">Overall conversion: {funnelData.overallConversionRate}%</span>
                                    </div>
                                </Card>
                            )}

                            {/* Release Comparison */}
                            {releaseComparison.length > 0 && (
                                <Card>
                                    <SectionTitle>Release Performance Comparison</SectionTitle>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-zinc-800">
                                                    {['Release', 'Artist', 'Views', 'Clicks', 'CTR', 'Fans', 'Conv. Rate'].map(h => (
                                                        <th key={h} className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 px-4 py-3">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {releaseComparison.slice(0, 10).map(r => (
                                                    <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-4 py-3 font-bold text-white text-sm">{r.title}</td>
                                                        <td className="px-4 py-3 text-zinc-400 text-sm">{r.artistName}</td>
                                                        <td className="px-4 py-3 text-zinc-300 text-sm font-bold">{r.views.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-zinc-300 text-sm">{r.clicks.toLocaleString()}</td>
                                                        <td className="px-4 py-3"><span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">{r.ctr}%</span></td>
                                                        <td className="px-4 py-3 text-zinc-300 text-sm">{r.fans}</td>
                                                        <td className="px-4 py-3"><span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{r.conversionRate}%</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            )}

                            {/* Top Links + Referrers */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <SectionTitle>Top Links (with CTR)</SectionTitle>
                                    {clickStats && clickStats.topLinks.length > 0 ? (
                                        <div className="space-y-3">
                                            {clickStats.topLinks.slice(0, 5).map((link, i) => {
                                                const ctr = pageViewStats && pageViewStats.totalViews > 0 ? Math.round((link.clicks / pageViewStats.totalViews) * 1000) / 10 : 0;
                                                return (
                                                    <div key={i} className="bg-zinc-800/50 rounded-xl p-4 hover:bg-zinc-800 transition-colors">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-bold text-white truncate max-w-[200px]">
                                                                {link.linkLabel || (() => { try { return new URL(link.linkUrl).hostname } catch { return link.linkUrl } })()}
                                                            </span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-bold text-zinc-400">{ctr}% CTR</span>
                                                                <span className="text-sm font-bold text-purple-400">{link.clicks} clicks</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${link.linkType === 'streaming' ? 'bg-green-500/10 text-green-400' : link.linkType === 'social' ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-700 text-zinc-400'}`}>
                                                                {link.linkType}
                                                            </span>
                                                            <p className="text-xs text-zinc-600 truncate">{link.linkUrl}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-zinc-500">No link clicks yet</div>
                                    )}
                                </Card>

                                <Card>
                                    <SectionTitle>Top Referrers</SectionTitle>
                                    {pageViewStats && pageViewStats.topReferrers.length > 0 ? (
                                        <div className="space-y-3">
                                            {pageViewStats.topReferrers.slice(0, 5).map((ref, i) => (
                                                <div key={i} className="bg-zinc-800/50 rounded-xl p-4 hover:bg-zinc-800 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-white truncate max-w-[200px]">{ref.referrer || 'Direct'}</span>
                                                        <span className="text-sm font-bold text-cyan-400">{ref.views} views</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-zinc-500">No referrer data yet</div>
                                    )}
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* ============== ENGAGEMENT TAB ============== */}
                    {activeTab === 'engagement' && (
                        <div className="space-y-8">
                            {/* Click Types Pie + Peak Hours */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Click Types */}
                                <Card>
                                    <SectionTitle>Clicks by Type</SectionTitle>
                                    {clickStats && Object.keys(clickStats.clicksByType).length > 0 ? (
                                        <div className="flex items-center gap-6">
                                            <ResponsiveContainer width="50%" height={200}>
                                                <PieChart>
                                                    <Pie data={pieData(clickStats.clicksByType)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                                        {pieData(clickStats.clicksByType).map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '0.75rem' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="space-y-2">
                                                {pieData(clickStats.clicksByType).map((item, i) => (
                                                    <div key={item.name} className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                        <span className="text-sm text-zinc-300 capitalize">{item.name}</span>
                                                        <span className="text-sm font-bold text-zinc-400">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-zinc-500">No click data yet</div>
                                    )}
                                </Card>

                                {/* Peak Hours */}
                                <Card>
                                    <SectionTitle>Peak Hours</SectionTitle>
                                    {peakHours && peakHours.hours.some(h => h.views > 0) ? (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart data={peakHours.hours}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                                <XAxis dataKey="hour" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={(h) => `${h}:00`} />
                                                <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} />
                                                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '0.75rem' }} labelFormatter={(h) => `${h}:00`} />
                                                <Bar dataKey="views" fill="#a855f7" radius={[4, 4, 0, 0]} name="Views" />
                                                <Bar dataKey="clicks" fill="#ec4899" radius={[4, 4, 0, 0]} name="Clicks" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-center py-12 text-zinc-500">No hourly data yet</div>
                                    )}
                                </Card>
                            </div>

                            {/* Peak Days */}
                            <Card>
                                <SectionTitle>Activity by Day of Week</SectionTitle>
                                {peakHours && peakHours.days.some(d => d.views > 0) ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={peakHours.days.map(d => ({ ...d, dayName: DAY_NAMES[d.day] }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                            <XAxis dataKey="dayName" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
                                            <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '0.75rem' }} />
                                            <Bar dataKey="views" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Views" />
                                            <Bar dataKey="clicks" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Clicks" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center py-12 text-zinc-500">No daily data yet</div>
                                )}
                            </Card>

                            {/* UTM Tracking */}
                            {utmStats && (utmStats.sources.length > 0 || utmStats.mediums.length > 0 || utmStats.campaigns.length > 0) && (
                                <Card>
                                    <SectionTitle>UTM Campaign Tracking</SectionTitle>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { title: 'Sources', data: utmStats.sources, key: 'source' },
                                            { title: 'Mediums', data: utmStats.mediums, key: 'medium' },
                                            { title: 'Campaigns', data: utmStats.campaigns, key: 'campaign' },
                                        ].map(section => (
                                            <div key={section.title}>
                                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">{section.title}</h3>
                                                {section.data.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {section.data.map((item: any, i: number) => (
                                                            <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-3 py-2">
                                                                <span className="text-sm text-white truncate">{item[section.key]}</span>
                                                                <span className="text-xs font-bold text-purple-400">{item.views}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-zinc-600">No data</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-zinc-600 mt-4">Tip: Add ?utm_source=instagram&amp;utm_medium=bio&amp;utm_campaign=summer to your links to track marketing campaigns.</p>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* ============== AUDIENCE TAB ============== */}
                    {activeTab === 'audience' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Devices */}
                                <Card>
                                    <SectionTitle>Devices</SectionTitle>
                                    {deviceStats && Object.keys(deviceStats.devices).length > 0 ? (
                                        <div className="flex items-center gap-6">
                                            <ResponsiveContainer width="50%" height={200}>
                                                <PieChart>
                                                    <Pie data={pieData(deviceStats.devices)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                                        {pieData(deviceStats.devices).map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '0.75rem' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="space-y-3">
                                                {pieData(deviceStats.devices).map((item, i) => {
                                                    const total = Object.values(deviceStats.devices).reduce((a, b) => a + b, 0);
                                                    const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                                                    return (
                                                        <div key={item.name} className="flex items-center gap-3">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                            <span className="text-sm text-white font-bold">{item.name}</span>
                                                            <span className="text-xs text-zinc-500">{pct}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-zinc-500">No device data yet</div>
                                    )}
                                </Card>

                                {/* Browsers */}
                                <Card>
                                    <SectionTitle>Browsers</SectionTitle>
                                    {deviceStats && Object.keys(deviceStats.browsers).length > 0 ? (
                                        <div className="space-y-3">
                                            {pieData(deviceStats.browsers).map((item, i) => {
                                                const total = Object.values(deviceStats.browsers).reduce((a, b) => a + b, 0);
                                                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                                                const barWidth = Math.max(pct, 2);
                                                return (
                                                    <div key={item.name}>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm text-white font-medium">{item.name}</span>
                                                            <span className="text-xs text-zinc-400">{pct}% ({item.value})</span>
                                                        </div>
                                                        <div className="w-full bg-zinc-800 rounded-full h-2">
                                                            <div className="h-2 rounded-full transition-all" style={{ width: `${barWidth}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-zinc-500">No browser data yet</div>
                                    )}
                                </Card>
                            </div>

                            {/* Operating Systems */}
                            <Card>
                                <SectionTitle>Operating Systems</SectionTitle>
                                {deviceStats && Object.keys(deviceStats.os).length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {pieData(deviceStats.os).map((item, i) => {
                                            const total = Object.values(deviceStats.os).reduce((a, b) => a + b, 0);
                                            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                                            const icons: Record<string, string> = { Windows: '🪟', macOS: '🍎', iOS: '📱', Android: '🤖', Linux: '🐧', Other: '💻' };
                                            return (
                                                <div key={item.name} className="bg-zinc-800/50 rounded-xl p-4 text-center">
                                                    <div className="text-3xl mb-2">{icons[item.name] || '💻'}</div>
                                                    <p className="text-sm font-bold text-white">{item.name}</p>
                                                    <p className="text-lg font-black text-purple-400">{pct}%</p>
                                                    <p className="text-xs text-zinc-500">{item.value} visits</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-zinc-500">No OS data yet</div>
                                )}
                            </Card>

                            {/* Geographic */}
                            <Card>
                                <SectionTitle>Top Countries</SectionTitle>
                                {geoStats && geoStats.countries.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-zinc-800">
                                                    {['Country', 'Views', 'Clicks', 'Fans'].map(h => (
                                                        <th key={h} className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 px-4 py-3">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {geoStats.countries.map((c, i) => (
                                                    <tr key={i} className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-4 py-3 font-bold text-white text-sm">{c.country}</td>
                                                        <td className="px-4 py-3 text-zinc-300 text-sm">{c.views.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-zinc-300 text-sm">{c.clicks.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-zinc-300 text-sm">{c.fans}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-zinc-500">No geographic data yet. Country data will populate as visitors arrive.</div>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* ============== CAMPAIGNS TAB ============== */}
                    {activeTab === 'campaigns' && (
                        <div className="space-y-8">
                            <Card>
                                <SectionTitle>Email Campaign Performance</SectionTitle>
                                {campaignStats.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-zinc-800">
                                                    {['Campaign', 'Status', 'Delivered', 'Opens', 'Open Rate', 'Clicks', 'Click Rate', 'Bounces', 'Unsubs'].map(h => (
                                                        <th key={h} className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 py-3">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {campaignStats.map(c => (
                                                    <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-3 py-3 text-sm font-bold text-white max-w-[200px] truncate">{c.subject}</td>
                                                        <td className="px-3 py-3">
                                                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${c.status === 'SENT' ? 'bg-green-500/10 text-green-400' : c.status === 'DRAFT' ? 'bg-zinc-700 text-zinc-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                                {c.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 text-sm text-zinc-300">{c.delivered}</td>
                                                        <td className="px-3 py-3 text-sm text-zinc-300">{c.uniqueOpens}</td>
                                                        <td className="px-3 py-3"><span className="text-xs font-bold text-purple-400">{c.openRate}%</span></td>
                                                        <td className="px-3 py-3 text-sm text-zinc-300">{c.uniqueClicks}</td>
                                                        <td className="px-3 py-3"><span className="text-xs font-bold text-cyan-400">{c.clickRate}%</span></td>
                                                        <td className="px-3 py-3 text-sm text-zinc-300">{c.bounces}</td>
                                                        <td className="px-3 py-3 text-sm text-zinc-300">{c.unsubscribes}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-zinc-500">
                                        <div className="text-4xl mb-4">📧</div>
                                        <p>No email campaigns sent yet. Create and send campaigns to see performance data here.</p>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
