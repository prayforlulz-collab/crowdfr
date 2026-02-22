"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import ConfirmationDialog from "./ConfirmationDialog"

interface OrgData {
    id: string
    name: string
    slug: string
    logoUrl: string
    tier: string
    subscriptionStatus: string | null
}

interface MemberData {
    id: string
    userId: string
    role: string
    name: string | null
    email: string | null
}

export default function OrgSettings() {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState({ type: "", text: "" })
    const [orgData, setOrgData] = useState<OrgData | null>(null)
    const [formData, setFormData] = useState({ name: "", slug: "", logoUrl: "" })
    const [originalSlug, setOriginalSlug] = useState("")

    // Slug change confirmation
    const [showSlugDialog, setShowSlugDialog] = useState(false)
    const [pendingSubmit, setPendingSubmit] = useState(false)

    // Transfer ownership
    const [members, setMembers] = useState<MemberData[]>([])
    const [showTransferDialog, setShowTransferDialog] = useState(false)
    const [transferTarget, setTransferTarget] = useState<MemberData | null>(null)
    const [isTransferring, setIsTransferring] = useState(false)

    // Org deletion
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Current user's role
    const [currentRole, setCurrentRole] = useState("")

    useEffect(() => {
        fetchOrg()
        fetchMembers()
    }, [])

    const fetchOrg = async () => {
        try {
            const res = await fetch("/api/organization")
            const data = await res.json()
            if (!data.error) {
                setOrgData(data)
                setFormData({ name: data.name || "", slug: data.slug || "", logoUrl: data.logoUrl || "" })
                setOriginalSlug(data.slug || "")
            }
        } catch (e) {
            console.error("Failed to fetch org", e)
        }
    }

    const fetchMembers = async () => {
        try {
            const res = await fetch("/api/organization/members")
            const data = await res.json()
            if (!data.error) {
                setMembers(data)
                const me = data.find((m: MemberData) => m.email === session?.user?.email)
                if (me) setCurrentRole(me.role)
            }
        } catch (e) {
            console.error("Failed to fetch members", e)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // If slug changed, show confirmation first
        if (formData.slug !== originalSlug && !pendingSubmit) {
            setShowSlugDialog(true)
            return
        }

        setIsLoading(true)
        setMessage({ type: "", text: "" })
        setPendingSubmit(false)

        try {
            const res = await fetch("/api/organization", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to update organization")
            }

            setOriginalSlug(formData.slug)
            setMessage({ type: "success", text: "Organization updated successfully!" })
        } catch (error: any) {
            setMessage({ type: "error", text: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSlugConfirm = () => {
        setShowSlugDialog(false)
        setPendingSubmit(true)
    }

    // After slug dialog confirms, trigger submit
    useEffect(() => {
        if (pendingSubmit) {
            const fakeEvent = { preventDefault: () => { } } as React.FormEvent
            handleSubmit(fakeEvent)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingSubmit])

    const handleTransfer = async () => {
        if (!transferTarget) return
        setIsTransferring(true)
        try {
            const res = await fetch("/api/organization/transfer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newOwnerUserId: transferTarget.userId }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to transfer ownership")
            }

            setShowTransferDialog(false)
            setTransferTarget(null)
            setCurrentRole("ADMIN")
            fetchMembers()
            setMessage({ type: "success", text: `Ownership transferred to ${transferTarget.name || transferTarget.email}` })
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsTransferring(false)
        }
    }

    const handleDeleteOrg = async () => {
        if (!orgData) return
        setIsDeleting(true)
        try {
            const res = await fetch("/api/organization/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirmation: orgData.name }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to delete organization")
            }

            window.location.href = "/dashboard"
        } catch (error: any) {
            alert(error.message)
            setIsDeleting(false)
        }
    }

    const isOwner = currentRole === "OWNER"
    const isAdmin = currentRole === "ADMIN" || isOwner
    const owner = members.find(m => m.role === "OWNER")
    const transferableMembers = members.filter(m => m.role !== "OWNER")

    return (
        <div className="space-y-8">
            {/* Organization Details */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                <h2 className="text-xl font-bold mb-1">Organization Details</h2>
                <p className="text-zinc-500 text-sm mb-6">Manage your organization&apos;s public information.</p>

                {owner && (
                    <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
                            👑
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Owner</p>
                            <p className="text-sm font-bold text-white">{owner.name || owner.email}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                            Organization Name
                        </label>
                        <input
                            type="text"
                            required
                            disabled={!isAdmin}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                            Slug (URL Identifier)
                        </label>
                        <input
                            type="text"
                            required
                            disabled={!isAdmin}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        />
                        {formData.slug !== originalSlug && (
                            <p className="text-amber-400 text-xs mt-2 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                                </svg>
                                Changing your slug will break existing shared links
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                            Logo URL
                        </label>
                        <input
                            type="url"
                            disabled={!isAdmin}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            value={formData.logoUrl}
                            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                            placeholder="https://example.com/logo.png"
                        />
                    </div>

                    {message.text && (
                        <p className={`text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
                            {message.text}
                        </p>
                    )}

                    {isAdmin && (
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Transfer Ownership — Owner only */}
            {isOwner && transferableMembers.length > 0 && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                    <h2 className="text-xl font-bold mb-1">Transfer Ownership</h2>
                    <p className="text-zinc-500 text-sm mb-6">
                        Transfer ownership to another team member. You&apos;ll be demoted to Admin.
                    </p>

                    <div className="space-y-3">
                        {transferableMembers.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                        {(member.name?.[0] || member.email?.[0] || "?").toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{member.name || "Unknown"}</p>
                                        <p className="text-xs text-zinc-500">{member.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setTransferTarget(member)
                                        setShowTransferDialog(true)
                                    }}
                                    className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/10"
                                >
                                    Transfer
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Danger Zone — Owner only */}
            {isOwner && (
                <div className="border border-red-500/20 bg-red-500/5 rounded-3xl p-8">
                    <h2 className="text-xl font-bold text-red-400 mb-1">Danger Zone</h2>
                    <p className="text-zinc-500 text-sm mb-6">
                        Permanently delete this organization and all its artists, releases, fans, and data.
                    </p>
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-bold px-6 py-3 rounded-xl transition-all border border-red-500/30 hover:border-red-500"
                    >
                        Delete Organization
                    </button>
                </div>
            )}

            {/* Slug Change Confirmation */}
            <ConfirmationDialog
                isOpen={showSlugDialog}
                onClose={() => setShowSlugDialog(false)}
                onConfirm={handleSlugConfirm}
                title="Change URL Slug?"
                description={`Changing the slug from "${originalSlug}" to "${formData.slug}" will break all existing shared links. Old URLs will no longer work.`}
                confirmLabel="Yes, Change Slug"
                variant="warning"
            />

            {/* Transfer Ownership Confirmation */}
            <ConfirmationDialog
                isOpen={showTransferDialog}
                onClose={() => { setShowTransferDialog(false); setTransferTarget(null) }}
                onConfirm={handleTransfer}
                title="Transfer Ownership"
                description={`This will make ${transferTarget?.name || transferTarget?.email} the new owner. You will be demoted to Admin. This cannot be undone without the new owner's consent.`}
                confirmLabel="Transfer Ownership"
                confirmText={transferTarget?.email || ""}
                variant="warning"
                isLoading={isTransferring}
            />

            {/* Delete Org Confirmation */}
            <ConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDeleteOrg}
                title="Delete Organization"
                description="This will permanently delete the organization, all artists, releases, fan data, and analytics. This action cannot be undone."
                confirmLabel="Delete Organization"
                confirmText={orgData?.name || ""}
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    )
}
