import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const release = await prisma.release.findUnique({
            where: { id },
            include: {
                artist: true,
            },
        })

        if (!release) {
            return NextResponse.json({ message: "Release not found" }, { status: 404 })
        }

        return NextResponse.json(release)
    } catch (error) {
        console.error("Error fetching release:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { title, subtitle, layout, releaseDate, coverImage, description } = body
        // ... (rest of PATCH) ...
        // Wait, I can't easily match inside the function if I use ...
        // Ill append DELETE at the end of file instead.
        // Let me match the end of the file.
        // Actually, the previous tool call approach is safer: match the last function and append.
        // But for release route, it ends with PATCH.

        // Let's use append to file logic by replacing the last closing brace?
        // No, replace_file_content requires TargetContent.
        // I'll target the whole PATCH function again to be safe and append DELETE after it.

        const release = await prisma.release.update({
            where: { id },
            data: {
                title,
                subtitle,
                layout: layout ? JSON.stringify(layout) : undefined,
                releaseDate: releaseDate ? new Date(releaseDate) : undefined,
                coverImage,
                description,
            },
        })

        return NextResponse.json(release)
    } catch (error) {
        console.error("Error updating release:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
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

        // Get user membership
        const membership = await prisma.membership.findFirst({
            where: { userId: session.user.id },
        })

        if (!membership) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        // Verify release ownership via Artist -> Organization
        const release = await prisma.release.findFirst({
            where: {
                id,
                artist: {
                    organizationId: membership.organizationId
                }
            }
        })

        if (!release) {
            return NextResponse.json({ message: "Release not found or unauthorized" }, { status: 404 })
        }

        await prisma.release.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Release deleted" })
    } catch (error) {
        console.error("Error deleting release:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

