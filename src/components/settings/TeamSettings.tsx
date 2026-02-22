"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import ConfirmationDialog from "./ConfirmationDialog"

interface MemberData {
    id: string
    userId: string
    role: string
    name: string | null
    email: string | null
    image: string | null
}

const ROLE_COLORS: Record<string, string> = {
    OWNER: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    ADMIN: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    EDITOR: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    VIEWER: "bg-zinc-800 text-zinc-400 border-zinc-700",
}

const ROLE_HIERARCHY = ["VIEWER", "EDITOR", "ADMIN"]

export default function TeamSettings() {
    const { data: session } = useSession()
    const [members, setMembers] = useState<MemberData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviteRole, setInviteRole] = useState("VIEWER")
    const [message, setMessage] = useState({ type: "", text: "" })

    // Role change
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null)

    // Remove confirmation
    const [removeTarget, setRemoveTarget] = useState<MemberData | null>(null)
    const [showRemoveDialog, setShowRemoveDialog] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)

    // Current user info
    const [currentRole, setCurrentRole] = useState("")
    const [currentUserId, setCurrentUserId] = useState("")

    const fetchMembers = async () => {
        try {
            const res = await fetch("/api/organization/members")
            const data = await res.json()
            if (!data.error) {
                setMembers(data)
                const me = data.find((m: MemberData) => m.email === session?.user?.email)
                if (me) {
                    setCurrentRole(me.role)
                    setCurrentUserId(me.userId)
                }
            }
        } catch (error) {
            console.error("Failed to fetch members", error)
        }
    }

    useEffect(() => {
        fetchMembers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage({ type: "", text: "" })

        try {
            const res = await fetch("/api/organization/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to invite member")
            }

            setInviteEmail("")
            setInviteRole("VIEWER")
            setMessage({ type: "success", text: `${data.name || data.email} added as ${data.role}!` })
            fetchMembers()
        } catch (error: any) {
            setMessage({ type: "error", text: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    const handleRoleChange = async (membershipId: string, newRole: string) => {
        try {
            const res = await fetch("/api/organization/members", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ membershipId, newRole }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to change role")
            }

            setEditingMemberId(null)
            fetchMembers()
        } catch (error: any) {
            alert(error.message)
        }
    }

    const handleRemove = async () => {
        if (!removeTarget) return
        setIsRemoving(true)

        try {
            const res = await fetch(`/api/organization/members?id=${removeTarget.id}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to remove member")
            }

            setShowRemoveDialog(false)
            setRemoveTarget(null)
            fetchMembers()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsRemoving(false)
        }
    }

    const isOwner = currentRole === "OWNER"
    const isAdmin = currentRole === "ADMIN" || isOwner
    const canManageRoles = isAdmin

    // Available roles the current user can assign
    const assignableRoles = isOwner
        ? ROLE_HIERARCHY
        : ROLE_HIERARCHY.filter(r => r !== "ADMIN")

    return (
        <div className="space-y-8">
            {/* Invite Member */}
            {isAdmin && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                    <h2 className="text-xl font-bold mb-1">Invite Member</h2>
                    <p className="text-zinc-500 text-sm mb-6">Add team members by their registered email address.</p>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                required
                                placeholder="colleague@example.com"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer"
                            >
                                {assignableRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                                {isLoading ? "Adding..." : "Add Member"}
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                            <span><span className="text-zinc-400">Viewer</span> — Read-only access</span>
                            <span><span className="text-blue-400">Editor</span> — Create & edit content</span>
                            <span><span className="text-purple-400">Admin</span> — Full management access</span>
                        </div>
                    </form>
                    {message.text && (
                        <p className={`text-sm mt-4 ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
                            {message.text}
                        </p>
                    )}
                </div>
            )}

            {/* Team Members List */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Team Members</h2>
                        <p className="text-zinc-500 text-sm">{members.length} {members.length === 1 ? 'member' : 'members'}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {members.map((member) => {
                        const isSelf = member.userId === currentUserId
                        const isThisOwner = member.role === "OWNER"
                        const canEditRole = canManageRoles && !isThisOwner && !isSelf
                        const canRemove = canManageRoles && !isThisOwner && !isSelf && (isOwner || member.role !== "ADMIN")
                        const isEditing = editingMemberId === member.id

                        return (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                                        {(member.name?.[0] || member.email?.[0] || "?").toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm flex items-center gap-2">
                                            {member.name || "Unknown"}
                                            {isSelf && <span className="text-[10px] font-black tracking-widest text-zinc-600">(YOU)</span>}
                                        </p>
                                        <p className="text-xs text-zinc-500">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <select
                                                defaultValue={member.role}
                                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                                            >
                                                {assignableRoles.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => setEditingMemberId(null)}
                                                className="text-xs text-zinc-500 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => canEditRole && setEditingMemberId(member.id)}
                                                disabled={!canEditRole}
                                                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${ROLE_COLORS[member.role] || ROLE_COLORS.VIEWER} ${canEditRole ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                                            >
                                                {member.role}
                                            </button>
                                            {canRemove && (
                                                <button
                                                    onClick={() => {
                                                        setRemoveTarget(member)
                                                        setShowRemoveDialog(true)
                                                    }}
                                                    className="text-red-400/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    {members.length === 0 && (
                        <p className="text-zinc-500 text-center py-8">No members found.</p>
                    )}
                </div>
            </div>

            {/* Remove Member Confirmation */}
            <ConfirmationDialog
                isOpen={showRemoveDialog}
                onClose={() => { setShowRemoveDialog(false); setRemoveTarget(null) }}
                onConfirm={handleRemove}
                title="Remove Team Member"
                description={`This will remove ${removeTarget?.name || removeTarget?.email} from the organization. They will lose access to all content and data.`}
                confirmLabel="Remove Member"
                variant="danger"
                isLoading={isRemoving}
            />
        </div>
    )
}
