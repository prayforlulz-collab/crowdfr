
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import ContentList from "@/components/admin/ContentList"

export default async function ContentPage() {
    const session = await getServerSession(authOptions)

    const [artists, releases] = await Promise.all([
        prisma.artist.findMany({
            orderBy: { createdAt: "desc" },
            take: 200,
            include: { organization: { select: { name: true } } },
        }),
        prisma.release.findMany({
            orderBy: { createdAt: "desc" },
            take: 200,
            include: { artist: { select: { name: true } } },
        }),
    ])

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2">Content Management</h1>
                <p className="text-zinc-400">Manage artists and releases across the platform.</p>
            </header>

            <ContentList artists={artists} releases={releases} />
        </div>
    )
}
