
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-purple-500/50 transition-all group relative">
            <div className="aspect-square bg-zinc-800 relative group-hover:opacity-90 transition-opacity">
                {artist.imageUrl ? (
                    <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <span className="text-4xl font-black">ARTIST</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">{artist.name}</h3>
                        <p className="text-zinc-400 text-sm font-medium line-clamp-2">{artist.bio || 'Artist Profile'}</p>
                    </div>
                </div>
            </div>

            <div className="p-4 grid grid-cols-4 gap-2">
                <Link
                    href={getArtistUrl(artist.slug)}
                    target="_blank"
                    className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                    title="View Page"
                >
                    <ExternalLink className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase">View</span>
                </Link>

                <Link
                    href={`/dashboard/artists/${artist.id}/edit`}
                    className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                    title="Edit Page"
                >
                    <Edit className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Edit</span>
                </Link>

                <button
                    onClick={handleShare}
                    className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                    title="Share Link"
                >
                    <Share2 className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Share</span>
                </button>

                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Remove"
                >
                    <Trash2 className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Remove</span>
                </button>
            </div>
        </div>
    )
}
