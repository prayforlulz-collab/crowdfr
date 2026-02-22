
"use client"

import { useState } from "react"
import {
    Search, Building2, X, Send, History, Crown, Ban,
    ArrowRightLeft, ChevronRight, ExternalLink, Shield
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Org {
    id: string
    name: string
    slug: string
    tier: string
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    subscriptionStatus: string | null
    currentPeriodEnd: string | null
    createdAt: string
    isDeleted: boolean
    _count: { memberships: number; artists: number; releases: number; fans: number }
}

interface OrgDetail {
    organization: Org & {
        memberships: Array<{
            id: string
            role: string
            user: { id: string; name: string | null; email: string | null; role: string }
        }>

    }
    actionHistory: Array<{
        id: string
        action: string
        adminEmail: string | null
        reason: string | null
        createdAt: string
    }>
    notes: Array<{
        id: string
        content: string
        adminEmail: string | null
        createdAt: string
    }>
}

export default function OrgList({ initialOrgs }: { initialOrgs: any[] }) {
    const [orgs, setOrgs] = useState<Org[]>(initialOrgs)
    const [search, setSearch] = useState("")
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [actionType, setActionType] = useState<string | null>(null)
    const [selectedOrg, setSelectedOrg] = useState<OrgDetail | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [drawerLoading, setDrawerLoading] = useState(false)
    const [drawerTab, setDrawerTab] = useState<"members" | "subscription" | "notes" | "history">("members")
    const [newNote, setNewNote] = useState("")
    const [noteLoading, setNoteLoading] = useState(false)
    const router = useRouter()

    const filteredOrgs = orgs.filter(org =>
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.slug.toLowerCase().includes(search.toLowerCase()) ||
        org.id.toLowerCase().includes(search.toLowerCase())
    )

    const openOrgDrawer = async (orgId: string) => {
        setDrawerOpen(true)
        setDrawerLoading(true)
        setDrawerTab("members")
        try {
            const res = await fetch(`/api/admin/organizations/${orgId}`)
            if (res.ok) {
                const data = await res.json()
                setSelectedOrg(data)
            }
        } catch (error) {
            console.error("Failed to load org details")
        } finally {
            setDrawerLoading(false)
        }
    }

    const handleTierChange = async (orgId: string, orgName: string, newTier: string) => {
        if (!confirm(`Change ${orgName} to ${newTier}?`)) return
        setLoadingId(orgId)
        setActionType("tier")
        try {
            const res = await fetch(`/api/admin/organizations/${orgId}/tier`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tier: newTier }),
            })
            const data = await res.json()
            if (res.ok) {
                setOrgs(orgs.map(o => o.id === orgId ? { ...o, tier: newTier } : o))
                alert(data.message)
                router.refresh()
            } else {
                alert(data.error || "Failed to change tier")
            }
        } catch (error) {
            alert("Error changing tier")
        } finally {
            setLoadingId(null)
            setActionType(null)
        }
    }

    const handleDisable = async (org: Org) => {
        const action = org.isDeleted ? "enable" : "disable"
        if (!confirm(`${action} ${org.name}?`)) return
        setLoadingId(org.id)
        setActionType("disable")
        try {
            const res = await fetch(`/api/admin/organizations/${org.id}/disable`, { method: "POST" })
            const data = await res.json()
            if (res.ok) {
                setOrgs(orgs.map(o => o.id === org.id ? { ...o, isDeleted: data.isDeleted } : o))
                router.refresh()
            } else {
                alert(data.error || "Failed to update")
            }
        } catch (error) {
            alert("Error updating org")
        } finally {
            setLoadingId(null)
            setActionType(null)
        }
    }

    const handleTransferOwnership = async (orgId: string, newOwnerId: string) => {
        if (!confirm("Transfer ownership? The current owner will be demoted to ADMIN.")) return
        try {
            const res = await fetch(`/api/admin/organizations/${orgId}/transfer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newOwnerId }),
            })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
                openOrgDrawer(orgId) // Refresh detail
            } else {
                alert(data.error || "Failed to transfer")
            }
        } catch (error) {
            alert("Error transferring ownership")
        }
    }

    const handleAddNote = async () => {
        if (!selectedOrg || !newNote.trim()) return
        setNoteLoading(true)
        try {
            const res = await fetch(`/api/admin/organizations/${selectedOrg.organization.id}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newNote.trim() }),
            })
            if (res.ok) {
                const data = await res.json()
                setSelectedOrg({
                    ...selectedOrg,
                    notes: [data.note, ...selectedOrg.notes],
                })
                setNewNote("")
            }
        } catch (error) {
            alert("Error adding note")
        } finally {
            setNoteLoading(false)
        }
    }

    const tierBadge = (tier: string) => {
        if (tier === "FREE") return "bg-zinc-800 text-zinc-400"
        if (tier === "PLAN_1") return "bg-purple-500/10 text-purple-400 border border-purple-500/20"
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
    }

    const statusBadge = (status: string | null) => {
        if (status === "active") return "bg-green-500/10 text-green-400 border border-green-500/20"
        if (status === "canceled") return "bg-red-500/10 text-red-400 border border-red-500/20"
        if (status === "past_due") return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        return "bg-zinc-800 text-zinc-500"
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search by name, slug, or ID..."
                        className="w-full bg-[#121214] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-white/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="text-zinc-500 text-sm">
                    Showing {filteredOrgs.length} organizations
                </div>
            </div>

            <div className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 text-zinc-400 text-sm font-medium">
                            <th className="px-6 py-4">Organization</th>
                            <th className="px-6 py-4">Tier</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Members</th>
                            <th className="px-6 py-4">Artists</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredOrgs.map(org => (
                            <tr key={org.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => openOrgDrawer(org.id)}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-white font-medium flex items-center gap-2">
                                                {org.name}
                                                {org.isDeleted && <span className="text-xs text-red-400">(Disabled)</span>}
                                                <ChevronRight className="w-3 h-3 text-zinc-600" />
                                            </div>
                                            <div className="text-zinc-500 text-xs">{org.slug}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${tierBadge(org.tier)}`}>{org.tier}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusBadge(org.subscriptionStatus)}`}>
                                        {org.subscriptionStatus || "Free"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-zinc-300">{org._count.memberships}</td>
                                <td className="px-6 py-4 text-zinc-300">{org._count.artists}</td>
                                <td className="px-6 py-4 text-zinc-500 text-sm">{new Date(org.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-end gap-1">
                                        <select
                                            className="bg-zinc-800 text-zinc-300 text-xs rounded-lg px-2 py-1 border border-white/10 focus:outline-none cursor-pointer"
                                            value={org.tier}
                                            onChange={(e) => handleTierChange(org.id, org.name, e.target.value)}
                                            disabled={loadingId === org.id}
                                        >
                                            <option value="FREE">FREE</option>
                                            <option value="PLAN_1">PLAN_1</option>
                                            <option value="PLAN_2">PLAN_2</option>
                                        </select>
                                        <button
                                            onClick={() => handleDisable(org)}
                                            disabled={loadingId === org.id}
                                            className={`p-2 rounded-lg transition-all ${org.isDeleted ? "text-green-400 hover:bg-green-500/10" : "text-zinc-400 hover:text-red-500 hover:bg-red-500/10"}`}
                                            title={org.isDeleted ? "Enable" : "Disable"}
                                        >
                                            {loadingId === org.id && actionType === "disable" ? (
                                                <span className="w-4 h-4 block animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
                                            ) : (
                                                <Ban className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Org Detail Drawer */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
                    <div className="relative w-[560px] h-full bg-[#0e0e10] border-l border-white/10 overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0e0e10] z-10">
                            <h2 className="text-lg font-bold text-white">Organization Details</h2>
                            <button onClick={() => setDrawerOpen(false)} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {drawerLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <span className="w-6 h-6 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
                            </div>
                        ) : selectedOrg ? (
                            <div>
                                {/* Org Header */}
                                <div className="p-6 border-b border-white/5">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-lg">{selectedOrg.organization.name}</p>
                                            <p className="text-zinc-400 text-sm font-mono">{selectedOrg.organization.slug}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-zinc-500">ID:</span> <span className="text-zinc-300 font-mono text-xs">{selectedOrg.organization.id}</span></div>
                                        <div><span className="text-zinc-500">Tier:</span> <span className={`text-xs px-2 py-0.5 rounded ${tierBadge(selectedOrg.organization.tier)}`}>{selectedOrg.organization.tier}</span></div>
                                        <div><span className="text-zinc-500">Artists:</span> <span className="text-zinc-300">{selectedOrg.organization._count.artists}</span></div>
                                        <div><span className="text-zinc-500">Releases:</span> <span className="text-zinc-300">{selectedOrg.organization._count.releases}</span></div>
                                        <div><span className="text-zinc-500">Fans:</span> <span className="text-zinc-300">{selectedOrg.organization._count.fans}</span></div>
                                        <div><span className="text-zinc-500">Status:</span>{" "}
                                            {selectedOrg.organization.isDeleted ? (
                                                <span className="text-red-400">Disabled</span>
                                            ) : (
                                                <span className="text-green-400">Active</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-white/5">
                                    {(["members", "subscription", "notes", "history"] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setDrawerTab(tab)}
                                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all capitalize ${drawerTab === tab ? "text-white border-b-2 border-white" : "text-zinc-500 hover:text-zinc-300"}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-6">
                                    {/* Members Tab */}
                                    {drawerTab === "members" && (
                                        <div className="space-y-3">
                                            {selectedOrg.organization.memberships.map(m => (
                                                <div key={m.id} className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-white/5">
                                                    <div>
                                                        <p className="text-white font-medium text-sm">{m.user.name || "Unnamed"}</p>
                                                        <p className="text-zinc-500 text-xs">{m.user.email}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${m.role === "OWNER" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-zinc-800 text-zinc-400"}`}>
                                                            {m.role}
                                                        </span>
                                                        {m.role !== "OWNER" && (
                                                            <button
                                                                onClick={() => handleTransferOwnership(selectedOrg.organization.id, m.user.id)}
                                                                className="p-1 text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all"
                                                                title="Transfer ownership to this user"
                                                            >
                                                                <ArrowRightLeft className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Subscription Tab */}
                                    {drawerTab === "subscription" && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-[#121214] rounded-xl border border-white/5 space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-zinc-500">Subscription Status</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded ${statusBadge(selectedOrg.organization.subscriptionStatus)}`}>
                                                        {selectedOrg.organization.subscriptionStatus || "None"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-zinc-500">Stripe Customer ID</span>
                                                    <span className="text-zinc-300 font-mono text-xs">{selectedOrg.organization.stripeCustomerId || "—"}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-zinc-500">Stripe Subscription ID</span>
                                                    <span className="text-zinc-300 font-mono text-xs">{selectedOrg.organization.stripeSubscriptionId || "—"}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-zinc-500">Current Period End</span>
                                                    <span className="text-zinc-300 text-xs">
                                                        {selectedOrg.organization.currentPeriodEnd
                                                            ? new Date(selectedOrg.organization.currentPeriodEnd).toLocaleDateString()
                                                            : "—"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notes Tab */}
                                    {drawerTab === "notes" && (
                                        <div>
                                            <div className="flex gap-2 mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Add an internal note..."
                                                    className="flex-1 bg-[#121214] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                                                    value={newNote}
                                                    onChange={(e) => setNewNote(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                                                />
                                                <button
                                                    onClick={handleAddNote}
                                                    disabled={noteLoading || !newNote.trim()}
                                                    className="px-4 py-2 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all disabled:opacity-50"
                                                >
                                                    {noteLoading ? <span className="w-4 h-4 block animate-spin rounded-full border-2 border-zinc-400 border-t-black" /> : <Send className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {selectedOrg.notes.length === 0 ? (
                                                    <p className="text-zinc-500 text-sm">No notes yet.</p>
                                                ) : (
                                                    selectedOrg.notes.map(note => (
                                                        <div key={note.id} className="p-3 bg-[#121214] rounded-xl border border-white/5">
                                                            <p className="text-zinc-200 text-sm mb-2">{note.content}</p>
                                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                                <span>{note.adminEmail || "Admin"}</span>
                                                                <span>•</span>
                                                                <span>{new Date(note.createdAt).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* History Tab */}
                                    {drawerTab === "history" && (
                                        <div className="space-y-3">
                                            {selectedOrg.actionHistory.length === 0 ? (
                                                <p className="text-zinc-500 text-sm">No action history.</p>
                                            ) : (
                                                selectedOrg.actionHistory.map(entry => (
                                                    <div key={entry.id} className="flex items-start gap-3 p-3 bg-[#121214] rounded-xl border border-white/5">
                                                        <History className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-zinc-200 text-sm font-medium">{entry.action.replace(/_/g, " ")}</p>
                                                            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                                                <span>{entry.adminEmail || "System"}</span>
                                                                <span>•</span>
                                                                <span>{new Date(entry.createdAt).toLocaleString()}</span>
                                                            </div>
                                                            {entry.reason && <p className="text-xs text-zinc-400 mt-1 italic">Reason: {entry.reason}</p>}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    )
}
