
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Heart, Music, User2, Mail, Calendar, Globe } from "lucide-react"

export default async function AdminFansPage() {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

    // Get all artists with their releases, fans via subscriptions
    const artists = await prisma.artist.findMany({
        where: { isDeleted: false },
        include: {
            organization: { select: { name: true } },
            releases: {
                where: { isDeleted: false },
                include: {
                    fans: {
                        include: {
                            fan: {
                                include: {
                                    tags: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: { name: "asc" }
    })

    // Also get fans that have no subscriptions (direct org fans)
    const orphanFans = await prisma.fan.findMany({
        where: {
            subscriptions: { none: {} }
        },
        include: { organization: { select: { name: true } }, tags: true },
        orderBy: { createdAt: "desc" }
    })

    // Build grouped data: Artist -> unique fans
    const artistFanGroups = artists.map(artist => {
        // Collect unique fans across all releases for this artist
        const fanMap = new Map<string, any>()
        const releaseFanMap = new Map<string, string[]>() // fanId -> release titles

        for (const release of artist.releases) {
            for (const sub of release.fans) {
                if (!fanMap.has(sub.fan.id)) {
                    fanMap.set(sub.fan.id, {
                        ...sub.fan,
                        subscribedAt: sub.createdAt,
                        status: sub.status
                    })
                }
                const releases = releaseFanMap.get(sub.fan.id) || []
                releases.push(release.title)
                releaseFanMap.set(sub.fan.id, releases)
            }
        }

        const fans = Array.from(fanMap.values()).map(fan => ({
            ...fan,
            subscribedVia: releaseFanMap.get(fan.id) || []
        }))

        return {
            artist: { id: artist.id, name: artist.name, slug: artist.slug },
            organization: artist.organization.name,
            totalReleases: artist.releases.length,
            fans,
            fanCount: fans.length
        }
    }).filter(g => g.fanCount > 0 || g.totalReleases > 0) // Show all artists with releases or fans

    const totalFans = await prisma.fan.count()
    const totalSubscriptions = await prisma.fanSubscription.count()

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-white mb-2">Mailing List Subscribers</h1>
                <p className="text-zinc-400">All fans enrolled via artist/release pages, grouped by artist.</p>
            </header>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-[#121214] border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                            <Heart className="w-5 h-5" />
                        </div>
                        <h3 className="text-zinc-400 font-medium text-sm">Total Fans</h3>
                    </div>
                    <p className="text-3xl font-black text-white">{totalFans}</p>
                </div>
                <div className="bg-[#121214] border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <Mail className="w-5 h-5" />
                        </div>
                        <h3 className="text-zinc-400 font-medium text-sm">Total Subscriptions</h3>
                    </div>
                    <p className="text-3xl font-black text-white">{totalSubscriptions}</p>
                    <p className="text-sm text-zinc-500 mt-1">across all releases</p>
                </div>
                <div className="bg-[#121214] border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                            <Music className="w-5 h-5" />
                        </div>
                        <h3 className="text-zinc-400 font-medium text-sm">Artists with Fans</h3>
                    </div>
                    <p className="text-3xl font-black text-white">{artistFanGroups.filter(g => g.fanCount > 0).length}</p>
                    <p className="text-sm text-zinc-500 mt-1">of {artists.length} total artists</p>
                </div>
            </div>

            {/* Grouped by Artist */}
            <div className="space-y-8">
                {artistFanGroups.map(group => (
                    <div key={group.artist.id} className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden">
                        {/* Artist Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-lg">
                                    {group.artist.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{group.artist.name}</h2>
                                    <p className="text-sm text-zinc-500">{group.organization} · {group.totalReleases} release{group.totalReleases !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <div className="bg-purple-500/10 text-purple-400 px-4 py-2 rounded-xl font-bold text-sm">
                                {group.fanCount} fan{group.fanCount !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {/* Fan Table */}
                        {group.fanCount === 0 ? (
                            <div className="p-6 text-center text-zinc-500 text-sm">No subscribers yet</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 py-3">Fan</th>
                                            <th className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 py-3">Email</th>
                                            <th className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 py-3">Subscribed Via</th>
                                            <th className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 py-3">Country</th>
                                            <th className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 py-3">Tags</th>
                                            <th className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 py-3">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.fans.map(fan => (
                                            <tr key={fan.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                                            <User2 className="w-4 h-4 text-zinc-500" />
                                                        </div>
                                                        <span className="font-medium text-white text-sm">{fan.name || '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-zinc-400">{fan.email}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {fan.subscribedVia.map((release: string, i: number) => (
                                                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{release}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {fan.country ? (
                                                        <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                                                            <Globe className="w-3 h-3" />
                                                            {fan.country}
                                                        </div>
                                                    ) : (
                                                        <span className="text-zinc-600">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {fan.tags?.map((tag: any) => (
                                                            <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">{tag.name}</span>
                                                        ))}
                                                        {(!fan.tags || fan.tags.length === 0) && <span className="text-zinc-600">—</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-zinc-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(fan.subscribedAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}

                {/* Unassociated fans (no subscriptions) */}
                {orphanFans.length > 0 && (
                    <div className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 font-black text-lg">?</div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Unassociated Fans</h2>
                                    <p className="text-sm text-zinc-500">Fans without any release subscription</p>
                                </div>
                            </div>
                            <div className="bg-zinc-800 text-zinc-400 px-4 py-2 rounded-xl font-bold text-sm">
                                {orphanFans.length} fan{orphanFans.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 py-3">Fan</th>
                                        <th className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 py-3">Email</th>
                                        <th className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 py-3">Organization</th>
                                        <th className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 py-3">Country</th>
                                        <th className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orphanFans.map(fan => (
                                        <tr key={fan.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                                        <User2 className="w-4 h-4 text-zinc-500" />
                                                    </div>
                                                    <span className="font-medium text-white text-sm">{fan.name || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-400">{fan.email}</td>
                                            <td className="px-6 py-4 text-sm text-zinc-400">{fan.organization.name}</td>
                                            <td className="px-6 py-4">
                                                {fan.country ? (
                                                    <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                                                        <Globe className="w-3 h-3" />
                                                        {fan.country}
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-600">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(fan.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {artistFanGroups.length === 0 && orphanFans.length === 0 && (
                    <div className="bg-[#121214] border border-white/5 rounded-2xl p-12 text-center">
                        <Heart className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-zinc-400 mb-2">No fans yet</h3>
                        <p className="text-zinc-500">Fans will appear here when users subscribe through artist and release pages.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
