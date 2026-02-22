
"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown, Clock, User, Building2, Music, Disc, Filter } from "lucide-react"

function getActionLabel(action: string): string {
    const labels: Record<string, string> = {
        USER_SUSPENDED: "Suspended user",
        USER_ACTIVATED: "Activated user",
        USER_DELETED: "Soft-deleted user",
        USER_RESTORED: "Restored user",
        USER_PASSWORD_RESET: "Reset password",
        USER_MFA_RESET: "Reset MFA",
        USER_SESSIONS_REVOKED: "Force logged out",
        ORG_PRO_UPGRADED: "Upgraded to PRO",
        ORG_PRO_DOWNGRADED: "Downgraded from PRO",
        ORG_DISABLED: "Disabled organization",
        ORG_ENABLED: "Enabled organization",
        ORG_OWNERSHIP_TRANSFERRED: "Transferred ownership",
        ARTIST_HIDDEN: "Hidden artist",
        ARTIST_VISIBLE: "Made artist visible",
        ARTIST_DELETED: "Soft-deleted artist",
        RELEASE_HIDDEN: "Hidden release",
        RELEASE_VISIBLE: "Made release visible",
        RELEASE_DELETED: "Soft-deleted release",
        CONTENT_BULK_HIDDEN: "Bulk hidden content",
        CONTENT_BULK_VISIBLE: "Bulk made content visible",
        NOTE_ADDED: "Added admin note",
    }
    return labels[action] || action.replace(/_/g, " ")
}

interface AuditEntry {
    id: string
    action: string
    entityType: string
    entityId: string
    entityLabel: string | null
    performedBy: string
    adminEmail: string | null
    reason: string | null
    metadata: string | null
    createdAt: string
}

const entityTypeIcons: Record<string, any> = {
    USER: User,
    ORGANIZATION: Building2,
    ARTIST: Music,
    RELEASE: Disc,
}

const entityTypeColors: Record<string, string> = {
    USER: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    ORGANIZATION: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    ARTIST: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    RELEASE: "text-orange-400 bg-orange-500/10 border-orange-500/20",
}

export default function AuditLogList() {
    const [entries, setEntries] = useState<AuditEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [loadingMore, setLoadingMore] = useState(false)

    // Filters
    const [entityTypeFilter, setEntityTypeFilter] = useState<string>("")
    const [actionFilter, setActionFilter] = useState("")

    const fetchEntries = async (cursor?: string, append = false) => {
        if (append) setLoadingMore(true)
        else setLoading(true)

        try {
            const params = new URLSearchParams()
            if (entityTypeFilter) params.set("entityType", entityTypeFilter)
            if (actionFilter) params.set("action", actionFilter)
            if (cursor) params.set("cursor", cursor)
            params.set("limit", "50")

            const res = await fetch(`/api/admin/audit-log?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                if (append) {
                    setEntries(prev => [...prev, ...data.entries])
                } else {
                    setEntries(data.entries)
                }
                setNextCursor(data.nextCursor)
            }
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    useEffect(() => {
        fetchEntries()
    }, [entityTypeFilter])

    const handleSearch = () => {
        fetchEntries()
    }

    const formatTimestamp = (ts: string) => {
        const date = new Date(ts)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const mins = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (mins < 1) return "Just now"
        if (mins < 60) return `${mins}m ago`
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return date.toLocaleDateString()
    }

    return (
        <div>
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-zinc-500" />
                    <select
                        className="bg-[#121214] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none cursor-pointer"
                        value={entityTypeFilter}
                        onChange={(e) => setEntityTypeFilter(e.target.value)}
                    >
                        <option value="">All Entities</option>
                        <option value="USER">Users</option>
                        <option value="ORGANIZATION">Organizations</option>
                        <option value="ARTIST">Artists</option>
                        <option value="RELEASE">Releases</option>
                    </select>
                </div>

                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Filter by action..."
                        className="w-full bg-[#121214] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                </div>

                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all"
                >
                    Search
                </button>
            </div>

            {/* Timeline */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <span className="w-6 h-6 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-16">
                    <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">No audit log entries found.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {entries.map((entry) => {
                        const Icon = entityTypeIcons[entry.entityType] || Clock
                        const colorClass = entityTypeColors[entry.entityType] || "text-zinc-400 bg-zinc-800"

                        return (
                            <div
                                key={entry.id}
                                className="bg-[#121214] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg border flex-shrink-0 ${colorClass}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-white font-medium text-sm">
                                                {getActionLabel(entry.action)}
                                            </span>
                                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${colorClass}`}>
                                                {entry.entityType}
                                            </span>
                                        </div>
                                        {entry.entityLabel && (
                                            <p className="text-zinc-400 text-sm mt-1">{entry.entityLabel}</p>
                                        )}
                                        {entry.reason && (
                                            <p className="text-zinc-500 text-sm mt-1 italic">
                                                Reason: {entry.reason}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {entry.adminEmail || "System"}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTimestamp(entry.createdAt)}
                                            </span>
                                            <span className="text-zinc-600 font-mono text-[10px]">
                                                {entry.entityId.length > 20 ? entry.entityId.substring(0, 20) + "..." : entry.entityId}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* Load More */}
                    {nextCursor && (
                        <div className="text-center pt-4">
                            <button
                                onClick={() => fetchEntries(nextCursor, true)}
                                disabled={loadingMore}
                                className="px-6 py-2 bg-[#121214] border border-white/10 rounded-xl text-zinc-400 text-sm font-medium hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
                            >
                                {loadingMore ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
                                        Loading...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <ChevronDown className="w-4 h-4" />
                                        Load More
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
