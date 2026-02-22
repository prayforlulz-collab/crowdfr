import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import NewReleaseButton from "@/components/NewReleaseButton"
import NewArtistButton from "@/components/NewArtistButton"
import ArtistCard from "@/components/dashboard/ArtistCard"
import ReleaseCard from "@/components/dashboard/ReleaseCard"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        return (
            <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl text-center max-w-sm">
                    <h2 className="text-2xl font-bold text-white mb-4">Unauthorized Access</h2>
                    <p className="text-zinc-400 mb-8">Please log in to your account to view your dashboard.</p>
                    <Link
                        href="/login"
                        className="inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    // Get user's membership to determine role and organization
    const membership = await prisma.membership.findFirst({
        where: { userId: session.user.id },
        include: { organization: true }
    })

    if (!membership) {
        return (
            <div className="p-8 max-w-7xl mx-auto font-sans min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
                <div className="text-center max-w-lg">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <span className="text-4xl">✨</span>
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Welcome to Crowdfr!</h2>
                    <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
                        You're just one step away from launching your next release. Create your first artist profile to get started.
                    </p>
                    <div className="transform scale-110">
                        <NewArtistButton />
                    </div>
                </div>
            </div>
        )
    }

    // Check for Global Admin (via User role, not Membership role)
    const isGlobalAdmin = session.user.role === 'ADMIN'
    const isOwnerOrAdmin = membership.role === 'OWNER' || membership.role === 'ADMIN'

    // Filter releases: 
    // If Global Admin -> No filter (show all)
    // If Org Admin -> matched Organization
    // If Member -> matched Organization AND createdById matches
    let releaseWhere: any = {}

    if (!isGlobalAdmin) {
        releaseWhere = {
            artist: {
                organizationId: membership.organizationId
            }
        }

        if (!isOwnerOrAdmin) {
            releaseWhere.createdById = session.user.id
        }
    }

    const releases = await prisma.release.findMany({
        where: releaseWhere,
        include: { artist: true },
        orderBy: { updatedAt: 'desc' },
        take: isGlobalAdmin ? 50 : undefined // Limit for admin view to prevent overload
    })

    // Filter artists:
    let artistWhere: any = {}

    if (!isGlobalAdmin) {
        artistWhere = {
            organizationId: membership.organizationId
        }

        if (!isOwnerOrAdmin) {
            artistWhere.createdById = session.user.id
        }
    }

    const artists = await prisma.artist.findMany({
        where: artistWhere,
        orderBy: { updatedAt: 'desc' },
        take: isGlobalAdmin ? 50 : undefined
    })

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-4">
                        Dashboard
                        {isGlobalAdmin && (
                            <span className="bg-red-500/20 text-red-500 text-xs px-2 py-1 rounded border border-red-500/50">Global Admin</span>
                        )}
                    </h1>
                    <p className="text-zinc-500 mt-1">Manage your releases and artist profiles.</p>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/dashboard/settings/billing"
                        className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-2xl transition-all flex items-center gap-2"
                    >
                        <span>💳</span>
                        <span className="hidden sm:inline">Billing</span>
                    </Link>
                    <NewArtistButton />
                    <NewReleaseButton artistCount={artists.length} />
                </div>
            </header>

            <section className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Artists</h2>
                    <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs font-bold">{artists.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artists.map((artist) => (
                        <ArtistCard key={artist.id} artist={artist} />
                    ))}
                    {artists.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
                            <p className="text-zinc-500 font-medium">No artists found.</p>
                        </div>
                    )}
                </div>
            </section>

            <section>
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Releases</h2>
                    <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs font-bold">{releases.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {releases.map((release) => (
                        <ReleaseCard key={release.id} release={release} />
                    ))}
                    {releases.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
                            <p className="text-zinc-500 font-medium">No releases found. Create your first one to get started!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
