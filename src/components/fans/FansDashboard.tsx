"use client"

import { useState } from "react"
import FanDetailModal from "./FanDetailModal"

export default function FansDashboard({
    initialFans,
    organizationId,
    stats
}: {
    initialFans: any[],
    organizationId: string,
    stats: { totalFans: number, activeSubscribers: number, newThisWeek: number }
}) {
    const [search, setSearch] = useState("")
    const [selectedFan, setSelectedFan] = useState<any | null>(null)
    const [fans, setFans] = useState(initialFans)

    const filteredFans = fans.filter(fan =>
        fan.email.toLowerCase().includes(search.toLowerCase()) ||
        (fan.name || "").toLowerCase().includes(search.toLowerCase())
    )

    const handleFanClick = (fan: any) => {
        setSelectedFan(fan)
    }

    const handleModalClose = () => {
        setSelectedFan(null)
    }

    const handleFanUpdate = (updatedFan: any) => {
        setFans(fans.map(f => f.id === updatedFan.id ? updatedFan : f))
        setSelectedFan(updatedFan)
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        CRM & Fans
                    </h1>
                    <p className="text-zinc-500 mt-1">Manage your relationship with your audience.</p>
                </div>
                <div className="flex gap-4">
                    <a
                        href={`/api/fans/export?organizationId=${organizationId}`}
                        className="bg-zinc-800 text-white px-6 py-2 rounded-full font-bold hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    >
                        <span>📥</span> Export CSV
                    </a>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: "Total Fans", value: stats.totalFans, icon: "👥" },
                    { label: "Active Subscriptions", value: stats.activeSubscribers, icon: "⚡" },
                    { label: "New This Week", value: `+${stats.newThisWeek}`, icon: "📈" },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-2xl">{stat.icon}</span>
                        </div>
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
                        <p className="text-3xl font-black mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Fans Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Audience List</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search fans..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors w-64 text-white"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-950 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                <th className="px-6 py-4">Fan</th>
                                <th className="px-6 py-4">Country</th>
                                <th className="px-6 py-4">Subscriptions</th>
                                <th className="px-6 py-4">Tags</th>
                                <th className="px-6 py-4">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredFans.map((fan) => (
                                <tr
                                    key={fan.id}
                                    onClick={() => handleFanClick(fan)}
                                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white">{fan.name || "Anonymous"}</span>
                                            <span className="text-xs text-zinc-500">{fan.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-zinc-300">{fan.country || "—"}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {fan.subscriptions.map((sub: any) => (
                                                <span
                                                    key={sub.id}
                                                    className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${sub.status === 'ACTIVE'
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                                        }`}
                                                >
                                                    {sub.release.title}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {fan.tags.map((tag: any) => (
                                                <span key={tag.id} className="text-[10px] font-bold bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                                                    #{tag.name}
                                                </span>
                                            ))}
                                            {fan.tags.length === 0 && <span className="text-xs text-zinc-600">—</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-zinc-500">
                                            {new Date(fan.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredFans.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <p className="text-zinc-500 font-medium">No fans match your search.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <FanDetailModal
                fan={selectedFan}
                organizationId={organizationId}
                onClose={handleModalClose}
                onUpdate={handleFanUpdate}
            />
        </div>
    )
}
