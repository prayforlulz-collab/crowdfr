import { prisma } from "@/lib/prisma"
import ArtistEditor from "@/components/editor/ArtistEditor"
import { notFound } from "next/navigation"

export default async function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const artist = await prisma.artist.findUnique({
        where: { id },
    })

    if (!artist) notFound()

    const initialData = {
        name: artist.name,
        bio: artist.bio || "",
        imageUrl: artist.imageUrl || "",
        layout: artist.layout || "[]", // Pass as string or object? ArtistEditor expects object in initialData.layout checks
    }

    return (
        <div className="h-screen w-full">
            <ArtistEditor
                artistId={artist.id}
                organizationId={artist.organizationId}
                initialData={initialData}
            />
        </div>
    )
}
