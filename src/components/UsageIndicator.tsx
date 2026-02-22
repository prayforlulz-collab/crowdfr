"use client"

import { TierId } from "@/lib/pricing"
import { UsageStats } from "@/lib/tier-enforcement"
import Link from "next/link"

interface UsageIndicatorProps {
    stats: UsageStats
    currentTier: TierId
}

export default function UsageIndicator({ stats, currentTier }: UsageIndicatorProps) {

    const renderUsageBar = (label: string, used: number, limit: number) => {
        const isUnlimited = limit === -1
        const percent = isUnlimited ? 0 : Math.min(100, (used / limit) * 100)

        let colorClass = "bg-emerald-500"
        if (!isUnlimited) {
            if (percent >= 100) colorClass = "bg-red-500"
            else if (percent >= 80) colorClass = "bg-amber-500"
        }

        return (
            <div className="mb-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-400">
                    <span>{label}</span>
                    <span>{isUnlimited ? "Unlimited" : `${used} / ${limit}`}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    {!isUnlimited && (
                        <div
                            className={`h-full ${colorClass} transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                        />
                    )}
                    {isUnlimited && (
                        <div className="h-full bg-zinc-700/30 w-full" />
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Current Plan</span>
                    <h3 className="text-2xl font-black text-white">{currentTier}</h3>
                </div>
                {currentTier !== 'ENTERPRISE' && (
                    <Link
                        href="/dashboard/settings/billing"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Upgrade
                    </Link>
                )}
            </div>

            <div className="space-y-2">
                {renderUsageBar("Artists", stats.artists.used, stats.artists.limit)}
                {renderUsageBar("Releases", stats.releases.used, stats.releases.limit)}
                {renderUsageBar("Fans", stats.fans.used, stats.fans.limit)}
                {renderUsageBar("Emails (Monthly)", stats.emails.used, stats.emails.limit)}
            </div>
        </div>
    )
}
