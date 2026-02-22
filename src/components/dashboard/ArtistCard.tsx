
"use client"

import Link from "next/link"
import { ExternalLink, Edit, Share2, Trash2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { getArtistUrl } from "@/lib/utils/urls"

interface ArtistCardProps {
    artist: {
        id: string
        name: string
        slug: string
        imageUrl: string | null
        bio: string | null
    }
}

export default function ArtistCard({ artist }: ArtistCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault()
        const url = getArtistUrl(artist.slug)
        navigator.clipboard.writeText(url)
        alert("Artist URL copied to clipboard!")
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        if (!confirm(`Are you sure you want to delete ${artist.name}?`)) return

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/artists/${artist.id}`, { method: "DELETE" })
            if (res.ok) {
                router.refresh()
            } else {
                alert("Failed to delete artist")
            }
        } catch (error) {
            alert("Error deleting artist")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="bg-[#121215] border border-white/5 rounded-[2rem] overflow-hidden hover:border-indigo-500/30 transition-all duration-500 group relative shadow-2xl">
            <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                {artist.imageUrl ? (
                    <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800 bg-gradient-to-br from-[#1a1a1e] to-[#0c0c0e]">
                        <span className="text-4xl font-black opacity-20 tracking-tighter">ARTIST</span>
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex items-end p-8" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Profile</span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 leading-none">{artist.name}</h3>
                    <p className="text-zinc-400 text-xs font-medium line-clamp-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {artist.bio || 'Independent Artist • Verified Profile'}
                    </p>
                </div>

                {/* Top Actions (Floating) */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                    <button
                        onClick={handleShare}
                        className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-indigo-600 transition-all"
                        title="Copy Link"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3 bg-black/40">
                <Link
                    href={getArtistUrl(artist.slug)}
                    target="_blank"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black font-black text-[11px] uppercase tracking-wider hover:bg-zinc-200 transition-all active:scale-[0.97]"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Page
                </Link>

                <Link
                    href={`/dashboard/artists/${artist.id}/edit`}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-wider hover:bg-white/10 transition-all active:scale-[0.97]"
                >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Profile
                </Link>
            </div>

            {/* Hover Glow Edge */}
            <div className="absolute inset-0 border border-indigo-500/0 group-hover:border-indigo-500/20 rounded-[2rem] transition-colors pointer-events-none" />
        </div>
    )
}
