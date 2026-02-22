
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { Users, Music, Disc, Building2, TrendingUp, Crown, Activity } from "lucide-react"
import { getActionLabel } from "@/lib/audit-log"

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions)

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Fetch all stats in parallel
    const [
        userCount,
        artistCount,
        releaseCount,
        orgCount,
        signups7d,
        signups30d,
        releases7d,
        releases30d,
        proOrgCount,
        recentActivity,
    ] = await Promise.all([
        prisma.user.count({ where: { isDeleted: false } }),
        prisma.artist.count({ where: { isDeleted: false } }),
        prisma.release.count({ where: { isDeleted: false } }),
        prisma.organization.count({ where: { isDeleted: false } }),
        prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo }, isDeleted: false } }),
        prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, isDeleted: false } }),
        prisma.release.count({ where: { createdAt: { gte: sevenDaysAgo }, isDeleted: false } }),
        prisma.release.count({ where: { createdAt: { gte: thirtyDaysAgo }, isDeleted: false } }),
        prisma.organization.count({
            where: {
                tier: { not: "FREE" },
                subscriptionStatus: "active",
                isDeleted: false,
            },
        }),
        prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 15,
        }),
    ])

    const mainStats = [
        { label: "Total Users", value: userCount, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Organizations", value: orgCount, icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "Artists", value: artistCount, icon: Music, color: "text-pink-500", bg: "bg-pink-500/10" },
        { label: "Releases", value: releaseCount, icon: Disc, color: "text-orange-500", bg: "bg-orange-500/10" },
    ]

    const growthStats = [
        { label: "New Signups (7d)", value: signups7d, sub: `${signups30d} in 30d` },
        { label: "New Releases (7d)", value: releases7d, sub: `${releases30d} in 30d` },
        { label: "Active PRO Orgs", value: proOrgCount, sub: "paid & active" },
    ]

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-white mb-2">Platform Overview</h1>
                <p className="text-zinc-400">Welcome back, {session?.user.name}. Here&apos;s what&apos;s happening on Crowdz.</p>
            </header>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mainStats.map((stat, i) => (
                    <div key={i} className="bg-[#121214] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-zinc-400 font-medium mb-1">{stat.label}</h3>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Growth Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {growthStats.map((stat, i) => (
                    <div key={i} className="bg-[#121214] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                                {i < 2 ? <TrendingUp className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
                            </div>
                            <h3 className="text-zinc-400 font-medium text-sm">{stat.label}</h3>
                        </div>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                        <p className="text-sm text-zinc-500 mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="mt-12 p-8 bg-[#121214] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-5 h-5 text-zinc-400" />
                    <h2 className="text-xl font-bold text-white">Recent Admin Activity</h2>
                </div>
                {recentActivity.length === 0 ? (
                    <p className="text-zinc-500">No admin activity logged yet.</p>
                ) : (
                    <div className="space-y-4">
                        {recentActivity.map((entry) => (
                            <div key={entry.id} className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0">
                                <div className="w-2 h-2 rounded-full bg-zinc-500 mt-2 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white">
                                        <span className="font-semibold text-zinc-300">{getActionLabel(entry.action)}</span>
                                        {entry.entityLabel && (
                                            <span className="text-zinc-400"> — {entry.entityLabel}</span>
                                        )}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-zinc-500">{entry.adminEmail || "System"}</span>
                                        <span className="text-xs text-zinc-600">•</span>
                                        <span className="text-xs text-zinc-500">
                                            {new Date(entry.createdAt).toLocaleString()}
                                        </span>
                                        {entry.reason && (
                                            <>
                                                <span className="text-xs text-zinc-600">•</span>
                                                <span className="text-xs text-zinc-400 italic">{entry.reason}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 flex-shrink-0">
                                    {entry.entityType}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
