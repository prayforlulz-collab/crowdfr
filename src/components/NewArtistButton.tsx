"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewArtistButton() {
    const [showModal, setShowModal] = useState(false)
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("/api/artists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    bio,
                    imageUrl
                }),
            })

            if (res.ok) {
                setSuccess(true)
                setTimeout(() => {
                    setShowModal(false)
                    resetForm()
                    router.refresh()
                }, 1200)
            } else {
                const data = await res.json()
                setError(data.message || "Failed to create artist")
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setName("")
        setBio("")
        setImageUrl("")
        setSuccess(false)
        setError("")
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="bg-white/10 text-white border border-white/20 px-6 py-2.5 rounded-full font-bold hover:bg-white/20 transition-all active:scale-95"
            >
                + New Artist
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => !isLoading && setShowModal(false)}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-md mx-4 bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden">
                        {/* Success state */}
                        {success ? (
                            <div className="p-12 text-center">
                                <div className="text-5xl mb-4">✨</div>
                                <h3 className="text-xl font-bold text-white mb-2">Artist Created!</h3>
                                <p className="text-zinc-400 text-sm">Dashboard updating...</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="p-6 border-b border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-black text-white">New Artist</h2>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="text-zinc-500 hover:text-white transition-colors text-2xl leading-none p-1"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    <div>
                                        <label className="block text-zinc-300 text-xs font-semibold mb-2 uppercase tracking-wider">
                                            Artist Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all"
                                            placeholder="e.g. The Beatles"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zinc-300 text-xs font-semibold mb-2 uppercase tracking-wider">
                                            Bio (Optional)
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all resize-none"
                                            placeholder="Short description..."
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zinc-300 text-xs font-semibold mb-2 uppercase tracking-wider">
                                            Image URL (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all"
                                            placeholder="https://..."
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                            <p className="text-red-400 text-sm">{error}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            disabled={isLoading}
                                            className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading || !name.trim()}
                                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Creating...
                                                </span>
                                            ) : (
                                                "Create Artist"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
