import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

export default async function PreSavesPage() {
    const session = await getServerSession(authOptions)
    if (!session) return <div>Unauthorized</div>

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { memberships: { include: { organization: true } } }
    })

    const organization = user?.memberships[0]?.organization

    if (!organization) {
        return (
            <div className="p-8">
                <h1 className="text-4xl font-black mb-4">Pre-Saves</h1>
                <p className="text-zinc-500">No organization found for your user. Please set up an organization first.</p>
            </div>
        )
    }

    const preSaves = await prisma.preSave.findMany({
        where: {
            release: {
                artist: {
                    organizationId: organization.id
                }
            }
        },
        include: {
            fan: true,
            release: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Stats
    const total = preSaves.length
    const pending = preSaves.filter(p => p.status === 'PENDING').length
    const completed = preSaves.filter(p => p.status === 'COMPLETED').length
    const failed = preSaves.filter(p => p.status === 'FAILED').length

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Pre-Saves</h1>
                <p className="text-zinc-400">Track and manage your automated Spotify pre-saves.</p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Total</p>
                    <p className="text-3xl font-black font-mono">{total.toLocaleString()}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending
                    </p>
                    <p className="text-3xl font-black font-mono">{pending.toLocaleString()}</p>
                </div>
                <div className="bg-zinc-900 border border-emerald-900/30 rounded-2xl p-6">
                    <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                    </p>
                    <p className="text-3xl font-black font-mono">{completed.toLocaleString()}</p>
                </div>
                <div className="bg-zinc-900 border border-red-900/30 rounded-2xl p-6">
                    <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Failed
                    </p>
                    <p className="text-3xl font-black font-mono">{failed.toLocaleString()}</p>
                </div>
            </div>

            {/* List */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-800/50 text-zinc-400 text-[10px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Fan</th>
                                <th className="px-6 py-4">Release</th>
                                <th className="px-6 py-4">Platform</th>
                                <th className="px-6 py-4">Created Date</th>
                                <th className="px-6 py-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {preSaves.map(ps => (
                                <tr key={ps.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ps.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                                                ps.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-red-500/10 text-red-500'
                                            }`}>
                                            {ps.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                                            {ps.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                            {ps.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                                            {ps.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/dashboard/fans`} className="font-bold hover:text-indigo-400 transition-colors">
                                            {ps.fan.email}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/dashboard/releases/${ps.release.id}/edit`} className="font-bold hover:text-indigo-400 transition-colors">
                                            {ps.release.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-zinc-400 capitalize">
                                        {ps.platform.replace('-', ' ')}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400">
                                        {new Date(ps.createdAt).toLocaleDateString()} {new Date(ps.createdAt).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-zinc-500">
                                        {ps.errorMessage ? (
                                            <span className="text-red-400/80 truncate max-w-[200px] inline-block" title={ps.errorMessage}>
                                                {ps.errorMessage}
                                            </span>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {preSaves.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                        No pre-saves found. Start pushing your release campaigns!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
