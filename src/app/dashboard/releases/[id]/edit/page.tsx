import { prisma } from "@/lib/prisma"
import ReleaseEditor from "@/components/editor/ReleaseEditor"
import { notFound } from "next/navigation"

export default async function EditReleasePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const release = await prisma.release.findUnique({
        where: { id },
        include: { artist: true }
    })

    if (!release) notFound()

    const artistLayout = release.artist.layout
        ? (typeof release.artist.layout === 'string' ? JSON.parse(release.artist.layout) : release.artist.layout)
        : []

    const initialData = {
        title: release.title,
        subtitle: release.subtitle || "",
        layout: release.layout ? JSON.parse(release.layout) : [],
    }

    return (
        <div className="h-screen w-full">
            <ReleaseEditor
                releaseId={release.id}
                organizationId={release.artist.organizationId}
                initialData={initialData}
                artistLayout={artistLayout}
            />
        </div>
    )
}
