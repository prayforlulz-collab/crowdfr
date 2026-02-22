
"use client"

import { useState, useEffect } from "react"
import {
    Trash2, Search, Shield, User as UserIcon, Lock, Unlock, Key,
    ArrowUpCircle, X, LogOut, MessageSquare, History, Send, ChevronRight
} from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
    id: string
    name: string | null
    email: string | null
    role: string
    createdAt: Date
    isSuspended: boolean
    isDeleted?: boolean
    _count: {
        memberships: number
    }
}

interface UserDetail {
    user: {
        id: string
        name: string | null
        email: string | null
        role: string
        createdAt: string
        isSuspended: boolean
        isDeleted: boolean
        memberships: Array<{
            id: string
            role: string
            organization: { id: string; name: string; slug: string; tier: string }
        }>
        sessions: Array<{ id: string; expires: string }>
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

export default function UserList({ initialUsers }: { initialUsers: any[] }) {
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [search, setSearch] = useState("")
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [actionType, setActionType] = useState<string | null>(null)
    const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [drawerLoading, setDrawerLoading] = useState(false)
    const [drawerTab, setDrawerTab] = useState<"profile" | "notes" | "history">("profile")
    const [newNote, setNewNote] = useState("")
    const [noteLoading, setNoteLoading] = useState(false)
    const router = useRouter()

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase())
    )

