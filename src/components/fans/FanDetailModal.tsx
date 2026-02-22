"use client"

import { useState } from "react"

interface Fan {
    id: string
    email: string
    name?: string
    country?: string
    createdAt: Date
    subscriptions: Array<{
        id: string
        status: string
        createdAt: Date
        release: {
            title: string
            slug: string
        }
    }>
    tags: Array<{
        id: string
        name: string
    }>
}

interface FanDetailModalProps {
    fan: Fan | null
    organizationId: string
    onClose: () => void
    onUpdate: (updatedFan: Fan) => void
}

export default function FanDetailModal({ fan, organizationId, onClose, onUpdate }: FanDetailModalProps) {
    const [newTagName, setNewTagName] = useState("")
    const [isAddingTag, setIsAddingTag] = useState(false)
    const [removingTagId, setRemovingTagId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    if (!fan) return null

    const handleAddTag = async () => {
        if (!newTagName.trim()) return

        setIsAddingTag(true)
        setError(null)

        try {
            const response = await fetch(`/api/fans/${fan.id}/tags`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tagName: newTagName.trim(), organizationId })
            })

            if (!response.ok) {
                throw new Error("Failed to add tag")
            }

            const updatedFan = await response.json()
            onUpdate(updatedFan)
            setNewTagName("")
        } catch (err) {
            setError("Failed to add tag. Please try again.")
            console.error(err)
        } finally {
            setIsAddingTag(false)
        }
    }

    const handleRemoveTag = async (tagId: string) => {
        setRemovingTagId(tagId)
        setError(null)

        try {
            const response = await fetch(`/api/fans/${fan.id}/tags`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tagId })
            })

            if (!response.ok) {
                throw new Error("Failed to remove tag")
            }

            const updatedFan = await response.json()
            onUpdate(updatedFan)
        } catch (err) {
            setError("Failed to remove tag. Please try again.")
            console.error(err)
        } finally {
            setRemovingTagId(null)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleAddTag()
        } else if (e.key === "Escape") {
            onClose()
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black">{fan.name || "Anonymous Fan"}</h2>
                            <p className="text-zinc-500 text-sm mt-1">{fan.email}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-8">
                        {/* Fan Info */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Fan Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-800">
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Country</p>
                                    <p className="text-sm font-bold mt-1">{fan.country || "Unknown"}</p>
                                </div>
                                <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-800">
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Joined</p>
                                    <p className="text-sm font-bold mt-1">{new Date(fan.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Subscription History */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Subscription History</h3>
                            <div className="space-y-2">
                                {fan.subscriptions.length === 0 ? (
                                    <p className="text-zinc-600 text-sm">No subscriptions yet.</p>
                                ) : (
                                    fan.subscriptions.map((sub) => (
                                        <div key={sub.id} className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-800 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-sm">{sub.release.title}</p>
                                                <p className="text-xs text-zinc-500 mt-1">
                                                    Subscribed {new Date(sub.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span
                                                className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${sub.status === 'ACTIVE'
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                                    }`}
                                            >
                                                {sub.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Tags Management */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Tags</h3>

                            {/* Current Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {fan.tags.length === 0 ? (
                                    <p className="text-zinc-600 text-sm">No tags assigned.</p>
                                ) : (
                                    fan.tags.map((tag) => (
                                        <div
                                            key={tag.id}
                                            className="bg-zinc-800 px-3 py-1.5 rounded-lg text-sm font-bold text-zinc-300 flex items-center gap-2 border border-zinc-700"
                                        >
                                            <span>#{tag.name}</span>
                                            <button
                                                onClick={() => handleRemoveTag(tag.id)}
                                                disabled={removingTagId === tag.id}
                                                className="text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                            >
                                                {removingTagId === tag.id ? (
                                                    <span className="text-xs">...</span>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add Tag Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add a tag..."
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isAddingTag}
                                    className="flex-1 bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                                />
                                <button
                                    onClick={handleAddTag}
                                    disabled={isAddingTag || !newTagName.trim()}
                                    className="bg-purple-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAddingTag ? "Adding..." : "Add Tag"}
                                </button>
                            </div>

                            {error && (
                                <p className="text-red-400 text-xs mt-2">{error}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
