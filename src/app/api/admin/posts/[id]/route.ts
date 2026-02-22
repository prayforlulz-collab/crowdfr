import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const post = await prisma.post.findUnique({
            where: { id }
        })
        if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })

        return NextResponse.json(post)
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const json = await req.json()
        const { title, slug, content, excerpt, coverImage, published } = json

        const post = await prisma.post.update({
            where: { id },
            data: {
                title,
                slug,
                content,
                excerpt,
                coverImage,
                published
            }
        })

        return NextResponse.json(post)
    } catch (e: any) {
        if (e.code === 'P2002') {
            return NextResponse.json({ error: "A post with this slug already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        await prisma.post.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
    }
}
