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
        <div className="p-10 max-w-7xl mx-auto font-sans relative">
            {/* Background Aura */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-teal-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-20">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                            Creator Console
                        </div>
                        {isGlobalAdmin && (
                            <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-1 rounded border border-red-500/20 font-black uppercase tracking-widest">System Admin</span>
                        )}
                    </div>
                    <h1 className="text-5xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tighter">
                        Good morning, {session.user.name?.split(' ')[0] || 'Artist'}
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Manage your digital presence and fan connections.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/settings/billing"
                        className="bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold py-3.5 px-6 rounded-2xl transition-all flex items-center gap-2 group"
                    >
                        <span className="group-hover:scale-110 transition-transform">💳</span>
                        <span className="hidden sm:inline">Billing</span>
                    </Link>
                    <div className="h-10 w-px bg-white/5 mx-2 hidden md:block" />
                    <NewArtistButton />
                    <NewReleaseButton artistCount={artists.length} />
                </div>
            </header>

            <section className="mb-20">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Artist Profiles</h2>
                    <span className="text-zinc-700 font-bold font-mono text-xs">{artists.length.toString().padStart(2, '0')}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {artists.map((artist) => (
                        <ArtistCard key={artist.id} artist={artist} />
                    ))}
                    {artists.length === 0 && (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 bg-white/[0.02] rounded-[3rem]">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl opacity-20">🎨</div>
                            <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs">No active artist profiles yet.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="pb-20">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-1.5 h-6 bg-teal-500 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Active Drops</h2>
                    <span className="text-zinc-700 font-bold font-mono text-xs">{releases.length.toString().padStart(2, '0')}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {releases.map((release) => (
                        <ReleaseCard key={release.id} release={release} />
                    ))}
                    {releases.length === 0 && (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 bg-white/[0.02] rounded-[3rem]">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl opacity-20">💿</div>
                            <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs">No releases created. Launch your first one!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
