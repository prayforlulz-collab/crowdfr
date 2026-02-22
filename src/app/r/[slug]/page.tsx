import { prisma } from "@/lib/prisma"
import SectionRenderer from "@/components/sections/SectionRenderer"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const release = await prisma.release.findUnique({
        where: { slug },
        include: { artist: true }
    })
    if (!release) return { title: "Not Found" }
    return {
        title: `${release.title} — ${release.artist.name}`,
        description: release.description || `Listen to ${release.title} by ${release.artist.name}`,
        openGraph: {
            title: `${release.title} — ${release.artist.name}`,
            description: release.description || `Listen to ${release.title} by ${release.artist.name}`,
            images: release.coverImage ? [{ url: release.coverImage }] : [],
            type: "music.album",
        },
        twitter: {
            card: "summary_large_image",
            title: `${release.title} — ${release.artist.name}`,
            description: release.description || `Listen to ${release.title} by ${release.artist.name}`,
            images: release.coverImage ? [release.coverImage] : [],
        },
    }
}

export default async function PublicReleasePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const release = await prisma.release.findUnique({
        where: { slug },
        include: {
            artist: true
        }
    })

    if (!release) notFound()

    const layout = typeof release.layout === 'string' ? JSON.parse(release.layout) : (Array.isArray(release.layout) ? release.layout : [])
    const artistLayout = typeof release.artist.layout === 'string' ? JSON.parse(release.artist.layout) : (Array.isArray(release.artist.layout) ? release.artist.layout : [])

    return (
        <div className="min-h-screen bg-black">
            {layout.length > 0 ? (
                <SectionRenderer
                    sections={layout as any}
                    context={{
                        organizationId: release.artist.organizationId,
                        releaseId: release.id,
                        artistLayout: artistLayout as any[]
                    }}
                />
            ) : (
                <div className="flex items-center justify-center min-h-screen text-white">
                    <p>No content published yet.</p>
                </div>
            )}
        </div>
    )
}