    const openUserDrawer = async (userId: string) => {
        setDrawerOpen(true)
        setDrawerLoading(true)
        setDrawerTab("profile")
        try {
            const res = await fetch(`/api/admin/users/${userId}`)
            if (res.ok) {
                const data = await res.json()
                setSelectedUser(data)
            }
        } catch (error) {
            console.error("Failed to load user details")
        } finally {
            setDrawerLoading(false)
        }
    }

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`Soft-delete ${email}? The user will be marked as deleted but data is preserved.`)) return

        setLoadingId(id)
        setActionType("delete")
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
            if (!res.ok) {
                const data = await res.json()
                alert(data.error || "Failed to delete user")
                return
            }
            setUsers(users.filter(u => u.id !== id))
            if (selectedUser?.user.id === id) setDrawerOpen(false)
            router.refresh()
        } catch (error) {
            alert("An error occurred")
        } finally {
            setLoadingId(null)
            setActionType(null)
        }
    }

    const handleSuspend = async (user: User) => {
        const action = user.isSuspended ? "activate" : "suspend"
        if (!confirm(`Are you sure you want to ${action} ${user.email}?`)) return

        setLoadingId(user.id)
        setActionType("suspend")
        try {
            const res = await fetch(`/api/admin/users/${user.id}/suspend`, { method: "POST" })
            const data = await res.json()
            if (res.ok) {
                setUsers(users.map(u => u.id === user.id ? { ...u, isSuspended: data.isSuspended } : u))
                router.refresh()
            } else {
                alert(data.message || "Failed to update status")
            }
        } catch (error) {
            alert("Error updating status")
        } finally {
            setLoadingId(null)
            setActionType(null)
        }
    }

    const handleResetPassword = async (id: string, email: string) => {
        if (!confirm(`Generate a new password for ${email}?`)) return

        setLoadingId(id)
        setActionType("password")
        try {
            const res = await fetch(`/api/admin/users/${id}/password`, { method: "POST" })
            const data = await res.json()
            if (res.ok) {
                prompt(`Password reset for ${email}. Copy:`, data.newPassword)
            } else {
                alert(data.message || "Failed to reset password")
            }
        } catch (error) {
            alert("Error resetting password")
        } finally {
            setLoadingId(null)
            setActionType(null)
        }
    }

    const handleUpgrade = async (id: string, email: string) => {
        if (!confirm(`Upgrade ${email}'s organization to PRO?`)) return

        setLoadingId(id)
        setActionType("upgrade")
        try {
            const res = await fetch(`/api/admin/users/${id}/upgrade`, { method: "POST" })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
            } else {
                alert(data.message || "Failed to upgrade")
            }
        } catch (error) {
            alert("Error upgrading user")
        } finally {
            setLoadingId(null)
            setActionType(null)
        }
    }

    const handleForceLogout = async (id: string, email: string) => {
        if (!confirm(`Force logout ${email}? All active sessions will be revoked.`)) return

        setLoadingId(id)
        setActionType("logout")
        try {
            const res = await fetch(`/api/admin/users/${id}/sessions`, { method: "DELETE" })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
            } else {
                alert(data.error || "Failed to revoke sessions")
            }
        } catch (error) {
            alert("Error revoking sessions")
        } finally {
            setLoadingId(null)
            setActionType(null)
        }
    }

    const handleAddNote = async () => {
        if (!selectedUser || !newNote.trim()) return
        setNoteLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.user.id}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newNote.trim() }),
            })
            if (res.ok) {
                const data = await res.json()
                setSelectedUser({
                    ...selectedUser,
                    notes: [data.note, ...selectedUser.notes],
                })
                setNewNote("")
            }
        } catch (error) {
            alert("Error adding note")
        } finally {
            setNoteLoading(false)
        }
    }

    const ActionButton = ({ onClick, disabled, loading, icon: Icon, title, hoverColor = "hover:text-white hover:bg-white/10" }: any) => (
        <button onClick={onClick} disabled={disabled} className={`p-2 text-zinc-400 ${hoverColor} rounded-lg transition-all disabled:opacity-50`} title={title}>
            {loading ? <span className="w-4 h-4 block animate-spin rounded-full border-2 border-zinc-500 border-t-white" /> : <Icon className="w-4 h-4" />}
        </button>
    )

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        className="w-full bg-[#121214] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-white/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="text-zinc-500 text-sm">
                    Showing {filteredUsers.length} users
                </div>
            </div>

            <div className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 text-zinc-400 text-sm font-medium">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Orgs</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map(user => (
                            <tr
                                key={user.id}
                                className="hover:bg-white/5 transition-colors cursor-pointer"
                                onClick={() => openUserDrawer(user.id)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                            {user.name ? (
                                                <div className="font-bold text-xs">{user.name.substring(0, 2).toUpperCase()}</div>
                                            ) : (
                                                <UserIcon className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium flex items-center gap-2">
                                                {user.name || "Unnamed"}
                                                <ChevronRight className="w-3 h-3 text-zinc-600" />
                                            </div>
                                            <div className="text-zinc-500 text-xs">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {user.role === "ADMIN" ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
                                            <Shield className="w-3 h-3" /> ADMIN
                                        </span>
                                    ) : (
                                        <span className="text-zinc-400 text-sm">User</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {user.isSuspended ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">Suspended</span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">Active</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-zinc-300">{user._count.memberships}</td>
                                <td className="px-6 py-4 text-zinc-500 text-sm">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-end gap-1">
                                        <ActionButton onClick={() => handleSuspend(user)} disabled={loadingId === user.id} loading={loadingId === user.id && actionType === "suspend"} icon={user.isSuspended ? Unlock : Lock} title={user.isSuspended ? "Activate User" : "Suspend User"} />
                                        <ActionButton onClick={() => handleResetPassword(user.id, user.email || "")} disabled={loadingId === user.id} loading={loadingId === user.id && actionType === "password"} icon={Key} title="Reset Password" />
                                        <ActionButton onClick={() => handleForceLogout(user.id, user.email || "")} disabled={loadingId === user.id} loading={loadingId === user.id && actionType === "logout"} icon={LogOut} title="Force Logout" />
                                        <ActionButton onClick={() => handleUpgrade(user.id, user.email || "")} disabled={loadingId === user.id} loading={loadingId === user.id && actionType === "upgrade"} icon={ArrowUpCircle} title="Upgrade to PRO" hoverColor="hover:text-purple-500 hover:bg-purple-500/10" />
                                        <ActionButton onClick={() => handleDelete(user.id, user.email || "")} disabled={loadingId === user.id || user.role === "ADMIN"} loading={loadingId === user.id && actionType === "delete"} icon={Trash2} title="Soft Delete" hoverColor="hover:text-red-500 hover:bg-red-500/10" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Detail Drawer */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
                    <div className="relative w-[520px] h-full bg-[#0e0e10] border-l border-white/10 overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0e0e10] z-10">
                            <h2 className="text-lg font-bold text-white">User Details</h2>
                            <button onClick={() => setDrawerOpen(false)} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {drawerLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <span className="w-6 h-6 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
                            </div>
                        ) : selectedUser ? (
                            <div>
                                {/* User Profile Header */}
                                <div className="p-6 border-b border-white/5">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-lg font-bold">
                                            {selectedUser.user.name?.substring(0, 2).toUpperCase() || <UserIcon className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-lg">{selectedUser.user.name || "Unnamed"}</p>
                                            <p className="text-zinc-400 text-sm">{selectedUser.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-zinc-500">ID:</span> <span className="text-zinc-300 font-mono text-xs">{selectedUser.user.id}</span></div>
                                        <div><span className="text-zinc-500">Role:</span> <span className="text-zinc-300">{selectedUser.user.role}</span></div>
                                        <div><span className="text-zinc-500">Status:</span>{" "}
                                            {selectedUser.user.isSuspended ? (
                                                <span className="text-red-400">Suspended</span>
                                            ) : (
                                                <span className="text-green-400">Active</span>
                                            )}
                                        </div>
                                        <div><span className="text-zinc-500">Joined:</span> <span className="text-zinc-300">{new Date(selectedUser.user.createdAt).toLocaleDateString()}</span></div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-white/5">
                                    {(["profile", "notes", "history"] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setDrawerTab(tab)}
                                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${drawerTab === tab ? "text-white border-b-2 border-white" : "text-zinc-500 hover:text-zinc-300"}`}
                                        >
                                            {tab === "profile" ? "Memberships" : tab === "notes" ? "Notes" : "History"}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-6">
                                    {/* Memberships Tab */}
                                    {drawerTab === "profile" && (
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Organization Memberships</h3>
                                            {selectedUser.user.memberships.length === 0 ? (
                                                <p className="text-zinc-500 text-sm">No organization memberships.</p>
                                            ) : (
                                                selectedUser.user.memberships.map(m => (
                                                    <div key={m.id} className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-white/5">
                                                        <div>
                                                            <p className="text-white font-medium text-sm">{m.organization.name}</p>
                                                            <p className="text-zinc-500 text-xs">{m.organization.slug}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs px-2 py-0.5 rounded ${m.organization.tier !== "FREE" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-zinc-800 text-zinc-400"}`}>
                                                                {m.organization.tier}
                                                            </span>
                                                            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{m.role}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}

                                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mt-6 mb-3">Sessions ({selectedUser.user.sessions.length})</h3>
                                            {selectedUser.user.sessions.length === 0 ? (
                                                <p className="text-zinc-500 text-sm">No active sessions.</p>
                                            ) : (
                                                selectedUser.user.sessions.map(s => (
                                                    <div key={s.id} className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-white/5">
                                                        <span className="text-xs font-mono text-zinc-400">{s.id.substring(0, 12)}...</span>
                                                        <span className="text-xs text-zinc-500">Expires: {new Date(s.expires).toLocaleString()}</span>
                                                    </div>
                                                ))
                                            )}
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
                                                {selectedUser.notes.length === 0 ? (
                                                    <p className="text-zinc-500 text-sm">No notes yet.</p>
                                                ) : (
                                                    selectedUser.notes.map(note => (
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
                                            {selectedUser.actionHistory.length === 0 ? (
                                                <p className="text-zinc-500 text-sm">No action history.</p>
                                            ) : (
                                                selectedUser.actionHistory.map(entry => (
                                                    <div key={entry.id} className="flex items-start gap-3 p-3 bg-[#121214] rounded-xl border border-white/5">
                                                        <History className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-zinc-200 text-sm font-medium">{entry.action.replace(/_/g, " ")}</p>
                                                            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                                                <span>{entry.adminEmail || "System"}</span>
                                                                <span>•</span>
                                                                <span>{new Date(entry.createdAt).toLocaleString()}</span>
                                                            </div>
                                                            {entry.reason && (
                                                                <p className="text-xs text-zinc-400 mt-1 italic">Reason: {entry.reason}</p>
                                                            )}
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
