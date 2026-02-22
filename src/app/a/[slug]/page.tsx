import { prisma } from "@/lib/prisma"
import SectionRenderer from "@/components/sections/SectionRenderer"
import { notFound } from "next/navigation"
import TrackingScripts from "@/components/TrackingScripts"

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const artist = await prisma.artist.findUnique({
        where: { slug: slug },
    })

    if (!artist) notFound()

    const layout = typeof artist.layout === 'string'
        ? JSON.parse(artist.layout)
        : (Array.isArray(artist.layout) ? artist.layout : [])

    return (
        <div className="min-h-screen bg-black">
            <TrackingScripts
                facebookPixelId={artist.facebookPixelId}
                tiktokPixelId={artist.tiktokPixelId}
                googleAnalyticsId={artist.googleAnalyticsId}
            />
            {layout.length > 0 ? (
                <SectionRenderer
                    sections={layout}
                    context={{
                        organizationId: artist.organizationId,
                        releaseId: "", // Artist page might not have a specific release context initially
                        artistName: artist.name // Adding artist name to context
                    }}
                />
            ) : (
                <div className="flex items-center justify-center min-h-screen text-white">
                    <p>Artist profile coming soon.</p>
                </div>
            )}
        </div>
    )
}
