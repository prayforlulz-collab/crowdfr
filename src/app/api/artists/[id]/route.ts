import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params

        // Ensure user has access to this artist (via organization)
        const membership = await prisma.membership.findFirst({
            where: { userId: session.user.id },
            include: { organization: true },
        })

        if (!membership) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        const artist = await prisma.artist.findFirst({
            where: {
                id,
                organizationId: membership.organizationId,
            },
        })

        if (!artist) {
            return NextResponse.json({ message: "Artist not found" }, { status: 404 })
        }

        return NextResponse.json(artist)
    } catch (error) {
        console.error("Error fetching artist:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await req.json()
        const { name, bio, imageUrl, layout, theme, facebookPixelId, tiktokPixelId, googleAnalyticsId } = body

        // Ensure user has access
        const membership = await prisma.membership.findFirst({
            where: { userId: session.user.id },
        })

        if (!membership) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        // Verify artist ownership
        const existingArtist = await prisma.artist.findFirst({
            where: {
                id,
                organizationId: membership.organizationId,
            },
        })

        if (!existingArtist) {
            return NextResponse.json({ message: "Artist not found" }, { status: 404 })
        }

        // Update artist
        const updatedArtist = await prisma.artist.update({
            where: { id },
            data: {
                name: name || undefined,
                bio: bio !== undefined ? bio : undefined,
                imageUrl: imageUrl !== undefined ? imageUrl : undefined,
                layout: layout ? JSON.stringify(layout) : undefined,
                facebookPixelId: facebookPixelId !== undefined ? facebookPixelId : undefined,
                tiktokPixelId: tiktokPixelId !== undefined ? tiktokPixelId : undefined,
                googleAnalyticsId: googleAnalyticsId !== undefined ? googleAnalyticsId : undefined,
                // store theme in layout or separate field? 
                // schema doesn't have theme field for Artist, so likely stored in layout or implied
                // For now, we update what exists in schema
            },
        })

        return NextResponse.json(updatedArtist)
    } catch (error) {
        console.error("Error updating artist:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // ... existing PATCH code ...
    // Note: I will need to replace the content correctly, but since I don't want to repeat the whole PATCH function in the prompt, I will append DELETE at the end.
    // Wait, replace_file_content needs strict matching.
    // I'll target the end of the file or the PATCH function to append.
    // Actually, I can just match the end of PATCH and append DELETE.
    return PUT(req, { params })
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params

        // Ensure user has access
        const membership = await prisma.membership.findFirst({
            where: { userId: session.user.id },
            include: { organization: true },
        })

        if (!membership) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        // Verify artist ownership
        const artist = await prisma.artist.findFirst({
            where: {
                id,
                organizationId: membership.organizationId,
            },
        })

        if (!artist) {
            return NextResponse.json({ message: "Artist not found or unauthorized" }, { status: 404 })
        }

        await prisma.artist.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Artist deleted" })
    } catch (error) {
        console.error("Error deleting artist:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
