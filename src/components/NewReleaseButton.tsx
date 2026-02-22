"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NewReleaseButton({ artistCount }: { artistCount?: number }) {
    const [showModal, setShowModal] = useState(false)
    const [title, setTitle] = useState("")
    const [selectedArtistName, setSelectedArtistName] = useState("")
    const [artists, setArtists] = useState<any[]>([])
    const [fetchingArtists, setFetchingArtists] = useState(false)
    const [appleMusicUrl, setAppleMusicUrl] = useState("")
    const [mode, setMode] = useState<'manual' | 'import'>('manual')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const hasArtists = artistCount !== undefined ? artistCount > 0 : true;

    useEffect(() => {
        if (showModal) {
            fetchArtists()
        }
    }, [showModal])

    const fetchArtists = async () => {
        setFetchingArtists(true)
        try {
            const res = await fetch("/api/artists")
            if (res.ok) {
                const data = await res.json()
                setArtists(data)
                // Pre-select first artist if available
                if (data.length > 0) {
                    setSelectedArtistName(data[0].name)
                }
            }
        } catch (e) {
            console.error("Failed to fetch artists", e)
        } finally {
            setFetchingArtists(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            let finalTitle = title
            let finalArtist = selectedArtistName
            let initialLayout = null

            if (mode === 'import') {
                const importRes = await fetch("/api/import/apple-music", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: appleMusicUrl }),
                })

                if (!importRes.ok) {
                    const errorData = await importRes.json()
                    throw new Error(errorData.error || "Failed to import from Apple Music")
                }

                const imported = await importRes.json()
                finalTitle = imported.title

                // For import, we still need to respect the selected artist from our system
                // But we might want to warn if it doesn't match?
                // For simplicity now, we enforce the selected artist from the dropdown

                // Construct initial layout with imported tracks
                initialLayout = [
                    {
                        id: 'hero-1',
                        type: 'hero',
                        data: {
                            title: imported.title,
                            subtitle: finalArtist, // Use selected artist
                            coverImage: imported.coverImage,
                            variant: 'centered',
                            releaseDate: imported.releaseDate || ''
                        }
                    },
                    {
                        id: 'links-1',
                        type: 'links',
                        data: {
                            spotify: '',
                            appleMusic: appleMusicUrl,
                            soundCloud: '',
                            youtube: '',
                            otherLinks: []
                        }
                    },
                    {
                        id: 'tracklist-1',
                        type: 'tracklist',
                        data: {
                            tracks: imported.tracks.map((t: any) => ({
                                title: t.title,
                                duration: t.duration,
                                appleMusicTrackId: t.appleMusicTrackId
                            }))
                        }
                    }
                ]
            }

            const res = await fetch("/api/releases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: finalTitle,
                    artistName: finalArtist,
                    layout: initialLayout,
                    coverImage: (mode === 'import' && initialLayout) ? (initialLayout as any)[0].data.coverImage : undefined
                }),
            })

            if (res.ok) {
                const data = await res.json()
                setSuccess(true)
                setTimeout(() => {
                    setShowModal(false)
                    resetForm()
                    const targetId = data.id || (data.release && data.release.id);
                    router.push(`/dashboard/releases/${targetId}/edit`)
                }, 1200)
            } else {
                const data = await res.json()
                setError(data.message || "Failed to create release")
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setTitle("")
        // Don't reset artist name to empty, keep selection if possible
        setAppleMusicUrl("")
        setSuccess(false)
        setError("")
        setMode('manual')
    }

    return (
        <>
            <div className="relative group">
                <button
                    onClick={() => hasArtists && setShowModal(true)}
                    disabled={!hasArtists}
                    className={`px-6 py-2.5 rounded-full font-bold transition-all shadow-lg ${hasArtists
                        ? 'bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-white/10'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'}`}
                >
                    + New Release
                </button>
                {!hasArtists && (
                    <div className="absolute top-full mt-2 right-0 w-48 bg-black border border-zinc-800 p-2 rounded-lg text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                        Create an artist profile first
                    </div>
                )}
            </div>

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
                                <h3 className="text-xl font-bold text-white mb-2">Release Created!</h3>
                                <p className="text-zinc-400 text-sm">Redirecting to editor...</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="p-6 pb-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-black text-white">New Release</h2>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="text-zinc-500 hover:text-white transition-colors text-2xl leading-none p-1"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex p-1 bg-white/5 rounded-xl mb-6">
                                        <button
                                            onClick={() => setMode('manual')}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'manual' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                                        >
                                            Manual Entry
                                        </button>
                                        <button
                                            onClick={() => setMode('import')}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'import' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                                        >
                                            Apple Music Import
                                        </button>
                                    </div>
                                </div>

                                {fetchingArtists ? (
                                    <div className="p-12 text-center">
                                        <span className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin inline-block" />
                                        <p className="mt-2 text-zinc-500 text-xs">Loading artists...</p>
                                    </div>
                                ) : artists.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <p className="text-zinc-300 font-bold mb-2">No Artists Found</p>
                                        <p className="text-zinc-500 text-xs mb-6">You need to create an artist profile before you can create a release.</p>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="bg-white/10 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-white/20"
                                        >
                                            Close
                                        </button>
                                    </div>
                                ) : (
                                    /* Form */
                                    <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-5">
                                        <div>
                                            <label className="block text-zinc-300 text-xs font-semibold mb-2 uppercase tracking-wider">
                                                Select Artist
                                            </label>
                                            <select
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all [&>option]:bg-zinc-900"
                                                value={selectedArtistName}
                                                onChange={(e) => setSelectedArtistName(e.target.value)}
                                            >
                                                {artists.map(artist => (
                                                    <option key={artist.id} value={artist.name}>
                                                        {artist.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {mode === 'manual' ? (
                                            <div>
                                                <label className="block text-zinc-300 text-xs font-semibold mb-2 uppercase tracking-wider">
                                                    Release Title
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all"
                                                    placeholder="e.g. Midnight Dreams EP"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-zinc-300 text-xs font-semibold mb-2 uppercase tracking-wider">
                                                    Album/Single URL
                                                </label>
                                                <input
                                                    type="url"
                                                    required
                                                    autoFocus
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all"
                                                    placeholder="https://music.apple.com/us/album/..."
                                                    value={appleMusicUrl}
                                                    onChange={(e) => setAppleMusicUrl(e.target.value)}
                                                />
                                                <p className="mt-2 text-[10px] text-zinc-500">We'll automatically fetch the tracklist, artwork, and meta.</p>
                                            </div>
                                        )}

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
                                                disabled={isLoading || (mode === 'manual' ? !title.trim() : !appleMusicUrl.trim())}
                                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        {mode === 'import' ? 'Importing...' : 'Creating...'}
                                                    </span>
                                                ) : (
                                                    mode === 'import' ? "Import & Create" : "Create Release"
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
